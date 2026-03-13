import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Page, Navbar, Empty, ImageCropperModal } from "../components/UI";
import { getAllUsersFB, updateUserPermissionsFB, deleteUserFB } from "../services/firestoreService";
import { classesDB, studentsDB, settingsDB } from "../data/storage";

export function AdminPage({ currentUser, onBack, onGoClasses, onGoAddStudent, onGoCreateClass, onUpdateSecret }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // The user currently being edited
  const [tempPerms, setTempPerms] = useState([]); // Temporary permissions while editing
  const [saving, setSaving] = useState(false);
  const [newSecret, setNewSecret] = useState("");
  const [secretLoading, setSecretLoading] = useState(false);

  // App Settings state
  const [brand, setBrand] = useState(settingsDB.get());
  const [brandLoading, setBrandLoading] = useState(false);
  const [cropImage, setCropImage] = useState(null); // For cropping new custom icon

  const allClasses = classesDB.getAll();
  const classList = Object.entries(allClasses).map(([id, cls]) => ({ id, ...cls }));
  const totalStudents = Object.keys(studentsDB.getAll()).length;

  // Birthday calculation
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const todayStr = `${day}/${month}`;
  const birthdaysToday = Object.values(studentsDB.getAll()).filter(s => s.birthdate?.startsWith(todayStr)).length;


  useEffect(() => {
    // Only load if admin
    if (currentUser?.role !== "admin") {
      setLoading(false);
      return;
    }

    getAllUsersFB().then((data) => {
      // Exclude the main admin from the list of editable users to prevent locking themselves out
      const userList = Object.values(data).filter(u => u.role !== "admin");
      setUsers(userList);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [currentUser]);

  // Security barrier
  if (currentUser?.role !== "admin") {
    return (
      <Page>
        <Navbar title="مينفعش تدخل" onBack={onBack} />
        <Empty message="الصفحة دي للمشرفين بس" icon="🔒" />
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
    
    // Update local state
    setUsers(users.map(u => 
      u.username === editingUser.username ? { ...u, permissions: tempPerms } : u
    ));
    
    setSaving(false);
    setEditingUser(null);
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`  متأكد عايز تمسح الخادم "${username}"؟`)) return;
    
    try {
      await deleteUserFB(username);
      setUsers(users.filter(u => u.username !== username));
    } catch (err) {
      console.error(err);
      alert("معلش، ما عرفناش نمسح الخادم");
    }
  };

  const handleExportExcel = () => {
    const students = studentsDB.getAll();
    const data = Object.entries(students).map(([qrId, s]) => ({
      "الكود (ID)": qrId,
      "الاسم": s.name || "",
      "السنة الدراسية": s.year || "",
      "العنوان": s.address || "",
      "رقم التليفون": s.phone || "",
      "تاريخ الميلاد": s.birthdate || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "بيانات الأطفال");
    XLSX.writeFile(wb, "بيانات_الأطفال.xlsx");
  };

  return (
    <Page>
      <Navbar title="Admin Dashboard" onBack={onBack} />
      
      <div className="flex-1 px-5 py-6 lg:max-w-7xl lg:px-10 mx-auto w-full pb-24 animate-slideUp" dir="rtl">
        <h2 className="text-xl lg:text-3xl font-extrabold text-base-content tracking-tight mb-8 lg:mb-10 px-1">لوحة التحكم</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column - Left/Center on Desktop (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Featured Action: Management */}
            <div>
              <button 
                onClick={onGoClasses}
                className="relative group w-full p-8 flex items-center justify-between rounded-[2.5rem] bg-base-100 border border-base-200 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
              >
                {/* Background Accent Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary text-primary-content flex items-center justify-center text-5xl shadow-lg border border-white/20 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500">
                    📚
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black tracking-tight leading-tight text-base-content group-hover:text-primary transition-colors">إدارة الفصول</div>
                    <div className="text-base font-bold text-base-content/40 flex items-center gap-2 mt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                      <span>{classList.length} فصول موجودة</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 w-14 h-14 rounded-2xl bg-base-200 text-base-content/30 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Servants Section */}
            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-base-content">الخدام</h2>
                  <div className="badge badge-primary badge-md font-bold px-3 py-3 shadow-sm">
                    {users.length}
                  </div>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-base-content/30">Team Members</div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20 bg-base-200/30 rounded-[2.5rem] border border-dashed border-base-300">
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-10">
                  <Empty message="مافيش خدام تانيين لسه" icon="👥" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((u, i) => (
                    <div 
                      key={u.username} 
                      className="group flex flex-col p-5 rounded-[2rem] bg-base-100 border border-base-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-500 animate-fadeIn relative overflow-hidden"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      {/* Edge Highlight */}
                      <div className="absolute inset-y-0 right-0 w-1.5 rounded-r-[2rem] bg-primary/0 group-hover:bg-primary/80 transition-colors duration-300"></div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-base-200 text-base-content border border-base-300 shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-base-content group-hover:text-primary transition-colors">{u.username}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                              <span className="text-xs font-bold text-base-content/50 uppercase tracking-widest">
                                {u.permissions?.length || 0} فصول مسموح بيهم
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary text-base-content/50 rounded-xl transition-all font-bold px-3"
                            onClick={() => handleEditClick(u)}
                          >
                           الصلاحيات ⚙️
                          </button>
                          <button 
                            className="btn btn-xs btn-ghost hover:bg-error/10 hover:text-error text-base-content/20 rounded-lg transition-all"
                            onClick={() => handleDeleteUser(u.username)}
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right on Desktop (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group p-5 flex flex-col items-center justify-center rounded-[2rem] bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-3 shadow-sm">👥</div>
                <div className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest text-center">الاطفال</div>
                <div className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{totalStudents}</div>
              </div>
              
              <div className="relative group p-5 flex flex-col items-center justify-center rounded-[2rem] bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/30 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mb-3 shadow-sm">🎂</div>
                <div className="text-[10px] font-black text-rose-600/60 dark:text-rose-400/60 uppercase tracking-widest text-center">أعياد الميلاد</div>
                <div className="text-2xl font-black text-rose-900 dark:text-rose-100">{birthdaysToday}</div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-[2.5rem] bg-base-200/50 border border-base-300 shadow-sm">
              <h3 className="text-sm font-black text-base-content/40 uppercase tracking-widest mb-4 px-2">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={onGoAddStudent}
                  className="flex flex-col items-center p-4 rounded-3xl bg-base-100 border border-base-200 hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">👤</div>
                  <span className="text-xs font-bold text-base-content/80">ضيف طفل</span>
                </button>
                
                <button 
                  onClick={onGoCreateClass}
                  className="flex flex-col items-center p-4 rounded-3xl bg-base-100 border border-base-200 hover:border-secondary/40 hover:bg-secondary/5 hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">🏗️</div>
                  <span className="text-xs font-bold text-base-content/80">فصل جديد</span>
                </button>
              </div>

              <button 
                onClick={handleExportExcel}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-3xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] group"
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform">📊</span>
                <span className="font-bold text-sm">نزل كل البيانات (Excel)</span>
              </button>
            </div>

            {/* App Branding Editor */}
            <div className="p-6 rounded-[2.5rem] bg-base-100 border border-base-200 shadow-sm relative overflow-hidden group">
              <h3 className="text-lg font-black mb-1">شعار الموقع</h3>
              <p className="text-xs text-base-content/40 mb-6 leading-relaxed">غير اسم وشعار الخدمة اللي بيظهر فوق.</p>
              
              <div className="flex flex-col gap-5">
                <div className="space-y-3">
                   <div className="form-control">
                     <label className="label py-1"><span className="label-text-alt font-black opacity-30 uppercase tracking-tighter">Line 1</span></label>
                     <input 
                      type="text"
                      placeholder="SUNDAY"
                      className="input input-md bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-primary/30 font-black"
                      value={brand.nameTop}
                      onChange={(e) => setBrand({...brand, nameTop: e.target.value.toUpperCase()})}
                    />
                   </div>
                   <div className="form-control">
                     <label className="label py-1"><span className="label-text-alt font-black opacity-30 uppercase tracking-tighter">Line 2</span></label>
                     <input 
                        type="text"
                        placeholder="SCHOOL"
                        className="input input-md bg-base-200 border-none rounded-2xl focus:ring-2 focus:ring-primary/30 font-bold"
                        value={brand.nameBottom}
                        onChange={(e) => setBrand({...brand, nameBottom: e.target.value.toUpperCase()})}
                      />
                   </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 flex justify-between">
                    <span className="label-text-alt font-black opacity-30 uppercase tracking-tighter">Icon</span>
                  </label>
                  
                  <div className="bg-base-200/50 p-4 rounded-[2rem] border border-base-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-focus flex items-center justify-center text-white shadow-xl overflow-hidden shrink-0">
                        {brand.icon?.startsWith("data:image") ? (
                          <img src={brand.icon} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-black">{brand.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <button
                          onClick={() => setBrand({...brand, icon: "⛪"})}
                          className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all border ${brand.icon === "⛪" ? 'bg-primary text-white border-primary shadow-md' : 'bg-base-100 hover:bg-base-200 border-base-300 text-base-content/60'}`}
                        >
                          ⛪ افتراضي
                        </button>
                      </div>
                    </div>

                    <label className="btn btn-sm w-full bg-base-100 border-base-300 rounded-xl hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest">تحميل من الكمبيوتر</span>
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
                  className="btn btn-primary w-full h-14 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all border-none"
                  onClick={async () => {
                    setBrandLoading(true);
                    await settingsDB.set(brand);
                    setBrandLoading(false);
                    alert("تم تحديث شعار الخدمة بنجاح!");
                  }}
                  disabled={brandLoading}
                >
                  {brandLoading ? <span className="loading loading-spinner"></span> : "حفظ التغييرات"}
                </button>
              </div>
            </div>

            {/* Security / Secret Key Section */}
            <div className="p-6 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 shadow-sm relative overflow-hidden group">
              <h3 className="text-lg font-black text-amber-700 dark:text-amber-400 mb-1">الأمان</h3>
              <p className="text-xs text-amber-700/60 dark:text-amber-400/50 mb-6 leading-relaxed">الرقم السري بيستخدم لاستعادة الحساب. حافظ عليه.</p>
              
              <div className="flex flex-col gap-3">
                <input 
                  type="password"
                  placeholder="رقم سري جديد..."
                  className="input input-md w-full bg-amber-500/10 border-amber-500/20 rounded-2xl focus:ring-2 focus:ring-amber-500/30 text-amber-900 dark:text-amber-100 placeholder:text-amber-700/30"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                />
                <button 
                  className="btn w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black border-none shadow-lg shadow-amber-500/20"
                  onClick={async () => {
                    if (!newSecret.trim()) return;
                    setSecretLoading(true);
                    await onUpdateSecret(newSecret.trim());
                    setNewSecret("");
                    setSecretLoading(false);
                    alert("تم حفظ الرقم السري بنجاح!");
                  }}
                  disabled={secretLoading || !newSecret.trim()}
                >
                  {secretLoading ? <span className="loading loading-spinner loading-sm"></span> : "تحديث الرقم السري"}
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-4 opacity-20 hover:opacity-100 transition-opacity">
               <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-primary">Back to Home</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Permissions Modal overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn" dir="rtl">
          <div className="w-full max-w-sm bg-base-100 rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl animate-slideUp flex flex-col max-h-[85vh] border border-base-200/50 relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

            <div className="p-6 flex flex-col overflow-hidden relative z-10">
              <div className="flex items-center justify-between border-b border-base-200/50 pb-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-base-content">ظبط الصلاحيات</h3>
                  <p className="text-sm font-semibold text-primary mt-0.5 tracking-wide">{editingUser.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner border border-primary/20">
                  🛡️
                </div>
              </div>
              
              <div className="overflow-y-auto pr-1 flex-1 py-1 space-y-4 min-h-[200px] custom-scrollbar">
                {/* Special Permissions Section */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-base-content/30 mb-2 px-1">صلاحيات خاصة</h4>
                  <div className="flex flex-col gap-2">
                    {/* Add Student Permission */}
                    <label 
                      onClick={() => handleTogglePerm("perm_add_student")}
                      className={`group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        tempPerms.includes("perm_add_student") 
                          ? "bg-primary/5 border-primary/30 shadow-sm" 
                          : "bg-base-100 border-base-200 hover:border-base-300 hover:bg-base-200/50"
                      }`}
                    >
                      <div>
                        <span className={`font-bold block transition-colors ${tempPerms.includes("perm_add_student") ? 'text-primary' : 'text-base-content'}`}>
                          👤 إضافة أطفال
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-base-content/40 block mt-0.5">
                          يقدر يضيف أطفال جداد
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${tempPerms.includes("perm_add_student") ? 'bg-primary border-primary text-white shadow-inner' : 'bg-base-100 border-base-300'}`}>
                        {tempPerms.includes("perm_add_student") && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </label>

                    {/* Delete Student Permission */}
                    <label 
                      onClick={() => handleTogglePerm("perm_delete_student")}
                      className={`group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        tempPerms.includes("perm_delete_student") 
                          ? "bg-error/5 border-error/30 shadow-sm" 
                          : "bg-base-100 border-base-200 hover:border-base-300 hover:bg-base-200/50"
                      }`}
                    >
                      <div>
                        <span className={`font-bold block transition-colors ${tempPerms.includes("perm_delete_student") ? 'text-error' : 'text-base-content'}`}>
                          🗑️ مسح الأطفال
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-base-content/40 block mt-0.5">
                          يقدر يمسح بيانات أي طفل
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${tempPerms.includes("perm_delete_student") ? 'bg-error border-error text-white shadow-inner' : 'bg-base-100 border-base-300'}`}>
                        {tempPerms.includes("perm_delete_student") && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Class Permissions Section */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-base-content/30 mb-2 px-1">صلاحيات الفصول</h4>
                  {classList.length === 0 ? (
                    <p className="text-sm text-center text-base-content/40 mt-4 font-medium">مافيش فصول. اعمل فصول الأول.</p>
                  ) : (
                    <div className="space-y-2">
                      {classList.map((cls) => {
                        const isChecked = tempPerms.includes(cls.id);
                        return (
                          <label 
                            key={cls.id} 
                            onClick={() => handleTogglePerm(cls.id)}
                            className={`group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                              isChecked 
                                ? "bg-primary/5 border-primary/30 shadow-sm" 
                                : "bg-base-100 border-base-200 hover:border-base-300 hover:bg-base-200/50"
                            }`}
                          >
                            <div>
                              <span className={`font-bold block transition-colors ${isChecked ? 'text-primary' : 'text-base-content'}`}>
                                {cls.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-base-content/40 block mt-0.5">
                                {cls.grades?.join("، ")}
                              </span>
                            </div>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${isChecked ? 'bg-primary border-primary text-primary-content shadow-inner' : 'bg-base-100 border-base-300'}`}>
                              {isChecked && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-base-200 shrink-0">
                <button 
                  className="btn flex-1 btn-ghost border border-base-300 h-12 rounded-xl text-[15px] font-bold" 
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  لا خلاص
                </button>
                <button 
                  className="btn flex-1 btn-primary h-12 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-shadow border-none" 
                  onClick={savePermissions}
                  disabled={saving}
                >
                  {saving ? <span className="loading loading-spinner"></span> : "سجل الصلاحيات"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal for custom icon */}
      {cropImage && (
        <ImageCropperModal 
          imageSrc={cropImage}
          onCropDone={(croppedB64) => {
            setBrand({...brand, icon: croppedB64});
            setCropImage(null);
          }}
          onCancel={() => setCropImage(null)}
        />
      )}
    </Page>
  );
}
