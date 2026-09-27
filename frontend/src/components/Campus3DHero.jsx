import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'motion/react'
import { 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Wrench, 
  Wifi, 
  UtensilsCrossed, 
  Activity, 
  ArrowRight,
  ChevronDown
} from 'lucide-react'

// Node taxonomy for 3D interactive satellite spheres
const INFRASTRUCTURE_NODES = [
  { id: 'electrical', name: 'Electrical & Power', color: 0x3b82f6, icon: '⚡', status: '98.5% Operational', issues: 2 },
  { id: 'civil_maintenance', name: 'Civil & Plumbing', color: 0x06b6d4, icon: '🔧', status: '1 Active Leak', issues: 1 },
  { id: 'it_network', name: 'IT Infrastructure', color: 0x8b5cf6, icon: '📶', status: '10 Gbps Backbone', issues: 1 },
  { id: 'food_services', name: 'Food Hygiene & Mess', color: 0xf59e0b, icon: '🍽️', status: 'Grade A Certified', issues: 1 },
  { id: 'hostel', name: 'Hostel Affairs', color: 0xec4899, icon: '🏢', status: 'Lock Maintenance', issues: 1 },
  { id: 'security', name: 'Campus Safety', color: 0x10b981, icon: '🛡️', status: 'All Gates Secure', issues: 0 }
]

export default function Campus3DHero({
  currentUser,
  activeRole,
  onOpenReportModal,
  onSwitchToAdmin,
  totalComplaints,
  openComplaints,
  avgResolutionTime
}) {
  const mountRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 16)

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // 3. Central Holographic Campus Core (Dual layered wireframe icosahedron)
    const coreGroup = new THREE.Group()
    scene.add(coreGroup)

    const innerGeo = new THREE.IcosahedronGeometry(2.4, 2)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      roughness: 0.2
    })
    const innerCore = new THREE.Mesh(innerGeo, innerMat)
    coreGroup.add(innerCore)

    // Solid inner core with fresnel-like sheen
    const solidGeo = new THREE.IcosahedronGeometry(1.6, 1)
    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.4
    })
    const solidCore = new THREE.Mesh(solidGeo, solidMat)
    coreGroup.add(solidCore)

    // Glowing orbital rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    })
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.25, 64), ringMat)
    ring1.rotation.x = Math.PI / 3
    coreGroup.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.24, 64), ringMat)
    ring2.rotation.y = Math.PI / 4
    ring2.rotation.x = -Math.PI / 6
    coreGroup.add(ring2)

    // 4. Orbiting Infrastructure Satellite Spheres
    const satellites = []
    const raycastMeshes = []

    INFRASTRUCTURE_NODES.forEach((node, i) => {
      const angle = (i / INFRASTRUCTURE_NODES.length) * Math.PI * 2
      const radius = 6.2

      const satGroup = new THREE.Group()
      satGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5) * 1.2,
        Math.sin(angle) * radius
      )

      // Main sphere
      const sphereGeo = new THREE.SphereGeometry(0.48, 24, 24)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.2,
        metalness: 0.7,
        emissive: node.color,
        emissiveIntensity: 0.5
      })
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
      sphereMesh.userData = { nodeData: node }
      satGroup.add(sphereMesh)

      // Outer glowing halo
      const haloGeo = new THREE.RingGeometry(0.65, 0.72, 32)
      const haloMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      })
      const halo = new THREE.Mesh(haloGeo, haloMat)
      satGroup.add(halo)

      coreGroup.add(satGroup)
      satellites.push({ group: satGroup, halo, baseAngle: angle, radius, mesh: sphereMesh })
      raycastMeshes.push(sphereMesh)
    })

    // 5. Starfield / Floating Data Packets
    const particleCount = 700
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35
      positions[i + 1] = (Math.random() - 0.5) * 35
      positions[i + 2] = (Math.random() - 0.5) * 35

      // Cyan to blue color tint
      colors[i] = 0.2 + Math.random() * 0.3
      colors[i + 1] = 0.5 + Math.random() * 0.5
      colors[i + 2] = 0.9 + Math.random() * 0.1
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    })
    const particleSystem = new THREE.Points(particleGeo, particleMat)
    scene.add(particleSystem)

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x3b82f6, 4, 30)
    pointLight1.position.set(5, 5, 8)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xa855f7, 3, 30)
    pointLight2.position.set(-6, -4, 6)
    scene.add(pointLight2)

    // 7. Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-1000, -1000)
    const targetCameraPos = new THREE.Vector2(0, 0)

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Parallax camera tilt
      targetCameraPos.x = mouse.x * 1.5
      targetCameraPos.y = mouse.y * 1.2
    }

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(raycastMeshes)
      if (intersects.length > 0) {
        setSelectedNode(intersects[0].object.userData.nodeData)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('click', handleClick)

    // 8. Animation Loop
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Core rotation
      coreGroup.rotation.y = elapsed * 0.12
      coreGroup.rotation.x = Math.sin(elapsed * 0.1) * 0.15

      // Inner wireframe counter-rotation
      innerCore.rotation.y = -elapsed * 0.2
      innerCore.rotation.z = elapsed * 0.15

      // Particle drifting
      particleSystem.rotation.y = elapsed * 0.02
      particleSystem.rotation.x = Math.cos(elapsed * 0.015) * 0.05

      // Satellite orbital pulsation & face camera
      satellites.forEach((sat, idx) => {
        sat.halo.lookAt(camera.position)
        // Gentle vertical bobbing
        sat.group.position.y = Math.sin(elapsed * 1.5 + idx) * 0.4 + Math.sin(sat.baseAngle * 1.5) * 1.2
      })

      // Smooth camera interpolation for fluid feel
      camera.position.x += (targetCameraPos.x - camera.position.x) * 0.05
      camera.position.y += (targetCameraPos.y - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)

      // Raycasting hover check
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(raycastMeshes)
      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.nodeData
        setHoveredNode(hit)
        container.style.cursor = 'pointer'
      } else {
        setHoveredNode(null)
        container.style.cursor = 'default'
      }

      renderer.render(scene, camera)
    }

    animate()

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup resources to prevent WebGL context loss
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('click', handleClick)

      // Dispose Three.js geometries and materials
      innerGeo.dispose()
      innerMat.dispose()
      solidGeo.dispose()
      solidMat.dispose()
      ringMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{
      position: 'relative',
      minHeight: '720px',
      overflow: 'hidden',
      borderRadius: 'var(--radius-xl)',
      margin: '0 auto 2.5rem',
      maxWidth: 1280,
      background: 'radial-gradient(ellipse at top center, rgba(30, 58, 138, 0.25) 0%, rgba(7, 11, 18, 0.95) 75%)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
    }}>
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={mountRef} 
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'auto'
        }} 
      />

      {/* Hero Foreground Content Layer */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        alignItems: 'center',
        minHeight: '720px',
        padding: '3rem 2.5rem'
      }}>
        {/* Left Column: Mission, Headlines & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'auto', maxWidth: 640 }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            backdropFilter: 'blur(10px)',
            marginBottom: '1.25rem'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }} className="beacon" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.05em' }}>
              CAMPUS DISPATCH 3.0 • CLOSED-LOOP RESOLUTION
            </span>
          </div>

          {/* Headline with Gradient */}
          <h1 style={{
            fontSize: '3.1rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.2rem',
            color: '#ffffff'
          }}>
            Report in Seconds. <br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 10px rgba(59, 130, 246, 0.3))'
            }}>
              Verify in 3D.
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: 540
          }}>
            FixMyCampus bridges students directly to department engineers. Features real-time AI auto-routing, proactive duplicate detection, SLA auto-escalation, and closed-loop student verification.
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={onOpenReportModal}
              className="btn-primary"
              style={{
                fontSize: '1.05rem',
                padding: '0.9rem 1.8rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 30px rgba(37, 99, 235, 0.5)'
              }}
            >
              <PlusCircle size={22} />
              Report Campus Issue
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={onSwitchToAdmin}
              className="btn-secondary"
              style={{
                fontSize: '0.95rem',
                padding: '0.85rem 1.4rem',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.06)'
              }}
            >
              <ShieldCheck size={18} color="#a78bfa" />
              Admin Operations Center
            </motion.button>
          </div>

          {/* Floating Telemetry Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-medium)',
            maxWidth: 520
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CAMPUS TICKETS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{totalComplaints}</div>
              <div style={{ fontSize: '0.68rem', color: '#60a5fa' }}>{openComplaints} in queue</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SLA COMPLIANCE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>97.8%</div>
              <div style={{ fontSize: '0.68rem', color: '#34d399' }}>Within target</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG RESOLUTION</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{avgResolutionTime}h</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Response time</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Hologram Overlay & Interactive Node Inspector */}
        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          {/* Real-time 3D Node Hover Card */}
          <AnimatePresence>
            {hoveredNode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
                  width: 290,
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{hoveredNode.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {hoveredNode.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                      Interactive 3D Mesh Active
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                  <span>Status:</span>
                  <strong style={{ color: '#34d399' }}>{hoveredNode.status}</strong>
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                  Click node to filter department tickets
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Hint */}
          <div style={{
            padding: '0.5rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <Sparkles size={14} color="#60a5fa" />
            <span>Interactive WebGL 3D Canvas • Drag to Tilt • Hover Nodes</span>
          </div>
        </div>
      </div>

      {/* Bottom Live Campus Ticker Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: 'rgba(7, 11, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            <span>⚡ Electrical Grid: <strong>98.5% Nominal</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            <span>💧 Water Supply: <strong>Pressure Normal</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} />
            <span>📶 Campus Wi-Fi: <strong>All APs Online</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <span>🍽️ Food Services: <strong>Audit Score 100 (Grade A)</strong></span>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Real-time University Telemetry Feed
        </div>
      </div>
    </div>
  )
}
