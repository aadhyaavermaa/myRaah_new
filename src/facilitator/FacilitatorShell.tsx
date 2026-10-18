import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  Award,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Clock,
  Home,
  LogOut,
  Menu,
  Send,
  Settings,
  Target,
  UserPlus,
  X,
} from 'lucide-react'
import type { User } from '../types'
import { useFacilitatorStore } from './store'
import OverviewPage from './pages/OverviewPage'
import LearnerAllocationPage from './pages/LearnerAllocationPage'
import TalentPoolPage from './pages/TalentPoolPage'
import EmployerReferralsPage from './pages/EmployerReferralsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import LearnerProgressPage from './pages/LearnerProgressPage'
import FollowUpsPage from './pages/FollowUpsPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'

const toast = (detail: string) =>
  window.dispatchEvent(new CustomEvent('myraah-message', { detail }))

const Brand = () => (
  <Link to="/" className="brand" aria-label="MyRaah home">
    my<span>राह</span>
  </Link>
)

interface NavItem {
  to: string
  label: string
  icon: typeof Home
  badge?: (state: any) => number | null
}

const navItems: NavItem[] = [
  { to: '/app', label: 'Overview', icon: Home },
  {
    to: '/app/allocation',
    label: 'Learner Allocation',
    icon: UserPlus,
    badge: state => {
      const unassigned = state.learners.filter(
        (l: any) => l.assignmentStatus === 'unassigned'
      ).length
      return unassigned > 0 ? unassigned : null
    },
  },
  {
    to: '/app/talent-pool',
    label: 'Talent Pool',
    icon: Award,
    badge: state => {
      const shortlisted = state.learners.filter(
        (l: any) => l.isTalentShortlisted
      ).length
      return shortlisted > 0 ? shortlisted : null
    },
  },
  {
    to: '/app/referrals',
    label: 'Employer Referrals',
    icon: Send,
    badge: state => {
      const pending = state.referrals.filter(
        (r: any) => r.status === 'Pending Consent' || r.status === 'Ready to Refer'
      ).length
      return pending > 0 ? pending : null
    },
  },
  { to: '/app/opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { to: '/app/progress', label: 'Learner Progress', icon: Target },
  {
    to: '/app/follow-ups',
    label: 'Follow-ups',
    icon: Clock,
    badge: state => {
      const pending = state.followUps.filter((f: any) => !f.completed).length
      return pending > 0 ? pending : null
    },
  },
  { to: '/app/profile', label: 'Profile & Settings', icon: Settings },
]

export default function FacilitatorShell({
  user,
  onSignOut,
}: {
  user: User
  onSignOut: () => void
}) {
  const store = useFacilitatorStore(user)
  const { state } = store
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const currentNav =
    navItems.find(item => item.to === location.pathname) || navItems[0]

  const displayName = state.profile.name || user.name || 'Facilitator'

  return (
    <div className="app-shell facilitator-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand />
          <span className="demo-label">FACILITATOR</span>
        </div>

        <div className="workspace-label">FACILITATOR PORTAL</div>

        <nav>
          {navItems.map(item => {
            const IconComponent = item.icon
            const active = location.pathname === item.to
            const badgeCount = item.badge ? item.badge(state) : null

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${active ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
                {badgeCount !== null && (
                  <span className="nav-badge-pill">{badgeCount}</span>
                )}
                {active && <span className="active-dot" />}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <CircleHelp size={18} />
            <span>
              Real skills, verified talent.<br />
              <b>Empowering rural youth.</b>
            </span>
          </div>

          <button
            className="profile-button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <span className="avatar">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="profile-copy">
              <b>{displayName}</b>
              <small>{state.profile.institution || 'Career Facilitator'}</small>
            </span>
            <Settings size={16} />
          </button>

          {profileMenuOpen && (
            <div className="profile-menu">
              <div className="menu-user">
                Signed in as<br />
                <b>{user.email}</b>
                <small>Facilitator Demo Account</small>
              </div>
              <Link
                to="/app/profile"
                onClick={() => setProfileMenuOpen(false)}
              >
                Facilitator Profile
              </Link>
              <button onClick={onSignOut}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className="breadcrumb">
            <span>MyRaah</span>
            <ChevronRight size={14} />
            <span className="breadcrumb-sub">Facilitator</span>
            <ChevronRight size={14} />
            <b>{currentNav.label}</b>
          </div>

          <div className="top-actions">
            <button
              className="icon-button notification-button"
              title="Notifications"
              onClick={() => toast(state.updates[0] || 'You’re all caught up.')}
            >
              <Bell size={18} />
              {state.updates.length > 0 && <i />}
            </button>

            <button
              className="top-avatar"
              aria-label="Profile"
              onClick={() =>
                toast(
                  `Facilitator: ${displayName} · ${state.profile.institution}`
                )
              }
            >
              {displayName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            {navItems.map(item => {
              const IconComponent = item.icon
              const active = location.pathname === item.to
              const badgeCount = item.badge ? item.badge(state) : null

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? 'active' : ''}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                  {badgeCount !== null && (
                    <span className="mobile-nav-badge">{badgeCount}</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {/* Dynamic Pages Routing */}
        <div className="page-frame">
          <Routes>
            <Route
              index
              element={
                <OverviewPage
                  state={state}
                  onUpdateReferralStatus={store.updateReferralStatus}
                  onCompleteFollowUp={store.completeFollowUp}
                  onCreateReferral={store.createEmployerReferral}
                  onAddFollowUp={store.addFollowUp}
                />
              }
            />
            <Route
              path="allocation"
              element={
                <LearnerAllocationPage
                  state={state}
                  onAllocateLearners={store.allocateLearners}
                  onUnassignLearner={store.unassignLearner}
                />
              }
            />
            <Route
              path="talent-pool"
              element={
                <TalentPoolPage
                  state={state}
                  onToggleShortlist={store.toggleTalentShortlist}
                  onCreateReferral={store.createEmployerReferral}
                />
              }
            />
            <Route
              path="referrals"
              element={
                <EmployerReferralsPage
                  state={state}
                  onUpdateReferralStatus={store.updateReferralStatus}
                  onCreateReferral={store.createEmployerReferral}
                />
              }
            />
            <Route
              path="opportunities"
              element={
                <OpportunitiesPage
                  state={state}
                  onCreateReferral={store.createEmployerReferral}
                />
              }
            />
            <Route
              path="progress"
              element={
                <LearnerProgressPage
                  state={state}
                  onUpdateSupportStatus={store.updateLearnerSupportStatus}
                  onAddFollowUp={store.addFollowUp}
                  onCreateReferral={store.createEmployerReferral}
                />
              }
            />
            <Route
              path="follow-ups"
              element={
                <FollowUpsPage
                  state={state}
                  onAddFollowUp={store.addFollowUp}
                  onCompleteFollowUp={store.completeFollowUp}
                />
              }
            />
            <Route
              path="profile"
              element={
                <ProfileSettingsPage
                  state={state}
                  user={user}
                  onUpdateProfile={store.updateProfile}
                  onResetDemoData={store.resetDemoData}
                />
              }
            />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
