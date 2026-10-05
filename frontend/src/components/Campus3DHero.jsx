import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Sparkles, Activity, ShieldCheck, Zap, Wrench, Wifi, Utensils } from 'lucide-react'

export default function Campus3DHero({ onOpenReport }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const container = canvasRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.z = 7

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Central Campus Holographic Core (Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(1.8, 1)
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.8
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(coreMesh)

    // Inner Glow Core
    const innerGeometry = new THREE.SphereGeometry(1.0, 16, 16)
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    })
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial)
    scene.add(innerMesh)

    // Orbital Rings
    const ringGeometry = new THREE.TorusGeometry(3.0, 0.02, 16, 100)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.4
    })
    const ringMesh1 = new THREE.Mesh(ringGeometry, ringMaterial)
    ringMesh1.rotation.x = Math.PI / 3
    scene.add(ringMesh1)

    const ringMesh2 = new THREE.Mesh(ringGeometry, ringMaterial)
    ringMesh2.rotation.y = Math.PI / 4
    scene.add(ringMesh2)

    // Floating Department Satellites
    const departments = [
      { color: 0x06b6d4, pos: [2.8, 1.2, 0] },
      { color: 0x10b981, pos: [-2.6, 1.4, 0.5] },
      { color: 0xf59e0b, pos: [1.8, -2.2, 0.8] },
      { color: 0xec4899, pos: [-2.2, -1.8, -0.6] }
    ]

    const satellites = departments.map(d => {
      const geom = new THREE.SphereGeometry(0.2, 16, 16)
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        emissive: d.color,
        emissiveIntensity: 0.6,
        roughness: 0.2
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(...d.pos)
      scene.add(mesh)
      return mesh
    })

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 50)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    // Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      coreMesh.rotation.y = elapsedTime * 0.25
      coreMesh.rotation.x = elapsedTime * 0.15
      innerMesh.rotation.y = -elapsedTime * 0.35

      ringMesh1.rotation.z = elapsedTime * 0.1
      ringMesh2.rotation.z = -elapsedTime * 0.15

      // Wobble satellites in orbit
      satellites.forEach((sat, i) => {
        const offset = i * (Math.PI / 2)
        sat.position.y += Math.sin(elapsedTime * 2 + offset) * 0.003
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle Resize
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c1427]/80 via-[#090d1a]/80 to-[#07090e] p-6 lg:p-10 mb-8 shadow-2xl">
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-60 md:opacity-90 z-0 flex items-center justify-center"
      />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Autonomous Dispatch 3.0 • Live Campus Node
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Report Campus Issues. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Verify Resolution in 3D.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed font-normal">
          Direct connection between student reporters and facilities crews. 
          Real-time AI categorization, instant duplicate detection, proactive SLA escalation, 
          and closed-loop student sign-off.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Report Physical Issue</span>
          </button>

        </div>

        {/* Live Mini Telemetry Ticker */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Avg Dispatch</div>
            <div className="text-lg font-bold text-cyan-300 font-mono">14 Mins</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">SLA Adherence</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">98.4%</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Verified Fixes</div>
            <div className="text-lg font-bold text-white font-mono">100% Closed</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Telemetry Nodes</div>
            <div className="text-lg font-bold text-indigo-400 font-mono">6 Blocks</div>
          </div>
        </div>
      </div>
    </div>
  )
}
