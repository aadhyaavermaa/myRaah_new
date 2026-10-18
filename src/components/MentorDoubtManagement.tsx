import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flag,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Video,
  Volume2,
  X,
} from 'lucide-react'
import type {
  DoubtFlagCategory,
  DoubtRecord,
  User,
} from '../types'
import { mentorStore } from '../services/mentorStore'
import { mediaStorage } from '../services/mediaStorage'

interface MentorDoubtManagementProps {
  mentorId: string
  currentUser: User | null
  onDoubtsUpdated?: () => void
}

const FLAG_CATEGORIES: { id: DoubtFlagCategory; label: string; desc: string }[] = [
  {
    id: 'private_contact_solicitation',
    label: 'Asking for Private Phone / WhatsApp / Personal Meeting',
    desc: 'Violates platform safety protocol by attempting to move offline.',
  },
  {
    id: 'abusive',
    label: 'Abusive or Disrespectful Language',
    desc: 'Contains vulgarity, insults, or demeaning remarks.',
  },
  {
    id: 'sexually_explicit',
    label: 'Sexually Explicit or Inappropriate Solicitation',
    desc: 'Contains harassment or non-academic sexual content.',
  },
  {
    id: 'threatening',
    label: 'Threatening or Harassing Conduct',
    desc: 'Threats of violence, intimidation, or persistent stalking.',
  },
  {
    id: 'unrelated',
    label: 'Commercial Spam or Non-Educational Content',
    desc: 'Advertisements, irrelevant jokes, or non-career promotion.',
  },
]

export default function MentorDoubtManagement({
  mentorId,
  currentUser,
  onDoubtsUpdated,
}: MentorDoubtManagementProps) {
  const [doubts, setDoubts] = useState<DoubtRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered' | 'under_review'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Active Doubt Modal / Drawer state
  const [selectedDoubt, setSelectedDoubt] = useState<DoubtRecord | null>(null)
  const [activeMediaUrls, setActiveMediaUrls] = useState<Record<string, string>>({})

  // Answer Composer state
  const [answerText, setAnswerText] = useState('')
  const [answerMediaType, setAnswerMediaType] = useState<'text' | 'audio' | 'video'>('text')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [composerError, setComposerError] = useState('')

  // Flag / Moderation Modal state
  const [flaggingDoubt, setFlaggingDoubt] = useState<DoubtRecord | null>(null)
  const [flagCategory, setFlagCategory] = useState<DoubtFlagCategory>('private_contact_solicitation')
  const [flagReason, setFlagReason] = useState('')
  const [flagError, setFlagError] = useState('')

  // Educational image lightbox
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  const loadDoubts = () => {
    const list = mentorStore.getDoubts(mentorId)
    setDoubts(list)
    onDoubtsUpdated?.()
  }

  useEffect(() => {
    loadDoubts()
  }, [mentorId])

  // Resolve media URLs for answered doubts with IndexedDB keys or sample URLs
  useEffect(() => {
    let isMounted = true
    const urlsToRevoke: string[] = []

    const resolveMedia = async () => {
      const urlMap: Record<string, string> = {}
      for (const d of doubts) {
        if (d.answerMediaUrl) {
          urlMap[d.id] = d.answerMediaUrl
        } else if (d.answerMediaKey) {
          try {
            const blob = await mediaStorage.getMediaBlob(d.answerMediaKey)
            if (blob && isMounted) {
              const objUrl = URL.createObjectURL(blob)
              urlsToRevoke.push(objUrl)
              urlMap[d.id] = objUrl
            }
          } catch (err) {
            console.error('Failed to load answer media blob', d.id, err)
          }
        }
      }
      if (isMounted) {
        setActiveMediaUrls(urlMap)
      }
    }

    resolveMedia()

    return () => {
      isMounted = false
      urlsToRevoke.forEach(u => URL.revokeObjectURL(u))
    }
  }, [doubts])

  // Clean up answer composer preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreviewUrl)
      }
    }
  }, [mediaPreviewUrl])

  // Counts
  const pendingCount = doubts.filter(d => d.status === 'pending').length
  const answeredCount = doubts.filter(d => d.status === 'answered' || d.status === 'resolved').length
  const underReviewCount = doubts.filter(d => d.status === 'under_review').length

  // Filtered doubts
  const filteredDoubts = doubts.filter(d => {
    // Status filter
    if (statusFilter === 'pending' && d.status !== 'pending') return false
    if (statusFilter === 'answered' && d.status !== 'answered' && d.status !== 'resolved') return false
    if (statusFilter === 'under_review' && d.status !== 'under_review') return false

    // Category filter
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesQ = d.question.toLowerCase().includes(query)
      const matchesSubject = (d.subject || '').toLowerCase().includes(query)
      const matchesTopic = (d.topic || '').toLowerCase().includes(query)
      const matchesStudent = (d.studentName || '').toLowerCase().includes(query)
      const matchesCategory = d.category.toLowerCase().includes(query)
      if (!matchesQ && !matchesSubject && !matchesTopic && !matchesStudent && !matchesCategory) {
        return false
      }
    }

    return true
  })

  // Open doubt details modal
  const handleOpenDoubt = (doubt: DoubtRecord) => {
    setSelectedDoubt(doubt)
    setAnswerText(doubt.answer || '')
    setAnswerMediaType(doubt.answerMediaType || 'text')
    setMediaFile(null)
    setMediaPreviewUrl(doubt.answerMediaUrl || activeMediaUrls[doubt.id] || null)
    setComposerError('')
  }

  // Handle media file upload in composer
  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComposerError('')
    const file = e.target.files?.[0]
    if (!file) return

    const isAudio = file.type.startsWith('audio/')
    const isVideo = file.type.startsWith('video/')

    if (!isAudio && !isVideo) {
      setComposerError('Supported formats: MP3, WAV, M4A, OGG for audio; MP4, WebM for video.')
      return
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024
    if (file.size > maxSize) {
      setComposerError(
        `File is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum allowed is ${
          isVideo ? '50MB for video' : '20MB for audio'
        }.`
      )
      return
    }

    // Revoke previous preview
    if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreviewUrl)
    }

    const preview = URL.createObjectURL(file)
    setMediaFile(file)
    setMediaPreviewUrl(preview)
    setAnswerMediaType(isVideo ? 'video' : 'audio')
  }

  // Preset demo clip picker for testing audio/video answers
  const handleSelectDemoClip = (type: 'audio' | 'video') => {
    setComposerError('')
    if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreviewUrl)
    }

    if (type === 'audio') {
      setMediaFile(null)
      setMediaPreviewUrl('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
      setAnswerMediaType('audio')
    } else {
      setMediaFile(null)
      setMediaPreviewUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
      setAnswerMediaType('video')
    }
  }

  // Remove attached media in composer
  const handleRemoveComposerMedia = () => {
    if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreviewUrl)
    }
    setMediaFile(null)
    setMediaPreviewUrl(null)
    setAnswerMediaType('text')
  }

  // Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDoubt) return

    setComposerError('')
    if (!answerText.trim() || answerText.trim().length < 10) {
      setComposerError('Please provide a helpful written academic explanation (at least 10 characters).')
      return
    }

    setIsSubmittingAnswer(true)
    let mediaKey: string | undefined = undefined

    // If local file was selected, persist to IndexedDB
    if (mediaFile) {
      try {
        mediaKey = `doubt_ans_${selectedDoubt.id}_${Date.now()}`
        await mediaStorage.saveMediaBlob(mediaKey, mediaFile)
      } catch (err) {
        console.error('Failed to save answer media to IndexedDB:', err)
      }
    }

    const res = mentorStore.answerDoubt(currentUser, selectedDoubt.id, {
      answer: answerText.trim(),
      mediaType: mediaPreviewUrl ? answerMediaType : 'text',
      mediaUrl: !mediaFile && mediaPreviewUrl ? mediaPreviewUrl : undefined,
      mediaKey,
    })

    setIsSubmittingAnswer(false)

    if (res.success && res.doubt) {
      loadDoubts()
      setSelectedDoubt(res.doubt)
      window.dispatchEvent(
        new CustomEvent('myraah-message', {
          detail: `Your academic answer for ${res.doubt.studentName} has been published successfully!`,
        })
      )
    } else {
      setComposerError(res.error || 'Failed to publish answer.')
    }
  }

  // Handle Flag Doubt submission
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!flaggingDoubt) return

    setFlagError('')
    if (!flagReason.trim() || flagReason.trim().length < 8) {
      setFlagError('Please explain why this content violates academic safety rules (min 8 chars).')
      return
    }

    const res = mentorStore.flagDoubt(currentUser, flaggingDoubt.id, {
      category: flagCategory,
      reason: flagReason.trim(),
    })

    if (res.success && res.doubt) {
      loadDoubts()
      if (selectedDoubt?.id === flaggingDoubt.id) {
        setSelectedDoubt(res.doubt)
      }
      setFlaggingDoubt(null)
      setFlagReason('')
      window.dispatchEvent(
        new CustomEvent('myraah-message', {
          detail: 'Question flagged for independent administrative moderation. Content has been moved to Under Review.',
        })
      )
    } else {
      setFlagError(res.error || 'Unable to flag content.')
    }
  }

  // Restore flagged doubt to pending
  const handleUnflag = (doubtId: string) => {
    if (!window.confirm('Restore this question to active status?')) return

    const res = mentorStore.unflagDoubt(currentUser, doubtId)
    if (res.success && res.doubt) {
      loadDoubts()
      if (selectedDoubt?.id === doubtId) {
        setSelectedDoubt(res.doubt)
      }
      window.dispatchEvent(
        new CustomEvent('myraah-message', {
          detail: 'Question restored to active status.',
        })
      )
    }
  }

  return (
    <section className="portfolio-section mentor-doubts-section" id="mentor-doubts-section">
      {/* 1. Header & Protocol Notice */}
      <div className="section-heading">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">
              <ShieldCheck size={13} /> ACADEMIC DOUBTS WORKSPACE · MENTOR EXCLUSIVE
            </span>
            <span className="status-pill status-open">
              <Sparkles size={12} /> Real-Time Mentoring Feed
            </span>
          </div>
          <h2>Student Doubts & Academic Inquiries</h2>
          <p>
            Review questions submitted by rural students, provide step-by-step written solutions, and optionally attach audio voice notes or video walkthroughs.
          </p>
        </div>

        <div className="doubts-header-stats-chips">
          <span className={`doubt-stat-chip ${pendingCount > 0 ? 'highlight-pending' : ''}`}>
            <Clock size={13} />
            <strong>{pendingCount}</strong> Pending
          </span>
          <span className="doubt-stat-chip">
            <CheckCircle2 size={13} />
            <strong>{answeredCount}</strong> Answered
          </span>
          {underReviewCount > 0 && (
            <span className="doubt-stat-chip highlight-review">
              <ShieldAlert size={13} />
              <strong>{underReviewCount}</strong> In Review
            </span>
          )}
        </div>
      </div>

      {/* 2. Professional Safety & Education-Only Guideline Banner */}
      <div className="academic-safety-banner" role="region" aria-label="Professional Safety Protocol">
        <div className="safety-banner-icon">
          <ShieldCheck size={22} />
        </div>
        <div className="safety-banner-content">
          <div className="safety-title-row">
            <strong>Education-Only Professional Safety Protocol</strong>
            <span className="safety-badge">Child Safety & Privacy Standard</span>
          </div>
          <p>
            All interactions are strictly academic. Personal student contact details (phone numbers, private WhatsApp, physical addresses) are withheld to safeguard minors. Mentors must not solicit or share private personal contacts.
          </p>
          <div className="biology-guideline-note">
            <AlertCircle size={14} />
            <span>
              <strong>Curriculum Exemption:</strong> Legitimate syllabus questions in Class 10/11/12 Biology, human anatomy, reproductive biology, puberty, and health & hygiene are valid academic topics and are strictly protected. Do not flag syllabus-related questions.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="doubts-toolbar">
        {/* Status Tabs */}
        <div className="doubts-filter-tabs">
          <button
            type="button"
            className={`doubt-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Questions ({doubts.length})
          </button>
          <button
            type="button"
            className={`doubt-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({pendingCount})
            {pendingCount > 0 && <span className="tab-pending-dot" />}
          </button>
          <button
            type="button"
            className={`doubt-tab ${statusFilter === 'answered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('answered')}
          >
            Answered ({answeredCount})
          </button>
          <button
            type="button"
            className={`doubt-tab ${statusFilter === 'under_review' ? 'active' : ''}`}
            onClick={() => setStatusFilter('under_review')}
          >
            Under Review ({underReviewCount})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="doubts-search-group">
          <div className="doubt-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search doubts by question, subject, or student..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            className="doubt-category-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter by curriculum category"
          >
            <option value="all">All Guidance Domains</option>
            <option value="School subjects and academic doubts">School Subjects & Academic</option>
            <option value="Career guidance">Career Guidance & Pathways</option>
            <option value="Scholarships and schemes">Scholarships & Govt Schemes</option>
            <option value="Competitive examinations">Competitive Examinations</option>
            <option value="Vocational education & skills">Vocational Skills</option>
            <option value="Agriculture & local entrepreneurship">Agriculture & Entrepreneurship</option>
          </select>
        </div>
      </div>

      {/* 4. Doubts Cards Grid */}
      {filteredDoubts.length > 0 ? (
        <div className="doubts-cards-grid">
          {filteredDoubts.map(doubt => {
            const isAnswered = doubt.status === 'answered' || doubt.status === 'resolved'
            const isUnderReview = doubt.status === 'under_review'
            const hasMediaAnswer = doubt.answerMediaType === 'audio' || doubt.answerMediaType === 'video'

            return (
              <article
                key={doubt.id}
                className={`doubt-card ${doubt.status === 'pending' ? 'card-pending' : ''} ${
                  isUnderReview ? 'card-flagged' : ''
                }`}
              >
                {/* Card Top Metadata */}
                <div className="doubt-card-top">
                  <div className="status-and-tags">
                    {doubt.status === 'pending' && (
                      <span className="doubt-badge badge-pending">
                        <Clock size={11} /> Pending Response
                      </span>
                    )}
                    {isAnswered && (
                      <span className="doubt-badge badge-answered">
                        <Check size={11} /> Answered
                      </span>
                    )}
                    {isUnderReview && (
                      <span className="doubt-badge badge-review">
                        <ShieldAlert size={11} /> Under Review
                      </span>
                    )}

                    <span className="doubt-subject-tag">{doubt.subject || doubt.category}</span>
                    {doubt.topic && <span className="doubt-topic-tag">{doubt.topic}</span>}
                  </div>

                  <span className="doubt-date" title={doubt.createdAt}>
                    Submitted {doubt.createdAt}
                  </span>
                </div>

                {/* Student Academic Info (Privacy Protected) */}
                <div className="doubt-student-strip">
                  <div className="student-initial-circle">
                    {doubt.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="student-academic-meta">
                    <strong>{doubt.studentName}</strong>
                    <small>{doubt.studentGrade || 'Rural Learner'}</small>
                  </div>

                  {doubt.attachmentUrl && (
                    <button
                      type="button"
                      className="attachment-indicator-pill"
                      onClick={() => setExpandedImage(doubt.attachmentUrl!)}
                      title="Click to view attached diagram"
                    >
                      <ImageIcon size={13} />
                      <span>Diagram Attached</span>
                    </button>
                  )}
                </div>

                {/* Question Body */}
                <div className="doubt-question-box">
                  <p className="doubt-question-text">{doubt.question}</p>
                  {doubt.contextDetails && (
                    <p className="doubt-context-text">
                      <strong>Context:</strong> {doubt.contextDetails}
                    </p>
                  )}
                </div>

                {/* Answer Summary Strip (If already answered) */}
                {isAnswered && doubt.answer && (
                  <div className="doubt-answer-preview">
                    <div className="answer-preview-head">
                      <span className="answer-label">
                        <CheckCircle2 size={13} /> Your Academic Answer:
                      </span>
                      {hasMediaAnswer && (
                        <span className="media-answer-pill">
                          {doubt.answerMediaType === 'audio' ? <Volume2 size={12} /> : <Video size={12} />}
                          <span>{doubt.answerMediaType === 'audio' ? 'Audio Note' : 'Video Demo'}</span>
                        </span>
                      )}
                      <small className="answer-date">Resolved on {doubt.resolvedAt || doubt.createdAt}</small>
                    </div>
                    <p className="answer-preview-snippet">{doubt.answer}</p>
                  </div>
                )}

                {/* Flagged Alert Banner (If under review) */}
                {isUnderReview && (
                  <div className="doubt-flagged-callout">
                    <ShieldAlert size={15} />
                    <div className="flagged-copy">
                      <strong>Content under administrative review</strong>
                      <p>
                        <strong>Reason:</strong> {doubt.flagReason || 'Flagged for moderation.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button-link-subtle"
                      onClick={() => handleUnflag(doubt.id)}
                      title="Restore to active questions"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  </div>
                )}

                {/* Card Actions */}
                <div className="doubt-card-actions">
                  {doubt.status === 'pending' && (
                    <button
                      type="button"
                      className="button primary"
                      onClick={() => handleOpenDoubt(doubt)}
                    >
                      <MessageSquare size={14} /> Answer Doubt
                    </button>
                  )}

                  {isAnswered && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => handleOpenDoubt(doubt)}
                    >
                      <Eye size={14} /> View / Edit Answer
                    </button>
                  )}

                  {isUnderReview && (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => handleOpenDoubt(doubt)}
                    >
                      <Eye size={14} /> View Doubt Details
                    </button>
                  )}

                  {!isUnderReview && (
                    <button
                      type="button"
                      className="button-subtle-flag"
                      onClick={() => {
                        setFlaggingDoubt(doubt)
                        setFlagCategory('private_contact_solicitation')
                        setFlagReason('')
                        setFlagError('')
                      }}
                      title="Flag inappropriate or non-academic content"
                    >
                      <Flag size={13} />
                      <span>Flag / Report</span>
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-doubts-state">
          <HelpCircle size={38} className="empty-icon" />
          <h3>No doubts found in this view</h3>
          <p>
            {searchQuery
              ? `No inquiries match "${searchQuery}". Try searching for another keyword or clearing filters.`
              : statusFilter === 'pending'
              ? 'Great job! You have answered all incoming student doubts.'
              : 'There are currently no student inquiries in this category.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              type="button"
              className="button secondary"
              style={{ marginTop: '12px' }}
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* 5. Detailed Doubt Modal & Answer Composer */}
      {selectedDoubt && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setSelectedDoubt(null)
          }}
        >
          <div className="modal doubt-detail-modal" role="dialog" aria-modal="true" aria-labelledby="doubt-detail-title">
            {/* Modal Header */}
            <div className="modal-heading">
              <div className="doubt-modal-head-title">
                <span className="eyebrow">STUDENT INQUIRY DETAILS</span>
                <h2 id="doubt-detail-title">
                  {selectedDoubt.topic || selectedDoubt.subject || selectedDoubt.category}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedDoubt(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body doubt-modal-body">
              {/* Question Header & Context */}
              <div className="doubt-full-details-card">
                <div className="detail-meta-row">
                  <div className="student-profile-badge">
                    <span className="student-badge-avatar">
                      {selectedDoubt.studentName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{selectedDoubt.studentName}</strong>
                      <small>{selectedDoubt.studentGrade || 'Class 10/12 Student'}</small>
                    </div>
                  </div>

                  <div className="detail-status-chips">
                    <span className={`doubt-badge badge-${selectedDoubt.status}`}>
                      {selectedDoubt.status === 'pending' && <Clock size={11} />}
                      {selectedDoubt.status === 'answered' && <Check size={11} />}
                      {selectedDoubt.status === 'resolved' && <Check size={11} />}
                      {selectedDoubt.status === 'under_review' && <ShieldAlert size={11} />}
                      {selectedDoubt.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="doubt-subject-tag">{selectedDoubt.category}</span>
                  </div>
                </div>

                <div className="doubt-full-question">
                  <label className="field-label">Student Question:</label>
                  <p className="full-question-body">{selectedDoubt.question}</p>
                </div>

                {selectedDoubt.contextDetails && (
                  <div className="student-context-box">
                    <strong>Academic Context:</strong>
                    <span>{selectedDoubt.contextDetails}</span>
                  </div>
                )}

                {/* Educational Image Attachment */}
                {selectedDoubt.attachmentUrl && (
                  <div className="doubt-attachment-section">
                    <span className="field-label">
                      <ImageIcon size={14} /> Attached Educational Diagram / Textbook Query:
                    </span>
                    <div className="attachment-preview-box">
                      <img
                        src={selectedDoubt.attachmentUrl}
                        alt={selectedDoubt.attachmentName || 'Student textbook attachment'}
                        className="attachment-img-preview"
                        onClick={() => setExpandedImage(selectedDoubt.attachmentUrl!)}
                      />
                      <div className="attachment-details">
                        <strong>{selectedDoubt.attachmentName || 'student_attachment.png'}</strong>
                        <small>Click image to view full resolution</small>
                        <button
                          type="button"
                          className="button-link-subtle"
                          onClick={() => setExpandedImage(selectedDoubt.attachmentUrl!)}
                        >
                          <ExternalLink size={12} /> Open Lightbox
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Flagged Status Banner if Under Review */}
              {selectedDoubt.status === 'under_review' && (
                <div className="doubt-flagged-callout modal-callout">
                  <ShieldAlert size={20} />
                  <div>
                    <strong>This question is currently under administrative moderation review</strong>
                    <p>
                      <strong>Category:</strong> {selectedDoubt.flagCategory || 'Content Concern'}<br />
                      <strong>Report Details:</strong> {selectedDoubt.flagReason}
                    </p>
                    <button
                      type="button"
                      className="button small-secondary"
                      style={{ marginTop: '8px' }}
                      onClick={() => handleUnflag(selectedDoubt.id)}
                    >
                      <RotateCcw size={13} /> Dismiss Report & Restore to Pending
                    </button>
                  </div>
                </div>
              )}

              {/* Answer Form & Composer */}
              <form onSubmit={handleSubmitAnswer} className="doubt-answer-composer">
                <div className="composer-heading">
                  <div>
                    <span className="eyebrow">YOUR ACADEMIC GUIDANCE</span>
                    <h3>{selectedDoubt.answer ? 'Edit Mentor Explanation' : 'Provide Step-by-Step Explanation'}</h3>
                  </div>
                  {selectedDoubt.resolvedAt && (
                    <span className="answered-timestamp">
                      Resolved {selectedDoubt.resolvedAt}
                    </span>
                  )}
                </div>

                {composerError && (
                  <div className="form-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{composerError}</span>
                  </div>
                )}

                <label className="field">
                  <span>Written Academic Explanation <b className="required">*</b></span>
                  <textarea
                    rows={6}
                    placeholder="Provide clear, step-by-step guidance in simple Hindi or English. Break down difficult concepts, point to official textbook sections, or outline next steps..."
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    required
                  />
                  <small>
                    Aim for clear, encouraging language. Rural learners often read this on basic mobile displays.
                  </small>
                </label>

                {/* Optional Media Answer (Audio / Video) */}
                <div className="composer-media-section">
                  <div className="media-section-head">
                    <span className="field-label">
                      <Volume2 size={14} /> Optional Audio / Video Explanation
                    </span>
                    <span className="fineprint">Voice notes achieve higher engagement in rural areas.</span>
                  </div>

                  {/* Media Selector or Preview */}
                  {mediaPreviewUrl ? (
                    <div className="active-media-preview-card">
                      <div className="media-preview-top">
                        <span className="media-badge">
                          {answerMediaType === 'video' ? <Video size={13} /> : <Volume2 size={13} />}
                          <span>{answerMediaType === 'video' ? 'Video Walkthrough' : 'Audio Note'} Ready</span>
                        </span>
                        <button
                          type="button"
                          className="button-icon-subtle danger"
                          onClick={handleRemoveComposerMedia}
                          title="Remove media attachment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {answerMediaType === 'video' ? (
                        <video src={mediaPreviewUrl} controls className="composer-video-preview" />
                      ) : (
                        <audio src={mediaPreviewUrl} controls className="composer-audio-preview" />
                      )}
                    </div>
                  ) : (
                    <div className="composer-upload-tray">
                      <label className="media-upload-button">
                        <Upload size={15} />
                        <span>Upload Audio / Video Answer</span>
                        <input
                          type="file"
                          accept="audio/*,video/mp4,video/webm"
                          onChange={handleMediaFileChange}
                          style={{ display: 'none' }}
                        />
                      </label>

                      <div className="demo-clip-quick-buttons">
                        <span className="or-label">or attach demo clip:</span>
                        <button
                          type="button"
                          className="quick-demo-btn"
                          onClick={() => handleSelectDemoClip('audio')}
                        >
                          <Mic size={12} /> Add Demo Audio Note (45s)
                        </button>
                        <button
                          type="button"
                          className="quick-demo-btn"
                          onClick={() => handleSelectDemoClip('video')}
                        >
                          <Video size={12} /> Add Demo Video Walkthrough
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Composer Actions */}
                <div className="doubt-composer-footer">
                  <button
                    type="button"
                    className="button-subtle-flag"
                    onClick={() => {
                      setFlaggingDoubt(selectedDoubt)
                      setFlagCategory('private_contact_solicitation')
                      setFlagReason('')
                      setFlagError('')
                    }}
                  >
                    <Flag size={13} /> Flag Inappropriate Content
                  </button>

                  <div className="composer-action-buttons">
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setSelectedDoubt(null)}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="button primary"
                      disabled={isSubmittingAnswer || !answerText.trim()}
                    >
                      <Send size={15} />
                      <span>{isSubmittingAnswer ? 'Publishing...' : 'Publish Academic Answer'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. Flag Content / Moderation Modal */}
      {flaggingDoubt && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setFlaggingDoubt(null)
          }}
        >
          <div className="modal doubt-flag-modal" role="dialog" aria-modal="true" aria-labelledby="flag-dialog-title">
            <div className="modal-heading">
              <div className="flag-modal-title">
                <ShieldAlert size={18} className="danger-icon" />
                <h2 id="flag-dialog-title">Flag Content for Moderation Review</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setFlaggingDoubt(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFlagSubmit} className="modal-body flag-form-body">
              {/* Safety notice reminding about biology exemption */}
              <div className="flag-safety-reminder">
                <AlertCircle size={16} />
                <p>
                  <strong>Curriculum Exemption Reminder:</strong> NCERT & State Board questions on human biology, reproductive health, puberty, and embryonic development are legitimate academic curriculum. Questions on these topics must NOT be flagged unless they contain explicit personal harassment.
                </p>
              </div>

              {flagError && (
                <div className="form-error" role="alert">
                  {flagError}
                </div>
              )}

              <div className="flag-question-excerpt">
                <strong>Question being reported:</strong>
                <p>"{flaggingDoubt.question}"</p>
                <small>Submitted by {flaggingDoubt.studentName}</small>
              </div>

              <div className="field">
                <span>Select Violation Category <b className="required">*</b></span>
                <div className="flag-categories-list">
                  {FLAG_CATEGORIES.map(cat => (
                    <label
                      key={cat.id}
                      className={`flag-choice-label ${flagCategory === cat.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="flag-category"
                        value={cat.id}
                        checked={flagCategory === cat.id}
                        onChange={() => setFlagCategory(cat.id)}
                      />
                      <div className="choice-copy">
                        <strong>{cat.label}</strong>
                        <small>{cat.desc}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <label className="field">
                <span>Moderation Details / Explanation <b className="required">*</b></span>
                <textarea
                  rows={3}
                  placeholder="Explain why this content violates child safety or academic guidelines..."
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value)}
                  required
                />
              </label>

              <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                <span className="demo-moderation-fineprint">
                  Demo moderation: sets doubt status to Under Review.
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setFlaggingDoubt(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button danger-btn">
                    <Flag size={14} /> Submit Report
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Image Lightbox for Educational Diagrams */}
      {expandedImage && (
        <div
          className="modal-backdrop image-lightbox-backdrop"
          role="presentation"
          onClick={() => setExpandedImage(null)}
        >
          <div className="image-lightbox-container" onClick={e => e.stopPropagation()}>
            <div className="lightbox-top">
              <span>Attached Educational Diagram Preview</span>
              <button
                type="button"
                className="icon-button"
                onClick={() => setExpandedImage(null)}
                aria-label="Close image lightbox"
              >
                <X size={20} />
              </button>
            </div>
            <img src={expandedImage} alt="Expanded educational diagram" className="lightbox-img" />
          </div>
        </div>
      )}
    </section>
  )
}
