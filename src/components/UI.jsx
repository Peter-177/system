import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/helpers";

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

export function Page({ children, className = "" }) {
  return (
    <div
      className={`min-h-screen relative bg-gradient-to-br from-base-100 via-base-100 to-base-200/50 text-base-content flex flex-col overflow-x-hidden ${className}`}
      dir="rtl"
    >
      {/* Subtle background grain/texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Content wrapper to ensure z-index over absolute background */}
      <div className="relative z-10 flex flex-col flex-1">
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
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl mx-auto mb-4">
            {icon}
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
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
