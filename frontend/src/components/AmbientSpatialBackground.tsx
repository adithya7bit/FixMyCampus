import React, { useEffect, useRef } from 'react'

export const AmbientSpatialBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = mouseX
    let targetMouseY = mouseY

    let lastScrollY = window.scrollY
    let scrollVelocity = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = Math.max(Math.min((currentScrollY - lastScrollY) * 0.35, 15), -15)
      lastScrollY = currentScrollY
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    // Particle field with pseudo-3D Z-depth
    interface Particle {
      x: number
      y: number
      z: number // Depth: 0.2 (distant) to 1.0 (near)
      radius: number
      baseRadius: number
      color: string
      vx: number
      vy: number
      pulse: number
      pulseSpeed: number
    }

    const particleCount = Math.min(Math.floor((width * height) / 32000), 55)
    const colors = [
      'rgba(6, 182, 212, ', // Cyan
      'rgba(56, 189, 248, ', // Sky
      'rgba(99, 102, 241, ', // Indigo
      'rgba(16, 185, 129, '  // Emerald
    ]

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const z = 0.2 + Math.random() * 0.8
      const baseRadius = 0.8 + z * 1.6
      const colorBase = colors[Math.floor(Math.random() * colors.length)]

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: baseRadius,
        baseRadius,
        color: colorBase,
        vx: (Math.random() - 0.5) * 0.3 * z,
        vy: (Math.random() - 0.5) * 0.3 * z,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02
      }
    })

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const offsetX = (mouseX / width - 0.5) * 35
      const offsetY = (mouseY / height - 0.5) * 35

      // Dampen scroll velocity smoothly
      scrollVelocity *= 0.92

      particles.forEach((p) => {
        // Move with velocity & 3D scroll depth response
        p.x += p.vx
        p.y += p.vy - scrollVelocity * p.z * 0.9

        // Wrap around boundaries
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        p.pulse += p.pulseSpeed
        const currentOpacity = 0.12 + p.z * 0.28 + Math.sin(p.pulse) * 0.08
        const parallaxX = p.x + offsetX * p.z
        const parallaxY = p.y + offsetY * p.z

        // Render soft glowing particle
        ctx.beginPath()
        ctx.arc(parallaxX, parallaxY, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${currentOpacity})`
        ctx.shadowColor = `${p.color}0.6)`
        ctx.shadowBlur = 6 * p.z
        ctx.fill()
      })

      ctx.shadowBlur = 0
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  )
}

export default AmbientSpatialBackground
