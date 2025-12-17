// File: TDTT_FoodWebsite/frontend/src/utils/openingHoursUtils.js
// Utility functions để xử lý trạng thái mở/đóng cửa của nhà hàng

/**
 * Parse opening_hours string thành object { openHour, openMinute, closeHour, closeMinute }
 * @param {string} openingHours - Format "HH:mm - HH:mm" (e.g., "09:00 - 22:00")
 * @returns {Object|null} - Parsed times or null if invalid
 */
export function parseOpeningHours(openingHours) {
  if (!openingHours || typeof openingHours !== 'string') return null;
  
  // Format: "HH:mm - HH:mm"
  const regex = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;
  const match = openingHours.trim().match(regex);
  
  if (!match) return null;
  
  const [, openHour, openMinute, closeHour, closeMinute] = match.map(Number);
  
  // Validate ranges
  if (openHour < 0 || openHour > 23 || closeHour < 0 || closeHour > 23) return null;
  if (openMinute < 0 || openMinute > 59 || closeMinute < 0 || closeMinute > 59) return null;
  
  return {
    openHour,
    openMinute,
    closeHour,
    closeMinute,
  };
}

/**
 * Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
 * @returns {Object} - { hours, minutes, totalMinutes }
 */
export function getVietnamTime() {
  const now = new Date();
  // Convert to Vietnam time (UTC+7)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 3600000 * 7);
  
  const hours = vnTime.getHours();
  const minutes = vnTime.getMinutes();
  
  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
  };
}

/**
 * Convert giờ:phút thành tổng số phút trong ngày
 * @param {number} hour 
 * @param {number} minute 
 * @returns {number}
 */
function toMinutes(hour, minute) {
  return hour * 60 + minute;
}

/**
 * Format số phút thành chuỗi đọc được
 * @param {number} minutes 
 * @returns {string} - "X giờ Y phút" hoặc "X phút"
 */
function formatDuration(minutes) {
  if (minutes < 0) minutes = 0;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} phút`;
  } else if (mins === 0) {
    return `${hours} giờ`;
  } else {
    return `${hours} giờ ${mins} phút`;
  }
}

/**
 * Xác định trạng thái mở/đóng cửa của nhà hàng
 * @param {string} openingHours - Format "HH:mm - HH:mm"
 * @returns {Object} - { status, statusText, statusColor, timeUntilChange, isOpen }
 */
export function getOpenStatus(openingHours) {
  const parsed = parseOpeningHours(openingHours);
  
  // Kh\u00f4ng parse \u0111\u01b0\u1ee3c - tr\u1ea1ng th\u00e1i kh\u00f4ng x\u00e1c \u0111\u1ecbnh
  if (!parsed) {
    return {
      status: 'unknown',
      statusText: 'Chưa rõ giờ mở cửa',
      statusColor: 'gray',
      timeUntilChange: null,
      isOpen: null,
    };
  }
  
  const { openHour, openMinute, closeHour, closeMinute } = parsed;
  const vnTime = getVietnamTime();
  const currentMinutes = vnTime.totalMinutes;
  
  const openMinutes = toMinutes(openHour, openMinute);
  const closeMinutes = toMinutes(closeHour, closeMinute);
  
  // Xử lý trường hợp quán mở qua đêm (ví dụ: 18:00 - 02:00)
  const isOvernightShop = closeMinutes < openMinutes;
  
  let isOpen = false;
  let minutesUntilChange = 0;
  
  if (isOvernightShop) {
    // Quán mở qua đêm: mở từ openMinutes đến 23:59 HOẶC từ 00:00 đến closeMinutes
    if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
      isOpen = true;
      // Tính thời gian đến khi đóng
      if (currentMinutes >= openMinutes) {
        // Đang trong khoảng tối (18:00 - 23:59)
        minutesUntilChange = (24 * 60 - currentMinutes) + closeMinutes;
      } else {
        // Đang trong khoảng sáng (00:00 - 02:00)
        minutesUntilChange = closeMinutes - currentMinutes;
      }
    } else {
      isOpen = false;
      // Tính thời gian đến khi mở
      minutesUntilChange = openMinutes - currentMinutes;
    }
  } else {
    // Quán bình thường: mở từ openMinutes đến closeMinutes trong cùng ngày
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      isOpen = true;
      minutesUntilChange = closeMinutes - currentMinutes;
    } else {
      isOpen = false;
      if (currentMinutes < openMinutes) {
        minutesUntilChange = openMinutes - currentMinutes;
      } else {
        // Đã qua giờ đóng cửa, tính đến ngày mai
        minutesUntilChange = (24 * 60 - currentMinutes) + openMinutes;
      }
    }
  }
  
  // Xác định trạng thái chi tiết
  const SOON_THRESHOLD = 60; // 60 phút = 1 giờ
  
  if (isOpen) {
    if (minutesUntilChange <= SOON_THRESHOLD) {
      return {
        status: 'closing_soon',
        statusText: `Đóng cửa sau ${formatDuration(minutesUntilChange)}`,
        statusColor: 'orange',
        timeUntilChange: minutesUntilChange,
        isOpen: true,
      };
    } else {
      return {
        status: 'open',
        statusText: `Đang mở cửa`,
        statusColor: 'green',
        timeUntilChange: minutesUntilChange,
        isOpen: true,
        timeInfo: `Đóng cửa sau ${formatDuration(minutesUntilChange)}`,
      };
    }
  } else {
    if (minutesUntilChange <= SOON_THRESHOLD) {
      return {
        status: 'opening_soon',
        statusText: `Mở cửa sau ${formatDuration(minutesUntilChange)}`,
        statusColor: 'yellow',
        timeUntilChange: minutesUntilChange,
        isOpen: false,
      };
    } else {
      return {
        status: 'closed',
        statusText: `Đã đóng cửa`,
        statusColor: 'red',
        timeUntilChange: minutesUntilChange,
        isOpen: false,
        timeInfo: `Mở cửa sau ${formatDuration(minutesUntilChange)}`,
      };
    }
  }
}

/**
 * Lấy class CSS cho badge dựa trên statusColor
 * @param {string} statusColor 
 * @returns {string} - Tailwind CSS classes
 */
export function getStatusBadgeClasses(statusColor) {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    gray: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  
  return colorMap[statusColor] || colorMap.gray;
}

/**
 * Lấy emoji cho trạng thái
 * @param {string} status 
 * @returns {string}
 */
export function getStatusEmoji(status) {
  const emojiMap = {
    open: '🟢',
    closed: '🔴',
    opening_soon: '🟡',
    closing_soon: '🟠',
    unknown: '⚪',
  };
  
  return emojiMap[status] || '⚪';
}
