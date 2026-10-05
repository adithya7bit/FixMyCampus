/**
 * Client-side AI classification & duplicate detection engine
 * Runs instantly in the browser or proxies to backend
 */

const CATEGORY_MAP = [
  {
    id: 'electrical',
    name: 'Electrical & Power',
    keywords: ['elevator', 'lift', 'power', 'spark', 'light', 'fan', 'switch', 'socket', 'plug', 'generator', 'bulb', 'shock', 'breaker', 'wire', 'flicker', 'blackout'],
    sla: { urgent: 2, high: 8, medium: 24, low: 48 }
  },
  {
    id: 'civil_maintenance',
    name: 'Civil & Plumbing',
    keywords: ['pipe', 'leak', 'water', 'flood', 'tap', 'toilet', 'flush', 'sink', 'door', 'lock', 'window', 'ceiling', 'crack', 'drain', 'puddle', 'sewage', 'roof'],
    sla: { urgent: 3, high: 12, medium: 24, low: 72 }
  },
  {
    id: 'it_network',
    name: 'IT & Digital Infrastructure',
    keywords: ['wifi', 'wi-fi', 'internet', 'network', 'eduroam', 'router', 'ethernet', 'projector', 'smartboard', 'pc', 'computer', 'lan', 'printer', 'portal', 'lab'],
    sla: { urgent: 2, high: 6, medium: 18, low: 36 }
  },
  {
    id: 'food_services',
    name: 'Food Services & Dining',
    keywords: ['food', 'cafeteria', 'mess', 'hygiene', 'cockroach', 'roach', 'insect', 'water cooler', 'cold storage', 'dining', 'meal', 'unhygienic', 'spoiled', 'taste'],
    sla: { urgent: 1, high: 4, medium: 12, low: 24 }
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping & Sanitation',
    keywords: ['dustbin', 'garbage', 'trash', 'dirty', 'clean', 'sweep', 'mop', 'odor', 'smell', 'restroom', 'hygiene', 'stain', 'sanitation'],
    sla: { urgent: 4, high: 12, medium: 24, low: 48 }
  },
  {
    id: 'hostel',
    name: 'Hostel Affairs',
    keywords: ['hostel', 'dorm', 'geyser', 'bed', 'warden', 'curfew', 'roommate', 'cupboard', 'hot water'],
    sla: { urgent: 3, high: 12, medium: 24, low: 48 }
  },
  {
    id: 'security',
    name: 'Campus Safety & Security',
    keywords: ['theft', 'stolen', 'cctv', 'camera', 'guard', 'trespasser', 'stranger', 'harassment', 'gate', 'lock', 'emergency', 'dark', 'unsafe'],
    sla: { urgent: 1, high: 4, medium: 12, low: 24 }
  }
]

const URGENT_TRIGGERS = [
  'fire', 'spark', 'smoke', 'electric shock', 'live wire', 'stuck elevator', 'trapped', 'flooding',
  'food poisoning', 'gas leak', 'medical', 'structural collapse', 'hazard'
]

const HIGH_TRIGGERS = [
  'exam', 'blackout', 'overflow', 'no water', 'broken lock', 'offline', 'heavy leak'
]

export function classifyComplaintAI(title = '', description = '') {
  const combined = `${title} ${description}`.toLowerCase()
  
  // 1. Detect Category by keyword frequency
  let bestCategory = CATEGORY_MAP[1] // Default Civil
  let maxScore = -1
  
  for (const cat of CATEGORY_MAP) {
    let score = 0
    for (const kw of cat.keywords) {
      if (combined.includes(kw)) score += 2
    }
    if (score > maxScore && score > 0) {
      maxScore = score
      bestCategory = cat
    }
  }

  // 2. Detect Priority & Urgency
  let priority = 'medium'
  let rationale = 'Standard maintenance timeline.'
  
  if (URGENT_TRIGGERS.some(trigger => combined.includes(trigger))) {
    priority = 'urgent'
    rationale = 'Life-safety or critical campus infrastructure hazard detected.'
  } else if (HIGH_TRIGGERS.some(trigger => combined.includes(trigger))) {
    priority = 'high'
    rationale = 'High operational disruption affecting student academics or hygiene.'
  } else if (combined.length < 25) {
    priority = 'low'
    rationale = 'Minor cosmetic or routine amenity issue.'
  }

  const slaHours = bestCategory.sla[priority] || 24

  return {
    category: bestCategory.name,
    department_id: bestCategory.id,
    priority,
    sla_hours: slaHours,
    rationale,
    confidence: maxScore > 0 ? Math.min(98, 70 + maxScore * 5) : 65
  }
}

export function detectDuplicates(title = '', building = '', existingComplaints = []) {
  if (!title.trim() || !building) return []
  
  const tokens = title.toLowerCase().split(/\s+/).filter(t => t.length > 3)
  if (tokens.length === 0) return []

  const matches = []

  for (const item of existingComplaints) {
    if (item.status === 'closed') continue
    if (item.location_building !== building) continue

    const itemTokens = item.title.toLowerCase().split(/\s+/).filter(t => t.length > 3)
    let overlap = 0
    for (const token of tokens) {
      if (itemTokens.some(it => it.includes(token) || token.includes(it))) {
        overlap++
      }
    }

    const similarity = (overlap / Math.max(tokens.length, itemTokens.length)) * 100
    if (similarity >= 30) {
      matches.push({
        complaint: item,
        similarity: Math.round(similarity)
      })
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Connected Backend AI API Calls (with automatic fallback to client AI engine)
 */
export async function fetchAIClassification(title = '', description = '') {
  try {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })
    if (res.ok) {
      const data = await res.json()
      return {
        category: data.category,
        department_id: data.department_id,
        priority: data.priority,
        sla_hours: data.sla_hours,
        rationale: `Backend AI Fast-Inference Verified (${data.confidence}% confidence).`,
        confidence: data.confidence
      }
    }
  } catch (err) {
    // Graceful fallback to client-side rule engine
  }
  return classifyComplaintAI(title, description)
}

export async function fetchDuplicates(title = '', building = '', existingComplaints = []) {
  try {
    const existing_titles = existingComplaints.map(c => c.title)
    const res = await fetch('/api/ai/check-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, building, existing_titles })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.duplicates && data.duplicates.length > 0) {
        return data.duplicates.map(d => {
          const comp = existingComplaints.find(c => c.title === d.title)
          return {
            complaint: comp || { title: d.title, location_building: building },
            similarity: d.similarity
          }
        })
      }
    }
  } catch (err) {
    // Graceful fallback
  }
  return detectDuplicates(title, building, existingComplaints)
}
