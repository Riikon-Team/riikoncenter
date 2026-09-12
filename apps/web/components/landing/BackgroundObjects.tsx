"use client";
import { motion } from "motion/react";

export function HeroBackgroundObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 text-foreground/20">
      {/* Abstract floating shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[10%] w-32 h-32 border border-current rounded-3xl"
      />
      
      {/* Triangle */}
      <motion.svg 
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[25%] right-[20%] w-24 h-24 stroke-current fill-none opacity-80"
        viewBox="0 0 100 100"
      >
        <polygon points="50,10 90,90 10,90" strokeWidth="2" strokeLinejoin="round"/>
      </motion.svg>

      {/* Large Hollow Circle */}
      <motion.div
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-[5%] right-[15%] w-64 h-64 border-[2px] border-current opacity-20 rounded-full"
      />

      {/* Rotating Dashed Circle */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[10%] left-[15%] w-48 h-48 border-[1.5px] border-dashed border-current opacity-30 rounded-full"
      />

      {/* Semi-circle */}
      <motion.svg
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[15%] right-[40%] w-32 h-32 stroke-current fill-none opacity-50"
        viewBox="0 0 100 100"
      >
        <path d="M 10,50 A 40,40 0 0,0 90,50" strokeWidth="3" strokeLinecap="round" />
      </motion.svg>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] right-[25%] w-12 h-12 bg-muted/50 rounded-xl"
      />
      
      {/* Plus shape */}
      <motion.svg
        animate={{ y: [0, 25, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[40%] left-[30%] w-16 h-16 stroke-current fill-none opacity-40"
        viewBox="0 0 100 100"
      >
        <line x1="50" y1="10" x2="50" y2="90" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="50" x2="90" y2="50" strokeWidth="3" strokeLinecap="round" />
      </motion.svg>

      {/* Staggered Lines */}
      <motion.div 
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[8%] flex flex-col gap-2 opacity-30"
      >
        <div className="w-16 h-[2px] bg-current rounded-full" />
        <div className="w-10 h-[2px] bg-current rounded-full ml-6" />
        <div className="w-20 h-[2px] bg-current rounded-full" />
      </motion.div>

      <motion.div
        animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-current opacity-60"
      />
    </div>
  );
}

export function AppsBackgroundObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 text-foreground/15">
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-12 w-64 h-64 border border-current rounded-full"
      />
      
      {/* Hexagon */}
      <motion.svg
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-[10%] w-48 h-48 stroke-current fill-none"
        viewBox="0 0 100 100"
      >
        <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" strokeWidth="1" strokeLinejoin="round" />
      </motion.svg>

      {/* Quarter Arch */}
      <motion.svg
        animate={{ rotate: [0, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[15%] right-[25%] w-40 h-40 stroke-current fill-none opacity-40"
        viewBox="0 0 100 100"
      >
        <path d="M 10,90 A 80,80 0 0,1 90,10" strokeWidth="2" strokeLinecap="round" />
        <path d="M 30,90 A 60,60 0 0,1 90,30" strokeWidth="2" strokeLinecap="round" strokeDasharray="5,5" />
      </motion.svg>

      {/* Dotted grid decorative */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-1/4 w-32 h-32"
        style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 0)', backgroundSize: '12px 12px' }}
      />

      {/* 1. Rotating Settings Gear/Star */}
      <motion.svg
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 left-[20%] w-20 h-20 stroke-current fill-none opacity-30"
        viewBox="0 0 100 100"
      >
        <path d="M50 10 L60 30 L80 30 L65 45 L75 65 L50 55 L25 65 L35 45 L20 30 L40 30 Z" strokeWidth="2" strokeLinejoin="round" />
      </motion.svg>
      {/* 2. Pulsing Rounded Rectangle */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[40%] right-[15%] w-24 h-16 border-2 border-current rounded-2xl"
      />
      {/* 3. Floating Cross */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[20%] left-[30%] w-10 h-10 opacity-40"
      >
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-current -translate-x-1/2 rounded-full"></div>
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-current -translate-y-1/2 rounded-full"></div>
      </motion.div>
    </div>
  );
}

export function ToolsBackgroundObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 text-foreground/15">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-current rounded-full border-dashed"
      />
      
      {/* Orbiting element */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute top-0 left-1/2 w-4 h-4 rounded-full bg-border -translate-x-1/2 -translate-y-1/2"></div>
      </motion.div>

      {/* Diamond / Starburst Cross */}
      <motion.svg
        animate={{ rotate: [0, 45, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-[15%] w-32 h-32 stroke-current fill-none opacity-40"
        viewBox="0 0 100 100"
      >
        <polygon points="50,5 60,40 95,50 60,60 50,95 40,60 5,50 40,40" strokeWidth="2" strokeLinejoin="round" />
      </motion.svg>

      {/* Radar rings */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeOut" }}
        className="absolute top-1/4 right-[20%] w-24 h-24 border border-current rounded-full"
      />
      <motion.div 
        animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeOut", delay: 1 }}
        className="absolute top-1/4 right-[20%] w-24 h-24 border border-current rounded-full"
      />

      {/* Corner crosshairs */}
      <div className="absolute top-12 left-12 w-8 h-8 opacity-50">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-current"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-current"></div>
      </div>
      <div className="absolute bottom-12 right-12 w-8 h-8 opacity-50">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-current"></div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-current"></div>
      </div>

      {/* 1. Floating Triangle Powerup */}
      <motion.svg
        animate={{ y: [0, -30, 0], rotate: [0, 360] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[25%] w-16 h-16 stroke-current fill-none opacity-50"
        viewBox="0 0 100 100"
      >
        <polygon points="50,15 90,85 10,85" strokeWidth="3" strokeLinejoin="round"/>
      </motion.svg>
      {/* 2. Pulsing Target Square */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [45, 225] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[30%] right-[30%] w-20 h-20 border-2 border-dashed border-current opacity-40"
      />
      {/* 3. Random floating particles (2 grouped) */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[40%] left-[40%] w-3 h-3 bg-current rounded-full opacity-60"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[40%] right-[40%] w-4 h-4 bg-current rounded-full opacity-40"
      />
    </div>
  );
}

export function TeamBackgroundObjects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 text-foreground/15">
      {/* Connected nodes (Networking/Team abstract) */}
      <motion.svg
        animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-64 h-64 stroke-current fill-none opacity-40"
        viewBox="0 0 100 100"
      >
        <circle cx="20" cy="20" r="4" strokeWidth="2" />
        <circle cx="80" cy="30" r="6" strokeWidth="2" />
        <circle cx="40" cy="80" r="5" strokeWidth="2" />
        <line x1="23" y1="23" x2="75" y2="28" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="22" y1="24" x2="38" y2="76" strokeWidth="1" strokeDasharray="3,3" />
        <line x1="77" y1="34" x2="44" y2="78" strokeWidth="1" strokeDasharray="3,3" />
      </motion.svg>

      {/* Floating concentric circles */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] left-[10%] w-32 h-32 rounded-full border-2 border-current border-dashed opacity-50 flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full border border-current opacity-70"></div>
      </motion.div>

      {/* 1. Linked Nodes 2 */}
      <motion.svg
        animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[10%] right-[30%] w-48 h-48 stroke-current fill-none opacity-30"
        viewBox="0 0 100 100"
      >
        <circle cx="30" cy="50" r="8" strokeWidth="2" />
        <circle cx="70" cy="50" r="8" strokeWidth="2" />
        <line x1="38" y1="50" x2="62" y2="50" strokeWidth="2" strokeDasharray="4,4" />
      </motion.svg>
      {/* 2. Radiating Ripples */}
      <motion.div
        animate={{ scale: [0.8, 1.5], opacity: [0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        className="absolute top-[30%] left-[20%] w-32 h-32 border border-current rounded-full"
      />
      {/* 3. Orbiting Data Point */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-[80%] w-40 h-40 border border-current rounded-full border-dashed opacity-20 -translate-y-1/2"
      >
        <div className="absolute top-0 left-1/2 w-4 h-4 bg-current rounded-full -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
      </motion.div>
    </div>
  );
}
