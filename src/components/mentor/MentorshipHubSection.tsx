import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  Video,
  User,
  Plus,
  X,
  AlertCircle,
  Target,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type { MentorshipCheckin, TeachingMode, User as CurrentUserType } from '../../types'
import { learnerStore } from '../../services/learnerStore'

interface MentorshipHubSectionProps {
  mentorId: string
  currentUser: CurrentUserType | null
  initialStudentId?: string
  onNavigateToTab: (tabId: 'learners' | 'growth' | 'pulse', studentId: string) => void
}

const CONFIDENCE_LABELS: Record<1 | 2 | 3 | 4 | 5, { label: string; desc: string; color: string }> = {
  1: { label: 'Low', desc: 'Struggling with core concepts, needs close support', color: '#e74c3c' },
  2: { label: 'Slightly Unsure', desc: 'Understands basics but hesitates on questions', color: '#e67e22' },
  3: { label: 'Moderate', desc: 'Pacing normally, handles standard problems', color: '#f39c12' },
  4: { label: 'Confident', desc: 'Solves questions independently with good speed', color: '#27ae60' },
  5: { label: 'High Mastery', desc: 'Excelling, ready for advanced topics & mock tests', color: '#00877a' },
}

export default function MentorshipHubSection({
  mentorId,
  initialStudentId,
  onNavigateToTab,
}: MentorshipHubSectionProps) {
  const learners = learnerStore.getAllLearners()

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>(initialStudentId || 'all')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [completingCheckin, setCompletingCheckin] = useState<MentorshipCheckin | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionConfidence, setCompletionConfidence] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [completionFollowUp, setCompletionFollowUp] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Form State for new check-in
  const [formStudentId, setFormStudentId] = useState<string>(initialStudentId || (learners[0]?.id || ''))
  const [formDate, setFormDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  })
  const [formMode, setFormMode] = useState<TeachingMode>('voice')
  const [formTopic, setFormTopic] = useState('')
  const [formAcademicChallenge, setFormAcademicChallenge] = useState('')
  const [formLearningGoals, setFormLearningGoals] = useState('')
  const [formConfidence, setFormConfidence] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [formProgressRating, setFormProgressRating] = useState<'ahead' | 'on_track' | 'lagging'>('on_track')
  const [formNotes, setFormNotes] = useState('')
  const [formActionItemInput, setFormActionItemInput] = useState('')
  const [formActionItems, setFormActionItems] = useState<string[]>([])
  const [formError, setFormError] = useState('')

  // Check-ins list
  const checkins = learnerStore.getCheckins(
    mentorId,
    selectedStudentFilter !== 'all' ? selectedStudentFilter : undefined
  )

  const upcomingCheckins = checkins.filter(c => c.status === 'scheduled')
  const completedCheckins = checkins.filter(c => c.status === 'completed')

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  // Handle Action Item Add in Form
  const handleAddActionItem = () => {
    if (!formActionItemInput.trim()) return
    setFormActionItems([...formActionItems, formActionItemInput.trim()])
    setFormActionItemInput('')
  }

  const handleRemoveActionItem = (index: number) => {
    setFormActionItems(formActionItems.filter((_, i) => i !== index))
  }

  // Handle Form Submit
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!formTopic.trim()) {
      setFormError('Please enter a session guidance topic.')
      return
    }
    if (!formDate) {
      setFormError('Please choose a scheduled session date.')
      return
    }

    const targetStudent = learners.find(l => l.id === formStudentId)
    if (!targetStudent) {
      setFormError('Please select a valid assigned student.')
      return
    }

    const res = learnerStore.createCheckin(mentorId, {
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      scheduledDate: formDate,
      mode: formMode,
      topic: formTopic.trim(),
      academicChallenge: formAcademicChallenge.trim(),
      learningGoals: formLearningGoals.trim(),
      confidenceLevel: formConfidence,
      progressRating: formProgressRating,
      notes: formNotes.trim(),
      actionItems: formActionItems,
      followUpDate: formDate,
    })

    if (!res.success) {
      setFormError(res.error || 'Failed to schedule check-in.')
      return
    }

    setShowScheduleModal(false)
    setFormTopic('')
    setFormAcademicChallenge('')
    setFormLearningGoals('')
    setFormNotes('')
    setFormActionItems([])
    triggerToast(`Check-in scheduled with ${targetStudent.name} on ${formDate}`)
  }

  // Handle Complete Session
  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!completingCheckin) return

    learnerStore.completeCheckin(completingCheckin.id, {
      completionNotes,
      updatedConfidence: completionConfidence,
      nextFollowUpDate: completionFollowUp,
    })

    setCompletingCheckin(null)
    setCompletionNotes('')
    triggerToast(`Session marked as completed. Recorded in ${completingCheckin.studentName}'s mentoring history.`)
  }

  return (
    <div className="mentorship-hub-workspace">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="toast-notice" role="alert">
          <CheckCircle2 size={16} color="#00877a" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Section Heading & Action Button */}
      <div className="section-heading-with-meta">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">
              <Calendar size={13} /> STRUCTURED MENTORING WORKSPACE
            </span>
            <span className="demo-label">EDUCATION-ONLY LOG</span>
          </div>
          <h2>Mentorship Hub & Check-ins</h2>
          <p>
            Conduct structured 1-on-1 check-ins with guided diagnostic prompts, record actionable notes, and track educational milestones.
          </p>
        </div>

        <div className="hub-top-action-bar">
          <button
            type="button"
            className="button primary"
            onClick={() => {
              setFormStudentId(selectedStudentFilter !== 'all' ? selectedStudentFilter : learners[0]?.id || '')
              setShowScheduleModal(true)
            }}
          >
            <Plus size={16} /> Start / Schedule Check-in
          </button>
        </div>
      </div>

      {/* 2. Safety Guideline Notice */}
      <div className="academic-safety-banner">
        <div className="safety-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="safety-banner-content">
          <div className="safety-title-row">
            <strong>Structured Mentorship Standard (Non-Chat Interface)</strong>
            <span className="safety-badge">Verified Academic Focus</span>
          </div>
          <p>
            To prevent distractions and safeguard rural learners, all interactions adhere to structured academic check-ins, guided learning prompts, and documented notes rather than open unstructured messaging.
          </p>
        </div>
      </div>

      {/* 3. Filter Bar & Tabs */}
      <div className="hub-toolbar">
        {/* Tabs: Upcoming vs Completed */}
        <div className="hub-tabs">
          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Clock size={14} /> Upcoming Check-ins ({upcomingCheckins.length})
          </button>

          <button
            type="button"
            className={`hub-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <CheckCircle2 size={14} /> Mentoring History ({completedCheckins.length})
          </button>
        </div>

        {/* Student Filter */}
        <div className="hub-student-filter-wrap">
          <label htmlFor="hub-student-select">
            <User size={13} /> Filter Learner:
          </label>
          <select
            id="hub-student-select"
            value={selectedStudentFilter}
            onChange={e => setSelectedStudentFilter(e.target.value)}
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

      {/* 4. Check-ins Cards List */}
      <div className="hub-checkins-container">
        {activeTab === 'upcoming' ? (
          upcomingCheckins.length > 0 ? (
            <div className="checkins-card-grid">
              {upcomingCheckins.map(item => {
                const conf = CONFIDENCE_LABELS[item.confidenceLevel]
                return (
                  <article key={item.id} className="checkin-card upcoming-card">
                    {/* Top Row: Date, Student, Mode */}
                    <div className="checkin-card-top">
                      <div className="checkin-date-badge">
                        <Calendar size={13} />
                        <strong>{item.scheduledDate}</strong>
                      </div>

                      <span className="checkin-mode-badge">
                        {item.mode === 'video' ? <Video size={12} /> : <PhoneCall size={12} />}
                        <span>{item.mode === 'video' ? 'Video Walkthrough' : 'Voice Guidance'}</span>
                      </span>

                      <span className="status-pill status-open">
                        <Clock size={11} /> Scheduled
                      </span>
                    </div>

                    {/* Student Info & Topic */}
                    <div className="checkin-student-row">
                      <div className="student-pill-avatar">
                        {item.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{item.studentName}</h4>
                        <span className="checkin-topic-title">{item.topic}</span>
                      </div>
                    </div>

                    {/* Guided Prompts Snapshot */}
                    <div className="guided-prompts-summary-box">
                      {item.academicChallenge && (
                        <div className="prompt-row">
                          <span className="prompt-tag challenge">Academic Challenge:</span>
                          <p>{item.academicChallenge}</p>
                        </div>
                      )}

                      {item.learningGoals && (
                        <div className="prompt-row">
                          <span className="prompt-tag goal">Weekly Goal:</span>
                          <p>{item.learningGoals}</p>
                        </div>
                      )}

                      <div className="prompt-meta-row">
                        <span className="confidence-chip" style={{ color: conf.color, borderColor: conf.color }}>
                          Confidence: <strong>{conf.label}</strong> ({item.confidenceLevel}/5)
                        </span>

                        {item.progressRating && (
                          <span className="progress-rating-chip">
                            Pacing: <b>{item.progressRating.replace('_', ' ')}</b>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Items List */}
                    {item.actionItems && item.actionItems.length > 0 && (
                      <div className="checkin-action-items">
                        <span className="action-items-title">
                          <Target size={12} /> Student Action Items:
                        </span>
                        <ul>
                          {item.actionItems.map((act, idx) => (
                            <li key={idx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mentor Notes */}
                    {item.notes && (
                      <div className="checkin-notes-preview">
                        <strong>Mentor Prep Notes:</strong>
                        <p>{item.notes}</p>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="checkin-card-actions">
                      <button
                        type="button"
                        className="button small-primary"
                        onClick={() => {
                          setCompletingCheckin(item)
                          setCompletionNotes('')
                          setCompletionConfidence(item.confidenceLevel)
                        }}
                      >
                        <CheckCircle2 size={13} /> Mark as Completed
                      </button>

                      <button
                        type="button"
                        className="button small-secondary"
                        onClick={() => onNavigateToTab('growth', item.studentId)}
                      >
                        View Growth
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={36} />
              <h3>No Upcoming Check-ins Scheduled</h3>
              <p>
                {selectedStudentFilter !== 'all'
                  ? 'No scheduled sessions for this learner.'
                  : 'Start by scheduling a structured check-in with any assigned student.'}
              </p>
              <button
                type="button"
                className="button primary"
                onClick={() => setShowScheduleModal(true)}
              >
                <Plus size={15} /> Schedule a Check-in
              </button>
            </div>
          )
        ) : (
          /* Mentoring History Tab */
          completedCheckins.length > 0 ? (
            <div className="checkins-card-grid">
              {completedCheckins.map(item => {
                const conf = CONFIDENCE_LABELS[item.confidenceLevel]
                return (
                  <article key={item.id} className="checkin-card history-card">
                    <div className="checkin-card-top">
                      <div className="checkin-date-badge completed">
                        <CheckCircle2 size={13} />
                        <strong>Completed on {item.completedDate || item.scheduledDate}</strong>
                      </div>

                      <span className="checkin-mode-badge">
                        {item.mode === 'video' ? <Video size={12} /> : <PhoneCall size={12} />}
                        <span>{item.mode}</span>
                      </span>
                    </div>

                    <div className="checkin-student-row">
                      <div className="student-pill-avatar done">
                        {item.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{item.studentName}</h4>
                        <span className="checkin-topic-title">{item.topic}</span>
                      </div>
                    </div>

                    <div className="guided-prompts-summary-box">
                      <div className="prompt-meta-row">
                        <span className="confidence-chip" style={{ color: conf.color, borderColor: conf.color }}>
                          Confidence: <strong>{conf.label}</strong>
                        </span>
                        {item.followUpDate && (
                          <span className="followup-chip">
                            Next Follow-up: <b>{item.followUpDate}</b>
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <div className="checkin-notes-preview complete">
                          <strong>Recorded Session Notes & Outcomes:</strong>
                          <p>{item.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="checkin-card-actions">
                      <button
                        type="button"
                        className="button small-secondary"
                        onClick={() => onNavigateToTab('growth', item.studentId)}
                      >
                        View Growth Tracker
                      </button>

                      <button
                        type="button"
                        className="button small-secondary"
                        onClick={() => {
                          setFormStudentId(item.studentId)
                          setShowScheduleModal(true)
                        }}
                      >
                        Schedule Follow-up
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={36} />
              <h3>No Completed Mentoring Sessions Yet</h3>
              <p>Once you conduct and mark upcoming sessions as completed, full session notes will be cataloged here.</p>
            </div>
          )
        )}
      </div>

      {/* 5. Schedule / Start Check-in Modal */}
      {showScheduleModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowScheduleModal(false)
          }}
        >
          <section
            className="modal checkin-schedule-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Start or Schedule a Mentorship Check-in"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">STRUCTURED MENTORSHIP PLANNER</span>
                <h2>Start / Schedule a Mentoring Check-in</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowScheduleModal(false)}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="modal-body checkin-form">
              {formError && (
                <div className="form-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Student Picker & Date */}
              <div className="field-grid">
                <label className="field">
                  <span>Assigned Learner <b className="required">*</b></span>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    required
                  >
                    {learners.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.grade.split('·')[0].trim()}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Session Date <b className="required">*</b></span>
                  <input
                    type="date"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              {/* Mode & Topic */}
              <div className="field-grid">
                <label className="field">
                  <span>Mentoring Mode <b className="required">*</b></span>
                  <select
                    value={formMode}
                    onChange={e => setFormMode(e.target.value as TeachingMode)}
                  >
                    <option value="voice">Voice Guidance / Audio Call</option>
                    <option value="video">Short Video Demonstration</option>
                    <option value="text">Structured Written Review</option>
                    <option value="in-person">In-Person Community Check-in</option>
                  </select>
                </label>

                <label className="field">
                  <span>Session Guidance Topic <b className="required">*</b></span>
                  <input
                    type="text"
                    placeholder="e.g. Biology Unit 3 Revision & ANM Application Checklist"
                    value={formTopic}
                    onChange={e => setFormTopic(e.target.value)}
                    required
                  />
                </label>
              </div>

              {/* Guided Prompts */}
              <div className="guided-prompts-form-box">
                <div className="box-title">
                  <Sparkles size={14} /> Guided Diagnostic Prompts
                </div>

                <label className="field">
                  <span>Academic Challenge or Hurdle</span>
                  <textarea
                    rows={2}
                    placeholder="What specific subject, topic, or concept is the student currently finding difficult?"
                    value={formAcademicChallenge}
                    onChange={e => setFormAcademicChallenge(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Weekly Syllabus Target / Learning Goal</span>
                  <input
                    type="text"
                    placeholder="e.g. Complete NCERT exemplar Chapter 4 & practice 15 past questions"
                    value={formLearningGoals}
                    onChange={e => setFormLearningGoals(e.target.value)}
                  />
                </label>

                {/* Confidence Level Slider/Radio */}
                <div className="field">
                  <span>
                    Student Confidence Level: <b>{CONFIDENCE_LABELS[formConfidence].label}</b> ({formConfidence}/5)
                  </span>
                  <div className="confidence-selector-row">
                    {([1, 2, 3, 4, 5] as const).map(num => (
                      <button
                        key={num}
                        type="button"
                        className={`confidence-step-btn ${formConfidence === num ? 'selected' : ''}`}
                        onClick={() => setFormConfidence(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <small className="fineprint">{CONFIDENCE_LABELS[formConfidence].desc}</small>
                </div>

                <label className="field" style={{ marginTop: '10px' }}>
                  <span>Syllabus Pacing Evaluation</span>
                  <select
                    value={formProgressRating}
                    onChange={e => setFormProgressRating(e.target.value as 'ahead' | 'on_track' | 'lagging')}
                  >
                    <option value="ahead">Ahead of Schedule</option>
                    <option value="on_track">On Track with Milestones</option>
                    <option value="lagging">Lagging / Needs Extra Support</option>
                  </select>
                </label>
              </div>

              {/* Action Items Builder */}
              <div className="action-items-builder">
                <label className="field">
                  <span>Assign Concrete Action Items to Student</span>
                  <div className="action-input-row">
                    <input
                      type="text"
                      placeholder="e.g. Solve 10 diagram labeling questions before Thursday"
                      value={formActionItemInput}
                      onChange={e => setFormActionItemInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddActionItem()
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="button small-secondary"
                      onClick={handleAddActionItem}
                    >
                      Add Item
                    </button>
                  </div>
                </label>

                {formActionItems.length > 0 && (
                  <ul className="added-action-items-list">
                    {formActionItems.map((item, idx) => (
                      <li key={idx}>
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(idx)}
                          aria-label="Remove item"
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Mentor Notes */}
              <label className="field">
                <span>Mentor Observation & Follow-up Notes (Prototype Storage)</span>
                <textarea
                  rows={3}
                  placeholder="Private guidance notes, recommended textbook references, or follow-up plans..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Save & Schedule Check-in
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* 6. Mark as Completed Modal */}
      {completingCheckin && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setCompletingCheckin(null)
          }}
        >
          <section
            className="modal complete-checkin-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Complete Mentoring Session"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">SESSION COMPLETION REVIEW</span>
                <h2>Record Session Outcome</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCompletingCheckin(null)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="modal-body">
              <div className="session-summary-box">
                <strong>{completingCheckin.studentName}</strong>
                <p>Topic: {completingCheckin.topic}</p>
                <small>Scheduled: {completingCheckin.scheduledDate}</small>
              </div>

              <label className="field">
                <span>Session Outcome & Mentor Feedback <b className="required">*</b></span>
                <textarea
                  rows={3}
                  placeholder="Summarize how the session went, what doubts were solved, and what the student will study next..."
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                  required
                />
              </label>

              <div className="field">
                <span>Updated Student Confidence Post-Session</span>
                <div className="confidence-selector-row">
                  {([1, 2, 3, 4, 5] as const).map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`confidence-step-btn ${completionConfidence === num ? 'selected' : ''}`}
                      onClick={() => setCompletionConfidence(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <small className="fineprint">{CONFIDENCE_LABELS[completionConfidence].desc}</small>
              </div>

              <label className="field">
                <span>Next Follow-up Date (Optional)</span>
                <input
                  type="date"
                  value={completionFollowUp}
                  onChange={e => setCompletionFollowUp(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setCompletingCheckin(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Confirm & Archive to Mentoring History
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
