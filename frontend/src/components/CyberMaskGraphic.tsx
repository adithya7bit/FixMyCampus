import React from 'react'

export const CyberMaskGraphic: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
      {/* Outer Ambient Glow Rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff2a85]/20 via-[#9d4edd]/20 to-[#00f0ff]/10 blur-3xl animate-pulse" />
      
      {/* Circular Target Lines */}
      <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="185" stroke="#9d4edd" strokeWidth="1" strokeDasharray="6 8" strokeOpacity="0.4" />
        <circle cx="200" cy="200" r="160" stroke="#ff2a85" strokeWidth="1.5" strokeOpacity="0.3" />
        
        {/* Japanese Cyber Kanji Marker */}
        <text x="368" y="206" fill="#ff2a85" fontSize="16" fontFamily="sans-serif" fontWeight="bold">侍</text>

        {/* Cyberpunk Oni Mask Illustration (Clean Glowing Vectors) */}
        <g transform="translate(60, 45)">
          {/* Flame Hair Horns */}
          <path 
            d="M 90 40 C 70 -10, 40 20, 20 60 C 50 50, 70 80, 80 110 C 95 60, 120 10, 140 -20 C 160 30, 180 80, 200 110 C 210 70, 230 40, 260 60 C 240 10, 210 -15, 190 40 Z" 
            fill="none" 
            stroke="url(#neonGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          
          {/* Main Face Contour */}
          <path 
            d="M 40 110 C 30 160, 45 220, 90 260 C 120 285, 160 285, 190 260 C 235 220, 250 160, 240 110" 
            fill="none" 
            stroke="#ff2a85" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Cybernetic Eye Right (Optic HUD) */}
          <circle cx="85" cy="150" r="18" stroke="#00f0ff" strokeWidth="2.5" />
          <circle cx="85" cy="150" r="8" fill="#00f0ff" />
          <line x1="60" y1="150" x2="110" y2="150" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="85" y1="125" x2="85" y2="175" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Organic Eye Left (Fierce Demon Slit) */}
          <path 
            d="M 160 145 Q 195 130 215 155 Q 190 165 160 145 Z" 
            fill="none" 
            stroke="#ff2a85" 
            strokeWidth="3" 
          />
          <circle cx="190" cy="148" r="4.5" fill="#ff2a85" />

          {/* Cyber Gas Mask Respirator & Fangs */}
          <path 
            d="M 95 190 L 140 180 L 185 190 L 175 240 L 140 255 L 105 240 Z" 
            fill="none" 
            stroke="#9d4edd" 
            strokeWidth="3" 
          />
          
          {/* Teeth / Grill */}
          <path d="M 115 210 L 125 230 L 135 210 L 145 230 L 155 210 L 165 230" stroke="#ff2a85" strokeWidth="2.5" strokeLinecap="round" />

          {/* Cyber Neck Wires */}
          <path d="M 70 230 Q 90 290 140 300 Q 190 290 210 230" fill="none" stroke="#9d4edd" strokeWidth="2" strokeDasharray="4 6" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff2a85" />
            <stop offset="50%" stopColor="#9d4edd" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default CyberMaskGraphic
