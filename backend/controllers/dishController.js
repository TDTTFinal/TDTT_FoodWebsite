const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");

// @desc    Lấy tất cả món ăn (có phân trang và filter)
// @route   GET /api/dishes
// @access  Public
exports.getAllDishes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category = "Tất cả",
      search = "",
      minRating = 0,
      minPrice = 0,
      maxPrice = 999999999,
      cuisineType = "",
      restaurantId = "",
      sortBy = "avg_rating",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = { is_available: true };

    if (category && category !== "Tất cả") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minRating > 0) {
      filter.avg_rating = { $gte: parseFloat(minRating) };
    }

    if (minPrice > 0 || maxPrice < 999999999) {
      filter.price = {
        $gte: parseFloat(minPrice),
        $lte: parseFloat(maxPrice),
      };
    }

    if (cuisineType) {
      filter.cuisine_type = cuisineType;
    }

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    // Pagination
    const parsedPage = parseInt(page);
    const parsedLimit = limit === "all" ? 0 : parseInt(limit);
    const skip = parsedLimit === 0 ? 0 : (parsedPage - 1) * parsedLimit;

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Query DB
    const dishes = await Dish.find(filter)
      .sort(sortOptions)
      .limit(parsedLimit)
      .skip(skip)
      .populate("restaurant", "name address")
      .select("-__v");

    const total = await Dish.countDocuments(filter);

    res.json({
      success: true,
      data: dishes,
      pagination: {
        currentPage: parsedPage,
        totalPages: parsedLimit === 0 ? 1 : Math.ceil(total / parsedLimit),
        totalItems: total,
        itemsPerPage: parsedLimit === 0 ? total : parsedLimit,
      },
    });
  } catch (error) {
    console.error("Error in getAllDishes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách món ăn",
      error: error.message,
    });
  }
};

// @desc    Lấy món ăn theo ID
// @route   GET /api/dishes/:id
// @access  Public
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate("restaurant", "name address location avatar_url")
      .select("-__v");

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.json({
      success: true,
      data: dish,
    });
  } catch (error) {
    console.error("Error in getDishById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin món ăn",
      error: error.message,
    });
  }
};

// @desc    Lấy các món ăn nổi bật
// @route   GET /api/dishes/featured
// @access  Public
exports.getFeaturedDishes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const dishes = await Dish.find({ is_available: true })
      .sort({ avg_rating: -1, total_reviews: -1 })
      .limit(parseInt(limit))
      .populate("restaurant", "name address")
      .select("-__v");

    res.json({
      success: true,
      data: dishes,
    });
  } catch (error) {
    console.error("Error in getFeaturedDishes:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy món ăn nổi bật",
      error: error.message,
    });
  }
};

// @desc    Lấy thống kê theo category
// @route   GET /api/dishes/categories/stats
// @access  Public
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Dish.aggregate([
      { $match: { is_available: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$avg_rating" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getCategoryStats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê",
      error: error.message,
    });
  }
};

// @desc    Tạo món ăn mới
// @route   POST /api/dishes
// @access  Private/Admin
exports.createDish = async (req, res) => {
  try {
    const dish = await Dish.create(req.body);

    res.status(201).json({
      success: true,
      data: dish,
      message: "Tạo món ăn thành công",
    });
  } catch (error) {
    console.error("Error in createDish:", error);
    res.status(400).json({
      success: false,
      message: "Lỗi khi tạo món ăn",
      error: error.message,
    });
  }
};

// @desc    Cập nhật món ăn
// @route   PUT /api/dishes/:id
// @access  Private/Admin
exports.updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.json({
      success: true,
      data: dish,
      message: "Cập nhật món ăn thành công",
    });
  } catch (error) {
    console.error("Error in updateDish:", error);
    res.status(400).json({
      success: false,
      message: "Lỗi khi cập nhật món ăn",
      error: error.message,
    });
  }
};

// @desc    Xóa món ăn
// @route   DELETE /api/dishes/:id
// @access  Private/Admin
exports.deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy món ăn",
      });
    }

    res.json({
      success: true,
      message: "Xóa món ăn thành công",
    });
  } catch (error) {
    console.error("Error in deleteDish:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa món ăn",
      error: error.message,
    });
  }
};
