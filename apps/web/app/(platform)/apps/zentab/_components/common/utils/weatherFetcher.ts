/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherMetrics } from '../types';

// Deterministic fallback if API fails or offline
export function getDeterministicFallback(city: string, isEn: boolean): WeatherMetrics {
  const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tempBase = 12 + (hash % 18); // range 12-30°C
  const humidity = 40 + (hash % 45); // range 40-85%
  const windSpeed = 5 + (hash % 25); // range 5-30 km/h
  const uvIndex = 1 + (hash % 10);
  const visibility = 8 + (hash % 8); // 8-16 km

  const condition = isEn ? 'Partly cloudy' : 'Nhiều mây';
  const uvText = isEn ? 'Moderate' : 'Trung bình';

  const forecast = [
    { time: "12:00", temp: tempBase + 2, icon: hash % 3 === 0 ? 'rain' : hash % 2 === 0 ? 'cloudy' : 'sunny' },
    { time: "15:00", temp: tempBase + 3, icon: hash % 3 === 0 ? 'rain' : 'sunny' },
    { time: "18:00", temp: tempBase - 1, icon: 'cloudy' },
    { time: "21:00", temp: tempBase - 4, icon: 'night' }
  ];

  return {
    temp: tempBase,
    condition,
    high: tempBase + 4,
    low: tempBase - 5,
    humidity,
    windSpeed,
    uvIndex,
    uvText,
    visibility,
    forecast
  };
}

const translateCondition = (desc: string, isEn: boolean) => {
  if (isEn) return desc;
  const lower = desc.toLowerCase();
  if (lower.includes('clear') || lower.includes('sunny')) return 'Nắng rực rỡ';
  if (lower.includes('partly cloudy') || lower.includes('patchy sun')) return 'Nắng nhẹ';
  if (lower.includes('cloudy') || lower.includes('overcast') || lower.includes('mist')) return 'Trời nhiều mây';
  if (lower.includes('fog')) return 'Sương mù nhẹ';
  if (lower.includes('patchy rain') || lower.includes('light rain') || lower.includes('drizzle')) return 'Mưa nhẹ';
  if (lower.includes('heavy rain') || lower.includes('rain') || lower.includes('shower') || lower.includes('storm')) return 'Mưa rào';
  if (lower.includes('snow') || lower.includes('ice') || lower.includes('sleet') || lower.includes('frost')) return 'Sương tuyết trắng';
  return desc;
};

export async function fetchWeatherFromWttr(city: string, isEn: boolean): Promise<WeatherMetrics> {
  const cleanCity = city.toLowerCase().trim() || 'hanoi';
  const cacheKey = `zentab_weather_cache_${cleanCity}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Check 1 day (24 hours) expiration: 24 * 60 * 60 * 1000 = 86400000 ms
      if (Date.now() - parsed.timestamp < 86400000) {
        return parsed.data;
      }
    } catch (e) {
      console.warn("Error reading weather cache:", e);
    }
  }

  // Fetch from wttr.in
  try {
    const encodedCity = encodeURIComponent(cleanCity);
    const res = await fetch(`https://wttr.in/${encodedCity}?format=j1`);
    if (!res.ok) {
      throw new Error(`wttr.in returned status ${res.status}`);
    }
    const rawData = await res.json();

    const current = rawData.current_condition?.[0];
    const firstWeather = rawData.weather?.[0];

    if (!current || !firstWeather) {
      throw new Error("Invalid weather payload structure");
    }

    const temp = parseInt(current.temp_C) || 20;
    const condition = current.weatherDesc?.[0]?.value || 'Clear';
    const resolvedCondition = translateCondition(condition, isEn);

    // Weather forecast details
    const high = parseInt(firstWeather.maxtempC) || (temp + 3);
    const low = parseInt(firstWeather.mintempC) || (temp - 3);
    const humidity = parseInt(current.humidity) || 60;
    const windSpeed = parseInt(current.windspeedKmph) || 12;
    const uvIndex = parseInt(current.uvIndex) || 1;

    // UV Index mapping
    const getUvText = (uv: number) => {
      if (uv <= 2) return isEn ? 'Low' : 'Thấp';
      if (uv <= 5) return isEn ? 'Moderate' : 'Trung bình';
      if (uv <= 7) return isEn ? 'High' : 'Cao';
      if (uv <= 10) return isEn ? 'Very High' : 'Rất cao';
      return isEn ? 'Dangerous' : 'Nguy hiểm';
    };
    const uvText = getUvText(uvIndex);
    const visibility = parseInt(current.visibility) || 10;

    // Map 4 times of hourly: 09:00, 12:00, 15:00, 18:00
    const hourlyRaw = firstWeather.hourly || [];
    const targetHours = ["900", "1200", "1500", "1800"];
    const forecast = targetHours.map(hourStr => {
      const matched = hourlyRaw.find((h: any) => h.time === hourStr) || hourlyRaw[0];
      const hourTemp = matched ? parseInt(matched.tempC) : temp;
      const hourDesc = matched?.weatherDesc?.[0]?.value || 'Clear';
      // Map to simple key icons like 'sunny', 'cloudy', 'rain'
      let matchedIcon = 'sunny';
      const lowercaseDesc = hourDesc.toLowerCase();
      if (lowercaseDesc.includes('rain') || lowercaseDesc.includes('shower') || lowercaseDesc.includes('drizzle')) {
        matchedIcon = 'rain';
      } else if (lowercaseDesc.includes('cloud') || lowercaseDesc.includes('overcast') || lowercaseDesc.includes('mist') || lowercaseDesc.includes('fog')) {
        matchedIcon = 'cloudy';
      }

      const formattedTime = hourStr === "900" ? "09:00" : `${hourStr.substring(0, 2)}:00`;

      return {
        time: formattedTime,
        temp: hourTemp,
        icon: matchedIcon
      };
    });

    const parsedMetrics: WeatherMetrics = {
      temp,
      condition: resolvedCondition,
      high,
      low,
      humidity,
      windSpeed,
      uvIndex,
      uvText,
      visibility,
      forecast
    };

    // Save to Cache
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: parsedMetrics
    }));

    return parsedMetrics;
  } catch (err) {
    console.warn("Failed to fetch from wttr.in, falling back to deterministic:", err);
    // If expired cache exists, reuse it rather than fallback
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.data;
      } catch (e) {}
    }
    return getDeterministicFallback(city, isEn);
  }
}
