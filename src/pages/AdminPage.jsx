import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Page,
  Navbar,
  Empty,
  ImageCropperModal,
  Sidebar,
  Avatar,
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
  ArrowLeft,
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
} from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

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
        const userList = Object.values(data).filter((u) => u.role !== "admin");
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
      <Page>
        <Navbar title="الوصول محظور" onBack={onBack} />
        <Empty
          message="عفواً، هذه المنطقة للمشرفين فقط"
          icon={<ShieldCheck size={64} className="text-red-400 opacity-50" />}
        />
      </Page>
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
          ? { ...u, permissions: tempPerms }
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
        <!--[if gte mso 9]>
        <xml>
         <x:ExcelWorkbook>
          <x:ExcelWorksheets>
           <x:ExcelWorksheet>
            <x:Name>البيانات</x:Name>
            <x:WorksheetOptions>
             <x:DisplayRightToLeft/>
             <x:FreezePanes/>
             <x:FrozenNoSplit/>
             <x:SplitHorizontal>1</x:SplitHorizontal>
             <x:TopRowBottomPane>1</x:TopRowPane>
            </x:WorksheetOptions>
           </x:ExcelWorksheet>
          </x:ExcelWorksheets>
         </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: 'Segoe UI', tahoma, sans-serif; }
          th { background-color: #1F4E78; color: #FFFFFF; font-weight: bold; border: 1px solid #B4C6E7; padding: 10px; text-align: center; font-size: 14px; }
          td { border: 1px solid #D9E1F2; padding: 8px; text-align: center; color: #333333; font-size: 13px; vertical-align: middle; }
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
              <td style="mso-number-format:'\@'; color: #1F4E78; font-weight: bold;">${r[3]}</td>
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

    // \ufeff enables UTF-8 BOM so Excel reads Arabic perfectly
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

  const renderSidebar = () => (
    <Sidebar branding={{ icon: brand.icon }}>
      <button
        onClick={() => {
          setActiveSection("dashboard");
          closeMobileMenu();
        }}
        className={`tech-sidebar-item ${activeSection === "dashboard" ? "active" : ""}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>لوحة التحكم</span>
      </button>
      <button
        onClick={() => {
          setActiveSection("servants");
          closeMobileMenu();
        }}
        className={`tech-sidebar-item ${activeSection === "servants" ? "active" : ""}`}
      >
        <Users className="w-5 h-5" />
        <span>إدارة الخدام</span>
      </button>
      <button
        onClick={() => {
          setActiveSection("branding");
          closeMobileMenu();
        }}
        className={`tech-sidebar-item ${activeSection === "branding" ? "active" : ""}`}
      >
        <Palette className="w-5 h-5" />
        <span>هوية النظام</span>
      </button>
      <button
        onClick={() => {
          setActiveSection("security");
          closeMobileMenu();
        }}
        className={`tech-sidebar-item ${activeSection === "security" ? "active" : ""}`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span>الأمان</span>
      </button>

      <div className="mt-12 pt-6 border-t border-white/5 mb-4">
        <p className="px-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
          Data Management
        </p>
      </div>
      <button
        onClick={() => {
          handleExportExcel();
          closeMobileMenu();
        }}
        className="tech-sidebar-item group/export"
      >
        <Database className="w-5 h-5 group-hover/export:text-sky-400 transition-colors" />
        <span>تصدير البيانات</span>
      </button>
      <button
        onClick={() => {
          closeMobileMenu();
          onBack();
        }}
        className="tech-sidebar-item text-red-400/60 hover:text-red-400 hover:bg-red-500/5 mt-auto"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>رجوع</span>
      </button>
    </Sidebar>
  );

  return (
    <Page sidebar={renderSidebar()}>
      <Navbar
        title={
          activeSection === "dashboard"
            ? "Executive Overview"
            : activeSection === "servants"
              ? "Member Directory"
              : activeSection === "branding"
                ? "Brand Editor"
                : "Security Shield"
        }
        onBack={onBack}
        right={
          <button
            type="button"
            className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1a2332] border border-white/[0.06] text-[#c8d4e0] shadow-none transition-colors hover:bg-[#222d3d] hover:text-white active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            aria-label="فتح القائمة"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-drawer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="flex flex-col items-center justify-center gap-[5px]" aria-hidden>
              <span className="block h-[2px] w-[18px] rounded-full bg-current" />
              <span className="block h-[2px] w-[18px] rounded-full bg-current" />
              <span className="block h-[2px] w-[18px] rounded-full bg-current" />
            </span>
          </button>
        }
      />

      {/* قائمة جانبية للموبايل (نفس محتوى الشريط — الشريط مخفي تحت md) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[200] md:hidden"
          id="admin-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة الإدارة"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"
            aria-label="إغلاق القائمة"
            onClick={closeMobileMenu}
          />
          <aside className="absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-white/10 bg-slate-900/98 shadow-2xl animate-reveal overflow-y-auto">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                القائمة
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a2332] border border-white/[0.06] text-[#c8d4e0] transition-colors hover:bg-[#222d3d] hover:text-white active:scale-95"
                aria-label="إغلاق"
                onClick={closeMobileMenu}
              >
                <X className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
            <div className="min-h-0 flex-1">{renderSidebar()}</div>
          </aside>
        </div>
      )}

      <div
        className="flex-1 px-8 py-10 md:px-16 w-full pb-32 overflow-y-auto"
        dir="rtl"
      >
        {activeSection === "dashboard" && (
          <div className="max-w-7xl animate-reveal">
            <header className="mb-14 flex items-center gap-6">
              <div className="w-1.5 h-12 bg-sky-500 rounded-full"></div>
              <div>
                <h2 className="text-4xl font-black text-sky-50 tracking-tighter mb-2 italic">
                  Control Panel
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  Real-time system diagnostics & management
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="tech-card !p-8 group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">
                      Total Students
                    </p>
                    <span className="text-4xl font-black text-sky-50 tracking-tighter">
                      {totalStudents}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tech-card !p-8 group hover:border-pink-500/20 shadow-none hover:shadow-pink-500/5 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <Cake size={32} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">
                      Birthdays Today
                    </p>
                    <span className="text-4xl font-black text-sky-50 tracking-tighter">
                      {birthdaysToday}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tech-card !p-8 group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-azure-600/10 border border-azure-600/20 flex items-center justify-center text-azure-600 group-hover:scale-110 transition-transform">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">
                      Active Classes
                    </p>
                    <span className="text-4xl font-black text-sky-50 tracking-tighter">
                      {classList.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="tech-panel !p-10 col-span-2">
                <h3 className="text-2xl font-black text-sky-50 mb-10 flex items-center gap-4">
                  <LayoutDashboard className="text-sky-500" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={onGoClasses}
                    className="tech-card !p-10 group flex items-start gap-6 hover:bg-slate-800/80 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-sky-400 border border-white/5 transition-colors group-hover:border-sky-400/40">
                      <BookOpen size={28} />
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-xl text-sky-50 mb-1">
                        الفصول
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Manage All Stages
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={onGoAddStudent}
                    className="tech-card !p-10 group flex items-start gap-6 hover:bg-slate-800/80 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-sky-400 border border-white/5 transition-colors group-hover:border-sky-400/40">
                      <PlusCircle size={28} />
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-xl text-sky-50 mb-1">
                        إضافة طفل
                      </span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Enroll New Member
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="tech-panel !p-10 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-950 border border-white/5 flex items-center justify-center text-sky-500 shadow-2xl mb-8 relative group">
                  <div className="absolute inset-0 bg-sky-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Download size={40} className="relative z-10" />
                </div>
                <h4 className="font-black text-2xl text-sky-50 mb-3 tracking-tighter">
                  System Export
                </h4>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed font-bold uppercase tracking-tight opacity-70">
                  Archive all registered data to an encrypted Excel binary.
                </p>
                <button
                  onClick={handleExportExcel}
                  className="tech-btn-primary w-full shadow-2xl"
                >
                  <span>Download Records</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "servants" && (
          <div className="max-w-6xl animate-reveal">
            <header className="mb-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-1.5 h-12 bg-sky-500 rounded-full"></div>
                <div>
                  <h2 className="text-4xl font-black text-sky-50 tracking-tighter mb-2 italic">
                    Servants Registry
                  </h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    Access control & permission management
                  </p>
                </div>
              </div>
              <div className="tech-badge">{users.length} Active Accounts</div>
            </header>

            {loading ? (
              <div className="tech-panel flex flex-col items-center justify-center py-40 animate-pulse">
                <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-slate-400 font-black tracking-widest uppercase text-xs">
                  Synchronizing Database...
                </p>
              </div>
            ) : users.length === 0 ? (
              <Empty
                message="لا يوجد خدام مسجلين حالياً"
                icon={<Users size={64} className="opacity-20" />}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {users.map((u) => (
                  <div key={u.username} className="tech-card group relative">
                    <div className="flex items-center gap-5 mb-10">
                      <Avatar name={u.username} size="md" />
                      <div className="min-w-0">
                        <h4 className="font-black text-2xl text-sky-50 truncate tracking-tight">
                          {u.username}
                        </h4>
                        <span className="text-sky-500/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1 block">
                          {u.permissions?.length || 0} active keys
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="tech-btn-secondary flex-1 !px-4 !py-3 text-xs"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.username)}
                        className="w-12 h-12 rounded-2xl border border-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-sky-400 transition-colors shadow-[0_0_10px_rgba(56,189,248,0)] group-hover:shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "branding" && (
          <div className="max-w-3xl animate-reveal">
            <header className="mb-14 flex items-center gap-6">
              <div className="w-1.5 h-12 bg-sky-500 rounded-full"></div>
              <div>
                <h2 className="text-4xl font-black text-sky-50 tracking-tighter mb-2 italic">
                  Global Branding
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  Customize system identity & visuals
                </p>
              </div>
            </header>

            <div className="tech-panel space-y-12">
              <div className="p-10 rounded-[2.5rem] bg-slate-950/50 border border-white/5 flex flex-col md:flex-row items-center gap-10">
                {/* إطار يلتف حول الصورة (بدون مربع ثابت) لتقليل فراغات الزوايا */}
                <div className="relative inline-flex max-w-[min(100%,12.5rem)] max-h-48 min-w-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-white/10 bg-slate-950/90 shadow-2xl shrink-0 group">
                  <div className="pointer-events-none absolute inset-0 bg-sky-500/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />
                  {brand.icon?.startsWith("data:image") ? (
                    <img
                      alt="brand"
                      src={brand.icon}
                      className="relative z-10 block h-auto w-auto max-h-48 max-w-[12.5rem] object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <span className="relative z-10 flex h-32 w-32 items-center justify-center text-6xl">
                      {brand.icon}
                    </span>
                  )}
                </div>
                <div className="flex-1 w-full flex flex-col gap-4">
                  <button
                    onClick={() => setBrand({ ...brand, icon: "⛪" })}
                    className="tech-btn-secondary w-full flex items-center justify-center gap-3"
                  >
                    <Home size={18} />
                    Default Icon
                  </button>
                  <label className="tech-btn-secondary w-full cursor-pointer flex items-center justify-center gap-3 border-sky-400/30 text-sky-400">
                    <Camera size={18} />
                    <span>Upload Custom Identity</span>
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
                  alert("تم التحديث بنجاح!");
                }}
                className="tech-btn-primary w-full !h-16 shadow-[0_0_40px_rgba(14,165,233,0.1)]"
                disabled={brandLoading}
              >
                {brandLoading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  <div className="flex items-center gap-4">
                    <Save size={20} />
                    <span>Propagate Changes</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="max-w-3xl animate-reveal">
            <header className="mb-14 flex items-center gap-6">
              <div className="w-1.5 h-12 bg-sky-400 rounded-full"></div>
              <div>
                <h2 className="text-4xl font-black text-sky-50 tracking-tighter mb-2 italic">
                  Secure Node
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  Encryption keys & root access control
                </p>
              </div>
            </header>

            <div className="tech-panel border-sky-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

              <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-white/5 text-sky-400 flex items-center justify-center mb-10 shadow-2xl relative z-10">
                <ShieldCheck size={40} className="glow-blue" />
              </div>

              <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end mr-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                      Root Access Key
                    </label>
                    <span className="text-[9px] font-black text-sky-500/40 uppercase tracking-widest">
                      Highly Sensitive
                    </span>
                  </div>
                  <input
                    type="password"
                    className="tech-input !h-16 text-center tracking-[0.6em] text-2xl font-black focus:border-sky-400 focus:ring-sky-500/10"
                    value={newSecret}
                    placeholder="••••••••"
                    onChange={(e) => setNewSecret(e.target.value)}
                  />
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 flex items-start gap-5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/5 flex items-center justify-center text-sky-500 shrink-0">
                    <Key size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed text-right">
                    سيؤدي تغيير هذا المفتاح إلى طلب الكود الجديد من جميع
                    المشرفين عند محاولة تسجيل الدخول للمرة القادمة.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    if (!newSecret.trim()) return;
                    setSecretLoading(true);
                    await onUpdateSecret(newSecret.trim());
                    setNewSecret("");
                    setSecretLoading(false);
                    alert("تم التحديث بنجاح!");
                  }}
                  className="tech-btn-primary w-full !h-16 group/btn"
                  disabled={secretLoading || !newSecret.trim()}
                >
                  {secretLoading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Shield
                        size={20}
                        className="group-hover/btn:rotate-12 transition-transform"
                      />
                      <span>Update Encryption Key</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-2xl animate-reveal">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-[3.5rem] overflow-hidden bg-slate-900 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col relative">
            <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-1.5 h-10 bg-sky-500 rounded-full"></div>
                <div>
                  <h3 className="text-3xl font-black text-sky-50 tracking-tighter leading-none italic">
                    Access Node: {editingUser.username}
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-60">
                    Define authority scope within the secure perimeter
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10">
              <div>
                <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  Administrative Authority
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      id: "perm_admin",
                      label: "مسؤول كامل",
                      icon: <Shield className="w-5 h-5" />,
                      desc: "يمتلك كل الصلاحيات الإدارية",
                    },
                    {
                      id: "perm_delete_student",
                      label: "حذف السجلات",
                      icon: <Trash2 className="w-5 h-5" />,
                      desc: "صلاحية حذف بيانات المخدومين",
                    },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleTogglePerm(p.id)}
                      className={`p-6 rounded-3xl border transition-all duration-300 group cursor-pointer ${tempPerms.includes(p.id) ? "bg-sky-500/10 border-sky-400/40 shadow-lg" : "bg-slate-950/40 border-white/5 hover:border-white/10"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl border ${tempPerms.includes(p.id) ? "bg-sky-500/20 border-sky-400/20 text-sky-400" : "bg-slate-900 border-white/5 text-slate-500"}`}
                          >
                            {p.icon}
                          </div>
                          <span
                            className={`font-black text-lg tracking-tight ${tempPerms.includes(p.id) ? "text-sky-400" : "text-sky-50 group-hover:text-sky-200"}`}
                          >
                            {p.label}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${tempPerms.includes(p.id) ? "bg-sky-500 border-sky-500 text-slate-950 scale-110 shadow-lg shadow-sky-500/40" : "border-white/10 bg-slate-900"}`}
                        >
                          {tempPerms.includes(p.id) && (
                            <Check size={14} strokeWidth={4} />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tight opacity-60">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  Stage Visibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {classList.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => handleTogglePerm(cls.id)}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${tempPerms.includes(cls.id) ? "bg-sky-500/10 border-sky-400/40" : "bg-slate-950/40 border-white/5 hover:bg-slate-800"}`}
                    >
                      <span
                        className={`font-black text-sm tracking-tight ${tempPerms.includes(cls.id) ? "text-sky-400" : "text-sky-100/60 transition-colors"}`}
                      >
                        {cls.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${tempPerms.includes(cls.id) ? "bg-sky-500 border-sky-500" : "border-white/10"}`}
                      >
                        {tempPerms.includes(cls.id) && (
                          <Check
                            size={12}
                            strokeWidth={4}
                            className="text-slate-950"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-white/5 bg-slate-950/50 flex gap-6 relative z-10">
              <button
                className="flex-1 h-16 bg-slate-800 text-slate-400 font-black rounded-2xl border border-white/5 hover:bg-slate-700 transition-all active:scale-95"
                onClick={() => setEditingUser(null)}
              >
                DISCARD
              </button>
              <button
                className="tech-btn-primary flex-[2] h-16"
                onClick={savePermissions}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6" />
                    <span className="text-lg">ACTIVATE PERMISSIONS</span>
                  </div>
                )}
              </button>
            </div>

            {/* Modal Ambient Glow */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          </div>
        </div>
      )}

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
    </Page>
  );
}
