import { useState, useMemo } from "react";
import { Printer, Download, Calendar, Award } from "lucide-react";
import { toPng } from "html-to-image";

/**
 * RewardCheck Component
 * Displays a clean, bank-style reward check tailored to user specifications:
 * - Date display
 * - Child name on "ادفعوا لأمر" line
 * - Amount in numbers only
 * - School year line
 * - Cleaned-up header & bottom
 * - Print and Download buttons
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

  // Format today's date in Arabic
  const formattedDate = useMemo(() => {
    if (date) return date;
    const now = new Date();
    return now.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  const isoDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  }, []);

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
      // Run twice – first call "warms up" fonts/styles, second gives clean output
      await toPng(el, { pixelRatio: 2, backgroundColor: "#fbfdfa" });
      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#fbfdfa" });

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
    <div className="w-full flex flex-col items-center gap-4 sm:gap-6" dir="rtl">
      {/* ── THE PRINTABLE CHECK CONTAINER ── */}
      <div
        id="printable-check"
        className="reward-check-card relative w-full max-w-4xl bg-[#fbfdfa] text-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl border-2 sm:border-4 border-emerald-800/40 overflow-hidden select-text transition-all"
        style={{
          boxShadow: "0 25px 60px -15px rgba(2, 44, 34, 0.4)",
        }}
      >
        {/* Intricate Security Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05] z-0"
          style={{
            backgroundImage: `radial-gradient(#065f46 1.5px, transparent 1.5px), radial-gradient(#047857 1.5px, #fbfdfa 1.5px)`,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />

        {/* Guilloche border lines */}
        <div className="absolute inset-1.5 sm:inset-3 border-2 border-dashed border-emerald-800/30 rounded-xl sm:rounded-2xl pointer-events-none z-0" />
        <div className="absolute inset-2.5 sm:inset-4 border border-emerald-900/20 rounded-lg sm:rounded-xl pointer-events-none z-0" />

        {/* ── CHECK CONTENT (Z-10) ── */}
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:gap-7">
          {/* Header Row: Check Title Badge, Serial Number, Date Only */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-900/15 pb-3 sm:pb-5">
            {/* Right: Check Title */}

            {/* Left: Serial Number & Date Only */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] sm:text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="text-slate-500 text-[10px] sm:text-[11px]">التاريخ:</span>
                <span className="font-bold text-slate-900">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Middle Body: Pay to the order of + Amount Box (Numbers Only) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pt-1">
            {/* Pay to Order Line */}
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-baseline gap-1.5 sm:gap-4">

              <span className="text-sm sm:text-base font-black text-emerald-950 whitespace-nowrap shrink-0">
                الأسم:
              </span>
              <div className="flex-1 w-full border-b-2 border-emerald-900/40 pb-1.5 px-2 sm:px-3">
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-950 tracking-tight font-serif drop-shadow-sm break-words">
                  {child.name}
                </span>
              </div>
            </div>
          </div>

          {/* School Year Line (Replacing Purpose / Reason as requested) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1.5 sm:gap-4">
            <span className="text-sm sm:text-base font-black text-emerald-950 whitespace-nowrap shrink-0">
              السنة الدراسية:
            </span>
            <div className="flex-1 w-full border-b-2 border-dashed border-emerald-900/30 pb-2 px-2.5 sm:px-3 bg-emerald-50/50 rounded-lg flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm sm:text-base md:text-lg font-bold text-emerald-950 font-serif">
                {child.year || "مرحلة ابتدائية"}
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                كود الطفل: {child.qrId}
              </span>
            </div>
          </div>

          {/* Amount in Numbers Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1.5 sm:gap-4">
            <span className="text-sm sm:text-base font-black text-emerald-950 whitespace-nowrap shrink-0">
              المبلغ:
            </span>
            <div className="flex-1 w-full border-b border-emerald-900/20 pb-1.5 px-2.5 sm:px-3 flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                {points}
              </span>
              <span className="text-sm font-bold text-emerald-800">
                نقطة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ROW (HIDDEN IN PRINT) ── */}
      <div className="no-print w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div className="text-[11px] sm:text-xs text-slate-400 font-bold text-center sm:text-right">
          * يمكنك طباعة الشيك مباشرة أو تحميله كصورة عالية الجودة
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Download Check Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="tech-btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-sky-400 rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{isDownloading ? "Pending..." : "Download"}</span>
          </button>

          {/* Print Check Button */}
          <button
            onClick={handlePrint}
            className="tech-btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-white rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
