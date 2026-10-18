import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FolderGit2,
  Send,
  Target,
  Users,
} from 'lucide-react'
import type {
  EmployerReferral,
  FacilitatorState,
  FollowUpReminder,
} from '../model'
import ScheduleFollowUpModal from '../components/ScheduleFollowUpModal'
import ReferCandidateModal from '../components/ReferCandidateModal'

interface LearnerProgressPageProps {
  state: FacilitatorState
  onUpdateSupportStatus: (
    learnerId: string,
    status: 'on_track' | 'needs_support' | 'critical',
    note?: string
  ) => void
  onAddFollowUp: (
    reminder: Omit<FollowUpReminder, 'id' | 'completed'>
  ) => void
  onCreateReferral: (
    referralData: Omit<EmployerReferral, 'id' | 'submissionDate' | 'timeline'>
  ) => void
}

export default function LearnerProgressPage({
  state,
  onUpdateSupportStatus,
  onAddFollowUp,
  onCreateReferral,
}: LearnerProgressPageProps) {
  const myAssigned = state.learners.filter(l => l.assignmentStatus === 'assigned_to_me')
  const availableLearners = myAssigned.length > 0 ? myAssigned : state.learners

  const [selectedLearnerId, setSelectedLearnerId] = useState<string>(
    availableLearners[0]?.id || ''
  )
  const [statusNote, setStatusNote] = useState<string>('')
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showReferModal, setShowReferModal] = useState(false)

  const learner = availableLearners.find(l => l.id === selectedLearnerId) || availableLearners[0]

  const handleStatusChange = (status: 'on_track' | 'needs_support' | 'critical') => {
    if (!learner) return
    onUpdateSupportStatus(learner.id, status, statusNote.trim() || undefined)
    setStatusNote('')
  }

  // Simulated structured enablement milestones for rural youth
  const milestones = [
    {
      title: 'Foundational Competency Assessment',
      completed: true,
      desc: 'Baseline assessment of trade skills and literacy completed.',
    },
    {
      title: 'Practical Work & Portfolio Artifacts',
      completed: learner?.demonstratedProjects.length > 0,
      desc: `${learner?.demonstratedProjects.length || 0} demonstrated practical projects documented.`,
    },
    {
      title: 'Trade Certifications / Safety Verification',
      completed: learner?.certifications.length > 0,
      desc: `${learner?.certifications.length || 0} external certifications verified.`,
    },
    {
      title: 'Family & Guardian Alignment Sync',
      completed: learner?.overallProgress > 70,
      desc: 'Informed family of travel, stipend, and apprenticeship expectations.',
    },
    {
      title: 'Mock Interview & Employer Readiness',
      completed: learner?.readinessLevel === 'Apprenticeship Ready',
      desc: 'Candidate completed behavioural and technical mock interview.',
    },
  ]

  if (!learner) {
    return (
      <div className="facilitator-page progress-page">
        <div className="empty-state-card">
          <Users size={36} />
          <h3>No assigned learners</h3>
          <p>Go to the Learner Allocation Hub to assign learners to your queue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="facilitator-page progress-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <Target size={14} /> Individual Development Tracking
          </span>
          <h1>Learner Progress & Enablement</h1>
          <p>
            Monitor learning velocity, verified capstones, and milestone readiness for vocational placement.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button secondary"
            onClick={() => setShowFollowUpModal(true)}
          >
            <Clock size={16} /> Schedule Check-in
          </button>
          <button
            className="button primary"
            onClick={() => setShowReferModal(true)}
          >
            <Send size={16} /> Refer to Employer
          </button>
        </div>
      </div>

      {/* Learner Switcher Bar */}
      <div className="learner-switcher-card">
        <label className="switcher-label">Select Learner:</label>
        <div className="switcher-chips">
          {availableLearners.map(l => (
            <button
              key={l.id}
              className={`switcher-chip ${l.id === selectedLearnerId ? 'active' : ''}`}
              onClick={() => setSelectedLearnerId(l.id)}
            >
              <img src={l.avatarUrl} alt={l.name} className="chip-avatar" />
              <span>{l.name}</span>
              <span
                className={`chip-status-dot ${
                  l.currentStatus === 'on_track'
                    ? 'dot-success'
                    : l.currentStatus === 'needs_support'
                    ? 'dot-warning'
                    : 'dot-critical'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="progress-details-grid">
        {/* Left Column: Profile Card, Status Updater & Skills */}
        <div className="progress-col-left">
          {/* Candidate Card */}
          <div className="progress-card">
            <div className="candidate-profile-top">
              <img
                src={learner.avatarUrl}
                alt={learner.name}
                className="profile-lg-avatar"
              />
              <div className="profile-lg-info">
                <div className="profile-name-row">
                  <h2>{learner.name}</h2>
                  <span className="readiness-pill">{learner.readinessLevel}</span>
                </div>
                <div className="profile-meta-text">
                  <span>{learner.educationLevel}</span> · <span>{learner.location}</span>
                </div>
                <div className="profile-track-line">
                  <strong>Track:</strong> {learner.supportTrack || learner.stream}
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="progress-meter-section">
              <div className="meter-label-row">
                <span>Overall Learning & Milestone Progress</span>
                <strong>{learner.overallProgress}%</strong>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${learner.overallProgress}%` }}
                />
              </div>
            </div>

            {/* Career Goal */}
            <div className="profile-field-block">
              <span className="field-title">Career Ambition & Target:</span>
              <p className="field-content">{learner.careerGoals}</p>
            </div>

            {/* Status Controls */}
            <div className="status-updater-block">
              <span className="field-title">Facilitator Status Assessment:</span>
              <div className="status-btn-group">
                <button
                  type="button"
                  className={`status-btn on-track ${
                    learner.currentStatus === 'on_track' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('on_track')}
                >
                  <CheckCircle2 size={14} /> On Track
                </button>
                <button
                  type="button"
                  className={`status-btn needs-support ${
                    learner.currentStatus === 'needs_support' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('needs_support')}
                >
                  <AlertCircle size={14} /> Needs Support
                </button>
                <button
                  type="button"
                  className={`status-btn critical ${
                    learner.currentStatus === 'critical' ? 'active' : ''
                  }`}
                  onClick={() => handleStatusChange('critical')}
                >
                  <AlertCircle size={14} /> Critical Attention
                </button>
              </div>

              <div className="status-note-input-wrap">
                <input
                  type="text"
                  placeholder="Add note for this status change (e.g. Needs help with solar inverter practical)..."
                  className="note-input"
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-field-block">
              <span className="field-title">Recent Activity Log:</span>
              <p className="activity-quote">{learner.recentActivity}</p>
            </div>
          </div>

          {/* Demonstrated Skills & Certifications */}
          <div className="progress-card">
            <h3>Demonstrated Skills & Certifications</h3>
            <div className="skills-pill-wrap">
              {learner.skills.map(sk => (
                <span key={sk} className="skill-chip">
                  <CheckCircle2 size={12} /> {sk}
                </span>
              ))}
            </div>

            <h4 style={{ marginTop: '1.25rem' }}>Verified Credentials</h4>
            <div className="certs-list-vertical">
              {learner.certifications.map((cert, idx) => (
                <div key={idx} className="cert-item-row">
                  <FileCheck size={16} />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Milestones & Demonstrated Projects */}
        <div className="progress-col-right">
          {/* Milestones Checklist */}
          <div className="progress-card">
            <div className="card-header-simple">
              <h3>Enablement Milestones Checklist</h3>
              <span className="milestone-count">
                {milestones.filter(m => m.completed).length} of {milestones.length} Completed
              </span>
            </div>

            <div className="milestones-vertical-list">
              {milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className={`milestone-row ${milestone.completed ? 'completed' : 'pending'}`}
                >
                  <div className="milestone-check">
                    {milestone.completed ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                  <div className="milestone-text">
                    <strong>{milestone.title}</strong>
                    <p>{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Projects */}
          <div className="progress-card">
            <h3>Practical Work & Capstone Projects</h3>
            <div className="projects-vertical-stack">
              {learner.demonstratedProjects.map((proj, idx) => (
                <div key={idx} className="project-detail-box">
                  <div className="project-detail-header">
                    <FolderGit2 size={16} />
                    <strong>{proj.title}</strong>
                  </div>
                  <p>{proj.description}</p>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link-subtle"
                    >
                      <ExternalLink size={13} /> View Project Artifact
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleFollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        learners={state.learners}
        initialLearnerId={learner.id}
        onAddFollowUp={onAddFollowUp}
      />

      <ReferCandidateModal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        learners={state.learners}
        opportunities={state.opportunities}
        initialLearnerId={learner.id}
        onSubmitReferral={onCreateReferral}
      />
    </div>
  )
}
