import type {
  DailyReflectionRecord,
  LearnerRecord,
  MentorshipCheckin,
  ReflectionStatus,
  StudentGrowthData,
  StudentLearningStatus,
  TeachingMode,
} from '../types'

const STORAGE_KEYS = {
  LEARNERS: 'myraah_learners_v2',
  GROWTH: 'myraah_growth_v2',
  CHECKINS: 'myraah_checkins_v2',
  REFLECTIONS: 'myraah_reflections_v2',
}

// 1. Initial Mock Learners
const DEFAULT_LEARNERS: LearnerRecord[] = [
  {
    id: 'stud-pooja',
    name: 'Pooja Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    grade: 'Class 12 (Science - Bio)',
    location: 'Alwar, Rajasthan · Govt Girls Senior Sec School',
    stream: 'Healthcare & Science',
    subjects: ['Biology', 'GNM Nursing Entrance Prep', 'State Scholarships'],
    learningGoals: 'Targeting 80%+ in 12th Board & clearing GNM Nursing entrance exam in 2026',
    status: 'on_track',
    lastActive: 'Active 45 mins ago',
    lastActiveTimestamp: '2026-10-18T10:30:00',
    recentActivity: 'Completed Mock Quiz #3 (88%) on Cell Biology',
    upcomingFollowUp: 'Oct 22, 2026 · College Choice Guidance',
    overallProgress: 78,
    quizAverage: 86,
    doubtsRaised: 3,
    doubtsResolved: 3,
    bio: 'Dedicated rural student aspiring to enter government healthcare. First-generation nursing aspirant from Alwar district.',
    enrolledDate: 'August 2025',
  },
  {
    id: 'stud-rahul',
    name: 'Rahul Meena',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    grade: 'Class 11 (Science - PCM/B)',
    location: 'Kotputli, Rajasthan · Govt Model Senior School',
    stream: 'Science (NEET Track)',
    subjects: ['NEET Foundation', 'Human Physiology', 'Botany'],
    learningGoals: 'Strengthen NCERT Biology basics & score 600+ in NEET Mock Tests',
    status: 'needs_attention',
    lastActive: 'Active 3 hours ago',
    lastActiveTimestamp: '2026-10-18T08:15:00',
    recentActivity: 'Raised academic doubt on Organic Chemistry reaction mechanisms',
    upcomingFollowUp: 'Oct 20, 2026 · Organic Chemistry Review Session',
    overallProgress: 54,
    quizAverage: 68,
    doubtsRaised: 4,
    doubtsResolved: 2,
    bio: 'Struggling with complex diagram labels and chemistry terminology. Highly motivated but needs structured revision pacing.',
    enrolledDate: 'September 2025',
  },
  {
    id: 'stud-anita',
    name: 'Anita Gurjar',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    grade: 'Class 12 (Arts stream)',
    location: 'Rajgarh, Rajasthan · Govt Senior Sec School',
    stream: 'Vocational Healthcare',
    subjects: ['ANM Nursing Eligibility', 'Community Healthcare', 'Govt Schemes'],
    learningGoals: 'Qualify for Govt ANM Nursing Training on Rajswasthya portal with 65%+ marks',
    status: 'on_track',
    lastActive: 'Active 1 day ago',
    lastActiveTimestamp: '2026-10-17T14:20:00',
    recentActivity: 'Submitted Daily Reflection on Circulatory System notes',
    upcomingFollowUp: 'Oct 25, 2026 · Document Verification Check-in',
    overallProgress: 84,
    quizAverage: 82,
    doubtsRaised: 2,
    doubtsResolved: 2,
    bio: 'Transitioning from Arts to healthcare through ANM. Excellent consistency in daily reflections and audio lesson reviews.',
    enrolledDate: 'July 2025',
  },
  {
    id: 'stud-manoj',
    name: 'Manoj Kumar',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    grade: 'Class 12 (Vocational IT)',
    location: 'Behror, Rajasthan · Govt Excellence School',
    stream: 'Vocational & Digital Skills',
    subjects: ['NSP Pre-Matric Scholarship', 'Digital Literacy', 'DBT Schemes'],
    learningGoals: 'Verify bank NPCI mapping and secure government scholarship funding',
    status: 'goal_achieved',
    lastActive: 'Active 2 days ago',
    lastActiveTimestamp: '2026-10-16T17:40:00',
    recentActivity: 'Bank NPCI Aadhaar seeding verified and scholarship approved',
    upcomingFollowUp: 'Nov 02, 2026 · Next Term Review',
    overallProgress: 92,
    quizAverage: 90,
    doubtsRaised: 3,
    doubtsResolved: 3,
    bio: 'Successfully solved his scholarship DBT roadblock and is now advancing into computer hardware & ITI apprenticeships.',
    enrolledDate: 'August 2025',
  },
  {
    id: 'stud-suresh',
    name: 'Suresh Gowda',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    grade: 'Diploma 2nd Year (Agri-Tech)',
    location: 'Mandya, Karnataka · Community Polytechnic',
    stream: 'Agriculture & Agro-Tech',
    subjects: ['Soil Health & Testing', 'Organic Certification', 'NABARD Loans'],
    learningGoals: 'Complete block KVK soil testing internship and launch rural agro-service kiosk',
    status: 'on_track',
    lastActive: 'Active 5 hours ago',
    lastActiveTimestamp: '2026-10-18T06:50:00',
    recentActivity: 'Reviewed NABARD Micro-Enterprise Handbook notes',
    upcomingFollowUp: 'Oct 24, 2026 · KVK Internship Review',
    overallProgress: 74,
    quizAverage: 79,
    doubtsRaised: 2,
    doubtsResolved: 2,
    bio: 'Dedicated to helping local village farmers with soil nutrition testing and digital subsidy registration.',
    enrolledDate: 'September 2025',
  },
  {
    id: 'stud-kavita',
    name: 'Kavita Saini',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    grade: 'Class 10',
    location: 'Thanagazi, Rajasthan · Rural High School',
    stream: 'Secondary School Foundation',
    subjects: ['Class 10 Science', 'Career Stream Selection', 'Maths Basics'],
    learningGoals: 'Decide between Science and Arts streams for Class 11 and score 75% in boards',
    status: 'inactive',
    lastActive: 'Active 6 days ago',
    lastActiveTimestamp: '2026-10-12T11:00:00',
    recentActivity: 'No active submissions in last 6 days',
    upcomingFollowUp: 'Needs Check-in · Stream selection dilemma',
    overallProgress: 38,
    quizAverage: 58,
    doubtsRaised: 1,
    doubtsResolved: 1,
    bio: 'Bright student from remote hamlet with limited home electricity. Needs scheduled telephone check-ins to stay encouraged.',
    enrolledDate: 'October 2025',
  },
]

// 2. Growth Tracker Data per Student
const DEFAULT_GROWTH_DATA: Record<string, StudentGrowthData> = {
  'stud-pooja': {
    studentId: 'stud-pooja',
    topics: [
      { id: 't-1', title: 'Human Circulatory & Heart Anatomy', subject: 'Biology', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-15' },
      { id: 't-2', title: 'Cell Division & Chromosomal Genetics', subject: 'Biology', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-12' },
      { id: 't-3', title: 'State GNM & B.Sc. Nursing Eligibility Rules', subject: 'Guidance', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-08' },
      { id: 't-4', title: 'Reproductive System & Embryology', subject: 'Biology', status: 'in_progress', progressPercent: 65, lastActivityDate: '2026-10-17' },
      { id: 't-5', title: 'Endocrine Glands & Hormone Regulation', subject: 'Biology', status: 'in_progress', progressPercent: 40, lastActivityDate: '2026-10-18' },
      { id: 't-6', title: 'Entrance Mock Paper #4 Revision', subject: 'Exam Prep', status: 'pending', progressPercent: 0 },
    ],
    quizScores: [
      { id: 'q-1', title: 'Cell Biology Comprehensive Quiz', subject: 'Biology', scorePercent: 88, totalQuestions: 25, date: '2026-10-17', status: 'passed' },
      { id: 'q-2', title: 'Circulatory System & ECG Basics', subject: 'Biology', scorePercent: 92, totalQuestions: 20, date: '2026-10-13', status: 'passed' },
      { id: 'q-3', title: 'General Nursing Aptitude Practice', subject: 'Nursing Prep', scorePercent: 78, totalQuestions: 30, date: '2026-10-09', status: 'passed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 3.5 },
      { day: 'Tue', hours: 2.5 },
      { day: 'Wed', hours: 4.0 },
      { day: 'Thu', hours: 3.0 },
      { day: 'Fri', hours: 4.5 },
      { day: 'Sat', hours: 5.0 },
      { day: 'Sun', hours: 2.0 },
    ],
    milestones: [
      { id: 'm-1', title: 'Complete NCERT Class 12 Unit 1', targetDate: 'Oct 01, 2026', completed: true },
      { id: 'm-2', title: 'Submit 10 Daily Reflections', targetDate: 'Oct 15, 2026', completed: true },
      { id: 'm-3', title: 'Attempt 3 Full-Length Nursing Mocks', targetDate: 'Nov 05, 2026', completed: false },
      { id: 'm-4', title: 'Finalize Govt College Priority List', targetDate: 'Nov 20, 2026', completed: false },
    ],
    achievements: [
      { id: 'ach-1', title: 'Reflection Champion', desc: 'Submitted 12 daily learning reflections on time', icon: 'Award', earnedDate: '2026-10-14' },
      { id: 'ach-2', title: 'Biology Ace', desc: 'Scored 90%+ in 2 consecutive biology quizzes', icon: 'Sparkles', earnedDate: '2026-10-13' },
      { id: 'ach-3', title: 'Active Doubt Inquirer', desc: 'Clarified 3 technical clinical doubts', icon: 'HelpCircle', earnedDate: '2026-10-10' },
    ],
    improvementAreas: [
      { id: 'ia-1', topic: 'Hormonal Feedback Loops (Pituitary-Ovarian axis)', subject: 'Biology', note: 'Requires visual diagram revision for question accuracy.', severity: 'medium' },
      { id: 'ia-2', topic: 'Speed on 90-minute timed mock tests', subject: 'Exam Technique', note: 'Takes ~10 minutes too long on multiple choice section.', severity: 'medium' },
    ],
  },
  'stud-rahul': {
    studentId: 'stud-rahul',
    topics: [
      { id: 't-11', title: 'Plant Kingdom & Algae Classification', subject: 'Botany', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-10' },
      { id: 't-12', title: 'Morphology of Flowering Plants', subject: 'Botany', status: 'in_progress', progressPercent: 50, lastActivityDate: '2026-10-16' },
      { id: 't-13', title: 'Chemical Bonding & Hybridization', subject: 'Chemistry', status: 'in_progress', progressPercent: 45, lastActivityDate: '2026-10-18' },
      { id: 't-14', title: 'Hydrocarbons & Reaction Mechanisms', subject: 'Chemistry', status: 'pending', progressPercent: 20, lastActivityDate: '2026-10-15' },
      { id: 't-15', title: 'Human Digestion & Absorption', subject: 'Physiology', status: 'in_progress', progressPercent: 70, lastActivityDate: '2026-10-14' },
    ],
    quizScores: [
      { id: 'q-11', title: 'Botany Plant Kingdom Unit Test', subject: 'Botany', scorePercent: 74, totalQuestions: 25, date: '2026-10-14', status: 'passed' },
      { id: 'q-12', title: 'Organic Chemistry Diagnostic Quiz', subject: 'Chemistry', scorePercent: 62, totalQuestions: 20, date: '2026-10-11', status: 'review_needed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 2.0 },
      { day: 'Tue', hours: 1.5 },
      { day: 'Wed', hours: 2.5 },
      { day: 'Thu', hours: 1.0 },
      { day: 'Fri', hours: 3.0 },
      { day: 'Sat', hours: 3.5 },
      { day: 'Sun', hours: 1.5 },
    ],
    milestones: [
      { id: 'm-11', title: 'Finish NCERT Class 11 Botany', targetDate: 'Oct 30, 2026', completed: false },
      { id: 'm-12', title: 'Complete 5 Organic Reaction Worksheets', targetDate: 'Oct 25, 2026', completed: false },
      { id: 'm-13', title: 'NEET Foundation Diagnostic Test', targetDate: 'Nov 10, 2026', completed: false },
    ],
    achievements: [
      { id: 'ach-11', title: 'Persistent Inquirer', desc: 'Actively brings questions to mentor sessions', icon: 'HelpCircle', earnedDate: '2026-10-15' },
    ],
    improvementAreas: [
      { id: 'ia-11', topic: 'Organic reaction mechanisms & nucleophilic attacks', subject: 'Chemistry', note: 'Critical bottleneck. Needs step-by-step video note.', severity: 'high' },
      { id: 'ia-12', topic: 'English scientific vocabulary retention', subject: 'General', note: 'Advise dual-language Hindi/English glossary.', severity: 'medium' },
    ],
  },
  'stud-anita': {
    studentId: 'stud-anita',
    topics: [
      { id: 't-21', title: 'Rajswasthya ANM Application Guidelines', subject: 'Guidance', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-12' },
      { id: 't-22', title: 'Community Health & Sanitation Basics', subject: 'Healthcare', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-15' },
      { id: 't-23', title: 'Maternal & Child Health Care Principles', subject: 'Healthcare', status: 'in_progress', progressPercent: 75, lastActivityDate: '2026-10-17' },
      { id: 't-24', title: 'First Aid & Emergency Response', subject: 'Healthcare', status: 'in_progress', progressPercent: 60, lastActivityDate: '2026-10-14' },
    ],
    quizScores: [
      { id: 'q-21', title: 'Community Health & Hygiene Assessment', subject: 'Healthcare', scorePercent: 86, totalQuestions: 20, date: '2026-10-15', status: 'passed' },
      { id: 'q-22', title: 'Rajasthan State Welfare Eligibility', subject: 'Guidance', scorePercent: 78, totalQuestions: 15, date: '2026-10-10', status: 'passed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 3.0 },
      { day: 'Tue', hours: 3.5 },
      { day: 'Wed', hours: 3.0 },
      { day: 'Thu', hours: 4.0 },
      { day: 'Fri', hours: 3.5 },
      { day: 'Sat', hours: 4.0 },
      { day: 'Sun', hours: 2.5 },
    ],
    milestones: [
      { id: 'm-21', title: 'Collect Class 10/12 marksheets & caste certificates', targetDate: 'Oct 20, 2026', completed: true },
      { id: 'm-22', title: 'Submit ANM online application', targetDate: 'Nov 15, 2026', completed: false },
    ],
    achievements: [
      { id: 'ach-21', title: 'Steady Learner', desc: 'Maintained 80%+ quiz score across all health units', icon: 'Award', earnedDate: '2026-10-15' },
      { id: 'ach-22', title: 'Punctual Submitter', desc: 'Completed all reflections within 24 hours of assignment', icon: 'Clock', earnedDate: '2026-10-16' },
    ],
    improvementAreas: [
      { id: 'ia-21', topic: 'Medical terminology memorization', subject: 'Healthcare', note: 'Practice flashcards for regional terms.', severity: 'medium' },
    ],
  },
  'stud-manoj': {
    studentId: 'stud-manoj',
    topics: [
      { id: 't-31', title: 'NSP Portal Student Registration', subject: 'Schemes', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-05' },
      { id: 't-32', title: 'Aadhaar NPCI Mapping & Bank Seeding', subject: 'Schemes', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-16' },
      { id: 't-33', title: 'Computer Hardware & Networking Basics', subject: 'IT', status: 'completed', progressPercent: 88, lastActivityDate: '2026-10-14' },
      { id: 't-34', title: 'ITI Electrician Trade Application', subject: 'Vocational', status: 'in_progress', progressPercent: 80, lastActivityDate: '2026-10-16' },
    ],
    quizScores: [
      { id: 'q-31', title: 'Digital Literacy & Online Safety Quiz', subject: 'IT', scorePercent: 94, totalQuestions: 25, date: '2026-10-12', status: 'passed' },
      { id: 'q-32', title: 'Govt Portal Navigation & Aadhaar Seeding', subject: 'Schemes', scorePercent: 88, totalQuestions: 15, date: '2026-10-07', status: 'passed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 4.0 },
      { day: 'Tue', hours: 4.5 },
      { day: 'Wed', hours: 3.5 },
      { day: 'Thu', hours: 4.0 },
      { day: 'Fri', hours: 4.0 },
      { day: 'Sat', hours: 5.0 },
      { day: 'Sun', hours: 3.0 },
    ],
    milestones: [
      { id: 'm-31', title: 'NPCI bank mapping resolved', targetDate: 'Oct 15, 2026', completed: true },
      { id: 'm-32', title: 'Apply for District ITI Apprenticeship', targetDate: 'Nov 10, 2026', completed: false },
    ],
    achievements: [
      { id: 'ach-31', title: 'Problem Solver', desc: 'Successfully navigated complex bank DBT paperwork', icon: 'Award', earnedDate: '2026-10-16' },
    ],
    improvementAreas: [
      { id: 'ia-31', topic: 'Resume drafting for technical ITI apprenticeships', subject: 'Career', note: 'Provide starter CV template.', severity: 'medium' },
    ],
  },
  'stud-suresh': {
    studentId: 'stud-suresh',
    topics: [
      { id: 't-41', title: 'Soil NPK Ratios & pH Testing Protocols', subject: 'Agriculture', status: 'completed', progressPercent: 100, lastActivityDate: '2026-10-11' },
      { id: 't-42', title: 'NABARD Rural Enterprise Loan Guidelines', subject: 'Schemes', status: 'completed', progressPercent: 90, lastActivityDate: '2026-10-15' },
      { id: 't-43', title: 'Drip Irrigation & Water Conservation', subject: 'Agriculture', status: 'in_progress', progressPercent: 60, lastActivityDate: '2026-10-17' },
    ],
    quizScores: [
      { id: 'q-41', title: 'Agronomy & Soil Nutrient Management', subject: 'Agriculture', scorePercent: 82, totalQuestions: 20, date: '2026-10-14', status: 'passed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 3.0 },
      { day: 'Tue', hours: 3.0 },
      { day: 'Wed', hours: 3.5 },
      { day: 'Thu', hours: 2.5 },
      { day: 'Fri', hours: 4.0 },
      { day: 'Sat', hours: 4.5 },
      { day: 'Sun', hours: 2.0 },
    ],
    milestones: [
      { id: 'm-41', title: 'Pass KVK Soil Certification', targetDate: 'Oct 28, 2026', completed: false },
    ],
    achievements: [
      { id: 'ach-41', title: 'Community Impact', desc: 'Assisted 12 farmers with test soil samples', icon: 'Award', earnedDate: '2026-10-12' },
    ],
    improvementAreas: [
      { id: 'ia-41', topic: 'NABARD project report financial accounting', subject: 'Finance', note: 'Needs guidance on cash flow estimation.', severity: 'high' },
    ],
  },
  'stud-kavita': {
    studentId: 'stud-kavita',
    topics: [
      { id: 't-51', title: 'Class 10 Chemical Reactions & Equations', subject: 'Science', status: 'completed', progressPercent: 100, lastActivityDate: '2026-09-28' },
      { id: 't-52', title: 'Acids, Bases & Salts', subject: 'Science', status: 'in_progress', progressPercent: 40, lastActivityDate: '2026-10-05' },
      { id: 't-53', title: 'Life Processes & Nutrition', subject: 'Science', status: 'pending', progressPercent: 15, lastActivityDate: '2026-10-08' },
    ],
    quizScores: [
      { id: 'q-51', title: 'Chemical Reactions Unit Test', subject: 'Science', scorePercent: 58, totalQuestions: 15, date: '2026-10-06', status: 'review_needed' },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 1.0 },
      { day: 'Tue', hours: 0.5 },
      { day: 'Wed', hours: 1.0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 1.5 },
      { day: 'Sat', hours: 1.0 },
      { day: 'Sun', hours: 0.5 },
    ],
    milestones: [
      { id: 'm-51', title: 'Decide Class 11 Stream', targetDate: 'Nov 01, 2026', completed: false },
    ],
    achievements: [],
    improvementAreas: [
      { id: 'ia-51', topic: 'Consistency in study hours & homework', subject: 'Habits', note: 'Schedule phone check-in with family support.', severity: 'high' },
    ],
  },
}

// 3. Initial Mock Check-ins (Upcoming & Completed)
const DEFAULT_CHECKINS: MentorshipCheckin[] = [
  {
    id: 'chk-1',
    mentorId: 'm-asha',
    studentId: 'stud-rahul',
    studentName: 'Rahul Meena',
    scheduledDate: '2026-10-20',
    mode: 'voice',
    topic: 'Organic Chemistry Reaction Mechanisms & Revision Plan',
    academicChallenge: 'Struggles with remembering reaction conditions and English terminology for nucleophilic substitution.',
    learningGoals: 'Solve 20 NCERT exemplar questions and create reaction flashcards.',
    confidenceLevel: 2,
    progressRating: 'lagging',
    notes: 'Rahul is diligent but feels overwhelmed by Class 11 science transition. Recommended bilingual Hindi-English summary sheets.',
    actionItems: [
      'Download audio summary of Chapter 12 Hydrocarbons',
      'Draw mechanism flowcharts for electrophilic addition',
      'Solve 15 practice MCQs from NCERT exemplar',
    ],
    followUpDate: '2026-10-27',
    status: 'scheduled',
    createdAt: '2026-10-16',
  },
  {
    id: 'chk-2',
    mentorId: 'm-asha',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    scheduledDate: '2026-10-22',
    mode: 'video',
    topic: 'GNM vs B.Sc. Nursing College Choice Filling & Timeline',
    academicChallenge: 'Needs clarity on whether to prioritize government district hospitals or university nursing colleges.',
    learningGoals: 'Finalize top 8 college preferences on Rajasthan portal.',
    confidenceLevel: 4,
    progressRating: 'on_track',
    notes: 'Pooja is well ahead in biology mock exams (88%). Advised placing SMS Hospital Jaipur and AIIMS Jodhpur nursing programs as top priorities.',
    actionItems: [
      'Verify domicile certificate validity date',
      'Review previous year cutoff ranks for OBC-NCL category',
    ],
    followUpDate: '2026-11-05',
    status: 'scheduled',
    createdAt: '2026-10-15',
  },
  {
    id: 'chk-3',
    mentorId: 'm-asha',
    studentId: 'stud-anita',
    studentName: 'Anita Gurjar',
    scheduledDate: '2026-10-25',
    mode: 'voice',
    topic: 'Rajswasthya Portal Application Document Review',
    academicChallenge: 'Ensuring marks conversion from Arts stream meets INC criteria.',
    learningGoals: 'Verify all scanned PDFs are under 200KB for upload.',
    confidenceLevel: 3,
    progressRating: 'on_track',
    notes: 'Confirmed that INC guidelines explicitly allow Arts students with 40%+ marks for ANM training.',
    actionItems: ['Scan marksheet at local e-Mitra kiosk'],
    followUpDate: '2026-11-10',
    status: 'scheduled',
    createdAt: '2026-10-16',
  },
  {
    id: 'chk-4',
    mentorId: 'm-asha',
    studentId: 'stud-manoj',
    studentName: 'Manoj Kumar',
    scheduledDate: '2026-10-12',
    completedDate: '2026-10-12',
    mode: 'voice',
    topic: 'Aadhaar NPCI Bank Mapping Resolution & Scholarship Slip',
    academicChallenge: 'Bank manager was confused between normal KYC and DBT NPCI seeding mandate.',
    learningGoals: 'Get the exact NPCI mandate form stamped by branch manager.',
    confidenceLevel: 4,
    progressRating: 'ahead',
    notes: 'Provided Manoj the official circular text. He visited the Behror branch and successfully submitted form.',
    actionItems: ['Wait 48 hours and check NSP portal status (COMPLETED)'],
    followUpDate: '2026-11-02',
    status: 'completed',
    createdAt: '2026-10-10',
  },
  {
    id: 'chk-5',
    mentorId: 'm-asha',
    studentId: 'stud-anita',
    studentName: 'Anita Gurjar',
    scheduledDate: '2026-10-08',
    completedDate: '2026-10-08',
    mode: 'voice',
    topic: 'ANM Course Overview & Career Path in Rural Health Sub-Centers',
    academicChallenge: 'Hesitation about whether ANM leads to government permanent vacancies.',
    learningGoals: 'Understand salary scale and promotion path from ANM to LHV.',
    confidenceLevel: 3,
    progressRating: 'on_track',
    notes: 'Detailed how National Health Mission (NHM) recruits ANMs in primary health sub-centers. Anita felt reassured.',
    actionItems: ['Start daily science notes revision'],
    status: 'completed',
    createdAt: '2026-10-05',
  },
]

// 4. Initial Mock Daily Reflections
const DEFAULT_REFLECTIONS: DailyReflectionRecord[] = [
  {
    id: 'ref-1',
    mentorId: 'm-asha',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    topic: 'Human Circulatory System & Double Circulation',
    assignedDate: '2026-10-17',
    submittedDate: '2026-10-17',
    status: 'submitted',
    prompts: {
      learnedToday: 'What did you learn today in your studies?',
      challengingToday: 'What concept or question was challenging for you today?',
      nextGoal: 'What is your next learning goal for tomorrow?',
    },
    answers: {
      learnedToday: 'Today I practiced the double circulation pathway of human blood. I learned how the pulmonary circuit takes deoxygenated blood from right ventricle to lungs, and systemic circuit takes oxygenated blood to the body.',
      challengingToday: 'I got confused between the bicuspid (mitral) valve and tricuspid valve locations during the speed quiz. I also had difficulty drawing the exact electrical conduction through the Bundle of His.',
      nextGoal: 'Tomorrow I will practice drawing the 4-chamber heart diagram 3 times without looking at the book and solve 15 past entrance exam questions.',
    },
  },
  {
    id: 'ref-2',
    mentorId: 'm-asha',
    studentId: 'stud-anita',
    studentName: 'Anita Gurjar',
    topic: 'Vital Signs & Maternal Nutrition Basics',
    assignedDate: '2026-10-16',
    submittedDate: '2026-10-16',
    reviewedDate: '2026-10-17',
    status: 'reviewed',
    prompts: {
      learnedToday: 'What did you learn today in your studies?',
      challengingToday: 'What concept or question was challenging for you today?',
      nextGoal: 'What is your next learning goal for tomorrow?',
    },
    answers: {
      learnedToday: 'I listened to Asha ma\'am\'s audio note on maternal nutrition in Rajasthan. I made written notes in Hindi about IFA (Iron Folic Acid) tablets schedule during pregnancy and normal blood pressure ranges.',
      challengingToday: 'Remembering medical units for hemoglobin levels (g/dL) was slightly hard because I come from Arts background.',
      nextGoal: 'Revise my handwritten chart of vaccinations given to newborn infants under Mission Indradhanush.',
    },
    mentorFeedback: 'Wonderful effort, Anita! Your notes are neat and accurate. For hemoglobin units, just remember 12-14 is normal for women. Keep up this daily habit—it builds immense confidence for your ANM interviews.',
    mentorRating: 'Great Effort',
  },
  {
    id: 'ref-3',
    mentorId: 'm-asha',
    studentId: 'stud-rahul',
    studentName: 'Rahul Meena',
    topic: 'Hydrocarbons & Alkene Addition Reactions',
    assignedDate: '2026-10-16',
    submittedDate: '2026-10-17',
    status: 'submitted',
    prompts: {
      learnedToday: 'What did you learn today in your studies?',
      challengingToday: 'What concept or question was challenging for you today?',
      nextGoal: 'What is your next learning goal for tomorrow?',
    },
    answers: {
      learnedToday: 'I tried reading Markovnikov addition rule for hydrogen halides to unsymmetrical alkenes.',
      challengingToday: 'I could not understand why peroxide effect gives Anti-Markovnikov product only with HBr and not with HCl or HI. It felt very confusing.',
      nextGoal: 'Ask mentor during check-in session and re-attempt question #4 in exemplar.',
    },
  },
  {
    id: 'ref-4',
    mentorId: 'm-asha',
    studentId: 'stud-suresh',
    studentName: 'Suresh Gowda',
    topic: 'KVK Soil Testing Practical Observations',
    assignedDate: '2026-10-15',
    submittedDate: '2026-10-15',
    reviewedDate: '2026-10-16',
    status: 'reviewed',
    prompts: {
      learnedToday: 'What did you learn today in your studies?',
      challengingToday: 'What concept or question was challenging for you today?',
      nextGoal: 'What is your next learning goal for tomorrow?',
    },
    answers: {
      learnedToday: 'Assisted the KVK agronomist in preparing 10 soil samples using the colorimeter for organic carbon measurement.',
      challengingToday: 'Calculating the electrical conductivity (EC) to determine salinity for paddy soils in irrigated fields.',
      nextGoal: 'Complete the written report for block farmer consultation.',
    },
    mentorFeedback: 'Outstanding field application Suresh. Keep documenting the EC values for salty plots; farmers appreciate practical advice on gypsum application.',
    mentorRating: 'Great Effort',
  },
  {
    id: 'ref-5',
    mentorId: 'm-asha',
    studentId: 'stud-kavita',
    studentName: 'Kavita Saini',
    topic: 'Class 10 Science Chapter 2 Acids and Bases',
    assignedDate: '2026-10-17',
    status: 'assigned',
    prompts: {
      learnedToday: 'What did you learn today in your studies?',
      challengingToday: 'What concept or question was challenging for you today?',
      nextGoal: 'What is your next learning goal for tomorrow?',
    },
  },
]

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`Error loading key ${key}:`, e)
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('myraah-learner-update'))
  } catch (e) {
    console.error(`Error saving key ${key}:`, e)
  }
}

export const learnerStore = {
  // 1. Learners Management
  getAllLearners(): LearnerRecord[] {
    return load<LearnerRecord[]>(STORAGE_KEYS.LEARNERS, DEFAULT_LEARNERS)
  },

  getLearnersByMentor(_mentorId: string): LearnerRecord[] {
    // In our prototype, all assigned learners belong to the active mentor workspace
    return this.getAllLearners()
  },

  getLearnerById(studentId: string): LearnerRecord | null {
    const all = this.getAllLearners()
    return all.find(l => l.id === studentId) || null
  },

  updateLearnerStatus(studentId: string, status: StudentLearningStatus): boolean {
    const all = this.getAllLearners()
    const target = all.find(l => l.id === studentId)
    if (!target) return false
    target.status = status
    save(STORAGE_KEYS.LEARNERS, all)
    return true
  },

  // 2. Growth Tracker Data
  getGrowthData(studentId: string): StudentGrowthData | null {
    const allGrowth = load<Record<string, StudentGrowthData>>(STORAGE_KEYS.GROWTH, DEFAULT_GROWTH_DATA)
    if (allGrowth[studentId]) return allGrowth[studentId]

    // Fallback template for any student
    const learner = this.getLearnerById(studentId)
    const fallback: StudentGrowthData = {
      studentId,
      topics: [
        { id: `t-fb-1`, title: 'General Curriculum Fundamentals', subject: learner?.subjects[0] || 'General', status: 'completed', progressPercent: 100 },
        { id: `t-fb-2`, title: 'Core Syllabus Practical Practice', subject: learner?.subjects[0] || 'General', status: 'in_progress', progressPercent: 60 },
        { id: `t-fb-3`, title: 'Term Review Assessment', subject: 'Exam Prep', status: 'pending', progressPercent: 0 },
      ],
      quizScores: [
        { id: `q-fb-1`, title: 'Diagnostic Progress Test', subject: 'Core', scorePercent: learner?.quizAverage || 75, totalQuestions: 20, date: '2026-10-10', status: 'passed' },
      ],
      weeklyActivity: [
        { day: 'Mon', hours: 2.0 },
        { day: 'Tue', hours: 2.5 },
        { day: 'Wed', hours: 3.0 },
        { day: 'Thu', hours: 2.0 },
        { day: 'Fri', hours: 3.5 },
        { day: 'Sat', hours: 4.0 },
        { day: 'Sun', hours: 1.5 },
      ],
      milestones: [
        { id: `m-fb-1`, title: 'Complete orientation & syllabus plan', targetDate: '2026-10-01', completed: true },
        { id: `m-fb-2`, title: 'Complete first term mock test', targetDate: '2026-11-15', completed: false },
      ],
      achievements: [
        { id: `ach-fb-1`, title: 'Motivated Starter', desc: 'Successfully onboarded with personal learning goals', icon: 'Sparkles', earnedDate: '2026-10-01' },
      ],
      improvementAreas: [
        { id: `ia-fb-1`, topic: 'Weekly Revision Routine', subject: 'General', note: 'Establish 15-minute daily summary habits.', severity: 'medium' },
      ],
    }
    return fallback
  },

  updateTopicStatus(studentId: string, topicId: string, status: 'completed' | 'in_progress' | 'pending'): boolean {
    const allGrowth = load<Record<string, StudentGrowthData>>(STORAGE_KEYS.GROWTH, DEFAULT_GROWTH_DATA)
    const data = allGrowth[studentId]
    if (!data) return false
    const topic = data.topics.find(t => t.id === topicId)
    if (!topic) return false
    topic.status = status
    topic.progressPercent = status === 'completed' ? 100 : status === 'pending' ? 0 : 50
    allGrowth[studentId] = data
    save(STORAGE_KEYS.GROWTH, allGrowth)
    return true
  },

  // 3. Mentorship Hub (Check-ins & History)
  getCheckins(mentorId: string, studentId?: string): MentorshipCheckin[] {
    const all = load<MentorshipCheckin[]>(STORAGE_KEYS.CHECKINS, DEFAULT_CHECKINS)
    return all.filter(c => {
      const matchMentor = !mentorId || c.mentorId === mentorId || c.mentorId === 'm-asha'
      const matchStudent = !studentId || c.studentId === studentId
      return matchMentor && matchStudent
    })
  },

  createCheckin(
    mentorId: string,
    params: {
      studentId: string
      studentName: string
      scheduledDate: string
      mode: TeachingMode
      topic: string
      academicChallenge?: string
      learningGoals?: string
      confidenceLevel: 1 | 2 | 3 | 4 | 5
      progressRating?: 'ahead' | 'on_track' | 'lagging'
      notes?: string
      actionItems?: string[]
      followUpDate?: string
    }
  ): { success: boolean; checkin?: MentorshipCheckin; error?: string } {
    if (!params.studentId || !params.topic.trim() || !params.scheduledDate) {
      return { success: false, error: 'Student, topic, and scheduled date are required.' }
    }

    const all = load<MentorshipCheckin[]>(STORAGE_KEYS.CHECKINS, DEFAULT_CHECKINS)
    const newCheckin: MentorshipCheckin = {
      id: `chk-${Date.now().toString(36)}`,
      mentorId,
      studentId: params.studentId,
      studentName: params.studentName,
      scheduledDate: params.scheduledDate,
      mode: params.mode,
      topic: params.topic.trim(),
      academicChallenge: params.academicChallenge?.trim(),
      learningGoals: params.learningGoals?.trim(),
      confidenceLevel: params.confidenceLevel,
      progressRating: params.progressRating,
      notes: params.notes?.trim(),
      actionItems: params.actionItems?.filter(Boolean) || [],
      followUpDate: params.followUpDate,
      status: 'scheduled',
      createdAt: new Date().toISOString().split('T')[0],
    }

    all.unshift(newCheckin)
    save(STORAGE_KEYS.CHECKINS, all)

    // Update upcoming follow-up on learner card
    const learners = this.getAllLearners()
    const l = learners.find(item => item.id === params.studentId)
    if (l) {
      l.upcomingFollowUp = `${params.scheduledDate} · ${params.topic.slice(0, 30)}`
      save(STORAGE_KEYS.LEARNERS, learners)
    }

    return { success: true, checkin: newCheckin }
  },

  completeCheckin(
    checkinId: string,
    completionData: {
      completionNotes?: string
      updatedConfidence?: 1 | 2 | 3 | 4 | 5
      nextFollowUpDate?: string
    }
  ): { success: boolean; error?: string } {
    const all = load<MentorshipCheckin[]>(STORAGE_KEYS.CHECKINS, DEFAULT_CHECKINS)
    const target = all.find(c => c.id === checkinId)
    if (!target) return { success: false, error: 'Check-in not found.' }

    target.status = 'completed'
    target.completedDate = new Date().toISOString().split('T')[0]
    if (completionData.completionNotes?.trim()) {
      target.notes = target.notes
        ? `${target.notes}\n\nOutcome (${target.completedDate}): ${completionData.completionNotes.trim()}`
        : completionData.completionNotes.trim()
    }
    if (completionData.updatedConfidence) {
      target.confidenceLevel = completionData.updatedConfidence
    }
    if (completionData.nextFollowUpDate) {
      target.followUpDate = completionData.nextFollowUpDate
    }

    save(STORAGE_KEYS.CHECKINS, all)
    return { success: true }
  },

  cancelCheckin(checkinId: string): boolean {
    const all = load<MentorshipCheckin[]>(STORAGE_KEYS.CHECKINS, DEFAULT_CHECKINS)
    const target = all.find(c => c.id === checkinId)
    if (!target) return false
    target.status = 'cancelled'
    save(STORAGE_KEYS.CHECKINS, all)
    return true
  },

  // 4. Daily Pulse (Reflections Management)
  getReflections(mentorId: string, studentId?: string, statusFilter?: ReflectionStatus | 'all'): DailyReflectionRecord[] {
    const all = load<DailyReflectionRecord[]>(STORAGE_KEYS.REFLECTIONS, DEFAULT_REFLECTIONS)
    return all.filter(r => {
      const matchMentor = !mentorId || r.mentorId === mentorId || r.mentorId === 'm-asha'
      const matchStudent = !studentId || r.studentId === studentId
      const matchStatus = !statusFilter || statusFilter === 'all' || r.status === statusFilter
      return matchMentor && matchStudent && matchStatus
    })
  },

  assignReflection(
    mentorId: string,
    params: {
      studentId: string
      studentName: string
      topic: string
      customQuestion?: string
    }
  ): { success: boolean; reflection?: DailyReflectionRecord; error?: string } {
    if (!params.studentId || !params.topic.trim()) {
      return { success: false, error: 'Please select a student and topic for daily reflection.' }
    }

    const all = load<DailyReflectionRecord[]>(STORAGE_KEYS.REFLECTIONS, DEFAULT_REFLECTIONS)
    const newRef: DailyReflectionRecord = {
      id: `ref-${Date.now().toString(36)}`,
      mentorId,
      studentId: params.studentId,
      studentName: params.studentName,
      topic: params.topic.trim(),
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'assigned',
      prompts: {
        learnedToday: 'What did you learn today in your studies?',
        challengingToday: params.customQuestion?.trim() || 'What concept or question was challenging for you today?',
        nextGoal: 'What is your next learning goal for tomorrow?',
      },
    }

    all.unshift(newRef)
    save(STORAGE_KEYS.REFLECTIONS, all)
    return { success: true, reflection: newRef }
  },

  reviewReflection(
    reflectionId: string,
    params: {
      feedback: string
      rating: 'Great Effort' | 'Good Reflection' | 'Needs More Detail'
    }
  ): { success: boolean; error?: string } {
    if (!params.feedback?.trim()) {
      return { success: false, error: 'Please enter written mentor feedback.' }
    }

    const all = load<DailyReflectionRecord[]>(STORAGE_KEYS.REFLECTIONS, DEFAULT_REFLECTIONS)
    const target = all.find(r => r.id === reflectionId)
    if (!target) return { success: false, error: 'Reflection not found.' }

    target.status = 'reviewed'
    target.reviewedDate = new Date().toISOString().split('T')[0]
    target.mentorFeedback = params.feedback.trim()
    target.mentorRating = params.rating

    save(STORAGE_KEYS.REFLECTIONS, all)
    return { success: true }
  },

  // 5. Dashboard High-Level Metrics
  getDashboardMetrics(mentorId: string) {
    const learners = this.getLearnersByMentor(mentorId)
    const checkins = this.getCheckins(mentorId)
    const reflections = this.getReflections(mentorId)

    const totalStudents = learners.length
    const onTrackStudents = learners.filter(l => l.status === 'on_track' || l.status === 'goal_achieved').length
    const needsAttention = learners.filter(l => l.status === 'needs_attention').length
    const upcomingCheckins = checkins.filter(c => c.status === 'scheduled').length
    const pendingReflections = reflections.filter(r => r.status === 'submitted').length
    const completedSessions = checkins.filter(c => c.status === 'completed').length

    return {
      totalStudents,
      onTrackStudents,
      needsAttention,
      upcomingCheckins,
      pendingReflections,
      completedSessions,
    }
  },
}
