import { useMemo } from 'react'
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  ArrowRight,
  User,
  Sparkles,
  Flame,
  ArrowUpRight,
  Check,
  Target,
} from 'lucide-react'
import type { LearnerRecord, StudentGrowthData } from '../../types'
import { learnerStore } from '../../services/learnerStore'

interface GrowthTrackerSectionProps {
  selectedStudentId: string
  onSelectStudent: (studentId: string) => void
  onNavigateToTab: (tabId: 'learners' | 'mentorship' | 'pulse', studentId: string) => void
}

export default function GrowthTrackerSection({
  selectedStudentId,
  onSelectStudent,
  onNavigateToTab,
}: GrowthTrackerSectionProps) {
  const learners = learnerStore.getAllLearners()

  // Ensure valid selected student
  const currentStudent: LearnerRecord = useMemo(() => {
    const found = learners.find(l => l.id === selectedStudentId)
    return found || learners[0]
  }, [learners, selectedStudentId])

  const growthData: StudentGrowthData | null = useMemo(() => {
    return learnerStore.getGrowthData(currentStudent.id)
  }, [currentStudent.id])

  // Calculate dynamic stats
  const topics = growthData?.topics || []
  const completedTopics = topics.filter(t => t.status === 'completed')
  const inProgressTopics = topics.filter(t => t.status === 'in_progress')
  const pendingTopics = topics.filter(t => t.status === 'pending')

  const quizScores = growthData?.quizScores || []
  const avgQuizScore = quizScores.length
    ? Math.round(quizScores.reduce((acc, q) => acc + q.scorePercent, 0) / quizScores.length)
    : currentStudent.quizAverage

  const weeklyActivity = growthData?.weeklyActivity || []
  const totalWeeklyHours = weeklyActivity.reduce((acc, w) => acc + w.hours, 0)
  const maxDayHours = Math.max(...weeklyActivity.map(w => w.hours), 5)

  // Toggle topic status for prototype demonstration
  const handleToggleTopic = (topicId: string, currentStatus: 'completed' | 'in_progress' | 'pending') => {
    const nextStatus = currentStatus === 'completed' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'in_progress'
    learnerStore.updateTopicStatus(currentStudent.id, topicId, nextStatus)
  }

  return (
    <div className="growth-tracker-workspace">
      {/* 1. Header with Student Selector & Link to My Learners */}
      <div className="section-heading-with-meta">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">
              <TrendingUp size={13} /> STUDENT GROWTH & LEARNING ANALYTICS
            </span>
            <span className="demo-label">PROTOTYPE CALCULATED METRICS</span>
          </div>
          <h2>Individual Growth Tracker</h2>
          <p>
            Track syllabus completion, diagnostic quiz trends, weekly study engagement, and critical improvement areas.
          </p>
        </div>

        {/* Student Selector Dropdown */}
        <div className="growth-student-selector-bar">
          <label htmlFor="student-picker" className="selector-label">
            <User size={14} /> Selecting Learner:
          </label>
          <select
            id="student-picker"
            className="growth-student-select"
            value={currentStudent.id}
            onChange={e => onSelectStudent(e.target.value)}
          >
            {learners.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.grade.split('·')[0].trim()})
              </option>
            ))}
          </select>

          <button
            type="button"
            className="button small-secondary"
            onClick={() => onNavigateToTab('learners', currentStudent.id)}
            title="View student in My Learners directory"
          >
            Learner Profile <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="growth-kpi-grid">
        <div className="growth-kpi-card highlight-teal">
          <div className="kpi-top">
            <span className="kpi-label">Syllabus Completion</span>
            <Target size={18} className="kpi-icon" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{currentStudent.overallProgress}%</span>
            <span className="kpi-badge success">
              {completedTopics.length} of {topics.length} units
            </span>
          </div>
          <div className="progress-track-small">
            <div
              className="progress-fill-small"
              style={{ width: `${currentStudent.overallProgress}%`, backgroundColor: '#00b3a4' }}
            />
          </div>
          <small className="kpi-subtext">{inProgressTopics.length} units currently in progress</small>
        </div>

        <div className="growth-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Diagnostic Quiz Average</span>
            <BarChart2 size={18} className="kpi-icon" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{avgQuizScore}%</span>
            <span className="kpi-badge neutral">{quizScores.length} tests taken</span>
          </div>
          <div className="progress-track-small">
            <div
              className="progress-fill-small"
              style={{ width: `${avgQuizScore}%`, backgroundColor: avgQuizScore >= 75 ? '#27ae60' : '#e67e22' }}
            />
          </div>
          <small className="kpi-subtext">Benchmark: 70%+ required for entrance</small>
        </div>

        <div className="growth-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Doubts Resolved</span>
            <HelpCircle size={18} className="kpi-icon" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">
              {currentStudent.doubtsResolved} / {currentStudent.doubtsRaised}
            </span>
            <span className="kpi-badge success">
              {Math.round((currentStudent.doubtsResolved / (currentStudent.doubtsRaised || 1)) * 100)}% solved
            </span>
          </div>
          <small className="kpi-subtext">
            {currentStudent.doubtsRaised - currentStudent.doubtsResolved > 0
              ? `${currentStudent.doubtsRaised - currentStudent.doubtsResolved} pending resolution`
              : 'All academic doubts answered'}
          </small>
        </div>

        <div className="growth-kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Weekly Study Hours</span>
            <Flame size={18} className="kpi-icon streak" />
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value">{totalWeeklyHours.toFixed(1)} hrs</span>
            <span className="kpi-badge streak">Active 6 Days</span>
          </div>
          <small className="kpi-subtext">Avg {(totalWeeklyHours / 7).toFixed(1)} hours/day consistency</small>
        </div>
      </div>

      {/* 3. Main Two-Column Analytics Layout */}
      <div className="growth-content-grid">
        {/* Left Column: Topics Completed vs Pending */}
        <section className="growth-panel topics-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CURRICULUM BREAKDOWN</span>
              <h3>Topics Completed vs Pending</h3>
              <p>Click any topic status to simulate progress updates.</p>
            </div>
            <div className="topics-status-summary">
              <span className="status-chip completed-chip">
                <CheckCircle2 size={12} /> {completedTopics.length} Completed
              </span>
              <span className="status-chip inprogress-chip">
                <Clock size={12} /> {inProgressTopics.length} In Progress
              </span>
              <span className="status-chip pending-chip">
                {pendingTopics.length} Pending
              </span>
            </div>
          </div>

          <div className="topics-list">
            {topics.map(topic => (
              <div key={topic.id} className={`topic-item topic-${topic.status}`}>
                <div className="topic-main">
                  <div className="topic-title-row">
                    <strong>{topic.title}</strong>
                    <span className="topic-subject-tag">{topic.subject}</span>
                  </div>

                  <div className="topic-progress-row">
                    <div className="progress-track-small">
                      <div
                        className="progress-fill-small"
                        style={{
                          width: `${topic.progressPercent}%`,
                          backgroundColor:
                            topic.status === 'completed'
                              ? '#00b3a4'
                              : topic.status === 'in_progress'
                              ? '#f39c12'
                              : '#cbd5e1',
                        }}
                      />
                    </div>
                    <span className="progress-percentage-label">
                      {topic.progressPercent}%
                    </span>
                  </div>
                </div>

                <div className="topic-action-col">
                  <button
                    type="button"
                    className={`topic-status-toggle-btn status-${topic.status}`}
                    onClick={() => handleToggleTopic(topic.id, topic.status)}
                    title="Click to toggle status in prototype"
                  >
                    {topic.status === 'completed' ? (
                      <>
                        <Check size={12} /> Done
                      </>
                    ) : topic.status === 'in_progress' ? (
                      <>
                        <Clock size={12} /> Working
                      </>
                    ) : (
                      'Pending'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Mentorship Hook */}
          <div className="panel-bottom-cta">
            <span>Need to adjust syllabus pacing for {currentStudent.name}?</span>
            <button
              type="button"
              className="text-link"
              onClick={() => onNavigateToTab('mentorship', currentStudent.id)}
            >
              Start Mentorship Check-in <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Right Column: Weekly Activity Chart & Quiz History */}
        <div className="growth-right-stack">
          {/* Weekly Learning Activity Chart */}
          <section className="growth-panel activity-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">ENGAGEMENT LOG</span>
                <h3>Weekly Study Activity</h3>
                <p>Hours logged across study materials & audio notes this week.</p>
              </div>
              <span className="demo-label">LIVE ENGAGEMENT</span>
            </div>

            {/* Custom Bar Chart Visualizer */}
            <div className="weekly-activity-chart">
              {weeklyActivity.map(dayItem => {
                const heightPercent = Math.max(12, Math.round((dayItem.hours / maxDayHours) * 100))
                return (
                  <div key={dayItem.day} className="chart-bar-group">
                    <div className="bar-hover-val">{dayItem.hours}h</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: dayItem.hours >= 3.5 ? '#00b3a4' : dayItem.hours > 0 ? '#63c5ba' : '#e2e8f0',
                        }}
                      />
                    </div>
                    <span className="bar-day-label">{dayItem.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="chart-legend-row">
              <span className="legend-item">
                <span className="legend-dot teal" /> Target (3+ hrs/day)
              </span>
              <span className="legend-item">
                <span className="legend-dot light-teal" /> Moderate Study
              </span>
              <span className="total-legend-note">Total: {totalWeeklyHours.toFixed(1)} hrs logged</span>
            </div>
          </section>

          {/* Quiz Scores Breakdown */}
          <section className="growth-panel quizzes-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">ASSESSMENT RESULTS</span>
                <h3>Recent Diagnostic Quizzes</h3>
              </div>
              <span className="average-chip">Average: {avgQuizScore}%</span>
            </div>

            <div className="quizzes-list">
              {quizScores.map(quiz => (
                <div key={quiz.id} className="quiz-score-card">
                  <div className="quiz-info">
                    <strong>{quiz.title}</strong>
                    <div className="quiz-meta-line">
                      <span>{quiz.subject}</span>
                      <span>·</span>
                      <span>{quiz.totalQuestions} questions</span>
                      <span>·</span>
                      <span className="quiz-date">{quiz.date}</span>
                    </div>
                  </div>

                  <div className="quiz-score-badge">
                    <span
                      className={`score-pill ${
                        quiz.scorePercent >= 80 ? 'high-score' : quiz.scorePercent >= 65 ? 'mid-score' : 'low-score'
                      }`}
                    >
                      {quiz.scorePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* 4. Bottom Row: Areas Requiring Improvement & Achievements */}
      <div className="growth-bottom-grid">
        {/* Areas Requiring Improvement */}
        <section className="growth-panel improvement-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DIAGNOSTIC ALERTS</span>
              <h3>Areas Requiring Mentor Attention</h3>
              <p>Identified concepts from recent quizzes and student doubt inquiries.</p>
            </div>
            <AlertTriangle size={18} className="alert-icon" />
          </div>

          {growthData?.improvementAreas && growthData.improvementAreas.length > 0 ? (
            <div className="improvements-list">
              {growthData.improvementAreas.map(item => (
                <div key={item.id} className={`improvement-callout severity-${item.severity}`}>
                  <div className="improvement-header">
                    <strong>{item.topic}</strong>
                    <span className="severity-pill">{item.severity === 'high' ? 'High Priority' : 'Needs Practice'}</span>
                  </div>
                  <p>{item.note}</p>
                  <div className="improvement-action-link">
                    <button
                      type="button"
                      className="button-link-subtle"
                      onClick={() => onNavigateToTab('mentorship', currentStudent.id)}
                    >
                      Address in next check-in →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="all-clear-box">
              <CheckCircle2 size={24} color="#00b3a4" />
              <p>No high-severity bottlenecks identified! Student is pacing well.</p>
            </div>
          )}
        </section>

        {/* Milestones & Badges */}
        <section className="growth-panel milestones-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MILESTONES & ACHIEVEMENTS</span>
              <h3>Earned Badges & Goals</h3>
            </div>
            <Award size={18} color="#e69c24" />
          </div>

          <div className="milestones-content-split">
            {/* Badges List */}
            <div className="badges-grid">
              {growthData?.achievements && growthData.achievements.length > 0 ? (
                growthData.achievements.map(ach => (
                  <div key={ach.id} className="achievement-badge-card">
                    <div className="badge-icon-box">
                      <Sparkles size={16} />
                    </div>
                    <div className="badge-copy">
                      <strong>{ach.title}</strong>
                      <small>{ach.desc}</small>
                      <span className="earned-date">Unlocked {ach.earnedDate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-badges-yet">Working towards first milestone badges.</p>
              )}
            </div>

            {/* Target Milestones */}
            <div className="milestones-checklist">
              <h4>Target Milestones</h4>
              {growthData?.milestones.map(m => (
                <div key={m.id} className={`milestone-check-item ${m.completed ? 'completed' : ''}`}>
                  <div className="milestone-indicator">
                    {m.completed ? <Check size={12} /> : null}
                  </div>
                  <div className="milestone-text">
                    <span className="m-title">{m.title}</span>
                    <small className="m-target">Target: {m.targetDate}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
