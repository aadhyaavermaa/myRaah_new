import type {
  DoubtFlagCategory,
  DoubtRecord,
  ExpertiseCategory,
  LessonFeedback,
  LessonStatus,
  MentoringSession,
  MentorProfile,
  ReviewCategory,
  ReviewReport,
  SampleLesson,
  StudentReview,
  SubtitleCue,
  TeachingMode,
  TeachingResource,
  TeachingSubject,
  User,
} from '../types'
import { mediaStorage } from './mediaStorage'

const STORAGE_KEYS = {
  MENTORS: 'myraah_mentors_v1',
  SUBJECTS: 'myraah_subjects_v1',
  RESOURCES: 'myraah_resources_v1',
  REVIEWS: 'myraah_reviews_v1',
  DOUBTS: 'myraah_doubts_v1',
  SESSIONS: 'myraah_sessions_v1',
  REPORTS: 'myraah_reports_v1',
  SAMPLE_LESSONS: 'myraah_sample_lessons_v1',
  LESSON_FEEDBACK: 'myraah_lesson_feedback_v1',
  USER_LESSON_VOTES: 'myraah_user_lesson_votes_v1',
}

// Initial demo mentors
const DEFAULT_MENTORS: MentorProfile[] = [
  {
    id: 'm-asha',
    email: 'asha.mehta@myraah.demo',
    name: 'Asha Mehta',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    headline: 'Community Health Educator & Youth Counselor',
    bio: 'Dedicated to helping rural students find meaningful pathways in healthcare, nursing, and community development. With 7 years of grassroots field experience, I help students understand entrance exams, government scholarships, and practical skill development.',
    education: 'B.Sc. Nursing, AIIMS Jodhpur · PG Diploma in Public Health',
    qualifications: [
      'Certified Community Health Educator (Govt. of India)',
      'State Rural Health Mission Counselor',
      'Primary Healthcare & First-Aid Master Trainer',
    ],
    experienceYears: 7,
    teachingModes: ['voice', 'text', 'video', 'online'],
    languages: ['Hindi', 'Rajasthani', 'English'],
    location: 'Alwar, Rajasthan',
    verified: true,
    memberSince: 'August 2024',
    introVideo: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      captionText: 'Introduction to Healthcare Careers & Nursing Scholarships with Asha Mehta (Hindi & English)',
      duration: '4:15',
    },
    writtenIntro: 'Namaste students! I come from a small village near Alwar. I understand how challenging it can be to find reliable guidance on ANM/GNM nursing, paramedical diplomas, and health department opportunities. I offer step-by-step doubt clearing in Hindi and Rajasthani through audio voice notes, phone guidance, and text.',
    availabilityDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availabilityHours: '4:00 PM – 7:30 PM IST',
    acceptingMentees: true,
  },
  {
    id: 'm-ravi',
    email: 'ravi.kumar@myraah.demo',
    name: 'Ravi Kumar',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    headline: 'Agriculture Field Specialist & Rural Entrepreneurship Mentor',
    bio: 'Helping rural youth leverage modern agricultural practices, agro-tech careers, and NABARD rural enterprise loans. Over 9 years training smallholder farmers and agriculture diploma graduates across Tamil Nadu and Central India.',
    education: 'B.Sc. Agriculture, Tamil Nadu Agricultural University (TNAU)',
    qualifications: [
      'Organic Farming & Agronomy Consultant',
      'NABARD Micro-Enterprise Trainer',
      'Horticulture Extension Advisor',
    ],
    experienceYears: 9,
    teachingModes: ['voice', 'text', 'in-person', 'online'],
    languages: ['Tamil', 'Hindi', 'English'],
    location: 'Coimbatore, Tamil Nadu & Rural Cluster',
    verified: true,
    memberSince: 'October 2024',
    introVideo: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
      captionText: 'Agricultural Careers & Govt Farmer Schemes with Ravi Kumar (Tamil & Hindi)',
      duration: '5:20',
    },
    writtenIntro: 'Vanakkam! Agriculture is full of high-growth modern opportunities—from soil tech to organic produce exports and cooperative enterprises. Reach out with your doubts on Agri-diplomas, ICAR exams, and small agribusiness ideas.',
    availabilityDays: ['Tuesday', 'Thursday', 'Saturday'],
    availabilityHours: '5:00 PM – 8:00 PM IST',
    acceptingMentees: true,
  },
  {
    id: 'm-neha',
    email: 'neha.das@myraah.demo',
    name: 'Neha Das',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    headline: 'Visual Communication Designer & Digital Literacy Mentor',
    bio: 'Passionate about introducing digital skills, graphic design, and freelance creative work to students from remote communities. Specializing in mobile-first design workflows for smartphones and budget laptops.',
    education: 'B.Des in Visual Communication, Govt. College of Art & Craft, Kolkata',
    qualifications: [
      'Adobe Certified Design Educator',
      'Rural Artisan Digital Branding Mentor',
    ],
    experienceYears: 5,
    teachingModes: ['video', 'text', 'online'],
    languages: ['Bengali', 'Hindi', 'English'],
    location: 'Kolkata, West Bengal',
    verified: true,
    memberSince: 'January 2025',
    writtenIntro: 'Hello! You do not need an expensive computer to start a career in digital design. With just a smartphone, you can learn visual communication, typography, and create logos for local shops. Let me guide your portfolio.',
    availabilityDays: ['Monday', 'Wednesday', 'Sunday'],
    availabilityHours: '3:00 PM – 6:00 PM IST',
    acceptingMentees: true,
  },
]

// Default subjects
const DEFAULT_SUBJECTS: TeachingSubject[] = [
  {
    id: 'sub-1',
    mentorId: 'm-asha',
    category: 'Career guidance',
    title: 'Healthcare & Nursing Pathways (ANM/GNM/B.Sc)',
    level: 'Class 10, 12 & Graduates',
    description: 'Detailed roadmap for government vs private nursing colleges, entrance cutoffs, and bond conditions.',
  },
  {
    id: 'sub-2',
    mentorId: 'm-asha',
    category: 'Scholarships and schemes',
    title: 'Post-Matric Health & National Scholarship Portal (NSP)',
    level: 'All eligible students',
    description: 'Assistance with documentation, income certificates, and scholarship renewal for medical courses.',
  },
  {
    id: 'sub-3',
    mentorId: 'm-asha',
    category: 'Vocational education & skills',
    title: 'Community Health Worker & Emergency First-Aid',
    level: 'Youth & Aspiring ASHA workers',
    description: 'Practical foundational training on primary health metrics, sanitation, and diagnostic equipment basics.',
  },
  {
    id: 'sub-4',
    mentorId: 'm-asha',
    category: 'Interview preparation & communication',
    title: 'Hospital Staff & Clinic Interview Preparation',
    level: 'Job seekers',
    description: 'Effective patient communication, professional ethics, and mock interviews for hospital support roles.',
  },
  {
    id: 'sub-5',
    mentorId: 'm-ravi',
    category: 'Agriculture & local entrepreneurship',
    title: 'Modern Agribusiness & Organic Farming Techniques',
    level: 'Rural youth & farmers',
    description: 'Low-cost organic methods, vermicomposting setup, and government subsidy application steps.',
  },
  {
    id: 'sub-6',
    mentorId: 'm-ravi',
    category: 'Scholarships and schemes',
    title: 'NABARD Rural Loans & Kisan Credit Card (KCC)',
    level: 'Aspiring entrepreneurs',
    description: 'How to structure a simple business plan for agri-clinics and secure NABARD subsidized loans.',
  },
  {
    id: 'sub-7',
    mentorId: 'm-ravi',
    category: 'Competitive examinations',
    title: 'ICAR AIEEA & State Agri Entrance Preparation',
    level: 'Class 12 Science students',
    description: 'Syllabus breakdown, high-scoring biology/agri sections, and previous year question strategies.',
  },
  {
    id: 'sub-8',
    mentorId: 'm-neha',
    category: 'Computer skills and coding',
    title: 'Mobile Graphic Design & Canva for Local Business',
    level: 'Beginners (Class 8+)',
    description: 'Learn to design festival flyers, product posters, and social media banners on free mobile apps.',
  },
  {
    id: 'sub-9',
    mentorId: 'm-neha',
    category: 'Internships and employment',
    title: 'Digital Portfolio Creation on Smartphone',
    level: 'Creative students',
    description: 'How to showcase your drawings, photos, and designs to get remote design work and internships.',
  },
]

// Default teaching resources
const DEFAULT_RESOURCES: TeachingResource[] = [
  {
    id: 'res-1',
    mentorId: 'm-asha',
    title: 'ANM vs GNM vs B.Sc Nursing: Which Path Fits You?',
    topic: 'Nursing career roadmaps and fee structures in government colleges',
    category: 'Career guidance',
    language: 'Hindi',
    contentType: 'video',
    contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '8:45',
    date: '12 Sep 2025',
    summary: 'A clear Hindi breakdown of eligibility, course duration, stipend during internship, and government hospital recruitment exams.',
    lowBandwidthAvailable: true,
    transcript: 'नमस्ते विद्यार्थियों। इस वीडियो में हम समझेंगे कि ANM (Auxiliary Nurse Midwife), GNM और B.Sc Nursing में क्या फर्क है। 1) ANM सिर्फ छात्राओं के लिए 2 साल का डिप्लोमा है जिसे 12वीं आर्ट्स, कॉमर्स या साइंस वाले कर सकते हैं। 2) GNM 3 साल का जनरल नर्सिंग कोर्स है जिसमें साइंस (PCB/English) आवश्यक है। 3) B.Sc Nursing 4 साल की डिग्री है जिसके लिए NEET या स्टेट नर्सिंग एंट्रेंस अनिवार्य है...',
    textContent: 'Full Guide: 1. Eligibility Check. 2. College Selection. 3. Fee structure in government training centers (under Rs. 5000/yr). 4. Post-course government posting guidelines.',
  },
  {
    id: 'res-2',
    mentorId: 'm-asha',
    title: 'National Scholarship Portal (NSP) Application: Step-by-Step Audio Guide',
    topic: 'How rural students can apply for post-matric healthcare scholarships',
    category: 'Scholarships and schemes',
    language: 'Hindi',
    contentType: 'audio',
    duration: '11:20',
    date: '28 Sep 2025',
    summary: 'Listen to this 11-minute audio explanation explaining required certificates, Aadhaar seeding with bank account, and avoiding application rejection.',
    lowBandwidthAvailable: true,
    transcript: 'हेलो बच्चों। राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) पर फॉर्म भरते समय सबसे बड़ी गलती बैंक अकाउंट में आधार सीडिंग (Aadhaar Seeding) न होना है। ध्यान रखें, सिर्फ आधार लिंक होना काफी नहीं है, NPCI मैपर पर बैंक खाता सक्रिय होना चाहिए। तहसीलदार से जारी आय प्रमाण पत्र (Income Certificate) वैध होना चाहिए...',
    textContent: 'Checklist for NSP: 1. Aadhaar-seeded Bank Account (NPCI active). 2. Income Certificate less than 6 months old. 3. Class 10/12 Marksheet. 4. College Bonafide Certificate.',
  },
  {
    id: 'res-3',
    mentorId: 'm-asha',
    title: 'Common Doubts Solved: What if My School Doesn’t Have Science (PCB)?',
    topic: 'Alternative healthcare pathways without 12th Science',
    category: 'School subjects and academic doubts',
    language: 'Hindi / Rajasthani',
    contentType: 'notes',
    date: '05 Oct 2025',
    summary: 'Illustrated step-by-step notes on Allied Healthcare Diplomas open to Arts and Commerce students, such as ANM, Hospital Administration, and Medical Transcription.',
    lowBandwidthAvailable: true,
    textContent: 'अक्सर ग्रामीण क्षेत्रों के सरकारी स्कूलों में 11वीं-12वीं में साइंस संकाय (Biology) नहीं होता। ऐसे विद्यार्थी क्या करें? \n\n1. ANM (Auxiliary Nurse Midwifery): किसी भी स्ट्रीम (कला/वाणिज्य) के साथ 12वीं पास छात्राएं प्रवेश ले सकती हैं।\n2. DMLT (कुछ राज्यों में प्राइवेट काउंसिल): वोकेशनल 12वीं के आधार पर।\n3. हॉस्पिटल रिसेप्शनिस्ट एवं पेशेंट केयर एसोसिएट (NSDC / PMKVY 3-6 महीने का फ्री कोर्स)।\n4. मेडिकल रिकॉर्ड टेक्नीशियन (1 वर्ष का सर्टिफिकेट)।',
  },
  {
    id: 'res-4',
    mentorId: 'm-ravi',
    title: 'Agri-Clinic & Agri-Business Centers (AC&ABC) Govt Scheme',
    topic: 'How to get up to 36% subsidy on rural agricultural startup loans',
    category: 'Agriculture & local entrepreneurship',
    language: 'Hindi',
    contentType: 'audio',
    duration: '9:15',
    date: '14 Oct 2025',
    summary: 'A simple audio walkthrough on MANAGE & NABARD 45-day free training and collateral-free loans for agriculture graduates and diploma holders.',
    lowBandwidthAvailable: true,
    transcript: 'किसान भाइयों और युवा साथियों, अगर आपके पास 10वीं के बाद एग्रीकल्चर डिप्लोमा या B.Sc Agriculture है, तो सरकार AC&ABC स्कीम के तहत 20 लाख रुपये तक के प्रोजेक्ट पर 36% तक की सब्सिडी देती है...',
  },
  {
    id: 'res-5',
    mentorId: 'm-neha',
    title: 'Design Festival Posters on Free Mobile Phone App (Canva Tutorial)',
    topic: 'Creating banners for local shops and festivals without a computer',
    category: 'Computer skills and coding',
    language: 'Hindi & Bengali',
    contentType: 'video',
    contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '7:30',
    date: '19 Oct 2025',
    summary: 'Practical step-by-step tutorial showing how to use Canva on Android to earn Rs. 300-500 designing marketing banners for local businesses.',
    lowBandwidthAvailable: true,
    textContent: 'Steps covered: 1. Downloading Canva Android app. 2. Selecting 1080x1080 Instagram/WhatsApp poster size. 3. Adding Hindi fonts (Noto Sans Devanagari). 4. Exporting in high-resolution PNG for printing.',
  },
]

// Default student reviews (verified interactions, no fake reviews for new mentors)
const DEFAULT_REVIEWS: StudentReview[] = [
  {
    id: 'rev-1',
    mentorId: 'm-asha',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    rating: 5,
    feedback: 'Asha ma’am explained the GNM government college entrance process so simply in Hindi. She personally checked my caste certificate and scholarship forms. Because of her guidance, I secured admission in Kota Govt Nursing College!',
    category: 'Clarity',
    createdAt: '2025-10-02',
    verifiedInteraction: true,
  },
  {
    id: 'rev-2',
    mentorId: 'm-asha',
    studentId: 'stud-vikram',
    studentName: 'Vikram Singh Rathore',
    rating: 5,
    feedback: 'Very patient mentor. My phone network was weak in the village, so she sent me voice messages and text notes instead of forcing a video call. Highly recommended for any rural student.',
    category: 'Patience',
    createdAt: '2025-09-18',
    verifiedInteraction: true,
  },
  {
    id: 'rev-3',
    mentorId: 'm-asha',
    studentId: 'stud-anita',
    studentName: 'Anita Meena',
    rating: 5,
    feedback: 'She cleared all my doubts regarding the post-matric scholarship application deadline. She even warned me about fraudulent agents asking for money for college forms.',
    category: 'Helpfulness',
    createdAt: '2025-08-30',
    verifiedInteraction: true,
  },
  {
    id: 'rev-4',
    mentorId: 'm-ravi',
    studentId: 'stud-suresh',
    studentName: 'Suresh Gowda',
    rating: 5,
    feedback: 'Ravi sir helped me understand the ICAR counselling portal when our local cyber cafe operator made a mistake. Very practical and ground-level advice.',
    category: 'Communication',
    createdAt: '2025-10-10',
    verifiedInteraction: true,
  },
  {
    id: 'rev-5',
    mentorId: 'm-neha',
    studentId: 'stud-rohit',
    studentName: 'Rohit Mondal',
    rating: 5,
    feedback: 'I had no computer, only a Redmi phone. Neha didi showed me how to design product flyers for our local saree shop. Now I make pocket money every month!',
    category: 'Clarity',
    createdAt: '2025-10-15',
    verifiedInteraction: true,
  },
]

// Default student doubts (Covering pending, answered, and under-review states)
const DEFAULT_DOUBTS: DoubtRecord[] = [
  {
    id: 'dbt-1',
    mentorId: 'm-asha',
    studentId: 'stud-rahul',
    studentName: 'Rahul Sharma',
    studentGrade: 'Class 10 · Alwar Govt Boys School',
    subject: 'Biology & Life Processes',
    topic: 'Excretory System: Nephron Filtration & Bowman’s Capsule',
    category: 'School subjects and academic doubts',
    question: 'How does the human nephron filter blood in the kidney? What is the main difference between glomerular filtration and selective tubular reabsorption for glucose and salts?',
    contextDetails: 'From NCERT Class 10 Science, Chapter 6 Life Processes (Excretion). Preparing for state board model exams; diagram attached from textbook.',
    attachmentUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    attachmentName: 'ncert_nephron_structure_fig6.14.png',
    attachmentType: 'image',
    status: 'pending',
    createdAt: '2025-10-17',
  },
  {
    id: 'dbt-2',
    mentorId: 'm-asha',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    studentGrade: 'Class 10 · Govt Girls Senior Secondary',
    subject: 'Biology & Reproductive Health',
    topic: 'Human Embryonic Development: Placenta Function & Nutrition',
    category: 'School subjects and academic doubts',
    question: 'In our Class 10 NCERT Chapter on Reproduction, how does the disc-shaped placenta exchange glucose and oxygen from the maternal blood to the developing embryo without direct blood mixing?',
    contextDetails: 'From NCERT Class 10 Chapter 8 (How do Organisms Reproduce - Sexual Reproduction in Humans). Strictly educational inquiry for board preparation.',
    attachmentUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80',
    attachmentName: 'ncert_embryo_placenta_textbook_query.png',
    attachmentType: 'image',
    status: 'pending',
    createdAt: '2025-10-18',
  },
  {
    id: 'dbt-3',
    mentorId: 'm-asha',
    studentId: 'stud-anita',
    studentName: 'Anita Meena',
    studentGrade: 'Class 12 Arts · Dausa District',
    subject: 'Healthcare & Nursing Admissions',
    topic: 'ANM Nursing Eligibility & Rajswasthya Portal Guidelines',
    category: 'Career guidance',
    question: 'Can I apply for government ANM nursing training if I completed Class 12 in Arts stream with 58% marks, and what are the document requirements?',
    contextDetails: 'First-generation learner from village. Cyber cafe operator said science is required, seeking clarification.',
    status: 'answered',
    answer: 'Yes Anita! The Indian Nursing Council (INC) explicitly permits 10+2 candidates from Arts, Commerce, or Science streams with a minimum of 40-45% marks for ANM nursing training. In Rajasthan, applications open every July on the official Rajswasthya portal. No science background is required. Prepare your Class 10 and 12 marksheets, domicile certificate, and caste certificate in advance.',
    answerMediaType: 'audio',
    answerMediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    createdAt: '2025-09-10',
    resolvedAt: '2025-09-11',
  },
  {
    id: 'dbt-4',
    mentorId: 'm-asha',
    studentId: 'stud-manoj',
    studentName: 'Manoj Kumar',
    studentGrade: 'Class 12 · Kotputli',
    subject: 'Scholarships & DBT Schemes',
    topic: 'National Scholarship Portal (NSP) NPCI Aadhaar Seeding',
    category: 'Scholarships and schemes',
    question: 'What should I do if my bank account says NPCI mapping failed on the NSP portal during pre-matric scholarship verification?',
    contextDetails: 'Scholarship status showing pending bank validation. Attached bank passbook error slip.',
    status: 'answered',
    answer: 'Manoj, visit your bank branch immediately with your original Aadhaar card and passbook. Request the branch manager to submit the "Aadhaar Mandate & NPCI Seeding Form". Do not merely do routine KYC; explicitly specify that you need NPCI mapping for DBT scholarships. It usually takes 48 to 72 business hours to reflect on the NSP portal.',
    answerMediaType: 'text',
    createdAt: '2025-09-22',
    resolvedAt: '2025-09-23',
  },
  {
    id: 'dbt-5',
    mentorId: 'm-asha',
    studentId: 'stud-anon',
    studentName: 'Anonymous Student',
    studentGrade: 'Unknown',
    subject: 'Inappropriate Solicitation',
    topic: 'Non-Academic Personal Contact Request',
    category: 'Career guidance',
    question: 'Please share your personal WhatsApp phone number and house location. Let us talk on private chat tonight instead of this website.',
    contextDetails: 'Flagged for violating platform child safety and education-only conduct policy.',
    status: 'under_review',
    flagged: true,
    flagCategory: 'private_contact_solicitation',
    flagReason: 'Student attempted to solicit private personal WhatsApp number and physical residence address. Outside academic scope and in violation of safety rules.',
    flaggedAt: '2025-10-16',
    createdAt: '2025-10-16',
  },
  {
    id: 'dbt-6',
    mentorId: 'm-ravi',
    studentId: 'stud-suresh',
    studentName: 'Suresh Gowda',
    studentGrade: 'Diploma Agriculture · Mandya',
    subject: 'Agriculture Tech & Soil Health',
    topic: 'Block Krishi Vigyan Kendra Soil Testing Procedure',
    category: 'Agriculture & local entrepreneurship',
    question: 'Where can I get soil testing done for organic certification in our taluk, and how much is the government fee?',
    status: 'answered',
    answer: 'Every Krishi Vigyan Kendra (KVK) and block agricultural office has a mini soil testing lab. The nominal fee is under Rs. 50 per sample. They test pH, organic carbon, nitrogen, phosphorus, and potassium.',
    createdAt: '2025-10-05',
    resolvedAt: '2025-10-06',
  },
]

// Default completed sessions
const DEFAULT_SESSIONS: MentoringSession[] = [
  {
    id: 'ses-1',
    mentorId: 'm-asha',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    topic: 'GNM College Choice Filling & Verification',
    mode: 'voice',
    scheduledDate: '2025-09-15',
    status: 'completed',
    notes: 'Reviewed candidate options list. Advised priority for district government hospital training centers.',
  },
  {
    id: 'ses-2',
    mentorId: 'm-asha',
    studentId: 'stud-vikram',
    studentName: 'Vikram Singh Rathore',
    topic: 'Paramedical Entrance Syllabus & Books',
    mode: 'text',
    scheduledDate: '2025-09-17',
    status: 'completed',
    notes: 'Sent NCERT summary PDFs and previous 5 years solved question papers via text.',
  },
  {
    id: 'ses-3',
    mentorId: 'm-ravi',
    studentId: 'stud-suresh',
    studentName: 'Suresh Gowda',
    topic: 'ICAR Counselling College Selection Strategy',
    mode: 'voice',
    scheduledDate: '2025-10-08',
    status: 'completed',
  },
  {
    id: 'ses-4',
    mentorId: 'm-neha',
    studentId: 'stud-rohit',
    studentName: 'Rohit Mondal',
    topic: 'Smartphone Design Practice & Client Communication',
    mode: 'online',
    scheduledDate: '2025-10-12',
    status: 'completed',
  },
]

// Default review reports
const DEFAULT_REPORTS: ReviewReport[] = []

// Default sample micro-lessons (Strictly 30-60 seconds)
const DEFAULT_SAMPLE_LESSONS: SampleLesson[] = [
  {
    id: 'sml-1',
    mentorId: 'm-asha',
    title: 'ANM Nursing in 45 Seconds: Eligibility & Fees',
    subject: 'Healthcare & Nursing',
    language: 'Hindi',
    description: 'A 45-second micro-lesson explaining who can apply for government ANM nursing training, seat reservation, and minimal college fees.',
    durationSeconds: 45,
    durationFormatted: '0:45',
    mediaType: 'video',
    sampleMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    subtitlesText: '0:00 - 0:12 | नमस्ते! ANM नर्सिंग सिर्फ 45 सेकंड में समझें।\n0:12 - 0:28 | 12वीं किसी भी स्ट्रीम (आर्ट्स, कॉमर्स, साइंस) से 40-45% अंकों से पास छात्राएं पात्र हैं।\n0:28 - 0:45 | सरकारी कॉलेज में फीस 5000 रुपये से भी कम होती है। हर साल जुलाई में फॉर्म आते हैं।',
    subtitlesCues: [
      { id: 'cue-1', start: 0, end: 12, text: 'नमस्ते! ANM नर्सिंग सिर्फ 45 सेकंड में समझें।' },
      { id: 'cue-2', start: 12, end: 28, text: '12वीं किसी भी स्ट्रीम (आर्ट्स, कॉमर्स, साइंस) से 40-45% अंकों से पास छात्राएं पात्र हैं।' },
      { id: 'cue-3', start: 28, end: 45, text: 'सरकारी कॉलेज में फीस 5000 रुपये से भी कम होती है। हर साल जुलाई में फॉर्म आते हैं।' },
    ],
    status: 'published',
    helpfulCount: 24,
    notHelpfulCount: 1,
    createdAt: '2025-09-20',
    updatedAt: '2025-09-20',
  },
  {
    id: 'sml-2',
    mentorId: 'm-ravi',
    title: 'Soil Health Card Scheme in 38 Seconds',
    subject: 'Agriculture & Schemes',
    language: 'Hindi & Tamil',
    description: 'Quick walkthrough on getting low-cost soil testing done at block Krishi Vigyan Kendra (KVK) centers.',
    durationSeconds: 38,
    durationFormatted: '0:38',
    mediaType: 'audio',
    sampleMediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    subtitlesText: '0:00 - 0:10 | வணக்கம் / नमस्ते! मृदा स्वास्थ्य कार्ड योजना क्या है?\n0:10 - 0:24 | अपने ब्लॉक के कृषि विज्ञान केंद्र (KVK) में सिर्फ 50 रुपये में मिट्टी की जांच कराएं।\n0:24 - 0:38 | NPK और जैविक कार्बन की रिपोर्ट से उर्वरक खर्च में 30% बचत होती है।',
    subtitlesCues: [
      { id: 'cue-4', start: 0, end: 10, text: 'வணக்கம் / नमस्ते! मृदा स्वास्थ्य कार्ड योजना क्या है?' },
      { id: 'cue-5', start: 10, end: 24, text: 'अपने ब्लॉक के कृषि विज्ञान केंद्र (KVK) में सिर्फ 50 रुपये में मिट्टी की जांच कराएं।' },
      { id: 'cue-6', start: 24, end: 38, text: 'NPK और जैविक कार्बन की रिपोर्ट से उर्वरक खर्च में 30% बचत होती है।' },
    ],
    status: 'published',
    helpfulCount: 19,
    notHelpfulCount: 0,
    createdAt: '2025-09-25',
    updatedAt: '2025-09-25',
  },
  {
    id: 'sml-3',
    mentorId: 'm-neha',
    title: 'Design a Shop Flyer on Phone in 50s',
    subject: 'Computer & Digital Skills',
    language: 'Hindi & Bengali',
    description: 'Step-by-step micro-tutorial to design marketing banners on Canva Android app in under a minute.',
    durationSeconds: 50,
    durationFormatted: '0:50',
    mediaType: 'video',
    sampleMediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    subtitlesText: '0:00 - 0:15 | स्मार्टफोन पर 50 सेकंड में दुकान का पोस्टर बनाना सीखें।\n0:15 - 0:32 | Canva ऐप में 1080x1080 साइज चुनें और Noto Sans Devanagari फॉन्ट ऐड करें।\n0:32 - 0:50 | लोकल दुकानदारों के लिए बैनर बनाकर आप 300-500 रुपये प्रति डिजाइन कमा सकते हैं।',
    subtitlesCues: [
      { id: 'cue-7', start: 0, end: 15, text: 'स्मार्टफोन पर 50 सेकंड में दुकान का पोस्टर बनाना सीखें।' },
      { id: 'cue-8', start: 15, end: 32, text: 'Canva ऐप में 1080x1080 साइज चुनें और Noto Sans Devanagari फॉन्ट ऐड करें।' },
      { id: 'cue-9', start: 32, end: 50, text: 'लोकल दुकानदारों के लिए बैनर बनाकर आप 300-500 रुपये प्रति डिजाइन कमा सकते हैं।' },
    ],
    status: 'published',
    helpfulCount: 31,
    notHelpfulCount: 1,
    createdAt: '2025-10-01',
    updatedAt: '2025-10-01',
  },
]

// Default lesson written feedback
const DEFAULT_LESSON_FEEDBACK: LessonFeedback[] = [
  {
    id: 'lfb-1',
    lessonId: 'sml-1',
    studentId: 'stud-pooja',
    studentName: 'Pooja Verma',
    comment: 'Bahut hi helpful 45 seconds explanation! Arts background ke baare mein mera doubt clear ho gaya.',
    isHelpful: true,
    createdAt: '2025-09-22',
  },
  {
    id: 'lfb-2',
    lessonId: 'sml-1',
    studentId: 'stud-vikram',
    studentName: 'Vikram Singh',
    comment: 'Short, clear, aur Hindi captions ke saath samajhna aasan tha.',
    isHelpful: true,
    createdAt: '2025-09-24',
  },
  {
    id: 'lfb-3',
    lessonId: 'sml-3',
    studentId: 'stud-rohit',
    studentName: 'Rohit Mondal',
    comment: 'Direct mobile screen steps! Maine pehla banner bana liya.',
    isHelpful: true,
    createdAt: '2025-10-03',
  },
]

// Storage helper functions
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T
  } catch (e) {
    console.error(`Error loading key ${key}:`, e)
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving key ${key}:`, e)
  }
}

export const mentorStore = {
  // Get all mentors
  getAllMentors(): MentorProfile[] {
    return load<MentorProfile[]>(STORAGE_KEYS.MENTORS, DEFAULT_MENTORS)
  },

  // Get single mentor by ID
  getMentorById(id: string): MentorProfile | null {
    const mentors = this.getAllMentors()
    return mentors.find(m => m.id === id || m.userId === id || m.email.toLowerCase() === id.toLowerCase()) || null
  },

  // Extract or initialize mentor from authenticated user details
  registerOrGetMentorFromAccount(user: User, details?: Record<string, string>): MentorProfile {
    const mentors = this.getAllMentors()
    const existing = mentors.find(
      m =>
        (user.id && m.userId === user.id) ||
        (user.mentorProfileId && m.id === user.mentorProfileId) ||
        m.email.toLowerCase() === user.email.toLowerCase()
    )

    if (existing) {
      // If new details were provided, update editable profile fields
      if (details && Object.keys(details).length > 0) {
        const updated: MentorProfile = {
          ...existing,
          headline: details.professional?.trim() || existing.headline,
          bio: details.bio?.trim() || existing.bio,
          languages: details.languages
            ? details.languages.split(',').map(s => s.trim()).filter(Boolean)
            : existing.languages,
          qualifications: details.expertise
            ? Array.from(new Set([...existing.qualifications, details.expertise.trim()]))
            : existing.qualifications,
        }
        this.saveMentor(updated)
        return updated
      }
      return existing
    }

    // Create a new mentor profile strictly from entered login/signup details
    const newId = `m-${Date.now().toString(36)}`
    const extractedLanguages = details?.languages
      ? details.languages.split(',').map(s => s.trim()).filter(Boolean)
      : ['Hindi', 'English']
    const extractedExpertise = details?.expertise?.trim()
      ? [details.expertise.trim()]
      : ['Career guidance']

    const newMentor: MentorProfile = {
      id: newId,
      userId: user.id || newId,
      email: user.email,
      name: user.name || (user.email.split('@')[0]),
      photoUrl: undefined,
      headline: details?.professional?.trim() || 'Youth Mentor & Career Guide',
      bio:
        details?.bio?.trim() ||
        'Welcome! I joined MyRaah to guide students in discovering careers, vocational pathways, and educational schemes.',
      education: 'Verified Educational Credentials (Pending Platform Review)',
      qualifications: extractedExpertise,
      experienceYears: 1,
      teachingModes: ['voice', 'text', 'online'],
      languages: extractedLanguages.length ? extractedLanguages : ['Hindi', 'English'],
      location: details?.location?.trim() || 'India',
      verified: false, // New mentors start unverified until platform review
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      writtenIntro: details?.bio?.trim() || 'I am ready to answer your questions and guide you on your journey.',
      availabilityDays: ['Monday', 'Wednesday', 'Friday'],
      availabilityHours: '5:00 PM – 7:00 PM IST',
      acceptingMentees: true,
    }

    const updatedMentors = [newMentor, ...mentors]
    save(STORAGE_KEYS.MENTORS, updatedMentors)

    // Add initial subject from their expertise
    if (extractedExpertise.length) {
      this.addSubject(user, newId, {
        category: 'Career guidance',
        title: extractedExpertise[0],
        level: 'Students & Job Seekers',
        description: `Guidance and doubt resolution in ${extractedExpertise[0]}.`,
      })
    }

    return newMentor
  },

  // Save/Update mentor profile with access control
  saveMentor(profile: MentorProfile): void {
    const mentors = this.getAllMentors()
    const index = mentors.findIndex(m => m.id === profile.id)
    if (index >= 0) {
      mentors[index] = profile
      save(STORAGE_KEYS.MENTORS, mentors)
    } else {
      mentors.push(profile)
      save(STORAGE_KEYS.MENTORS, mentors)
    }
  },

  // Authenticated mentor profile update (CRITICAL: Mentors cannot edit verification status, rating, or memberSince)
  updateMentorProfile(
    currentUser: User | null,
    mentorId: string,
    updates: Partial<Omit<MentorProfile, 'id' | 'verified' | 'memberSince' | 'email'>>
  ): { success: boolean; error?: string } {
    if (!currentUser) return { success: false, error: 'Authentication required' }
    if (currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can update mentor profile details.' }
    }

    const mentor = this.getMentorById(mentorId)
    if (!mentor) return { success: false, error: 'Mentor not found' }

    // Enforce ownership: must match mentor email or ID
    const isOwner =
      mentor.id === mentorId &&
      (mentor.email.toLowerCase() === currentUser.email.toLowerCase() ||
        mentor.userId === currentUser.id ||
        currentUser.mentorProfileId === mentor.id)

    if (!isOwner) {
      return { success: false, error: 'Unauthorized: You can only edit your own mentor profile.' }
    }

    // Apply allowed updates only
    const updated: MentorProfile = {
      ...mentor,
      name: updates.name?.trim() || mentor.name,
      photoUrl: updates.photoUrl !== undefined ? updates.photoUrl : mentor.photoUrl,
      headline: updates.headline?.trim() || mentor.headline,
      bio: updates.bio?.trim() || mentor.bio,
      education: updates.education?.trim() || mentor.education,
      qualifications: updates.qualifications || mentor.qualifications,
      experienceYears: typeof updates.experienceYears === 'number' ? updates.experienceYears : mentor.experienceYears,
      teachingModes: updates.teachingModes || mentor.teachingModes,
      languages: updates.languages || mentor.languages,
      location: updates.location?.trim() || mentor.location,
      introVideo: updates.introVideo !== undefined ? updates.introVideo : mentor.introVideo,
      writtenIntro: updates.writtenIntro !== undefined ? updates.writtenIntro : mentor.writtenIntro,
      availabilityDays: updates.availabilityDays || mentor.availabilityDays,
      availabilityHours: updates.availabilityHours?.trim() || mentor.availabilityHours,
      acceptingMentees: updates.acceptingMentees !== undefined ? updates.acceptingMentees : mentor.acceptingMentees,
    }

    this.saveMentor(updated)
    return { success: true }
  },

  // Subjects Management
  getSubjects(mentorId: string): TeachingSubject[] {
    const subjects = load<TeachingSubject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS)
    return subjects.filter(s => s.mentorId === mentorId)
  },

  addSubject(
    currentUser: User | null,
    mentorId: string,
    subject: Omit<TeachingSubject, 'id' | 'mentorId'>
  ): { success: boolean; subject?: TeachingSubject; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can add subjects.' }
    }
    const subjects = load<TeachingSubject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS)
    const newSubject: TeachingSubject = {
      ...subject,
      id: `sub-${Date.now().toString(36)}`,
      mentorId,
    }
    subjects.push(newSubject)
    save(STORAGE_KEYS.SUBJECTS, subjects)
    return { success: true, subject: newSubject }
  },

  deleteSubject(currentUser: User | null, subjectId: string): { success: boolean; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can remove subjects.' }
    }
    let subjects = load<TeachingSubject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS)
    subjects = subjects.filter(s => s.id !== subjectId)
    save(STORAGE_KEYS.SUBJECTS, subjects)
    return { success: true }
  },

  // Resources Management
  getResources(mentorId: string): TeachingResource[] {
    const resources = load<TeachingResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES)
    return resources.filter(r => r.mentorId === mentorId)
  },

  addResource(
    currentUser: User | null,
    mentorId: string,
    resource: Omit<TeachingResource, 'id' | 'mentorId' | 'date'>
  ): { success: boolean; resource?: TeachingResource; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can publish learning resources.' }
    }
    const resources = load<TeachingResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES)
    const newRes: TeachingResource = {
      ...resource,
      id: `res-${Date.now().toString(36)}`,
      mentorId,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    resources.unshift(newRes)
    save(STORAGE_KEYS.RESOURCES, resources)
    return { success: true, resource: newRes }
  },

  deleteResource(currentUser: User | null, resourceId: string): { success: boolean; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can delete learning resources.' }
    }
    let resources = load<TeachingResource[]>(STORAGE_KEYS.RESOURCES, DEFAULT_RESOURCES)
    resources = resources.filter(r => r.id !== resourceId)
    save(STORAGE_KEYS.RESOURCES, resources)
    return { success: true }
  },

  // Student Reviews Management — CRITICAL REVIEW INTEGRITY
  getReviews(mentorId: string): StudentReview[] {
    const reviews = load<StudentReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
    return reviews.filter(r => r.mentorId === mentorId)
  },

  // Submit Review: ONLY Authenticated Students can post reviews
  addReview(
    currentUser: User | null,
    mentorId: string,
    reviewData: { rating: number; feedback: string; category: ReviewCategory }
  ): { success: boolean; review?: StudentReview; error?: string } {
    if (!currentUser) return { success: false, error: 'Please sign in to write a review.' }
    if (currentUser.role !== 'student') {
      return { success: false, error: 'Only students can submit reviews for mentors.' }
    }
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5 stars.' }
    }
    if (!reviewData.feedback?.trim() || reviewData.feedback.trim().length < 5) {
      return { success: false, error: 'Please provide helpful written feedback (at least 5 characters).' }
    }

    const reviews = load<StudentReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
    const studentIdentifier = currentUser.id || currentUser.email

    // Check if verified interaction exists (completed session or resolved doubt)
    const sessions = load<MentoringSession[]>(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS)
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const hasInteraction =
      sessions.some(
        s => s.mentorId === mentorId && (s.studentId === studentIdentifier || s.studentName === currentUser.name)
      ) ||
      doubts.some(
        d => d.mentorId === mentorId && (d.studentId === studentIdentifier || d.studentName === currentUser.name)
      )

    const newReview: StudentReview = {
      id: `rev-${Date.now().toString(36)}`,
      mentorId,
      studentId: studentIdentifier,
      studentName: currentUser.name,
      rating: Math.round(reviewData.rating),
      feedback: reviewData.feedback.trim(),
      category: reviewData.category,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedInteraction: hasInteraction,
    }

    reviews.unshift(newReview)
    save(STORAGE_KEYS.REVIEWS, reviews)
    return { success: true, review: newReview }
  },

  // Edit Review: STRICTLY FORBIDDEN FOR MENTORS. Only the reviewing student can edit.
  updateReview(
    currentUser: User | null,
    reviewId: string,
    updates: { rating?: number; feedback?: string; category?: ReviewCategory }
  ): { success: boolean; error?: string } {
    if (!currentUser) return { success: false, error: 'Authentication required' }
    if (currentUser.role !== 'student') {
      return { success: false, error: 'CRITICAL ACCESS ERROR: Mentors are strictly forbidden from modifying student reviews.' }
    }

    const reviews = load<StudentReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
    const index = reviews.findIndex(r => r.id === reviewId)
    if (index === -1) return { success: false, error: 'Review not found' }

    const studentIdentifier = currentUser.id || currentUser.email
    if (reviews[index].studentId !== studentIdentifier) {
      return { success: false, error: 'Unauthorized: You can only edit your own review.' }
    }

    if (updates.rating) reviews[index].rating = Math.max(1, Math.min(5, Math.round(updates.rating)))
    if (updates.feedback) reviews[index].feedback = updates.feedback.trim()
    if (updates.category) reviews[index].category = updates.category

    save(STORAGE_KEYS.REVIEWS, reviews)
    return { success: true }
  },

  // Delete Review: STRICTLY FORBIDDEN FOR MENTORS. Only reviewing student can delete.
  deleteReview(currentUser: User | null, reviewId: string): { success: boolean; error?: string } {
    if (!currentUser) return { success: false, error: 'Authentication required' }
    if (currentUser.role !== 'student') {
      return { success: false, error: 'CRITICAL ACCESS ERROR: Mentors are strictly forbidden from deleting student reviews.' }
    }

    let reviews = load<StudentReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
    const target = reviews.find(r => r.id === reviewId)
    if (!target) return { success: false, error: 'Review not found' }

    const studentIdentifier = currentUser.id || currentUser.email
    if (target.studentId !== studentIdentifier) {
      return { success: false, error: 'Unauthorized: You can only delete your own review.' }
    }

    reviews = reviews.filter(r => r.id !== reviewId)
    save(STORAGE_KEYS.REVIEWS, reviews)
    return { success: true }
  },

  // Report Review: If a mentor or user finds a review abusive or fraudulent, they report it for moderation.
  // The review IS NOT deleted or hidden by the mentor.
  reportReview(
    currentUser: User | null,
    reviewId: string,
    reason: string
  ): { success: boolean; error?: string } {
    if (!currentUser) return { success: false, error: 'Authentication required' }
    if (!reason.trim()) return { success: false, error: 'Please provide a reason for the report.' }

    const reports = load<ReviewReport[]>(STORAGE_KEYS.REPORTS, DEFAULT_REPORTS)
    const reviews = load<StudentReview[]>(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS)
    const review = reviews.find(r => r.id === reviewId)
    if (!review) return { success: false, error: 'Review not found' }

    const newReport: ReviewReport = {
      id: `rep-${Date.now().toString(36)}`,
      reviewId,
      mentorId: review.mentorId,
      reporterId: currentUser.id || currentUser.email,
      reason: reason.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    reports.push(newReport)
    save(STORAGE_KEYS.REPORTS, reports)

    // Mark as reported in review for administrative badge (does NOT remove the review)
    review.reported = true
    review.reportReason = reason.trim()
    save(STORAGE_KEYS.REVIEWS, reviews)

    return { success: true }
  },

  // Doubts Management
  getDoubts(mentorId: string): DoubtRecord[] {
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const list = doubts.filter(d => d.mentorId === mentorId)
    // If empty for a mentor, populate copies of default doubts so every mentor has realistic demo data
    if (list.length === 0 && mentorId) {
      const demoList = DEFAULT_DOUBTS.map(d => ({
        ...d,
        id: `${d.id}-${mentorId.slice(0, 8)}`,
        mentorId,
      }))
      doubts.push(...demoList)
      save(STORAGE_KEYS.DOUBTS, doubts)
      return demoList
    }
    return list
  },

  getDoubtById(doubtId: string): DoubtRecord | null {
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    return doubts.find(d => d.id === doubtId) || null
  },

  askDoubt(
    currentUser: User | null,
    mentorId: string,
    doubtInput: { question: string; category: ExpertiseCategory; topic?: string; studentGrade?: string; attachmentUrl?: string; attachmentName?: string }
  ): { success: boolean; doubt?: DoubtRecord; error?: string } {
    if (!currentUser) return { success: false, error: 'Please sign in to ask a doubt.' }
    if (!doubtInput.question?.trim()) return { success: false, error: 'Question cannot be empty.' }

    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const newDoubt: DoubtRecord = {
      id: `dbt-${Date.now().toString(36)}`,
      mentorId,
      studentId: currentUser.id || currentUser.email,
      studentName: currentUser.name || 'Student',
      studentGrade: doubtInput.studentGrade || 'Class 10/12 Learner',
      subject: doubtInput.category,
      topic: doubtInput.topic?.trim() || 'Academic Inquiry',
      category: doubtInput.category,
      question: doubtInput.question.trim(),
      attachmentUrl: doubtInput.attachmentUrl,
      attachmentName: doubtInput.attachmentName,
      attachmentType: doubtInput.attachmentUrl ? 'image' : undefined,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }
    doubts.unshift(newDoubt)
    save(STORAGE_KEYS.DOUBTS, doubts)
    return { success: true, doubt: newDoubt }
  },

  resolveDoubt(
    currentUser: User | null,
    doubtId: string,
    answer: string
  ): { success: boolean; error?: string } {
    return this.answerDoubt(currentUser, doubtId, { answer })
  },

  answerDoubt(
    currentUser: User | null,
    doubtId: string,
    params: {
      answer: string
      mediaType?: 'text' | 'audio' | 'video'
      mediaUrl?: string
      mediaKey?: string
    }
  ): { success: boolean; doubt?: DoubtRecord; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only authenticated mentors can answer student doubts.' }
    }
    if (!params.answer?.trim()) {
      return { success: false, error: 'Please enter a written academic explanation.' }
    }
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const d = doubts.find(item => item.id === doubtId)
    if (!d) return { success: false, error: 'Doubt record not found.' }

    d.answer = params.answer.trim()
    d.status = 'answered'
    d.resolvedAt = new Date().toISOString().split('T')[0]
    if (params.mediaType) d.answerMediaType = params.mediaType
    if (params.mediaUrl) d.answerMediaUrl = params.mediaUrl
    if (params.mediaKey) d.answerMediaKey = params.mediaKey

    // Clear any active flag when mentor resolves it
    d.flagged = false
    d.flagReason = undefined
    d.flagCategory = undefined

    save(STORAGE_KEYS.DOUBTS, doubts)
    return { success: true, doubt: d }
  },

  flagDoubt(
    currentUser: User | null,
    doubtId: string,
    params: {
      category: DoubtFlagCategory
      reason: string
    }
  ): { success: boolean; doubt?: DoubtRecord; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can flag student doubts.' }
    }
    if (!params.reason?.trim()) {
      return { success: false, error: 'Please describe the reason for moderation.' }
    }
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const d = doubts.find(item => item.id === doubtId)
    if (!d) return { success: false, error: 'Doubt record not found.' }

    d.status = 'under_review'
    d.flagged = true
    d.flagCategory = params.category
    d.flagReason = params.reason.trim()
    d.flaggedAt = new Date().toISOString().split('T')[0]

    save(STORAGE_KEYS.DOUBTS, doubts)
    return { success: true, doubt: d }
  },

  unflagDoubt(
    currentUser: User | null,
    doubtId: string
  ): { success: boolean; doubt?: DoubtRecord; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Unauthorized.' }
    }
    const doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    const d = doubts.find(item => item.id === doubtId)
    if (!d) return { success: false, error: 'Doubt not found' }

    d.status = d.answer ? 'answered' : 'pending'
    d.flagged = false
    d.flagCategory = undefined
    d.flagReason = undefined
    d.flaggedAt = undefined

    save(STORAGE_KEYS.DOUBTS, doubts)
    return { success: true, doubt: d }
  },

  deleteDoubt(
    currentUser: User | null,
    doubtId: string
  ): { success: boolean; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Unauthorized.' }
    }
    let doubts = load<DoubtRecord[]>(STORAGE_KEYS.DOUBTS, DEFAULT_DOUBTS)
    doubts = doubts.filter(d => d.id !== doubtId)
    save(STORAGE_KEYS.DOUBTS, doubts)
    return { success: true }
  },

  // Sessions Management
  getSessions(mentorId: string): MentoringSession[] {
    const sessions = load<MentoringSession[]>(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS)
    return sessions.filter(s => s.mentorId === mentorId)
  },

  requestSession(
    currentUser: User | null,
    mentorId: string,
    sessionInput: { topic: string; mode: TeachingMode; scheduledDate: string }
  ): { success: boolean; session?: MentoringSession; error?: string } {
    if (!currentUser) return { success: false, error: 'Please sign in to book a session.' }
    if (!sessionInput.topic.trim()) return { success: false, error: 'Please provide a topic for guidance.' }

    const sessions = load<MentoringSession[]>(STORAGE_KEYS.SESSIONS, DEFAULT_SESSIONS)
    const newSession: MentoringSession = {
      id: `ses-${Date.now().toString(36)}`,
      mentorId,
      studentId: currentUser.id || currentUser.email,
      studentName: currentUser.name || 'Student',
      topic: sessionInput.topic.trim(),
      mode: sessionInput.mode,
      scheduledDate: sessionInput.scheduledDate,
      status: 'scheduled',
    }
    sessions.unshift(newSession)
    save(STORAGE_KEYS.SESSIONS, sessions)
    return { success: true, session: newSession }
  },

  // Dynamic Statistics Calculation: strictly computed from database records
  getMentorStats(mentorId: string) {
    const doubts = this.getDoubts(mentorId)
    const sessions = this.getSessions(mentorId)
    const resources = this.getResources(mentorId)
    const reviews = this.getReviews(mentorId)

    const resolvedDoubts = doubts.filter(d => d.status === 'resolved' || d.status === 'answered')
    const completedSessions = sessions.filter(s => s.status === 'completed')

    // Count unique students helped across resolved doubts and completed sessions
    const studentSet = new Set<string>()
    resolvedDoubts.forEach(d => studentSet.add(d.studentId || d.studentName))
    completedSessions.forEach(s => studentSet.add(s.studentId || s.studentName))

    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 0

    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)))
      ratingDistribution[star] = (ratingDistribution[star] || 0) + 1
    })

    return {
      doubtsResolved: resolvedDoubts.length,
      studentsHelped: studentSet.size,
      sessionsCompleted: completedSessions.length,
      resourcesPublished: resources.length,
      averageRating,
      totalReviews,
      ratingDistribution,
      isNewMentor:
        resolvedDoubts.length === 0 &&
        completedSessions.length === 0 &&
        resources.length === 0 &&
        totalReviews === 0,
    }
  },

  // ==========================================
  // Sample Lesson Studio & Micro-Lessons API
  // ==========================================

  getSampleLessons(mentorId: string, status?: LessonStatus): SampleLesson[] {
    const all = load<SampleLesson[]>(STORAGE_KEYS.SAMPLE_LESSONS, DEFAULT_SAMPLE_LESSONS)
    return all.filter(l => l.mentorId === mentorId && (!status || l.status === status))
  },

  getSampleLessonById(id: string): SampleLesson | null {
    const all = load<SampleLesson[]>(STORAGE_KEYS.SAMPLE_LESSONS, DEFAULT_SAMPLE_LESSONS)
    return all.find(l => l.id === id) || null
  },

  saveSampleLesson(
    currentUser: User | null,
    lesson: Omit<SampleLesson, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'notHelpfulCount'> & {
      id?: string
      helpfulCount?: number
      notHelpfulCount?: number
    }
  ): { success: boolean; lesson?: SampleLesson; error?: string } {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can create or edit sample lessons.' }
    }

    if (!lesson.title?.trim()) {
      return { success: false, error: 'Lesson title is required.' }
    }

    if (lesson.durationSeconds < 30 || lesson.durationSeconds > 60) {
      return {
        success: false,
        error: `Lesson duration must be between 30 and 60 seconds. Current duration is ${lesson.durationSeconds}s.`,
      }
    }

    const all = load<SampleLesson[]>(STORAGE_KEYS.SAMPLE_LESSONS, DEFAULT_SAMPLE_LESSONS)
    const now = new Date().toISOString().split('T')[0]

    if (lesson.id) {
      // Update existing
      const index = all.findIndex(l => l.id === lesson.id)
      if (index === -1) return { success: false, error: 'Lesson not found' }

      const updated: SampleLesson = {
        ...all[index],
        ...lesson,
        id: lesson.id,
        updatedAt: now,
      }
      all[index] = updated
      save(STORAGE_KEYS.SAMPLE_LESSONS, all)
      return { success: true, lesson: updated }
    } else {
      // Create new
      const newLesson: SampleLesson = {
        ...lesson,
        id: `sml-${Date.now().toString(36)}`,
        helpfulCount: 0,
        notHelpfulCount: 0,
        createdAt: now,
        updatedAt: now,
      }
      all.unshift(newLesson)
      save(STORAGE_KEYS.SAMPLE_LESSONS, all)
      return { success: true, lesson: newLesson }
    }
  },

  async deleteSampleLesson(currentUser: User | null, lessonId: string): Promise<{ success: boolean; error?: string }> {
    if (!currentUser || currentUser.role !== 'mentor') {
      return { success: false, error: 'Only mentors can delete sample lessons.' }
    }

    let all = load<SampleLesson[]>(STORAGE_KEYS.SAMPLE_LESSONS, DEFAULT_SAMPLE_LESSONS)
    const target = all.find(l => l.id === lessonId)
    if (!target) return { success: false, error: 'Lesson not found' }

    if (target.mediaKey) {
      await mediaStorage.deleteMediaBlob(target.mediaKey)
    }

    all = all.filter(l => l.id !== lessonId)
    save(STORAGE_KEYS.SAMPLE_LESSONS, all)
    return { success: true }
  },

  voteLessonHelpful(
    currentUser: User | null,
    lessonId: string,
    isHelpful: boolean
  ): { success: boolean; error?: string; userVote?: 'helpful' | 'not_helpful' } {
    const userKey = currentUser ? (currentUser.id || currentUser.email) : 'guest_learner'
    const voteStoreKey = `${userKey}_${lessonId}`
    const votes = load<Record<string, 'helpful' | 'not_helpful'>>(STORAGE_KEYS.USER_LESSON_VOTES, {})

    const all = load<SampleLesson[]>(STORAGE_KEYS.SAMPLE_LESSONS, DEFAULT_SAMPLE_LESSONS)
    const lesson = all.find(l => l.id === lessonId)
    if (!lesson) return { success: false, error: 'Lesson not found' }

    const previousVote = votes[voteStoreKey]
    const targetVote = isHelpful ? 'helpful' : 'not_helpful'

    if (previousVote === targetVote) {
      // Already voted this way
      return { success: true, userVote: targetVote }
    }

    if (previousVote === 'helpful') {
      lesson.helpfulCount = Math.max(0, lesson.helpfulCount - 1)
    } else if (previousVote === 'not_helpful') {
      lesson.notHelpfulCount = Math.max(0, lesson.notHelpfulCount - 1)
    }

    if (isHelpful) {
      lesson.helpfulCount += 1
    } else {
      lesson.notHelpfulCount += 1
    }

    votes[voteStoreKey] = targetVote
    save(STORAGE_KEYS.USER_LESSON_VOTES, votes)
    save(STORAGE_KEYS.SAMPLE_LESSONS, all)

    return { success: true, userVote: targetVote }
  },

  getUserLessonVote(currentUser: User | null, lessonId: string): 'helpful' | 'not_helpful' | null {
    const userKey = currentUser ? (currentUser.id || currentUser.email) : 'guest_learner'
    const voteStoreKey = `${userKey}_${lessonId}`
    const votes = load<Record<string, 'helpful' | 'not_helpful'>>(STORAGE_KEYS.USER_LESSON_VOTES, {})
    return votes[voteStoreKey] || null
  },

  getLessonFeedback(lessonId: string): LessonFeedback[] {
    const all = load<LessonFeedback[]>(STORAGE_KEYS.LESSON_FEEDBACK, DEFAULT_LESSON_FEEDBACK)
    return all.filter(f => f.lessonId === lessonId)
  },

  addLessonFeedback(
    currentUser: User | null,
    lessonId: string,
    comment: string,
    isHelpful = true
  ): { success: boolean; feedback?: LessonFeedback; error?: string } {
    if (!comment?.trim() || comment.trim().length < 3) {
      return { success: false, error: 'Please enter written feedback (at least 3 characters).' }
    }

    const all = load<LessonFeedback[]>(STORAGE_KEYS.LESSON_FEEDBACK, DEFAULT_LESSON_FEEDBACK)
    const newFeedback: LessonFeedback = {
      id: `lfb-${Date.now().toString(36)}`,
      lessonId,
      studentId: currentUser ? (currentUser.id || currentUser.email) : 'student-demo',
      studentName: currentUser?.name || 'Student Learner',
      comment: comment.trim(),
      isHelpful,
      createdAt: new Date().toISOString().split('T')[0],
    }

    all.unshift(newFeedback)
    save(STORAGE_KEYS.LESSON_FEEDBACK, all)
    return { success: true, feedback: newFeedback }
  },
}

export function parseSubtitleText(text: string, totalDuration: number): SubtitleCue[] {
  if (!text?.trim()) return []
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const cues: SubtitleCue[] = []
  const timestampRegex = /(\d+:\d{2})\s*[-–]\s*(\d+:\d{2})\s*[|:]\s*(.+)/

  lines.forEach((line, index) => {
    const match = line.match(timestampRegex)
    if (match) {
      const startSec = parseTimeString(match[1])
      const endSec = parseTimeString(match[2])
      cues.push({
        id: `cue-${index}`,
        start: startSec,
        end: endSec,
        text: match[3].trim(),
      })
    } else {
      const chunk = totalDuration > 0 ? totalDuration / lines.length : 10
      const start = Math.round(index * chunk)
      const end = Math.round((index + 1) * chunk)
      cues.push({
        id: `cue-${index}`,
        start,
        end,
        text: line,
      })
    }
  })
  return cues
}

function parseTimeString(str: string): number {
  const parts = str.split(':').map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return Number(str) || 0
}

