import { User, LevelSummary, ExamSummary, LeaderboardEntry, CertificateItem } from '../types'

// Load all 100 level definition files eagerly at build time
const rawLevelModules = import.meta.glob('../../../content/levels/level_*.json', { eager: true }) as Record<
  string,
  any
>

const allLevelsData: Record<number, any> = {}
const allLevelSummaries: LevelSummary[] = []

// Parse and index all 100 levels
Object.entries(rawLevelModules).forEach(([path, moduleData]) => {
  const data = moduleData.default || moduleData
  if (data && data.level_id) {
    allLevelsData[data.level_id] = data
  }
})

// Ensure all levels 1 to 100 are present
for (let id = 1; id <= 100; id++) {
  const lvl = allLevelsData[id]
  if (lvl) {
    allLevelSummaries.push({
      level_id: lvl.level_id,
      title: lvl.title || ('Level ' + id),
      track: lvl.track || 'beginner',
      category: lvl.category || 'fundamentals',
      cloud_platform: lvl.cloud_platform || 'aws',
      xp_reward: lvl.xp_reward || 100,
      estimated_minutes: lvl.estimated_minutes || 20,
      status: 'unlocked',
      theory_completed: id <= 3,
      lab_completed: id <= 3,
      problem_solving_score: 100,
    })
  } else {
    allLevelSummaries.push({
      level_id: id,
      title: 'Lab Level ' + id,
      track: id <= 25 ? 'beginner' : id <= 50 ? 'intermediate' : id <= 75 ? 'advanced' : 'expert',
      category: 'cloud-security',
      cloud_platform: 'aws',
      xp_reward: 100,
      estimated_minutes: 20,
      status: 'unlocked',
      theory_completed: false,
      lab_completed: false,
      problem_solving_score: 0,
    })
  }
}

const mockExams: ExamSummary[] = [
  {
    exam_id: 'exam-beginner',
    title: 'Cloud Security Fundamentals Associate (CSFA)',
    track: 'beginner',
    duration_minutes: 45,
    passing_score: 80,
    unlocks_after_level: 25,
    is_unlocked: true,
    attempts_used: 1,
    max_attempts: 3,
    passed: true,
    latest_score: 96.5,
  },
  {
    exam_id: 'exam-intermediate',
    title: 'Cloud Defense & Incident Response Practitioner (CDIRP)',
    track: 'intermediate',
    duration_minutes: 60,
    passing_score: 80,
    unlocks_after_level: 50,
    is_unlocked: true,
    attempts_used: 0,
    max_attempts: 3,
    passed: false,
  },
  {
    exam_id: 'exam-advanced',
    title: 'Multi-Cloud IAM & Architecture Specialist (MCIAS)',
    track: 'advanced',
    duration_minutes: 75,
    passing_score: 85,
    unlocks_after_level: 75,
    is_unlocked: false,
    attempts_used: 0,
    max_attempts: 3,
    passed: false,
  },
  {
    exam_id: 'exam-expert',
    title: 'Offensive Cloud Security & Red Team Lead (OCSRL)',
    track: 'expert',
    duration_minutes: 90,
    passing_score: 85,
    unlocks_after_level: 100,
    is_unlocked: false,
    attempts_used: 0,
    max_attempts: 3,
    passed: false,
  },
]

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'sarah_connor', full_name: 'Sarah Connor', total_xp: 9850, completed_levels: 98, streak_days: 42, country: 'US', certificates_count: 3 },
  { rank: 2, username: 'elena_rostova', full_name: 'Elena Rostova', total_xp: 8420, completed_levels: 84, streak_days: 30, country: 'DE', certificates_count: 2 },
  { rank: 3, username: 'marcus_vance', full_name: 'Marcus Vance', total_xp: 7210, completed_levels: 72, streak_days: 21, country: 'UK', certificates_count: 2 },
  { rank: 4, username: 'google_sec_lead', full_name: 'Google Cloud Security Specialist', total_xp: 450, completed_levels: 4, streak_days: 7, country: 'US', certificates_count: 1 },
  { rank: 5, username: 'chen_wei', full_name: 'Chen Wei', total_xp: 6150, completed_levels: 61, streak_days: 18, country: 'SG', certificates_count: 1 },
]

export const handleMockRequest = (url: string, method: string = 'GET', data?: any): { status: number; data: any } => {
  const cleanUrl = url.replace(/^\/?api\/?/, '').replace(/^\//, '').split('?')[0]

  // 1. Auth: Google SSO
  if (cleanUrl === 'auth/google') {
    const user: User = {
      id: 'usr_google_' + Math.floor(Math.random() * 10000),
      username: 'google_sec_lead',
      email: 'sec.lead@google.internal',
      full_name: data?.full_name || 'Google Cloud Security Specialist',
      total_xp: 450,
      current_level: 1,
      streak_days: 7,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_google_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 2. Auth: GitHub SSO
  if (cleanUrl === 'auth/github') {
    const user: User = {
      id: 'usr_github_' + Math.floor(Math.random() * 10000),
      username: data?.username || 'github_sec_engineer',
      email: 'sec.engineer@github.internal',
      full_name: data?.full_name || 'GitHub Security Engineer',
      total_xp: 450,
      current_level: 1,
      streak_days: 5,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_github_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 3. Auth: GitLab SSO
  if (cleanUrl === 'auth/gitlab') {
    const user: User = {
      id: 'usr_gitlab_' + Math.floor(Math.random() * 10000),
      username: data?.username || 'gitlab_devsecops',
      email: 'devsecops@gitlab.internal',
      full_name: data?.full_name || 'GitLab DevSecOps Lead',
      total_xp: 450,
      current_level: 1,
      streak_days: 6,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_gitlab_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 4. Auth: Apple SSO
  if (cleanUrl === 'auth/apple') {
    const user: User = {
      id: 'usr_apple_' + Math.floor(Math.random() * 10000),
      username: 'apple_sec_op',
      email: 'sec.op@privaterelay.appleid.com',
      full_name: data?.full_name || 'Apple Security Operator',
      total_xp: 450,
      current_level: 1,
      streak_days: 4,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_apple_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 5. Auth: 1-Click Guest Sandbox
  if (cleanUrl === 'auth/guest') {
    const guestId = Math.floor(100 + Math.random() * 900)
    const user: User = {
      id: 'usr_guest_' + guestId,
      username: 'guest_operator_' + guestId,
      email: 'guest_' + guestId + '@cloudseclab.io',
      full_name: 'Guest Security Auditor',
      total_xp: 150,
      current_level: 1,
      streak_days: 1,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_guest_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 6. Auth: Magic Link
  if (cleanUrl === 'auth/magic-link') {
    const reqEmail = data?.email || 'operator@cloudsec.io'
    const namePart = reqEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
    const user: User = {
      id: 'usr_magic_' + Date.now(),
      username: namePart,
      email: reqEmail,
      full_name: namePart.toUpperCase() + ' Operator',
      total_xp: 300,
      current_level: 1,
      streak_days: 3,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_magic_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 7. Auth: Passkey / Hardware Key
  if (cleanUrl === 'auth/passkey') {
    const reqEmail = data?.email || 'operator@yubikey.auth'
    const user: User = {
      id: 'usr_passkey_' + Date.now(),
      username: 'yubikey_operator',
      email: reqEmail,
      full_name: 'FIDO2 Authenticated Operator',
      total_xp: 600,
      current_level: 1,
      streak_days: 8,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_passkey_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // Health Check
  if (cleanUrl === 'health' || cleanUrl === 'status') {
    return {
      status: 200,
      data: { status: 'ok', version: '1.0.0' },
    }
  }

  // 8. Auth: Standard Password Login
  if (cleanUrl === 'auth/login') {
    const identifier = (data?.username_or_email || 'operator').trim()
    const password = data?.password || ''

    // Check localStorage for registered users
    let matchedUser: User | null = null
    try {
      const regRaw = localStorage.getItem('cloudsec_registered_users')
      if (regRaw) {
        const regUsers = JSON.parse(regRaw)
        if (Array.isArray(regUsers)) {
          const found = regUsers.find(
            (u: any) => u.username?.toLowerCase() === identifier.toLowerCase() || u.email?.toLowerCase() === identifier.toLowerCase()
          )
          if (found) {
            matchedUser = {
              id: found.id,
              username: found.username,
              email: found.email,
              full_name: found.full_name,
              total_xp: found.total_xp || 100,
              current_level: found.current_level || 1,
              streak_days: found.streak_days || 1,
              country: found.country || 'US',
              created_at: found.created_at || new Date().toISOString(),
            }
          }
        }
      }
    } catch (e) {}

    const user: User = matchedUser || {
      id: 'usr_login_' + Date.now(),
      username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      email: identifier.includes('@') ? identifier : (identifier + '@cloudseclab.io'),
      full_name: identifier.includes('@') ? identifier.split('@')[0] : 'Security Operator',
      total_xp: 1250,
      current_level: 1,
      streak_days: 14,
      country: 'US',
      created_at: new Date().toISOString(),
    }
    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_login_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // 9. Auth: Register
  if (cleanUrl === 'auth/register') {
    const username = (data?.username || 'new_operator').trim()
    const email = (data?.email || 'operator@cloudsec.io').trim()
    const fullName = (data?.full_name || 'Cloud Security Analyst').trim()

    const user: User = {
      id: 'usr_reg_' + Date.now(),
      username,
      email,
      full_name: fullName,
      total_xp: 100,
      current_level: 1,
      streak_days: 1,
      country: 'US',
      created_at: new Date().toISOString(),
    }

    // Persist to registered users list
    try {
      const regRaw = localStorage.getItem('cloudsec_registered_users')
      const regUsers = regRaw ? JSON.parse(regRaw) : []
      if (Array.isArray(regUsers)) {
        regUsers.push({ ...user, password: data?.password })
        localStorage.setItem('cloudsec_registered_users', JSON.stringify(regUsers))
      }
    } catch (e) {}

    return {
      status: 200,
      data: {
        access_token: 'mock_jwt_reg_' + Date.now(),
        token_type: 'bearer',
        user,
      },
    }
  }

  // Auth: Me
  if (cleanUrl === 'auth/me') {
    const stored = localStorage.getItem('cloudsec_user')
    if (stored) {
      try {
        return { status: 200, data: JSON.parse(stored) }
      } catch (e) {}
    }
    return {
      status: 200,
      data: {
        id: 'usr_active',
        username: 'cloud_sec_operator',
        email: 'operator@cloudseclab.io',
        full_name: 'Cloud Security Operator',
        total_xp: 450,
        current_level: 1,
        streak_days: 7,
        country: 'US',
        created_at: new Date().toISOString(),
      },
    }
  }

  // Progress Stats
  if (cleanUrl === 'progress/stats') {
    return {
      status: 200,
      data: {
        completed_levels: 4,
        total_levels: 100,
        completion_percentage: 4,
      },
    }
  }

  // Leaderboard Me
  if (cleanUrl === 'leaderboard/me') {
    return {
      status: 200,
      data: {
        rank: 4,
        username: 'google_sec_lead',
        xp: 450,
      },
    }
  }

  // Leaderboard List
  if (cleanUrl === 'leaderboard') {
    return { status: 200, data: mockLeaderboard }
  }

  // Certificates List
  if (cleanUrl === 'certificates') {
    const certs: CertificateItem[] = [
      {
        id: 'cert-001',
        certificate_type: 'beginner',
        verification_id: 'CSL-2026-BGN-98F2A10B',
        issued_at: '2026-03-01T12:00:00Z',
        user_full_name: 'Google Cloud Security Specialist',
        exam_score: 96.5,
      },
    ]
    return {
      status: 200,
      data: certs,
    }
  }

  // Certificate Verification
  if (cleanUrl.startsWith('certificates/verify/') || cleanUrl.startsWith('verify/')) {
    const certId = cleanUrl.split('/').pop()
    return {
      status: 200,
      data: {
        valid: true,
        is_valid: true,
        verification_id: certId || 'CSL-2026-BGN-98F2A10B',
        holder_name: 'Alex Vance',
        user_full_name: 'Alex Vance',
        certificate_type: 'beginner',
        certificate_title: 'Cloud Security Fundamentals Associate',
        exam_score: 96.5,
        issued_at: '2026-03-01T12:00:00Z',
      },
    }
  }

  // Exams List
  if (cleanUrl === 'exams') {
    return { status: 200, data: mockExams }
  }

  // Levels List
  if (cleanUrl === 'levels') {
    return { status: 200, data: allLevelSummaries }
  }

  // Single Level Detail
  if (cleanUrl.startsWith('levels/')) {
    const id = parseInt(cleanUrl.split('/')[1], 10) || 1
    const lvl = allLevelsData[id]
    if (lvl) {
      return {
        status: 200,
        data: {
          ...lvl,
          user_progress: {
            status: 'in_progress',
            theory_completed: true,
            demo_completed: false,
            lab_completed: false,
            hints_used: 0,
            problem_solving_score: 0,
            forensics_completed: false,
          },
        },
      }
    }
    return {
      status: 200,
      data: {
        level_id: id,
        title: 'Lab Level ' + id,
        track: id <= 25 ? 'beginner' : 'intermediate',
        category: 'fundamentals',
        cloud_platform: 'aws',
        xp_reward: 100,
        estimated_minutes: 20,
        theory: {
          intro: 'Overview and deep-dive analysis for Level ' + id + '.',
          sections: [
            {
              heading: 'Key Security Principles',
              type: 'text',
              content: 'Understanding the security boundaries, IAM trust evaluation, and isolation mechanics.',
            },
          ],
        },
        lab: {
          objective: 'Configure and validate the security posture.',
          setup_commands: [],
          validation: { type: 'localstack', resource: 'aws_iam', checks: [] },
          hints: ['Check IAM policies for least privilege principle.'],
        },
        user_progress: {
          status: 'in_progress',
          theory_completed: true,
          demo_completed: false,
          lab_completed: false,
          hints_used: 0,
          problem_solving_score: 0,
          forensics_completed: false,
        },
      },
    }
  }

  // Default fallback
  return {
    status: 200,
    data: { success: true },
  }
}
