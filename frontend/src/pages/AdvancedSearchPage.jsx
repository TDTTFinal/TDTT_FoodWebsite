import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, MapPin, RotateCcw, ChevronLeft, ChevronRight, SlidersHorizontal, Plus, Sparkles, Hand, Save } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

// Food Tour Imports
import TourBuilder from "../components/foodtour/TourBuilder";
import { arrayMove } from "@dnd-kit/sortable";

// NL Food Tour Imports
import NLSuggestBox from "../components/foodtour/NLSuggestBox";
import StepsDisplay from "../components/foodtour/StepsDisplay";
import RoutesDisplay from "../components/foodtour/RoutesDisplay";
import ApplyRouteModal from "../components/foodtour/ApplyRouteModal";

// Weather Integration
import WeatherWarning from "../components/foodtour/WeatherWarning";
import { checkWeatherWarning, getSlotLabel } from "../services/weatherService";

// OSRM Routing Service
import { getHaversineDistance, getDistanceMatrix } from "../services/osrmService";

const ITEMS_PER_PAGE = 15;

const AdvancedSearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search States
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Geolocation States
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // NL Food Tour States
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'suggest'
  const [nlSteps, setNlSteps] = useState(null);
  const [nlRoutes, setNlRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  // External Tour Edit Mode (from /food-tour/:tourId)
  const [addingToTourId, setAddingToTourId] = useState(null);
  const [pendingAddItems, setPendingAddItems] = useState([]);

  // Filter States
  const [filters, setFilters] = useState({
    category: "Tất cả",
    priceRange: "Tất cả",
    minRating: 0,
    district: "Tất cả",
    sortBy: "hybrid", // hybrid, semantic, tfidf, rating, distance, name
    maxDistance: null, // km - for "Quán gần tôi"
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================
  // FOOD TOUR STATE & LOGIC
  // ==========================================
  const [tourName, setTourName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Weather Warning States
  const [weatherWarning, setWeatherWarning] = useState({
    isOpen: false,
    restaurant: null,
    slot: null,
    weather: null, // Full weather data
    message: "",
  });
  const [pendingDrop, setPendingDrop] = useState(null); // Store pending drop action
  const [dragSourceInfo, setDragSourceInfo] = useState(null); // Track source container at drag start

  const [tourItems, setTourItems] = useState({
    unsorted: [],
    morning: [],
    lunch: [],
    afternoon: [],
    dinner: [],
  });

  const generateId = () => "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

  // Check if restaurant is already in tour (local or pending)
  const isInTour = (restaurantId) => {
    // Check local tourItems
    const allSlots = Object.values(tourItems);
    const inLocalTour = allSlots.some(slot => 
      slot.some(item => item._id === restaurantId)
    );
    
    // Also check pending items (for external tour mode)
    const inPending = pendingAddItems.some(item => item._id === restaurantId);
    
    return inLocalTour || inPending;
  };

  const handleAddToTour = (restaurant) => {
    // Prevent duplicates
    if (isInTour(restaurant._id)) {
      return;
    }
    
    // If in external tour edit mode, add to pending list
    if (addingToTourId) {
      // Check if already pending
      const alreadyPending = pendingAddItems.some(item => item._id === restaurant._id);
      if (alreadyPending) return;
      
      setPendingAddItems(prev => [...prev, restaurant]);
      return;
    }
    
    // Normal mode - add to local tourItems
    setTourItems((prev) => {
      const newItem = { ...restaurant, cartId: generateId() };
      return {
        ...prev,
        unsorted: [...prev.unsorted, newItem],
      };
    });
  };
  
  // Handle confirming and returning to tour edit page
  const handleConfirmAndReturn = () => {
    if (pendingAddItems.length === 0) {
      alert('Chưa chọn quán nào!');
      return;
    }
    
    // Save to localStorage for FoodTourPage/FoodTourEditPage to pick up
    localStorage.setItem('pendingTourItems', JSON.stringify(pendingAddItems));
    
    // Navigate back - handle "new" case (creating new tour)
    if (addingToTourId === 'new') {
      navigate('/food-tour');
    } else {
      navigate(`/food-tour/${addingToTourId}`);
    }
  };
  
  // Cancel and return without adding
  const handleCancelReturn = () => {
    setPendingAddItems([]);
    // Navigate back - handle "new" case
    if (addingToTourId === 'new') {
      navigate('/food-tour');
    } else {
      navigate(`/food-tour/${addingToTourId}`);
    }
  };

  const handleRemoveFromTour = (itemId) => {
    setTourItems((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = next[key].filter((item) => item.cartId !== itemId);
      });
      return next;
    });
  };

  const findContainer = (id) => {
    if (id in tourItems) return id;
    return Object.keys(tourItems).find((key) =>
      tourItems[key].find((item) => item.cartId === id)
    );
  };

  // Capture source container when drag starts
  const handleDragStart = (event) => {
    const { active } = event;
    const sourceContainer = findContainer(active.id);
    const sourceItem = tourItems[sourceContainer]?.find(
      (item) => item.cartId === active.id
    );
    
    console.log("🌦️ Drag Start - source:", sourceContainer, "item:", sourceItem?.name);
    
    setDragSourceInfo({
      container: sourceContainer,
      item: sourceItem,
      itemId: active.id,
    });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setTourItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((i) => i.cartId === active.id);
      const overIndex = overItems.findIndex((i) => i.cartId === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.cartId !== active.id),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          activeItems[activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length),
        ],
      };
    });
  };

  const handleSaveTour = async () => {
    console.log("🖱️ Handle Save Tour Triggered");
    console.log("👤 User state:", user);

    if (!user) {
        alert("Vui lòng đăng nhập để lưu Food Tour.");
        return;
    }

    if (!tourName.trim()) {
        alert("Vui lòng nhập tên cho Food Tour.");
        return;
    }

    // Calculate total restaurants
    const totalRestaurants = 
      tourItems.morning.length + 
      tourItems.lunch.length + 
      tourItems.afternoon.length + 
      tourItems.dinner.length +
      tourItems.unsorted.length;

    console.log("🔢 Total restaurants:", totalRestaurants);

    if (totalRestaurants === 0) {
        alert("Tour chưa có địa điểm nào!");
        return;
    }

    const payload = {
      name: tourName,
      description: `Tour ${totalRestaurants} điểm ăn uống tại TP.HCM (Tạo từ tìm kiếm nâng cao)`,
      tourItems: tourItems, // Flexible structure
      totalRestaurants
    };

    console.log("📦 Payload prepared:", payload);

    try {
      setIsSaving(true);
      console.log("🚀 Sending API request to /food-tours");
      const res = await api.post("/food-tours", payload);
      console.log("✅ API Response:", res);

      if (res.success) {
        alert("✅ Đã lưu Food tour thành công! Kiểm tra trong Profile > Tour của tôi.");
      } else {
        console.error("❌ API returned false success:", res);
        alert("❌ Lưu thất bại: " + (res.message || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("❌ Catch Error:", err);
      console.error("❌ Error Response Data:", err.response?.data);
      console.error("❌ Error Status:", err.response?.status);
      alert("❌ Lỗi khi lưu tour: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer
    ) {
      const activeIndex = tourItems[activeContainer].findIndex(
        (i) => i.cartId === id
      );
      const overIndex = tourItems[overContainer].findIndex(
        (i) => i.cartId === overId
      );

      if (activeIndex !== overIndex) {
        setTourItems((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            prev[activeContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }
  };

  // ==========================================
  // WEATHER WARNING HANDLERS
  // ==========================================

  // Check weather when item is dropped into a time slot
  const checkWeatherForDrop = async (restaurant, targetSlot) => {
    // Only check for time slots, not unsorted
    if (targetSlot === "unsorted") return { shouldWarn: false };
    
    try {
      const result = await checkWeatherWarning(restaurant, targetSlot);
      return result;
    } catch (error) {
      console.error("Weather check failed:", error);
      return { shouldWarn: false };
    }
  };

  // Handle weather warning confirmation (user wants to add despite rain)
  const handleWeatherConfirm = () => {
    // Item is already moved, just close the modal and clear pending
    setPendingDrop(null);
    setWeatherWarning({ ...weatherWarning, isOpen: false });
  };

  // Handle weather warning cancel (user wants to choose different restaurant)
  const handleWeatherCancel = () => {
    // Revert the drop if cancelled
    if (pendingDrop?.revertState) {
      setTourItems(pendingDrop.revertState);
    }
    setPendingDrop(null);
    setWeatherWarning({ ...weatherWarning, isOpen: false });
  };

  // Weather-aware drag end handler
  const handleDragEndWithWeather = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    console.log("🌦️ Drag End - active:", active?.id, "over:", overId);
    console.log("🌦️ Source info:", dragSourceInfo);

    // Clear dragSourceInfo and return if no target
    if (!overId) {
      console.log("🌦️ No overId, returning");
      setDragSourceInfo(null);
      return;
    }

    // Get current container (where item is NOW after handleDragOver moved it)
    const currentContainer = findContainer(active.id);
    
    // Get the ORIGINAL source container from dragSourceInfo
    const sourceContainer = dragSourceInfo?.container;
    const sourceItem = dragSourceInfo?.item;

    // Get target container
    let targetContainer = findContainer(overId);
    if (!targetContainer && overId in tourItems) {
      targetContainer = overId;
    }

    console.log("🌦️ Source:", sourceContainer, "Target:", targetContainer, "Current:", currentContainer);

    // If no movement or same container, just reorder
    if (!sourceContainer || sourceContainer === currentContainer) {
      // Same container - just reorder (handled by dnd-kit)
      console.log("🌦️ Same container or no source info");
      setDragSourceInfo(null);
      return;
    }

    // Item was moved from sourceContainer to currentContainer (by handleDragOver)
    // Check if we need to show weather warning
    if (sourceContainer && currentContainer && sourceContainer !== currentContainer) {
      // Use the item from dragSourceInfo since it has original data
      const activeItem = sourceItem || tourItems[currentContainer]?.find(
        (item) => item.cartId === active.id
      );

      if (!activeItem) {
        console.log("🌦️ No activeItem found!");
        setDragSourceInfo(null);
        return;
      }

      console.log("🌦️ Item:", activeItem.name, "moved from", sourceContainer, "to", currentContainer);

      // If moved TO a time slot (not unsorted), check weather
      if (currentContainer !== "unsorted") {
        // Store current state for potential revert (item is already in new container)
        const revertState = JSON.parse(JSON.stringify(tourItems));

        // Check weather asynchronously
        checkWeatherForDrop(activeItem, currentContainer).then((weatherResult) => {
          console.log("🌦️ Weather result:", weatherResult);
          // Always show weather info when we have it
          if (weatherResult.weather) {
            setPendingDrop({ revertState });
            setWeatherWarning({
              isOpen: true,
              restaurant: activeItem,
              slot: currentContainer,
              weather: weatherResult.weather,
              message: weatherResult.message,
            });
          }
        }).catch(err => {
          console.error("🌦️ Weather check error:", err);
        });
      }
    }

    // Clear drag source info
    setDragSourceInfo(null);
  };

  // ==========================================
  // NL FOOD TOUR HANDLERS
  // ==========================================

  const handleNLResults = (results) => {
    setNlSteps(results.steps || []);
    setNlRoutes(results.suggested_routes || []);
  };

  const handleNLError = (error) => {
    console.error('[NL Food Tour] Error:', error);
  };

  const handleApplyRoute = (route) => {
    setSelectedRoute(route);
    setShowApplyModal(true);
  };

  const handleConfirmApply = (route, mergeMode) => {
    setTourItems((prev) => {
      let newTourItems = { ...prev };

      switch (mergeMode) {
        case 'replace':
          newTourItems = { unsorted: [], morning: [], lunch: [], afternoon: [], dinner: [] };
          route.stops.forEach((stop, idx) => {
            const slot = smartAssignSlot(stop, idx, '');
            newTourItems[slot].push(transformStopToTourItem(stop));
          });
          break;

        case 'append':
          route.stops.forEach((stop) => {
            newTourItems.unsorted.push(transformStopToTourItem(stop));
          });
          break;

        case 'smart':
          route.stops.forEach((stop, idx) => {
            const slot = smartAssignSlot(stop, idx, '');
            newTourItems[slot].push(transformStopToTourItem(stop));
          });
          break;

        default:
          break;
      }

      return newTourItems;
    });

    setShowApplyModal(false);
    setActiveTab('manual');
  };

  const smartAssignSlot = (stop, index, query = '') => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('sáng') || lowerQuery.includes('morning')) {
      if (index === 0) return 'morning';
    }
    if (lowerQuery.includes('trưa') || lowerQuery.includes('lunch')) {
      if (index <= 1) return 'lunch';
    }
    if (lowerQuery.includes('chiều') || lowerQuery.includes('afternoon')) {
      if (index <= 2) return 'afternoon';
    }
    if (lowerQuery.includes('tối') || lowerQuery.includes('dinner') || lowerQuery.includes('evening')) {
      if (index <= 3) return 'dinner';
    }

    const slotMap = ['morning', 'lunch', 'afternoon', 'dinner'];
    return slotMap[index] || 'unsorted';
  };

  const transformStopToTourItem = (stop) => ({
    ...stop,
    cartId: generateId(),
    source: 'suggested',
    status: 'selected'
  });

  // Categories
  const categories = [
    "Tất cả",
    "Lẩu",
    "BBQ",
    "Cơm",
    "Phở",
    "Bún",
    "Trà sữa",
    "Cafe",
    "Hải sản",
    "Buffet",
    "Khác",
  ];

  const priceRanges = [
    "Tất cả",
    "Dưới 50.000",
    "50.000 - 100.000",
    "100.000 - 200.000",
    "200.000 - 500.000",
    "Trên 500.000",
  ];

  const districts = [
    "Tất cả",
    "Quận 1",
    "Quận 2",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 9",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Bình Thạnh",
    "Gò Vấp",
    "Tân Bình",
    "Phú Nhuận",
    "Thủ Đức",
    "Bình Tân",
    "Tân Phú",
  ];

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  // Calculate Haversine distance in km (uses centralized osrmService)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return getHaversineDistance(lat1, lon1, lat2, lon2);
  };

  // ⭐ FIXED: Parse price range string to {min, max} object
  const parsePriceRange = (rangeStr) => {
    if (!rangeStr || typeof rangeStr !== 'string') return null;

    // Normalization:
    // 1. Lowercase
    // 2. Remove dots, commas (thousands separators)
    // 3. Remove 'đ', 'vnd', 'k' (unless k is multiplier? logic below assumes full numbers usually)
    //    Actually, user inputs might be "50k", DB might be "50.000".
    //    Let's strip dots/commas first.
    let cleanStr = rangeStr.toLowerCase().replace(/\./g, "").replace(/,/g, "");

    // Remove currency symbols/words
    cleanStr = cleanStr.replace(/đ|vnd|vnđ/g, "").trim();

    // Check for "đang cập nhật"
    if (cleanStr.includes("cập nhật")) return null;

    console.log("[PriceParse] Parsing: \"" + rangeStr + "\" -> \"" + cleanStr + "\"");

    // Case 1: "30000 - 50000" (using hyphen, en-dash, em-dash)
    // Regex: (\d+) \s* [ - – — ] \s* (\d+)
    const rangeMatch = cleanStr.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      console.log("[PriceParse] Range Detected: " + min + " - " + max);
      return { min, max };
    }

    // Case 2: "Dưới 50000", "< 50000", "Under 50000"
    const underMatch = cleanStr.match(/(dưới|<|under|khoảng)\s*(\d+)/);
    if (underMatch) {
      const val = parseInt(underMatch[2]);
      // If "khoảng", treating as point value or small range?
      // Let's treat "dưới" as 0 to val
      if (underMatch[1] === 'khoảng') {
         return { min: val, max: val };
      }
      return { min: 0, max: val };
    }

    // Case 3: "Trên 200000", "> 200000", "Over 200000"
    const overMatch = cleanStr.match(/(trên|>|over)\s*(\d+)/);
    if (overMatch) {
      return { min: parseInt(overMatch[2]), max: Infinity };
    }

    // Case 4: Single number "20000"
    const numberMatch = cleanStr.match(/(\d+)/);
    if (numberMatch) {
      const val = parseInt(numberMatch[1]);
       // If just a number, maybe it's a fixed price?
       console.log(`[PriceParse] Single value: ${val}`);
       return { min: val, max: val };
    }

    return null;
  };

  // Check if restaurant matches price range filter
  const matchesPriceRange = (restaurant, filterRange) => {
    if (filterRange === "Tất cả") return true;

    // Log the restaurant being checked (optional, mostly for debugging specific ones)
    // console.log("Checking price for:", restaurant.name, restaurant.price_range);

    const priceData = parsePriceRange(restaurant.price_range);
    
    // STRICT RULE: If price is unknown or updating, DO NOT show when a specific filter is applied.
    // Logic: User wants "Cheap", we don't know if "Updating" is cheap.
    if (!priceData) return false; 

    const { min: rMin, max: rMax } = priceData;

    switch (filterRange) {
      case "Dưới 50.000": 
        return rMin < 50000;

      case "50.000 - 100.000":
        return rMin < 100000 && rMax > 50000;

      case "100.000 - 200.000": 
        return rMin < 200000 && rMax > 100000;

      case "200.000 - 500.000": 
        return rMin < 500000 && rMax > 200000;

      case "Trên 500.000": 
        return rMax > 500000;

      default:
        return true;
    }
  };

  // ⭐ FIXED: Extract district from address - hỗ trợ quận nhiều từ
  const extractDistrict = (address) => {
    if (!address) return "";

    // Normalize address: Q. -> Quận
    const normalizedAddress = address
      .replace(/Q\.\s*/gi, "Quận ")
      .replace(/P\.\s*/gi, "Phường ")
      .trim();

    // Try matching numbered districts first (Quận 1-12)
    let match = normalizedAddress.match(/Quận\s+(\d+)/i);
    if (match) {
      return `Quận ${match[1]}`;
    }

    // Try matching named districts (multi-word)
    // Look for district name until comma or other delimiter
    match = normalizedAddress.match(
      /Quận\s+([\p{L}\s]+?)(?=,|\s*-|\s+P\b|\s+Phường|$)/iu
    );
    if (match) {
      let districtName = match[1].trim();

      // Remove trailing junk
      districtName = districtName.replace(/\s+/g, " ");

      // Only return if it's a reasonable length (1-3 words)
      const wordCount = districtName.split(" ").length;
      if (wordCount >= 1 && wordCount <= 3) {
        return districtName;
      }
    }

    return "";
  };

  // ⭐ FIXED: Check if district matches - hỗ trợ so sánh linh hoạt
  const matchesDistrict = (address, filterDistrict) => {
    if (filterDistrict === "Tất cả") return true;

    const extracted = extractDistrict(address);
    if (!extracted) return false;

    // Exact match (Quận 4 === Quận 4)
    if (extracted === filterDistrict) return true;

    // Check if filter is "Quận X" and extracted is just "X"
    if (filterDistrict.startsWith("Quận ")) {
      return (
        extracted === filterDistrict || `Quận ${extracted}` === filterDistrict
      );
    }

    // Check if extracted is "Quận X" and filter is just "X"
    if (extracted.startsWith("Quận ")) {
      return (
        extracted === filterDistrict || extracted === `Quận ${filterDistrict}`
      );
    }

    // For named districts: case-insensitive partial match
    // This handles cases where database has "Bình Thạnh" and filter has "Bình Thạnh"
    const normalizedExtracted = extracted.toLowerCase().trim();
    const normalizedFilter = filterDistrict.toLowerCase().trim();

    return (
      normalizedExtracted === normalizedFilter ||
      normalizedExtracted.includes(normalizedFilter) ||
      normalizedFilter.includes(normalizedExtracted)
    );
  };

  // Calculate hybrid score (weighted combination)
  const calculateHybridScore = (restaurant) => {
    const semantic = restaurant.semantic_score || 0;
    const tfidf = restaurant.tfidf_score || 0;

    // Weighted combination: 60% semantic + 40% TF-IDF
    // Cân bằng giữa ý nghĩa ngữ nghĩa và keyword matching
    return semantic * 0.6 + tfidf * 0.4;
  };

  // ==========================================
  // GEOLOCATION
  // ==========================================

  // ==========================================
  // GEOLOCATION
  // ==========================================

  const fetchNearby = async (lat, lon) => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    setCurrentPage(1);

    try {
      // Call /nearby endpoint
      const res = await api.get(`/restaurants/nearby?lat=${lat}&lon=${lon}&radius=5000`);
      
      if (res.success) {
        setRestaurants(res.data);
        const filtered = applyFilters(res.data, {
            ...filters,
            sortBy: "distance"
        }, { lat, lon });
        setFilteredRestaurants(filtered);
      }
    } catch (err) {
      console.error("Nearby fetch error:", err);
      // Don't block UI, just log or show subtle error
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    // TOGGLE LOGIC: If location enabled -> Disable it
    if (userLocation) {
        setUserLocation(null);
        setLocationError("");
        
        // Reset filters dependent on location
        setFilters(prev => ({
            ...prev,
            maxDistance: null,
            sortBy: "hybrid" // Back to default
        }));

        // If user was viewing "Near Me" results (implied by empty keyword), 
        // we should probably reset the list or show empty state to avoid confusion.
        if (!keyword.trim()) {
            setRestaurants([]);
            setFilteredRestaurants([]);
            setHasSearched(false);
        } else {
            // If keyword exists, re-filter current list without distance bias
            // (handled by existing useEffect or manual re-filter?)
            // We'll manually trigger filter update in effect or here
            // Note: applyFilters depends on userLocation state, so proper React effect might handle it,
            // but let's be safe.
        }
        return;
    }

    // ENABLE LOGIC
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationLoading(false);

        // Auto-apply distance filter
        setFilters((prev) => ({
          ...prev,
          maxDistance: 5,
          sortBy: "distance",
        }));

        // If no keyword, auto-fetch nearby
        if (!keyword.trim()) {
            fetchNearby(location.lat, location.lon);
        }
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Bạn cần cho phép truy cập vị trí");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Không thể xác định vị trí");
            break;
          case error.TIMEOUT:
            setLocationError("Timeout xác định vị trí");
            break;
          default:
            setLocationError("Lỗi xác định vị trí");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // ==========================================
  // FILTERING & SORTING
  // ==========================================

  const applyFilters = (
    restaurantList,
    customFilters = filters,
    customLocation = userLocation
  ) => {
    let filtered = [...restaurantList];

    const f = customFilters;
    const loc = customLocation;

    // Add distance data if user location available
    if (loc) {
      filtered = filtered.map((r) => ({
        ...r,
        distance:
          r.location?.coordinates // Mongo GeoJSON [lon, lat]
            ? calculateDistance(loc.lat, loc.lon, r.location.coordinates[1], r.location.coordinates[0])
            : r.lat && r.lon // Legacy fallback
            ? calculateDistance(loc.lat, loc.lon, r.lat, r.lon)
            : null,
      }));
    }

    // Filter by category
    if (f.category !== "Tất cả") {
      filtered = filtered.filter((r) => r.category === f.category);
    }

    // Filter by price range
    if (f.priceRange !== "Tất cả") {
      filtered = filtered.filter((r) => matchesPriceRange(r, f.priceRange));
    }

    // Filter by minimum rating
    if (f.minRating > 0) {
      filtered = filtered.filter((r) => r.avg_rating >= f.minRating);
    }

    // Filter by district
    if (f.district !== "Tất cả") {
      filtered = filtered.filter((r) => matchesDistrict(r.address, f.district));
    }

    // Filter by max distance (if location available)
    if (f.maxDistance && loc) {
      filtered = filtered.filter(
        (r) => r.distance !== null && r.distance <= f.maxDistance
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (f.sortBy) {
        case "hybrid":
          return calculateHybridScore(b) - calculateHybridScore(a);

        case "semantic":
          return (b.semantic_score || 0) - (a.semantic_score || 0);

        case "tfidf":
          return (b.tfidf_score || 0) - (a.tfidf_score || 0);

        case "rating":
          return b.avg_rating - a.avg_rating;

        case "distance":
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance - b.distance;

        case "name":
          return a.name.localeCompare(b.name, "vi");

        default:
          return 0;
      }
    });

    return filtered;
  };

  // ==========================================
  // SEARCH HANDLER
  // ==========================================

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const trimmedKeyword = keyword.trim();
    
    // Empty keyword + Location -> Fetch Nearby
    if (!trimmedKeyword) {
        if (userLocation) {
             fetchNearby(userLocation.lat, userLocation.lon);
             return;
        }
        setError("Vui lòng nhập từ khóa tìm kiếm");
        return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setCurrentPage(1);

    try {
      const params = { q: trimmedKeyword };
      if (userLocation) {
          params.lat = userLocation.lat;
          params.lon = userLocation.lon;
          params.radius = 5000;
      }

      // Updated endpoint: api.get (using axios instance)
      const response = await api.get("/search/advanced", { params });

      // Note: api.js interceptor returns response.data
      // And /search/advanced returns { success: true, data: [...], ... }
      
      if (response && Array.isArray(response.data)) {
        setRestaurants(response.data);
        const filtered = applyFilters(response.data);
        setFilteredRestaurants(filtered);

        // Preserve addToTour param when updating URL
        const newParams = { q: trimmedKeyword };
        const addToTourParam = searchParams.get("addToTour");
        if (addToTourParam) {
          newParams.addToTour = addToTourParam;
        }
        setSearchParams(newParams);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tìm kiếm."
      );
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    // Re-apply filters
    const filtered = applyFilters(restaurants, newFilters, userLocation);
    setFilteredRestaurants(filtered);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: "Tất cả",
      priceRange: "Tất cả",
      minRating: 0,
      district: "Tất cả",
      sortBy: "hybrid",
      maxDistance: null,
    };
    setFilters(resetFilters);
    setCurrentPage(1);

    const filtered = applyFilters(restaurants, resetFilters, userLocation);
    setFilteredRestaurants(filtered);
  };

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = filteredRestaurants.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  // ==========================================
  // EFFECTS
  // ==========================================

  // Check if coming from tour edit page
  useEffect(() => {
    const tourIdParam = searchParams.get("addToTour");
    if (tourIdParam) {
      setAddingToTourId(tourIdParam);
    } else {
      setAddingToTourId(null);
      setPendingAddItems([]);
    }
  }, [searchParams]);

  useEffect(() => {
    const queryParam = searchParams.get("q");
    if (queryParam) {
      setKeyword(queryParam);
      // Pass queryParam explicitly or ensure handleSearch reads it
      // Since handleSearch reads 'keyword' state, and on mount 'keyword' is init from URL, it works.
      handleSearch();
    }
  }, []);

  useEffect(() => {
    if (restaurants.length > 0) {
      const filtered = applyFilters(restaurants, filters, userLocation);
      setFilteredRestaurants(filtered);
    }
  }, [userLocation]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* === SEARCH HEADER === */}
        <div className="bg-white shadow-lg rounded-3xl p-8 md:p-12 mb-10 flex flex-col items-center text-center relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 left-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4 flex items-center justify-center gap-3">
                    <Search className="text-orange-600" size={32} />
                    Tìm kiếm thông minh
                </h1>
                <p className="text-gray-500 text-lg mb-8 max-w-2xl">
                    Kết hợp tìm kiếm ngữ nghĩa và từ khóa để đưa ra gợi ý nhà hàng chính xác nhất cho bạn.
                </p>

                <form
                    onSubmit={handleSearch}
                    className="w-full flex flex-col md:flex-row gap-4"
                >
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder='Thử tìm: "Phở bò quận 1", "Lẩu thái chua cay"...'
                            className="w-full h-14 pl-6 pr-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`h-14 px-8 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap ${
                                loading 
                                ? "bg-gray-400 cursor-not-allowed" 
                                : "bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-200"
                            }`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">Wait...</span>
                            ) : (
                                <>
                                    <Search size={20} /> Tìm kiếm
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={getUserLocation}
                            disabled={locationLoading}
                            className={`h-14 px-6 rounded-2xl font-bold border-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                userLocation
                                    ? "bg-blue-500 border-blue-500 text-white shadow-blue-200 shadow-lg"
                                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-600"
                            }`}
                        >
                            <MapPin size={20} />
                            <span className="hidden sm:inline">
                                {locationLoading ? "..." : userLocation ? "Gần tôi" : "Gần tôi"}
                            </span>
                        </button>
                    </div>
                </form>

                 {/* Error Messages */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                         <span>⚠️ {error}</span>
                    </div>
                )}
                 {locationError && (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2 border border-yellow-100 animate-in fade-in slide-in-from-top-2">
                         <MapPin size={16} /> {locationError}
                    </div>
                )}
            </div>
        </div>

        {/* === TAB NAVIGATION === */}
        <div className="flex flex-col gap-6">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={"flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition-colors " + (
                        activeTab === 'manual'
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Hand size={20} />
                    Thủ công
                </button>
                <button
                    onClick={() => setActiveTab('suggest')}
                    className={"flex items-center gap-2 px-6 py-3 font-bold border-b-2 transition-colors " + (
                        activeTab === 'suggest'
                            ? "border-orange-500 text-orange-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Sparkles size={20} />
                    Gợi ý theo ý bạn
                </button>
            </div>
        </div>

        {/* === MAIN CONTENT === */}
        <div className="flex flex-col gap-8">
             
             {/* TAB: MANUAL SEARCH */}
             {activeTab === 'manual' && (
             <div className="w-full">
                 
                 {hasSearched && !loading && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filter Sidebar */}
                        <aside className="w-full lg:w-64 flex-shrink-0">
                             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-24">
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <Filter size={18} className="text-orange-500"/> Bộ lọc
                                    </h3>
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-xs font-medium text-orange-600 hover:bg-orange-50 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                                    >
                                        <RotateCcw size={12} /> Đặt lại
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Danh mục món</label>
                                        <div className="relative">
                                            <select
                                                value={filters.category}
                                                onChange={(e) => handleFilterChange("category", e.target.value)}
                                                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none font-medium text-gray-700"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <ChevronLeft className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                    {/* Price */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Khoảng giá</label>
                                        <div className="relative">
                                            <select
                                                value={filters.priceRange}
                                                onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                                                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none font-medium text-gray-700"
                                            >
                                                {priceRanges.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            <ChevronLeft className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                    {/* District */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Khu vực</label>
                                        <div className="relative">
                                             <select
                                                value={filters.district}
                                                onChange={(e) => handleFilterChange("district", e.target.value)}
                                                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none font-medium text-gray-700"
                                            >
                                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                             <ChevronLeft className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-[-90deg] text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                    {/* Sort */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sắp xếp theo</label>
                                        <div className="relative">
                                            <select
                                                value={filters.sortBy}
                                                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                                                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 appearance-none font-medium text-gray-700"
                                            >
                                                <option value="hybrid">Độ liên quan (Hybrid)</option>
                                                <option value="rating">Đánh giá cao nhất</option>
                                                <option value="distance">Gần tôi nhất</option>
                                                <option value="name">Tên A-Z</option>
                                            </select>
                                            <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </aside>

                        {/* Results Grid */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Kết quả tìm kiếm
                                    <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                        {filteredRestaurants.length} nhà hàng
                                    </span>
                                </h2>
                            </div>

                            {filteredRestaurants.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search className="text-gray-300" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h3>
                                    <p className="text-sm text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé.</p>
                                    <button
                                        onClick={handleResetFilters}
                                        className="mt-5 px-5 py-2 bg-orange-50 text-orange-600 font-bold text-sm rounded-lg hover:bg-orange-100 transition-colors"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {currentRestaurants.map((restaurant) => {
                                            const inTour = isInTour(restaurant._id);
                                            return (
                                                <div key={restaurant._id} className="h-[380px] hover:z-10 relative">
                                                    <RestaurantCard 
                                                        restaurant={restaurant} 
                                                        action={
                                                            inTour ? (
                                                                <button
                                                                    disabled
                                                                    className="bg-gray-400 text-white px-2.5 py-1.5 text-xs rounded-lg font-bold shadow-md flex items-center gap-1 cursor-not-allowed opacity-60"
                                                                >
                                                                    ✓ Đã thêm vào Tour
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleAddToTour(restaurant);
                                                                    }}
                                                                    className="bg-orange-600 text-white px-2.5 py-1.5 text-xs rounded-lg font-bold hover:bg-orange-700 shadow-md flex items-center gap-1 transition-transform active:scale-95"
                                                                >
                                                                    <Plus size={12} /> Thêm vào Tour
                                                                </button>
                                                            )
                                                        }
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-10 flex justify-center items-center gap-2 flex-wrap">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>

                                            {getPageNumbers().map((page, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => typeof page === "number" && handlePageChange(page)}
                                                    disabled={page === "..."}
                                                    className={"w-9 h-9 flex items-center justify-center rounded-full font-bold text-xs transition-all " + (
                                                        page === currentPage
                                                            ? "bg-orange-600 text-white shadow-lg shadow-orange-200 scale-110"
                                                            : page === "..."
                                                            ? "bg-transparent text-gray-400 cursor-default"
                                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                                    )}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                 )}

                 {/* Empty State / Intro */}
                 {!hasSearched && !loading && (
                    <div className="text-center py-16 opacity-40">
                        <Search size={56} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium text-gray-400">Nhập từ khóa để bắt đầu tìm kiếm</p>
                    </div>
                )}
             </div>
             )}

             {/* TAB: AI SUGGEST */}
             {activeTab === 'suggest' && (
             <div className="w-full">
                 <NLSuggestBox 
                     onResults={handleNLResults}
                     onError={handleNLError}
                 />
                 
                 {nlSteps && nlSteps.length >0 && (
                     <StepsDisplay steps={nlSteps} />
                 )}

                 {nlRoutes && nlRoutes.length > 0 && (
                     <RoutesDisplay 
                         routes={nlRoutes}
                         onApplyRoute={handleApplyRoute}
                     />
                 )}

                 {/* Apply Route Modal */}
                 {showApplyModal && selectedRoute && (
                     <ApplyRouteModal
                         route={selectedRoute}
                         onConfirm={handleConfirmApply}
                         onCancel={() => setShowApplyModal(false)}
                     />
                 )}
             </div>
             )}

             {/* FOOD TOUR BUILDER - BOTTOM SECTION */}
             <div className="w-full">
                 <TourBuilder 
                    tourItems={tourItems} 
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver} 
                    onDragEnd={handleDragEndWithWeather}
                    onRemove={handleRemoveFromTour}
                    tourName={tourName}
                    setTourName={setTourName}
                    onSave={handleSaveTour}
                    isSaving={isSaving}
                 />
             </div>
        </div>

      </main>

      {/* Weather Warning Modal */}
      <WeatherWarning
        isOpen={weatherWarning.isOpen}
        onClose={handleWeatherCancel}
        onConfirm={handleWeatherConfirm}
        onCancel={handleWeatherCancel}
        restaurantName={weatherWarning.restaurant?.name || ""}
        slotLabel={getSlotLabel(weatherWarning.slot)}
        weather={weatherWarning.weather}
        message={weatherWarning.message}
      />

      {/* Floating Action Bar when adding to external tour */}
      {addingToTourId && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-2xl z-50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div>
                <p className="font-bold">Đang thêm quán vào Tour</p>
                <p className="text-sm text-white/80">
                  {pendingAddItems.length > 0 
                    ? `Đã chọn ${pendingAddItems.length} quán: ${pendingAddItems.map(r => r.name).join(', ').slice(0, 50)}${pendingAddItems.map(r => r.name).join(', ').length > 50 ? '...' : ''}`
                    : 'Chọn quán bằng cách click "Thêm vào Tour"'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelReturn}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAndReturn}
                disabled={pendingAddItems.length === 0}
                className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={18} />
                Xác nhận ({pendingAddItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for floating bar */}
      {addingToTourId && <div className="h-20"></div>}

      <Footer />
    </div>
  );
};

export default AdvancedSearchPage;