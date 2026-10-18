import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type {
  EmployerReferral,
  FacilitatorState,
  FollowUpReminder,
} from '../model'
import ReferCandidateModal from '../components/ReferCandidateModal'
import ScheduleFollowUpModal from '../components/ScheduleFollowUpModal'

interface OverviewPageProps {
  state: FacilitatorState
  onUpdateReferralStatus: (id: string, status: any, note?: string) => void
  onCompleteFollowUp: (id: string, note?: string) => void
  onCreateReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
  onAddFollowUp: (
    reminder: Omit<FollowUpReminder, 'id' | 'completed'>
  ) => void
}

export default function OverviewPage({
  state,
  onCompleteFollowUp,
  onCreateReferral,
  onAddFollowUp,
}: OverviewPageProps) {
  const [showReferModal, setShowReferModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)

  const myAssigned = state.learners.filter(l => l.assignmentStatus === 'assigned_to_me')
  const needsSupport = myAssigned.filter(l => l.currentStatus === 'needs_support' || l.currentStatus === 'critical')
  const talentShortlisted = state.learners.filter(l => l.isTalentShortlisted)
  const activeReferrals = state.referrals.filter(r => r.status !== 'Closed' && r.status !== 'Not Selected')
  const pendingFollowUps = state.followUps.filter(f => !f.completed)
  const highPriorityFollowUps = pendingFollowUps.filter(f => f.priority === 'High')

  return (
    <div className="facilitator-page overview-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Sparkles size={14} /> Facilitator Command Hub
          </span>
          <h1>Welcome, {state.profile.name}</h1>
          <p>
            Coordinating rural youth enablement at <strong>{state.profile.institution}</strong> · {state.profile.location}
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button secondary"
            onClick={() => setShowFollowUpModal(true)}
          >
            <Calendar size={16} /> Schedule Check-in
          </button>
          <button
            className="button primary"
            onClick={() => setShowReferModal(true)}
          >
            <Send size={16} /> Refer Candidate
          </button>
        </div>
      </div>

      {/* Transparent Matching & Student Consent Info Banner */}
      <div className="facilitator-notice-card">
        <div className="notice-icon-wrap">
          <Info size={20} />
        </div>
        <div className="notice-content">
          <div className="notice-title">Transparent Matching & Inclusive Referral Protocol</div>
          <p>
            All learner compatibility scores are transparent rule-based indicators calculated from verified practical projects,
            technical skills, and student career goals. Student profiles are never forwarded to employers without explicit
            candidate review and verified consent.
          </p>
        </div>
        <Link to="/app/allocation" className="notice-link">
          Review Allocation Rules <ArrowRight size={14} />
        </Link>
      </div>

      {/* 5-Card Dynamic KPI Mosaic */}
      <div className="kpi-mosaic-grid">
        {/* KPI 1 */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-wrap icon-blue">
              <Users size={20} />
            </span>
            <span className="kpi-delta positive">
              <TrendingUp size={13} /> {myAssigned.length} active
            </span>
          </div>
          <div className="kpi-value">{myAssigned.length}</div>
          <div className="kpi-label">Assigned Learners</div>
          <div className="kpi-footer">
            {needsSupport.length > 0 ? (
              <span className="text-warning">
                <AlertCircle size={13} /> {needsSupport.length} need targeted support
              </span>
            ) : (
              <span className="text-success">All currently on track</span>
            )}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-wrap icon-purple">
              <Award size={20} />
            </span>
            <span className="kpi-badge-pill">Verified</span>
          </div>
          <div className="kpi-value">{talentShortlisted.length}</div>
          <div className="kpi-label">Talent Pool Shortlist</div>
          <div className="kpi-footer">
            <span>Observable practical criteria verified</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-wrap icon-emerald">
              <Send size={20} />
            </span>
            <span className="kpi-delta positive">Active</span>
          </div>
          <div className="kpi-value">{activeReferrals.length}</div>
          <div className="kpi-label">Employer Referrals</div>
          <div className="kpi-footer">
            <span>Across {state.opportunities.length} partner employers</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-wrap icon-amber">
              <Clock size={20} />
            </span>
            {highPriorityFollowUps.length > 0 && (
              <span className="kpi-badge-pill pill-urgent">
                {highPriorityFollowUps.length} High Priority
              </span>
            )}
          </div>
          <div className="kpi-value">{pendingFollowUps.length}</div>
          <div className="kpi-label">Pending Follow-ups</div>
          <div className="kpi-footer">
            <span>Check-ins and application support</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon-wrap icon-teal">
              <BriefcaseBusiness size={20} />
            </span>
            <span className="kpi-badge-pill">Partner</span>
          </div>
          <div className="kpi-value">{state.opportunities.length}</div>
          <div className="kpi-label">Open Opportunities</div>
          <div className="kpi-footer">
            <span>Apprenticeships & internships ready</span>
          </div>
        </div>
      </div>

      {/* Main Overview Columns */}
      <div className="overview-two-col">
        {/* Left Column: Assigned Learners & Pending Referrals */}
        <div className="overview-col-left">
          {/* Quick Actions Bar */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>Quick Facilitator Actions</h3>
                <p>Frequent enablement tasks and workflow transitions</p>
              </div>
            </div>
            <div className="quick-action-tiles">
              <Link to="/app/allocation" className="action-tile">
                <span className="action-tile-icon icon-blue">
                  <UserPlus size={18} />
                </span>
                <span className="action-tile-title">Allocate Learners</span>
                <span className="action-tile-desc">Assign from batch queue</span>
              </Link>

              <Link to="/app/talent-pool" className="action-tile">
                <span className="action-tile-icon icon-purple">
                  <Award size={18} />
                </span>
                <span className="action-tile-title">Talent Pool</span>
                <span className="action-tile-desc">Review work & projects</span>
              </Link>

              <button
                type="button"
                className="action-tile"
                onClick={() => setShowReferModal(true)}
              >
                <span className="action-tile-icon icon-emerald">
                  <Send size={18} />
                </span>
                <span className="action-tile-title">Refer to Partner</span>
                <span className="action-tile-desc">Submit candidate package</span>
              </button>

              <Link to="/app/opportunities" className="action-tile">
                <span className="action-tile-icon icon-teal">
                  <BriefcaseBusiness size={18} />
                </span>
                <span className="action-tile-title">Browse Roles</span>
                <span className="action-tile-desc">Match criteria & skills</span>
              </Link>
            </div>
          </div>

          {/* Assigned Learners Snapshot */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>My Assigned Learners ({myAssigned.length})</h3>
                <p>Learners under your active mentorship and vocational guidance</p>
              </div>
              <Link to="/app/progress" className="header-link">
                View All Progress <ArrowRight size={14} />
              </Link>
            </div>

            <div className="learner-quick-grid">
              {myAssigned.slice(0, 4).map(learner => (
                <div key={learner.id} className="learner-card-item">
                  <img
                    src={learner.avatarUrl}
                    alt={learner.name}
                    className="learner-card-avatar"
                  />
                  <div className="learner-card-body">
                    <div className="learner-card-top">
                      <span className="learner-card-name">{learner.name}</span>
                      <span
                        className={`status-indicator-tag ${
                          learner.currentStatus === 'on_track'
                            ? 'tag-success'
                            : learner.currentStatus === 'needs_support'
                            ? 'tag-warning'
                            : 'tag-critical'
                        }`}
                      >
                        {learner.currentStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="learner-card-meta">
                      <span>{learner.educationLevel}</span> · <span>{learner.location}</span>
                    </div>
                    <div className="learner-card-track">
                      <span className="track-pill">{learner.supportTrack || 'General Track'}</span>
                    </div>
                    <div className="learner-card-progress-bar">
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${learner.overallProgress}%` }}
                        />
                      </div>
                      <span className="bar-label">{learner.overallProgress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employer Referrals Pipeline Snapshot */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>Referral Pipeline Snapshot</h3>
                <p>Status of candidate packages submitted to inclusive employers</p>
              </div>
              <Link to="/app/referrals" className="header-link">
                View Full Pipeline ({state.referrals.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="referral-list-snapshot">
              {state.referrals.slice(0, 3).map(ref => (
                <div key={ref.id} className="referral-snapshot-row">
                  <div className="ref-learner-col">
                    <strong>{ref.learnerName}</strong>
                    <span>{ref.learnerEducation}</span>
                  </div>
                  <div className="ref-arrow">
                    <ArrowRight size={14} />
                  </div>
                  <div className="ref-employer-col">
                    <strong>{ref.opportunityTitle}</strong>
                    <span className="employer-name-line">
                      <Building2 size={12} /> {ref.employerName}
                    </span>
                  </div>
                  <div className="ref-status-col">
                    <span
                      className={`status-pill pill-${ref.status
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')}`}
                    >
                      {ref.status}
                    </span>
                    {ref.consentVerified ? (
                      <span className="consent-verified-badge" title="Explicit Consent Verified">
                        <CheckCircle2 size={12} /> Consent OK
                      </span>
                    ) : (
                      <span className="consent-pending-badge" title="Awaiting Student Consent">
                        Pending Consent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Follow-ups, Opportunities & Activity */}
        <div className="overview-col-right">
          {/* Upcoming Follow-ups Card */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>Upcoming Follow-ups</h3>
                <p>Personal check-ins & critical deadlines</p>
              </div>
              <Link to="/app/follow-ups" className="header-link">
                All Reminders <ArrowRight size={14} />
              </Link>
            </div>

            <div className="follow-up-card-list">
              {pendingFollowUps.length === 0 ? (
                <div className="empty-sublist">All scheduled follow-ups are completed!</div>
              ) : (
                pendingFollowUps.slice(0, 4).map(fu => (
                  <div key={fu.id} className="follow-up-item">
                    <div className="fu-header">
                      <div className="fu-title-line">
                        <span className={`priority-dot priority-${fu.priority.toLowerCase()}`} />
                        <strong>{fu.learnerName}</strong>
                        <span className="fu-type-tag">{fu.type}</span>
                      </div>
                      <span className="fu-date">
                        <Clock size={12} /> {fu.dueDate}
                      </span>
                    </div>
                    <p className="fu-notes">{fu.notes}</p>
                    <div className="fu-actions">
                      <button
                        className="fu-done-btn"
                        onClick={() => onCompleteFollowUp(fu.id)}
                      >
                        <CheckCircle2 size={13} /> Mark Done
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Partner Opportunities Preview */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>Partner Roles</h3>
                <p>Opportunities seeking rural candidates</p>
              </div>
              <Link to="/app/opportunities" className="header-link">
                View All ({state.opportunities.length}) <ArrowRight size={14} />
              </Link>
            </div>

            <div className="opportunity-mini-list">
              {state.opportunities.slice(0, 3).map(opp => (
                <div key={opp.id} className="opportunity-mini-card">
                  <div className="opp-mini-top">
                    <h4>{opp.title}</h4>
                    <span className="opp-type-badge">{opp.type}</span>
                  </div>
                  <div className="opp-mini-employer">
                    <Building2 size={13} /> {opp.employerName} · {opp.location}
                  </div>
                  <div className="opp-mini-skills">
                    {opp.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="skill-mini-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Audit Feed */}
          <div className="dashboard-section-card">
            <div className="card-section-header">
              <div>
                <h3>Platform Activity & Audit</h3>
                <p>Recent actions in your facilitator workspace</p>
              </div>
            </div>

            <div className="activity-feed">
              {state.updates.slice(0, 5).map((update, idx) => (
                <div key={idx} className="activity-feed-item">
                  <span className="activity-dot" />
                  <span className="activity-text">{update}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReferCandidateModal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        learners={state.learners}
        opportunities={state.opportunities}
        onSubmitReferral={onCreateReferral}
      />

      <ScheduleFollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        learners={state.learners}
        onAddFollowUp={onAddFollowUp}
      />
    </div>
  )
}
