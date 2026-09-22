import { useState, useMemo } from "react";
import { Page, Navbar } from "../components/UI";
import { studentsDB } from "../data/storage";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  Phone,
  Search,
  ExternalLink,
  PhoneCall,
  Copy,
  Check,
  Download,
  ArrowUpDown,
  Layers,
  MessageCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

const GRADE_ORDER = [
  "حضانة",
  "أولى ابتدائي",
  "تانية ابتدائي",
  "تالتة ابتدائي",
  "رابعة ابتدائي",
  "خامسة ابتدائي",
  "ستة ابتدائي",
];

export function StudentsDashboardPage({ onBack, onGoStudent }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'grade' | 'id'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'
  const [copiedPhone, setCopiedPhone] = useState(null);

  // Load all students
  const allStudents = useMemo(() => {
    const raw = studentsDB.getAll();
    return Object.keys(raw).map((id) => ({
      qrId: id,
      ...raw[id],
      year: raw[id].year || "غير محدد",
      phone: raw[id].phone || "",
    }));
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const total = allStudents.length;
    const withPhone = allStudents.filter((s) => s.phone && s.phone.trim().length > 0).length;

    // Group counts by grade/stage
    const gradeCounts = {};
    allStudents.forEach((s) => {
      const g = s.year || "غير محدد";
      gradeCounts[g] = (gradeCounts[g] || 0) + 1;
    });

    const uniqueGrades = Object.keys(gradeCounts);

    return {
      total,
      withPhone,
      uniqueGradesCount: uniqueGrades.length,
      gradeCounts,
    };
  }, [allStudents]);

  // Available grade filter options
  const gradeOptions = useMemo(() => {
    const gradesSet = new Set(allStudents.map((s) => s.year).filter(Boolean));
    const list = Array.from(gradesSet);
    // Sort according to GRADE_ORDER first, then alphabetically
    return list.sort((a, b) => {
      const idxA = GRADE_ORDER.indexOf(a);
      const idxB = GRADE_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, "ar");
    });
  }, [allStudents]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    const normalizeArabic = (text) => {
      if (!text) return "";
      return text.replace(/[أإآا]/g, "ا").toLowerCase().trim();
    };

    const q = normalizeArabic(searchQuery);

    let list = allStudents.filter((s) => {
      // Grade filter
      if (selectedGrade !== "all" && s.year !== selectedGrade) {
        return false;
      }

      // Search filter
      if (!q) return true;

      const nameNorm = normalizeArabic(s.name);
      const phoneNorm = normalizeArabic(s.phone);
      const idNorm = normalizeArabic(s.qrId);
      const yearNorm = normalizeArabic(s.year);

      return (
        nameNorm.includes(q) ||
        phoneNorm.includes(q) ||
        idNorm.includes(q) ||
        yearNorm.includes(q)
      );
    });

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = (a.name || "").localeCompare(b.name || "", "ar");
      } else if (sortBy === "grade") {
        const idxA = GRADE_ORDER.indexOf(a.year);
        const idxB = GRADE_ORDER.indexOf(b.year);
        if (idxA !== -1 && idxB !== -1) comparison = idxA - idxB;
        else comparison = (a.year || "").localeCompare(b.year || "", "ar");
      } else if (sortBy === "id") {
        const numA = parseInt(a.qrId, 10) || 0;
        const numB = parseInt(b.qrId, 10) || 0;
        comparison = numA - numB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [allStudents, searchQuery, selectedGrade, sortBy, sortOrder]);

  const handleCopyPhone = (phone, e) => {
    if (e) e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      "م": idx + 1,
      "كود الطفل (ID)": s.qrId,
      "الاسم بالكامل": s.name || "",
      "الفصل / المرحلة": s.year || "",
      "رقم التليفون": s.phone || "",
      "العنوان": s.address || "",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    // RTL sheet support
    ws["!dir"] = "rtl";
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "بيانات الأطفال");
    const filename = `بيانات_الأطفال_${selectedGrade === "all" ? "الكل" : selectedGrade}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Page>
      <Navbar
        title="Dashboard"
        onBack={onBack}
        right={
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 text-sky-300 border border-sky-400/30 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.15)] active:scale-95"
            title="تصدير إكسيل"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير إكسيل</span>
          </button>
        }
      />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6" dir="rtl">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Children Card */}
          <Motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl group hover:border-sky-400/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">إجمالي الأطفال المسجلين</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Motion.div>

          {/* Total Grades / Classes */}
          <Motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl group hover:border-sky-400/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">عدد المراحل / الفصول</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{stats.uniqueGradesCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </Motion.div>

          {/* With Phone Number */}
          <Motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-xl group hover:border-sky-400/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">أرقام التليفونات المسجلة</p>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {stats.withPhone}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    ({stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}%)
                  </span>
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-inner">
                <Phone className="w-6 h-6" />
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Controls Section: Search + Class/Grade Filter Tabs */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث سريع باسم الطفل، الفصل، أو رقم التليفون..."
              className="w-full h-12 bg-slate-950/70 border border-white/10 rounded-xl pr-12 pl-4 text-white text-sm font-semibold outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Grade Filters (Horizontal Scrollable Tabs) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedGrade("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedGrade === "all"
                  ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-sky-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الكل ({allStudents.length})</span>
            </button>

            {gradeOptions.map((grade) => {
              const count = stats.gradeCounts[grade] || 0;
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-sky-400/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{grade}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info & Sort Bar */}
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <span>عدد النتائج:</span>
            <span className="text-sky-400 font-bold bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
              {filteredStudents.length}
            </span>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] hidden sm:inline text-slate-500">ترتيب حسب:</span>
            <button
              onClick={() => toggleSort("name")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                sortBy === "name"
                  ? "bg-sky-500/20 border-sky-400/40 text-sky-300"
                  : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>الاسم</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort("grade")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all ${
                sortBy === "grade"
                  ? "bg-sky-500/20 border-sky-400/40 text-sky-300"
                  : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <span>الفصل</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dashboard Data Display (Responsive Table & Card Matrix) */}
        <div className="w-full pb-16">
          {filteredStudents.length === 0 ? (
            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Users className="w-10 h-10 text-slate-600 mb-1" />
              <p className="text-slate-400 font-bold text-sm">مفيش أي طفل مطابق للبحث الحالي</p>
              <p className="text-slate-600 text-xs">جرب تغير الفصل أو تبحث باسم تاني</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <AnimatePresence>
                {filteredStudents.map((student, idx) => (
                  <Motion.div
                    key={student.qrId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                    className="relative bg-slate-900/70 backdrop-blur-xl border border-white/[0.08] hover:border-sky-400/30 rounded-2xl p-4 shadow-lg hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all flex flex-col justify-between gap-3 group"
                  >
                    {/* Top Row: Name, ID, Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-400/30 flex items-center justify-center text-white font-black text-base shrink-0 overflow-hidden shadow-inner">
                          {student.photo ? (
                            <img
                              src={student.photo}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{student.name ? student.name.charAt(0) : "؟"}</span>
                          )}
                        </div>

                        {/* Name + Code */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-sky-300 transition-colors">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                              ID: {student.qrId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Go to student profile button */}
                      <button
                        onClick={() => onGoStudent(student.qrId)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-sky-500 hover:text-white text-slate-400 border border-white/5 transition-all focus:outline-none"
                        title="فتح البروفايل الكامل"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle Row: Class / Grade Pill */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
                        <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                        <span>{student.year || "غير محدد"}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Phone Number with Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {student.phone ? (
                          <span className="font-mono font-bold tracking-wider truncate" dir="ltr">
                            {student.phone}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">مفيش رقم مسجل</span>
                        )}
                      </div>

                      {/* Action Buttons for Phone */}
                      {student.phone && (
                        <div className="flex items-center gap-1">
                          {/* Copy Phone */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(student.phone, e)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs"
                            title="نسخ رقم التليفون"
                          >
                            {copiedPhone === student.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Direct Call */}
                          <a
                            href={`tel:${student.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 transition-all text-xs flex items-center justify-center"
                            title="اتصال بالهاتف"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Chat */}
                          <a
                            href={`https://wa.me/2${student.phone.replace(/^0+/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-600/20 transition-all text-xs flex items-center justify-center"
                            title="واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
