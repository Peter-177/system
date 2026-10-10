import { useState, useMemo } from "react";
import { Printer, Download, Calendar, Trophy, Asterisk } from "lucide-react";
import { toPng } from "html-to-image";

/**
 * RewardCheck Component
 * Displays a Neo Brutalism style reward check.
 *
 * @param {Object} props
 * @param {import('../types/index.d.ts').StudentWithId} props.child - The selected student
 * @param {number} [props.points=0] - Points value in numbers
 * @param {string} [props.date] - Optional custom date string
 * @param {() => void} [props.onPrint] - Optional callback when print is triggered
 */
export function RewardCheck({
  child,
  points = 0,
  date,
  onPrint,
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const formattedDate = useMemo(() => {
    if (date) return date;
    const now = new Date();
    return now.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }, [date]);

  const serialNumber = useMemo(() => {
    const rawId = child?.qrId || "000";
    const padded = String(rawId).padStart(4, "0");
    return `CHK-2026-${padded}`;
  }, [child?.qrId]);

  const handlePrint = () => {
    if (onPrint) onPrint();
    window.print();
  };

  const handleDownload = async () => {
    const el = document.getElementById("printable-check");
    if (!el) return;
    setIsDownloading(true);
    try {
      // Warm up
      await toPng(el, { pixelRatio: 2, backgroundColor: "#FFFFFF" });
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#FFFFFF" });

      const cleanName = (child?.name || "طالب").replace(/\s+/g, "_");
      const link = document.createElement("a");
      link.download = `شيك_${cleanName}_${child?.qrId || "2026"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download check image:", err);
      alert("حدث خطأ أثناء التحميل، حاول مرة أخرى.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!child) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6" dir="rtl">
      {/* ── THE PRINTABLE CHECK CONTAINER ── */}
      <div
        id="printable-check"
        className="w-full max-w-4xl bg-[#FACC15] border-[4px] border-black p-6 sm:p-10 relative overflow-hidden"
        style={{
          boxShadow: "10px 10px 0px #000000",
        }}
      >
        {/* Decorative BG Stripes */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)",
          }}
        />

        {/* Inner Border */}
        <div className="relative z-10 border-[3px] border-black bg-white p-6 flex flex-col gap-8 shadow-[4px_4px_0px_#000000]">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-[3px] border-black pb-4 border-dashed">
            {/* Title / Logo area */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-[#FACC15] flex items-center justify-center border-2 border-black">
                <Trophy className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl text-black tracking-tight leading-none">شيك مكافأة</span>
                <span className="font-black text-[10px] uppercase tracking-widest text-black/60">Reward Check</span>
              </div>
            </div>

            {/* Meta data */}
            <div className="flex gap-4">
              <div className="flex flex-col border-r-2 border-black pr-4">
                <span className="font-black text-[10px] uppercase text-black/60 tracking-wider">Date</span>
                <span className="font-black text-sm text-black flex items-center gap-1"><Calendar className="w-3 h-3" /> {formattedDate}</span>
              </div>
              <div className="flex flex-col border-r-2 border-black pr-4">
                <span className="font-black text-[10px] uppercase text-black/60 tracking-wider">Serial</span>
                <span className="font-mono font-black text-sm text-black">{serialNumber}</span>
              </div>
            </div>
          </div>

          {/* Check Body */}
          <div className="flex flex-col gap-6">
            
            {/* Pay to the order of */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
              <span className="font-black text-sm uppercase text-black whitespace-nowrap mb-1">الاســم:</span>
              <div className="flex-1 w-full border-b-[3px] border-black pb-1 relative">
                <div className="absolute -bottom-1.5 right-0 w-full h-[3px] bg-black opacity-30" />
                <span className="text-3xl sm:text-5xl font-black text-black break-words px-2 relative z-10">
                  {child.name}
                </span>
              </div>
            </div>

            {/* School Year */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
              <span className="font-black text-sm uppercase text-black whitespace-nowrap mb-1">السنة الدراسية:</span>
              <div className="flex-1 w-full border-b-[3px] border-black pb-1 relative flex justify-between items-end px-2">
                <div className="absolute -bottom-1.5 right-0 w-full h-[3px] bg-black opacity-30" />
                <span className="text-xl sm:text-2xl font-black text-black relative z-10">
                  {child.year || "مرحلة ابتدائية"}
                </span>
                <span className="bg-black text-white font-mono text-xs font-black px-2 py-0.5 relative z-10">
                  ID: {child.qrId}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
              <span className="font-black text-sm uppercase text-black whitespace-nowrap mb-1">المبلــغ:</span>
              <div className="flex-1 w-full border-b-[3px] border-black pb-1 relative flex items-end px-2">
                <div className="absolute -bottom-1.5 right-0 w-full h-[3px] bg-black opacity-30" />
                <div className="flex items-center gap-4 relative z-10 w-full">
                  <div className="flex items-center gap-2 bg-[#A3E635] border-2 border-black shadow-[2px_2px_0px_#000000] px-4 py-1">
                    <Asterisk className="w-4 h-4 stroke-[3]" />
                    <span className="text-3xl sm:text-4xl font-black font-mono text-black tabular-nums">{points}</span>
                    <Asterisk className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="font-black text-xl text-black">نقطة</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Signature */}
          <div className="flex justify-end mt-4">
            <div className="w-48 border-t-[3px] border-black pt-2 text-center">
              <span className="font-black text-xs uppercase text-black">توقيع المسؤول</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── ACTION BUTTONS ROW (HIDDEN IN PRINT) ── */}
      <div className="no-print w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-black font-black bg-white border-2 border-black px-3 py-2 shadow-[2px_2px_0px_#000000]">
          * للطباعة أو التحميل المباشر
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 sm:flex-none bg-[#38BDF8] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 px-6 py-3 font-black text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>{isDownloading ? "جارٍ التحميل..." : "تحميل كصورة"}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none bg-[#A3E635] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 px-8 py-3 font-black text-sm uppercase cursor-pointer"
          >
            <Printer className="w-5 h-5 stroke-[2.5]" />
            <span>طباعة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
