import { useState, useMemo } from 'react'
import {
  Search,
  X,
  UserCheck,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  PhoneCall,
  Activity,
  Layers,
} from 'lucide-react'
import type { LearnerRecord, StudentLearningStatus, User } from '../../types'
import { learnerStore } from '../../services/learnerStore'

interface MyLearnersSectionProps {
  mentorId: string
  currentUser: User | null
  onNavigateToTab: (tabId: 'growth' | 'mentorship' | 'pulse', studentId: string) => void
}

const STATUS_CONFIG: Record<
  StudentLearningStatus,
  { label: string; bg: string; color: string; border: string; icon: typeof CheckCircle2 }
> = {
  on_track: {
    label: 'On Track',
    bg: '#edf9f6',
    color: '#00877a',
    border: '#c6efe6',
    icon: CheckCircle2,
  },
  needs_attention: {
    label: 'Needs Attention',
    bg: '#fff5f0',
    color: '#c0392b',
    border: '#fbd4c8',
    icon: AlertCircle,
  },
  goal_achieved: {
    label: 'Goal Achieved',
    bg: '#f1f8e9',
    color: '#388e3c',
    border: '#c8e6c9',
    icon: Award,
  },
  inactive: {
    label: 'Inactive / At Risk',
    bg: '#f5f5f5',
    color: '#757575',
    border: '#e0e0e0',
    icon: Clock,
  },
}

export default function MyLearnersSection({
  mentorId,
  onNavigateToTab,
}: MyLearnersSectionProps) {
  const learners = learnerStore.getLearnersByMentor(mentorId)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StudentLearningStatus | 'all'>('all')
  const [streamFilter, setStreamFilter] = useState<string>('all')
  const [selectedProfileLearner, setSelectedProfileLearner] = useState<LearnerRecord | null>(null)

  // Unique streams for filter
  const allStreams = useMemo(() => {
    const set = new Set<string>()
    learners.forEach(l => {
      if (l.stream) set.add(l.stream)
    })
    return ['all', ...Array.from(set)]
  }, [learners])

  // Filtered learners
  const filteredLearners = useMemo(() => {
    return learners.filter(l => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (streamFilter !== 'all' && l.stream !== streamFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = l.name.toLowerCase().includes(q)
        const matchesGrade = l.grade.toLowerCase().includes(q)
        const matchesLocation = l.location.toLowerCase().includes(q)
        const matchesGoals = l.learningGoals.toLowerCase().includes(q)
        const matchesSubjects = l.subjects.some(s => s.toLowerCase().includes(q))
        if (!matchesName && !matchesGrade && !matchesLocation && !matchesGoals && !matchesSubjects) {
          return false
        }
      }
      return true
    })
  }, [learners, searchQuery, statusFilter, streamFilter])

  // Count stats
  const onTrackCount = learners.filter(l => l.status === 'on_track' || l.status === 'goal_achieved').length
  const attentionCount = learners.filter(l => l.status === 'needs_attention').length
  const inactiveCount = learners.filter(l => l.status === 'inactive').length

  return (
    <div className="my-learners-workspace">
      {/* 1. Header & Overview Bar */}
      <div className="section-heading-with-meta">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">
              <UserCheck size={13} /> ASSIGNED LEARNERS DIRECTORY
            </span>
            <span className="demo-label">PROTOTYPE MOCK DATA</span>
          </div>
          <h2>My Assigned Students</h2>
          <p>
            Monitor learning progress, track recent milestones, and manage 1-on-1 check-ins for your rural mentees.
          </p>
        </div>

        {/* Quick summary metrics */}
        <div className="learners-metric-pill-row">
          <div className="learner-quick-stat">
            <span className="num">{learners.length}</span>
            <span className="lbl">Total Mentees</span>
          </div>
          <div className="learner-quick-stat stat-success">
            <span className="num">{onTrackCount}</span>
            <span className="lbl">On Track</span>
          </div>
          <div className="learner-quick-stat stat-warning">
            <span className="num">{attentionCount}</span>
            <span className="lbl">Needs Help</span>
          </div>
          {inactiveCount > 0 && (
            <div className="learner-quick-stat stat-muted">
              <span className="num">{inactiveCount}</span>
              <span className="lbl">Inactive</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="learners-toolbar">
        {/* Status Pills */}
        <div className="learners-status-tabs">
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Learners ({learners.length})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'on_track' ? 'active' : ''}`}
            onClick={() => setStatusFilter('on_track')}
          >
            <CheckCircle2 size={12} /> On Track ({learners.filter(l => l.status === 'on_track').length})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'needs_attention' ? 'active' : ''}`}
            onClick={() => setStatusFilter('needs_attention')}
          >
            <AlertCircle size={12} /> Needs Attention ({attentionCount})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'goal_achieved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('goal_achieved')}
          >
            <Award size={12} /> Goal Achieved ({learners.filter(l => l.status === 'goal_achieved').length})
          </button>
          <button
            type="button"
            className={`status-filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            <Clock size={12} /> Inactive ({inactiveCount})
          </button>
        </div>

        {/* Right Search & Stream Dropdown */}
        <div className="learners-search-and-select">
          <div className="learner-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search by student, subject, or school..."
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
                <X size={14} />
              </button>
            )}
          </div>

          <select
            className="learner-stream-select"
            value={streamFilter}
            onChange={e => setStreamFilter(e.target.value)}
            aria-label="Filter by academic stream"
          >
            <option value="all">All Focus Areas</option>
            {allStreams
              .filter(s => s !== 'all')
              .map(stream => (
                <option key={stream} value={stream}>
                  {stream}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 3. Learners Cards Grid */}
      {filteredLearners.length > 0 ? (
        <div className="learners-grid">
          {filteredLearners.map(student => {
            const statusConfig = STATUS_CONFIG[student.status]
            const StatusIcon = statusConfig.icon

            return (
              <article key={student.id} className="learner-card">
                {/* Top: Avatar, Name, Grade & Status */}
                <div className="learner-card-header">
                  <div className="learner-avatar-wrap">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="learner-avatar-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="learner-avatar-fallback">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="learner-online-dot"
                      title={student.lastActive}
                    />
                  </div>

                  <div className="learner-meta-primary">
                    <div className="learner-name-row">
                      <h3>{student.name}</h3>
                      <span
                        className="learner-status-pill"
                        style={{
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                          borderColor: statusConfig.border,
                        }}
                      >
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="learner-grade">{student.grade}</p>
                    <small className="learner-location">{student.location}</small>
                  </div>
                </div>

                {/* Enrolled Subjects & Stream */}
                <div className="learner-tags-row">
                  <span className="learner-stream-tag">
                    <Layers size={11} /> {student.stream}
                  </span>
                  {student.subjects.slice(0, 2).map(sub => (
                    <span key={sub} className="learner-subject-chip">
                      {sub}
                    </span>
                  ))}
                  {student.subjects.length > 2 && (
                    <span className="learner-subject-chip more">
                      +{student.subjects.length - 2}
                    </span>
                  )}
                </div>

                {/* Learning Goal */}
                <div className="learner-goal-box">
                  <strong>
                    <Sparkles size={12} /> Target Goal:
                  </strong>
                  <p>{student.learningGoals}</p>
                </div>

                {/* Progress & Academic Health Mini Strip */}
                <div className="learner-progress-strip">
                  <div className="progress-info-row">
                    <span>
                      <TrendingUp size={12} /> Syllabus Progress
                    </span>
                    <strong>{student.overallProgress}%</strong>
                  </div>
                  <div className="progress-track-small">
                    <div
                      className="progress-fill-small"
                      style={{
                        width: `${student.overallProgress}%`,
                        backgroundColor:
                          student.overallProgress > 75
                            ? '#00b3a4'
                            : student.overallProgress > 45
                            ? '#f39c12'
                            : '#e74c3c',
                      }}
                    />
                  </div>
                  <div className="learner-sub-stats">
                    <span>
                      Quiz Avg: <b>{student.quizAverage}%</b>
                    </span>
                    <span>
                      Doubts: <b>{student.doubtsResolved}/{student.doubtsRaised} solved</b>
                    </span>
                  </div>
                </div>

                {/* Recent Activity & Next Follow-Up */}
                <div className="learner-activity-footer">
                  <div className="activity-line">
                    <Activity size={12} />
                    <span>{student.recentActivity}</span>
                  </div>
                  {student.upcomingFollowUp && (
                    <div className="followup-line">
                      <Calendar size={12} />
                      <span>{student.upcomingFollowUp}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="learner-card-actions">
                  <button
                    type="button"
                    className="button small-secondary"
                    onClick={() => setSelectedProfileLearner(student)}
                    title="View full student profile and history"
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    className="button small-primary"
                    onClick={() => onNavigateToTab('growth', student.id)}
                    title="Open Growth Tracker for this student"
                  >
                    <TrendingUp size={12} /> View Progress
                  </button>

                  <button
                    type="button"
                    className="button small-secondary action-checkin-btn"
                    onClick={() => onNavigateToTab('mentorship', student.id)}
                    title="Schedule or start check-in"
                  >
                    <PhoneCall size={12} /> Check-in
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="empty-state learners-empty-box">
          <UserCheck size={36} />
          <h3>No students match your filter criteria</h3>
          <p>Try adjusting your search keywords or switching the status filter.</p>
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setStreamFilter('all')
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* 4. Student Detailed Profile Modal */}
      {selectedProfileLearner && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setSelectedProfileLearner(null)
          }}
        >
          <section
            className="modal learner-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Student Profile: ${selectedProfileLearner.name}`}
          >
            <div className="modal-heading">
              <div className="modal-student-top">
                <span className="eyebrow">
                  <UserCheck size={13} /> STUDENT PROFILE & ACADEMIC DOSSIER
                </span>
                <h2>{selectedProfileLearner.name}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedProfileLearner(null)}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-body learner-modal-content">
              {/* Safety banner */}
              <div className="academic-safety-mini-banner">
                <ShieldCheck size={16} />
                <span>
                  <strong>Child Safety & Privacy Standard:</strong> Direct personal phone/messaging coordinates are withheld to safeguard minor learners. All mentorship interactions occur within logged sessions.
                </span>
              </div>

              {/* Bio & Details Grid */}
              <div className="profile-detail-grid">
                <div className="profile-info-block">
                  <strong>Academic Stream & School</strong>
                  <p>{selectedProfileLearner.grade}</p>
                  <small>{selectedProfileLearner.location}</small>
                </div>

                <div className="profile-info-block">
                  <strong>Enrolled Status</strong>
                  <span
                    className="learner-status-pill inline"
                    style={{
                      backgroundColor: STATUS_CONFIG[selectedProfileLearner.status].bg,
                      color: STATUS_CONFIG[selectedProfileLearner.status].color,
                      borderColor: STATUS_CONFIG[selectedProfileLearner.status].border,
                    }}
                  >
                    {STATUS_CONFIG[selectedProfileLearner.status].label}
                  </span>
                  <small>Mentored since {selectedProfileLearner.enrolledDate}</small>
                </div>

                <div className="profile-info-block span-2">
                  <strong>Stated Learning Goals</strong>
                  <p>{selectedProfileLearner.learningGoals}</p>
                </div>

                <div className="profile-info-block span-2">
                  <strong>Mentor Observation & Background</strong>
                  <p>{selectedProfileLearner.bio}</p>
                </div>

                <div className="profile-info-block">
                  <strong>Syllabus Progress</strong>
                  <p className="large-stat">{selectedProfileLearner.overallProgress}%</p>
                  <small>Calculated from completed unit modules</small>
                </div>

                <div className="profile-info-block">
                  <strong>Quiz Average</strong>
                  <p className="large-stat">{selectedProfileLearner.quizAverage}%</p>
                  <small>{selectedProfileLearner.doubtsResolved} resolved doubts</small>
                </div>
              </div>

              {/* Enrolled Subjects List */}
              <div className="profile-subjects-section">
                <h4>
                  <BookOpen size={14} /> Enrolled Guidance Domains
                </h4>
                <div className="profile-subjects-list">
                  {selectedProfileLearner.subjects.map(sub => (
                    <span key={sub} className="subject-pill-large">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Navigation Footer */}
              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    const sid = selectedProfileLearner.id
                    setSelectedProfileLearner(null)
                    onNavigateToTab('mentorship', sid)
                  }}
                >
                  <PhoneCall size={14} /> Start Mentoring Check-in
                </button>

                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    const sid = selectedProfileLearner.id
                    setSelectedProfileLearner(null)
                    onNavigateToTab('pulse', sid)
                  }}
                >
                  <Sparkles size={14} /> Review Daily Pulse
                </button>

                <button
                  type="button"
                  className="button primary"
                  onClick={() => {
                    const sid = selectedProfileLearner.id
                    setSelectedProfileLearner(null)
                    onNavigateToTab('growth', sid)
                  }}
                >
                  <TrendingUp size={14} /> View Detailed Growth Tracker <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
