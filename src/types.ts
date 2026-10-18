export type Role = 'student' | 'mentor' | 'facilitator' | 'employer'
export type User = {
  id?: string
  name: string
  email: string
  role: Role
  details?: Record<string, any>
  mentorProfileId?: string
}
export type Career = { title: string; category: string; description: string; skills: string[]; path: string }
export type Milestone = { title: string; detail: string; done: boolean }
export type Opportunity = { title: string; category: string; provider: string; detail: string; deadline: string; demo: boolean }

export type TeachingMode = 'voice' | 'text' | 'video' | 'online' | 'in-person'

export type ExpertiseCategory =
  | 'Career guidance'
  | 'Scholarships and schemes'
  | 'School subjects and academic doubts'
  | 'Competitive examinations'
  | 'Vocational education & skills'
  | 'Computer skills and coding'
  | 'Internships and employment'
  | 'Interview preparation & communication'
  | 'Agriculture & local entrepreneurship'

export type TeachingSubject = {
  id: string
  mentorId: string
  category: ExpertiseCategory
  title: string
  level: string
  description: string
}

export type ResourceContentType = 'video' | 'audio' | 'text' | 'notes'

export type TeachingResource = {
  id: string
  mentorId: string
  title: string
  topic: string
  category: ExpertiseCategory
  language: string
  contentType: ResourceContentType
  contentUrl?: string
  duration?: string
  date: string
  summary: string
  textContent?: string
  audioUrl?: string
  lowBandwidthAvailable: boolean
  transcript?: string
}

export type ReviewCategory = 'Clarity' | 'Helpfulness' | 'Patience' | 'Communication'

export type StudentReview = {
  id: string
  mentorId: string
  studentId: string
  studentName: string
  rating: number // 1 to 5
  feedback: string
  category: ReviewCategory
  createdAt: string
  verifiedInteraction: boolean
  reported?: boolean
  reportReason?: string
}

export type DoubtStatus = 'pending' | 'answered' | 'resolved' | 'under_review'

export type DoubtFlagCategory =
  | 'abusive'
  | 'sexually_explicit'
  | 'threatening'
  | 'unrelated'
  | 'spam'
  | 'private_contact_solicitation'

export type DoubtRecord = {
  id: string
  mentorId: string
  studentId: string
  studentName: string
  studentGrade?: string
  subject?: string
  topic?: string
  category: ExpertiseCategory
  question: string
  contextDetails?: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentType?: 'image' | 'pdf' | 'document'
  status: DoubtStatus
  answer?: string
  answerMediaType?: 'text' | 'audio' | 'video'
  answerMediaUrl?: string
  answerMediaKey?: string
  createdAt: string
  resolvedAt?: string
  flagged?: boolean
  flagReason?: string
  flagCategory?: DoubtFlagCategory
  flaggedAt?: string
}

export type MentoringSession = {
  id: string
  mentorId: string
  studentId: string
  studentName: string
  topic: string
  mode: TeachingMode
  scheduledDate: string
  status: 'completed' | 'scheduled' | 'cancelled'
  notes?: string
}

export type ReviewReport = {
  id: string
  reviewId: string
  mentorId: string
  reporterId: string
  reason: string
  createdAt: string
  status: 'pending' | 'reviewed' | 'dismissed'
}

export type MentorProfile = {
  id: string
  userId?: string
  email: string
  name: string
  photoUrl?: string
  headline: string
  bio: string
  education: string
  qualifications: string[]
  experienceYears: number
  teachingModes: TeachingMode[]
  languages: string[]
  location: string
  verified: boolean
  memberSince: string
  introVideo?: {
    videoUrl?: string
    thumbnailUrl?: string
    captionText?: string
    duration?: string
  }
  writtenIntro?: string
  availabilityDays: string[]
  availabilityHours: string
  acceptingMentees: boolean
}

export type LessonStatus = 'draft' | 'published'

export type SubtitleCue = {
  id: string
  start: number // in seconds
  end: number // in seconds
  text: string
}

export type LessonFeedback = {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  comment: string
  isHelpful: boolean
  createdAt: string
}

export type SampleLesson = {
  id: string
  mentorId: string
  title: string
  subject: string
  language: string
  description: string
  durationSeconds: number // strictly 30–60 seconds
  durationFormatted: string // e.g. "0:45"
  mediaType: 'video' | 'audio'
  mediaKey?: string // IndexedDB key if local file
  sampleMediaUrl?: string // Demo fallback URL
  subtitlesText?: string
  subtitlesCues?: SubtitleCue[]
  status: LessonStatus
  helpfulCount: number
  notHelpfulCount: number
  createdAt: string
  updatedAt: string
}

// ==========================================
// Mentor Dashboard Upgrade Types
// ==========================================

export type StudentLearningStatus = 'on_track' | 'needs_attention' | 'goal_achieved' | 'inactive'

export type LearnerRecord = {
  id: string
  name: string
  avatarUrl?: string
  avatarColor?: string
  grade: string // e.g. "Class 12 · Govt Girls Senior Sec School, Alwar"
  location: string // e.g. "Alwar, Rajasthan"
  stream: string // e.g. "Science (Biology)"
  subjects: string[] // e.g. ["Biology", "Nursing Entrance Prep", "State Scholarships"]
  learningGoals: string // e.g. "Targeting 80%+ in 12th Board & clearing GNM Nursing entrance"
  status: StudentLearningStatus
  lastActive: string // e.g. "Active 45 mins ago"
  lastActiveTimestamp?: string
  recentActivity: string // e.g. "Completed Mock Quiz #3 (88%)"
  upcomingFollowUp?: string // e.g. "Oct 22, 2026 · College Choice Guidance"
  overallProgress: number // 0 to 100
  quizAverage: number // 0 to 100
  doubtsRaised: number
  doubtsResolved: number
  bio?: string
  enrolledDate: string
}

export type GrowthTopic = {
  id: string
  title: string
  subject: string
  status: 'completed' | 'in_progress' | 'pending'
  progressPercent: number
  lastActivityDate?: string
}

export type QuizScoreRecord = {
  id: string
  title: string
  subject: string
  scorePercent: number
  totalQuestions: number
  date: string
  status: 'passed' | 'review_needed'
}

export type WeeklyActivityHour = {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  hours: number
}

export type StudentMilestone = {
  id: string
  title: string
  targetDate: string
  completed: boolean
}

export type StudentGrowthData = {
  studentId: string
  topics: GrowthTopic[]
  quizScores: QuizScoreRecord[]
  weeklyActivity: WeeklyActivityHour[]
  milestones: StudentMilestone[]
  achievements: { id: string; title: string; desc: string; icon: string; earnedDate: string }[]
  improvementAreas: { id: string; topic: string; subject: string; note: string; severity: 'high' | 'medium' }[]
}

export type MentorshipCheckinStatus = 'scheduled' | 'completed' | 'cancelled'

export type MentorshipCheckin = {
  id: string
  mentorId: string
  studentId: string
  studentName: string
  scheduledDate: string
  completedDate?: string
  mode: TeachingMode
  topic: string
  academicChallenge?: string
  learningGoals?: string
  confidenceLevel: 1 | 2 | 3 | 4 | 5 // 1=Low, 2=Slightly unsure, 3=Moderate, 4=Confident, 5=High
  progressRating?: 'ahead' | 'on_track' | 'lagging'
  notes?: string
  actionItems?: string[]
  followUpDate?: string
  status: MentorshipCheckinStatus
  createdAt: string
}

export type ReflectionStatus = 'assigned' | 'submitted' | 'reviewed'

export type DailyReflectionRecord = {
  id: string
  mentorId: string
  studentId: string
  studentName: string
  topic: string
  assignedDate: string
  submittedDate?: string
  reviewedDate?: string
  status: ReflectionStatus
  prompts: {
    learnedToday: string
    challengingToday: string
    nextGoal: string
  }
  answers?: {
    learnedToday: string
    challengingToday: string
    nextGoal: string
  }
  mentorFeedback?: string
  mentorRating?: 'Great Effort' | 'Good Reflection' | 'Needs More Detail'
}

