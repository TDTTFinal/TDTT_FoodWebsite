const mongoose = require("mongoose");
const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

// ============== CATEGORY MANAGEMENT ==============

// @desc    Lấy tất cả categories (với số lượng nhà hàng được tính động)
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });

    // Use the 'test' collection for counting, as that's where the real data is
    // Create model if not exists (similar to searchRoutes)
    const TestRestaurant = mongoose.models.TestRestaurant || mongoose.model("TestRestaurant", Restaurant.schema, "test");

    // Aggregate counts from test collection
    const counts = await TestRestaurant.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => {
      if (c._id) countMap[c._id] = c.count;
    });

    // Merge counts into categories
    const categoriesWithCounts = categories.map(cat => ({
      ...cat.toObject(),
      restaurantCount: countMap[cat.name] || 0
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      data: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách categories",
      error: error.message,
    });
  }
};

// @desc    Tạo category mới
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, visible, order } = req.body;

    // Validate
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tên category không được để trống",
      });
    }

    // Check duplicate
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category này đã tồn tại",
      });
    }

    // Create new category
    const category = await Category.create({
      name: name.trim(),
      description: description || "",
      image: image || undefined,
      visible: visible !== undefined ? visible : true,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Tạo category thành công",
      data: category,
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo category",
      error: error.message,
    });
  }
};

// @desc    Cập nhật category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, visible, order } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    // Check duplicate name (nếu đổi tên)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Tên category này đã tồn tại",
        });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (visible !== undefined) category.visible = visible;
    if (order !== undefined) category.order = order;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật category thành công",
      data: category,
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật category",
      error: error.message,
    });
  }
};

// @desc    Xóa category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy category",
      });
    }

    // Check if any restaurants use this category
    const restaurantCount = await Restaurant.countDocuments({
      category: category.name,
    });

    if (restaurantCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa category này vì có ${restaurantCount} nhà hàng đang sử dụng`,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Xóa category thành công",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa category",
      error: error.message,
    });
  }
};

// ============== RESTAURANT MANAGEMENT (Admin) ==============

// @desc    Lấy tất cả restaurants cho admin (bao gồm cả ẩn)
// @route   GET /api/admin/restaurants
// @access  Private/Admin
exports.getAdminRestaurants = async (req, res) => {
  try {
    console.log("🔍 GET /api/admin/restaurants - Query:", req.query);
    const { page = 1, limit = 20, search = "", category = "" } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "Tất cả") {
      filter.category = category;
    }

    console.log("📋 Filter:", filter);

    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-__v");

    const total = await Restaurant.countDocuments(filter);

    console.log(`✅ Found ${restaurants.length} restaurants (total: ${total})`);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: restaurants,
    });
  } catch (error) {
    console.error("❌ Error in getAdminRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// @desc    Tạo nhà hàng mới
// @route   POST /api/admin/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    const {
      name,
      address,
      opening_hours,
      price_range,
      location,
      category,
      tags,
      avatar_url,
      menu,
    } = req.body;

    // Validate required fields
    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Tên và địa chỉ nhà hàng là bắt buộc",
      });
    }

    // Create restaurant data
    const restaurantData = {
      name: name.trim(),
      address: address.trim(),
      opening_hours: opening_hours || "Đang cập nhật",
      price_range: price_range || "Đang cập nhật",
      category: category || "Khác",
      tags: tags || [],
      avatar_url:
        avatar_url ||
        "https://placehold.co/400x300/FFF3E0/E65100?text=Restaurant",
    };

    // Handle location if provided
    if (location && location.coordinates && location.coordinates.length === 2) {
      restaurantData.location = {
        type: "Point",
        coordinates: location.coordinates, // [lng, lat]
      };
    }

    // Handle menu if provided
    if (menu && Array.isArray(menu) && menu.length > 0) {
      restaurantData.menu = menu;
      // Calculate min/max prices
      const prices = menu.map((item) => item.price).filter((p) => p > 0);
      if (prices.length > 0) {
        restaurantData.menu_min_price = Math.min(...prices);
        restaurantData.menu_max_price = Math.max(...prices);
      }
    }

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      success: true,
      message: "Tạo nhà hàng thành công",
      data: restaurant,
    });
  } catch (error) {
    console.error("Error in createRestaurant:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo nhà hàng",
      error: error.message,
    });
  }
};

// @desc    Cập nhật thông tin nhà hàng
// @route   PUT /api/admin/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Update menu prices if menu changed
    if (updateData.menu && Array.isArray(updateData.menu)) {
      const prices = updateData.menu
        .map((item) => item.price)
        .filter((p) => p > 0);
      if (prices.length > 0) {
        updateData.menu_min_price = Math.min(...prices);
        updateData.menu_max_price = Math.max(...prices);
      }
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật nhà hàng thành công",
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error in updateRestaurant:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật nhà hàng",
      error: error.message,
    });
  }
};

// @desc    Xóa nhà hàng
// @route   DELETE /api/admin/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    await Restaurant.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Xóa nhà hàng thành công",
    });
  } catch (error) {
    console.error("Error in deleteRestaurant:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nhà hàng",
      error: error.message,
    });
  }
};

// @desc    Lấy thống kê cho admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalRestaurants = await Restaurant.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Top categories by restaurant count
    const categoryStats = await Restaurant.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Average rating
    const ratingStats = await Restaurant.aggregate([
      { $match: { avg_rating: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$avg_rating" },
          maxRating: { $max: "$avg_rating" },
          minRating: { $min: "$avg_rating" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRestaurants,
        totalCategories,
        categoryStats,
        ratingStats: ratingStats[0] || {
          avgRating: 0,
          maxRating: 0,
          minRating: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê",
      error: error.message,
    });
  }
};

// ============== REVIEW MANAGEMENT ==============

// @desc    Lấy tất cả reviews cho admin
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const { status, search, category, sort = "createdAt", order = "desc", page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // 1. If filtering by restaurant info (search or category), we must find matching restaurants first
    if (search || (category && category !== "all")) {
        const restaurantFilter = {};
        
        if (search) {
            restaurantFilter.name = { $regex: search, $options: "i" };
        }
        
        if (category && category !== "all") {
            restaurantFilter.category = category;
        }

        const matchingRestaurants = await Restaurant.find(restaurantFilter).select("_id");
        const restaurantIds = matchingRestaurants.map(r => r._id);
        
        // Add to review filter
        filter.restaurant = { $in: restaurantIds };
    }

    // Sort
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sort]: sortOrder };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const reviews = await Review.find(filter)
      .populate("user", "name email avatar")
      .populate("restaurant", "name address")
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select("-__v");

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách reviews",
      error: error.message,
    });
  }
};

// @desc    Duyệt review (approve)
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("restaurant", "name address");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy review",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã duyệt review",
      data: review,
    });
  } catch (error) {
    console.error("Error in approveReview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi duyệt review",
      error: error.message,
    });
  }
};

// @desc    Từ chối review (reject → reported)
// @route   PUT /api/admin/reviews/:id/reject
// @access  Private/Admin
exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "reported" },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("restaurant", "name address");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy review",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã chuyển review sang báo cáo vi phạm",
      data: review,
    });
  } catch (error) {
    console.error("Error in rejectReview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi báo cáo review",
      error: error.message,
    });
  }
};

// @desc    Xóa review (soft delete)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "deleted" },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy review",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã chuyển review vào thùng rác",
    });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa review",
      error: error.message,
    });
  }
};

// @desc    Khôi phục review từ deleted/reported
// @route   PUT /api/admin/reviews/:id/restore
// @access  Private/Admin
exports.restoreReview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔄 Restoring review:", id);

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("restaurant", "name address");

    if (!review) {
      console.log("❌ Review not found:", id);
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy review",
      });
    }

    console.log("✅ Review restored successfully:", id);
    res.status(200).json({
      success: true,
      message: "Đã khôi phục review",
      data: review,
    });
  } catch (error) {
    console.error("Error in restoreReview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi khôi phục review",
      error: error.message,
    });
  }
};

// @desc    Xóa vĩnh viễn review (hard delete)
// @route   DELETE /api/admin/reviews/:id/permanent
// @access  Private/Admin
exports.permanentDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy review",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa vĩnh viễn review",
    });
  } catch (error) {
    console.error("Error in permanentDeleteReview:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa vĩnh viễn review",
      error: error.message,
    });
  }
};
