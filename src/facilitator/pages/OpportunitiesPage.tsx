import { useState } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import type {
  EmployerReferral,
  FacilitatorOpportunity,
  FacilitatorState,
} from '../model'
import { evaluateOpportunityMatch } from '../store'
import ReferCandidateModal from '../components/ReferCandidateModal'

interface OpportunitiesPageProps {
  state: FacilitatorState
  onCreateReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
}

export default function OpportunitiesPage({
  state,
  onCreateReferral,
}: OpportunitiesPageProps) {
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [matchingModalOpp, setMatchingModalOpp] = useState<FacilitatorOpportunity | null>(null)
  const [referOpp, setReferOpp] = useState<FacilitatorOpportunity | null>(null)

  const domains = [
    'All',
    'Clean Energy & Solar',
    'Community Healthcare',
    'Digital Technologies',
    'Agriculture & Rural Tech',
  ]

  const types = ['All', 'Apprenticeship', 'Internship', 'Job', 'Training']

  const filteredOpportunities = state.opportunities.filter(opp => {
    const q = search.toLowerCase()
    const matchesSearch =
      opp.title.toLowerCase().includes(q) ||
      opp.employerName.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q) ||
      opp.requiredSkills.some(s => s.toLowerCase().includes(q))

    const matchesDomain =
      domainFilter === 'All' || opp.domain.toLowerCase().includes(domainFilter.toLowerCase())
    const matchesType = typeFilter === 'All' || opp.type === typeFilter

    return matchesSearch && matchesDomain && matchesType
  })

  return (
    <div className="facilitator-page opportunities-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <BriefcaseBusiness size={14} /> Partner Employer Directory
          </span>
          <h1>Employer Opportunities</h1>
          <p>
            Browse verified apprenticeships, internships, and entry-level positions from partner organisations committed to rural talent.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="filter-bar-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search roles, employer names, locations, or skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <select
            className="filter-select"
            value={domainFilter}
            onChange={e => setDomainFilter(e.target.value)}
            aria-label="Filter by Domain"
          >
            {domains.map(d => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Domains' : d}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by Type"
          >
            {types.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Opportunity Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="opportunities-grid">
        {filteredOpportunities.length === 0 ? (
          <div className="empty-state-card full-width">
            <BriefcaseBusiness size={36} />
            <h3>No opportunities found</h3>
            <p>Try clearing filters to see all available employer roles.</p>
          </div>
        ) : (
          filteredOpportunities.map(opp => (
            <div key={opp.id} className="opportunity-card">
              <div className="opp-header">
                <div>
                  <span className="opp-domain-badge">{opp.domain}</span>
                  <h3 className="opp-title">{opp.title}</h3>
                  <div className="opp-employer-row">
                    <Building2 size={14} />
                    <strong>{opp.employerName}</strong>
                  </div>
                </div>

                <div className="opp-type-block">
                  <span className="type-badge-pill">{opp.type}</span>
                  <span className="arrangement-pill">{opp.arrangement}</span>
                </div>
              </div>

              {/* Meta Stats Bar */}
              <div className="opp-meta-bar">
                <div className="meta-item">
                  <MapPin size={13} />
                  <span>{opp.location}</span>
                </div>
                <div className="meta-item">
                  <Coins size={13} />
                  <span>{opp.stipendOrSalary}</span>
                </div>
                <div className="meta-item">
                  <Clock size={13} />
                  <span>{opp.duration}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={13} />
                  <span>Deadline: {opp.deadline}</span>
                </div>
              </div>

              {/* Description */}
              <p className="opp-description">{opp.description}</p>

              {/* Required Skills */}
              <div className="opp-skills-section">
                <div className="skills-group-title">Required Competencies:</div>
                <div className="skills-chips-row">
                  {opp.requiredSkills.map(sk => (
                    <span key={sk} className="skill-chip required-skill">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              {opp.preferredSkills.length > 0 && (
                <div className="opp-skills-section">
                  <div className="skills-group-title">Preferred Skills:</div>
                  <div className="skills-chips-row">
                    {opp.preferredSkills.map(sk => (
                      <span key={sk} className="skill-chip preferred-skill">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Openings & Reffered Pipeline Info */}
              <div className="opp-pipeline-stats">
                <div className="pipeline-stat">
                  <span>Openings:</span>
                  <strong>{opp.openings} positions</strong>
                </div>
                <div className="pipeline-stat">
                  <span>Referred from MyRaah:</span>
                  <strong>{opp.referredCandidatesCount} candidates</strong>
                </div>
              </div>

              {/* Card Actions */}
              <div className="opp-card-actions">
                <button
                  className="button secondary button-sm"
                  onClick={() => setMatchingModalOpp(opp)}
                >
                  <Sparkles size={14} /> Find Matching Candidates
                </button>
                <button
                  className="button primary button-sm"
                  onClick={() => setReferOpp(opp)}
                >
                  <Send size={14} /> Refer a Learner
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Matching Candidates Modal / Drawer */}
      {matchingModalOpp && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setMatchingModalOpp(null)
          }}
        >
          <div className="modal modal-lg" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <span className="modal-badge">
                  <Sparkles size={15} /> Candidate Match Analysis
                </span>
                <h2>Matching Candidates for {matchingModalOpp.title}</h2>
                <p className="modal-subhead">
                  {matchingModalOpp.employerName} · {matchingModalOpp.domain}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setMatchingModalOpp(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="notice-banner info-banner">
                <Sparkles size={16} className="banner-icon" />
                <small>
                  Candidate alignment scores are calculated transparently based on matched required skills and practical project experience.
                </small>
              </div>

              <div className="candidate-match-list">
                {state.learners.map(learner => {
                  const evalResult = evaluateOpportunityMatch(learner, matchingModalOpp)
                  return (
                    <div key={learner.id} className="candidate-match-row">
                      <img
                        src={learner.avatarUrl}
                        alt={learner.name}
                        className="match-candidate-avatar"
                      />
                      <div className="match-candidate-details">
                        <div className="name-and-score">
                          <strong>{learner.name}</strong>
                          <span className="readiness-pill-sm">{learner.readinessLevel}</span>
                          <span className="score-badge">
                            <Sparkles size={12} /> {evalResult.score}% match
                          </span>
                        </div>
                        <p className="match-explanation-line">{evalResult.explanation}</p>
                        <div className="match-skills-tag-row">
                          {evalResult.matchedRequired.map(sk => (
                            <span key={sk} className="skill-chip match-chip-sm">
                              <CheckCircle2 size={11} /> {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="match-row-action">
                        <button
                          className="button primary button-sm"
                          onClick={() => {
                            const target = matchingModalOpp
                            setMatchingModalOpp(null)
                            setReferOpp(target)
                          }}
                        >
                          <Send size={13} /> Refer
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refer Candidate Modal */}
      {referOpp && (
        <ReferCandidateModal
          isOpen={Boolean(referOpp)}
          onClose={() => setReferOpp(null)}
          learners={state.learners}
          opportunities={state.opportunities}
          initialOpportunityId={referOpp.id}
          onSubmitReferral={onCreateReferral}
        />
      )}
    </div>
  )
}
