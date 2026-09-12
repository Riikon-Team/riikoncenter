/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { X, Palette, Sun, Settings, Check, LayoutGrid, Clock, Trash2, Upload, Plus } from 'lucide-react';
import { AppSettings, SettingsTranslation } from '../types';
import { useTranslation } from 'react-i18next';

interface SettingsDialogProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const WALLPAPER_PRESETS = [
  {
    name: "Vũ trụ Slate",
    nameEn: "Slate Universe",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Hồ sương mờ",
    nameEn: "Mist Lake",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Rừng hoàng hôn",
    nameEn: "Sunset Forest",
    url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Sương tuyết trắng",
    nameEn: "White Frost",
    url: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Sa mạc thanh khiết",
    nameEn: "Pure Desert",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80"
  }
];

export const ACCENT_COLORS = [
  { id: 'white', bg: 'bg-white', text: 'text-white font-medium', border: 'border-white', hex: '#FFFFFF' },
  { id: 'blue', bg: 'bg-blue-400', text: 'text-blue-400 font-medium', border: 'border-blue-400', hex: '#60A5FA' },
  { id: 'green', bg: 'bg-emerald-400', text: 'text-emerald-400 font-medium', border: 'border-emerald-400', hex: '#34D399' },
  { id: 'yellow', bg: 'bg-amber-300', text: 'text-amber-300 font-medium', border: 'border-amber-300', hex: '#FCD34D' },
  { id: 'pink', bg: 'bg-rose-400', text: 'text-rose-400 font-medium', border: 'border-rose-400', hex: '#F87171' },
  { id: 'violet', bg: 'bg-violet-400', text: 'text-violet-400 font-medium', border: 'border-violet-400', hex: '#A78BFA' }
];

export default function SettingsDialog({ settings, onUpdateSettings, onClose }: SettingsDialogProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('settings', { returnObjects: true }) as unknown as SettingsTranslation;
  const [activeTab, setActiveTab] = useState<'visual' | 'weather' | 'widgets' | 'clock'>('visual');
  const [customBgInput, setCustomBgInput] = useState(settings.customBgUrl?.startsWith('data:') ? '' : settings.customBgUrl || '');

  const addCustomWallpaperUrl = (e: FormEvent) => {
    e.preventDefault();
    const url = customBgInput.trim();
    if (!url) return;

    const list = [...(settings.customWallpapers || [])];
    if (!list.includes(url)) {
      list.push(url);
    }
    onUpdateSettings({
      customWallpapers: list,
      customBgUrl: url,
      bgImageIndex: -1
    });
    setCustomBgInput('');
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert(settings.language === 'en'
        ? "Base64 image is too large (4MB limit). Please upload a smaller image file."
        : "Ảnh quá lớn (giới hạn 4MB) để có thể lưu trữ trong bộ nhớ trình duyệt của bạn."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        const list = [...(settings.customWallpapers || [])];
        if (!list.includes(base64Data)) {
          list.push(base64Data);
        }
        onUpdateSettings({
          customWallpapers: list,
          customBgUrl: base64Data,
          bgImageIndex: -1
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteCustomWallpaper = (targetUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const list = (settings.customWallpapers || []).filter(u => u !== targetUrl);
    
    const isCurrentlyActive = settings.customBgUrl === targetUrl && settings.bgImageIndex === -1;
    onUpdateSettings({
      customWallpapers: list,
      ...(isCurrentlyActive ? { customBgUrl: undefined, bgImageIndex: 0 } : {})
    });
  };

  const handleToggleWidget = (widgetKey: 'weather' | 'focus' | 'notes') => {
    onUpdateSettings({
      widgetsVisibility: {
        ...settings.widgetsVisibility,
        [widgetKey]: !settings.widgetsVisibility[widgetKey]
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" id="settings-overlay">
      <div className="glass-dialog w-full max-w-xl rounded-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden" id="settings-dialog-box">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4" id="settings-dialog-header">
          <div className="flex items-center gap-2">
            <Settings className="text-white animate-spin-slow" size={20} />
            <div>
              <h3 className="font-heading font-semibold text-lg text-white" id="settings-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1" id="settings-dialog-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="settings-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl gap-1 my-4" id="settings-nav-tabs">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-1.5 text-[11px] font-heading font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'visual' ? 'bg-white text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
            }`}
            id="settings-tab-visual"
          >
            <Palette size={11} /> {t.tabs.visual}
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex-1 py-1.5 text-[11px] font-heading font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'weather' ? 'bg-white text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
            }`}
            id="settings-tab-weather"
          >
            <Sun size={11} /> {t.tabs.weather}
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`flex-1 py-1.5 text-[11px] font-heading font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'widgets' ? 'bg-white text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
            }`}
            id="settings-tab-widgets"
          >
            <LayoutGrid size={11} /> {t.tabs.widgets}
          </button>
          <button
            onClick={() => setActiveTab('clock')}
            className={`flex-1 py-1.5 text-[11px] font-heading font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'clock' ? 'bg-white text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
            }`}
            id="settings-tab-clock"
          >
            <Clock size={11} /> {t.tabs.clock}
          </button>
        </div>

        {/* Content Cockpit scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 text-xs font-sans text-slate-300" id="settings-scroll-content">
          
          {activeTab === 'visual' && (
            <div className="space-y-4" id="settings-visual-area">
              {/* Accent Palette Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2" id="lbl-accent-palette">
                  {t.accentColorLabel}
                </label>
                <div className="flex gap-2.5" id="settings-accent-row">
                  {ACCENT_COLORS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => onUpdateSettings({ accentColor: col.id })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${col.bg} ${
                        settings.accentColor === col.id
                          ? 'border-white scale-110 ring-4 ring-white/10'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={col.id}
                      id={`btn-accent-${col.id}`}
                    >
                      {settings.accentColor === col.id && (
                        <Check size={12} className={col.id === 'white' || col.id === 'yellow' ? 'text-slate-900' : 'text-white'} strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Wallpapers Row */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2" id="lbl-wallpaper-presets">
                  {t.wallpapersLabel}
                </label>
                <div className="grid grid-cols-2 gap-2" id="settings-wallpapers-grid">
                  {WALLPAPER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => onUpdateSettings({ bgImageIndex: idx, customBgUrl: undefined })}
                      style={{ backgroundImage: `url(${p.url})` }}
                      className={`h-16 rounded-lg bg-cover bg-center border text-left p-2.5 relative flex items-end overflow-hidden cursor-pointer group transition-all ${
                        settings.bgImageIndex === idx && !settings.customBgUrl
                          ? 'border-white ring-2 ring-white/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      id={`wallpaper-preset-${idx}`}
                    >
                      <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/20 transition-colors z-0" />
                      <span className="font-heading font-medium text-[10px] text-white tracking-tight relative z-10 truncate">
                        {settings.language === 'vi' ? p.name : p.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom background URL input and file upload combined */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest" id="lbl-custom-wall-url">
                    {t.customWallpapersSection}
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">PNG/JPG</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{t.customWallpapersDesc}</p>
                
                {/* Actions: Add URL form and Tải tệp button */}
                <div className="flex flex-col sm:flex-row gap-2" id="custom-wall-actions">
                  <form onSubmit={addCustomWallpaperUrl} className="flex-1 flex gap-1.5" id="settings-custom-wall-form">
                    <input
                      type="url"
                      value={customBgInput}
                      onChange={e => setCustomBgInput(e.target.value)}
                      placeholder={t.customWallpaperPlaceholder}
                      className="flex-1 px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                      id="btn-apply-custom-wall-url"
                    >
                      <Plus size={12} /> {t.addWallpaperBtn}
                    </button>
                  </form>
                  
                  {/* File upload hidden input */}
                  <label className="px-3 py-2 rounded-lg bg-white text-slate-950 font-heading font-semibold hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5">
                    <Upload size={12} />
                    <span>{t.uploadWallpaperLabel}</span>
                    <input
                      type="file"
                      id="upload-image-file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Custom Wallpapers gallery list */}
                <div className="mt-2" id="custom-wallpapers-gallery-container">
                  {settings.customWallpapers && settings.customWallpapers.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mt-1.5" id="custom-wallpaper-gallery">
                      {settings.customWallpapers.map((url, idx) => {
                        const isSelected = settings.customBgUrl === url && settings.bgImageIndex === -1;
                        const isBase64 = url.startsWith('data:');
                        return (
                          <div
                            key={idx}
                            onClick={() => onUpdateSettings({ customBgUrl: url, bgImageIndex: -1 })}
                            style={{ backgroundImage: `url(${url})` }}
                            className={`h-14 rounded-lg bg-cover bg-center border relative overflow-hidden cursor-pointer group/item transition-all flex items-end justify-between p-1.5 ${
                              isSelected
                                ? 'border-amber-400 ring-2 ring-amber-400/20'
                                : 'border-white/5 hover:border-white/20'
                            }`}
                            id={`custom-wallpaper-gallery-item-${idx}`}
                          >
                            <div className="absolute inset-0 bg-black/30 group-hover/item:bg-black/10 transition-colors z-0" />
                            
                            <span className="text-[8px] bg-slate-950/80 text-slate-300 px-1 py-0.5 rounded backdrop-blur-sm z-10 truncate max-w-[70%] leading-none font-mono">
                              {isBase64 ? (settings.language === 'en' ? 'Local' : 'Nội bộ') : 'URL'}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => deleteCustomWallpaper(url, e)}
                              className="w-5 h-5 rounded bg-black/70 hover:bg-red-500 text-slate-400 hover:text-white transition-all flex items-center justify-center z-10 opacity-0 group-hover/item:opacity-100 shadow cursor-pointer self-start"
                              title={settings.language === 'en' ? "Delete" : "Xóa"}
                              id={`delete-custom-wallpaper-${idx}`}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl mt-1 text-slate-500 font-medium tracking-wide">
                      {t.noCustomWallpapers}
                    </div>
                  )}
                </div>
              </div>

              {/* Blur intensity indicator */}
              <div className="pt-2">
                <div id="settings-blur-wrap" className="w-full">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    {t.blurLabel} ({settings.bgBlurIntensity}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={settings.bgBlurIntensity}
                    onChange={e => onUpdateSettings({ bgBlurIntensity: Number(e.target.value) })}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Language selection block */}
              <div className="pt-3 border-t border-white/10" id="settings-language-block">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2" id="lbl-system-language">
                  {t.systemLanguage}
                </label>
                <div className="flex gap-2" id="language-selection-buttons">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ language: 'vi' })}
                    className={`flex-1 py-2 text-xs font-heading font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      settings.language === 'vi'
                        ? 'bg-white text-slate-950 border-white font-semibold'
                        : 'text-slate-300 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    🇻🇳 {t.languageVi}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ language: 'en' })}
                    className={`flex-1 py-2 text-xs font-heading font-medium rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      settings.language === 'en'
                        ? 'bg-white text-slate-950 border-white font-semibold'
                        : 'text-slate-300 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    🇺🇸 {t.languageEn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="space-y-4" id="settings-weather-area">
              {/* City settings */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t.cityLabel}
                </label>
                <input
                  type="text"
                  value={settings.weatherCity}
                  onChange={e => onUpdateSettings({ weatherCity: e.target.value })}
                  placeholder={t.cityPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-white"
                  id="settings-weather-city-input"
                />
                <p className="text-[10px] text-slate-500 mt-1">{t.cityHelp}</p>
              </div>

              {/* Temperature Unit */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t.unitLabel}
                </label>
                <div className="flex gap-2" id="weather-unit-selector">
                  <button
                    onClick={() => onUpdateSettings({ weatherUnit: 'C' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      settings.weatherUnit === 'C'
                        ? 'bg-white text-slate-950 border-white'
                        : 'text-slate-300 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {t.unitCelsius}
                  </button>
                  <button
                    onClick={() => onUpdateSettings({ weatherUnit: 'F' })}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      settings.weatherUnit === 'F'
                        ? 'bg-white text-slate-950 border-white'
                        : 'text-slate-300 hover:text-white bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {t.unitFahrenheit}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="space-y-4" id="settings-widgets-area">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                {t.bentoLabel}
              </label>
              <div className="space-y-2" id="settings-widgets-toggles-box">
                {/* Weather widget toggle */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left">
                    <span className="font-heading font-semibold text-[13px] text-white block">{t.bentoWeatherTitle}</span>
                    <span className="text-[10px] text-slate-400">{t.bentoWeatherDesc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleWidget('weather')}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.widgetsVisibility.weather ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.widgetsVisibility.weather ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Focus Pomodoro toggle */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left">
                    <span className="font-heading font-semibold text-[13px] text-white block">{t.bentoFocusTitle}</span>
                    <span className="text-[10px] text-slate-400">{t.bentoFocusDesc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleWidget('focus')}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.widgetsVisibility.focus ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.widgetsVisibility.focus ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Notes scratchpad toggle */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left">
                    <span className="font-heading font-semibold text-[13px] text-white block">{t.bentoNotesTitle}</span>
                    <span className="text-[10px] text-slate-400">{t.bentoNotesDesc}</span>
                  </div>
                  <button
                    onClick={() => handleToggleWidget('notes')}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.widgetsVisibility.notes ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.widgetsVisibility.notes ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clock' && (
            <div className="space-y-4" id="settings-clock-area">
              
              {/* Clock font style selection card grid */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t.clockSettings.styleLabel}
                </label>
                <div className="grid grid-cols-2 gap-2" id="clock-font-family-grid">
                  {(Object.entries(t.clockSettings.styles) as [string, string][]).map(([key, label]) => {
                    const isSelected = settings.clockFontFamily === key;
                    const sampleFontClass = 
                      key === 'heading' ? 'font-heading' :
                      key === 'mono' ? 'font-mono text-slate-300' :
                      key === 'space' ? 'font-space' :
                      key === 'playfair' ? 'font-playfair serif' :
                      'font-sans';
                    return (
                      <button
                        key={key}
                        onClick={() => onUpdateSettings({ clockFontFamily: key as 'sans' | 'heading' | 'mono' | 'space' | 'playfair' })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white text-white'
                            : 'bg-white/5 border-transparent hover:bg-white/8 hover:text-white text-slate-300'
                        }`}
                        id={`btn-clock-font-${key}`}
                      >
                        <span className="block text-[10px] font-semibold text-slate-400 tracking-wider mb-2 uppercase select-none">{label}</span>
                        <span className={`block text-xl leading-none tracking-normal ${sampleFontClass}`}>
                          12:45
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clock weight slider / pick dropdown */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center animate-fade-in" id="clock-weight-config">
                <div className="text-left max-w-[65%]">
                  <span className="font-heading font-semibold text-[13px] text-white block">{t.clockWeightLabel}</span>
                  <span className="text-[10px] text-slate-400">{settings.language === 'en' ? 'Adjust thickness of the numbers' : 'Điều chỉnh độ dày mỏng nét vẽ chữ số'}</span>
                </div>
                <select
                  value={settings.clockFontWeight}
                  onChange={e => onUpdateSettings({ clockFontWeight: e.target.value as 'light' | 'regular' | 'medium' | 'bold' })}
                  className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white cursor-pointer text-xs"
                  id="sel-clock-font-weight"
                >
                  <option value="light" className="bg-slate-900">{t.weights.light}</option>
                  <option value="regular" className="bg-slate-900">{t.weights.regular}</option>
                  <option value="medium" className="bg-slate-900">{t.weights.medium}</option>
                  <option value="bold" className="bg-slate-900">{t.weights.bold}</option>
                </select>
              </div>

              {/* Formatting details list */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                
                {/* 12-hour / 24-hour mode switch */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left max-w-[75%]">
                    <span className="font-heading font-semibold text-xs text-white block">{t.timeFormatLabel}</span>
                    <span className="text-[10px] text-slate-400">{settings.language === 'en' ? 'Toggle between 12-hour AM/PM and 24-hour military layouts' : 'Chuyển chế độ 12 giờ AM/PM hoặc 24 giờ'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ timeFormat12h: !settings.timeFormat12h })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.timeFormat12h ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                    id="btn-toggle-time-format"
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.timeFormat12h ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Show ticking seconds */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left max-w-[75%]">
                    <span className="font-heading font-semibold text-xs text-white block">{t.showSeconds}</span>
                    <span className="text-[10px] text-slate-400">{settings.language === 'en' ? 'Displays ticking seconds in the layout' : 'Thêm bộ kim giây đếm thời gian trực tiếp'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ showSeconds: !settings.showSeconds })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.showSeconds ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                    id="btn-toggle-show-seconds"
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.showSeconds ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Blinking separator */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left max-w-[75%]">
                    <span className="font-heading font-semibold text-xs text-white block">{t.clockSettings.blinkDividerLabel}</span>
                    <span className="text-[10px] text-slate-400">{t.clockSettings.blinkDividerDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ clockBlinkDivider: !settings.clockBlinkDivider })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.clockBlinkDivider ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                    id="btn-toggle-blink-divider"
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.clockBlinkDivider ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Show AM/PM Tag selector */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left max-w-[75%]">
                    <span className="font-heading font-semibold text-xs text-white block">{t.clockSettings.showAmPmLabel}</span>
                    <span className="text-[10px] text-slate-400">{t.clockSettings.showAmPmDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ clockShowAmPm: !settings.clockShowAmPm })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.clockShowAmPm ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                    id="btn-toggle-show-ampm"
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.clockShowAmPm ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Show Date layout checkbox toggle */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-left max-w-[75%]">
                    <span className="font-heading font-semibold text-xs text-white block">{t.clockSettings.showDateLabel}</span>
                    <span className="text-[10px] text-slate-400">{t.clockSettings.showDateDesc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ clockShowDate: !settings.clockShowDate })}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                      settings.clockShowDate ? 'bg-amber-400' : 'bg-white/10'
                    }`}
                    id="btn-toggle-show-date"
                  >
                    <div className={`w-5 h-5 rounded-full bg-slate-950 shadow transition-transform ${
                      settings.clockShowDate ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Date layout dropdown selection */}
                {settings.clockShowDate && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center animate-fade-in text-xs font-sans" id="date-format-config">
                    <div className="text-left max-w-[65%]">
                      <span className="font-heading font-semibold text-xs text-white block">{t.clockSettings.dateFormatLabel}</span>
                      <span className="text-[10px] text-slate-400">{settings.language === 'en' ? 'Choose wording structure' : 'Chọn định dạng cấu trúc chữ'}</span>
                    </div>
                    <select
                      value={settings.clockDateFormat}
                      onChange={e => onUpdateSettings({ clockDateFormat: e.target.value as 'full' | 'short' | 'numeric' })}
                      className="px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white cursor-pointer text-xs"
                      id="sel-clock-date-format"
                    >
                      <option value="full" className="bg-slate-900">{t.clockSettings.formats.full}</option>
                      <option value="short" className="bg-slate-900">{t.clockSettings.formats.short}</option>
                      <option value="numeric" className="bg-slate-900">{t.clockSettings.formats.numeric}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>



      </div>
    </div>
  );
}
