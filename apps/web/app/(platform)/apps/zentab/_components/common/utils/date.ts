/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses and formats dates according to the chosen locale structure
 */
export function formatDateByLocale(
  date: Date,
  format: 'full' | 'short' | 'numeric',
  language: 'vi' | 'en'
): string {
  const dayVal = date.getDate();
  const yearVal = date.getFullYear();

  if (language === 'en') {
    const daysOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysOfWeekEnShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsEnShort = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    if (format === 'numeric') {
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = dayVal.toString().padStart(2, '0');
      return `${monthStr}/${dayStr}/${yearVal}`;
    } else if (format === 'short') {
      const currentDay = daysOfWeekEnShort[date.getDay()];
      const currentMonth = monthsEnShort[date.getMonth()];
      return `${currentDay}, ${currentMonth} ${dayVal}, ${yearVal}`;
    } else {
      const currentDay = daysOfWeekEn[date.getDay()];
      const currentMonth = monthsEn[date.getMonth()];
      return `${currentDay}, ${currentMonth} ${dayVal}, ${yearVal}`;
    }
  } else {
    const daysOfWeekVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const daysOfWeekViShort = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const monthVal = date.getMonth() + 1;

    if (format === 'numeric') {
      const dayStr = dayVal.toString().padStart(2, '0');
      const monthStr = monthVal.toString().padStart(2, '0');
      return `${dayStr}/${monthStr}/${yearVal}`;
    } else if (format === 'short') {
      const currentDay = daysOfWeekViShort[date.getDay()];
      return `${currentDay}, ngày ${dayVal}/${monthVal}/${yearVal}`;
    } else {
      const currentDay = daysOfWeekVi[date.getDay()];
      return `${currentDay}, ngày ${dayVal} tháng ${monthVal}, năm ${yearVal}`;
    }
  }
}
