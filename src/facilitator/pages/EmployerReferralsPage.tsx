import { useState } from 'react'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  Lock,
  Plus,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react'
import type {
  EmployerReferral,
  FacilitatorState,
  ReferralStatus,
} from '../model'
import ReferCandidateModal from '../components/ReferCandidateModal'

interface EmployerReferralsPageProps {
  state: FacilitatorState
  onUpdateReferralStatus: (referralId: string, status: ReferralStatus, note?: string) => void
  onCreateReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
}

const STATUS_TABS: (ReferralStatus | 'All')[] = [
  'All',
  'Pending Consent',
  'Ready to Refer',
  'Referred — Demo',
  'Under Review',
  'Shortlisted',
  'Not Selected',
  'Closed',
]

const NEXT_STATUS_OPTIONS: Record<ReferralStatus, ReferralStatus[]> = {
  Draft: ['Pending Consent', 'Ready to Refer'],
  'Pending Consent': ['Referred — Demo', 'Closed'],
  'Ready to Refer': ['Referred — Demo', 'Closed'],
  'Referred — Demo': ['Under Review', 'Shortlisted', 'Not Selected', 'Closed'],
  'Under Review': ['Shortlisted', 'Not Selected', 'Closed'],
  Shortlisted: ['Closed'],
  'Not Selected': ['Closed'],
  Closed: ['Under Review'],
}

export default function EmployerReferralsPage({
  state,
  onUpdateReferralStatus,
  onCreateReferral,
}: EmployerReferralsPageProps) {
  const [activeTab, setActiveTab] = useState<ReferralStatus | 'All'>('All')
  const [isReferModalOpen, setIsReferModalOpen] = useState(false)
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState<string>('')
  const [targetStatusChange, setTargetStatusChange] = useState<{
    id: string
    nextStatus: ReferralStatus
  } | null>(null)

  const filteredReferrals = state.referrals.filter(ref => {
    if (activeTab === 'All') return true
    return ref.status === activeTab
  })

  const confirmStatusAdvance = () => {
    if (!targetStatusChange) return
    onUpdateReferralStatus(
      targetStatusChange.id,
      targetStatusChange.nextStatus,
      statusNote.trim() || undefined
    )
    setTargetStatusChange(null)
    setStatusNote('')
  }

  return (
    <div className="facilitator-page referrals-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Send size={14} /> Inclusive Hiring & Placement Pipeline
          </span>
          <h1>Employer Referrals Pipeline</h1>
          <p>
            Track candidate submissions, explicit consent verification, and application outcomes with inclusive employer partners.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button primary"
            onClick={() => setIsReferModalOpen(true)}
          >
            <Plus size={16} /> New Candidate Referral
          </button>
        </div>
      </div>

      {/* Consent & Privacy Notice */}
      <div className="notice-banner info-banner">
        <ShieldCheck size={18} className="banner-icon" />
        <div>
          <strong>Explicit Student Consent Protocol</strong>
          <p>
            Candidates retain full agency over where their profiles are submitted. Submissions flagged as{' '}
            <strong>Pending Consent</strong> cannot be transmitted to employers until candidate verification is logged.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="pipeline-tabs-wrapper">
        <div className="tabs-container">
          {STATUS_TABS.map(tab => {
            const count =
              tab === 'All'
                ? state.referrals.length
                : state.referrals.filter(r => r.status === tab).length

            return (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span>{tab}</span>
                <span className="tab-badge">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Referrals List / Table */}
      {filteredReferrals.length === 0 ? (
        <div className="empty-state-card">
          <Send size={36} />
          <h3>No referrals in this status</h3>
          <p>Click "New Candidate Referral" above to submit a prepared student profile.</p>
        </div>
      ) : (
        <div className="referral-cards-stack">
          {filteredReferrals.map(ref => {
            const isTimelineExpanded = expandedTimelineId === ref.id
            const availableNext = NEXT_STATUS_OPTIONS[ref.status] || []

            return (
              <div key={ref.id} className="referral-item-card">
                <div className="ref-card-main-header">
                  <div className="ref-candidate-block">
                    <div className="ref-candidate-name">
                      <h3>{ref.learnerName}</h3>
                      <span className="ref-edu-tag">{ref.learnerEducation}</span>
                    </div>
                    <div className="ref-date-submitted">
                      <Calendar size={13} /> Submitted on {ref.submissionDate}
                    </div>
                  </div>

                  <div className="ref-status-block">
                    <span
                      className={`status-pill pill-${ref.status
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')}`}
                    >
                      {ref.status}
                    </span>

                    {ref.consentVerified ? (
                      <span className="consent-verified-badge" title="Explicit Consent Verified">
                        <CheckCircle2 size={13} /> Consent Verified
                      </span>
                    ) : (
                      <span className="consent-pending-badge" title="Awaiting candidate confirmation">
                        <AlertCircle size={13} /> Pending Student Consent
                      </span>
                    )}
                  </div>
                </div>

                {/* Opportunity Block */}
                <div className="ref-opportunity-banner">
                  <Building2 size={16} />
                  <span>
                    Referred for <strong>{ref.opportunityTitle}</strong> at{' '}
                    <strong>{ref.employerName}</strong> ({ref.opportunityDomain})
                  </span>
                </div>

                {/* Match Rationale */}
                <div className="ref-rationale-box">
                  <div className="rationale-label">
                    <Info size={14} /> Facilitator Match Rationale
                  </div>
                  <p>{ref.matchRationale}</p>
                </div>

                {/* Facilitator Notes */}
                {ref.facilitatorNotes && (
                  <div className="ref-notes-box">
                    <strong>Facilitator Endorsement:</strong> {ref.facilitatorNotes}
                  </div>
                )}

                {/* Shared Artifacts / Package */}
                <div className="ref-shared-package">
                  <span className="shared-package-title">
                    <Lock size={13} /> Shared Data Package:
                  </span>
                  <div className="shared-tags">
                    {ref.sharedSkills.map(sk => (
                      <span key={sk} className="skill-chip">
                        {sk}
                      </span>
                    ))}
                    {ref.sharedProjects.map(pr => (
                      <span key={pr} className="project-chip">
                        Project: {pr}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline Expander & Next Steps Action Bar */}
                <div className="ref-card-footer">
                  <button
                    className="timeline-toggle-btn"
                    onClick={() =>
                      setExpandedTimelineId(isTimelineExpanded ? null : ref.id)
                    }
                  >
                    <Clock size={14} /> Audit Timeline ({ref.timeline.length} events){' '}
                    <ChevronDown
                      size={14}
                      className={isTimelineExpanded ? 'rotate' : ''}
                    />
                  </button>

                  <div className="status-advance-actions">
                    {availableNext.map(next => (
                      <button
                        key={next}
                        className="button secondary button-sm"
                        onClick={() =>
                          setTargetStatusChange({ id: ref.id, nextStatus: next })
                        }
                      >
                        Advance to {next}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expanded Timeline Audit Trail */}
                {isTimelineExpanded && (
                  <div className="timeline-expanded-section">
                    <h4>Audit Trail & Transmission History</h4>
                    <div className="timeline-steps">
                      {ref.timeline.map((step, idx) => (
                        <div key={idx} className="timeline-step-row">
                          <div className="timeline-step-indicator">
                            <span className="timeline-step-dot" />
                            {idx < ref.timeline.length - 1 && <span className="timeline-step-line" />}
                          </div>
                          <div className="timeline-step-content">
                            <div className="timeline-step-header">
                              <span className="timeline-step-status">{step.status}</span>
                              <span className="timeline-step-date">{step.date}</span>
                            </div>
                            <p className="timeline-step-note">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Status Advance Confirmation Dialog */}
      {targetStatusChange && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <h3>Advance Referral Status</h3>
              <button
                className="icon-button"
                onClick={() => setTargetStatusChange(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Change status to <strong>{targetStatusChange.nextStatus}</strong>?
              </p>
              <div className="form-group">
                <label className="field-label">
                  <span>Optional Status Update Note</span>
                  <span className="field-hint">Recorded in the audit timeline</span>
                </label>
                <textarea
                  rows={2}
                  className="textarea-field"
                  placeholder="e.g. Interview scheduled for candidate next Wednesday..."
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  onClick={() => setTargetStatusChange(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  onClick={confirmStatusAdvance}
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refer Candidate Modal */}
      <ReferCandidateModal
        isOpen={isReferModalOpen}
        onClose={() => setIsReferModalOpen(false)}
        learners={state.learners}
        opportunities={state.opportunities}
        onSubmitReferral={onCreateReferral}
      />
    </div>
  )
}
