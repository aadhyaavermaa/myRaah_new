import { useState, useId } from 'react'
import { Calendar, X } from 'lucide-react'
import type { AllocatedLearner, FollowUpReminder } from '../model'

interface ScheduleFollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  learners: AllocatedLearner[]
  initialLearnerId?: string
  onAddFollowUp: (
    reminder: Omit<FollowUpReminder, 'id' | 'completed'>
  ) => void
}

const REMINDER_TYPES: FollowUpReminder['type'][] = [
  'Phone Check-in',
  'In-person Sync',
  'Resume Review',
  'Application Assistance',
  'Skill Evaluation',
]

const PRIORITIES: FollowUpReminder['priority'][] = ['High', 'Medium', 'Low']

export default function ScheduleFollowUpModal({
  isOpen,
  onClose,
  learners,
  initialLearnerId,
  onAddFollowUp,
}: ScheduleFollowUpModalProps) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const [learnerId, setLearnerId] = useState<string>(
    initialLearnerId || (learners[0]?.id ?? '')
  )
  const [dueDate, setDueDate] = useState<string>(tomorrow)
  const [type, setType] = useState<FollowUpReminder['type']>('Phone Check-in')
  const [priority, setPriority] = useState<FollowUpReminder['priority']>('High')
  const [notes, setNotes] = useState<string>('')
  const modalHeadingId = useId()

  if (!isOpen) return null

  const selectedLearner = learners.find(l => l.id === learnerId) || learners[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLearner) return

    onAddFollowUp({
      learnerId: selectedLearner.id,
      learnerName: selectedLearner.name,
      dueDate,
      type,
      priority,
      notes: notes.trim() || `Follow-up ${type} with ${selectedLearner.name} on career milestones.`,
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
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalHeadingId}
      >
        <div className="modal-heading">
          <div className="modal-title-wrap">
            <span className="modal-badge">
              <Calendar size={15} /> Reminder System
            </span>
            <h2 id={modalHeadingId}>Schedule Learner Follow-up</h2>
            <p className="modal-subhead">
              Keep rural candidates on track with timely check-ins and application support.
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
          {/* Learner Picker */}
          <div className="form-group">
            <label className="field-label" htmlFor="followup-learner">
              <span>Learner</span>
              <span className="field-hint">Student requiring follow-up</span>
            </label>
            <select
              id="followup-learner"
              className="select-field"
              value={learnerId}
              onChange={e => setLearnerId(e.target.value)}
            >
              {learners.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.educationLevel} · {l.currentStatus.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            {/* Due Date */}
            <div className="form-group">
              <label className="field-label" htmlFor="followup-duedate">
                <span>Target Due Date</span>
              </label>
              <input
                id="followup-duedate"
                type="date"
                className="input-field"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="field-label" htmlFor="followup-priority">
                <span>Priority</span>
              </label>
              <select
                id="followup-priority"
                className="select-field"
                value={priority}
                onChange={e => setPriority(e.target.value as FollowUpReminder['priority'])}
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type of Follow-up */}
          <div className="form-group">
            <label className="field-label" htmlFor="followup-type">
              <span>Follow-up Category</span>
            </label>
            <select
              id="followup-type"
              className="select-field"
              value={type}
              onChange={e => setType(e.target.value as FollowUpReminder['type'])}
            >
              {REMINDER_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Action Notes */}
          <div className="form-group">
            <label className="field-label" htmlFor="followup-notes">
              <span>Key Discussion Points / Next Steps</span>
              <span className="field-hint">e.g. Check if parent consent letter is signed for ITI training</span>
            </label>
            <textarea
              id="followup-notes"
              className="textarea-field"
              rows={3}
              placeholder="Record specific deliverables or questions for this interaction..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
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
              Save Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
