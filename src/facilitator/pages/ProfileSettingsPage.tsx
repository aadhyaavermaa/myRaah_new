import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  RotateCcw,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { User as AuthUser } from '../../types'
import type { FacilitatorProfile, FacilitatorState } from '../model'

interface ProfileSettingsPageProps {
  state: FacilitatorState
  user: AuthUser
  onUpdateProfile: (updates: Partial<FacilitatorProfile>) => void
  onResetDemoData: (user: AuthUser) => void
}

const AVAILABLE_SECTORS = [
  'Healthcare & Nursing',
  'Solar & Clean Tech',
  'Agriculture & Rural Tech',
  'Computer & Digital Skills',
  'Vocational Trades & ITI',
  'Higher Education & Admissions',
  'Govt Schemes & Scholarships',
]

export default function ProfileSettingsPage({
  state,
  user,
  onUpdateProfile,
  onResetDemoData,
}: ProfileSettingsPageProps) {
  const [profile, setProfile] = useState<FacilitatorProfile>(state.profile)
  const [saveNotice, setSaveNotice] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const toggleSector = (sector: string) => {
    setProfile(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector],
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProfile(profile)
    setSaveNotice(true)
    setTimeout(() => setSaveNotice(false), 3000)
  }

  const handleReset = () => {
    onResetDemoData(user)
    setShowResetConfirm(false)
  }

  return (
    <div className="facilitator-page profile-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-text">
          <span className="eyebrow">
            <User size={14} /> Profile & Operational Settings
          </span>
          <h1>Facilitator Profile & Settings</h1>
          <p>
            Configure your institutional affiliation, sectoral expertise areas, and transparent matching parameters.
          </p>
        </div>
      </div>

      {saveNotice && (
        <div className="notice-banner success-banner">
          <CheckCircle2 size={18} className="banner-icon" />
          <span>Profile and sectoral preferences updated successfully!</span>
        </div>
      )}

      <div className="profile-settings-layout">
        {/* Left Column: Form */}
        <div className="profile-form-column">
          <form onSubmit={handleSave} className="settings-card">
            <h3>Institutional & Contact Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="field-label" htmlFor="profile-name">
                  <span>Full Name</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="input-field"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="profile-email">
                  <span>Official Email Address</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="input-field"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="field-label" htmlFor="profile-designation">
                  <span>Professional Designation</span>
                </label>
                <input
                  id="profile-designation"
                  type="text"
                  className="input-field"
                  value={profile.designation}
                  onChange={e =>
                    setProfile({ ...profile, designation: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="profile-institution">
                  <span>Institution / NGO / Partner Org</span>
                </label>
                <input
                  id="profile-institution"
                  type="text"
                  className="input-field"
                  value={profile.institution}
                  onChange={e =>
                    setProfile({ ...profile, institution: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="field-label" htmlFor="profile-location">
                  <span>Operating District & State</span>
                </label>
                <input
                  id="profile-location"
                  type="text"
                  className="input-field"
                  value={profile.location}
                  onChange={e =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="profile-languages">
                  <span>Languages Supported (comma-separated)</span>
                </label>
                <input
                  id="profile-languages"
                  type="text"
                  className="input-field"
                  value={profile.languages.join(', ')}
                  onChange={e =>
                    setProfile({
                      ...profile,
                      languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            {/* Sector Expertise Checklist */}
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="field-label">
                <span>Sectoral Expertise Tracks</span>
                <span className="field-hint">
                  Learner compatibility indicators match directly with these selected sectors
                </span>
              </label>
              <div className="sector-checkbox-grid">
                {AVAILABLE_SECTORS.map(sec => {
                  const isChecked = profile.sectors.includes(sec)
                  return (
                    <button
                      key={sec}
                      type="button"
                      className={`sector-toggle-chip ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleSector(sec)}
                    >
                      {isChecked ? <Check size={14} /> : null}
                      <span>{sec}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="field-label" htmlFor="profile-bio">
                <span>Facilitator Bio & Guidance Mission</span>
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                className="textarea-field"
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div className="settings-form-actions">
              <button type="submit" className="button primary">
                <Save size={16} /> Save Profile Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Demo Management & Transparency Info */}
        <div className="profile-info-column">
          {/* Transparency & Ethical Matching Pledge */}
          <div className="settings-card">
            <h3>
              <ShieldCheck size={18} /> Ethical Matching & Data Pledge
            </h3>
            <p className="settings-card-text">
              MyRaah’s Facilitator Portal adheres to non-discriminatory, skills-first principles:
            </p>
            <ul className="pledge-list">
              <li>
                <strong>Transparent Compatibility:</strong> Compatibility scores are rule-based indicators derived from verified practical projects and curriculum tracks, never black-box AI.
              </li>
              <li>
                <strong>Learner Consent:</strong> Candidate records are only transmitted to partner employers after explicit learner consent.
              </li>
              <li>
                <strong>Local Storage Isolation:</strong> All prototype records are stored securely in your browser's local sandbox.
              </li>
            </ul>
          </div>

          {/* Reset Demo Data Card */}
          <div className="settings-card danger-card">
            <h3>
              <RotateCcw size={18} /> Reset Demo Workspace
            </h3>
            <p className="settings-card-text">
              Reinitialize all learners, demo referral pipelines, opportunities, and follow-ups to initial demo state.
            </p>
            {!showResetConfirm ? (
              <button
                type="button"
                className="button secondary button-danger"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset Demo Data
              </button>
            ) : (
              <div className="confirm-reset-box">
                <p>Are you sure? Any custom referrals or follow-ups will be reset.</p>
                <div className="confirm-reset-actions">
                  <button
                    type="button"
                    className="button secondary button-sm"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button primary button-danger button-sm"
                    onClick={handleReset}
                  >
                    Yes, Reset Demo Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
