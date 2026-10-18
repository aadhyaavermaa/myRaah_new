import { useState, useId } from 'react'
import {
  CheckCircle2,
  Info,
  Lock,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import type {
  AllocatedLearner,
  EmployerReferral,
  FacilitatorOpportunity,
} from '../model'
import { evaluateOpportunityMatch } from '../store'

interface ReferCandidateModalProps {
  isOpen: boolean
  onClose: () => void
  learners: AllocatedLearner[]
  opportunities: FacilitatorOpportunity[]
  initialLearnerId?: string
  initialOpportunityId?: string
  onSubmitReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
}

export default function ReferCandidateModal({
  isOpen,
  onClose,
  learners,
  opportunities,
  initialLearnerId,
  initialOpportunityId,
  onSubmitReferral,
}: ReferCandidateModalProps) {
  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(
    initialLearnerId || (learners[0]?.id ?? '')
  )
  const [selectedOppId, setSelectedOppId] = useState<string>(
    initialOpportunityId || (opportunities[0]?.id ?? '')
  )
  const [facilitatorNotes, setFacilitatorNotes] = useState<string>('')
  const [consentVerified, setConsentVerified] = useState<boolean>(true)
  const [includeProjects, setIncludeProjects] = useState<boolean>(true)
  const [includeCerts, setIncludeCerts] = useState<boolean>(true)
  const modalHeadingId = useId()

  if (!isOpen) return null

  const currentLearner = learners.find(l => l.id === selectedLearnerId) || learners[0]
  const currentOpp =
    opportunities.find(o => o.id === selectedOppId) || opportunities[0]

  const match =
    currentLearner && currentOpp
      ? evaluateOpportunityMatch(currentLearner, currentOpp)
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentLearner || !currentOpp) return

    const sharedProjects =
      includeProjects && currentLearner.demonstratedProjects
        ? currentLearner.demonstratedProjects.map(p => p.title)
        : []

    const sharedSkills = currentLearner.skills || []

    const matchRationale = match
      ? `${match.score}% compatibility indicator: ${match.explanation}`
      : 'Evaluated by facilitator based on demonstrated projects and readiness.'

    const today = new Date().toISOString()

    onSubmitReferral({
      learnerId: currentLearner.id,
      learnerName: currentLearner.name,
      learnerEducation: currentLearner.educationLevel,
      employerId: currentOpp.employerId,
      employerName: currentOpp.employerName,
      opportunityId: currentOpp.id,
      opportunityTitle: currentOpp.title,
      opportunityDomain: currentOpp.domain,
      status: consentVerified ? 'Referred — Demo' : 'Pending Consent',
      matchRationale,
      consentVerified,
      consentTimestamp: consentVerified ? today : undefined,
      sharedSkills,
      sharedProjects,
      facilitatorNotes:
        facilitatorNotes.trim() ||
        `Strongly recommended by facilitator based on ${currentLearner.readinessLevel} and verified practical coursework.`,
    })

    onClose()
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal modal-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalHeadingId}
      >
        <div className="modal-heading">
          <div className="modal-title-wrap">
            <span className="modal-badge badge-primary">
              <Send size={15} /> Employer Referral Pipeline
            </span>
            <h2 id={modalHeadingId}>Refer Candidate to Employer</h2>
            <p className="modal-subhead">
              Bridge rural talent with inclusive employers using verified skills and explicit consent.
            </p>
          </div>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Candidate Selection */}
          <div className="form-grid">
            <div className="form-group">
              <label className="field-label" htmlFor="learner-picker">
                <span>Select Candidate</span>
                <span className="field-hint">From your allocated or talent pool</span>
              </label>
              <select
                id="learner-picker"
                className="select-field"
                value={selectedLearnerId}
                onChange={e => setSelectedLearnerId(e.target.value)}
              >
                {learners.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.readinessLevel} ({l.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Opportunity Selection */}
            <div className="form-group">
              <label className="field-label" htmlFor="opportunity-picker">
                <span>Employer Opportunity</span>
                <span className="field-hint">Active roles from partner organisations</span>
              </label>
              <select
                id="opportunity-picker"
                className="select-field"
                value={selectedOppId}
                onChange={e => setSelectedOppId(e.target.value)}
              >
                {opportunities.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title} at {o.employerName} ({o.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Compatibility Breakdown */}
          {currentLearner && currentOpp && match && (
            <div className="compatibility-summary-card">
              <div className="compat-score-col">
                <div className="compat-dial">
                  <span className="compat-number">{match.score}%</span>
                  <span className="compat-label">Alignment</span>
                </div>
              </div>
              <div className="compat-details-col">
                <div className="compat-header-row">
                  <h4>
                    <Sparkles size={16} /> Compatibility & Skills Alignment
                  </h4>
                  <span className="compat-tag">
                    {match.isEligible ? 'High Match Potential' : 'Needs Upskilling'}
                  </span>
                </div>
                <p className="compat-explanation">{match.explanation}</p>
                <div className="matched-skills-tags">
                  <span className="tags-label">Matching Required Skills:</span>
                  {match.matchedRequired.length > 0 ? (
                    match.matchedRequired.map(skill => (
                      <span key={skill} className="skill-chip match-chip">
                        <CheckCircle2 size={12} /> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="skill-chip muted-chip">No direct required skill overlap</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Shared Payload Review */}
          <div className="payload-preview-section">
            <h4 className="section-title">
              <Lock size={15} /> Privacy & Data Transmission Package
            </h4>
            <p className="section-desc">
              Select which verified artifacts to forward to {currentOpp?.employerName || 'Employer'}:
            </p>

            <div className="payload-checkboxes">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={includeProjects}
                  onChange={e => setIncludeProjects(e.target.checked)}
                />
                <span className="checkbox-content">
                  <strong>Practical Projects ({currentLearner?.demonstratedProjects.length || 0})</strong>
                  <small>Includes project writeups and demonstrated execution artifacts.</small>
                </span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={includeCerts}
                  onChange={e => setIncludeCerts(e.target.checked)}
                />
                <span className="checkbox-content">
                  <strong>Verified Certifications & Assessments ({currentLearner?.certifications.length || 0})</strong>
                  <small>Red Cross, ITI / NSQF trade certifications, and test scores.</small>
                </span>
              </label>
            </div>
          </div>

          {/* Facilitator Endorsement Notes */}
          <div className="form-group">
            <label className="field-label" htmlFor="facilitator-endorsement">
              <span>Facilitator Recommendation Note</span>
              <span className="field-hint">
                Highlight non-traditional strengths, grit, teamwork, and rural context
              </span>
            </label>
            <textarea
              id="facilitator-endorsement"
              className="textarea-field"
              rows={3}
              placeholder={`Why is ${currentLearner?.name} an exceptional fit for this ${currentOpp?.title}?`}
              value={facilitatorNotes}
              onChange={e => setFacilitatorNotes(e.target.value)}
            />
          </div>

          {/* Explicit Student Consent Verification Checkbox */}
          <div className="consent-verification-card">
            <label className="consent-checkbox-row">
              <input
                type="checkbox"
                checked={consentVerified}
                onChange={e => setConsentVerified(e.target.checked)}
              />
              <div className="consent-text">
                <strong>Explicit Learner Consent Confirmed</strong>
                <p>
                  I certify that I have discussed this opportunity with {currentLearner?.name || 'the student'},
                  reviewed the role requirements and location/stipend terms, and obtained their clear
                  consent to share their verified profile with {currentOpp?.employerName || 'the employer'}.
                </p>
              </div>
            </label>
          </div>

          <div className="notice-banner neutral-banner">
            <Info size={16} className="banner-icon" />
            <small>
              Demo Simulation: This creates a record in your local Employer Referrals pipeline and logs an audit timestamp.
              If consent is unverified, referral is created in <strong>Pending Consent</strong> state.
            </small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
            >
              {consentVerified ? 'Submit Referral to Employer' : 'Save as Pending Consent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
