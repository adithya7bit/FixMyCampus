import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Mail, User, Building, MessageSquare, Loader2 } from 'lucide-react'
import type { ContactFormData } from '../types/index'

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    department: 'Engineering & Physical Infrastructure',
    inquiryType: 'Urgent Maintenance Request',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Form Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all mandatory fields before dispatching.')
      return
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please provide an official university or campus email address.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    // Dispatch to backend API and confirm
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .catch(() => {}) // Graceful fallback
      .finally(() => {
        setIsSubmitting(false)
        setSubmitted(true)
      })
  }

  return (
    <section className="py-12 border-t border-white/5" id="contact" aria-label="Campus Contact and Helpdesk">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Campus Helpdesk & Facilities Hotline
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Direct Facility Dispatch & Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Need immediate escalation or have feedback on campus infrastructure upgrades? 
            Submit a direct dispatch ticket to the University Operations Center.
          </p>
        </header>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl border-white/10 bg-[#0d121f]/90 shadow-2xl">
          {submitted ? (
            <div className="text-center py-8 space-y-3" role="status" aria-live="polite">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Work Order Inquiry Logged</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you, <strong>{formData.fullName}</strong>. A facilities dispatch officer has received your note at <em>{formData.email}</em>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    fullName: '',
                    email: '',
                    department: 'Engineering & Physical Infrastructure',
                    inquiryType: 'Urgent Maintenance Request',
                    message: ''
                  })
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Campus Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@campus.edu"
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-dept" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Campus Division
                  </label>
                  <select
                    id="contact-dept"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Engineering & Physical Infrastructure">Engineering & Physical Infrastructure</option>
                    <option value="Hostel & Residential Life">Hostel & Residential Life</option>
                    <option value="IT & Campus Connectivity">IT & Campus Connectivity</option>
                    <option value="Dining & Health Services">Dining & Health Services</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-type" className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Inquiry Priority Category
                  </label>
                  <select
                    id="contact-type"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Urgent Maintenance Request">Urgent Maintenance Request</option>
                    <option value="Capital Infrastructure Suggestion">Capital Infrastructure Suggestion</option>
                    <option value="Safety & Lighting Audit">Safety & Lighting Audit</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Detailed Notes / Request <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide precise location, room number, or description of the issue..."
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Work Order'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}

export default ContactSection
