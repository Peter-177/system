import { useState, useMemo } from "react";
import { studentsDB } from "../data/storage";
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
  ArrowRight,
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
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
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
    const withPhone = allStudents.filter(
      (s) => s.phone && s.phone.trim().length > 0,
    ).length;

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
      if (selectedGrade !== "all" && s.year !== selectedGrade) {
        return false;
      }

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

  const avatarColors = ["bg-[#FACC15]", "bg-[#38BDF8]", "bg-[#A3E635]", "bg-[#FB923C]", "bg-[#F472B6]"];
  const getAvatarBg = (str = "") => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div
      className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col"
      dir="rtl"
    >
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            <span>رجوع</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              STUDENTS DIRECTORY
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase">
              لوحة التحكم الشاملة
            </h1>
          </div>

          <button
            onClick={handleExportExcel}
            className="bg-[#A3E635] text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-xs sm:text-sm uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            title="تصدير إكسيل"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">تصدير إكسيل</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FACC15] border-[3px] border-black p-5 shadow-[6px_6px_0px_#000000] flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-black">
                إجمالي الأطفال المسجلين
              </p>
              <h3 className="text-4xl font-black text-black tracking-tight mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-[#38BDF8] border-[3px] border-black p-5 shadow-[6px_6px_0px_#000000] flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-black">
                عدد المراحل والفصول
              </p>
              <h3 className="text-4xl font-black text-black tracking-tight mt-1">
                {stats.uniqueGradesCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <GraduationCap className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-[#A3E635] border-[3px] border-black p-5 shadow-[6px_6px_0px_#000000] flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase text-black">
                أرقام التليفونات المسجلة
              </p>
              <h3 className="text-4xl font-black text-black tracking-tight mt-1">
                {stats.withPhone}{" "}
                <span className="text-xs font-bold text-gray-800">
                  ({stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}%)
                </span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
              <Phone className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Filters & Search Control Box */}
        <div className="bg-white border-[3px] border-black p-5 shadow-[6px_6px_0px_#000000] flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-black">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، الفصل، الكود (ID)، أو رقم التليفون..."
              className="w-full h-12 bg-[#FDF8F0] border-2 border-black pr-12 pl-4 text-black text-sm font-bold focus:outline-none focus:bg-[#FACC15] transition-colors placeholder:text-gray-500"
            />
          </div>

          {/* Stage / Grade filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedGrade("all")}
              className={`px-3.5 py-1.5 border-2 border-black font-black text-xs uppercase whitespace-nowrap transition-all cursor-pointer ${
                selectedGrade === "all"
                  ? "bg-[#FACC15] shadow-[3px_3px_0px_#000000]"
                  : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#000000]"
              }`}
            >
              الكل ({allStudents.length})
            </button>

            {gradeOptions.map((grade) => {
              const count = stats.gradeCounts[grade] || 0;
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3.5 py-1.5 border-2 border-black font-black text-xs uppercase whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#38BDF8] shadow-[3px_3px_0px_#000000]"
                      : "bg-white hover:bg-gray-100 shadow-[2px_2px_0px_#000000]"
                  }`}
                >
                  <span>{grade}</span>
                  <span className="bg-black text-white px-1.5 py-0.2 rounded-none text-[10px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info & Sort Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 font-black text-xs uppercase">
            <span>النتائج المعروضة:</span>
            <span className="bg-black text-[#FACC15] px-2 py-0.5 border border-black">
              {filteredStudents.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-gray-700 hidden sm:inline">
              ترتيب حسب:
            </span>
            <button
              onClick={() => toggleSort("name")}
              className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                sortBy === "name"
                  ? "bg-[#FACC15] shadow-[2px_2px_0px_#000000]"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <span>الاسم</span>
              <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
            </button>

            <button
              onClick={() => toggleSort("grade")}
              className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                sortBy === "grade"
                  ? "bg-[#38BDF8] shadow-[2px_2px_0px_#000000]"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <span>الفصل</span>
              <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
            </button>

            <button
              onClick={() => toggleSort("id")}
              className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                sortBy === "id"
                  ? "bg-[#A3E635] shadow-[2px_2px_0px_#000000]"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <span>الكود</span>
              <ArrowUpDown className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Student Cards Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white border-[3px] border-black p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_#000000]">
            <Users className="w-12 h-12 stroke-[2] text-gray-400 mb-2" />
            <p className="font-black text-lg text-black">
              لا توجد نتائج مطابقة لبحثك
            </p>
            <p className="text-xs font-bold text-gray-600">
              تأكد من كتابة الاسم أو الكود بشكل صحيح
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {filteredStudents.map((student) => {
              const avatarBg = getAvatarBg(student.name || student.qrId);
              return (
                <div
                  key={student.qrId}
                  className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Top Row: Avatar, Name, ID, Open Profile */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 border-2 border-black flex items-center justify-center font-black text-lg text-black shrink-0 overflow-hidden shadow-[2px_2px_0px_#000000] ${avatarBg}`}
                      >
                        {student.image ? (
                          <img
                            src={student.image}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{student.name ? student.name.charAt(0) : "؟"}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-black text-black truncate">
                          {student.name}
                        </h4>
                        <span className="inline-block mt-0.5 bg-black text-white font-mono text-[10px] font-bold px-1.5 py-0.2">
                          ID: {student.qrId}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onGoStudent(student.qrId)}
                      className="w-9 h-9 bg-[#FACC15] hover:bg-black hover:text-white text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] transition-colors cursor-pointer"
                      title="فتح البروفايل"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Stage / Grade Tag */}
                  <div className="pt-2 border-t-2 border-black flex items-center justify-between">
                    <span className="bg-[#38BDF8] border border-black px-2 py-0.5 font-black text-xs uppercase flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{student.year || "غير محدد"}</span>
                    </span>

                    {student.address && (
                      <span className="text-[11px] font-bold text-gray-600 truncate max-w-[150px]">
                        📍 {student.address}
                      </span>
                    )}
                  </div>

                  {/* Phone Actions */}
                  <div className="pt-2 border-t-2 border-black flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-black min-w-0">
                      <Phone className="w-3.5 h-3.5 stroke-[2.5] text-black shrink-0" />
                      {student.phone ? (
                        <span className="font-mono font-black tracking-wider truncate" dir="ltr">
                          {student.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px]">بدون هاتف</span>
                      )}
                    </div>

                    {student.phone && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(student.phone, e)}
                          className="w-7 h-7 bg-white hover:bg-gray-100 border border-black flex items-center justify-center text-black transition-colors"
                          title="نسخ الرقم"
                        >
                          {copiedPhone === student.phone ? (
                            <Check className="w-3.5 h-3.5 stroke-[3] text-green-700" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                        </button>

                        <a
                          href={`tel:${student.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 bg-[#A3E635] hover:bg-black hover:text-white text-black border border-black flex items-center justify-center transition-colors"
                          title="اتصال هاتفي"
                        >
                          <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>

                        <a
                          href={`https://wa.me/2${student.phone.replace(/^0+/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-7 h-7 bg-[#A3E635] hover:bg-black hover:text-white text-black border border-black flex items-center justify-center transition-colors"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
