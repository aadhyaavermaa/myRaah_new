export type SupportTrack =
  | 'Healthcare & Nursing'
  | 'Solar & Clean Tech'
  | 'Agriculture & Rural Tech'
  | 'Computer & Digital Skills'
  | 'Vocational Trades & ITI'
  | 'Higher Education & Admissions'
  | 'Govt Schemes & Scholarships'

export type LearnerAssignmentStatus = 'unassigned' | 'assigned_to_me' | 'assigned_to_peer'

export interface FacilitatorProfile {
  id: string
  name: string
  email: string
  designation: string
  institution: string
  location: string
  languages: string[]
  sectors: string[]
  bio: string
  joinedDate: string
  activeMenteesCount: number
}

export interface AllocatedLearner {
  id: string
  name: string
  avatarUrl: string
  educationLevel: string
  location: string
  preferredLanguage: string
  stream: string
  subjects: string[]
  skills: string[]
  careerGoals: string
  overallProgress: number
  currentStatus: 'on_track' | 'needs_support' | 'critical'
  assignmentStatus: LearnerAssignmentStatus
  assignedFacilitatorName?: string
  assignedFacilitatorId?: string
  assignedDate?: string
  supportTrack?: SupportTrack
  assignmentReason?: string
  lastActive: string
  recentActivity: string
  isTalentShortlisted?: boolean
  shortlistReason?: string
  readinessLevel: 'Apprenticeship Ready' | 'Internship Ready' | 'Foundational Training'
  demonstratedProjects: {
    title: string
    description: string
    link?: string
  }[]
  certifications: string[]
  portfolioUrl?: string
  observableCriteria: string[]
}

export type ReferralStatus =
  | 'Draft'
  | 'Pending Consent'
  | 'Ready to Refer'
  | 'Referred — Demo'
  | 'Under Review'
  | 'Shortlisted'
  | 'Not Selected'
  | 'Closed'

export interface ReferralTimelineItem {
  status: ReferralStatus
  date: string
  note: string
}

export interface EmployerReferral {
  id: string
  learnerId: string
  learnerName: string
  learnerEducation: string
  employerId: string
  employerName: string
  opportunityId: string
  opportunityTitle: string
  opportunityDomain: string
  submissionDate: string
  status: ReferralStatus
  matchRationale: string
  consentVerified: boolean
  consentTimestamp?: string
  sharedSkills: string[]
  sharedProjects: string[]
  facilitatorNotes?: string
  timeline: ReferralTimelineItem[]
}

export interface FacilitatorOpportunity {
  id: string
  title: string
  employerId: string
  employerName: string
  domain: string
  requiredSkills: string[]
  preferredSkills: string[]
  education: string
  type: 'Apprenticeship' | 'Internship' | 'Job' | 'Training'
  location: string
  arrangement: 'On-site' | 'Remote' | 'Hybrid'
  stipendOrSalary: string
  duration: string
  deadline: string
  openings: number
  referredCandidatesCount: number
  description: string
  eligibilityCriteria: string[]
}

export interface FollowUpReminder {
  id: string
  learnerId: string
  learnerName: string
  dueDate: string
  type: 'Phone Check-in' | 'In-person Sync' | 'Resume Review' | 'Application Assistance' | 'Skill Evaluation'
  priority: 'High' | 'Medium' | 'Low'
  notes: string
  completed: boolean
  completedDate?: string
  outcomeNote?: string
}

export interface FacilitatorState {
  profile: FacilitatorProfile
  learners: AllocatedLearner[]
  referrals: EmployerReferral[]
  opportunities: FacilitatorOpportunity[]
  followUps: FollowUpReminder[]
  updates: string[]
}

export interface MatchEvaluation {
  score: number
  isRecommended: boolean
  explanation: string
  matchedSkills: string[]
  matchedSectors: string[]
}
