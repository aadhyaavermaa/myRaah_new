import { useState } from 'react'
import {
  ChevronDown,
  Grid,
  Info,
  List,
  Search,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import type {
  AllocatedLearner,
  FacilitatorState,
  SupportTrack,
} from '../model'
import { evaluateLearnerMatch } from '../store'
import AssignLearnerModal from '../components/AssignLearnerModal'

interface LearnerAllocationPageProps {
  state: FacilitatorState
  onAllocateLearners: (
    learnerIds: string[],
    facilitatorId: string,
    facilitatorName: string,
    reason: string,
    track: SupportTrack
  ) => void
  onUnassignLearner: (learnerId: string) => void
}

export default function LearnerAllocationPage({
  state,
  onAllocateLearners,
  onUnassignLearner,
}: LearnerAllocationPageProps) {
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [readinessFilter, setReadinessFilter] = useState('All')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([])
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [expandedExplanationId, setExpandedExplanationId] = useState<string | null>(null)

  const domains = [
    'All',
    'Healthcare & Science',
    'Vocational - Electrician & Clean Energy',
    'Computer & Digital Skills',
    'Agriculture & Rural Technology',
    'Arts, Humanities & Public Service',
  ]

  const statusOptions = ['All', 'unassigned', 'assigned_to_me', 'assigned_to_peer']
  const readinessOptions = ['All', 'Apprenticeship Ready', 'Internship Ready', 'Foundational Training']

  const filteredLearners = state.learners.filter(l => {
    const q = search.toLowerCase()
    const matchesSearch =
      l.name.toLowerCase().includes(q) ||
      l.stream.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.skills.some(s => s.toLowerCase().includes(q)) ||
      l.subjects.some(subj => subj.toLowerCase().includes(q))

    const matchesDomain = domainFilter === 'All' || l.stream.toLowerCase().includes(domainFilter.toLowerCase())
    const matchesStatus = statusFilter === 'All' || l.assignmentStatus === statusFilter
    const matchesReadiness = readinessFilter === 'All' || l.readinessLevel === readinessFilter

    return matchesSearch && matchesDomain && matchesStatus && matchesReadiness
  })

  const toggleSelect = (id: string) => {
    setSelectedLearnerIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLearnerIds.length === filteredLearners.length) {
      setSelectedLearnerIds([])
    } else {
      setSelectedLearnerIds(filteredLearners.map(l => l.id))
    }
  }

  const handleQuickAssign = (learner: AllocatedLearner) => {
    onAllocateLearners(
      [learner.id],
      state.profile.id,
      state.profile.name,
      `Directly allocated to ${state.profile.name}'s support queue.`,
      (state.profile.sectors[0] as SupportTrack) || 'Healthcare & Nursing'
    )
  }

  return (
    <div className="facilitator-page allocation-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Users size={14} /> Learner Assignment & Pairing
          </span>
          <h1>Learner Allocation Hub</h1>
          <p>
            Match rural youth with appropriate support tracks based on demonstrated skills, practical coursework, and career goals.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button primary"
            onClick={() => setIsAssignModalOpen(true)}
            disabled={selectedLearnerIds.length === 0}
          >
            <UserPlus size={16} /> Allocate Selected ({selectedLearnerIds.length})
          </button>
        </div>
      </div>

      {/* Transparent Match Indicator Banner */}
      <div className="notice-banner info-banner">
        <Info size={18} className="banner-icon" />
        <div>
          <strong>Transparent, Rule-Based Compatibility Indicator</strong>
          <p>
            Compatibility scores shown below are transparent demo indicators reflecting demonstrated
            practical projects, career goals, and facilitator expertise tracks. They are never claimed
            as AI predictions or based solely on academic grades.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by learner name, stream, skills, location..."
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
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>
                {s === 'All'
                  ? 'All Statuses'
                  : s === 'unassigned'
                  ? 'Unassigned Queue'
                  : s === 'assigned_to_me'
                  ? 'Assigned to Me'
                  : 'Assigned to Peers'}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={readinessFilter}
            onChange={e => setReadinessFilter(e.target.value)}
            aria-label="Filter by Readiness"
          >
            {readinessOptions.map(r => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Readiness' : r}
              </option>
            ))}
          </select>

          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View"
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="results-status-line">
        <span>
          Showing <strong>{filteredLearners.length}</strong> learner{filteredLearners.length === 1 ? '' : 's'}
        </span>
        {selectedLearnerIds.length > 0 && (
          <span className="selection-count-pill">
            {selectedLearnerIds.length} selected
            <button
              className="text-link-subtle"
              onClick={() => setSelectedLearnerIds([])}
            >
              Deselect All
            </button>
          </span>
        )}
      </div>

      {/* Views: Table or Cards */}
      {filteredLearners.length === 0 ? (
        <div className="empty-state-card">
          <Users size={36} />
          <h3>No learners found</h3>
          <p>Try broadening your search term or clearing some filters.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-responsive-wrapper">
          <table className="facilitator-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredLearners.length > 0 &&
                      selectedLearnerIds.length === filteredLearners.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all learners"
                  />
                </th>
                <th>Learner</th>
                <th>Stream & Location</th>
                <th>Demonstrated Skills</th>
                <th>Readiness</th>
                <th>Compatibility Indicator</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map(learner => {
                const isSelected = selectedLearnerIds.includes(learner.id)
                const match = evaluateLearnerMatch(learner, state.profile)
                const isExpanded = expandedExplanationId === learner.id

                return (
                  <tr
                    key={learner.id}
                    className={`table-row ${isSelected ? 'row-selected' : ''}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(learner.id)}
                        aria-label={`Select ${learner.name}`}
                      />
                    </td>
                    <td>
                      <div className="learner-cell">
                        <img
                          src={learner.avatarUrl}
                          alt={learner.name}
                          className="table-avatar"
                        />
                        <div className="learner-cell-text">
                          <strong>{learner.name}</strong>
                          <small>{learner.educationLevel}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stream-cell">
                        <span>{learner.stream}</span>
                        <small>{learner.location}</small>
                      </div>
                    </td>
                    <td>
                      <div className="table-tags-wrap">
                        {learner.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="skill-chip">
                            {skill}
                          </span>
                        ))}
                        {learner.skills.length > 3 && (
                          <span className="skill-chip-more">
                            +{learner.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="readiness-pill">{learner.readinessLevel}</span>
                    </td>
                    <td>
                      <div className="compat-cell">
                        <button
                          type="button"
                          className="compat-btn"
                          onClick={() =>
                            setExpandedExplanationId(isExpanded ? null : learner.id)
                          }
                          title="Click to view rule-based explanation"
                        >
                          <Sparkles size={13} />
                          <strong>{match.score}% fit</strong>
                          <ChevronDown
                            size={12}
                            className={`chevron-icon ${isExpanded ? 'rotate' : ''}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="compat-explanation-popover">
                            <div className="explanation-title">Transparent Matching Rationale:</div>
                            <p>{match.explanation}</p>
                            <small>Based on demonstrated projects & profile alignment</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {learner.assignmentStatus === 'assigned_to_me' ? (
                        <span className="status-pill status-assigned">
                          <UserCheck size={12} /> Assigned to You
                        </span>
                      ) : learner.assignmentStatus === 'assigned_to_peer' ? (
                        <span className="status-pill status-peer">
                          Assigned to {learner.assignedFacilitatorName || 'Peer'}
                        </span>
                      ) : (
                        <span className="status-pill status-available">Unassigned</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {learner.assignmentStatus === 'assigned_to_me' ? (
                        <button
                          className="button-icon-subtle button-danger"
                          onClick={() => onUnassignLearner(learner.id)}
                          title="Unassign from my queue"
                        >
                          <UserMinus size={15} />
                        </button>
                      ) : (
                        <button
                          className="button-icon-subtle button-success"
                          onClick={() => handleQuickAssign(learner)}
                          title="Assign to me"
                        >
                          <UserPlus size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="learner-cards-grid">
          {filteredLearners.map(learner => {
            const isSelected = selectedLearnerIds.includes(learner.id)
            const match = evaluateLearnerMatch(learner, state.profile)

            return (
              <div
                key={learner.id}
                className={`allocation-card ${isSelected ? 'card-selected' : ''}`}
              >
                <div className="card-top-row">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(learner.id)}
                    aria-label={`Select ${learner.name}`}
                  />
                  <span className="readiness-pill">{learner.readinessLevel}</span>
                  <div className="compat-score-pill">
                    <Sparkles size={12} /> {match.score}% fit
                  </div>
                </div>

                <div className="card-profile-header">
                  <img
                    src={learner.avatarUrl}
                    alt={learner.name}
                    className="card-avatar"
                  />
                  <div>
                    <h3>{learner.name}</h3>
                    <small>{learner.educationLevel} · {learner.location}</small>
                  </div>
                </div>

                <div className="card-stream-info">
                  <strong>Track:</strong> {learner.stream}
                </div>

                <div className="card-explanation-box">
                  <p>{match.explanation}</p>
                </div>

                <div className="card-skills-row">
                  {learner.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="card-footer-actions">
                  <div className="card-status-indicator">
                    {learner.assignmentStatus === 'assigned_to_me' ? (
                      <span className="status-pill status-assigned">
                        <UserCheck size={12} /> Assigned
                      </span>
                    ) : (
                      <span className="status-pill status-available">Available</span>
                    )}
                  </div>

                  {learner.assignmentStatus === 'assigned_to_me' ? (
                    <button
                      className="button secondary button-sm"
                      onClick={() => onUnassignLearner(learner.id)}
                    >
                      <UserMinus size={14} /> Unassign
                    </button>
                  ) : (
                    <button
                      className="button primary button-sm"
                      onClick={() => handleQuickAssign(learner)}
                    >
                      <UserPlus size={14} /> Assign to Me
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AssignLearnerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        learners={state.learners}
        initialSelectedLearnerIds={selectedLearnerIds}
        facilitator={state.profile}
        onAssign={onAllocateLearners}
      />
    </div>
  )
}
