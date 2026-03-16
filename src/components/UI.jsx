import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/helpers";
import { settingsDB } from "../data/storage";

// components/UI.jsx

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="toast toast-top toast-center z-999 pointer-events-none">
      <div className="alert bg-base-300 border border-base-content/10 shadow-xl text-sm text-base-content gap-2 animate-pop">
        <span>{msg}</span>
      </div>
    </div>
  );
}

export function Page({ children, className = "", noScrollLock = false }) {
  return (
    <div
      className={`${noScrollLock ? "w-full min-h-screen" : "min-h-screen flex flex-col overflow-x-hidden"} relative bg-linear-to-br from-base-100 via-base-100 to-base-200/50 text-base-content ${className}`}
      dir="rtl"
    >
      {/* Subtle background grain/texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Content wrapper to ensure z-index over absolute background */}
      <div className={`relative z-10 ${noScrollLock ? "w-full" : "flex flex-col flex-1"}`}>
        {children}
      </div>
    </div>
  );
}

export function Navbar({ onBack, title, right }) {
  return (
    <div className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200/60 shadow-sm min-h-14 px-4 transition-all duration-300">
      <div className="navbar-start">
        {onBack && (
          <button
            onClick={onBack}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-primary/10 transition-colors"
            title="نرجع لورا"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="navbar-center">
        <span className="font-extrabold text-[15px] tracking-wide text-base-content/90">{title}</span>
      </div>
      <div className="navbar-end gap-2 flex">{right ?? null}</div>
    </div>
  );
}

export function Field({ label, error, required, children }) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label py-1">
          <span className="label-text text-xs text-base-content/50">
            {label}
            {required && <span className="text-error mr-1">*</span>}
          </span>
        </label>
      )}
      {children}
      {error && (
        <label className="label py-1">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

export function Avatar({ name, accent, image, size = "md" }) {
  const sz = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-5xl",
    xl: "w-36 h-36 text-6xl",
  }[size];
  
  return (
    <div className="relative group shrink-0">
      {/* Glow effect matching accent behind avatar */}
      <div 
        className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-90"
        style={{ backgroundColor: accent }}
      ></div>
      
      <div
        className={`${sz} rounded-full flex items-center justify-center font-bold overflow-hidden relative z-10 shadow-sm transition-transform duration-300 group-hover:scale-[1.03]`}
        style={{
          background: `linear-gradient(135deg, ${accent}15 0%, ${accent}30 100%)`,
          border: `2px solid ${accent}50`,
          color: accent,
        }}
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="drop-shadow-sm">{name?.[0]?.toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}

export function StudentMiniCard({ person }) {
  return (
    <div
      className="group relative rounded-[1.25rem] p-3.5 flex items-center gap-3.5 bg-base-100 hover:bg-base-200/50 transition-all duration-300 shadow-sm hover:shadow-md border border-base-200"
    >
      {/* Hover edge highlight */}
      <div 
        className="absolute inset-y-0 right-0 w-1.5 rounded-r-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: person.accent }}
      ></div>

      <Avatar name={person.name} accent={person.accent} image={person.image} size="sm" />
      
      <div className="flex-1 min-w-0 pr-1">
        <div className="font-bold text-[15px] truncate text-base-content/90 group-hover:text-base-content transition-colors">
          {person.name}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[11px] font-semibold text-base-content/40 tracking-wider">
            {person.qrId}
          </span>
          {person.year && (
            <>
              <span className="w-1 h-1 rounded-full bg-base-content/20"></span>
              <span className="text-[11px] text-base-content/50">{person.year}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function Empty({ icon = "📭", message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-base-content/20">
      <span className="text-4xl">{icon}</span>
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function AuthShell({ icon, title, subtitle, children }) {
  return (
    <div
      className="min-h-screen bg-base-100 flex items-center justify-center p-5"
      dir="rtl"
    >
      <div className="w-full max-w-sm animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4 overflow-hidden">
            {(icon || settingsDB.get().icon)?.startsWith("data:image") ? (
              <img src={icon || settingsDB.get().icon} className="w-full h-full object-cover" alt="App Icon" />
            ) : (
              icon || settingsDB.get().icon
            )}
          </div>
          <h1 className="text-xl font-bold">{title || (settingsDB.get().nameTop + " " + settingsDB.get().nameBottom)}</h1>
          <p className="text-sm text-base-content/40 mt-1">{subtitle}</p>
        </div>
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost btn-xs text-error/50 hover:text-error hover:bg-error/10 w-7 h-7 min-h-0 p-0 rounded-lg"
    >
      ✕
    </button>
  );
}

// =========================================================================
// Image Cropper Modal (Discord Style)
// =========================================================================

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
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-base-200 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-zoomIn border border-base-content/10">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <h3 className="font-bold text-lg">ظبط الصورة</h3>
          <button onClick={onCancel} className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:bg-base-300">
            ✕
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-64 bg-black">
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

        {/* Controls */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🖼️</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="range range-xs range-primary flex-1"
            />
            <span className="text-2xl">📸</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
            <button onClick={onCancel} className="btn btn-ghost">
              لا بلاش
            </button>
            <button onClick={handleApply} className="btn btn-primary px-8">
              تمام
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// Modern Navbar (SaaS Style)
// =========================================================================

export function ModernNavbar({ currentUser, onLogout, onGoHome, onGoClasses, onGoSearch, activePage = "home" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const settings = settingsDB.get();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", id: "home", onClick: onGoHome },
    { label: "الفصول", id: "classes", onClick: onGoClasses },
    { label: "البحث", id: "search", onClick: onGoSearch },
    { label: "عن الخدمة", id: "about", onClick: () => {} },
    { label: "اتصل بنا", id: "contact", onClick: () => {} },
  ];

  const handleNavClick = (onClick) => {
    if (onClick) onClick();
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled 
        ? "bg-base-100/70 backdrop-blur-xl border-b border-base-200/50 py-3 shadow-lg shadow-black/5" 
        : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Mobile Toggle & Actions - Left */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden btn btn-ghost btn-circle transition-all duration-300 ${isMenuOpen ? 'bg-primary/10 text-primary' : 'text-base-content'}`}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8h16M10 16h10" />
              </svg>
            )}
          </button>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="btn btn-sm bg-base-content/5 border-none hover:bg-error hover:text-white text-base-content/60 gap-1.5 transition-all duration-300 rounded-full px-4"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex flex-col items-start ml-3">
               <span className="text-base font-black text-primary uppercase tracking-[0.1em]">{currentUser?.role === 'admin' ? 'Admin' : 'الخادم'}</span>
               <span className="text-xs font-bold opacity-40">{currentUser?.username}</span>
            </div>
          </div>
        </div>

        {/* Logo - Right */}
        <div onClick={() => handleNavClick(onGoHome)} className="flex items-center gap-3 group cursor-pointer">
          <div className="flex flex-col leading-none items-end" dir="ltr">
            <span className="text-lg font-black tracking-tighter text-base-content group-hover:text-primary transition-colors">{settings.nameTop}</span>
            <span className="text-[10px] font-bold text-base-content/40 tracking-[0.2em] uppercase">{settings.nameBottom}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary-focus flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            {settings.icon?.startsWith("data:image") ? (
              <img src={settings.icon} className="w-full h-full object-cover shadow-inner" alt="Icon" />
            ) : (
              <span className="text-xl font-black">{settings.icon}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-base-100/98 backdrop-blur-3xl border-b border-base-200 shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isMenuOpen ? "max-h-[500px] border-t border-base-200/50 py-8 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="flex flex-col gap-5 px-8">
          <div className="flex flex-row-reverse justify-between items-center bg-base-200/50 p-5 rounded-[2rem] border border-base-300/50">
             <div className="text-right">
                <div className="text-base font-black text-primary uppercase tracking-widest">{currentUser?.role === 'admin' ? 'Admin' : 'الخادم'}</div>
                <div className="text-lg font-bold text-base-content/80">{currentUser?.username}</div>
             </div>
             <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-error btn-md rounded-2xl px-8 shadow-lg shadow-error/20 text-white font-bold">خروج</button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-6 animate-fadeIn" dir="rtl">
          <div className="w-full max-w-sm bg-base-100/80 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-2xl p-8 animate-slideUp text-center relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-error/10 rounded-full blur-3xl"></div>
            
            <div className="w-20 h-20 rounded-3xl bg-error/10 text-error flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border border-error/10 relative z-10">
              🚪
            </div>
            
            <h3 className="text-2xl font-black text-base-content mb-3 relative z-10">عايز تخرج؟</h3>
            <p className="text-base-content/60 font-medium mb-8 leading-relaxed relative z-10">هل أنت متأكد إنك عايز تسجل الخروج من الحساب؟</p>
            
            <div className="flex flex-col gap-3 relative z-10">
              <button 
                onClick={onLogout}
                className="btn btn-error btn-lg rounded-2xl w-full h-14 font-black text-lg text-white shadow-xl shadow-error/20 border-none"
              >
                تأكيد الخروج
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-ghost btn-lg rounded-2xl w-full h-14 font-bold text-base-content/40 hover:bg-base-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
