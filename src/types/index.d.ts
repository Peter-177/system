/**
 * Global TypeScript / JSDoc type definitions.
 *
 * Import these in JS files with @type / @param JSDoc annotations,
 * or use them directly in any .ts/.tsx files.
 */

/**
 * @typedef {Object} Student
 * @property {string}  name        - Full name in Arabic
 * @property {string}  year        - School year label (e.g. '3rd', 'Prep 1')
 * @property {string}  [phone]     - Guardian phone number
 * @property {string}  [accent]    - Hex color string used in Avatar
 * @property {string}  [image]     - Base-64 encoded profile image (data:image/...)
 * @property {string}  [address]   - Home address
 * @property {string}  [birthdate] - ISO date string (YYYY-MM-DD)
 * @property {string}  [classId]   - Assigned class identifier
 * @property {string}  [notes]     - Free-text notes
 */

/**
 * @typedef {Object} StudentWithId
 * @property {string} qrId - Unique QR/ID code
 * @property {string} name
 * @property {string} year
 * @property {string} [phone]
 * @property {string} [accent]
 * @property {string} [image]
 */

/**
 * @typedef {Object} User
 * @property {string}   uid         - Firebase Auth UID
 * @property {string}   username    - Login username
 * @property {string}   name        - Display name
 * @property {string}   role        - 'admin' | 'servant'
 * @property {string[]} [permissions] - Permission keys (e.g. 'perm_add_student')
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {string} qrId   - Linked student ID
 * @property {string} date   - ISO date string (YYYY-MM-DD)
 * @property {string} type   - 'church' | 'visit'
 * @property {string} [note] - Optional free text
 */

/**
 * @typedef {Object} ClassGroup
 * @property {string}   id       - Unique class ID
 * @property {string}   name     - Class display name
 * @property {string}   year     - Target year group
 * @property {string}   servant  - Assigned servant UID
 * @property {string[]} students - Array of student QR IDs
 */

/**
 * @typedef {Object} CouponEntry
 * @property {string} id     - Unique entry ID
 * @property {number} amount - Coupon value
 * @property {string} date   - ISO date string
 * @property {string} reason - Free text reason
 */

/**
 * @typedef {Object} AppSettings
 * @property {string} churchName - Display name shown in the app
 * @property {string} icon       - Emoji or base-64 data URL
 * @property {string} secret     - Admin secret key
 */

// ─── Component Prop Types ────────────────────────────────────────────────────

/**
 * @typedef {Object} NavbarProps
 * @property {() => void} [onBack] - Navigate back; renders back button when provided
 * @property {string}      title   - Page title text
 * @property {React.ReactNode} [right] - Right-side slot (e.g. icon buttons)
 */

/**
 * @typedef {Object} AvatarProps
 * @property {string}       name    - Student name; first letter used as fallback
 * @property {string}       [accent] - Hex color
 * @property {string}       [image]  - Base-64 profile image
 * @property {'sm'|'md'|'lg'|'xl'} [size] - Avatar size preset (default: 'md')
 */

/**
 * @typedef {Object} StudentMiniCardProps
 * @property {StudentWithId} person - Student data with ID
 */
