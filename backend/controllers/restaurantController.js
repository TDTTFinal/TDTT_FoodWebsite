const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

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
      .limit(parsedLimit) // limit=0 - l\u1ea5y t\u1ea5t c\u1ea3
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

// @desc    Lấy reviews của một nhà hàng từ collection reviews
// @route   GET /api/restaurants/:id/reviews
// @access  Public
exports.getRestaurantReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const restaurantId = req.params.id;

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId).select('name');
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà hàng",
      });
    }

    // Fetch reviews from reviews collection
    const reviews = await Review.find({ 
      restaurant: restaurantId,
      status: 'active' // Only active reviews
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name avatar')
      .lean();

    // Count total reviews
    const total = await Review.countDocuments({ 
      restaurant: restaurantId,
      status: 'active'
    });

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      user: review.user?.name || review.metadata?.original_user_name || 'Người dùng ẩn danh',
      user_avatar: review.user?.avatar || null,
      rating: review.rating,
      comment: review.content,
      title: review.title,
      images: review.images || [],
      date: review.createdAt,
      likes: review.likes?.length || 0,
      isFromMigration: !!review.metadata?.source
    }));

    res.status(200).json({
      success: true,
      restaurant: restaurant.name,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: formattedReviews,
    });
  } catch (error) {
    console.error("Error in getRestaurantReviews:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy reviews của nhà hàng",
      error: error.message,
    });
  }
};

// @desc    Lấy các nhà hàng nổi bật (top rated)
// @route   GET /api/restaurants/featured
// @access  Public
// @desc    Lấy danh sách nhà hàng đang thịnh hành (Trending)
// @route   GET /api/restaurants/trending
// @access  Public
exports.getTrendingRestaurants = async (req, res) => {
  try {
    // Logic: Tạm thời lấy top rating giảm dần. Sau này có thể tính theo số lượng review trong tuần.
    const restaurants = await Restaurant.find({ avg_rating: { $gte: 7.0 } })
      .sort({ avg_rating: -1 })
      .limit(5)
      .select("name address avg_rating images avatar_url");

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getTrendingRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy trending",
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

    const restaurants = await Restaurant.find({ avg_rating: { $gte: 8.0 } }) // Adjusted for 10-scale
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

// @desc    Tìm nhà hàng gần đây (GeoJSON)
// @route   GET /api/restaurants/nearby
// @access  Public
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lon, radius = 3000, limit = 10 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tọa độ (lat, lon)",
      });
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .limit(parseInt(limit))
      .select("-__v");

    // Calculate distance for client convenience (rough estimate if needed, but client has coords)
    // Mongo $near returns sorted by distance automatically.

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getNearbyRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm nhà hàng gần đây",
      error: error.message,
    });
  }
};

// @desc    Gợi ý theo ngữ cảnh (Sáng/Trưa/Tối)
// @route   GET /api/restaurants/contextual
// @access  Public
exports.getContextualRestaurants = async (req, res) => {
  try {
    // Get current hour in Vietnam time (UTC+7)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 3600000 * 7);
    const currentHour = vnTime.getHours();

    let contextTitle = "";
    let query = {};
    const limit = 8;

    if (currentHour >= 5 && currentHour < 10) {
      contextTitle = "Bữa sáng năng lượng 🍳";
      query = {
        $or: [
          { category: { $in: ["Phở", "Bún", "Bánh mì", "Cafe"] } },
          { name: { $regex: /phở|bún|bánh mì|cafe|coffee/i } },
        ],
      };
    } else if (currentHour >= 10 && currentHour < 14) {
      contextTitle = "Trưa nay ăn gì? 🍱";
      query = {
        $or: [
          { category: { $in: ["Cơm", "Bento", "Sushi", "Healthy"] } },
          { name: { $regex: /cơm|bento|lunch/i } },
        ],
      };
    } else if (currentHour >= 14 && currentHour < 17) {
      contextTitle = "Ăn vặt xế chiều 🍰";
      query = {
        $or: [
          { category: { $in: ["Trà sữa", "Bánh ngọt", "Ăn vặt", "Cafe"] } },
          { name: { $regex: /trà sữa|tea|coffee|cake/i } },
        ],
      };
    } else {
      contextTitle = "Tối nay chill đâu? 🍻";
      query = {
        $or: [
          { category: { $in: ["Lẩu", "BBQ", "Hải sản", "Buffet"] } },
          { name: { $regex: /lẩu|nướng|bbq|beer/i } },
        ],
      };
    }

    const restaurants = await Restaurant.find(query)
      .limit(limit)
      .sort({ avg_rating: -1 });

    res.status(200).json({
      success: true,
      context: {
        hour: currentHour,
        title: contextTitle,
      },
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getContextualRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy gợi ý ngữ cảnh",
      error: error.message,
    });
  }
};

// @desc    Lấy các review mới nhất từ cộng đồng
// @route   GET /api/restaurants/reviews/latest
// @access  Public
exports.getLatestReviews = async (req, res) => {
  try {
    const reviews = await Restaurant.aggregate([
      { $unwind: "$reviews" },
      { $sort: { "reviews.date": -1 } },
      { $limit: 10 },
      {
        $project: {
          restaurant_id: "$_id",
          restaurant_name: "$name",
          restaurant_avatar: "$avatar_url",
          user: "$reviews.user",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          date: "$reviews.date",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error in getLatestReviews:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy review mới nhất",
      error: error.message,
    });
  }
};

// @desc    Lấy theo bộ sưu tập (Trending, Discount, Space, Cheap...)
// @route   GET /api/restaurants/collections
// @access  Public
exports.getCollectionRestaurants = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    let sort = {};

    if (type === "trending") {
      query = { avg_rating: { $gte: 8.5 } };
      sort = { avg_rating: -1 };
    } else if (type === "new") {
      sort = { createdAt: -1 };
    } else if (type === "space") {
      // Top không gian (sống ảo)
      query = { "scores.space": { $gte: 8.0 } };
      sort = { "scores.space": -1 };
    } else if (type === "cheap") {
      // Giá rẻ / Hợp túi tiền (scores.price cao = giá hợp lý)
      query = { "scores.price": { $gte: 8.0 } };
      sort = { "scores.price": -1 };
    } else {
      // Default: mix
      sort = { updatedAt: -1 };
    }

    const restaurants = await Restaurant.find(query).sort(sort).limit(10);

    res.status(200).json({
      success: true,
      type,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error in getCollectionRestaurants:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy collection",
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
      data: {},
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
