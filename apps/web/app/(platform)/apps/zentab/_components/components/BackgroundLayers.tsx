/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BackgroundLayersProps {
  currentBgUrl: string;
  bgImageOverlay: string | null;
  overlayActive: boolean;
  widgetsVisible: boolean;
  bgBlurIntensity: number;
}

export default function BackgroundLayers({
  currentBgUrl,
  bgImageOverlay,
  overlayActive,
  widgetsVisible,
  bgBlurIntensity,
}: BackgroundLayersProps) {
  return (
    <>
      {/* --- BACKDROP IMAGE TRANSITIONS LAYERS --- */}
      <div 
        style={{ backgroundImage: `url(${currentBgUrl})` }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-102 filter transition-all duration-[2000ms] ease-out select-none pointer-events-none"
        id="bg-layer-base"
      />
      {bgImageOverlay && (
        <div 
          style={{ 
            backgroundImage: `url(${bgImageOverlay})`,
            opacity: overlayActive ? 1.0 : 0
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-[1] scale-102 filter transition-opacity duration-[2000ms] ease-out select-none pointer-events-none"
          id="bg-layer-overlay"
        />
      )}

      {/* Hardware-accelerated blurred backdrop overlay with cross-fade opacity */}
      <div
        style={{ 
          backdropFilter: `blur(${bgBlurIntensity}px)`, 
          WebkitBackdropFilter: `blur(${bgBlurIntensity}px)`,
          opacity: widgetsVisible ? 1.0 : 0
        }}
        className="absolute inset-0 z-[1] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/45 select-none pointer-events-none"
        id="app-glass-backdrop-blurred"
      />
      {/* Gentle hardware-accelerated background dark-dimmer layer in zen focus mode */}
      <div
        style={{
          opacity: widgetsVisible ? 0 : 1.0
        }}
        className="absolute inset-0 z-[1] transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/25 select-none pointer-events-none"
        id="app-glass-backdrop-clear"
      />
    </>
  );
}
