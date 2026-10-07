import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { X, Smartphone } from "lucide-react";
import { getCroppedImg } from "../../utils/helpers";
import { CROP_OUTPUT_SIZE } from "../../constants/ui";

/**
 * ImageCropperModal — full-screen overlay for cropping an uploaded image.
 *
 * Automatically detects the source image's natural aspect ratio so the
 * crop box matches the original proportions (no forced square or circle).
 *
 * @param {{
 *   imageSrc: string | null,
 *   onCropDone: (base64: string) => void,
 *   onCancel: () => void,
 * }} props
 */
export function ImageCropperModal({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(4 / 3);

  // Detect natural aspect ratio on source change
  useEffect(() => {
    if (!imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
  }, [imageSrc]);

  const handleCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    try {
      const base64 = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        CROP_OUTPUT_SIZE,
        "image/png",
      );
      onCropDone(base64);
    } catch {
      // Crop failed (e.g. image load error) — dismiss cleanly
      onCancel();
    }
  };

  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Image cropper"
    >
      <div className="bg-slate-900 border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-md overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-reveal">
        {/* Header */}
        <div className="p-5 sm:p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="font-black text-lg sm:text-xl text-sky-50 uppercase tracking-tight">
            ظبط الصورة
          </h3>
          {/* 44×44px close button */}
          <button
            onClick={onCancel}
            className="w-11 h-11 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close cropper"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="p-5 sm:p-8 flex flex-col gap-5 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <Smartphone className="text-slate-500 w-5 h-5 shrink-0" aria-hidden="true" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-label="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="range range-info h-2 flex-1"
            />
          </div>

          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={onCancel}
              className="flex-1 h-14 bg-slate-800 text-slate-400 font-bold rounded-2xl transition-colors hover:bg-slate-700"
            >
              إلغاء
            </button>
            <button
              onClick={handleApply}
              className="flex-[2] tech-btn-primary"
            >
              تطبيق التغييرات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
