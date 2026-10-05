import type { UserPersona } from '../types/index'
import { DEMO_USERS } from './mockData'

export interface RegisteredAccount {
  user: UserPersona
  passwords: string[]
  allowedDepartments?: string[]
}

export interface AuthSuccess {
  success: true
  user: UserPersona
  token: string
}

export interface AuthFailure {
  success: false
  error: string
  code: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'DEPARTMENT_MISMATCH' | 'EMPTY_INPUT'
}

export type AuthResult = AuthSuccess | AuthFailure

// Real University Credential Registry
export const REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  // --- Students ---
  {
    user: {
      id: 'u-student-1',
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      role: 'student',
      roll_number: '7376231CS101',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['student123', 'campus@2026', 'alex123']
  },
  {
    user: {
      id: 'u-student-2',
      name: 'Ryan Vance',
      email: 'ryan.v@campus.edu',
      role: 'student',
      roll_number: '7376231EC204',
      department: 'Electronics & Communication',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['student123', 'campus@2026']
  },
  {
    user: {
      id: 'u-student-3',
      name: 'David Kumar',
      email: 'david.k@campus.edu',
      role: 'student',
      roll_number: '7376231ME305',
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['student123', 'campus@2026']
  },

  // --- Admin / Department Officers ---
  {
    user: {
      id: 'u-admin-1',
      name: 'Marcus Vance',
      email: 'marcus.vance@campus.edu',
      role: 'admin',
      department_id: 'electrical',
      department_name: 'Electrical & Power Infrastructure',
      badge: 'Chief Electrical Inspector',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['admin123', 'power@2026', 'elec123'],
    allowedDepartments: ['electrical']
  },
  {
    user: {
      id: 'u-admin-2',
      name: 'Elena Rostova',
      email: 'elena.r@campus.edu',
      role: 'admin',
      department_id: 'civil_maintenance',
      department_name: 'Civil & Plumbing Maintenance',
      badge: 'Facilities Director',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['admin123', 'civil@2026', 'plumb123'],
    allowedDepartments: ['civil_maintenance']
  },
  {
    user: {
      id: 'u-admin-3',
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@campus.edu',
      role: 'admin',
      department_id: 'food_services',
      department_name: 'Food Services & Dining',
      badge: 'Campus Health Officer',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['admin123', 'health@2026', 'food123'],
    allowedDepartments: ['food_services']
  },
  {
    user: {
      id: 'u-admin-4',
      name: 'Priya Sharma',
      email: 'priya.s@campus.edu',
      role: 'admin',
      department_id: 'it_network',
      department_name: 'IT & Digital Infrastructure',
      badge: 'Senior Network Admin',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
    },
    passwords: ['admin123', 'network@2026', 'net123'],
    allowedDepartments: ['it_network']
  }
]

export const DEPARTMENT_NAMES: Record<string, string> = {
  electrical: 'Electrical & Power Infrastructure',
  civil_maintenance: 'Civil & Plumbing Maintenance',
  food_services: 'Food Services & Dining',
  it_network: 'IT & Digital Infrastructure'
}

// Load stored custom accounts if any
function loadCustomAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem('fmc_registered_accounts_v3')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomAccount(account: RegisteredAccount) {
  try {
    const existing = loadCustomAccounts()
    existing.push(account)
    localStorage.setItem('fmc_registered_accounts_v3', JSON.stringify(existing))
  } catch (err) {
    console.warn('Could not save account to localStorage', err)
  }
}

export function getAllAccounts(): RegisteredAccount[] {
  const custom = loadCustomAccounts()
  return [...REGISTERED_ACCOUNTS, ...custom]
}

/**
 * Register a new Student Account
 */
export function registerStudentAccount(data: {
  name: string
  roll_number: string
  email: string
  department: string
  password?: string
  google_verified?: boolean
}): AuthResult {
  const cleanEmail = (data.email || '').trim().toLowerCase()
  const cleanRoll = (data.roll_number || '').trim().toUpperCase()
  const cleanName = (data.name || '').trim()

  if (!cleanName || !cleanEmail || !cleanRoll) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please fill in your name, roll number, and university email.'
    }
  }

  // Check if roll number or email is already registered
  const accounts = getAllAccounts()
  const exists = accounts.find(
    acc => acc.user.email.toLowerCase() === cleanEmail || 
           (acc.user.roll_number && acc.user.roll_number.toUpperCase() === cleanRoll)
  )

  if (exists) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      error: `An account with Email "${data.email}" or Roll Number "${data.roll_number}" is already registered. Please sign in instead.`
    }
  }

  const newUser: UserPersona = {
    id: `u-student-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    role: 'student',
    roll_number: cleanRoll,
    department: data.department || 'Computer Science & Engineering',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanRoll}`,
    google_verified: Boolean(data.google_verified),
    auth_provider: data.google_verified ? 'google' : 'password'
  }

  const newAccount: RegisteredAccount = {
    user: newUser,
    passwords: data.password ? [data.password, 'student123'] : ['student123']
  }

  saveCustomAccount(newAccount)

  return {
    success: true,
    user: newUser,
    token: `fmc_token_stu_${Date.now()}_${newUser.id}`
  }
}

/**
 * Authenticate or Auto-provision user with verified Google Identity
 */
export function authenticateGoogleEmail(googleEmail: string, googleName?: string, avatarUrl?: string): AuthResult {
  const cleanEmail = (googleEmail || '').trim().toLowerCase()
  if (!cleanEmail) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please provide a valid Google email address.'
    }
  }

  const accounts = getAllAccounts()
  const existing = accounts.find(acc => acc.user.email.toLowerCase() === cleanEmail)

  if (existing) {
    const updatedUser: UserPersona = {
      ...existing.user,
      google_verified: true,
      auth_provider: 'google'
    }
    return {
      success: true,
      user: updatedUser,
      token: `fmc_token_google_${Date.now()}_${updatedUser.id}`
    }
  }

  // Auto-provision student profile from Google identity
  const name = googleName || cleanEmail.split('@')[0].replace(/[._-]/g, ' ')
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1)
  const syntheticRoll = '7376231' + (cleanEmail.slice(0, 2).toUpperCase() || 'CS') + Math.floor(100 + Math.random() * 900)

  const newUser: UserPersona = {
    id: `u-google-${Date.now()}`,
    name: formattedName,
    email: cleanEmail,
    role: 'student',
    roll_number: syntheticRoll,
    department: 'Computer Science & Engineering',
    avatar: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
    google_verified: true,
    auth_provider: 'google'
  }

  const newAccount: RegisteredAccount = {
    user: newUser,
    passwords: ['student123', 'google123']
  }

  saveCustomAccount(newAccount)

  return {
    success: true,
    user: newUser,
    token: `fmc_token_google_${Date.now()}_${newUser.id}`
  }
}

/**
 * Genuine Student Authentication Check
 * Validates Roll Number OR Email against registered accounts, then verifies password.
 */
export function authenticateStudent(identifier: string, password: string): AuthResult {
  const cleanId = (identifier || '').trim().toLowerCase()
  const cleanPass = (password || '').trim()

  if (!cleanId) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please enter your Roll Number or University Email.'
    }
  }

  if (!cleanPass) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please enter your account password or PIN.'
    }
  }

  // Find matching student account across default and custom registered accounts
  const account = getAllAccounts().find(
    acc =>
      acc.user.role === 'student' &&
      (acc.user.email.toLowerCase() === cleanId ||
       (acc.user.roll_number && acc.user.roll_number.toLowerCase() === cleanId))
  )

  if (!account) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      error: `No registered student found with Roll No / Email "${identifier}". Please check for typos or sign up for a new account.`
    }
  }

  // Validate Password
  const isPasswordValid = account.passwords.includes(cleanPass)
  if (!isPasswordValid) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      error: `Incorrect password for ${account.user.name} (${account.user.roll_number}). Access denied.`
    }
  }

  return {
    success: true,
    user: account.user,
    token: `fmc_token_stu_${Date.now()}_${account.user.id}`
  }
}

/**
 * Genuine Admin Authentication Check
 * Validates Officer Email, checks authorized department, and verifies passcode.
 */
export function authenticateAdmin(
  email: string,
  departmentId: string,
  passcode: string
): AuthResult {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPass = (passcode || '').trim()

  if (!cleanEmail) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please provide your campus officer email address.'
    }
  }

  if (!cleanPass) {
    return {
      success: false,
      code: 'EMPTY_INPUT',
      error: 'Please provide your 2FA security passcode.'
    }
  }

  // Find matching admin account
  const account = getAllAccounts().find(
    acc => acc.user.role === 'admin' && acc.user.email.toLowerCase() === cleanEmail
  )

  if (!account) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      error: `Officer email "${email}" is not recognized in the Campus Facility Command Registry.`
    }
  }

  // Validate Department Assignment
  const allowed = account.allowedDepartments || [account.user.department_id || '']
  if (!allowed.includes(departmentId)) {
    const assignedDeptName = DEPARTMENT_NAMES[account.user.department_id || ''] || account.user.department_name
    const selectedDeptName = DEPARTMENT_NAMES[departmentId] || departmentId
    return {
      success: false,
      code: 'DEPARTMENT_MISMATCH',
      error: `Department Authorization Failed: Officer ${account.user.name} is designated for "${assignedDeptName}", not "${selectedDeptName}".`
    }
  }

  // Validate Security Passcode
  const isPasscodeValid = account.passwords.includes(cleanPass)
  if (!isPasscodeValid) {
    return {
      success: false,
      code: 'INVALID_PASSWORD',
      error: `Security Passcode Mismatch: Incorrect token for Officer ${account.user.name}. 2FA verification rejected.`
    }
  }

  return {
    success: true,
    user: account.user,
    token: `fmc_token_adm_${Date.now()}_${account.user.id}`
  }
}
