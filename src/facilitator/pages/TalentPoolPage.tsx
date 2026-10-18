import { useState } from 'react'
import {
  Award,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  FolderGit2,
  Search,
  Send,
  X,
} from 'lucide-react'
import type {
  EmployerReferral,
  FacilitatorState,
} from '../model'
import ReferCandidateModal from '../components/ReferCandidateModal'

interface TalentPoolPageProps {
  state: FacilitatorState
  onToggleShortlist: (learnerId: string, reason?: string) => void
  onCreateReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
}

export default function TalentPoolPage({
  state,
  onToggleShortlist,
  onCreateReferral,
}: TalentPoolPageProps) {
  const [search, setSearch] = useState('')
  const [readinessFilter, setReadinessFilter] = useState('All')
  const [streamFilter, setStreamFilter] = useState('All')
  const [onlyShortlisted, setOnlyShortlisted] = useState(false)
  const [activeReferralLearnerId, setActiveReferralLearnerId] = useState<string | null>(null)

  const streams = [
    'All',
    'Healthcare & Science',
    'Vocational - Electrician & Clean Energy',
    'Computer & Digital Skills',
    'Agriculture & Rural Technology',
    'Arts, Humanities & Public Service',
  ]

  const filteredCandidates = state.learners.filter(c => {
    const q = search.toLowerCase()
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q)) ||
      c.demonstratedProjects.some(
        p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      ) ||
      c.certifications.some(cert => cert.toLowerCase().includes(q))

    const matchesReadiness =
      readinessFilter === 'All' || c.readinessLevel === readinessFilter
    const matchesStream =
      streamFilter === 'All' || c.stream.toLowerCase().includes(streamFilter.toLowerCase())
    const matchesShortlist = !onlyShortlisted || Boolean(c.isTalentShortlisted)

    return matchesSearch && matchesReadiness && matchesStream && matchesShortlist
  })

  return (
    <div className="facilitator-page talent-pool-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Award size={14} /> Skills-First Talent Discovery
          </span>
          <h1>Rural Talent Pool</h1>
          <p>
            Identify candidates based on demonstrated project deliverables, practical vocational training,
            and observable competency criteria — not academic cutoffs.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by project keyword, demonstrated skill, or certification..."
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
            value={readinessFilter}
            onChange={e => setReadinessFilter(e.target.value)}
            aria-label="Filter by Readiness"
          >
            <option value="All">All Readiness Levels</option>
            <option value="Apprenticeship Ready">Apprenticeship Ready</option>
            <option value="Internship Ready">Internship Ready</option>
            <option value="Foundational Training">Foundational Training</option>
          </select>

          <select
            className="filter-select"
            value={streamFilter}
            onChange={e => setStreamFilter(e.target.value)}
            aria-label="Filter by Domain"
          >
            {streams.map(s => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Domains' : s}
              </option>
            ))}
          </select>

          <label className="filter-toggle-label">
            <input
              type="checkbox"
              checked={onlyShortlisted}
              onChange={e => setOnlyShortlisted(e.target.checked)}
            />
            <span>Shortlisted Only</span>
          </label>
        </div>
      </div>

      {/* Candidates List */}
      <div className="talent-cards-grid">
        {filteredCandidates.length === 0 ? (
          <div className="empty-state-card full-width">
            <Award size={36} />
            <h3>No candidates match your criteria</h3>
            <p>Try resetting filters or adjusting search terms to discover more talent.</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => (
            <div
              key={candidate.id}
              className={`talent-card ${candidate.isTalentShortlisted ? 'card-shortlisted' : ''}`}
            >
              {/* Card Top */}
              <div className="talent-card-header">
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.name}
                  className="talent-avatar"
                />
                <div className="talent-header-info">
                  <div className="talent-name-line">
                    <h3>{candidate.name}</h3>
                    <button
                      className={`shortlist-star-btn ${
                        candidate.isTalentShortlisted ? 'active' : ''
                      }`}
                      onClick={() => onToggleShortlist(candidate.id)}
                      title={
                        candidate.isTalentShortlisted
                          ? 'Remove from Shortlist'
                          : 'Add to Shortlist'
                      }
                      aria-label="Toggle shortlist"
                    >
                      {candidate.isTalentShortlisted ? (
                        <BookmarkCheck size={18} />
                      ) : (
                        <Bookmark size={18} />
                      )}
                    </button>
                  </div>
                  <span className="talent-education">{candidate.educationLevel}</span>
                  <span className="talent-location">{candidate.location}</span>
                </div>
              </div>

              {/* Readiness Badge */}
              <div className="talent-badges-row">
                <span className="readiness-pill-lg">{candidate.readinessLevel}</span>
                <span className="stream-badge-subtle">{candidate.stream}</span>
              </div>

              {/* Demonstrated Projects Section */}
              <div className="talent-section">
                <div className="talent-section-title">
                  <FolderGit2 size={14} /> Demonstrated Projects ({candidate.demonstratedProjects.length})
                </div>
                <div className="project-chips-container">
                  {candidate.demonstratedProjects.map((proj, idx) => (
                    <div key={idx} className="project-item-chip">
                      <strong>{proj.title}</strong>
                      <p>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observable Criteria */}
              <div className="talent-section">
                <div className="talent-section-title">
                  <CheckCircle2 size={14} /> Observable Performance Criteria
                </div>
                <ul className="criteria-list">
                  {candidate.observableCriteria.map((crit, idx) => (
                    <li key={idx}>
                      <span className="bullet-dot" /> {crit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certifications */}
              {candidate.certifications.length > 0 && (
                <div className="talent-section">
                  <div className="talent-section-title">
                    <FileCheck size={14} /> Verified Certifications
                  </div>
                  <div className="certs-row">
                    {candidate.certifications.map((cert, idx) => (
                      <span key={idx} className="cert-chip">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="talent-card-footer">
                {candidate.portfolioUrl && (
                  <a
                    href={candidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-link-btn"
                  >
                    <ExternalLink size={14} /> View Portfolio
                  </a>
                )}
                <button
                  className="button primary button-sm"
                  onClick={() => setActiveReferralLearnerId(candidate.id)}
                >
                  <Send size={14} /> Refer to Employer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refer Candidate Modal */}
      {activeReferralLearnerId && (
        <ReferCandidateModal
          isOpen={Boolean(activeReferralLearnerId)}
          onClose={() => setActiveReferralLearnerId(null)}
          learners={state.learners}
          opportunities={state.opportunities}
          initialLearnerId={activeReferralLearnerId}
          onSubmitReferral={onCreateReferral}
        />
      )}
    </div>
  )
}
