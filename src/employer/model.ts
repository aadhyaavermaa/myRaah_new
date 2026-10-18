import type { User } from '../types'

export type JobStatus = 'Draft' | 'Active' | 'Closed'
export type Job = {
  id: string; title: string; dept: string; description: string
  required: string[]; preferred: string[]; education: string
  type: 'Internship' | 'Apprenticeship' | 'Job' | 'Project' | 'Training'
  location: string; arrangement: 'On-site' | 'Remote' | 'Hybrid'
  openings: number; deadline: string; status: JobStatus
}
export type Student = { id: string; education: string; skills: string[]; projects: string[]; interests: string[]; available: boolean }
export type ActivityType = 'Industry Session' | 'Hands-on Workshop' | 'Competition & Challenge'
export type ActivityStatus = 'Draft' | 'Submitted to Facilitator' | 'Under Review' | 'Accepted' | 'Changes Requested' | 'Scheduled' | 'Completed' | 'Declined'
export type Activity = {
  id: string; title: string; type: ActivityType; description: string; skills: string[]
  level: string; prerequisites: string; duration: string; format: 'Online' | 'Offline'; date: string
  materials: string; participants: number; criteria: string; preference: string
  status: ActivityStatus; feedback?: string
}
export const EMPLOYER_STATUSES = ['Shortlisted', 'Interview or Assessment', 'Selected', 'Not Selected', 'Withdrawn'] as const
export type ReferralStatus = (typeof EMPLOYER_STATUSES)[number] | 'Shared with Facilitator' | 'Awaiting Student Consent' | 'Ready for Employer Review'
export type Referral = { id: string; studentId: string; jobId: string; date: string; status: ReferralStatus }
export type Org = { name: string; type: string; industry: string; description: string; website: string; location: string; contact: string; preferences: string }
export type EmployerState = { jobs: Job[]; activities: Activity[]; referrals: Referral[]; org: Org; updates: string[] }

export const EDUCATION = ['Class 11–12', 'Diploma / ITI', 'Undergraduate', 'Graduate']
export const ACTIVITY_TYPES: ActivityType[] = ['Industry Session', 'Hands-on Workshop', 'Competition & Challenge']
export const NEXT_STATUS: Partial<Record<ActivityStatus, ActivityStatus>> = { 'Submitted to Facilitator': 'Under Review', 'Under Review': 'Accepted', Accepted: 'Scheduled', Scheduled: 'Completed' }

// DEMO students. Replace with real data once a student API exists.
export const students: Student[] = [
  { id: 'S-102', education: 'Diploma / ITI', skills: ['Electrical safety', 'Hands-on work', 'Troubleshooting'], projects: ['Wired a model house circuit', 'Solar lamp repair'], interests: ['Solar installation technician'], available: true },
  { id: 'S-117', education: 'Undergraduate', skills: ['Communication', 'Wellbeing', 'Community outreach'], projects: ['Village health camp volunteer'], interests: ['Community health worker'], available: true },
  { id: 'S-131', education: 'Graduate', skills: ['Numeracy', 'Organisation', 'Spreadsheet basics'], projects: ['Shop ledger clean-up', 'Budget tracker'], interests: ['Bookkeeping assistant'], available: false },
  { id: 'S-144', education: 'Class 11–12', skills: ['HTML and CSS', 'Logical thinking', 'Teamwork'], projects: ['Personal portfolio page'], interests: ['Web developer'], available: true },
  { id: 'S-152', education: 'Diploma / ITI', skills: ['Visual thinking', 'Typography', 'Design tools'], projects: ['Poster set for school fest', 'Logo for a local shop'], interests: ['Graphic designer'], available: true },
  { id: 'S-168', education: 'Undergraduate', skills: ['Teaching', 'Patience', 'Creative learning'], projects: ['Weekend tuition for 12 children'], interests: ['Early childhood educator'], available: true },
]

const norm = (s: string) => s.trim().toLowerCase()
// Deterministic and transparent: skills + practical evidence only. Never marks.
export function matchStudent(s: Student, job: Job) {
  const have = new Set(s.skills.map(norm))
  const req = job.required.filter(x => have.has(norm(x)))
  const pref = job.preferred.filter(x => have.has(norm(x)))
  const score = Math.round((job.required.length ? req.length / job.required.length : 0) * 70 + (job.preferred.length ? pref.length / job.preferred.length : 0) * 20 + (Math.min(s.projects.length, 2) / 2) * 10)
  const parts = [`Matches ${req.length} of ${job.required.length} required skills`]
  if (pref.length) parts.push(`${pref.length} preferred`)
  if (s.projects.length) parts.push(`${s.projects.length} practical project${s.projects.length > 1 ? 's' : ''}`)
  return { score, explanation: parts.join(' · ') }
}

export const uid = () => Math.random().toString(36).slice(2, 10)
export const csv = (v: string) => v.split(',').map(x => x.trim()).filter(Boolean)

export function initialState(user: User): EmployerState {
  const d = user.details || {}
  return {
    org: { name: d.org || '', type: d.orgtype || '', industry: d.industry || '', description: d.description || '', website: d.website || '', location: d.location || '', contact: user.name, preferences: '' },
    jobs: [{ id: 'sample-job', title: 'Solar installation trainee', dept: 'Field operations', description: 'Sample requirement to show how matching works.', required: ['Electrical safety', 'Hands-on work'], preferred: ['Troubleshooting'], education: 'Diploma / ITI', type: 'Apprenticeship', location: d.location || 'Your city', arrangement: 'On-site', openings: 2, deadline: '', status: 'Active' }],
    activities: [], referrals: [], updates: [],
  }
}
