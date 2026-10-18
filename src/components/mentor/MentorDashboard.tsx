import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  Calendar,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import type { User } from '../../types'
import { mentorStore } from '../../services/mentorStore'
import { learnerStore } from '../../services/learnerStore'
import MyLearnersSection from './MyLearnersSection'
import GrowthTrackerSection from './GrowthTrackerSection'
import MentorshipHubSection from './MentorshipHubSection'
import DailyPulseSection from './DailyPulseSection'

interface MentorDashboardProps {
  user: User
}

type DashboardTab = 'learners' | 'growth' | 'mentorship' | 'pulse'

export default function MentorDashboard({ user }: MentorDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial tab from URL param or default to 'learners'
  const initialTabParam = searchParams.get('tab') as DashboardTab | null
  const initialStudentParam = searchParams.get('student')

  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (initialTabParam && ['learners', 'growth', 'mentorship', 'pulse'].includes(initialTabParam)) {
      return initialTabParam
    }
    return 'learners'
  })

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return initialStudentParam || 'stud-pooja'
  })

  const [, setTick] = useState(0)

  // Listen to learner store updates
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1)
    window.addEventListener('myraah-learner-update', handleUpdate)
    return () => window.removeEventListener('myraah-learner-update', handleUpdate)
  }, [])

  // Sync tab change to URL
  const switchTab = (tab: DashboardTab, studentId?: string) => {
    setActiveTab(tab)
    if (studentId) {
      setSelectedStudentId(studentId)
      setSearchParams({ tab, student: studentId }, { replace: true })
    } else {
      setSearchParams({ tab, student: selectedStudentId }, { replace: true })
    }
  }

  const mentorId = user.mentorProfileId || user.email
  const mentor = mentorStore.getMentorById(mentorId)
  const stats = mentor ? mentorStore.getMentorStats(mentor.id) : null
  const metrics = learnerStore.getDashboardMetrics(mentorId)

  return (
    <div className="upgraded-mentor-dashboard">
      {/* 1. Header Banner & Quick Actions */}
      <header className="dashboard-hero-banner">
        <div className="hero-welcome-copy">
          <div className="eyebrow-row">
            <span className="eyebrow">
              <ShieldCheck size={13} /> VERIFIED MENTOR WORKSPACE
            </span>
            <span className="status-pill status-open">
              <Sparkles size={12} /> Live Dashboard
            </span>
          </div>

          <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
          <p className="hero-lead">
            {mentor?.headline || 'Guiding rural students through verified academic pathways, scholarships, and skill development.'}
          </p>

          <div className="hero-shortcuts-row">
            <Link to="/app/mentor-profile" className="button small-secondary">
              <GraduationCap size={14} /> My Teaching Portfolio
            </Link>
            <Link to="/app/doubts" className="button small-secondary">
              <HelpCircle size={14} /> Student Doubts ({stats?.doubtsResolved ?? 0} Solved)
            </Link>
          </div>
        </div>

        {/* Top 4 Quick Impact Counters */}
        <div className="hero-kpi-mosaic">
          <button
            type="button"
            className={`kpi-mosaic-cell ${activeTab === 'learners' ? 'active-cell' : ''}`}
            onClick={() => switchTab('learners')}
          >
            <span className="kpi-mosaic-num">{metrics.totalStudents}</span>
            <span className="kpi-mosaic-title">Assigned Learners</span>
            <small className="kpi-mosaic-sub">{metrics.onTrackStudents} on track</small>
          </button>

          <button
            type="button"
            className={`kpi-mosaic-cell ${activeTab === 'growth' ? 'active-cell' : ''}`}
            onClick={() => switchTab('growth')}
          >
            <span className="kpi-mosaic-num">{metrics.needsAttention}</span>
            <span className="kpi-mosaic-title">Need Attention</span>
            <small className="kpi-mosaic-sub">Review growth bottlenecks</small>
          </button>

          <button
            type="button"
            className={`kpi-mosaic-cell ${activeTab === 'mentorship' ? 'active-cell' : ''}`}
            onClick={() => switchTab('mentorship')}
          >
            <span className="kpi-mosaic-num">{metrics.upcomingCheckins}</span>
            <span className="kpi-mosaic-title">Upcoming Check-ins</span>
            <small className="kpi-mosaic-sub">{metrics.completedSessions} completed</small>
          </button>

          <button
            type="button"
            className={`kpi-mosaic-cell ${activeTab === 'pulse' ? 'active-cell' : ''}`}
            onClick={() => switchTab('pulse')}
          >
            <span className="kpi-mosaic-num pulse-alert">
              {metrics.pendingReflections}
            </span>
            <span className="kpi-mosaic-title">Pending Reflections</span>
            <small className="kpi-mosaic-sub">Daily pulse reviews</small>
          </button>
        </div>
      </header>

      {/* 2. Primary 4-Section Segmented Navigation Tabs */}
      <nav className="dashboard-section-tabs-bar" aria-label="Mentor Dashboard Workspaces">
        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'learners' ? 'active' : ''}`}
          onClick={() => switchTab('learners')}
        >
          <Users size={17} />
          <span>1. My Learners</span>
          <span className="dash-tab-count">{metrics.totalStudents}</span>
        </button>

        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'growth' ? 'active' : ''}`}
          onClick={() => switchTab('growth')}
        >
          <TrendingUp size={17} />
          <span>2. Growth Tracker</span>
        </button>

        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'mentorship' ? 'active' : ''}`}
          onClick={() => switchTab('mentorship')}
        >
          <Calendar size={17} />
          <span>3. Mentorship Hub</span>
          {metrics.upcomingCheckins > 0 && (
            <span className="dash-tab-count active-count">{metrics.upcomingCheckins}</span>
          )}
        </button>

        <button
          type="button"
          className={`dash-tab-btn ${activeTab === 'pulse' ? 'active' : ''}`}
          onClick={() => switchTab('pulse')}
        >
          <Sparkles size={17} />
          <span>4. Daily Pulse</span>
          {metrics.pendingReflections > 0 && (
            <span className="dash-tab-count pulse-badge">{metrics.pendingReflections}</span>
          )}
        </button>
      </nav>

      {/* 3. Active Workspace Section Content */}
      <main className="dashboard-workspace-viewport">
        {activeTab === 'learners' && (
          <MyLearnersSection
            mentorId={mentorId}
            currentUser={user}
            onNavigateToTab={(tab, studentId) => switchTab(tab, studentId)}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthTrackerSection
            selectedStudentId={selectedStudentId}
            onSelectStudent={id => {
              setSelectedStudentId(id)
              setSearchParams({ tab: 'growth', student: id }, { replace: true })
            }}
            onNavigateToTab={(tab, studentId) => switchTab(tab, studentId)}
          />
        )}

        {activeTab === 'mentorship' && (
          <MentorshipHubSection
            mentorId={mentorId}
            currentUser={user}
            initialStudentId={selectedStudentId}
            onNavigateToTab={(tab, studentId) => switchTab(tab, studentId)}
          />
        )}

        {activeTab === 'pulse' && (
          <DailyPulseSection
            mentorId={mentorId}
            currentUser={user}
            initialStudentId={selectedStudentId}
            onNavigateToTab={(tab, studentId) => switchTab(tab, studentId)}
          />
        )}
      </main>
    </div>
  )
}
