import { useState, useId } from 'react'
import { Check, Info, Sparkles, UserCheck, Users, X } from 'lucide-react'
import type { AllocatedLearner, FacilitatorProfile, SupportTrack } from '../model'
import { evaluateLearnerMatch } from '../store'

interface AssignLearnerModalProps {
  isOpen: boolean
  onClose: () => void
  learners: AllocatedLearner[]
  initialSelectedLearnerIds?: string[]
  facilitator: FacilitatorProfile
  onAssign: (
    learnerIds: string[],
    facilitatorId: string,
    facilitatorName: string,
    reason: string,
    track: SupportTrack
  ) => void
}

const SUPPORT_TRACKS: SupportTrack[] = [
  'Healthcare & Nursing',
  'Solar & Clean Tech',
  'Agriculture & Rural Tech',
  'Computer & Digital Skills',
  'Vocational Trades & ITI',
  'Higher Education & Admissions',
  'Govt Schemes & Scholarships',
]

export default function AssignLearnerModal({
  isOpen,
  onClose,
  learners,
  initialSelectedLearnerIds = [],
  facilitator,
  onAssign,
}: AssignLearnerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedLearnerIds)
  const [track, setTrack] = useState<SupportTrack>(
    (facilitator.sectors[0] as SupportTrack) || 'Healthcare & Nursing'
  )
  const [reason, setReason] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const modalHeadingId = useId()

  if (!isOpen) return null

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedIds(filteredLearners.map(l => l.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const filteredLearners = learners.filter(l => {
    const q = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.stream.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      l.skills.some(s => s.toLowerCase().includes(q))
    )
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.length === 0) return

    const finalReason =
      reason.trim() ||
      `Allocated by ${facilitator.name} under ${track} track based on profile and practical skill evaluation.`

    onAssign(
      selectedIds,
      facilitator.id,
      facilitator.name,
      finalReason,
      track
    )
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
            <span className="modal-badge">
              <Users size={16} /> Learner Allocation
            </span>
            <h2 id={modalHeadingId}>Assign Learners to Support Queue</h2>
            <p className="modal-subhead">
              Pair learners with tailored mentorship tracks and transparent alignment indicators.
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
          {/* Transparency Disclaimer */}
          <div className="notice-banner info-banner">
            <Info size={18} className="banner-icon" />
            <div>
              <strong>Rule-Based Transparent Matching</strong>
              <p>
                Compatibility scores are transparent demo indicators reflecting demonstrated
                practical projects and domain preferences. They are designed for facilitator guidance,
                never automated algorithmic lock-in or grade-only sorting.
              </p>
            </div>
          </div>

          {/* Track Selection */}
          <div className="form-group">
            <label className="field-label" htmlFor="support-track-select">
              <span>Primary Support Track</span>
              <span className="field-hint">Defines the guidance roadmap for selected learners</span>
            </label>
            <select
              id="support-track-select"
              className="select-field"
              value={track}
              onChange={e => setTrack(e.target.value as SupportTrack)}
            >
              {SUPPORT_TRACKS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Allocation Reason */}
          <div className="form-group">
            <label className="field-label" htmlFor="allocation-reason">
              <span>Allocation Rationale & Support Plan</span>
              <span className="field-hint">Optional: add specific goals or milestone targets</span>
            </label>
            <textarea
              id="allocation-reason"
              className="textarea-field"
              rows={2}
              placeholder="e.g. Focus on technical apprenticeship readiness and mock interview prep for rural healthcare/tech sector..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          {/* Learner Selector */}
          <div className="form-group">
            <div className="learner-select-header">
              <label className="field-label">
                <span>Select Learners ({selectedIds.length} selected)</span>
              </label>
              <div className="learner-quick-actions">
                <input
                  type="text"
                  placeholder="Search by name, stream, or skill..."
                  className="search-input-compact"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="text-btn"
                  onClick={selectAll}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="text-btn"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="learner-multiselect-list">
              {filteredLearners.length === 0 ? (
                <div className="empty-sublist">No learners match your search query.</div>
              ) : (
                filteredLearners.map(l => {
                  const isSelected = selectedIds.includes(l.id)
                  const match = evaluateLearnerMatch(l, facilitator)
                  return (
                    <div
                      key={l.id}
                      className={`learner-select-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleSelect(l.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault()
                          toggleSelect(l.id)
                        }
                      }}
                    >
                      <div className="select-checkbox">
                        {isSelected ? <Check size={14} /> : null}
                      </div>
                      <img
                        src={l.avatarUrl}
                        alt={l.name}
                        className="learner-thumb"
                      />
                      <div className="learner-info-col">
                        <div className="learner-name-row">
                          <span className="learner-name">{l.name}</span>
                          <span className="status-pill status-muted">{l.educationLevel}</span>
                          <span className="readiness-pill">{l.readinessLevel}</span>
                        </div>
                        <div className="learner-meta-row">
                          <span>{l.location}</span>
                          <span>•</span>
                          <span>{l.stream}</span>
                        </div>
                        <div className="match-explanation-row">
                          <span className="match-score-pill">
                            <Sparkles size={12} /> {match.score}% fit
                          </span>
                          <span className="match-text">{match.explanation}</span>
                        </div>
                      </div>
                      <div className="learner-assignment-status">
                        {l.assignmentStatus === 'assigned_to_me' ? (
                          <span className="status-pill status-assigned">
                            <UserCheck size={12} /> Assigned to You
                          </span>
                        ) : l.assignmentStatus === 'assigned_to_peer' ? (
                          <span className="status-pill status-peer">
                            Assigned to {l.assignedFacilitatorName || 'Peer'}
                          </span>
                        ) : (
                          <span className="status-pill status-available">Available</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
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
              disabled={selectedIds.length === 0}
            >
              Assign {selectedIds.length} Learner{selectedIds.length === 1 ? '' : 's'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
