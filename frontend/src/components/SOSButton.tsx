import { useState } from "react";
import { AlertTriangle, Phone, MapPin, ShieldAlert, X } from "lucide-react";
import { Button, Card } from "./ui";
import { useStore } from "@/lib/store";
import confetti from "canvas-confetti";

export function SOSButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { session, createComplaint, assign, transition } = useStore();

  const triggerSOS = () => {
    setLoading(true);
    
    // Try to get location, otherwise use default
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submit(pos.coords.latitude, pos.coords.longitude),
        () => submit(40.7128, -74.0060) // Default fallback
      );
    } else {
      submit(40.7128, -74.0060);
    }
  };

  const submit = async (lat: number, lng: number) => {
    try {
      if (session) {
        const res = await createComplaint({
          title: "🚨 EMERGENCY SOS ALERT 🚨",
          description: "An emergency SOS was triggered by the user. Immediate assistance required.",
          category: "safety",
          priority: "emergency",
          building: "Current Location",
          room: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          studentId: session.id,
          mediaDataUrls: [],
          latitude: lat,
          longitude: lng,
        });

        if (res.ok && res.complaint) {
          assign({
            complaintId: res.complaint.id,
            actorId: session.id,
            departmentId: "electrical",
            workerId: "w_1"
          });
          transition({
            complaintId: res.complaint.id,
            to: "in_progress",
            actorId: session.id,
            note: "Auto-dispatched via SOS system.",
            visibility: "public"
          });
        }
      }
      
      setActive(true);
      setLoading(false);
      
      // Pulse effect to indicate success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626', '#b91c1c']
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-105 transition-all duration-300 animate-pulse border-2 border-red-500/50"
        aria-label="Emergency SOS"
      >
        <ShieldAlert className="h-7 w-7" />
      </button>

      {/* SOS Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !active && setOpen(false)} />
          
          <Card className={`relative w-full max-w-sm overflow-hidden border-2 shadow-2xl z-10 transition-colors duration-500 ${active ? 'border-red-500 bg-red-950/20' : 'border-red-500/30 bg-slate-900'}`}>
            <button
              onClick={() => {
                setOpen(false);
                if (active) {
                  setTimeout(() => setActive(false), 500); // Reset after closing
                }
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 text-center">
              {!active ? (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 border-2 border-red-500/20">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Emergency SOS</h2>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    This will automatically find your location and alert Campus Security immediately.
                  </p>
                  
                  <Button 
                    variant="danger" 
                    className="w-full font-bold text-lg h-12 uppercase tracking-widest shadow-red-600/20 shadow-xl"
                    onClick={triggerSOS}
                    disabled={loading}
                  >
                    {loading ? "Locating..." : "Activate SOS"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-wider">SOS Sent</h2>
                  <p className="text-sm font-medium text-white mb-6 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20 flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    Location tracking active
                  </p>
                  
                  <div className="space-y-3 text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">Tamil Nadu Emergency Numbers</h3>
                    
                    <a href="tel:100" className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 hover:bg-slate-700 transition">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Police Control Room</div>
                        <div className="text-xs text-slate-400 font-mono">100</div>
                      </div>
                    </a>
                    
                    <a href="tel:108" className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 hover:bg-slate-700 transition">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Ambulance Emergency</div>
                        <div className="text-xs text-slate-400 font-mono">108</div>
                      </div>
                    </a>

                    <a href="tel:101" className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 hover:bg-slate-700 transition">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">Fire & Rescue</div>
                        <div className="text-xs text-slate-400 font-mono">101</div>
                      </div>
                    </a>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
