import { useEffect, useState } from 'react'
import type { User } from '../types'
import type {
  AllocatedLearner,
  EmployerReferral,
  FacilitatorOpportunity,
  FacilitatorProfile,
  FacilitatorState,
  FollowUpReminder,
  MatchEvaluation,
  ReferralStatus,
  SupportTrack,
} from './model'

const STORAGE_KEY = 'myraah_facilitator_state_v1'

export const uid = () => Math.random().toString(36).slice(2, 10)

// Pre-seeded Learners with rich project/skill details for matching & talent discovery
const INITIAL_LEARNERS: AllocatedLearner[] = [
  {
    id: 'stud-pooja',
    name: 'Pooja Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Class 12 (Science - Bio)',
    location: 'Alwar, Rajasthan',
    preferredLanguage: 'Hindi, English',
    stream: 'Healthcare & Science',
    subjects: ['Biology', 'GNM Nursing Entrance Prep', 'State Scholarships'],
    skills: ['Patient First Aid', 'Anatomy Fundamentals', 'Sanitation Protocols', 'Compassionate Care'],
    careerGoals: 'Targeting 80%+ in 12th Board & clearing GNM Nursing entrance exam in 2026',
    overallProgress: 78,
    currentStatus: 'on_track',
    assignmentStatus: 'assigned_to_me',
    assignedFacilitatorName: 'Self',
    assignedDate: '2026-09-12',
    supportTrack: 'Healthcare & Nursing',
    assignmentReason: 'Matched for community healthcare & nursing admissions path.',
    lastActive: 'Active 45 mins ago',
    recentActivity: 'Completed Mock Quiz #3 (88%) on Cell Biology',
    isTalentShortlisted: true,
    shortlistReason: 'Demonstrated exceptional hands-on patient triage in village healthcare camp.',
    readinessLevel: 'Internship Ready',
    demonstratedProjects: [
      {
        title: 'Community Health Awareness Camp',
        description: 'Assisted local PHC staff in screening 140 villagers for basic vitals and hygiene.',
      },
      {
        title: 'First-Aid Kit & Manual in Hindi',
        description: 'Compiled illustrated guide for common rural injuries and burns.',
      },
    ],
    certifications: ['Red Cross Basic First-Aid', 'District Healthcare Volunteer'],
    portfolioUrl: 'https://demo-portfolio.myraah.org/pooja-healthcare',
    observableCriteria: [
      'Verified clinical volunteer hours (40+ hrs)',
      'Consistent 85%+ diagnostic quiz performance',
      'Clear documentation in local dialect',
    ],
  },
  {
    id: 'stud-manoj',
    name: 'Manoj Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Diploma / ITI 2nd Year',
    location: 'Bastar, Chhattisgarh',
    preferredLanguage: 'Hindi, Chhattisgarhi',
    stream: 'Vocational - Electrician & Clean Energy',
    subjects: ['AC/DC Motor Circuits', 'Solar Panel Layouts', 'Safety Grounding'],
    skills: ['Solar Panel Installation', 'Circuit Troubleshooting', 'Multimeter Testing', 'Inverter Wiring'],
    careerGoals: 'Certified Solar Technician and apprentice in decentralized renewable energy grid',
    overallProgress: 82,
    currentStatus: 'on_track',
    assignmentStatus: 'assigned_to_me',
    assignedFacilitatorName: 'Self',
    assignedDate: '2026-08-20',
    supportTrack: 'Solar & Clean Tech',
    assignmentReason: 'High practical skill in electrical trades seeking formal industry apprenticeship.',
    lastActive: 'Active 2 hours ago',
    recentActivity: 'Submitted schematic for solar micro-inverter setup',
    isTalentShortlisted: true,
    shortlistReason: 'Built verified solar home-lighting prototype with 100% safety compliance.',
    readinessLevel: 'Apprenticeship Ready',
    demonstratedProjects: [
      {
        title: 'Solar Lantern Repair Project',
        description: 'Repaired and recalibrated 35 solar study lamps for village school.',
      },
      {
        title: 'Model Household Wiring Circuit',
        description: 'Constructed working dual-circuit board with fuse breakers and earthing.',
      },
    ],
    certifications: ['National Skill Qualification Framework (NSQF) Level 4 Electrician', 'Solar PV Installer Certified'],
    portfolioUrl: 'https://demo-portfolio.myraah.org/manoj-solar',
    observableCriteria: [
      'Completed 200+ hours hands-on workshop training',
      'Zero safety violations in trade assessments',
      'Demonstrated repair of 30+ hardware units',
    ],
  },
  {
    id: 'stud-kavita',
    name: 'Kavita Roy',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Polytechnic Diploma (Computer Science)',
    location: 'Siliguri, West Bengal',
    preferredLanguage: 'Bengali, Hindi, English',
    stream: 'Computer & Digital Skills',
    subjects: ['HTML & CSS', 'JavaScript Basics', 'Data Entry', 'Digital Accessibility'],
    skills: ['Frontend Web Development', 'Responsive Design', 'Offline Web Storage', 'Technical Documentation'],
    careerGoals: 'Junior Web Developer or IT Support Technician for rural cooperative services',
    overallProgress: 88,
    currentStatus: 'on_track',
    assignmentStatus: 'unassigned',
    lastActive: 'Active 1 hour ago',
    recentActivity: 'Created offline-first student noticeboard demo',
    isTalentShortlisted: true,
    shortlistReason: 'Built functional multi-lingual web portal prototype accessible on basic smartphones.',
    readinessLevel: 'Internship Ready',
    demonstratedProjects: [
      {
        title: 'Rural Panchayat Portal Prototype',
        description: 'Responsive mobile portal displaying daily agriculture mandi prices.',
        link: 'https://github.com/demo/rural-mandi-web',
      },
      {
        title: 'Smartphone Literacy Handbook',
        description: 'Designed illustrated guide for women self-help groups on digital UPI transactions.',
      },
    ],
    certifications: ['NIELIT ' + 'O' + ' Level Computer Application', 'Frontend Web Design Certificate'],
    portfolioUrl: 'https://demo-portfolio.myraah.org/kavita-dev',
    observableCriteria: [
      'Published live code repo with 15+ commits',
      'Demonstrated mastery of mobile-responsive CSS',
      'Peer-reviewed project documentation',
    ],
  },
  {
    id: 'stud-suresh',
    name: 'Suresh Yadav',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Class 12 (Agriculture Stream)',
    location: 'Sitapur, Uttar Pradesh',
    preferredLanguage: 'Hindi',
    stream: 'Agriculture & Rural Tech',
    subjects: ['Soil Science', 'Drip Irrigation', 'Crop Disease Diagnosis', 'Organic Fertilizers'],
    skills: ['Soil pH Testing', 'Micro-irrigation Setup', 'Bio-fertilizer Preparation', 'Crop Cycle Planning'],
    careerGoals: 'Field Agronomist Apprentice with Kisan Vikas Kendra or Agri-Input Enterprise',
    overallProgress: 71,
    currentStatus: 'needs_support',
    assignmentStatus: 'assigned_to_me',
    assignedFacilitatorName: 'Self',
    assignedDate: '2026-09-01',
    supportTrack: 'Agriculture & Rural Tech',
    assignmentReason: 'Strong field practical knowledge; requires guidance on formal apprenticeship applications.',
    lastActive: 'Active yesterday',
    recentActivity: 'Reviewed organic soil rejuvenation field guidelines',
    isTalentShortlisted: false,
    readinessLevel: 'Foundational Training',
    demonstratedProjects: [
      {
        title: 'Zero-Cost Vermicompost Pit',
        description: 'Built 2 vermicomposting units using locally sourced agricultural biomass.',
      },
    ],
    certifications: ['Soil Health Card Field Assistant (Demo)'],
    observableCriteria: [
      'Field testing log verified by local agriculture supervisor',
      'Practical demonstration of drip line installation',
    ],
  },
  {
    id: 'stud-rahul',
    name: 'Rahul Meena',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Class 11 (Science - PCM/B)',
    location: 'Kotputli, Rajasthan',
    preferredLanguage: 'Hindi',
    stream: 'Science (NEET / Higher Ed)',
    subjects: ['Physics Basics', 'Inorganic Chemistry', 'Human Physiology'],
    skills: ['Analytical Problem Solving', 'Diagrammatic Representation', 'Scientific Method'],
    careerGoals: 'Medical admissions or paramedical bachelor degree',
    overallProgress: 54,
    currentStatus: 'critical',
    assignmentStatus: 'assigned_to_me',
    assignedFacilitatorName: 'Self',
    assignedDate: '2026-09-18',
    supportTrack: 'Higher Education & Admissions',
    assignmentReason: 'Needs structured pacing and diagnostic support to overcome chemistry bottlenecks.',
    lastActive: 'Active 3 hours ago',
    recentActivity: 'Raised doubt regarding organic functional groups',
    isTalentShortlisted: false,
    readinessLevel: 'Foundational Training',
    demonstratedProjects: [
      {
        title: 'Science Exhibition Working Lung Model',
        description: 'Demonstrated diaphragm expansion using recycled plastic containers.',
      },
    ],
    certifications: ['Junior Science Olympiad Participant'],
    observableCriteria: ['High academic motivation', 'Needs confidence coaching in numericals'],
  },
  {
    id: 'stud-anita',
    name: 'Anita Soren',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Class 12 (Arts & Humanities)',
    location: 'Ranchi, Jharkhand',
    preferredLanguage: 'Hindi, Santhali, English',
    stream: 'Govt Schemes & Humanities',
    subjects: ['Public Administration', 'General Knowledge', 'Basic Accounting', 'Typing Skills'],
    skills: ['Documentation & Record Keeping', 'Bilingual Translation', 'Panchayat Liaison', 'Typing (35 wpm)'],
    careerGoals: 'Panchayat Secretary or District Social Welfare Field Assistant',
    overallProgress: 75,
    currentStatus: 'on_track',
    assignmentStatus: 'unassigned',
    lastActive: 'Active 5 hours ago',
    recentActivity: 'Passed General Studies speed drill with 84%',
    isTalentShortlisted: false,
    readinessLevel: 'Internship Ready',
    demonstratedProjects: [
      {
        title: 'Village Government Scheme Enrollment Drive',
        description: 'Assisted 60 elder citizens in filling pension and health card applications.',
      },
    ],
    certifications: ['State IT Literacy & Typing Certificate', 'Legal Awareness Camp Volunteer'],
    observableCriteria: [
      'Proficient in bilingual translation and record-keeping',
      'Demonstrated civic engagement documentation',
    ],
  },
  {
    id: 'stud-vikram',
    name: 'Vikram Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'ITI 2nd Year (Fitter & Fabrication)',
    location: 'Jhansi, Uttar Pradesh',
    preferredLanguage: 'Hindi',
    stream: 'Vocational Trades & ITI',
    subjects: ['Machine Tools', 'Lathe Operations', 'Welding Safety', 'Blueprint Reading'],
    skills: ['Precision Lathe Turning', 'MIG/TIG Welding', 'Machine Maintenance', 'Mechanical Assembly'],
    careerGoals: 'Railway Apprentice or Heavy Machinery Fabrication Technician',
    overallProgress: 91,
    currentStatus: 'on_track',
    assignmentStatus: 'assigned_to_peer',
    assignedFacilitatorName: 'Shri Ramakant Sharma (Govt ITI Nodal)',
    assignedDate: '2026-07-15',
    supportTrack: 'Vocational Trades & ITI',
    assignmentReason: 'Nominated for National Apprenticeship Promotion Scheme (NAPS).',
    lastActive: 'Active 4 hours ago',
    recentActivity: 'Logged 40 hours fabrication workshop journal',
    isTalentShortlisted: true,
    shortlistReason: 'Fabricated zero-tolerance pipe coupling prototype awarded 1st prize in district.',
    readinessLevel: 'Apprenticeship Ready',
    demonstratedProjects: [
      {
        title: 'Agricultural Thresher Safety Guard',
        description: 'Designed and welded retrofit protective barrier preventing grain feeder accidents.',
      },
    ],
    certifications: ['NAPS Trade Certification', 'Industrial Workshop Safety Certified'],
    portfolioUrl: 'https://demo-portfolio.myraah.org/vikram-fabrication',
    observableCriteria: [
      '1st Prize in Regional ITI Fabrication Contest',
      'Mastery of precision measuring instruments (micrometer, vernier caliper)',
    ],
  },
  {
    id: 'stud-meena',
    name: 'Meena Kumari',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    educationLevel: 'Undergraduate 1st Year (B.A. Education)',
    location: 'Madhubani, Bihar',
    preferredLanguage: 'Hindi, Maithili',
    stream: 'Education & Community Outreach',
    subjects: ['Child Development', 'Early Literacy Techniques', 'Community Learning'],
    skills: ['Remedial Reading Tutoring', 'Interactive Storytelling', 'Parent Counseling', 'Classroom Engagement'],
    careerGoals: 'Primary Educator, NGO Learning Center Coordinator, or Anganwadi Supervisor',
    overallProgress: 79,
    currentStatus: 'on_track',
    assignmentStatus: 'unassigned',
    lastActive: 'Active yesterday',
    recentActivity: 'Created phonics chart for foundational Hindi reading',
    isTalentShortlisted: false,
    readinessLevel: 'Internship Ready',
    demonstratedProjects: [
      {
        title: 'Weekend Mohalla Reading Circle',
        description: 'Conducted weekly remedial literacy sessions for 20 out-of-school children.',
      },
    ],
    certifications: ['Foundational Literacy & Numeracy (FLN) Volunteer'],
    observableCriteria: [
      'Documented reading progress of 20 elementary pupils',
      'Created original vernacular phonics learning aids',
    ],
  },
]

// Pre-seeded Opportunities matching verified employer entities
const INITIAL_OPPORTUNITIES: FacilitatorOpportunity[] = [
  {
    id: 'opp-solar-trainee',
    title: 'Solar Microgrid Installation Apprentice',
    employerId: 'emp-apex-solar',
    employerName: 'Apex Solar Energy Solutions',
    domain: 'Solar & Clean Tech',
    requiredSkills: ['Solar Panel Installation', 'Circuit Troubleshooting', 'Multimeter Testing'],
    preferredSkills: ['Inverter Wiring', 'Hands-on Safety'],
    education: 'Diploma / ITI',
    type: 'Apprenticeship',
    location: 'Bastar, Chhattisgarh (On-site)',
    arrangement: 'On-site',
    stipendOrSalary: '₹12,500 / month + travel stipend',
    duration: '12 Months (NAPS Approved)',
    deadline: '2026-11-15',
    openings: 3,
    referredCandidatesCount: 2,
    description: 'Practical on-site apprenticeship deploying off-grid solar micro-grids across tribal community centers and solar water pumping systems.',
    eligibilityCriteria: [
      'Diploma or ITI certificate in Electrical / Solar Trade',
      'Willingness to travel for field installations',
      'Knowledge of basic electrical safety protocols',
    ],
  },
  {
    id: 'opp-health-assistant',
    title: 'Community Healthcare & Diagnostic Trainee',
    employerId: 'emp-gramin-health',
    employerName: 'Gramin Health Mission Foundation',
    domain: 'Healthcare & Nursing',
    requiredSkills: ['Patient First Aid', 'Anatomy Fundamentals', 'Sanitation Protocols'],
    preferredSkills: ['Compassionate Care', 'Bilingual Translation'],
    education: 'Class 12 (Science - Bio)',
    type: 'Internship',
    location: 'Alwar District & Mobile Clinics',
    arrangement: 'On-site',
    stipendOrSalary: '₹10,000 / month + field insurance',
    duration: '6 Months',
    deadline: '2026-11-20',
    openings: 4,
    referredCandidatesCount: 1,
    description: 'Support registered nurses and community doctors in rural outreach camps, child immunization tracking, and preliminary vitals diagnostics.',
    eligibilityCriteria: [
      'Class 12 completed with Biology or equivalent science background',
      'Fluent in local dialect and Hindi',
      'Empathetic disposition toward rural patients',
    ],
  },
  {
    id: 'opp-web-intern',
    title: 'Junior Web & Digital Portal Intern',
    employerId: 'emp-techrural',
    employerName: 'TechRural Digital Labs',
    domain: 'Computer & Digital Skills',
    requiredSkills: ['Frontend Web Development', 'Responsive Design', 'HTML & CSS'],
    preferredSkills: ['JavaScript Basics', 'Offline Web Storage'],
    education: 'Diploma / ITI / Polytechnic',
    type: 'Internship',
    location: 'Siliguri / Hybrid',
    arrangement: 'Hybrid',
    stipendOrSalary: '₹14,000 / month',
    duration: '6 Months (Pre-Placement Offer Opportunity)',
    deadline: '2026-12-01',
    openings: 2,
    referredCandidatesCount: 1,
    description: 'Work with engineering teams building offline-tolerant digital tools and mobile dashboards for rural farmers and cooperative societies.',
    eligibilityCriteria: [
      'Demonstrated portfolio or project link in web development',
      'Familiarity with CSS Flexbox, Grid, and mobile responsiveness',
    ],
  },
  {
    id: 'opp-agri-scout',
    title: 'Field Agronomy & Soil Testing Assistant',
    employerId: 'emp-krishi-vikas',
    employerName: 'Krishi Vikas Kendra Rural Network',
    domain: 'Agriculture & Rural Tech',
    requiredSkills: ['Soil pH Testing', 'Micro-irrigation Setup'],
    preferredSkills: ['Crop Cycle Planning', 'Bio-fertilizer Preparation'],
    education: 'Class 12 (Agriculture Stream) or Diploma',
    type: 'Training',
    location: 'Sitapur, Uttar Pradesh',
    arrangement: 'On-site',
    stipendOrSalary: '₹9,500 / month + travel allowance',
    duration: '6 Months',
    deadline: '2026-11-10',
    openings: 5,
    referredCandidatesCount: 0,
    description: 'Demonstration and hands-on soil testing across progressive farming clusters. Learn digital soil testing sensors and drip line layout optimizations.',
    eligibilityCriteria: [
      'Basic coursework in agriculture or plant sciences',
      'Physical stamina for field demonstrations',
    ],
  },
]

// Pre-seeded Referrals
const INITIAL_REFERRALS: EmployerReferral[] = [
  {
    id: 'ref-101',
    learnerId: 'stud-manoj',
    learnerName: 'Manoj Patel',
    learnerEducation: 'Diploma / ITI 2nd Year',
    employerId: 'emp-apex-solar',
    employerName: 'Apex Solar Energy Solutions',
    opportunityId: 'opp-solar-trainee',
    opportunityTitle: 'Solar Microgrid Installation Apprentice',
    opportunityDomain: 'Solar & Clean Tech',
    submissionDate: '2026-10-14',
    status: 'Referred — Demo',
    matchRationale: 'Matches 4 of 4 required technical skills; built verified 35-unit solar lamp repair project with safety certification.',
    consentVerified: true,
    consentTimestamp: '2026-10-14T11:20:00',
    sharedSkills: ['Solar Panel Installation', 'Circuit Troubleshooting', 'Multimeter Testing', 'Inverter Wiring'],
    sharedProjects: ['Solar Lantern Repair Project', 'Model Household Wiring Circuit'],
    facilitatorNotes: 'Candidate has exceptional practical acumen. Punctual, disciplined, and speaks local Chhattisgarhi dialect.',
    timeline: [
      { status: 'Draft', date: '2026-10-13', note: 'Referral profile drafted by Facilitator.' },
      { status: 'Pending Consent', date: '2026-10-13', note: 'Consent notification sent to learner.' },
      { status: 'Ready to Refer', date: '2026-10-14', note: 'Student confirmed consent for Apex Solar.' },
      { status: 'Referred — Demo', date: '2026-10-14', note: 'Candidate profile forwarded to Apex Solar HR.' },
    ],
  },
  {
    id: 'ref-102',
    learnerId: 'stud-pooja',
    learnerName: 'Pooja Verma',
    learnerEducation: 'Class 12 (Science - Bio)',
    employerId: 'emp-gramin-health',
    employerName: 'Gramin Health Mission Foundation',
    opportunityId: 'opp-health-assistant',
    opportunityTitle: 'Community Healthcare & Diagnostic Trainee',
    opportunityDomain: 'Healthcare & Nursing',
    submissionDate: '2026-10-16',
    status: 'Under Review',
    matchRationale: 'Matches all 3 primary healthcare skills; completed 40+ hours at local PHC and holds Red Cross First Aid certification.',
    consentVerified: true,
    consentTimestamp: '2026-10-16T09:45:00',
    sharedSkills: ['Patient First Aid', 'Anatomy Fundamentals', 'Sanitation Protocols', 'Compassionate Care'],
    sharedProjects: ['Community Health Awareness Camp', 'First-Aid Kit & Manual in Hindi'],
    facilitatorNotes: 'First-generation nursing aspirant with tremendous empathy and proven patient outreach experience.',
    timeline: [
      { status: 'Draft', date: '2026-10-15', note: 'Referral initiated based on clinical volunteer hours.' },
      { status: 'Ready to Refer', date: '2026-10-16', note: 'Consent verified by phone confirmation.' },
      { status: 'Referred — Demo', date: '2026-10-16', note: 'Forwarded to Gramin Health Mission.' },
      { status: 'Under Review', date: '2026-10-17', note: 'Recruiter opened dossier and scheduled initial telephonic interview.' },
    ],
  },
  {
    id: 'ref-103',
    learnerId: 'stud-kavita',
    learnerName: 'Kavita Roy',
    learnerEducation: 'Polytechnic Diploma (Computer Science)',
    employerId: 'emp-techrural',
    employerName: 'TechRural Digital Labs',
    opportunityId: 'opp-web-intern',
    opportunityTitle: 'Junior Web & Digital Portal Intern',
    opportunityDomain: 'Computer & Digital Skills',
    submissionDate: '2026-10-18',
    status: 'Pending Consent',
    matchRationale: 'Demonstrated live code repo of offline-first rural mandi portal; matches HTML/CSS and mobile accessibility criteria.',
    consentVerified: false,
    sharedSkills: ['Frontend Web Development', 'Responsive Design', 'Technical Documentation'],
    sharedProjects: ['Rural Panchayat Portal Prototype', 'Smartphone Literacy Handbook'],
    facilitatorNotes: 'Strong self-starter. Prepared to intern on hybrid basis from Siliguri.',
    timeline: [
      { status: 'Draft', date: '2026-10-18', note: 'Candidate profile compiled from Talent Pool.' },
      { status: 'Pending Consent', date: '2026-10-18', note: 'Simulated consent verification sent to student.' },
    ],
  },
]

// Pre-seeded Follow-up Reminders
const INITIAL_FOLLOW_UPS: FollowUpReminder[] = [
  {
    id: 'fu-1',
    learnerId: 'stud-rahul',
    learnerName: 'Rahul Meena',
    dueDate: '2026-10-19',
    type: 'Phone Check-in',
    priority: 'High',
    notes: 'Discuss chemistry diagnostic review session and evaluate confidence on inorganic terminology.',
    completed: false,
  },
  {
    id: 'fu-2',
    learnerId: 'stud-suresh',
    learnerName: 'Suresh Yadav',
    dueDate: '2026-10-21',
    type: 'Resume Review',
    priority: 'Medium',
    notes: 'Review updated Krishi Vikas Kendra field assistant application form and document vermicompost project evidence.',
    completed: false,
  },
  {
    id: 'fu-3',
    learnerId: 'stud-pooja',
    learnerName: 'Pooja Verma',
    dueDate: '2026-10-22',
    type: 'Application Assistance',
    priority: 'Medium',
    notes: 'Check Gramin Health Mission telephonic interview preparation and verify entrance test revision schedule.',
    completed: false,
  },
  {
    id: 'fu-4',
    learnerId: 'stud-manoj',
    learnerName: 'Manoj Patel',
    dueDate: '2026-10-15',
    type: 'Skill Evaluation',
    priority: 'Low',
    notes: 'Verified NAPS apprenticeship contract terms and solar field equipment kit handover.',
    completed: true,
    completedDate: '2026-10-15',
    outcomeNote: 'Manoj accepted the 12-month apprenticeship terms. Orientation scheduled for Nov 1.',
  },
]

export const DEFAULT_FACILITATOR_PROFILE: FacilitatorProfile = {
  id: 'facil-sunita',
  name: 'Sunita Sharma',
  email: 'sunita.sharma@pragati.org',
  designation: 'Lead Career & Vocational Facilitator',
  institution: 'Gramin Pragati Foundation & State Skill Mission',
  location: 'Alwar & Jaipur, Rajasthan',
  languages: ['Hindi', 'English', 'Rajasthani'],
  sectors: [
    'Healthcare & Nursing',
    'Solar & Clean Tech',
    'Vocational Trades & ITI',
    'Computer & Digital Skills',
    'Agriculture & Rural Tech',
  ],
  bio: 'Dedicated to bridging rural students and vocational learners with verified higher education pathways, NAPS apprenticeships, and inclusive employer opportunities.',
  joinedDate: 'July 2025',
  activeMenteesCount: 6,
}

export function getInitialFacilitatorProfile(user?: Partial<User>): FacilitatorProfile {
  const d = user?.details || {}
  const rawSectors = d.sectors
    ? (Array.isArray(d.sectors) ? d.sectors : d.sectors.split(',').map((s: string) => s.trim()))
    : DEFAULT_FACILITATOR_PROFILE.sectors

  // If user entered a custom name explicitly during signup, respect it, otherwise default to Sunita Sharma
  const isAutoSplitName = Boolean(user?.email && user?.name === user?.email.split('@')[0])
  const resolvedName = user?.name && !isAutoSplitName ? user.name : DEFAULT_FACILITATOR_PROFILE.name

  return {
    id: user?.id || DEFAULT_FACILITATOR_PROFILE.id,
    name: resolvedName,
    email: user?.email || DEFAULT_FACILITATOR_PROFILE.email,
    designation: d.designation || DEFAULT_FACILITATOR_PROFILE.designation,
    institution: d.institution || DEFAULT_FACILITATOR_PROFILE.institution,
    location: d.location || DEFAULT_FACILITATOR_PROFILE.location,
    languages: d.languages
      ? (typeof d.languages === 'string' ? d.languages.split(',').map((l: string) => l.trim()) : d.languages)
      : DEFAULT_FACILITATOR_PROFILE.languages,
    sectors: rawSectors,
    bio: d.bio || DEFAULT_FACILITATOR_PROFILE.bio,
    joinedDate: DEFAULT_FACILITATOR_PROFILE.joinedDate,
    activeMenteesCount: DEFAULT_FACILITATOR_PROFILE.activeMenteesCount,
  }
}

export function evaluateLearnerMatch(
  learner: AllocatedLearner,
  facilitator: FacilitatorProfile
): MatchEvaluation {
  const facilitatorSectors = new Set(facilitator.sectors.map(s => s.toLowerCase()))

  // Check sector/stream matching
  const matchedSectors: string[] = []
  if (facilitatorSectors.has(learner.stream.toLowerCase())) {
    matchedSectors.push(learner.stream)
  }
  for (const subj of learner.subjects) {
    for (const sec of facilitator.sectors) {
      if (subj.toLowerCase().includes(sec.toLowerCase()) || sec.toLowerCase().includes(subj.toLowerCase())) {
        matchedSectors.push(sec)
      }
    }
  }

  // Check skill keywords
  const matchedSkills: string[] = []
  for (const sk of learner.skills) {
    for (const sec of facilitator.sectors) {
      if (sec.toLowerCase().includes(sk.toLowerCase()) || sk.toLowerCase().includes(sec.toLowerCase().slice(0, 5))) {
        matchedSkills.push(sk)
      }
    }
  }

  const uniqueSectors = Array.from(new Set(matchedSectors))
  const uniqueSkills = Array.from(new Set(matchedSkills))

  let score = 55
  if (uniqueSectors.length > 0) score += 25
  if (uniqueSkills.length > 0) score += 15
  if (learner.overallProgress >= 70) score += 5
  score = Math.min(score, 96)

  let explanation = ''
  if (uniqueSectors.length > 0) {
    explanation = `Matched because the learner is pursuing ${learner.stream} and the facilitator supports ${uniqueSectors[0]} career guidance.`
  } else if (uniqueSkills.length > 0) {
    explanation = `Matched on foundational competencies in ${uniqueSkills.slice(0, 2).join(' and ')}.`
  } else {
    explanation = `General academic & vocational enablement match based on location and educational level.`
  }

  return {
    score,
    isRecommended: score >= 75,
    explanation,
    matchedSkills: uniqueSkills,
    matchedSectors: uniqueSectors,
  }
}

export function evaluateOpportunityMatch(
  learner: AllocatedLearner,
  opportunity: FacilitatorOpportunity
) {
  const learnerSkills = new Set(learner.skills.map(s => s.toLowerCase()))
  const matchedRequired = opportunity.requiredSkills.filter(req =>
    Array.from(learnerSkills).some(ls => ls.includes(req.toLowerCase()) || req.toLowerCase().includes(ls))
  )
  const matchedPreferred = opportunity.preferredSkills.filter(pref =>
    Array.from(learnerSkills).some(ls => ls.includes(pref.toLowerCase()) || pref.toLowerCase().includes(ls))
  )

  const reqScore = opportunity.requiredSkills.length
    ? (matchedRequired.length / opportunity.requiredSkills.length) * 70
    : 0
  const prefScore = opportunity.preferredSkills.length
    ? (matchedPreferred.length / opportunity.preferredSkills.length) * 20
    : 0
  const projScore = Math.min(learner.demonstratedProjects.length, 2) * 5

  const score = Math.round(reqScore + prefScore + projScore)

  const parts: string[] = []
  parts.push(`Demonstrates ${matchedRequired.length} of ${opportunity.requiredSkills.length} required skills`)
  if (matchedPreferred.length) {
    parts.push(`${matchedPreferred.length} preferred`)
  }
  if (learner.demonstratedProjects.length) {
    parts.push(`${learner.demonstratedProjects.length} practical project${learner.demonstratedProjects.length > 1 ? 's' : ''}`)
  }

  return {
    score,
    isEligible: score >= 60,
    explanation: parts.join(' · '),
    matchedRequired,
    matchedPreferred,
  }
}

class FacilitatorStoreService {
  private state: FacilitatorState

  constructor() {
    this.state = this.loadState()
  }

  private loadState(): FacilitatorState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as FacilitatorState
        if (parsed && Array.isArray(parsed.learners) && parsed.learners.length >= 8) {
          const currentName = parsed.profile?.name
          if (
            !currentName ||
            currentName.includes('@') ||
            currentName === 'Archi Aggarwal' ||
            currentName === 'Facilitator'
          ) {
            parsed.profile = {
              ...DEFAULT_FACILITATOR_PROFILE,
              ...(parsed.profile || {}),
              name: DEFAULT_FACILITATOR_PROFILE.name,
              institution: parsed.profile?.institution || DEFAULT_FACILITATOR_PROFILE.institution,
              designation: parsed.profile?.designation || DEFAULT_FACILITATOR_PROFILE.designation,
            }
          }
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to load facilitator state from localStorage', e)
    }

    return {
      profile: DEFAULT_FACILITATOR_PROFILE,
      learners: INITIAL_LEARNERS,
      referrals: INITIAL_REFERRALS,
      opportunities: INITIAL_OPPORTUNITIES,
      followUps: INITIAL_FOLLOW_UPS,
      updates: ['Welcome to the MyRaah Facilitator Portal prototype.'],
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
      window.dispatchEvent(new CustomEvent('myraah-facilitator-update'))
    } catch (e) {
      console.warn('Failed to persist facilitator state to localStorage', e)
    }
  }

  public getState(): FacilitatorState {
    return this.state
  }

  public initForUser(user: User) {
    if (user.role === 'facilitator') {
      const p = getInitialFacilitatorProfile(user)
      this.state.profile = p

      // Always guarantee that all 8 learners, 4 opportunities, referrals, and followups are available
      if (!this.state.learners || this.state.learners.length === 0) {
        this.state.learners = INITIAL_LEARNERS
      } else {
        const existingIds = new Set(this.state.learners.map(l => l.id))
        const missing = INITIAL_LEARNERS.filter(l => !existingIds.has(l.id))
        if (missing.length > 0) {
          this.state.learners = [...this.state.learners, ...missing]
        }
      }

      if (!this.state.opportunities || this.state.opportunities.length === 0) {
        this.state.opportunities = INITIAL_OPPORTUNITIES
      } else {
        const existingOppIds = new Set(this.state.opportunities.map(o => o.id))
        const missingOpps = INITIAL_OPPORTUNITIES.filter(o => !existingOppIds.has(o.id))
        if (missingOpps.length > 0) {
          this.state.opportunities = [...this.state.opportunities, ...missingOpps]
        }
      }

      if (!this.state.referrals || this.state.referrals.length === 0) {
        this.state.referrals = INITIAL_REFERRALS
      }

      if (!this.state.followUps || this.state.followUps.length === 0) {
        this.state.followUps = INITIAL_FOLLOW_UPS
      }

      this.saveState()
    }
  }

  public allocateLearners(
    learnerIds: string[],
    facilitatorId: string,
    facilitatorName: string,
    reason: string,
    track: SupportTrack
  ) {
    const today = new Date().toISOString().slice(0, 10)
    this.state.learners = this.state.learners.map(l => {
      if (learnerIds.includes(l.id)) {
        return {
          ...l,
          assignmentStatus: 'assigned_to_me',
          assignedFacilitatorId: facilitatorId,
          assignedFacilitatorName: facilitatorName,
          assignedDate: today,
          supportTrack: track,
          assignmentReason: reason,
        }
      }
      return l
    })

    const note = `Allocated ${learnerIds.length} learner${learnerIds.length > 1 ? 's' : ''} to ${facilitatorName} under ${track}.`
    this.state.updates = [note, ...this.state.updates].slice(0, 10)
    this.saveState()
  }

  public unassignLearner(learnerId: string) {
    this.state.learners = this.state.learners.map(l => {
      if (l.id === learnerId) {
        return {
          ...l,
          assignmentStatus: 'unassigned',
          assignedFacilitatorId: undefined,
          assignedFacilitatorName: undefined,
          assignedDate: undefined,
          supportTrack: undefined,
          assignmentReason: undefined,
        }
      }
      return l
    })
    this.state.updates = [`Learner ${learnerId} unassigned from facilitator queue.`, ...this.state.updates].slice(0, 10)
    this.saveState()
  }

  public toggleTalentShortlist(learnerId: string, reason?: string) {
    this.state.learners = this.state.learners.map(l => {
      if (l.id === learnerId) {
        const next = !l.isTalentShortlisted
        return {
          ...l,
          isTalentShortlisted: next,
          shortlistReason: next ? (reason || 'Identified based on practical project demonstrations and core skill mastery.') : undefined,
        }
      }
      return l
    })
    this.saveState()
  }

  public createEmployerReferral(
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ): EmployerReferral {
    const today = new Date().toISOString().slice(0, 10)
    const newRef: EmployerReferral = {
      ...referralData,
      id: `ref-${uid()}`,
      submissionDate: today,
      timeline: [
        { status: 'Draft', date: today, note: 'Candidate profile prepared by Facilitator.' },
        {
          status: referralData.consentVerified ? 'Referred — Demo' : 'Pending Consent',
          date: today,
          note: referralData.consentVerified
            ? `Student consent verified on ${today}. Profile shared with ${referralData.employerName} (Demo).`
            : 'Pending student consent verification before profile transmission.',
        },
      ],
    }

    this.state.referrals = [newRef, ...this.state.referrals]
    // increment referredCandidatesCount on opportunity
    this.state.opportunities = this.state.opportunities.map(opp => {
      if (opp.id === referralData.opportunityId) {
        return { ...opp, referredCandidatesCount: opp.referredCandidatesCount + 1 }
      }
      return opp
    })

    const note = `Candidate ${referralData.learnerName} referred to ${referralData.employerName} for ${referralData.opportunityTitle}.`
    this.state.updates = [note, ...this.state.updates].slice(0, 10)
    this.saveState()
    return newRef
  }

  public updateReferralStatus(referralId: string, status: ReferralStatus, noteText?: string) {
    const today = new Date().toISOString().slice(0, 10)
    this.state.referrals = this.state.referrals.map(r => {
      if (r.id === referralId) {
        const timelineItem = {
          status,
          date: today,
          note: noteText || `Status advanced to ${status} by facilitator.`,
        }
        return {
          ...r,
          status,
          timeline: [...r.timeline, timelineItem],
        }
      }
      return r
    })
    this.state.updates = [`Referral ${referralId} status changed to ${status}.`, ...this.state.updates].slice(0, 10)
    this.saveState()
  }

  public addFollowUp(reminder: Omit<FollowUpReminder, 'id' | 'completed'>): FollowUpReminder {
    const newReminder: FollowUpReminder = {
      ...reminder,
      id: `fu-${uid()}`,
      completed: false,
    }
    this.state.followUps = [newReminder, ...this.state.followUps]
    this.state.updates = [`Scheduled follow-up for ${reminder.learnerName} on ${reminder.dueDate}.`, ...this.state.updates].slice(0, 10)
    this.saveState()
    return newReminder
  }

  public completeFollowUp(reminderId: string, outcomeNote?: string) {
    const today = new Date().toISOString().slice(0, 10)
    this.state.followUps = this.state.followUps.map(fu => {
      if (fu.id === reminderId) {
        return {
          ...fu,
          completed: true,
          completedDate: today,
          outcomeNote: outcomeNote || 'Follow-up completed successfully.',
        }
      }
      return fu
    })
    this.saveState()
  }

  public updateLearnerSupportStatus(
    learnerId: string,
    status: 'on_track' | 'needs_support' | 'critical',
    note?: string
  ) {
    this.state.learners = this.state.learners.map(l => {
      if (l.id === learnerId) {
        return {
          ...l,
          currentStatus: status,
          recentActivity: note ? `Facilitator note: ${note}` : l.recentActivity,
        }
      }
      return l
    })
    this.saveState()
  }

  public updateProfile(profileUpdates: Partial<FacilitatorProfile>) {
    this.state.profile = {
      ...this.state.profile,
      ...profileUpdates,
    }
    this.saveState()
  }

  public resetDemoData(user: User) {
    this.state = {
      profile: getInitialFacilitatorProfile(user),
      learners: INITIAL_LEARNERS,
      referrals: INITIAL_REFERRALS,
      opportunities: INITIAL_OPPORTUNITIES,
      followUps: INITIAL_FOLLOW_UPS,
      updates: ['Demo data reloaded successfully.'],
    }
    this.saveState()
  }
}

export const facilitatorStore = new FacilitatorStoreService()

export function useFacilitatorStore(user?: User) {
  const [state, setState] = useState<FacilitatorState>(() => facilitatorStore.getState())

  useEffect(() => {
    if (user && user.role === 'facilitator') {
      facilitatorStore.initForUser(user)
    }

    const handler = () => {
      setState({ ...facilitatorStore.getState() })
    }
    window.addEventListener('myraah-facilitator-update', handler)
    return () => window.removeEventListener('myraah-facilitator-update', handler)
  }, [user])

  return {
    state,
    allocateLearners: facilitatorStore.allocateLearners.bind(facilitatorStore),
    unassignLearner: facilitatorStore.unassignLearner.bind(facilitatorStore),
    toggleTalentShortlist: facilitatorStore.toggleTalentShortlist.bind(facilitatorStore),
    createEmployerReferral: facilitatorStore.createEmployerReferral.bind(facilitatorStore),
    updateReferralStatus: facilitatorStore.updateReferralStatus.bind(facilitatorStore),
    addFollowUp: facilitatorStore.addFollowUp.bind(facilitatorStore),
    completeFollowUp: facilitatorStore.completeFollowUp.bind(facilitatorStore),
    updateLearnerSupportStatus: facilitatorStore.updateLearnerSupportStatus.bind(facilitatorStore),
    updateProfile: facilitatorStore.updateProfile.bind(facilitatorStore),
    resetDemoData: facilitatorStore.resetDemoData.bind(facilitatorStore),
  }
}
