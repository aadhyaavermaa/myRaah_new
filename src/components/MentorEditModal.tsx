import { useState } from 'react'
import { Check, Plus, Sparkles, Trash2, X } from 'lucide-react'
import type { MentorProfile, TeachingMode, User } from '../types'
import { mentorStore } from '../services/mentorStore'

interface MentorEditModalProps {
  user: User
  mentor: MentorProfile
  onClose: () => void
  onSaved: (updatedMentor: MentorProfile) => void
  onOpenSampleStudio?: () => void
}

const ALL_TEACHING_MODES: { id: TeachingMode; label: string; desc: string }[] = [
  { id: 'voice', label: 'Voice Calls & Audio Notes', desc: 'Ideal for low-bandwidth phone guidance' },
  { id: 'text', label: 'Text & Chat Guidance', desc: 'Fast, data-efficient messaging' },
  { id: 'video', label: 'Video Consultations', desc: 'Face-to-face screen sharing and demos' },
  { id: 'online', label: 'Online Groups / Webinars', desc: 'Virtual group workshops' },
  { id: 'in-person', label: 'In-person / Local Cluster', desc: 'Direct regional meeting where available' },
]

const POPULAR_LANGUAGES = [
  'Hindi',
  'English',
  'Rajasthani',
  'Bhojpuri',
  'Bengali',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Punjabi',
  'Kannada',
  'Odia',
  'Urdu',
]

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export default function MentorEditModal({
  user,
  mentor,
  onClose,
  onSaved,
  onOpenSampleStudio,
}: MentorEditModalProps) {
  const [name, setName] = useState(mentor.name)
  const [headline, setHeadline] = useState(mentor.headline)
  const [bio, setBio] = useState(mentor.bio)
  const [education, setEducation] = useState(mentor.education)
  const [qualifications, setQualifications] = useState<string[]>(mentor.qualifications || [])
  const [newQual, setNewQual] = useState('')
  const [experienceYears, setExperienceYears] = useState(mentor.experienceYears)
  const [teachingModes, setTeachingModes] = useState<TeachingMode[]>(mentor.teachingModes || ['voice', 'text'])
  const [languages, setLanguages] = useState<string[]>(mentor.languages || ['Hindi'])
  const [newLang, setNewLang] = useState('')
  const [location, setLocation] = useState(mentor.location)
  const [videoUrl, setVideoUrl] = useState(mentor.introVideo?.videoUrl || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(mentor.introVideo?.thumbnailUrl || '')
  const [captionText, setCaptionText] = useState(mentor.introVideo?.captionText || '')
  const [writtenIntro, setWrittenIntro] = useState(mentor.writtenIntro || '')
  const [availabilityDays, setAvailabilityDays] = useState<string[]>(mentor.availabilityDays || [])
  const [availabilityHours, setAvailabilityHours] = useState(mentor.availabilityHours || '4:00 PM – 7:00 PM IST')
  const [acceptingMentees, setAcceptingMentees] = useState(mentor.acceptingMentees ?? true)

  const [activeTab, setActiveTab] = useState<'basics' | 'qualifications' | 'modes' | 'intro' | 'availability'>('basics')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleToggleMode = (mode: TeachingMode) => {
    if (teachingModes.includes(mode)) {
      if (teachingModes.length === 1) return // Keep at least one
      setTeachingModes(teachingModes.filter(m => m !== mode))
    } else {
      setTeachingModes([...teachingModes, mode])
    }
  }

  const handleToggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length === 1) return
      setLanguages(languages.filter(l => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const handleAddCustomLanguage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLang.trim()) return
    const trimmed = newLang.trim()
    if (!languages.includes(trimmed)) {
      setLanguages([...languages, trimmed])
    }
    setNewLang('')
  }

  const handleAddQualification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQual.trim()) return
    setQualifications([...qualifications, newQual.trim()])
    setNewQual('')
  }

  const handleRemoveQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  const handleToggleDay = (day: string) => {
    if (availabilityDays.includes(day)) {
      setAvailabilityDays(availabilityDays.filter(d => d !== day))
    } else {
      setAvailabilityDays([...availabilityDays, day])
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (!headline.trim()) {
      setError('Please provide a professional title / headline.')
      return
    }
    if (!bio.trim()) {
      setError('Please provide your introduction / bio.')
      return
    }

    setLoading(true)

    const updates = {
      name: name.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      education: education.trim(),
      qualifications,
      experienceYears: Number(experienceYears) || 0,
      teachingModes,
      languages,
      location: location.trim(),
      introVideo: videoUrl.trim()
        ? {
            videoUrl: videoUrl.trim(),
            thumbnailUrl: thumbnailUrl.trim() || undefined,
            captionText: captionText.trim() || undefined,
            duration: '3:30',
          }
        : undefined,
      writtenIntro: writtenIntro.trim(),
      availabilityDays,
      availabilityHours: availabilityHours.trim(),
      acceptingMentees,
    }

    const result = mentorStore.updateMentorProfile(user, mentor.id, updates)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Failed to update profile.')
      return
    }

    const fresh = mentorStore.getMentorById(mentor.id)
    if (fresh) {
      onSaved(fresh)
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <section className="modal mentor-edit-dialog" role="dialog" aria-modal="true" aria-label="Edit Mentor Profile">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">MENTOR DASHBOARD</span>
            <h2>Edit Your Teaching Profile & Portfolio</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close edit profile dialog">
            <X size={19} />
          </button>
        </div>

        <div className="mentor-edit-tabs">
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'basics' ? 'active' : ''}`}
            onClick={() => setActiveTab('basics')}
          >
            1. Basics & Bio
          </button>
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'qualifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('qualifications')}
          >
            2. Qualifications & Experience
          </button>
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'modes' ? 'active' : ''}`}
            onClick={() => setActiveTab('modes')}
          >
            3. Teaching Modes & Languages
          </button>
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            4. Video & Introduction
          </button>
          <button
            type="button"
            className={`mentor-tab-btn ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            5. Availability & Schedule
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body mentor-edit-form">
          {error && <div className="form-error" role="alert">{error}</div>}

          {activeTab === 'basics' && (
            <div className="tab-pane">
              <label className="field">
                <span>Full Name <b className="required">*</b></span>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Asha Mehta"
                  required
                />
              </label>

              <label className="field">
                <span>Professional Title & Short Headline <b className="required">*</b></span>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder="e.g. Community Health Educator & Youth Career Counselor"
                  required
                />
                <small>This headline appears prominently under your name on your public portfolio.</small>
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Location / Service Region</span>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Alwar, Rajasthan"
                  />
                </label>
                <label className="field">
                  <span>Total Experience (in years)</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                  />
                </label>
              </div>

              <label className="field">
                <span>Detailed Biography & Purpose <b className="required">*</b></span>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share your personal journey, why you want to support rural students, and what they can learn from you..."
                  required
                />
              </label>
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div className="tab-pane">
              <label className="field">
                <span>Education & Degrees <b className="required">*</b></span>
                <input
                  type="text"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  placeholder="e.g. B.Sc. Nursing, AIIMS Jodhpur · PG Diploma in Public Health"
                  required
                />
                <small>Honest, authentic qualifications build trust with students and parents.</small>
              </label>

              <div className="qualifications-editor">
                <span className="field-label">Verified Certifications & Recognitions</span>
                <div className="tag-row current-qualifications">
                  {qualifications.map((q, i) => (
                    <span key={i} className="qual-chip">
                      {q}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(i)}
                        title="Remove qualification"
                        aria-label={`Remove qualification ${q}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                  {qualifications.length === 0 && (
                    <p className="fineprint">No specific certifications added yet.</p>
                  )}
                </div>

                <div className="add-tag-box">
                  <input
                    type="text"
                    placeholder="Add a certification or achievement"
                    value={newQual}
                    onChange={e => setNewQual(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddQualification(e)
                      }
                    }}
                  />
                  <button type="button" className="button secondary" onClick={handleAddQualification}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modes' && (
            <div className="tab-pane">
              <div className="modes-selection-group">
                <span className="field-label">How can students learn with you? (Teaching Modes)</span>
                <p className="step-desc">Select all modes you actively offer to rural students.</p>
                <div className="teaching-modes-grid">
                  {ALL_TEACHING_MODES.map(tm => {
                    const isChecked = teachingModes.includes(tm.id)
                    return (
                      <label key={tm.id} className={`teaching-mode-card ${isChecked ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMode(tm.id)}
                        />
                        <div className="mode-card-content">
                          <strong>{tm.label}</strong>
                          <small>{tm.desc}</small>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="languages-selection-group" style={{ marginTop: '22px' }}>
                <span className="field-label">Supported Languages (Hindi & Regional)</span>
                <p className="step-desc">Help students feel comfortable asking doubts in their mother tongue.</p>
                <div className="language-pills-grid">
                  {POPULAR_LANGUAGES.map(lang => {
                    const isSelected = languages.includes(lang)
                    return (
                      <button
                        type="button"
                        key={lang}
                        className={`choice ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleLanguage(lang)}
                      >
                        {isSelected && <Check size={14} />} {lang}
                      </button>
                    )
                  })}
                </div>

                <div className="add-tag-box" style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="Other regional dialect or language (e.g. Haryanvi, Bundeli)"
                    value={newLang}
                    onChange={e => setNewLang(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomLanguage(e)
                      }
                    }}
                  />
                  <button type="button" className="button secondary" onClick={handleAddCustomLanguage}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intro' && (
            <div className="tab-pane">
              {/* Teach Me Anything Sample Lesson Studio Callout */}
              <div className="edit-modal-studio-banner">
                <div className="banner-icon-col">
                  <Sparkles size={20} />
                </div>
                <div className="banner-info-col">
                  <strong>Teach Me Anything — Sample Lesson Studio</strong>
                  <p>
                    Record or upload a 30–60 second micro-lesson with synchronized subtitles. Showcase your teaching style directly on your public portfolio.
                  </p>
                </div>
                <button
                  type="button"
                  className="button primary small-button"
                  onClick={() => {
                    onClose()
                    onOpenSampleStudio?.()
                  }}
                >
                  <Sparkles size={14} /> Create Sample Lesson
                </button>
              </div>

              <span className="field-label">Introduction Video ("Meet Your Mentor")</span>
              <p className="step-desc">
                An introduction video lets students hear your voice, see your teaching demeanor, and connect with confidence.
              </p>

              <label className="field">
                <span>Introduction Video URL (MP4, YouTube, or demo CDN link)</span>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/.../intro.mp4"
                />
              </label>

              <label className="field">
                <span>Video Thumbnail Poster URL (optional)</span>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </label>

              <label className="field">
                <span>Video Caption / Subtitle Topic</span>
                <input
                  type="text"
                  value={captionText}
                  onChange={e => setCaptionText(e.target.value)}
                  placeholder="e.g. Welcome message in Hindi with English subtitles"
                />
              </label>

              <label className="field" style={{ marginTop: '14px' }}>
                <span>Written Introduction Alternative</span>
                <textarea
                  rows={3}
                  value={writtenIntro}
                  onChange={e => setWrittenIntro(e.target.value)}
                  placeholder="If a video is unavailable, this welcoming written note greets visiting students in their regional language..."
                />
                <small>Helps students on low-bandwidth 2G/3G connections who cannot load high-res video.</small>
              </label>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="tab-pane">
              <label className="check-row" style={{ marginBottom: '18px', padding: '12px', background: '#edf8f6', borderRadius: '6px' }}>
                <input
                  type="checkbox"
                  checked={acceptingMentees}
                  onChange={e => setAcceptingMentees(e.target.checked)}
                />
                <div>
                  <strong>Accepting New Mentees & Doubt Requests</strong>
                  <p style={{ margin: 0, fontSize: '11px', color: '#556569' }}>
                    Turn this off if your schedule is currently full or you are on temporary leave.
                  </p>
                </div>
              </label>

              <span className="field-label">Weekly Availability Days</span>
              <div className="choice-grid" style={{ marginTop: '8px', marginBottom: '16px' }}>
                {DAYS_OF_WEEK.map(d => {
                  const sel = availabilityDays.includes(d)
                  return (
                    <button
                      type="button"
                      key={d}
                      className={`choice ${sel ? 'selected' : ''}`}
                      onClick={() => handleToggleDay(d)}
                    >
                      {sel && <Check size={14} />} {d}
                    </button>
                  )
                })}
              </div>

              <label className="field">
                <span>Preferred Hours / Timing Window</span>
                <input
                  type="text"
                  value={availabilityHours}
                  onChange={e => setAvailabilityHours(e.target.value)}
                  placeholder="e.g. 5:00 PM – 7:30 PM IST (After school/college hours)"
                />
              </label>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '24px', borderTop: '1px solid #edf1f2', paddingTop: '16px' }}>
            <button type="button" className="button secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={loading}>
              {loading ? 'Saving Changes…' : 'Save & Publish Profile'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
