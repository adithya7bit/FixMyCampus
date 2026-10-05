export interface Complaint {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  department_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  location_building: string
  location_floor: string
  location_room: string
  reporter_name: string
  reporter_id: string
  reporter_email: string
  assigned_to?: string
  upvotes: number
  sla_hours: number
  created_at: string
  resolved_at?: string
  closed_at?: string
  photo_url?: string
  resolution_photo?: string
  resolution_notes?: string
  verified_by_student?: boolean
  lat: number
  lng: number
  updates: Array<{
    timestamp: string
    author: string
    message: string
  }>
}

export interface UserPersona {
  id: string
  name: string
  email: string
  role: 'student' | 'admin'
  roll_number?: string
  department?: string
  department_id?: string
  department_name?: string
  badge?: string
  avatar: string
  google_verified?: boolean
  auth_provider?: 'google' | 'password'
}

export interface BuildingInfo {
  id: string
  name: string
  floors: string[]
  risk: 'low' | 'moderate' | 'high' | 'critical'
  open_issues: number
  lat: number
  lng: number
}

export interface ContactFormData {
  fullName: string
  email: string
  department: string
  inquiryType: string
  message: string
}
