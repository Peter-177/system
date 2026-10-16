// SECRET_RESET_KEY is now stored hashed in Firestore (system/admin)

export const ACCENT_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#f97316",
];

export const STORAGE_KEYS = {
  auth: "qrapp_auth",
  session: "qrapp_session",
  currentUser: "qrapp_current_user",
  students: "qrapp_students",
  attendance: "qrapp_attendance",
  coupons: "qrapp_coupons",
  visits: "qrapp_visits",
  users: "qrapp_users",
  classes: "qrapp_classes",
  settings: "qrapp_settings",
  /** ساحة الألعاب — فرق، جولات، نقاط (محلي فقط) */
  gameArena: "qrapp_game_arena",
  summerGameArena: "qrapp_summer_game_arena",
  /** حضور النادي الصيفي (Firebase) */
  summerAttendance: "qrapp_summer_attendance",
  summerCoupons: "qrapp_summer_coupons",
  /** بيانات النادي الصيفي — الفرق والأعضاء (Firebase) */
  summerClub: "qrapp_summer_club",
};

/** ألوان فرق النادي الصيفي */
export const CLUB_TEAM_COLORS = [
  "#FACC15",
  "#38BDF8",
  "#A3E635",
  "#FB923C",
  "#F472B6",
  "#A78BFA",
  "#34D399",
  "#F87171",
];
