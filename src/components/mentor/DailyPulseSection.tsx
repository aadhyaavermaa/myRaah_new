import { useState } from 'react'
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Plus,
  X,
  MessageSquare,
  AlertCircle,
  Send,
} from 'lucide-react'
import type { DailyReflectionRecord, ReflectionStatus, User as CurrentUserType } from '../../types'
import { learnerStore } from '../../services/learnerStore'

interface DailyPulseSectionProps {
  mentorId: string
  currentUser: CurrentUserType | null
  initialStudentId?: string
  onNavigateToTab: (tabId: 'learners' | 'growth' | 'mentorship', studentId: string) => void
}

const STATUS_BADGES: Record<
  ReflectionStatus,
  { label: string; bg: string; color: string; border: string; icon: typeof CheckCircle2 }
> = {
  submitted: {
    label: 'Pending Review',
    bg: '#fef6ec',
    color: '#9b5a0f',
    border: '#fae0b5',
    icon: Clock,
  },
  reviewed: {
    label: 'Reviewed & Feedback Sent',
    bg: '#edf9f6',
    color: '#00877a',
    border: '#c6efe6',
    icon: CheckCircle2,
  },
  assigned: {
    label: 'Awaiting Student Submission',
    bg: '#f5f7f8',
    color: '#63757a',
    border: '#dbe4e6',
    icon: Calendar,
  },
}

export default function DailyPulseSection({
  mentorId,
  initialStudentId,
  onNavigateToTab,
}: DailyPulseSectionProps) {
  const learners = learnerStore.getAllLearners()

  const [studentFilter, setStudentFilter] = useState<string>(initialStudentId || 'all')
  const [statusFilter, setStatusFilter] = useState<ReflectionStatus | 'all'>('all')
  const [reviewingReflection, setReviewingReflection] = useState<DailyReflectionRecord | null>(null)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [ratingInput, setRatingInput] = useState<'Great Effort' | 'Good Reflection' | 'Needs More Detail'>('Great Effort')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // New Reflection Assignment Form State
  const [assignStudentId, setAssignStudentId] = useState<string>(initialStudentId || (learners[0]?.id || ''))
  const [assignTopic, setAssignTopic] = useState('')
  const [assignCustomQuestion, setAssignCustomQuestion] = useState('')
  const [assignError, setAssignError] = useState('')

  // Query reflections
  const reflections = learnerStore.getReflections(
    mentorId,
    studentFilter !== 'all' ? studentFilter : undefined,
    statusFilter !== 'all' ? statusFilter : undefined
  )

  const pendingReviewCount = learnerStore
    .getReflections(mentorId)
    .filter(r => r.status === 'submitted').length

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle Assign Reflection
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAssignError('')

    if (!assignTopic.trim()) {
      setAssignError('Please specify the topic or learning unit for reflection.')
      return
    }

    const targetStudent = learners.find(l => l.id === assignStudentId)
    if (!targetStudent) {
      setAssignError('Please select a student.')
      return
    }

    const res = learnerStore.assignReflection(mentorId, {
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      topic: assignTopic.trim(),
      customQuestion: assignCustomQuestion.trim() || undefined,
    })

    if (!res.success) {
      setAssignError(res.error || 'Failed to assign reflection.')
      return
    }

    setShowAssignModal(false)
    setAssignTopic('')
    setAssignCustomQuestion('')
    triggerToast(`Daily reflection assigned to ${targetStudent.name}.`)
  }

  // Handle Submit Mentor Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingReflection) return

    if (!feedbackInput.trim()) {
      alert('Please enter your written feedback.')
      return
    }

    const res = learnerStore.reviewReflection(reviewingReflection.id, {
      feedback: feedbackInput.trim(),
      rating: ratingInput,
    })

    if (!res.success) {
      alert(res.error || 'Failed to submit review.')
      return
    }

    setReviewingReflection(null)
    setFeedbackInput('')
    triggerToast(`Feedback recorded and marked as Reviewed for ${reviewingReflection.studentName}.`)
  }

  return (
    <div className="daily-pulse-workspace">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="toast-notice" role="alert">
          <CheckCircle2 size={16} color="#00877a" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with Stats & Assign Button */}
      <div className="section-heading-with-meta">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">
              <Sparkles size={13} /> DAILY REFLECTION & HABIT PULSE
            </span>
            <span className="demo-label">PROTOTYPE DEMO SUBMISSIONS</span>
          </div>
          <h2>Daily Pulse — Reflections Management</h2>
          <p>
            Assign micro-reflections, review daily student self-evaluations, and provide encouragement to build consistent study habits.
          </p>
        </div>

        <div className="pulse-top-actions">
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setAssignStudentId(studentFilter !== 'all' ? studentFilter : learners[0]?.id || '')
              setShowAssignModal(true)
            }}
          >
            <Plus size={16} /> Assign Daily Reflection
          </button>
        </div>
      </div>

      {/* 2. Simulation Disclaimer Banner */}
      <div className="academic-safety-banner pulse-disclaimer-banner">
        <div className="safety-banner-icon">
          <Sparkles size={20} />
        </div>
        <div className="safety-banner-content">
          <div className="safety-title-row">
            <strong>Sample Learning Responses (Demonstration Mode)</strong>
            <span className="safety-badge">Guided Metacognition</span>
          </div>
          <p>
            The responses displayed below are realistic simulated submissions illustrating how Class 10–12 rural students articulate daily breakthroughs, challenges, and goals. Real student identities are protected.
          </p>
        </div>
      </div>

      {/* 3. Toolbar: Status Tabs & Student Selector */}
      <div className="pulse-toolbar">
        {/* Status Filters */}
        <div className="pulse-status-tabs">
          <button
            type="button"
            className={`pulse-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Activity
          </button>

          <button
            type="button"
            className={`pulse-tab-btn ${statusFilter === 'submitted' ? 'active' : ''}`}
            onClick={() => setStatusFilter('submitted')}
          >
            <Clock size={13} />
            Pending Review ({pendingReviewCount})
            {pendingReviewCount > 0 && <span className="tab-pending-badge" />}
          </button>

          <button
            type="button"
            className={`pulse-tab-btn ${statusFilter === 'reviewed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('reviewed')}
          >
            <CheckCircle2 size={13} /> Reviewed
          </button>

          <button
            type="button"
            className={`pulse-tab-btn ${statusFilter === 'assigned' ? 'active' : ''}`}
            onClick={() => setStatusFilter('assigned')}
          >
            <Calendar size={13} /> Awaiting Submission
          </button>
        </div>

        {/* Student Selector */}
        <div className="pulse-student-filter-wrap">
          <label htmlFor="pulse-student-select">
            <User size={13} /> Filter Learner:
          </label>
          <select
            id="pulse-student-select"
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
          >
            <option value="all">All Assigned Students ({learners.length})</option>
            {learners.map(l => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Reflections Cards Feed */}
      {reflections.length > 0 ? (
        <div className="reflections-feed-grid">
          {reflections.map(refItem => {
            const statusConfig = STATUS_BADGES[refItem.status]
            const StatusIcon = statusConfig.icon
            const hasAnswers = Boolean(refItem.answers)

            return (
              <article key={refItem.id} className={`reflection-card card-status-${refItem.status}`}>
                {/* Card Top: Student Name, Topic & Status */}
                <div className="reflection-card-header">
                  <div className="student-info-left">
                    <div className="student-circle-avatar">
                      {refItem.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="student-name-row">
                        <h3>{refItem.studentName}</h3>
                        <span className="reflection-demo-tag">DEMO RESPONSE</span>
                      </div>
                      <span className="reflection-topic-title">{refItem.topic}</span>
                    </div>
                  </div>

                  <span
                    className="reflection-status-badge"
                    style={{
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                      borderColor: statusConfig.border,
                    }}
                  >
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Date stamp */}
                <div className="reflection-dates-bar">
                  <span>Assigned: {refItem.assignedDate}</span>
                  {refItem.submittedDate && <span>· Submitted: {refItem.submittedDate}</span>}
                  {refItem.reviewedDate && <span>· Reviewed: {refItem.reviewedDate}</span>}
                </div>

                {/* Prompts & Responses Box */}
                {hasAnswers && refItem.answers ? (
                  <div className="reflection-qa-box">
                    {/* Prompt 1 */}
                    <div className="qa-item">
                      <div className="qa-prompt-label">
                        <span className="q-number">1</span>
                        <span>{refItem.prompts.learnedToday}</span>
                      </div>
                      <p className="qa-student-answer">{refItem.answers.learnedToday}</p>
                    </div>

                    {/* Prompt 2 */}
                    <div className="qa-item highlight-challenge">
                      <div className="qa-prompt-label">
                        <span className="q-number challenge">2</span>
                        <span>{refItem.prompts.challengingToday}</span>
                      </div>
                      <p className="qa-student-answer">{refItem.answers.challengingToday}</p>
                    </div>

                    {/* Prompt 3 */}
                    <div className="qa-item">
                      <div className="qa-prompt-label">
                        <span className="q-number">3</span>
                        <span>{refItem.prompts.nextGoal}</span>
                      </div>
                      <p className="qa-student-answer">{refItem.answers.nextGoal}</p>
                    </div>
                  </div>
                ) : (
                  <div className="awaiting-submission-callout">
                    <Clock size={16} />
                    <div>
                      <strong>Awaiting student daily submission</strong>
                      <p>Student will receive an in-app prompt to complete their 3-question reflection at the end of their study day.</p>
                    </div>
                  </div>
                )}

                {/* Mentor Feedback Box (If Reviewed) */}
                {refItem.status === 'reviewed' && refItem.mentorFeedback && (
                  <div className="mentor-feedback-display">
                    <div className="feedback-head">
                      <CheckCircle2 size={13} color="#00877a" />
                      <strong>Your Written Guidance:</strong>
                      {refItem.mentorRating && (
                        <span className="rating-pill">{refItem.mentorRating}</span>
                      )}
                    </div>
                    <p>{refItem.mentorFeedback}</p>
                  </div>
                )}

                {/* Card Actions */}
                <div className="reflection-card-actions">
                  {refItem.status === 'submitted' && (
                    <button
                      type="button"
                      className="button small-primary"
                      onClick={() => {
                        setReviewingReflection(refItem)
                        setFeedbackInput('')
                        setRatingInput('Great Effort')
                      }}
                    >
                      <MessageSquare size={13} /> Write Feedback & Mark Reviewed
                    </button>
                  )}

                  <button
                    type="button"
                    className="button small-secondary"
                    onClick={() => onNavigateToTab('growth', refItem.studentId)}
                  >
                    View Growth Tracker
                  </button>

                  <button
                    type="button"
                    className="button small-secondary"
                    onClick={() => onNavigateToTab('mentorship', refItem.studentId)}
                  >
                    Mentorship Hub
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state">
          <Sparkles size={36} />
          <h3>No Daily Reflections Found</h3>
          <p>Try switching your status filter or assign a new daily reflection activity to a student.</p>
          <button
            type="button"
            className="button primary"
            onClick={() => setShowAssignModal(true)}
          >
            <Plus size={15} /> Assign Reflection
          </button>
        </div>
      )}

      {/* 5. Review & Submit Feedback Modal */}
      {reviewingReflection && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setReviewingReflection(null)
          }}
        >
          <section
            className="modal review-reflection-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Review Reflection from ${reviewingReflection.studentName}`}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">MENTOR FEEDBACK STUDIO</span>
                <h2>Review Daily Reflection</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setReviewingReflection(null)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-body review-modal-body">
              {/* Student Summary */}
              <div className="review-student-strip">
                <div>
                  <strong>{reviewingReflection.studentName}</strong>
                  <p>Topic: {reviewingReflection.topic}</p>
                </div>
                <small className="submitted-date-note">
                  Submitted: {reviewingReflection.submittedDate}
                </small>
              </div>

              {/* Student's Answers Review Excerpt */}
              {reviewingReflection.answers && (
                <div className="review-answers-box">
                  <div className="ans-review-item">
                    <span className="ans-label">1. What did you learn today?</span>
                    <p className="ans-text">"{reviewingReflection.answers.learnedToday}"</p>
                  </div>

                  <div className="ans-review-item highlight-red">
                    <span className="ans-label challenge">2. What was challenging today?</span>
                    <p className="ans-text">"{reviewingReflection.answers.challengingToday}"</p>
                  </div>

                  <div className="ans-review-item">
                    <span className="ans-label">3. Next learning goal:</span>
                    <p className="ans-text">"{reviewingReflection.answers.nextGoal}"</p>
                  </div>
                </div>
              )}

              {/* Mentor Written Feedback */}
              <label className="field">
                <span>Written Encouragement & Guidance <b className="required">*</b></span>
                <textarea
                  rows={4}
                  placeholder="Provide constructive advice, praise specific effort, or clarify concepts the student struggled with..."
                  value={feedbackInput}
                  onChange={e => setFeedbackInput(e.target.value)}
                  required
                />
              </label>

              {/* Effort Rating */}
              <div className="field">
                <span>Effort & Depth Evaluation</span>
                <div className="effort-rating-selector">
                  {(['Great Effort', 'Good Reflection', 'Needs More Detail'] as const).map(rate => (
                    <button
                      key={rate}
                      type="button"
                      className={`effort-pill-btn ${ratingInput === rate ? 'selected' : ''}`}
                      onClick={() => setRatingInput(rate)}
                    >
                      {rate === 'Great Effort' && '⭐ '}
                      {rate}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setReviewingReflection(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  <Send size={14} /> Send Feedback & Mark Reviewed
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* 6. Assign Daily Reflection Modal */}
      {showAssignModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowAssignModal(false)
          }}
        >
          <section
            className="modal assign-reflection-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Assign Daily Reflection Activity"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">DAILY HABIT BUILDER</span>
                <h2>Assign Daily Reflection Activity</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAssignModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="modal-body">
              {assignError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{assignError}</span>
                </div>
              )}

              <label className="field">
                <span>Select Learner <b className="required">*</b></span>
                <select
                  value={assignStudentId}
                  onChange={e => setAssignStudentId(e.target.value)}
                  required
                >
                  {learners.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.grade.split('·')[0].trim()})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Syllabus Topic / Subject Focus <b className="required">*</b></span>
                <input
                  type="text"
                  placeholder="e.g. Human Endocrine System · Pituitary & Thyroid hormones"
                  value={assignTopic}
                  onChange={e => setAssignTopic(e.target.value)}
                  required
                />
              </label>

              <div className="standard-prompts-preview-box">
                <strong>Standard 3 Diagnostic Prompts Included:</strong>
                <ul>
                  <li>1. What did you learn today?</li>
                  <li>2. What was challenging today?</li>
                  <li>3. What is your next learning goal?</li>
                </ul>
              </div>

              <label className="field">
                <span>Optional Custom Challenge Prompt (Replaces #2)</span>
                <input
                  type="text"
                  placeholder="e.g. Did you draw the negative feedback loop diagram for insulin?"
                  value={assignCustomQuestion}
                  onChange={e => setAssignCustomQuestion(e.target.value)}
                />
                <small className="fineprint">Leave blank to keep standard "What was challenging today?"</small>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Assign Reflection to Learner
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
