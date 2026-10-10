import { useState, useEffect, useMemo } from "react";
import {
  ImageCropperModal,
} from "../components/UI";
import {
  getAllUsersFB,
  updateUserPermissionsFB,
  deleteUserFB,
} from "../services/firestoreService";
import { classesDB, studentsDB, settingsDB } from "../data/storage";
import {
  Users,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  Download,
  ArrowRight,
  Trash2,
  Check,
  X,
  Cake,
  BookOpen,
  PlusCircle,
  Database,
  Shield,
  Key,
  Save,
  Camera,
  Home,
  Sliders,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

export function AdminPage({
  currentUser,
  onBack,
  onGoClasses,
  onGoAddStudent,
  onUpdateSecret,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [tempPerms, setTempPerms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState("");
  const [secretLoading, setSecretLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [brand, setBrand] = useState(settingsDB.get());
  const [brandLoading, setBrandLoading] = useState(false);
  const [cropImage, setCropImage] = useState(null);

  const classList = useMemo(
    () =>
      Object.entries(classesDB.getAll()).map(([id, cls]) => ({ id, ...cls })),
    [],
  );
  const totalStudents = Object.keys(studentsDB.getAll()).length;

  const birthdaysToday = useMemo(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const todayStr = `${day}/${month}`;
    return Object.values(studentsDB.getAll()).filter((s) =>
      s.birthdate?.startsWith(todayStr),
    ).length;
  }, []);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setLoading(false);
      return;
    }
    getAllUsersFB()
      .then((data) => {
        const userList = Object.values(data || {});
        setUsers(userList);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentUser]);

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#FDF8F0] text-black font-sans flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_#000000] p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-[#EF4444] border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center mx-auto text-white">
            <ShieldCheck size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black uppercase text-black">الوصول محظور</h2>
          <p className="text-sm font-bold text-black/70">عفواً، هذه المنطقة للمشرفين فقط</p>
          <button
            onClick={onBack}
            className="w-full bg-[#FACC15] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] py-3 font-black text-sm uppercase cursor-pointer"
          >
            الرجوع للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const handleEditClick = (u) => {
    setEditingUser(u);
    setTempPerms(u.permissions || []);
  };

  const handleTogglePerm = (permId) => {
    if (tempPerms.includes(permId)) {
      setTempPerms(tempPerms.filter((id) => id !== permId));
    } else {
      setTempPerms([...tempPerms, permId]);
    }
  };

  const savePermissions = async () => {
    if (!editingUser) return;
    setSaving(true);
    await updateUserPermissionsFB(editingUser.username, tempPerms);
    setUsers(
      users.map((u) =>
        u.username === editingUser.username
          ? { 
              ...u, 
              permissions: tempPerms, 
              role: tempPerms.includes("perm_admin") ? "admin" : "user" 
            }
          : u,
      ),
    );
    setSaving(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`متأكد من حذف الخادم "${username}"؟`)) return;
    try {
      await deleteUserFB(username);
      setUsers(users.filter((u) => u.username !== username));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء محاولة حذف المستخدم");
    }
  };

  const handleExportExcel = () => {
    const students = studentsDB.getAll();
    const rows = Object.entries(students).map(([qrId, s]) => {
      const customString = (s.customFields || [])
        .map(f => `${f.label}: ${f.value}`)
        .join(" | ");

      return [
        qrId,
        s.name || "",
        s.year || "",
        s.phone || "",
        s.address || "",
        s.birthdate || "",
        customString
      ];
    });

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', tahoma, sans-serif; }
          th { background-color: #000000; color: #FFFFFF; font-weight: bold; border: 2px solid #000000; padding: 10px; text-align: center; font-size: 14px; }
          td { border: 1px solid #000000; padding: 8px; text-align: center; color: #000000; font-size: 13px; vertical-align: middle; }
          .even td { background-color: #F8F9FA; }
          .odd td { background-color: #FFFFFF; }
        </style>
      </head>
      <body dir="rtl">
        <table>
          <thead>
            <tr>
              <th style="width: 100px;">الكود (ID)</th>
              <th style="width: 250px;">الاسم</th>
              <th style="width: 120px;">السنة الدراسية</th>
              <th style="width: 150px;">رقم التليفون</th>
              <th style="width: 300px;">العنوان</th>
              <th style="width: 120px;">تاريخ الميلاد</th>
              <th style="width: 300px;">تفاصيل إضافية</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
            <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
              <td style="mso-number-format:'\@';">${r[0]}</td>
              <td><b>${r[1]}</b></td>
              <td>${r[2]}</td>
              <td style="mso-number-format:'\@'; color: #000000; font-weight: bold;">${r[3]}</td>
              <td>${r[4]}</td>
              <td>${r[5]}</td>
              <td style="color: #666; font-style: italic;">${r[6]}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "بيانات_مدارس_الاحد.xls";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const navItems = [
    { id: "dashboard", label: "نظرة عامة", icon: LayoutDashboard, bg: "bg-[#FACC15]" },
    { id: "servants",  label: "إدارة الخدام", icon: Users,           bg: "bg-[#38BDF8]" },
    { id: "branding",  label: "هوية النظام", icon: Palette,         bg: "bg-[#A3E635]" },
    { id: "security",  label: "الأمان والمفاتيح", icon: ShieldCheck,   bg: "bg-[#FB923C]" },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-black font-sans selection:bg-[#FACC15] selection:text-black flex flex-col" dir="rtl">
      {/* ── Neo-Brutalist Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FACC15] border-b-[3px] border-black px-4 sm:px-8 py-3.5 shadow-[0_4px_0px_#000000]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back Button */}
          {onBack ? (
            <button
              onClick={onBack}
              className="bg-white text-black border-2 sm:border-[3px] border-black px-3 py-1.5 sm:px-4 sm:py-2 shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none font-black text-sm sm:text-base uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              <span>رجوع</span>
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="bg-black text-[#FACC15] px-2.5 py-0.5 border-2 border-black font-black text-xs uppercase tracking-widest hidden sm:inline-block">
              ADMIN
            </span>
            <h1 className="font-black text-2xl sm:text-3xl tracking-tight text-black uppercase flex items-center gap-2">
              لوحة التحكم
            </h1>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportExcel}
            className="bg-black text-[#A3E635] border-2 border-black px-3 py-1 font-black text-xs sm:text-sm uppercase shadow-[2px_2px_0px_#000000] hover:bg-[#A3E635] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
            title="تصدير ملف إكسيل"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <div className="bg-white border-b-[3px] border-black px-4 sm:px-8 py-3 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex gap-3">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-4 py-2 border-[3px] border-black font-black text-xs sm:text-sm uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? `${item.bg} text-black shadow-[3px_3px_0px_#000000] translate-x-[-1px] translate-y-[-1px]`
                    : "bg-[#FDF8F0] text-black/70 hover:bg-white hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-8">
        
        {/* 1. DASHBOARD VIEW */}
        {activeSection === "dashboard" && (
          <div className="flex flex-col gap-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Students */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-[#38BDF8] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <Users size={32} className="stroke-[2.5] text-black" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-black/60 block">
                    إجمالي الأطفال
                  </span>
                  <span className="text-4xl font-black text-black tabular-nums tracking-tight">
                    {totalStudents}
                  </span>
                </div>
              </div>

              {/* Birthdays Today */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-[#F472B6] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <Cake size={32} className="stroke-[2.5] text-black" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-black/60 block">
                    أعياد ميلاد اليوم
                  </span>
                  <span className="text-4xl font-black text-black tabular-nums tracking-tight">
                    {birthdaysToday}
                  </span>
                </div>
              </div>

              {/* Active Classes */}
              <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex items-center gap-5 sm:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 bg-[#A3E635] border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center shrink-0">
                  <BookOpen size={32} className="stroke-[2.5] text-black" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-black/60 block">
                    الفصول النشطة
                  </span>
                  <span className="text-4xl font-black text-black tabular-nums tracking-tight">
                    {classList.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Export Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b-[3px] border-black pb-4">
                  <div className="w-8 h-8 bg-[#FACC15] border-2 border-black flex items-center justify-center">
                    <Sliders className="w-4 h-4 stroke-[3]" />
                  </div>
                  <h3 className="font-black text-xl text-black uppercase">إجراءات سريعة</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={onGoClasses}
                    className="bg-[#FEF08A] hover:bg-[#FACC15] border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none p-5 flex items-center gap-4 transition-all text-right cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shrink-0">
                      <BookOpen size={24} className="stroke-[2.5] text-black" />
                    </div>
                    <div>
                      <span className="font-black text-lg text-black block">إدارة الفصول</span>
                      <span className="text-xs font-bold text-black/60">تعديل المراحل والصفوف</span>
                    </div>
                  </button>

                  <button
                    onClick={onGoAddStudent}
                    className="bg-[#DCFCE7] hover:bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none p-5 flex items-center gap-4 transition-all text-right cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shrink-0">
                      <PlusCircle size={24} className="stroke-[2.5] text-black" />
                    </div>
                    <div>
                      <span className="font-black text-lg text-black block">إضافة مخدوم</span>
                      <span className="text-xs font-bold text-black/60">تسجيل طفل جديد</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Excel Download Card */}
              <div className="bg-[#38BDF8] border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col items-center justify-between text-center gap-6">
                <div className="w-16 h-16 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center">
                  <Database size={32} className="stroke-[2.5] text-black" />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-black uppercase mb-1">
                    تصدير قاعدة البيانات
                  </h4>
                  <p className="text-xs font-bold text-black/70">
                    تحميل جميع بيانات الأطفال في ملف Excel منظم
                  </p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full bg-black text-white hover:bg-white hover:text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] py-3.5 font-black text-sm uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={18} className="stroke-[3]" />
                  <span>تحميل ملف EXCEL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SERVANTS DIRECTORY */}
        {activeSection === "servants" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-black uppercase">دليل الخدام والصلاحيات</h3>
                <p className="text-xs font-bold text-black/60">التحكم في وصول الفصول وحذف المخدومين</p>
              </div>
              <span className="bg-black text-white px-3 py-1 font-black text-xs uppercase border border-black">
                {users.length} خادم مسجل
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-white border-[3px] border-black p-8 gap-3">
                <div className="w-10 h-10 border-4 border-black border-t-[#FACC15] animate-spin" />
                <span className="font-black text-xs uppercase tracking-widest text-black">
                  جاري جلب الخدام...
                </span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center bg-white border-[3px] border-black border-dashed p-8">
                <p className="font-black text-black text-lg">لا يوجد خدام مسجلين حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                  <div
                    key={u.username}
                    className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 flex flex-col justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#FACC15] border-[3px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center font-black text-2xl text-black shrink-0">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xl text-black truncate">{u.username}</h4>
                        <span className="inline-block bg-[#FEF08A] text-black font-mono font-black text-[10px] px-2 py-0.5 border border-black mt-1">
                          {u.role === "admin" ? "مسؤول كامل (Admin)" : `${u.permissions?.length || 0} صلاحية فصل`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t-2 border-black">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="flex-1 bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 py-2.5 font-black text-xs uppercase transition-all cursor-pointer"
                      >
                        تعديل الصلاحيات
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.username)}
                        className="w-10 bg-[#EF4444] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0"
                        title="حذف الخادم"
                      >
                        <Trash2 size={18} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. BRANDING SETTINGS */}
        {activeSection === "branding" && (
          <div className="max-w-2xl bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-black text-black uppercase">هوية النظام والأيقونة</h3>
              <p className="text-xs font-bold text-black/60">تخصيص اللوجو الظاهر في أعلى التطبيق</p>
            </div>

            <div className="border-[3px] border-black p-6 bg-[#FDF8F0] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center overflow-hidden shrink-0">
                {brand.icon?.startsWith("data:image") ? (
                  <img
                    alt="brand"
                    src={brand.icon}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{brand.icon}</span>
                )}
              </div>
              <div className="flex-1 w-full flex flex-col gap-3">
                <button
                  onClick={() => setBrand({ ...brand, icon: "⛪" })}
                  className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 py-2.5 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Home size={16} />
                  <span>استعادة الأيقونة الافتراضية ⛪</span>
                </button>
                <label className="bg-[#A3E635] border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 py-2.5 font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all text-black">
                  <Camera size={16} />
                  <span>رفع لوجو أو صورة جديدة</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setCropImage(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={async () => {
                setBrandLoading(true);
                await settingsDB.set(brand);
                setBrandLoading(false);
                alert("تم حفظ الهوية بنجاح!");
              }}
              className="w-full bg-[#FACC15] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none py-4 font-black text-base uppercase flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              disabled={brandLoading}
            >
              <Save size={20} className="stroke-[2.5]" />
              <span>{brandLoading ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
            </button>
          </div>
        )}

        {/* 4. SECURITY & ROOT KEY */}
        {activeSection === "security" && (
          <div className="max-w-2xl bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h3 className="text-2xl font-black text-black uppercase">مفتاح الاسترجاع الرئيسي</h3>
              <p className="text-xs font-bold text-black/60">تغيير كود الطوارئ لحسابات المشرفين</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-black">
                المفتاح السري الجديد
              </label>
              <div className="relative flex items-center bg-[#FDF8F0] border-[3px] border-black shadow-[4px_4px_0px_#000000]">
                <div className="bg-[#FB923C] border-l-[3px] border-black p-3.5 flex items-center justify-center">
                  <Key size={20} className="stroke-[2.5] text-black" />
                </div>
                <input
                  type="password"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent px-4 py-3 text-black font-black text-lg outline-none"
                />
              </div>
              <p className="text-xs font-bold text-black/60 leading-relaxed">
                * عند تغيير هذا المفتاح، سيُطلب من أي مشرف إدخال الكود الجديد عند استعادة كلمة المرور.
              </p>
            </div>

            <button
              onClick={async () => {
                if (!newSecret.trim()) return;
                setSecretLoading(true);
                await onUpdateSecret(newSecret.trim());
                setNewSecret("");
                setSecretLoading(false);
                alert("تم تحديث مفتاح الاسترجاع بنجاح!");
              }}
              className="w-full bg-[#FB923C] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none py-4 font-black text-base uppercase flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              disabled={secretLoading || !newSecret.trim()}
            >
              <Shield size={20} className="stroke-[2.5]" />
              <span>{secretLoading ? "جاري التحديث..." : "تحديث المفتاح السري"}</span>
            </button>
          </div>
        )}
      </main>

      {/* ── EDIT USER PERMISSIONS MODAL ── */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60" dir="rtl">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] bg-white border-[4px] border-black shadow-[10px_10px_0px_#000000] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b-[3px] border-black bg-[#FACC15] flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-black uppercase">
                    صلاحيات: {editingUser.username}
                  </h3>
                  <p className="text-xs font-bold text-black/70">حدد الفصول والصلاحيات الإدارية المتاحة</p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                >
                  <X size={20} className="stroke-[3]" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Admin Powers */}
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-widest mb-3">
                    الصلاحيات الإدارية
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "perm_admin",
                        label: "مسؤول كامل (Admin)",
                        desc: "يمتلك كل الصلاحيات الإدارية والوصول لكل شيء",
                      },
                      {
                        id: "perm_delete_student",
                        label: "حذف السجلات",
                        desc: "صلاحية مسح بيانات المخدومين والغياب",
                      },
                    ].map((p) => {
                      const isChecked = tempPerms.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleTogglePerm(p.id)}
                          className={`p-4 border-[3px] border-black cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? "bg-[#DCFCE7] shadow-[3px_3px_0px_#000000]"
                              : "bg-[#FDF8F0] hover:bg-white"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                              isChecked ? "bg-[#A3E635]" : "bg-white"
                            }`}
                          >
                            {isChecked && <Check size={16} strokeWidth={3} className="text-black" />}
                          </div>
                          <div>
                            <span className="font-black text-sm text-black block">{p.label}</span>
                            <span className="text-[11px] font-bold text-black/60">{p.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Class Visibility */}
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-widest mb-3">
                    فصول الخدمة المصرح بها
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {classList.map((cls) => {
                      const isChecked = tempPerms.includes(cls.id);
                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleTogglePerm(cls.id)}
                          className={`p-3.5 border-2 border-black cursor-pointer transition-all flex items-center justify-between ${
                            isChecked
                              ? "bg-[#FEF08A] shadow-[2px_2px_0px_#000000]"
                              : "bg-[#FDF8F0] hover:bg-white"
                          }`}
                        >
                          <span className="font-black text-xs text-black truncate">{cls.name}</span>
                          <div
                            className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 ${
                              isChecked ? "bg-[#FACC15]" : "bg-white"
                            }`}
                          >
                            {isChecked && <Check size={14} strokeWidth={3} className="text-black" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t-[3px] border-black bg-[#FDF8F0] flex gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-white border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 py-3 font-black text-sm uppercase transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={savePermissions}
                  disabled={saving}
                  className="flex-[2] bg-[#A3E635] text-black border-[3px] border-black shadow-[3px_3px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 py-3 font-black text-sm uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check size={18} strokeWidth={3} />
                  <span>{saving ? "جاري الحفظ..." : "حفظ وتفعيل الصلاحيات"}</span>
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {cropImage && (
        <ImageCropperModal
          imageSrc={cropImage}
          onCropDone={(croppedB64) => {
            setBrand({ ...brand, icon: croppedB64 });
            setCropImage(null);
          }}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}
