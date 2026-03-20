import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/helpers";
import { settingsDB } from "../data/storage";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  LogOut, 
  HelpCircle, 
  Smartphone,
  Menu,
  Home,
  Waves,
  Layout,
  Search,
  Settings,
  Circle,
  User
} from "lucide-react";

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="toast toast-top toast-center z-[1000] pointer-events-none mt-4">
      <div className="bg-[#020617]/95 backdrop-blur-2xl border-2 border-sky-400/30 shadow-[0_0_50px_rgba(14,165,233,0.2)] text-sm font-black gap-5 py-5 px-10 animate-slideUp rounded-[2rem] flex items-center">
        <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-pulse"></div>
        <span className="text-white tracking-tight">{msg}</span>
      </div>
    </div>
  );
}

export function Page({ children, className = "", noScrollLock = false, sidebar, noFlex = false, noMinHeight = false }) {
  const baseClasses = `${noMinHeight ? "" : "min-h-screen"} ${noFlex ? "" : "flex flex-col md:flex-row"}`;
  
  return (
    <div
      className={`${noScrollLock ? "w-full " + (noMinHeight ? "" : "min-h-screen") : baseClasses} relative bg-slate-950 text-sky-50 ${className}`}
      dir="rtl"
    >
      {/* Universal Tech Background Style */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)] opacity-80"></div>
        {/* Subtle abstract glows */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-sky-500/10 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-sky-400/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      {sidebar && (
        <aside className="hidden md:block w-80 shrink-0 h-screen sticky top-0 border-l border-white/5 bg-slate-900/40 backdrop-blur-xl z-[100]">
          {sidebar}
        </aside>
      )}

      <main className={`relative z-10 flex-1 flex flex-col ${noScrollLock ? "w-full" : (noMinHeight ? "" : "min-h-screen")}`}>
        {children}
      </main>
    </div>
  );
}

export function Navbar({ onBack, title, right }) {
  return (
    <div className="navbar sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 min-h-20 px-8 transition-all duration-300">
      <div className="navbar-start">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all active:scale-90"
            title="Back"
          >
           <ChevronLeft className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="navbar-center">
        <span className="font-black text-xl tracking-tighter text-sky-50 uppercase bg-gradient-to-r from-sky-400 to-sky-100 bg-clip-text text-transparent">{title}</span>
      </div>
      <div className="navbar-end gap-3 flex">{right ?? null}</div>
    </div>
  );
}

export function Field({ label, error, required, children }) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label py-2">
          <span className="label-text text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mr-1">
            {label}
            {required && <span className="text-sky-500 mr-2 text-lg">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-red-400 font-bold text-[10px] uppercase tracking-widest">{error}</span>
        </label>
      )}
    </div>
  );
}

const ensureProfessionalColor = (color) => {
  // STRICTLY BLUE ONLY Logic
  const blueShades = ["#0ea5e9", "#38bdf8", "#0056D2", "#0284C7", "#7dd3fc"];
  if (!color) return blueShades[0];
  
  // Hash the color/string to pick one of our blue shades for consistency
  let hash = 0;
  for (let i = 0; i < color.length; i++) {
    hash = color.charCodeAt(i) + ((hash << 5) - hash);
  }
  return blueShades[Math.abs(hash) % blueShades.length];
};

export function Avatar({ name, accent, image, size = "md" }) {
  const sz = {
    sm: "w-14 h-14 text-xl",
    md: "w-20 h-20 text-3xl",
    lg: "w-28 h-28 text-5xl",
    xl: "w-40 h-40 text-6xl",
  }[size];
  
  const professionalBlue = ensureProfessionalColor(accent || name);

  return (
    <div className="relative group shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95">
      {/* Dynamic Glow Background */}
      <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div
        className={`${sz} rounded-3xl flex items-center justify-center font-black overflow-hidden relative z-10 shadow-2xl transition-all duration-300 border-2 border-white/10 group-hover:border-sky-400/50 group-hover:rounded-[2rem]`}
        style={{
          background: image ? 'var(--color-tech-surface)' : `linear-gradient(135deg, ${professionalBlue}20 0%, ${professionalBlue}40 100%)`,
          color: professionalBlue,
        }}
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <span className="drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">{name?.[0]?.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}

export function StudentMiniCard({ person }) {
  return (
    <div
      className="group relative rounded-3xl p-5 flex items-center gap-5 bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 transition-all duration-500 border border-white/5 hover:border-sky-400/20 shadow-xl"
    >
      <Avatar name={person.name} accent={person.accent} image={person.image} size="sm" />
      
      <div className="flex-1 min-w-0 pr-1 text-right">
        <div className="font-black text-lg truncate text-sky-50 leading-tight group-hover:text-sky-400 transition-colors">
          {person.name}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="font-black text-[9px] text-slate-500 uppercase tracking-[0.2em] bg-slate-950/50 px-2 py-0.5 rounded-lg border border-white/5 transition-all group-hover:border-sky-400/20">
            {person.qrId}
          </span>
          {person.year && (
            <span className="text-[10px] font-black text-sky-500/60 uppercase tracking-widest">{person.year}</span>
          )}
        </div>
      </div>
      
      <div className="w-1.5 h-6 rounded-full bg-slate-800 group-hover:bg-sky-500 transition-colors"></div>
    </div>
  );
}

export function Empty({ icon = "📭", message }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-slate-500 bg-slate-950/50 rounded-[3rem] border-2 border-dashed border-white/5">
      <div className="text-7xl grayscale opacity-30 drop-shadow-[0_0_40px_rgba(14,165,233,0.1)]">{icon}</div>
      <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 opacity-60 px-4 text-center">{message}</span>
    </div>
  );
}

export function Sidebar({ children, branding }) {
  return (
    <div className="flex flex-col h-full p-8 text-right">
      <div className="mb-14 h-14"></div>

      <nav className="flex-1 flex flex-col gap-2">
        {children}
      </nav>
      
      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-3 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-sky-400/20 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Support</span>
             <span className="text-[11px] font-bold text-sky-100/60 leading-none">مدارس أحد المحبة</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthShell({ icon, title, subtitle, children }) {
  return (
    <div
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sky-600/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-sky-500/5 blur-[100px] rounded-full"></div>

      <div className="w-full max-w-md animate-reveal stagger-1 relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border-2 border-sky-400/20 flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl relative group">
            <div className="absolute inset-0 bg-sky-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {(icon || settingsDB.get().icon)?.startsWith("data:image") ? (
              <img src={icon || settingsDB.get().icon} className="w-full h-full object-cover rounded-[1.8rem] relative z-10" alt="App Icon" />
            ) : (
              <span className="relative z-10">{icon || settingsDB.get().icon}</span>
            )}
          </div>
          <h1 className="text-3xl font-black text-sky-50 tracking-tighter mb-2">{title || "مدارس أحد المحبة"}</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{subtitle}</p>
        </div>
        
        <div className="tech-panel p-8 md:p-10 !rounded-[2.5rem]">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center border border-red-500/20 active:scale-90"
    >
      <X className="w-5 h-5" />
    </button>
  );
}

export function ImageCropperModal({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(croppedImageBase64);
    } catch (e) {
      console.error(e);
      onCancel();
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-reveal">
        
        <div className="p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="font-black text-xl text-sky-50 uppercase tracking-tight">ظبط الصورة</h3>
          <button onClick={onCancel} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full h-80 bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-8 flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <Smartphone className="text-slate-500 w-5 h-5" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="range range-info h-2 flex-1"
            />
          </div>

          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 h-14 bg-slate-800 text-slate-400 font-bold rounded-2xl">
              إلغاء
            </button>
            <button onClick={handleApply} className="flex-[2] tech-btn-primary">
              تطبيق التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModernNavbar({ currentUser, onLogout, onGoHome, onGoClasses, onGoSearch, onGoSummer, onGoAdmin, activePage = "home" }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const settings = settingsDB.get();

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", id: "home", onClick: onGoHome, icon: <Home /> },
    { label: "النادي الصيفي", id: "summer", onClick: onGoSummer, icon: <Waves /> },
    { label: "الفصول", id: "classes", onClick: onGoClasses, icon: <Layout /> },
    { label: "البحث", id: "search", onClick: onGoSearch, icon: <Search /> },
    { label: "الإعدادات", id: "admin", onClick: onGoAdmin, show: currentUser?.role === "admin", icon: <Settings /> },
  ].filter(link => link.show !== false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-700 modern-navbar-container ${
      isScrolled 
        ? "bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 py-4 shadow-2xl" 
        : "bg-transparent py-8"
    }`}>
      <div className="max-w-7xl mx-auto px-8 sm:px-12 flex justify-between items-center">
        {/* Actions Start */}
        <div className="flex items-center gap-8">
           <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-3 rounded-2xl transition-all ${isMenuOpen ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-white/5'}`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all rounded-xl active:scale-95"
            >
              Sign Out
            </button>
            
            <div className="h-6 w-px bg-white/10"></div>
            
            <div className="flex flex-col items-end px-7 py-3.5 bg-slate-900/60 border border-white/10 rounded-[1.8rem] shadow-2xl cursor-default">
               <span className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em] leading-none mb-2 transition-none">
                 {currentUser?.role || 'Servant'}
               </span>
               <span className="text-lg font-black text-white tracking-tight leading-none transition-none">
                 {currentUser?.name || currentUser?.username}
               </span>
            </div>
          </div>
        </div>

        <div onClick={onGoHome} className="flex items-center gap-5 group cursor-pointer" dir="ltr">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-sky-400 shadow-2xl border border-white/10 group-hover:border-sky-400/50 group-hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-sky-400/5 blur-xl group-hover:bg-sky-400/10 transition-colors"></div>
            {settings.icon?.startsWith("data:image") ? (
              <img alt="logo" src={settings.icon} className="w-full h-full object-cover relative z-10" />
            ) : (
              <span className="text-3xl font-black relative z-10 drop-shadow-lg">{settings.icon}</span>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-8" dir="rtl">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 text-center animate-reveal relative overflow-hidden">
            <div className="w-24 h-24 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-5xl mx-auto mb-10 shadow-2xl">🚪</div>
            <h3 className="text-3xl font-black text-sky-50 mb-4 tracking-tighter">عايز تخرج؟</h3>
            <p className="text-slate-500 font-bold mb-12 uppercase tracking-widest text-xs opacity-60">هل أنت متأكد من تسجيل الخروج؟</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={onLogout}
                className="w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-2xl shadow-red-500/20"
              >
                تأكيد الخروج
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full h-16 bg-slate-800 text-slate-400 rounded-2xl font-bold transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-24 z-[150] bg-slate-950/95 backdrop-blur-3xl md:hidden animate-reveal p-8" dir="rtl">
           <div className="flex flex-col gap-6">
             {navLinks.map((link) => (
               <button 
                key={link.id}
                onClick={() => { link.onClick(); setIsMenuOpen(false); }}
                className="flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-[2rem] text-right group active:scale-95 transition-all"
               >
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                      {React.cloneElement(link.icon, { size: 24 })}
                    </div>
                    <span className="text-xl font-black text-sky-50">{link.label}</span>
                 </div>
                 <ChevronLeft className="text-slate-600" />
               </button>
             ))}
             
             <button
              onClick={() => { onLogout(); setIsMenuOpen(false); }}
              className="flex items-center gap-6 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-red-500 font-black text-xl"
            >
              <LogOut size={24} />
              تسجيل الخروج
            </button>
           </div>
        </div>
      )}
    </nav>
  );
}
