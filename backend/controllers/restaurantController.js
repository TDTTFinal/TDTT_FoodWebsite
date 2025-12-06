const Restaurant = require("../models/Restaurant");

// @desc    Lấy tất cả nhà hàng (có phân trang và filter)
// @route   GET /api/restaurants
// @access  Public
exports.getAllRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category = "Tất cả",
      search = "",
      minRating = 0,
      sortBy = "avg_rating",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== "Tất cả") filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (minRating > 0) {
      filter.avg_rating = { $gte: parseFloat(minRating) };
    }

    // Pagination
    const parsedPage = parseInt(page);
    const parsedLimit = limit === "all" ? 0 : parseInt(limit);

    const skip = parsedLimit === 0 ? 0 : (parsedPage - 1) * parsedLimit;

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Query DB
    const restaurants = await Restaurant.find(filter)
      .sort(sortOptions)
      .limit(parsedLimit) // limit=0 → lấy tất cả
      .skip(skip)
      .select("-__v");

    const total = await Restaurant.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      total,
      totalPages: parsedLimit === 0 ? 1 : Math.ceil(total / parsedLimit),
      currentPage: parsedPage,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getAllRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách nhà hàng",
      error: error.message,
    });
  }
};


// @desc    Lấy chi tiết một nhà hàng
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error in getRestaurantById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin nhà hàng",
      error: error.message,
    });
  }
};

// @desc    Lấy các nhà hàng nổi bật (top rated)
// @route   GET /api/restaurants/featured
// @access  Public
exports.getFeaturedRestaurants = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const restaurants = await Restaurant.find({ avg_rating: { $gte: 4.5 } })
      .sort({ avg_rating: -1 })
      .limit(parseInt(limit))
      .select("-__v");

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getFeaturedRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy nhà hàng nổi bật",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách categories và số lượng nhà hàng
// @route   GET /api/restaurants/categories/stats
// @access  Public
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Restaurant.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgRating: { $avg: "$avg_rating" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Thêm "Tất cả" vào đầu
    const totalCount = await Restaurant.countDocuments();
    const allCategory = {
      _id: "Tất cả",
      count: totalCount,
      avgRating: null,
    };

    res.status(200).json({
      success: true,
      data: [allCategory, ...stats],
    });
  } catch (error) {
    console.error("Error in getCategoryStats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê danh mục",
      error: error.message,
    });
  }
};

// @desc    Tạo nhà hàng mới (Admin only - optional)
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);

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

// @desc    Cập nhật nhà hàng (Admin only - optional)
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật nhà hàng thành công",
      data: restaurant,
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

// @desc    Xóa nhà hàng (Admin only - optional)
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

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
