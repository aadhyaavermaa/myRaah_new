import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  X,
} from 'lucide-react'
import type { FacilitatorState, FollowUpReminder } from '../model'
import ScheduleFollowUpModal from '../components/ScheduleFollowUpModal'

interface FollowUpsPageProps {
  state: FacilitatorState
  onAddFollowUp: (reminder: Omit<FollowUpReminder, 'id' | 'completed'>) => void
  onCompleteFollowUp: (reminderId: string, outcomeNote?: string) => void
}

export default function FollowUpsPage({
  state,
  onAddFollowUp,
  onCompleteFollowUp,
}: FollowUpsPageProps) {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'high_priority' | 'all'>('pending')
  const [showModal, setShowModal] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [outcomeNote, setOutcomeNote] = useState<string>('')

  const filteredReminders = state.followUps.filter(f => {
    if (filter === 'pending') return !f.completed
    if (filter === 'completed') return f.completed
    if (filter === 'high_priority') return !f.completed && f.priority === 'High'
    return true
  })

  const handleConfirmComplete = () => {
    if (!completingId) return
    onCompleteFollowUp(completingId, outcomeNote.trim() || undefined)
    setCompletingId(null)
    setOutcomeNote('')
  }

  const pendingCount = state.followUps.filter(f => !f.completed).length
  const completedCount = state.followUps.filter(f => f.completed).length
  const highPriorityCount = state.followUps.filter(f => !f.completed && f.priority === 'High').length

  return (
    <div className="facilitator-page followups-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Clock size={14} /> Action Reminders & Pastoral Care
          </span>
          <h1>Follow-ups & Scheduled Check-ins</h1>
          <p>
            Stay on top of critical check-ins, guardian conversations, scholarship deadlines, and employer readiness reviews.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pipeline-tabs-wrapper">
        <div className="tabs-container">
          <button
            className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <span>Pending Check-ins</span>
            <span className="tab-badge">{pendingCount}</span>
          </button>

          <button
            className={`tab-btn ${filter === 'high_priority' ? 'active' : ''}`}
            onClick={() => setFilter('high_priority')}
          >
            <span>High Priority</span>
            <span className="tab-badge">{highPriorityCount}</span>
          </button>

          <button
            className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <span>Completed</span>
            <span className="tab-badge">{completedCount}</span>
          </button>

          <button
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>All History</span>
            <span className="tab-badge">{state.followUps.length}</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="follow-up-cards-stack">
        {filteredReminders.length === 0 ? (
          <div className="empty-state-card">
            <CheckCircle2 size={36} />
            <h3>No reminders in this view</h3>
            <p>You’re all caught up with scheduled follow-ups!</p>
          </div>
        ) : (
          filteredReminders.map(item => (
            <div
              key={item.id}
              className={`followup-card ${item.completed ? 'card-completed' : ''}`}
            >
              <div className="followup-card-header">
                <div className="followup-name-col">
                  <div className="name-and-priority">
                    <span
                      className={`priority-badge priority-${item.priority.toLowerCase()}`}
                    >
                      {item.priority} Priority
                    </span>
                    <h3>{item.learnerName}</h3>
                  </div>
                  <span className="followup-type-badge">{item.type}</span>
                </div>

                <div className="followup-date-col">
                  <Calendar size={14} />
                  <span>Due: {item.dueDate}</span>
                  {item.completed && item.completedDate && (
                    <small className="completed-timestamp">
                      Completed on {item.completedDate}
                    </small>
                  )}
                </div>
              </div>

              <div className="followup-notes-box">
                <p>{item.notes}</p>
              </div>

              {item.outcomeNote && (
                <div className="followup-outcome-box">
                  <strong>Outcome:</strong> {item.outcomeNote}
                </div>
              )}

              {!item.completed && (
                <div className="followup-card-actions">
                  <button
                    className="button secondary button-sm"
                    onClick={() => setCompletingId(item.id)}
                  >
                    <CheckCircle2 size={14} /> Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Completion Dialog */}
      {completingId && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <h3>Complete Follow-up</h3>
              <button
                className="icon-button"
                onClick={() => setCompletingId(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="field-label">
                  <span>Outcome & Follow-up Notes</span>
                  <span className="field-hint">e.g. Student confirmed attendance for vocational workshop</span>
                </label>
                <textarea
                  rows={3}
                  className="textarea-field"
                  placeholder="Record summary of conversation or resolution..."
                  value={outcomeNote}
                  onChange={e => setOutcomeNote(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  onClick={() => setCompletingId(null)}
                >
                  Cancel
                </button>
                <button
                  className="button primary"
                  onClick={handleConfirmComplete}
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <ScheduleFollowUpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        learners={state.learners}
        onAddFollowUp={onAddFollowUp}
      />
    </div>
  )
}
