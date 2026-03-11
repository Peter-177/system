import { useState, useEffect } from "react";
import { Page, Navbar, Empty } from "../components/UI";
import { getAllUsersFB, updateUserPermissionsFB, deleteUserFB } from "../services/firestoreService";
import { classesDB, studentsDB } from "../data/storage";

export function AdminPage({ currentUser, onBack, onGoClasses, onGoAddStudent, onGoCreateClass }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // The user currently being edited
  const [tempPerms, setTempPerms] = useState([]); // Temporary permissions while editing
  const [saving, setSaving] = useState(false);

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
        <Navbar title="غير مصرح" onBack={onBack} />
        <Empty message="هذه الصفحة للمشرفين فقط" icon="🔒" />
      </Page>
    );
  }

  const handleEditClick = (u) => {
    setEditingUser(u);
    setTempPerms(u.permissions || []);
  };

  const handleTogglePerm = (classId) => {
    if (tempPerms.includes(classId)) {
      setTempPerms(tempPerms.filter((id) => id !== classId));
    } else {
      setTempPerms([...tempPerms, classId]);
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
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;
    
    try {
      await deleteUserFB(username);
      setUsers(users.filter(u => u.username !== username));
    } catch (err) {
      console.error(err);
      alert("فشل حذف المستخدم");
    }
  };

  return (
    <Page>
      <Navbar title="لوحة الإدارة (Admin)" onBack={onBack} />
      
      <div className="flex-1 px-5 py-6 max-w-lg mx-auto w-full pb-24 animate-slideUp" dir="rtl">
        <h2 className="text-xl font-extrabold text-base-content tracking-tight mb-5 px-1">نظرة عامة</h2>

        {/* Featured Actions Section */}
        <div className="mb-8">
          <button 
            onClick={onGoClasses}
            className="relative group w-full p-6 flex items-center justify-between rounded-[2rem] bg-base-100 border border-base-200 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
          >
            {/* Background Accent Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-4xl shadow-lg border border-white/20 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500">
                📚
              </div>
              <div className="text-right">
                <div className="text-2xl font-black tracking-tight leading-tight text-base-content group-hover:text-primary transition-colors">إدارة الفصول</div>
                <div className="text-sm font-bold text-base-content/40 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>{classList.length} فصول متاحة</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-12 h-12 rounded-xl bg-base-200 text-base-content/30 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="relative group p-4 flex flex-col items-center justify-center rounded-[1.5rem] bg-base-100 border border-base-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl mb-2">👥</div>
            <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">الطلاب</div>
            <div className="text-xl font-black text-base-content">{totalStudents}</div>
          </div>
          
          <div className="relative group p-4 flex flex-col items-center justify-center rounded-[1.5rem] bg-base-100 border border-base-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/20">
            <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-2">📚</div>
            <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">الفصول</div>
            <div className="text-xl font-black text-base-content">{classList.length}</div>
          </div>

          <div className="relative group p-4 flex flex-col items-center justify-center rounded-[1.5rem] bg-base-100 border border-base-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-info/20">
            <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center text-xl mb-2">🛡️</div>
            <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">المستخدمين</div>
            <div className="text-xl font-black text-base-content">{users.length + 1}</div>
          </div>

          <div className="relative group p-4 flex flex-col items-center justify-center rounded-[1.5rem] bg-base-100 border border-base-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-warning/20">
            <div className="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center text-xl mb-2">🎂</div>
            <div className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">أعياد الميلاد</div>
            <div className="text-xl font-black text-base-content">{birthdaysToday}</div>
          </div>
        </div>

        {/* Quick Actions Title */}
        <h2 className="text-lg font-extrabold text-base-content tracking-tight mb-4 px-1">إجراءات سريعة</h2>
        
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <button 
            onClick={onGoAddStudent}
            className="flex flex-col items-center p-3 rounded-2xl bg-base-100 border border-base-200 hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-2">👤</div>
            <span className="text-[10px] font-bold">إضافة طالب</span>
          </button>
          
          <button 
            onClick={onGoCreateClass}
            className="flex flex-col items-center p-3 rounded-2xl bg-base-100 border border-base-200 hover:border-secondary/40 hover:bg-secondary/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl mb-2">🏗️</div>
            <span className="text-[10px] font-bold">إنشاء فصل</span>
          </button>

          <button 
            onClick={onBack}
            className="flex flex-col items-center p-3 rounded-2xl bg-base-100 border border-base-200 hover:border-neutral/40 hover:bg-neutral/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral/10 text-neutral flex items-center justify-center text-xl mb-2">🏠</div>
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
        </div>


        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-bold text-base-content">مستخدمين النظام</h2>
          <div className="badge badge-primary badge-outline font-mono font-bold leading-none py-2.5">
            {users.length}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center mt-12">
            <span className="loading loading-spinner text-primary loading-lg"></span>
          </div>
        ) : users.length === 0 ? (
          <Empty message="لا يوجد مستخدمين آخرين حتى الآن" icon="👥" />
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u, i) => (
              <div 
                key={u.username} 
                className="group flex flex-col p-4 rounded-[1.25rem] bg-base-100 border border-base-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 animate-fadeIn relative overflow-hidden"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Edge Highlight */}
                <div className="absolute inset-y-0 right-0 w-1.5 rounded-r-[1.25rem] bg-primary/0 group-hover:bg-primary/80 transition-colors duration-300"></div>

                <div className="flex items-center justify-between pl-1 pr-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-base-200 text-base-content border border-base-300 shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] text-base-content group-hover:text-primary transition-colors">{u.username}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        <span className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">
                          {u.permissions?.length || 0} فصول مسموحة
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      className="btn btn-sm btn-ghost hover:bg-primary hover:text-primary-content text-base-content/50 rounded-xl transition-all"
                      onClick={() => handleEditClick(u)}
                    >
                      تعديل ⚙️
                    </button>
                    <button 
                      className="btn btn-sm btn-ghost hover:bg-error hover:text-error-content text-base-content/30 rounded-xl transition-all"
                      onClick={() => handleDeleteUser(u.username)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  <h3 className="font-extrabold text-xl text-base-content">تعديل الصلاحيات</h3>
                  <p className="text-sm font-semibold text-primary mt-0.5 tracking-wide">{editingUser.username}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl shadow-inner border border-primary/20">
                  🛡️
                </div>
              </div>
              
              <div className="overflow-y-auto pr-1 flex-1 py-1 space-y-2 min-h-[200px] custom-scrollbar">
                {classList.length === 0 ? (
                  <p className="text-sm text-center text-base-content/40 mt-8 font-medium">لا يوجد فصول. قم بإنشاء فصول أولاً.</p>
                ) : (
                  classList.map((cls) => {
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
                  })
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-base-200 shrink-0">
                <button 
                  className="btn flex-1 btn-ghost border border-base-300 h-12 rounded-xl text-[15px] font-bold" 
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  إلغاء
                </button>
                <button 
                  className="btn flex-1 btn-primary h-12 rounded-xl text-[15px] font-bold shadow-md hover:shadow-lg transition-shadow border-none" 
                  onClick={savePermissions}
                  disabled={saving}
                >
                  {saving ? <span className="loading loading-spinner"></span> : "حفظ الصلاحيات"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
