import React, { useState } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  maxTilt?: number // Maximum tilt in degrees (default 6)
  glareColor?: string // Glare tint (default cyan)
  onClick?: () => void
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  innerClassName = '',
  maxTilt = 6,
  glareColor = 'rgba(6, 182, 212, 0.15)',
  onClick
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setRotate({
      x: -(y - 0.5) * maxTilt * 2,
      y: (x - 0.5) * maxTilt * 2
    })
    setGlarePos({ x: x * 100, y: y * 100 })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        transform: isHovered
          ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-3px)`
          : 'rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d'
      }}
      className={`relative rounded-2xl will-change-transform ${className}`}
    >
      {/* Specular Spotlight Glare */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-150 z-20"
          style={{
            background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, ${glareColor}, transparent 75%)`
          }}
        />
      )}

      {/* Card Content Shell */}
      <div 
        className={`relative z-10 w-full h-full ${innerClassName}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  )
}

export default TiltCard
