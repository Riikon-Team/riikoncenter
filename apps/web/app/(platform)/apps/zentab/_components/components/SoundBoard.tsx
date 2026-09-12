/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, 
  Music, Upload, FileAudio, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AppSettings, SoundBoardTranslation } from '../types';

// IndexedDB persistent storage utility for binary audio files
const dbName = 'serene_mp3_db';
const storeName = 'mp3_files';

const initDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open database'));
  });
};

const saveMp3File = async (id: string, name: string, blob: Blob): Promise<void> => {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const putRequest = store.put({ id, name, blob });
    putRequest.onsuccess = () => resolve();
    putRequest.onerror = () => reject(putRequest.error);
  });
};

const deleteMp3File = async (id: string): Promise<void> => {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const deleteRequest = store.delete(id);
    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
};

const getAllMp3Files = async (): Promise<{ id: string; name: string; blob: Blob }[]> => {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const getRequest = store.getAll();
    getRequest.onsuccess = () => resolve(getRequest.result);
    getRequest.onerror = () => reject(getRequest.error);
  });
};

interface SoundBoardProps {
  settings: AppSettings;
}

export default function SoundBoard({ settings }: SoundBoardProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('soundboard', { returnObjects: true }) as unknown as SoundBoardTranslation;

  // Ambient sound state
  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [ambientType, setAmbientType] = useState<'lofi' | 'rain' | 'custom'>(() => {
    return (localStorage.getItem('serene_ambient_type') as 'lofi' | 'rain' | 'custom') || 'lofi';
  });
  const [ambientVolume, setAmbientVolume] = useState(() => {
    const saved = localStorage.getItem('serene_ambient_volume');
    return saved ? parseFloat(saved) : 0.15;
  });
  const [customAudioUrl, setCustomAudioUrl] = useState(() => {
    const saved = localStorage.getItem('serene_custom_audio_url') || '';
    // Prevent stale Blob URLs from causing network errors
    return saved.startsWith('blob:') ? '' : saved;
  });
  const [customAudioName, setCustomAudioName] = useState(() => {
    return localStorage.getItem('serene_custom_audio_name') || '';
  });
  const [showCustomMusicSetup, setShowCustomMusicSetup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [tempSaveName, setTempSaveName] = useState('');
  const [customPlaylist, setCustomPlaylist] = useState<{ id: string; name: string; url: string; isLocal?: boolean; fromIndexedDB?: boolean }[]>([]);

  // Load Playlist combined with Local IndexedDB storage
  useEffect(() => {
    let createdUrls: string[] = [];
    let isActive = true;

    const loadPlaylistAndDb = async () => {
      const lofiSong = { id: 'p1', name: t.types.lofi, url: '/lofi.mp3' };
      const rainSong = { id: 'p2', name: t.types.rain, url: '/rain.mp3' };
      const baseTracks = [lofiSong, rainSong];
      
      let customUrls: { id: string; name: string; url: string; isLocal?: boolean; fromIndexedDB?: boolean }[] = [];
      const saved = localStorage.getItem('serene_custom_playlist_online');
      if (saved) {
        try {
          customUrls = JSON.parse(saved);
        } catch {
          customUrls = [];
        }
      }

      // Safeguard against stale local session blobs
      customUrls = customUrls.filter(item => item && item.url && !item.url.startsWith('blob:'));

      try {
        const localFiles = await getAllMp3Files();
        if (!isActive) return;

        const localTracks = localFiles.map(file => {
          const url = URL.createObjectURL(file.blob);
          createdUrls.push(url);
          return {
            id: file.id,
            name: file.name,
            url: url,
            isLocal: true,
            fromIndexedDB: true
          };
        });
        
        setCustomPlaylist([...baseTracks, ...customUrls, ...localTracks]);

        // If the current saved audio is a local track, heal the stale session URL
        if (customAudioName) {
          const matchingLocal = localTracks.find(track => track.name === customAudioName);
          if (matchingLocal) {
            setCustomAudioUrl(matchingLocal.url);
          }
        }
      } catch (err) {
        console.error("IndexedDB load tracks fail:", err);
        if (isActive) {
          setCustomPlaylist([...baseTracks, ...customUrls]);
        }
      }
    };

    loadPlaylistAndDb();

    return () => {
      isActive = false;
      createdUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [t.types.lofi, t.types.rain, customAudioName]);

  // Audio references
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);

  // Separate effect to handle volume changes smoothly without audio restarts
  useEffect(() => {
    const audio = lofiAudioRef.current;
    if (audio) {
      audio.volume = ambientVolume;
    }
  }, [ambientVolume]);

  // Declarative ambient audio sync hook (eliminates race conditions and supports seamless source transitions)
  useEffect(() => {
    const audio = lofiAudioRef.current;
    if (!audio) return;

    if (!ambientPlaying) {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    let soundUrl = '';
    if (ambientType === 'lofi') {
      soundUrl = '/lofi.mp3';
    } else if (ambientType === 'rain') {
      soundUrl = '/rain.mp3';
    } else if (ambientType === 'custom') {
      soundUrl = customAudioUrl;
    }

    if (!soundUrl) {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    const triggerPlay = async () => {
      try {
        const absoluteSoundUrl = soundUrl.startsWith('blob:')
          ? soundUrl
          : new URL(soundUrl, window.location.href).href;

        if (audio.src !== absoluteSoundUrl) {
          audio.removeAttribute('crossorigin');
          audio.src = absoluteSoundUrl;
        }
        
        audio.volume = ambientVolume;
        audio.loop = true;

        if (audio.paused) {
          await audio.play();
        }
      } catch (err) {
        console.warn("Ambient play was blocked or interrupted: ", err);
        setAmbientPlaying(false);
      }
    };

    triggerPlay();
  }, [ambientPlaying, ambientType, customAudioUrl, ambientVolume]);

  const handleToggleAmbient = () => {
    if (ambientPlaying) {
      setAmbientPlaying(false);
    } else {
      if (ambientType === 'custom' && !customAudioUrl) {
        setShowCustomMusicSetup(true);
        return;
      }
      setAmbientPlaying(true);
    }
  };

  // Switch sound types
  const handleTypeChange = (newType: 'lofi' | 'rain' | 'custom') => {
    setAmbientType(newType);
    if (newType === 'custom' && !customAudioUrl) {
      setShowCustomMusicSetup(true);
    }
  };

  const cycleNext = () => {
    let nextType: 'lofi' | 'rain' | 'custom' = 'lofi';
    if (ambientType === 'lofi') nextType = 'rain';
    else if (ambientType === 'rain') nextType = 'custom';
    handleTypeChange(nextType);
  };

  const cyclePrev = () => {
    let prevType: 'lofi' | 'rain' | 'custom' = 'lofi';
    if (ambientType === 'lofi') prevType = 'custom';
    else if (ambientType === 'custom') prevType = 'rain';
    handleTypeChange(prevType);
  };

  const handleCustomFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileId = 'file_' + Date.now().toString();
      const fileUrl = URL.createObjectURL(file);
      
      const newTrack = {
        id: fileId,
        name: file.name,
        url: fileUrl,
        isLocal: true,
        fromIndexedDB: true
      };

      setCustomPlaylist(prev => [...prev, newTrack]);
      setCustomAudioUrl(fileUrl);
      setCustomAudioName(file.name);
      setTempSaveName(file.name);
      setAmbientType('custom');

      // Save to IndexedDB in the background so storage restrictions don't block immediate playback
      saveMp3File(fileId, file.name, file).catch(err => {
        console.warn("Error saving to IndexedDB, continuing with current session:", err);
      });
    }
  };

  const handleCustomUrlChange = (urlStr: string) => {
    setCustomAudioUrl(urlStr);
    const friendlyName = urlStr;
    setCustomAudioName(friendlyName);
    setTempSaveName(friendlyName);
  };

  const handleRemoveTrack = async (trackId: string, trackUrl: string) => {
    if (trackUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(trackUrl);
      } catch {}
      try {
        await deleteMp3File(trackId);
      } catch (err) {
        console.error("IndexedDB delete failed:", err);
      }
    }

    const updated = customPlaylist.filter(t => t.id !== trackId);
    setCustomPlaylist(updated);

    const onlineOnly = updated.filter(t => t.id !== 'p1' && t.id !== 'p2' && !t.url.startsWith('blob:'));
    localStorage.setItem('serene_custom_playlist_online', JSON.stringify(onlineOnly));

    if (customAudioUrl === trackUrl) {
      setCustomAudioUrl('');
      setCustomAudioName('');
      if (ambientType === 'custom') {
        setAmbientPlaying(false);
      }
    }
  };

  // Synchronize values with storage
  useEffect(() => {
    localStorage.setItem('serene_ambient_type', ambientType);
  }, [ambientType]);

  useEffect(() => {
    localStorage.setItem('serene_ambient_volume', String(ambientVolume));
  }, [ambientVolume]);

  useEffect(() => {
    localStorage.setItem('serene_custom_audio_url', customAudioUrl);
  }, [customAudioUrl]);

  useEffect(() => {
    localStorage.setItem('serene_custom_audio_name', customAudioName);
  }, [customAudioName]);

  // Clean source on unmount
  useEffect(() => {
    return () => {
      if (lofiAudioRef.current) {
        try {
          lofiAudioRef.current.pause();
        } catch {}
      }
    };
  }, []);

  // Listen to keyboard shortcut event trigger play/pause
  useEffect(() => {
    const handleToggleEvent = () => {
      handleToggleAmbient();
    };
    window.addEventListener('serene-toggle-audio', handleToggleEvent);
    return () => {
      window.removeEventListener('serene-toggle-audio', handleToggleEvent);
    };
  }, [ambientPlaying, ambientType, customAudioUrl]);

  return (
    <div 
      className="relative flex items-center z-50" 
      id="ambient-sound-board-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <audio
        ref={lofiAudioRef}
        loop
        preload="auto"
        className="hidden"
        id="serene-ambient-audio-element"
      />
      <div 
        className="flex items-center bg-black/40 border border-white/5 py-1.5 px-3 rounded-full shadow-lg transition-all duration-300" 
        id="ambient-sound-board"
      >
        {/* Main Icon Trigger */}
        <button
          onClick={() => setShowCustomMusicSetup(prev => !prev)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            ambientPlaying ? 'bg-amber-300 text-slate-950 scale-105 shadow' : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
          title={t.configureMusic}
          id="btn-toggle-acoustic"
        >
          {ambientPlaying ? <Volume2 size={13} strokeWidth={2.5} /> : <VolumeX size={13} />}
        </button>

        {/* Hover Sub Menu Option list */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center gap-2 overflow-hidden"
              id="ambient-hover-expansion-track"
            >
              <span className="w-[1px] h-3 bg-white/10 shrink-0" />
              
              {/* Prev Button */}
              <button
                onClick={cyclePrev}
                className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={t.previousTrack}
                id="btn-hover-ambient-prev"
              >
                <SkipBack size={10} />
              </button>

              {/* Play Pause Stop Toggle */}
              <button
                onClick={handleToggleAmbient}
                className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={ambientPlaying ? t.mute : t.play}
                id="btn-hover-ambient-playpause"
              >
                {ambientPlaying ? <Pause size={10} /> : <Play size={10} />}
              </button>

              {/* Next Button */}
              <button
                onClick={cycleNext}
                className="w-5 h-5 rounded hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title={t.nextTrack}
                id="btn-hover-ambient-next"
              >
                <SkipForward size={10} />
              </button>

              <span className="w-[1px] h-3 bg-white/10 shrink-0" />

              {/* Volume sliders */}
              <div className="flex items-center gap-1.5 shrink-0" id="ambient-slider-contain">
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={ambientVolume}
                  onChange={e => setAmbientVolume(Number(e.target.value))}
                  className="w-16 h-1 w-[64px] accent-amber-300 cursor-pointer bg-white/35 rounded-lg appearance-none hover:bg-white/50 transition-colors border-none outline-none focus:outline-none"
                  title={t.volumeSlider}
                  id="hover-ambient-volume-slider"
                />
              </div>

              {/* Active Sound Indicator Label */}
              <span className="text-[9px] text-amber-300 font-mono font-medium tracking-wide translate-y-[0px] select-none uppercase truncate max-w-[50px] shrink-0">
                {t.types[ambientType] || ambientType}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimal sound status fallback indicator label with sound waves when not hovered */}
        {!isHovered && (
          <div className="flex items-center gap-2 ml-2 select-none animate-fade-in" id="lbl-ambient-mute">
            {ambientPlaying ? (
              <div className="flex items-center gap-1.5">
                <div className="sound-wave-container text-amber-300 scale-[0.65] origin-left" title={t.soundPlaying}>
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                </div>
                <span className="text-[9px] text-amber-300 font-sans font-medium uppercase tracking-wider block">
                  {t.types[ambientType] || ambientType}
                </span>
              </div>
            ) : (
              <span className="text-[9px] text-slate-400 font-sans uppercase font-medium tracking-wide">
                {t.focus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Popover Custom setup controls */}
      <AnimatePresence>
        {showCustomMusicSetup && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-11 z-[999] w-80 bg-slate-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-fade-in text-left flex flex-col gap-3.5 max-h-[80vh] overflow-y-auto custom-scrollbar"
            id="custom-music-popover-panel"
          >
            <div className="flex justify-between items-center" id="popover-header">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 animate-pulse" id="popover-title">
                <Music size={12} className="text-amber-300" /> {t.setupTitle}
              </span>
              {ambientPlaying && (
                <div className="sound-wave-container text-amber-300 pr-1 select-none flex scale-[0.75] origin-right">
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                  <span className="sound-wave-bar sound-wave-active" />
                </div>
              )}
              <button
                onClick={() => setShowCustomMusicSetup(false)}
                className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                id="popover-close-btn"
              >
                {t.close}
              </button>
            </div>

            <div className="space-y-3.5" id="popover-body">
              {/* Selector Presets first */}
              <div className="space-y-1.5" id="sec-presets-selector">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block" id="lbl-presets-type">
                  {t.preloadedSoundscapes}
                </label>
                <div className="grid grid-cols-3 gap-1" id="presets-type-chips">
                  {(['lofi', 'rain', 'custom'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`py-1 text-[10px] rounded font-medium capitalize text-center cursor-pointer transition-colors ${
                        ambientType === type
                          ? 'bg-white/15 text-white font-semibold border border-white/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-transparent'
                      }`}
                    >
                      {t.types[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Custom Stream & Playlist Section if custom is click selected */}
              {ambientType === 'custom' && (
                <>
                  {/* Local File Selector */}
                  <div className="space-y-1.5" id="sec-custom-file">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider" id="lbl-custom-file">
                      {t.chooseLocalFile}
                    </label>
                    <div className="relative w-full" id="file-uploader-wrap">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleCustomFileChange}
                        className="hidden"
                        id="input-custom-audio-file"
                      />
                      <label
                        htmlFor="input-custom-audio-file"
                        className="flex items-center justify-center gap-1.5 w-full bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg py-1.5 px-3 text-xs text-slate-300 font-medium cursor-pointer transition-colors text-center"
                        id="btn-choose-file-label"
                      >
                        <Upload size={12} /> {t.fileUpload}
                      </label>
                    </div>
                  </div>

                  {/* Save to Playlist Form if there's an active music source loaded but NOT yet saved in the list */}
                  {customAudioUrl && (
                    <div className="p-2 ml-[1px] rounded-xl bg-white/[0.02] border border-white/5 space-y-2" id="playlist-save-block">
                      <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                        {t.addToPlaylist}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder={t.trackLabelPlaceholder}
                          value={tempSaveName}
                          onChange={(e) => setTempSaveName(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/5 rounded-lg py-1 px-2 text-[11px] text-slate-200 focus:outline-none focus:border-white/20"
                          id="playlist-track-name-input"
                        />
                        <button
                          onClick={() => {
                            const trimmedName = tempSaveName.trim() || customAudioName.trim() || t.types.custom;
                            const alreadyExistIndex = customPlaylist.findIndex(t => t.url === customAudioUrl);
                            let updated = [...customPlaylist];

                            if (alreadyExistIndex !== -1) {
                              updated[alreadyExistIndex] = {
                                ...updated[alreadyExistIndex],
                                name: trimmedName
                              };
                            } else {
                              updated.push({
                                id: 'url_' + Date.now().toString(),
                                name: trimmedName,
                                url: customAudioUrl,
                                isLocal: customAudioUrl.startsWith('blob:')
                              });
                            }
                            setCustomPlaylist(updated);
                            setCustomAudioName(trimmedName);

                            const onlineOnly = updated.filter(t => t.id !== 'p1' && t.id !== 'p2' && !t.url.startsWith('blob:'));
                            localStorage.setItem('serene_custom_playlist_online', JSON.stringify(onlineOnly));
                          }}
                          className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer select-none"
                        >
                          {t.save}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Playlist Tracker Grid */}
                  <div className="space-y-1.5 pt-1.5 border-t border-white/5" id="saved-playlist-container">
                    <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                      {t.myPlaylist}
                    </label>
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-0.5" id="saved-playlist-inner">
                      {customPlaylist.map(track => {
                        const isCurrentActive = customAudioUrl === track.url;
                        return (
                          <div 
                            key={track.id} 
                            className={`flex items-center justify-between p-2 rounded-lg text-[11px] leading-tight transition-all ${
                              isCurrentActive 
                                ? 'bg-white/10 border border-white/15 text-white' 
                                : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:bg-white/[0.05]'
                            }`}
                          >
                            <button
                              onClick={() => {
                                handleCustomUrlChange(track.url);
                                setCustomAudioName(track.name);
                                setAmbientType('custom');
                              }}
                              className="flex-1 text-left select-none cursor-pointer pr-2 truncate flex items-center gap-1.5 border-none bg-transparent outline-none focus:outline-none"
                            >
                              <div className={`w-1 h-1 rounded-full ${isCurrentActive ? 'bg-amber-300' : 'bg-slate-600'}`} />
                              <span className="truncate">{track.name}</span>
                              {track.isLocal && (
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-[1px] rounded shrink-0 scale-90 border border-emerald-500/20">
                                  MP3
                                </span>
                              )}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTrack(track.id, track.url);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                              title={t.deleteItem}
                            >
                              <Trash size={11} />
                            </button>
                          </div>
                        );
                      })}
                      {customPlaylist.length === 0 && (
                        <div className="text-[10px] text-slate-600 italic py-1.5 text-center">
                          {t.noSavedTracks}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Help Text for standard flow */}
              {ambientType !== 'custom' && (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 text-[11px]" id="sec-playing-status-info">
                  {ambientType === 'lofi' ? (
                    <div className="text-slate-300 flex items-center gap-1.5" id="lofi-desc">
                      <Music size={11} className="text-amber-300" />
                      {t.playingLofi}
                    </div>
                  ) : (
                    <div className="text-slate-300 flex items-center gap-1.5" id="rain-desc">
                      <Music size={11} className="text-sky-300" />
                      {t.playingRain}
                    </div>
                  )}
                </div>
              )}

              {/* Custom Track Status Overlay indicator */}
              {ambientType === 'custom' && customAudioName && (
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 text-[11px]" id="custom-track-status-wrap">
                  <div className="text-slate-400 uppercase text-[9px] font-semibold tracking-wide">
                    {t.customActive}
                  </div>
                  <div className="text-slate-300 font-medium line-clamp-1 break-all flex items-center gap-1.5 mt-0.5" id="val-track-name">
                    <FileAudio size={11} className="text-emerald-400 shrink-0" />
                    {customAudioName}
                  </div>
                  <button
                    onClick={() => {
                      if (customAudioUrl && customAudioUrl.startsWith('blob:')) {
                        try {
                          URL.revokeObjectURL(customAudioUrl);
                        } catch {}
                      }
                      setCustomAudioUrl('');
                      setCustomAudioName('');
                      if (ambientType === 'custom') {
                        setAmbientPlaying(false);
                      }
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-medium mt-1.5 inline-block cursor-pointer"
                    id="btn-clear-custom-source"
                  >
                    {t.clearSource}
                  </button>
                </div>
              )}

              <div className="text-[9.5px] text-slate-500 leading-relaxed font-sans font-medium pt-1" id="help-text">
                {t.helpText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
