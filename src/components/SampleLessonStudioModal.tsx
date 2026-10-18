import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Clock,
  Edit3,
  FileVideo,
  Play,
  Subtitles,
  Trash2,
  Upload,
  Video,
  Volume2,
  X,
} from 'lucide-react'
import type { LessonStatus, SampleLesson, User } from '../types'
import { mentorStore, parseSubtitleText } from '../services/mentorStore'
import { mediaStorage } from '../services/mediaStorage'

interface SampleLessonStudioModalProps {
  currentUser: User
  mentorId: string
  onClose: () => void
  onLessonPublished: () => void
  editingLesson?: SampleLesson | null
}

const SAMPLE_DEMO_CLIPS = [
  {
    label: 'Healthcare Micro-Lesson (45s Video)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 45,
    type: 'video' as const,
  },
  {
    label: 'Agriculture Technique (38s Audio)',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 38,
    type: 'audio' as const,
  },
  {
    label: 'Digital Skills Smartphone Demo (50s Video)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 50,
    type: 'video' as const,
  },
]

export default function SampleLessonStudioModal({
  currentUser,
  mentorId,
  onClose,
  onLessonPublished,
  editingLesson,
}: SampleLessonStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'drafts'>(editingLesson ? 'editor' : 'editor')

  // Form State
  const [lessonId, setLessonId] = useState<string | undefined>(editingLesson?.id)
  const [title, setTitle] = useState(editingLesson?.title || '')
  const [subject, setSubject] = useState(editingLesson?.subject || 'Career exploration & skills')
  const [language, setLanguage] = useState(editingLesson?.language || 'Hindi')
  const [description, setDescription] = useState(editingLesson?.description || '')
  const [mediaType, setMediaType] = useState<'video' | 'audio'>(editingLesson?.mediaType || 'video')

  // Media File & Duration State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>(
    editingLesson?.sampleMediaUrl || ''
  )
  const [durationSeconds, setDurationSeconds] = useState<number>(editingLesson?.durationSeconds || 0)
  const [durationError, setDurationError] = useState<string>('')
  const [isValidatingMedia, setIsValidatingMedia] = useState(false)

  // Subtitles State
  const [subtitlesText, setSubtitlesText] = useState(
    editingLesson?.subtitlesText ||
      '0:00 - 0:15 | Welcome students to this 45-second micro-lesson!\n0:15 - 0:35 | Here is the key requirement you need to remember.\n0:35 - 0:45 | Ask me any doubt below if you have questions.'
  )

  // Preview & Playback State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Drafts list for this mentor
  const [drafts, setDrafts] = useState<SampleLesson[]>(() =>
    mentorStore.getSampleLessons(mentorId, 'draft')
  )

  // If editing an existing lesson with an IndexedDB key, load blob URL
  useEffect(() => {
    let activeBlobUrl = ''
    if (editingLesson?.mediaKey) {
      mediaStorage.getMediaBlob(editingLesson.mediaKey).then(blob => {
        if (blob) {
          activeBlobUrl = URL.createObjectURL(blob)
          setMediaPreviewUrl(activeBlobUrl)
        }
      })
    }
    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl)
      }
    }
  }, [editingLesson])

  // Revoke object URL when new file is selected or component unmounts
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreviewUrl)
      }
    }
  }, [mediaPreviewUrl])

  // Handle local video/audio file selection with duration validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDurationError('')
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    // Verify format
    const isVideo = file.type.startsWith('video/')
    const isAudio = file.type.startsWith('audio/')

    if (!isVideo && !isAudio) {
      setError('Unsupported format. Please select an MP4, WebM, MP3, or WAV file.')
      return
    }

    setMediaType(isVideo ? 'video' : 'audio')
    setSelectedFile(file)
    setIsValidatingMedia(true)

    // Create temporary URL for metadata extraction
    const objectUrl = URL.createObjectURL(file)

    const tempElement = document.createElement(isVideo ? 'video' : 'audio')
    tempElement.preload = 'metadata'
    tempElement.src = objectUrl

    tempElement.onloadedmetadata = () => {
      const dur = Math.round(tempElement.duration)
      setIsValidatingMedia(false)

      if (isNaN(dur) || dur <= 0) {
        setDurationError('Could not detect media duration. Please check file integrity.')
        return
      }

      setDurationSeconds(dur)

      // Strict validation: 30 to 60 seconds
      if (dur < 30 || dur > 60) {
        setDurationError(
          `Lesson duration is ${dur} seconds. "Teach Me Anything" micro-lessons must be strictly between 30 and 60 seconds.`
        )
      } else {
        setDurationError('')
      }

      setMediaPreviewUrl(objectUrl)
    }

    tempElement.onerror = () => {
      setIsValidatingMedia(false)
      setError('Failed to load media metadata. The file may be corrupt or encoded in an unsupported codec.')
    }
  }

  // Pre-tested demo clip helper
  const handleUseDemoClip = (clip: (typeof SAMPLE_DEMO_CLIPS)[0]) => {
    setSelectedFile(null)
    setMediaPreviewUrl(clip.url)
    setMediaType(clip.type)
    setDurationSeconds(clip.duration)
    setDurationError('')
    setError('')
  }

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Parse cues from current text
  const cues = parseSubtitleText(subtitlesText, durationSeconds || 45)

  // Find active cue during playback
  const activeCue = cues.find(
    c => currentPlaybackTime >= c.start && currentPlaybackTime <= c.end
  )

  // Save lesson (as draft or published)
  const handleSave = async (status: LessonStatus) => {
    setError('')

    if (!title.trim()) {
      setError('Please provide a lesson title.')
      return
    }

    if (!description.trim()) {
      setError('Please enter a short description or learning outcome.')
      return
    }

    if (!mediaPreviewUrl) {
      setError('Please upload a video/audio file or select a sample clip.')
      return
    }

    // Require strict duration between 30 and 60 seconds for publishing
    if (durationSeconds < 30 || durationSeconds > 60) {
      setError(
        `Duration restriction: Lesson must be 30–60 seconds long. Current duration is ${durationSeconds}s.`
      )
      return
    }

    setSaving(true)

    try {
      let mediaKey = editingLesson?.mediaKey

      // If user uploaded a new local file, persist it in IndexedDB
      if (selectedFile) {
        mediaKey = `media_${mentorId}_${Date.now()}`
        await mediaStorage.saveMediaBlob(mediaKey, selectedFile)
      }

      const res = mentorStore.saveSampleLesson(currentUser, {
        id: lessonId,
        mentorId,
        title: title.trim(),
        subject,
        language,
        description: description.trim(),
        durationSeconds,
        durationFormatted: formatTime(durationSeconds),
        mediaType,
        mediaKey,
        sampleMediaUrl: selectedFile ? undefined : mediaPreviewUrl,
        subtitlesText: subtitlesText.trim(),
        subtitlesCues: cues,
        status,
      })

      setSaving(false)

      if (!res.success) {
        setError(res.error || 'Failed to save lesson.')
        return
      }

      window.dispatchEvent(
        new CustomEvent('myraah-message', {
          detail:
            status === 'published'
              ? `Sample lesson "${title}" is now published on your public portfolio!`
              : `Lesson draft "${title}" saved. You can resume editing anytime.`,
        })
      )

      onLessonPublished()
      onClose()
    } catch (e: any) {
      setSaving(false)
      setError(e?.message || 'Unexpected error saving media blob to IndexedDB.')
    }
  }

  const handleResumeDraft = (draft: SampleLesson) => {
    setLessonId(draft.id)
    setTitle(draft.title)
    setSubject(draft.subject)
    setLanguage(draft.language)
    setDescription(draft.description)
    setMediaType(draft.mediaType)
    setDurationSeconds(draft.durationSeconds)
    setSubtitlesText(draft.subtitlesText || '')
    setMediaPreviewUrl(draft.sampleMediaUrl || '')

    if (draft.mediaKey) {
      mediaStorage.getMediaBlob(draft.mediaKey).then(blob => {
        if (blob) setMediaPreviewUrl(URL.createObjectURL(blob))
      })
    }

    setActiveTab('editor')
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Delete this lesson draft?')) return
    await mentorStore.deleteSampleLesson(currentUser, draftId)
    setDrafts(mentorStore.getSampleLessons(mentorId, 'draft'))
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <section
        className="modal sample-lesson-studio-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Teach Me Anything — Sample Lesson Studio"
      >
        {/* Studio Header */}
        <div className="modal-heading">
          <div>
            <span className="eyebrow">TEACH ME ANYTHING · STUDIO</span>
            <h2>Sample Lesson Studio (30–60s Micro-Lessons)</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close studio">
            <X size={19} />
          </button>
        </div>


        {/* Studio Navigation Tabs */}
        <div className="studio-nav-tabs">
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Edit3 size={14} /> {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
          </button>
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => {
              setDrafts(mentorStore.getSampleLessons(mentorId, 'draft'))
              setActiveTab('drafts')
            }}
          >
            <Clock size={14} /> My Drafts ({drafts.length})
          </button>
        </div>

        {/* Tab 1: Editor */}
        {activeTab === 'editor' && (
          <>
            <div className="modal-body studio-editor-body">
            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="studio-grid-layout">
              {/* Left Column: Form Details */}
              <div className="studio-form-col">
                <label className="field">
                  <span>Lesson Title <b className="required">*</b></span>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. ANM Nursing Eligibility in 45 Seconds"
                    required
                  />
                  <small>Make it catchy and descriptive for rural students.</small>
                </label>

                <div className="field-grid">
                  <label className="field">
                    <span>Subject / Topic Domain</span>
                    <select value={subject} onChange={e => setSubject(e.target.value)}>
                      <option value="Healthcare & Nursing">Healthcare & Nursing</option>
                      <option value="Agriculture & Schemes">Agriculture & Rural Tech</option>
                      <option value="Computer & Digital Skills">Computer & Digital Skills</option>
                      <option value="Scholarships & Govt Schemes">Scholarships & Govt Schemes</option>
                      <option value="Vocational Trades & ITI">Vocational Trades & ITI</option>
                      <option value="Competitive Exam Prep">Competitive Exam Prep</option>
                      <option value="Career exploration & skills">Career Exploration & Skills</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>Language Spoken</span>
                    <input
                      type="text"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      placeholder="e.g. Hindi, Rajasthani, English"
                      required
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Description & Key Takeaway <b className="required">*</b></span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Briefly summarize what students will learn from this short lesson..."
                    required
                  />
                </label>

                {/* Media Upload & Browser Duration Validator */}
                <div className="studio-upload-section">
                  <span className="field-label">
                    Upload 30–60s Video or Audio File <b className="required">*</b>
                  </span>

                  <div className="upload-dropzone">
                    <input
                      type="file"
                      id="studio-file-input"
                      accept="video/mp4,video/webm,audio/mp3,audio/wav,video/*,audio/*"
                      onChange={handleFileChange}
                      className="hidden-file-input"
                    />
                    <label htmlFor="studio-file-input" className="dropzone-label">
                      <Upload size={24} />
                      <strong>Click to choose video or audio file</strong>
                      <small>MP4, WebM, MP3 or WAV (Browser validates duration strictly 30–60s)</small>
                    </label>
                  </div>

                  {isValidatingMedia && (
                    <div className="validating-badge">
                      <Clock size={14} className="spin-icon" /> Reading media metadata in browser…
                    </div>
                  )}

                  {/* Duration Validation Display */}
                  {durationSeconds > 0 && (
                    <div
                      className={`duration-status-card ${
                        durationSeconds >= 30 && durationSeconds <= 60
                          ? 'duration-valid'
                          : 'duration-invalid'
                      }`}
                    >
                      {durationSeconds >= 30 && durationSeconds <= 60 ? (
                        <>
                          <Check size={18} />
                          <div>
                            <strong>Valid Duration: {durationSeconds} seconds ({formatTime(durationSeconds)})</strong>
                            <small>Perfect! Meets the 30–60 second micro-learning requirement.</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={18} />
                          <div>
                            <strong>Invalid Duration: {durationSeconds} seconds ({formatTime(durationSeconds)})</strong>
                            <small>
                              {durationSeconds < 30
                                ? `Video is too short (${durationSeconds}s). Minimum allowed duration is 30 seconds.`
                                : `Video is too long (${durationSeconds}s). Maximum allowed duration is 60 seconds.`}
                            </small>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {durationError && (
                    <div className="form-error" style={{ marginTop: '8px' }}>
                      {durationError}
                    </div>
                  )}

                  {/* Fast Testing Clip Presets */}
                  <div className="demo-clips-helper">
                    <span>Or test with a pre-validated sample clip:</span>
                    <div className="clip-pills">
                      {SAMPLE_DEMO_CLIPS.map(clip => (
                        <button
                          key={clip.label}
                          type="button"
                          className="clip-preset-btn"
                          onClick={() => handleUseDemoClip(clip)}
                        >
                          <Play size={11} /> {clip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subtitles & Captions Editor */}
                <div className="subtitles-editor-card">
                  <div className="subtitles-editor-head">
                    <Subtitles size={16} />
                    <strong>Synchronized Subtitles & Captions</strong>
                    <span className="demo-label">ACCESSIBILITY</span>
                  </div>
                  <p className="step-desc">
                    Enter subtitles with timestamps (e.g. <code>0:00 - 0:15 | Text</code>) or line-by-line. They will display synchronized on screen during video playback.
                  </p>

                  <textarea
                    rows={4}
                    value={subtitlesText}
                    onChange={e => setSubtitlesText(e.target.value)}
                    placeholder="0:00 - 0:15 | Welcome students!\n0:15 - 0:35 | Explanation here...\n0:35 - 0:45 | Summary."
                    className="subtitles-textarea"
                  />
                  <div className="subtitles-parsed-count">
                    <small>Parsed Cues: {cues.length} timed subtitles</small>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Player & Subtitle Preview */}
              <div className="studio-preview-col">
                <div className="preview-sticky-card">
                  <div className="preview-header">
                    <span className="eyebrow">LIVE MEDIA PREVIEW</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isPlayingPreview && (
                        <span style={{ fontSize: '10px', color: '#00b3a4', fontWeight: 700 }}>
                          ● Playing
                        </span>
                      )}
                      <span className="duration-tag">{formatTime(durationSeconds || 45)}</span>
                    </div>
                  </div>

                  {mediaPreviewUrl ? (
                    <div className="player-preview-container">
                      {mediaType === 'video' ? (
                        <div className="video-player-box">
                          <video
                            ref={previewVideoRef}
                            src={mediaPreviewUrl}
                            controls
                            className="studio-video-element"
                            onTimeUpdate={() => {
                              if (previewVideoRef.current) {
                                setCurrentPlaybackTime(previewVideoRef.current.currentTime)
                              }
                            }}
                            onPlay={() => setIsPlayingPreview(true)}
                            onPause={() => setIsPlayingPreview(false)}
                          />

                          {/* Live Subtitle Overlay */}
                          {activeCue && (
                            <div className="live-subtitle-overlay" aria-live="polite">
                              <span>{activeCue.text}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="audio-player-box">
                          <Volume2 size={36} />
                          <strong>Audio Micro-Lesson Preview</strong>
                          <audio
                            ref={previewAudioRef}
                            src={mediaPreviewUrl}
                            controls
                            className="studio-audio-element"
                            onPlay={() => setIsPlayingPreview(true)}
                            onPause={() => setIsPlayingPreview(false)}
                            onTimeUpdate={() => {
                              if (previewAudioRef.current) {
                                setCurrentPlaybackTime(previewAudioRef.current.currentTime)
                              }
                            }}
                          />
                          {activeCue && (
                            <div className="live-audio-subtitle-box">
                              <Subtitles size={14} />
                              <span>{activeCue.text}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-preview-placeholder">
                      <FileVideo size={40} />
                      <p>Select a video/audio file on the left to preview playback and subtitles.</p>
                    </div>
                  )}

                  {/* Preview Metadata Summary */}
                  <div className="preview-meta-summary">
                    <h4>{title || 'Untitled Micro-Lesson'}</h4>
                    <div className="preview-badges-row">
                      <span className="badge-subj">{subject}</span>
                      <span className="badge-lang">{language}</span>
                      <span className="badge-time">{formatTime(durationSeconds)}</span>
                    </div>
                    <p className="preview-desc-text">
                      {description || 'No description provided yet.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Actions Footer - pinned at bottom of modal */}
          <div className="modal-actions studio-modal-actions">
              <button type="button" className="button secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => handleSave('draft')}
                disabled={saving || isValidatingMedia}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="button primary"
                onClick={() => handleSave('published')}
                disabled={saving || isValidatingMedia || durationSeconds < 30 || durationSeconds > 60}
              >
                {saving ? 'Publishing…' : 'Publish to Public Portfolio'}
              </button>
            </div>
          </>
        )}

        {/* Tab 2: Drafts Management */}
        {activeTab === 'drafts' && (
          <div className="modal-body studio-drafts-body">
            <h3>Your Saved Lesson Drafts ({drafts.length})</h3>
            <p className="step-desc">
              Unfinished lessons saved on this device. You can resume editing, test media, or publish when ready.
            </p>

            {drafts.length > 0 ? (
              <div className="drafts-list-grid">
                {drafts.map(d => (
                  <div key={d.id} className="draft-card">
                    <div className="draft-card-head">
                      <span className="draft-type-chip">
                        {d.mediaType === 'video' ? <Video size={13} /> : <Volume2 size={13} />}
                        {d.durationFormatted} · {d.language}
                      </span>
                      <span className="draft-date">Saved {d.updatedAt}</span>
                    </div>
                    <h4>{d.title}</h4>
                    <p>{d.description}</p>
                    <div className="draft-card-actions">
                      <button
                        type="button"
                        className="button small-primary"
                        onClick={() => handleResumeDraft(d)}
                      >
                        <Edit3 size={13} /> Resume Editing
                      </button>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => handleDeleteDraft(d.id)}
                        title="Delete draft"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span><Clock size={28} /></span>
                <h3>No drafts found</h3>
                <p>When you choose "Save as Draft", your work will appear here.</p>
                <button
                  type="button"
                  className="button primary"
                  style={{ marginTop: '12px' }}
                  onClick={() => setActiveTab('editor')}
                >
                  Create New Lesson
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
