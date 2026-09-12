/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherMetrics {
  temp: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number; // km/h
  uvIndex: number;
  uvText: string;
  visibility: number; // km
  forecast: { time: string; temp: number; icon: string }[];
}
