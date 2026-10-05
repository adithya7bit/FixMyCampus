import React, { useState, useEffect } from 'react'

export const CountdownTimer: React.FC = () => {
  // Target deadline
  const targetDate = new Date('2026-10-08T09:00:00')

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        return
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24))
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0')
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds }
  ]

  return (
    <div className="space-y-2">
      {/* Registration Deadline Subheading */}
      <div className="flex items-center gap-2 text-xs font-mono-code font-bold tracking-widest text-[#ff2a85] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] animate-ping" />
        <span>REGISTRATION DEADLINE</span>
        <span className="text-slate-400 font-normal">24 SEPT 2026 • 23:59 IST</span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-sm sm:max-w-md">
        {units.map((u, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="countdown-box w-full aspect-[4/4.5] flex items-center justify-center p-2 rounded-xl border border-white/10">
              <span className="font-mono-code font-extrabold text-2xl sm:text-4xl text-white tracking-wider">
                {u.value}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-mono-code font-bold text-slate-400 tracking-widest mt-2 uppercase">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CountdownTimer
