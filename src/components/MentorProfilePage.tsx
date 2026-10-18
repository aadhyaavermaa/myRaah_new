import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Compass,
  Eye,
  Flag,
  GraduationCap,
  HelpCircle,
  Languages,
  MapPin,
  MessageCircle,
  MessageSquare,
  Monitor,
  Phone,
  Play,
  Plus,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCheck,
  Users,
  Video,
  Volume2,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import type {
  ExpertiseCategory,
  MentorProfile,
  ResourceContentType,
  ReviewCategory,
  SampleLesson,
  StudentReview,
  TeachingMode,
  TeachingResource,
  TeachingSubject,
  User,
} from '../types'
import { mentorStore } from '../services/mentorStore'
import MentorEditModal from './MentorEditModal'
import SampleLessonsSection from './SampleLessonsSection'
import SampleLessonStudioModal from './SampleLessonStudioModal'

interface MentorProfilePageProps {
  currentUser: User | null
  mentorIdOverride?: string
}

const CATEGORY_ICONS: Record<ExpertiseCategory, typeof BookOpen> = {
  'Career guidance': Compass,
  'Scholarships and schemes': Award,
  'School subjects and academic doubts': HelpCircle,
  'Competitive examinations': GraduationCap,
  'Vocational education & skills': Zap,
  'Computer skills and coding': Monitor,
  'Internships and employment': Briefcase,
  'Interview preparation & communication': MessageSquare,
  'Agriculture & local entrepreneurship': Sparkles,
}

const MODE_LABELS: Record<TeachingMode, { label: string; icon: typeof Phone }> = {
  voice: { label: 'Voice Calls & Audio Notes', icon: Phone },
  text: { label: 'Text & Chat Guidance', icon: MessageCircle },
  video: { label: 'Video Consultations', icon: Video },
  online: { label: 'Online Webinars', icon: Radio },
  'in-person': { label: 'In-person / Local Hub', icon: Users },
}

export default function MentorProfilePage({ currentUser, mentorIdOverride }: MentorProfilePageProps) {
  const { id: urlParamId } = useParams<{ id: string }>()
  const mentorId = mentorIdOverride || urlParamId || 'm-asha'

  const [mentor, setMentor] = useState<MentorProfile | null>(() => mentorStore.getMentorById(mentorId))
  const [subjects, setSubjects] = useState<TeachingSubject[]>([])
  const [resources, setResources] = useState<TeachingResource[]>([])
  const [reviews, setReviews] = useState<StudentReview[]>([])
  const [stats, setStats] = useState(() => mentorStore.getMentorStats(mentorId))

  // Modals & Active State
  const [showEditModal, setShowEditModal] = useState(false)
  const [showStudioModal, setShowStudioModal] = useState(false)
  const [studioEditingLesson, setStudioEditingLesson] = useState<SampleLesson | null>(null)
  const [showConnectModal, setShowConnectModal] = useState<'doubt' | 'session' | null>(null)
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [activeResource, setActiveResource] = useState<TeachingResource | null>(null)
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false)
  const [previewAsStudent, setPreviewAsStudent] = useState(false)

  // Report Modal
  const [reportTargetReview, setReportTargetReview] = useState<StudentReview | null>(null)
  const [reportReason, setReportReason] = useState('')

  // Student Review Form state
  const [studentRating, setStudentRating] = useState(5)
  const [studentFeedback, setStudentFeedback] = useState('')
  const [studentCategory, setStudentCategory] = useState<ReviewCategory>('Clarity')
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState('')
  const [reviewNotice, setReviewNotice] = useState('')
  const [reviewsPage, setReviewsPage] = useState(1)
  const REVIEWS_PER_PAGE = 3

  // Filters for subjects & resources
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<string>('All')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('All')

  // Connect form inputs
  const [doubtQuestion, setDoubtQuestion] = useState('')
  const [doubtCategory, setDoubtCategory] = useState<ExpertiseCategory>('Career guidance')
  const [sessionTopic, setSessionTopic] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionMode, setSessionMode] = useState<TeachingMode>('voice')

  const reloadData = () => {
    const m = mentorStore.getMentorById(mentorId)
    setMentor(m)
    if (m) {
      setSubjects(mentorStore.getSubjects(m.id))
      setResources(mentorStore.getResources(m.id))
      setReviews(mentorStore.getReviews(m.id))
      setStats(mentorStore.getMentorStats(m.id))
    }
  }

  useEffect(() => {
    reloadData()
  }, [mentorId])

  // Is current user the mentor owner of this profile?
  const isOwner = useMemo(() => {
    if (!currentUser || currentUser.role !== 'mentor' || !mentor) return false
    return (
      mentor.email.toLowerCase() === currentUser.email.toLowerCase() ||
      mentor.userId === currentUser.id ||
      mentor.id === currentUser.mentorProfileId ||
      mentor.id === mentorId
    )
  }, [currentUser, mentor, mentorId])

  if (!mentor) {
    return (
      <div className="empty-state" style={{ margin: '40px auto', maxWidth: '600px' }}>
        <span><HelpCircle size={32} /></span>
        <h2>Mentor Profile Not Found</h2>
        <p>This mentor profile does not exist or may have been updated.</p>
        <Link to={currentUser?.role === 'mentor' ? "/app" : "/app/mentors"} className="button primary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> {currentUser?.role === 'mentor' ? 'Back to Mentor Dashboard' : 'Back to Mentors Directory'}
        </Link>
      </div>
    )
  }

  // Filtered lists
  const filteredSubjects = subjects.filter(
    s => subjectCategoryFilter === 'All' || s.category === subjectCategoryFilter
  )

  const filteredResources = resources.filter(
    r => resourceTypeFilter === 'All' || r.contentType === resourceTypeFilter.toLowerCase()
  )

  const visibleReviews = reviews.slice(0, reviewsPage * REVIEWS_PER_PAGE)

  // Star Rating Display Helper
  const renderStars = (score: number, max = 5) => {
    return (
      <div className="star-row" aria-label={`${score} out of 5 stars`}>
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < Math.round(score) ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    )
  }

  // Handle Review Submission (Students only)
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError('')
    setReviewNotice('')

    if (!currentUser) {
      setReviewError('Please sign in to submit your feedback.')
      return
    }

    if (currentUser.role !== 'student') {
      setReviewError('Only authenticated students can submit mentor reviews.')
      return
    }

    if (editingReviewId) {
      // Student is updating their own review
      const res = mentorStore.updateReview(currentUser, editingReviewId, {
        rating: studentRating,
        feedback: studentFeedback,
        category: studentCategory,
      })
      if (!res.success) {
        setReviewError(res.error || 'Failed to update review.')
        return
      }
      setReviewNotice('Your review has been updated successfully.')
      setEditingReviewId(null)
    } else {
      // New review
      const res = mentorStore.addReview(currentUser, mentor.id, {
        rating: studentRating,
        feedback: studentFeedback,
        category: studentCategory,
      })
      if (!res.success) {
        setReviewError(res.error || 'Failed to submit review.')
        return
      }
      setReviewNotice('Thank you! Your feedback has been published.')
    }

    setStudentFeedback('')
    reloadData()
  }

  // Student deletes their own review
  const handleDeleteMyReview = (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return
    const res = mentorStore.deleteReview(currentUser, reviewId)
    if (!res.success) {
      alert(res.error || 'Unable to delete review.')
      return
    }
    reloadData()
  }

  // Report Review (Mentor or user reports a review for moderation)
  const handleReportReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportTargetReview || !reportReason.trim()) return

    const res = mentorStore.reportReview(currentUser, reportTargetReview.id, reportReason)
    if (!res.success) {
      alert(res.error || 'Failed to file report.')
      return
    }
    setReportTargetReview(null)
    setReportReason('')
    reloadData()
    window.dispatchEvent(
      new CustomEvent('myraah-message', {
        detail: 'Report submitted for independent platform review. Thank you for maintaining community integrity.',
      })
    )
  }

  // Ask Doubt
  const handleAskDoubt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!doubtQuestion.trim()) return
    const res = mentorStore.askDoubt(currentUser, mentor.id, {
      question: doubtQuestion,
      category: doubtCategory,
    })
    if (!res.success) {
      alert(res.error || 'Failed to submit doubt.')
      return
    }
    setDoubtQuestion('')
    setShowConnectModal(null)
    reloadData()
    window.dispatchEvent(
      new CustomEvent('myraah-message', {
        detail: `Your doubt has been submitted to ${mentor.name}. You will be notified when they reply.`,
      })
    )
  }

  // Request Session
  const handleRequestSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionTopic.trim() || !sessionDate) {
      alert('Please fill out the topic and date.')
      return
    }
    const res = mentorStore.requestSession(currentUser, mentor.id, {
      topic: sessionTopic,
      mode: sessionMode,
      scheduledDate: sessionDate,
    })
    if (!res.success) {
      alert(res.error || 'Failed to request session.')
      return
    }
    setSessionTopic('')
    setSessionDate('')
    setShowConnectModal(null)
    reloadData()
    window.dispatchEvent(
      new CustomEvent('myraah-message', {
        detail: `Guidance session requested with ${mentor.name} on ${sessionDate}. Check your schedule tab.`,
      })
    )
  }

  // Copy Profile Link
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    window.dispatchEvent(
      new CustomEvent('myraah-message', {
        detail: `Portfolio link copied to clipboard! Share with students or parents.`,
      })
    )
  }

  return (
    <div className="mentor-portfolio-page">
      {/* Back button & Role indicator */}
      <div className="portfolio-top-nav">
        {isOwner ? (
          <Link to="/app" className="subtle-link back-link">
            <ArrowLeft size={16} /> Back to Mentor Dashboard
          </Link>
        ) : (
          <Link to="/app/mentors" className="subtle-link back-link">
            <ArrowLeft size={16} /> Mentors Directory
          </Link>
        )}
        <div className="portfolio-top-actions">
          {isOwner && (
            <button
              type="button"
              className={`preview-student-toggle ${previewAsStudent ? 'active' : ''}`}
              onClick={() => setPreviewAsStudent(!previewAsStudent)}
              title="Preview how students view your profile"
            >
              <Eye size={14} />
              <span>{previewAsStudent ? 'Exit Student Preview' : 'Preview Student View'}</span>
            </button>
          )}
          <button
            type="button"
            className={`low-bandwidth-toggle ${lowBandwidthMode ? 'active' : ''}`}
            onClick={() => setLowBandwidthMode(!lowBandwidthMode)}
            title="Optimized for slow 2G/3G rural networks"
          >
            <Wifi size={14} />
            <span>{lowBandwidthMode ? 'Low-Data Mode ON' : 'Low-Bandwidth Mode'}</span>
          </button>
          <button type="button" className="icon-button" onClick={handleShare} title="Share public profile">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          {isOwner && (
            <>
              <button
                type="button"
                className="button small-secondary"
                onClick={() => {
                  setStudioEditingLesson(null)
                  setShowStudioModal(true)
                }}
                title="Teach Me Anything — Create 30–60s micro-lessons"
              >
                <Sparkles size={14} /> Create Sample Lesson
              </button>
              <button
                type="button"
                className="button small-primary"
                onClick={() => setShowEditModal(true)}
              >
                Edit My Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. MENTOR PROFILE HEADER */}
      <header className="mentor-hero-card">
        <div className="mentor-hero-layout">
          <div className="mentor-avatar-box">
            {mentor.photoUrl && !lowBandwidthMode ? (
              <img
                src={mentor.photoUrl}
                alt={mentor.name}
                className="mentor-hero-img"
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <div className="mentor-avatar-fallback">
                {mentor.name.charAt(0).toUpperCase()}
              </div>
            )}
            {mentor.verified && (
              <span className="verified-badge-chip" title="Account credentials verified by MyRaah platform">
                <ShieldCheck size={14} /> Verified Mentor
              </span>
            )}
          </div>

          <div className="mentor-hero-main">
            <div className="mentor-hero-name-row">
              <h1>{mentor.name}</h1>
              {mentor.acceptingMentees ? (
                <span className="status-pill status-open" title="Currently accepting student guidance requests">
                  <span className="pulse-dot" /> Open for Guidance
                </span>
              ) : (
                <span className="status-pill status-busy">
                  <Clock size={12} /> Schedule Full
                </span>
              )}
            </div>

            <p className="mentor-hero-title">{mentor.headline}</p>

            {/* Qualifications & Education summary */}
            <div className="mentor-cred-tags">
              <span className="cred-item">
                <GraduationCap size={15} /> {mentor.education}
              </span>
              {mentor.experienceYears > 0 && (
                <span className="cred-item">
                  <Award size={15} /> {mentor.experienceYears}+ Years Practical Experience
                </span>
              )}
              {mentor.location && (
                <span className="cred-item">
                  <MapPin size={15} /> {mentor.location}
                </span>
              )}
              <span className="cred-item">
                <Calendar size={15} /> Mentor Since {mentor.memberSince}
              </span>
            </div>

            {/* Short Bio */}
            <p className="mentor-hero-bio">{mentor.bio}</p>

            {/* Languages & Teaching Modes */}
            <div className="mentor-mode-lang-bar">
              <div className="meta-group">
                <span className="meta-label">
                  <Languages size={14} /> Languages Supported:
                </span>
                <div className="pill-list">
                  {mentor.languages.map(lang => (
                    <span key={lang} className="lang-pill">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="meta-group">
                <span className="meta-label">
                  <Radio size={14} /> Teaching Modes:
                </span>
                <div className="pill-list">
                  {mentor.teachingModes.map(mode => {
                    const info = MODE_LABELS[mode]
                    const Icon = info.icon
                    return (
                      <span key={mode} className="mode-pill" title={info.label}>
                        <Icon size={12} /> {info.label.split('&')[0]}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Connect CTA */}
            <div className="mentor-hero-actions">
              {(!isOwner || previewAsStudent) ? (
                <>
                  <button
                    type="button"
                    className="button primary"
                    disabled={!mentor.acceptingMentees}
                    onClick={() => setShowConnectModal('doubt')}
                  >
                    <HelpCircle size={16} /> Ask this Mentor a Doubt
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    disabled={!mentor.acceptingMentees}
                    onClick={() => setShowConnectModal('session')}
                  >
                    <Calendar size={16} /> Request Mentoring Session
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit My Profile & Availability
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setStudioEditingLesson(null)
                      setShowStudioModal(true)
                    }}
                  >
                    <Sparkles size={15} /> Create Sample Lesson (30–60s)
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowAddSubjectModal(true)}
                  >
                    <Plus size={15} /> Add Subject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* 2. TEACHING EXPERTISE & SUBJECTS ("What I Teach & Help With") */}
      <section className="portfolio-section" id="subjects-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURRICULUM & GUIDANCE DOMAINS</span>
            <h2>What I Teach & Help With</h2>
            <p>Students can reach out directly for guidance in any of these selected areas.</p>
          </div>
          {isOwner && (
            <button
              type="button"
              className="button small-primary"
              onClick={() => setShowAddSubjectModal(true)}
            >
              <Plus size={14} /> Add Subject / Skill
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="portfolio-category-filter">
          <button
            type="button"
            className={`filter-chip ${subjectCategoryFilter === 'All' ? 'active' : ''}`}
            onClick={() => setSubjectCategoryFilter('All')}
          >
            All Subjects ({subjects.length})
          </button>
          {Array.from(new Set(subjects.map(s => s.category))).map(cat => (
            <button
              type="button"
              key={cat}
              className={`filter-chip ${subjectCategoryFilter === cat ? 'active' : ''}`}
              onClick={() => setSubjectCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredSubjects.length > 0 ? (
          <div className="subjects-grid">
            {filteredSubjects.map(sub => {
              const Icon = CATEGORY_ICONS[sub.category] || BookOpen
              return (
                <div key={sub.id} className="subject-card">
                  <div className="subject-card-head">
                    <span className="subject-icon">
                      <Icon size={18} />
                    </span>
                    <span className="subject-category">{sub.category}</span>
                    {isOwner && (
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          if (window.confirm('Remove this subject?')) {
                            mentorStore.deleteSubject(currentUser, sub.id)
                            reloadData()
                          }
                        }}
                        title="Remove subject"
                        aria-label="Remove subject"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <h3>{sub.title}</h3>
                  <span className="subject-level">Target: {sub.level}</span>
                  <p>{sub.description}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span><BookOpen size={24} /></span>
            <h3>No subjects listed in this category</h3>
            <p>The mentor has not published subjects for this category yet.</p>
          </div>
        )}
      </section>

      {/* 3. DOUBTS SOLVED & MENTORING STATISTICS */}
      <section className="portfolio-section" id="stats-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">VERIFIED PLATFORM METRICS</span>
            <h2>Doubts Solved & Mentoring Statistics</h2>
            <p>Calculated dynamically from verified database records. Never manually inflated.</p>
          </div>
        </div>

        {stats.isNewMentor ? (
          <div className="new-mentor-callout">
            <Sparkles size={24} />
            <div>
              <h3>Welcome our new mentor!</h3>
              <p>
                {mentor.name} recently joined MyRaah to support rural students. Their resolved doubts and completed session statistics will appear here automatically as they interact with students.
              </p>
            </div>
          </div>
        ) : (
          <div className="mentor-stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.doubtsResolved}</span>
              <span className="stat-label">Total Doubts Resolved</span>
              <small>Verified answered student questions</small>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.studentsHelped}</span>
              <span className="stat-label">Total Students Helped</span>
              <small>Unique rural learners supported</small>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.sessionsCompleted}</span>
              <span className="stat-label">Completed Sessions</span>
              <small>1-on-1 & small group guidance</small>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.resourcesPublished}</span>
              <span className="stat-label">Learning Resources</span>
              <small>Videos, audios & illustrated notes</small>
            </div>
            <div className="stat-card highlight-rating">
              <div className="rating-num-row">
                <span className="stat-number">{stats.averageRating > 0 ? stats.averageRating : '—'}</span>
                <span className="star-icon">★</span>
              </div>
              <span className="stat-label">Average Student Rating</span>
              <small>From {stats.totalReviews} verified student reviews</small>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.totalReviews}</span>
              <span className="stat-label">Published Reviews</span>
              <small>Student-driven transparent feedback</small>
            </div>
          </div>
        )}
      </section>

      {/* 4. TEACH ME ANYTHING — SAMPLE LESSON STUDIO & SHOWCASE ("Learn From My Teaching") */}
      <SampleLessonsSection
        mentorId={mentor.id}
        currentUser={currentUser}
        isOwner={isOwner && !previewAsStudent}
        onOpenStudio={lesson => {
          setStudioEditingLesson(lesson || null)
          setShowStudioModal(true)
        }}
        lowBandwidthMode={lowBandwidthMode}
      />

      {/* 5. SAMPLE EXPLANATIONS & TEACHING DEMONSTRATIONS ("Full Study Notes & Demonstrations") */}
      <section className="portfolio-section" id="demonstrations-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PUBLIC STUDY NOTES & EXTENDED RESOURCES</span>
            <h2>Full Study Notes & Demonstrations</h2>
            <p>
              Preview sample explanations, audio lessons in Hindi, and step-by-step doubt solutions without needing to contact first.
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              className="button small-primary"
              onClick={() => setShowAddResourceModal(true)}
            >
              <Plus size={14} /> Publish Teaching Sample
            </button>
          )}
        </div>

        {/* Content Type Filter */}
        <div className="portfolio-category-filter">
          {['All', 'Video', 'Audio', 'Notes', 'Text'].map(type => (
            <button
              type="button"
              key={type}
              className={`filter-chip ${resourceTypeFilter === type ? 'active' : ''}`}
              onClick={() => setResourceTypeFilter(type)}
            >
              {type === 'All' ? 'All Samples' : `${type}s`}
            </button>
          ))}
        </div>

        {filteredResources.length > 0 ? (
          <div className="resources-grid">
            {filteredResources.map(res => {
              return (
                <article key={res.id} className="resource-card">
                  <div className="resource-card-top">
                    <span className={`content-badge badge-${res.contentType}`}>
                      {res.contentType === 'video' && <Video size={13} />}
                      {res.contentType === 'audio' && <Volume2 size={13} />}
                      {(res.contentType === 'notes' || res.contentType === 'text') && <BookOpen size={13} />}
                      {res.contentType.toUpperCase()} · {res.language}
                    </span>
                    {res.duration && <span className="resource-duration">{res.duration}</span>}
                    {res.lowBandwidthAvailable && (
                      <span className="low-data-pill" title="Optimized for slow mobile networks">
                        <Wifi size={11} /> Low-Data
                      </span>
                    )}
                  </div>

                  <h3>{res.title}</h3>
                  <p className="resource-topic">{res.topic}</p>
                  <p className="resource-summary">{res.summary}</p>

                  <div className="resource-card-footer">
                    <small className="resource-date">Published {res.date}</small>
                    <div className="resource-actions">
                      <button
                        type="button"
                        className="button small-primary"
                        onClick={() => setActiveResource(res)}
                      >
                        {res.contentType === 'video' ? <Play size={14} /> : null}
                        {res.contentType === 'audio' ? <Volume2 size={14} /> : null}
                        {res.contentType === 'notes' || res.contentType === 'text' ? <BookOpen size={14} /> : null}
                        {res.contentType === 'video' ? 'Watch Preview' : res.contentType === 'audio' ? 'Listen to Audio' : 'Read Notes'}
                      </button>
                      {isOwner && (
                        <button
                          type="button"
                          className="delete-item-btn"
                          onClick={() => {
                            if (window.confirm('Delete this published resource?')) {
                              mentorStore.deleteResource(currentUser, res.id)
                              reloadData()
                            }
                          }}
                          title="Delete resource"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span><Sparkles size={24} /></span>
            <h3>No teaching samples in this format</h3>
            <p>Try switching to another content filter above.</p>
          </div>
        )}
      </section>

      {/* 5. ABOUT THE MENTOR — INTRODUCTION VIDEO ("Meet Your Mentor") */}
      <section className="portfolio-section" id="meet-mentor-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PERSONAL INTRODUCTION</span>
            <h2>Meet Your Mentor</h2>
            <p>Get to know who you will be learning from, their background, and how they explain difficult topics.</p>
          </div>
        </div>

        <div className="intro-showcase-card">
          {mentor.introVideo?.videoUrl && !lowBandwidthMode ? (
            <div className="intro-video-wrapper">
              <div className="video-container">
                <video
                  controls
                  poster={mentor.introVideo.thumbnailUrl}
                  preload="metadata"
                  className="intro-video-player"
                >
                  <source src={mentor.introVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {mentor.introVideo.captionText && (
                <div className="video-caption-bar">
                  <Languages size={15} />
                  <span>{mentor.introVideo.captionText}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="written-intro-box">
              <div className="written-intro-head">
                <MessageCircle size={22} />
                <h3>Welcome Message From {mentor.name}</h3>
                <span className="demo-label">LOW-BANDWIDTH FRIENDLY</span>
              </div>
              <blockquote className="written-intro-quote">
                "{mentor.writtenIntro || mentor.bio}"
              </blockquote>
            </div>
          )}

          <div className="intro-points-grid">
            <div className="intro-point">
              <strong>1. Background & Journey</strong>
              <p>{mentor.education} with extensive experience working directly with rural and semi-urban learners.</p>
            </div>
            <div className="intro-point">
              <strong>2. How I Explain Topics</strong>
              <p>Simple language, real-world Indian examples, practical checklists, and zero jargon.</p>
            </div>
            <div className="intro-point">
              <strong>3. Accessible Format</strong>
              <p>Comfortable answering doubts via voice notes on phone for students with low network connectivity.</p>
            </div>
            <div className="intro-point">
              <strong>4. Student Well-being</strong>
              <p>Empathetic guidance without judging academic scores. Every student can find a suitable path.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STUDENT FEEDBACK & REVIEWS — CRITICAL REQUIREMENT */}
      <section className="portfolio-section" id="reviews-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">STUDENT-DRIVEN REVIEWS & AUDIT INTEGRITY</span>
            <h2>Student Feedback & Reviews</h2>
            <p>
              Genuine student feedback. <strong>Notice:</strong> To protect review integrity, mentors cannot delete, edit, or suppress reviews.
            </p>
          </div>
        </div>

        {/* Rating Breakdown & Average */}
        <div className="review-summary-block">
          <div className="overall-score-panel">
            <span className="big-score">{stats.averageRating > 0 ? stats.averageRating : '—'}</span>
            {renderStars(stats.averageRating)}
            <p>Based on {stats.totalReviews} published student reviews</p>
          </div>

          <div className="rating-bars-panel">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = stats.ratingDistribution[stars] || 0
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
              return (
                <div key={stars} className="rating-bar-row">
                  <span className="bar-label">{stars} Star</span>
                  <div className="bar-track">
                    <span className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Student Submission Form: Shown ONLY if user is a student */}
        {currentUser?.role === 'student' ? (
          <div className="submit-review-card">
            <h3>{editingReviewId ? 'Edit Your Review' : 'Share Your Experience With This Mentor'}</h3>
            <p className="fineprint">
              Your honest feedback helps other students choose the right guidance. Only you can edit or delete this review.
            </p>

            {reviewError && <div className="form-error" role="alert">{reviewError}</div>}
            {reviewNotice && <div className="form-notice" role="status">{reviewNotice}</div>}

            <form onSubmit={handleReviewSubmit}>
              <div className="rating-input-row">
                <span className="field-label">Your Star Rating:</span>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      className={`star-pick-btn ${num <= studentRating ? 'active' : ''}`}
                      onClick={() => setStudentRating(num)}
                      aria-label={`${num} stars`}
                    >
                      <Star size={22} className={num <= studentRating ? 'star-filled' : 'star-empty'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-grid" style={{ marginTop: '12px' }}>
                <label className="field">
                  <span>Feedback Category</span>
                  <select
                    value={studentCategory}
                    onChange={e => setStudentCategory(e.target.value as ReviewCategory)}
                  >
                    <option value="Clarity">Clarity of Explanation</option>
                    <option value="Helpfulness">Helpfulness & Practical Value</option>
                    <option value="Patience">Patience & Understanding</option>
                    <option value="Communication">Regional Language Communication</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Written Feedback <b className="required">*</b></span>
                <textarea
                  rows={3}
                  value={studentFeedback}
                  onChange={e => setStudentFeedback(e.target.value)}
                  placeholder="How did this mentor help you? Did they explain difficult doubts clearly?"
                  required
                />
              </label>

              <div className="form-actions">
                {editingReviewId && (
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setEditingReviewId(null)
                      setStudentFeedback('')
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button type="submit" className="button primary">
                  {editingReviewId ? 'Update My Review' : 'Publish My Review'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="student-auth-prompt">
            <UserCheck size={18} />
            <span>
              {currentUser?.role === 'mentor'
                ? 'Mentors cannot submit or alter reviews. Mentors may report abusive feedback using the "Report Review" option.'
                : 'Sign in as a student to submit genuine feedback on this mentor.'}
            </span>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length > 0 ? (
            visibleReviews.map(rev => {
              const isMyReview =
                currentUser?.role === 'student' &&
                (rev.studentId === currentUser.id || rev.studentId === currentUser.email)

              return (
                <article key={rev.id} className="review-card">
                  <div className="review-card-head">
                    <div className="reviewer-info">
                      <span className="reviewer-avatar">
                        {rev.studentName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{rev.studentName}</strong>
                        <div className="review-meta-line">
                          {renderStars(rev.rating)}
                          <span className="review-category-pill">{rev.category}</span>
                          {rev.verifiedInteraction && (
                            <span className="verified-interaction-tag" title="Verified mentoring interaction on MyRaah">
                              <ShieldCheck size={12} /> Verified Interaction
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="review-actions-menu">
                      <small className="review-date">{rev.createdAt}</small>

                      {/* Student's own review actions */}
                      {isMyReview && (
                        <div className="my-review-controls">
                          <button
                            type="button"
                            className="quiet-link"
                            onClick={() => {
                              setEditingReviewId(rev.id)
                              setStudentRating(rev.rating)
                              setStudentFeedback(rev.feedback)
                              setStudentCategory(rev.category)
                              window.scrollTo({ top: document.getElementById('reviews-section')?.offsetTop, behavior: 'smooth' })
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="quiet-link text-danger"
                            onClick={() => handleDeleteMyReview(rev.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      {/* Independent report review for mentors and other users */}
                      <button
                        type="button"
                        className="report-flag-btn"
                        onClick={() => {
                          setReportTargetReview(rev)
                          setReportReason('')
                        }}
                        title="Report inappropriate review to platform administrators"
                        aria-label="Report review"
                      >
                        <Flag size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="review-feedback-text">{rev.feedback}</p>

                  {rev.reported && (
                    <div className="report-notice-banner">
                      <AlertTriangle size={12} />
                      <span>This review has been flagged for administrative review. It remains visible per platform policy.</span>
                    </div>
                  )}
                </article>
              )
            })
          ) : (
            <div className="empty-state">
              <span><MessageSquare size={24} /></span>
              <h3>No reviews yet</h3>
              <p>Be the first student to learn with {mentor.name} and share your experience!</p>
            </div>
          )}

          {reviews.length > visibleReviews.length && (
            <div className="load-more-wrap">
              <button
                type="button"
                className="button secondary"
                onClick={() => setReviewsPage(prev => prev + 1)}
              >
                Load More Reviews ({reviews.length - visibleReviews.length} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Resource Viewer Modal */}
      {activeResource && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setActiveResource(null) }}>
          <section className="modal resource-viewer-dialog" role="dialog" aria-modal="true" aria-label={activeResource.title}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{activeResource.contentType.toUpperCase()} PREVIEW · {activeResource.language}</span>
                <h2>{activeResource.title}</h2>
              </div>
              <button className="icon-button" onClick={() => setActiveResource(null)} aria-label="Close resource preview">
                <X size={19} />
              </button>
            </div>
            <div className="modal-body">
              <p className="resource-topic-meta"><strong>Topic:</strong> {activeResource.topic}</p>

              {activeResource.contentType === 'video' && activeResource.contentUrl && !lowBandwidthMode && (
                <div className="player-wrapper">
                  <video controls className="active-video-player" autoPlay>
                    <source src={activeResource.contentUrl} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              )}

              {activeResource.contentType === 'audio' && (
                <div className="audio-player-card">
                  <Volume2 size={32} />
                  <div>
                    <strong>Listen to Audio Explanation in {activeResource.language}</strong>
                    <p>{activeResource.summary}</p>
                    <audio controls style={{ width: '100%', marginTop: '10px' }}>
                      <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {activeResource.transcript && (
                <div className="transcript-box">
                  <h3>Transcript / Hindi Notes (Low-Data Friendly)</h3>
                  <p>{activeResource.transcript}</p>
                </div>
              )}

              {activeResource.textContent && (
                <div className="notes-content-box">
                  <h3>Study Notes & Step-by-Step Solution</h3>
                  <div className="notes-body" style={{ whiteSpace: 'pre-line' }}>
                    {activeResource.textContent}
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => {
                    setActiveResource(null)
                    setShowConnectModal('doubt')
                  }}
                >
                  Ask a Doubt About This Topic
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Connect / Ask Doubt / Book Session Modal */}
      {showConnectModal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowConnectModal(null) }}>
          <section className="modal connect-dialog" role="dialog" aria-modal="true" aria-label="Connect with Mentor">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{showConnectModal === 'doubt' ? 'ASK A QUESTION' : 'SCHEDULE GUIDANCE'}</span>
                <h2>{showConnectModal === 'doubt' ? `Ask ${mentor.name} a Doubt` : `Request Mentoring Session`}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowConnectModal(null)} aria-label="Close dialog">
                <X size={19} />
              </button>
            </div>

            <div className="modal-body">
              {showConnectModal === 'doubt' ? (
                <form onSubmit={handleAskDoubt}>
                  <p className="step-desc">
                    Type your academic, career, or scholarship doubt. {mentor.name} will respond in {mentor.languages.join(' / ')}.
                  </p>

                  <label className="field">
                    <span>Subject / Category <b className="required">*</b></span>
                    <select
                      value={doubtCategory}
                      onChange={e => setDoubtCategory(e.target.value as ExpertiseCategory)}
                    >
                      <option value="Career guidance">Career guidance & pathways</option>
                      <option value="Scholarships and schemes">Scholarships and government schemes</option>
                      <option value="School subjects and academic doubts">School subjects & doubts</option>
                      <option value="Competitive examinations">Competitive examinations</option>
                      <option value="Vocational education & skills">Vocational education & skills</option>
                      <option value="Computer skills and coding">Computer skills & coding</option>
                      <option value="Agriculture & local entrepreneurship">Agriculture & entrepreneurship</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Your Question or Doubt <b className="required">*</b></span>
                    <textarea
                      rows={4}
                      value={doubtQuestion}
                      onChange={e => setDoubtQuestion(e.target.value)}
                      placeholder="e.g. I scored 62% in Class 12 Arts. What are the best government paramedical or nursing options for me?"
                      required
                    />
                  </label>

                  <div className="modal-actions">
                    <button type="button" className="button secondary" onClick={() => setShowConnectModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="button primary">
                      Submit Doubt
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRequestSession}>
                  <p className="step-desc">
                    Mentor availability: <strong>{mentor.availabilityDays.join(', ')}</strong> ({mentor.availabilityHours})
                  </p>

                  <label className="field">
                    <span>Session Topic <b className="required">*</b></span>
                    <input
                      type="text"
                      value={sessionTopic}
                      onChange={e => setSessionTopic(e.target.value)}
                      placeholder="e.g. 1-on-1 Guidance on GNM Nursing College Selection"
                      required
                    />
                  </label>

                  <div className="field-grid">
                    <label className="field">
                      <span>Preferred Mode <b className="required">*</b></span>
                      <select
                        value={sessionMode}
                        onChange={e => setSessionMode(e.target.value as TeachingMode)}
                      >
                        {mentor.teachingModes.map(m => (
                          <option key={m} value={m}>
                            {MODE_LABELS[m]?.label || m}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Preferred Date <b className="required">*</b></span>
                      <input
                        type="date"
                        value={sessionDate}
                        onChange={e => setSessionDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="button secondary" onClick={() => setShowConnectModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="button primary">
                      Request Session
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Report Review Moderation Dialog */}
      {reportTargetReview && (
        <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setReportTargetReview(null) }}>
          <section className="modal report-dialog" role="dialog" aria-modal="true" aria-label="Report Review">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">INDEPENDENT MODERATION</span>
                <h2>Report Inappropriate Feedback</h2>
              </div>
              <button className="icon-button" onClick={() => setReportTargetReview(null)} aria-label="Close dialog">
                <X size={19} />
              </button>
            </div>
            <form onSubmit={handleReportReviewSubmit} className="modal-body">
              <p className="fineprint">
                Review integrity is protected on MyRaah. Mentors cannot delete reviews directly. Platform administrators will independently audit reports against community guidelines.
              </p>

              <div className="flagged-preview-box">
                <strong>Review by: {reportTargetReview.studentName}</strong>
                <p>"{reportTargetReview.feedback}"</p>
              </div>

              <label className="field">
                <span>Reason for Reporting <b className="required">*</b></span>
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Explain why this review violates platform rules (e.g. abusive language, spam, non-student account)..."
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="button secondary" onClick={() => setReportTargetReview(null)}>
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Submit Report for Moderation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Add Subject Modal for Mentor */}
      {showAddSubjectModal && (
        <AddSubjectModal
          currentUser={currentUser}
          mentorId={mentor.id}
          onClose={() => setShowAddSubjectModal(false)}
          onAdded={() => {
            setShowAddSubjectModal(false)
            reloadData()
          }}
        />
      )}

      {/* Add Resource Modal for Mentor */}
      {showAddResourceModal && (
        <AddResourceModal
          currentUser={currentUser}
          mentorId={mentor.id}
          onClose={() => setShowAddResourceModal(false)}
          onAdded={() => {
            setShowAddResourceModal(false)
            reloadData()
          }}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && currentUser && (
        <MentorEditModal
          user={currentUser}
          mentor={mentor}
          onClose={() => setShowEditModal(false)}
          onOpenSampleStudio={() => {
            setShowEditModal(false)
            setStudioEditingLesson(null)
            setShowStudioModal(true)
          }}
          onSaved={updated => {
            setMentor(updated)
            reloadData()
          }}
        />
      )}

      {/* Sample Lesson Studio Modal (Teach Me Anything) */}
      {showStudioModal && currentUser && (
        <SampleLessonStudioModal
          currentUser={currentUser}
          mentorId={mentor.id}
          editingLesson={studioEditingLesson}
          onClose={() => {
            setShowStudioModal(false)
            setStudioEditingLesson(null)
          }}
          onLessonPublished={() => {
            setShowStudioModal(false)
            setStudioEditingLesson(null)
            reloadData()
          }}
        />
      )}
    </div>
  )
}

function AddSubjectModal({
  currentUser,
  mentorId,
  onClose,
  onAdded,
}: {
  currentUser: User | null
  mentorId: string
  onClose: () => void
  onAdded: () => void
}) {
  const [category, setCategory] = useState<ExpertiseCategory>('Career guidance')
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState('Class 10 & 12')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const res = mentorStore.addSubject(currentUser, mentorId, {
      category,
      title: title.trim(),
      level: level.trim(),
      description: description.trim(),
    })

    if (!res.success) {
      alert(res.error || 'Failed to add subject.')
      return
    }
    onAdded()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-label="Add Teaching Subject">
        <div className="modal-heading">
          <h2>Add What You Teach & Help With</h2>
          <button className="icon-button" onClick={onClose}><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={e => setCategory(e.target.value as ExpertiseCategory)}>
              <option value="Career guidance">Career guidance and career exploration</option>
              <option value="Scholarships and schemes">Scholarships and government education schemes</option>
              <option value="School subjects and academic doubts">School subjects and academic doubts</option>
              <option value="Competitive examinations">Competitive examinations</option>
              <option value="Vocational education & skills">Vocational education and skill development</option>
              <option value="Computer skills and coding">Computer skills, coding and digital literacy</option>
              <option value="Internships and employment">Internships, apprenticeships and employment preparation</option>
              <option value="Interview preparation & communication">Interview preparation, CV writing and communication skills</option>
              <option value="Agriculture & local entrepreneurship">Agriculture, entrepreneurship and local career opportunities</option>
            </select>
          </label>

          <label className="field">
            <span>Subject / Topic Title <b className="required">*</b></span>
            <input
              type="text"
              placeholder="e.g. ITI Electrician Trade & Apprenticeships"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Target Student Level</span>
            <input
              type="text"
              placeholder="e.g. Class 10 Pass / ITI Aspirants"
              value={level}
              onChange={e => setLevel(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Brief Description of How You Help <b className="required">*</b></span>
            <textarea
              rows={3}
              placeholder="Explain what practical guidance or doubts you will solve..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary">Publish Subject</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AddResourceModal({
  currentUser,
  mentorId,
  onClose,
  onAdded,
}: {
  currentUser: User | null
  mentorId: string
  onClose: () => void
  onAdded: () => void
}) {
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState<ExpertiseCategory>('Career guidance')
  const [language, setLanguage] = useState('Hindi')
  const [contentType, setContentType] = useState<ResourceContentType>('notes')
  const [contentUrl, setContentUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [summary, setSummary] = useState('')
  const [textContent, setTextContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) return

    const res = mentorStore.addResource(currentUser, mentorId, {
      title: title.trim(),
      topic: topic.trim() || title.trim(),
      category,
      language: language.trim(),
      contentType,
      contentUrl: contentUrl.trim() || undefined,
      duration: duration.trim() || undefined,
      summary: summary.trim(),
      textContent: textContent.trim() || undefined,
      lowBandwidthAvailable: true,
    })

    if (!res.success) {
      alert(res.error || 'Failed to publish resource.')
      return
    }
    onAdded()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-label="Publish Teaching Demonstration">
        <div className="modal-heading">
          <h2>Publish Teaching Demonstration / Sample</h2>
          <button className="icon-button" onClick={onClose}><X size={19} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="field-grid">
            <label className="field">
              <span>Title <b className="required">*</b></span>
              <input
                type="text"
                placeholder="e.g. Free Govt Scholarships for Class 10 Students in 2025"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Specific Topic</span>
              <input
                type="text"
                placeholder="e.g. Eligibility & Documents for Pre-Matric Scheme"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Category</span>
              <select value={category} onChange={e => setCategory(e.target.value as ExpertiseCategory)}>
                <option value="Career guidance">Career guidance and career exploration</option>
                <option value="Scholarships and schemes">Scholarships and government education schemes</option>
                <option value="School subjects and academic doubts">School subjects and academic doubts</option>
                <option value="Competitive examinations">Competitive examinations</option>
                <option value="Vocational education & skills">Vocational education and skill development</option>
                <option value="Computer skills and coding">Computer skills, coding and digital literacy</option>
                <option value="Internships and employment">Internships, apprenticeships and employment preparation</option>
                <option value="Interview preparation & communication">Interview preparation, CV writing and communication skills</option>
                <option value="Agriculture & local entrepreneurship">Agriculture, entrepreneurship and local career opportunities</option>
              </select>
            </label>

            <label className="field">
              <span>Estimated Duration (e.g. 5:20)</span>
              <input
                type="text"
                placeholder="e.g. 8 mins"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </label>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>Format <b className="required">*</b></span>
              <select value={contentType} onChange={e => setContentType(e.target.value as ResourceContentType)}>
                <option value="notes">Step-by-Step Text Notes (Low-Data)</option>
                <option value="audio">Audio Lesson (Hindi/Regional)</option>
                <option value="video">Short Video Demonstration</option>
                <option value="text">Solution to Common Doubt</option>
              </select>
            </label>

            <label className="field">
              <span>Language <b className="required">*</b></span>
              <input
                type="text"
                placeholder="e.g. Hindi, Rajasthani, English"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Summary & Learning Goal <b className="required">*</b></span>
            <input
              type="text"
              placeholder="What will a rural student learn from this sample?"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              required
            />
          </label>

          {contentType === 'video' && (
            <label className="field">
              <span>Video Link (MP4 or streaming URL)</span>
              <input
                type="url"
                placeholder="https://..."
                value={contentUrl}
                onChange={e => setContentUrl(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span>Detailed Written Notes / Solution (Accessible for Low-Bandwidth Users)</span>
            <textarea
              rows={4}
              placeholder="Provide the complete written steps, eligibility criteria, or doubt explanation..."
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary">Publish to Portfolio</button>
          </div>
        </form>
      </section>
    </div>
  )
}
