import { useEffect, useState } from 'react'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Languages,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Subtitles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Video,
  Volume2,
  Wifi,
} from 'lucide-react'
import type { SampleLesson, SubtitleCue, User } from '../types'
import { mentorStore } from '../services/mentorStore'
import { mediaStorage } from '../services/mediaStorage'

interface SampleLessonsSectionProps {
  mentorId: string
  currentUser: User | null
  isOwner: boolean
  onOpenStudio: (lessonToEdit?: SampleLesson | null) => void
  lowBandwidthMode?: boolean
}

export default function SampleLessonsSection({
  mentorId,
  currentUser,
  isOwner,
  onOpenStudio,
  lowBandwidthMode = false,
}: SampleLessonsSectionProps) {
  const [lessons, setLessons] = useState<SampleLesson[]>([])
  const [activeMediaUrls, setActiveMediaUrls] = useState<Record<string, string>>({})
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'video' | 'audio'>('All')
  const [expandedTranscripts, setExpandedTranscripts] = useState<Record<string, boolean>>({})
  const [expandedFeedback, setExpandedFeedback] = useState<Record<string, boolean>>({})

  // Feedback form inputs per lesson
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({})
  const [feedbackHelpfulState, setFeedbackHelpfulState] = useState<Record<string, boolean>>({})
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<Record<string, boolean>>({})

  // Current playing cue per lesson
  const [currentCues, setCurrentCues] = useState<Record<string, SubtitleCue | null>>({})

  // Reload published lessons
  const loadLessons = () => {
    const published = mentorStore.getSampleLessons(mentorId, 'published')
    setLessons(published)
  }

  useEffect(() => {
    loadLessons()
  }, [mentorId])

  // Resolve object URLs for lessons with IndexedDB blobs
  useEffect(() => {
    let isMounted = true
    const urlsToRevoke: string[] = []

    const resolveMedia = async () => {
      const urlMap: Record<string, string> = {}
      for (const lesson of lessons) {
        if (lesson.sampleMediaUrl) {
          urlMap[lesson.id] = lesson.sampleMediaUrl
        } else if (lesson.mediaKey) {
          try {
            const blob = await mediaStorage.getMediaBlob(lesson.mediaKey)
            if (blob && isMounted) {
              const objUrl = URL.createObjectURL(blob)
              urlsToRevoke.push(objUrl)
              urlMap[lesson.id] = objUrl
            }
          } catch (err) {
            console.error('Error loading media blob for lesson', lesson.id, err)
          }
        }
      }
      if (isMounted) {
        setActiveMediaUrls(urlMap)
      }
    }

    resolveMedia()

    return () => {
      isMounted = false
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url))
    }
  }, [lessons])

  // Filter lessons
  const filteredLessons = lessons.filter(l => {
    if (selectedFilter === 'All') return true
    return l.mediaType === selectedFilter
  })

  // Handle helpful / not helpful vote
  const handleVote = (lessonId: string, isHelpful: boolean) => {
    const res = mentorStore.voteLessonHelpful(currentUser, lessonId, isHelpful)
    if (res.success) {
      loadLessons()
    } else if (res.error) {
      alert(res.error)
    }
  }

  // Handle student written feedback submit
  const handleFeedbackSubmit = (e: React.FormEvent, lessonId: string) => {
    e.preventDefault()
    const text = feedbackInputs[lessonId] || ''
    if (!text.trim()) return

    setFeedbackSubmitting(prev => ({ ...prev, [lessonId]: true }))
    const isHelpful = feedbackHelpfulState[lessonId] !== false // default true

    const res = mentorStore.addLessonFeedback(currentUser, lessonId, text, isHelpful)
    setFeedbackSubmitting(prev => ({ ...prev, [lessonId]: false }))

    if (res.success) {
      setFeedbackInputs(prev => ({ ...prev, [lessonId]: '' }))
      // Auto open feedback list to see the new comment
      setExpandedFeedback(prev => ({ ...prev, [lessonId]: true }))
      loadLessons()
      window.dispatchEvent(
        new CustomEvent('myraah-message', {
          detail: 'Your feedback on this sample lesson has been shared with the mentor. Thank you!',
        })
      )
    } else {
      alert(res.error || 'Unable to submit feedback.')
    }
  }

  // Handle media time update to synchronize subtitle cue
  const handleTimeUpdate = (lesson: SampleLesson, currentTime: number) => {
    if (!lesson.subtitlesCues || lesson.subtitlesCues.length === 0) return

    const activeCue =
      lesson.subtitlesCues.find(cue => currentTime >= cue.start && currentTime <= cue.end) || null

    setCurrentCues(prev => {
      if (prev[lesson.id]?.id === activeCue?.id) return prev
      return { ...prev, [lesson.id]: activeCue }
    })
  }

  // Handle mentor deleting a lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this sample lesson?')) return
    const res = await mentorStore.deleteSampleLesson(currentUser, lessonId)
    if (res.success) {
      loadLessons()
    } else {
      alert(res.error || 'Failed to delete lesson.')
    }
  }

  return (
    <section className="portfolio-section sample-lessons-section" id="sample-lessons-section">
      <div className="section-heading">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">TEACH ME ANYTHING · 30–60 SECONDS</span>
            <span className="duration-guarantee-pill">
              <Clock size={12} /> Strict 30–60s Guarantee
            </span>
          </div>
          <h2>Learn From My Teaching</h2>
          <p>
            Experience my teaching style through short, focused 30–60 second micro-lessons with synchronized subtitles. No long videos or heavy data required.
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            className="button primary studio-cta-btn"
            onClick={() => onOpenStudio(null)}
          >
            <Sparkles size={16} /> Open Lesson Studio
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="portfolio-category-filter">
        <button
          type="button"
          className={`filter-chip ${selectedFilter === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('All')}
        >
          All Micro-Lessons ({lessons.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${selectedFilter === 'video' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('video')}
        >
          <Video size={13} /> Video Lessons ({lessons.filter(l => l.mediaType === 'video').length})
        </button>
        <button
          type="button"
          className={`filter-chip ${selectedFilter === 'audio' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('audio')}
        >
          <Volume2 size={13} /> Audio Lessons ({lessons.filter(l => l.mediaType === 'audio').length})
        </button>
      </div>

      {filteredLessons.length > 0 ? (
        <div className="sample-lessons-grid">
          {filteredLessons.map(lesson => {
            const mediaUrl = activeMediaUrls[lesson.id]
            const activeCue = currentCues[lesson.id]
            const userVote = mentorStore.getUserLessonVote(currentUser, lesson.id)
            const feedbackList = mentorStore.getLessonFeedback(lesson.id)
            const isTranscriptOpen = expandedTranscripts[lesson.id] || false
            const isFeedbackOpen = expandedFeedback[lesson.id] || false
            const inputComment = feedbackInputs[lesson.id] || ''

            return (
              <article key={lesson.id} className="sample-lesson-card">
                {/* Lesson Header */}
                <div className="lesson-card-header">
                  <div className="lesson-badge-row">
                    <span className={`content-badge badge-${lesson.mediaType}`}>
                      {lesson.mediaType === 'video' ? <Video size={13} /> : <Volume2 size={13} />}
                      {lesson.mediaType.toUpperCase()}
                    </span>
                    <span className="lesson-duration-badge" title="Verified duration between 30 and 60 seconds">
                      <Clock size={12} /> {lesson.durationFormatted || `${lesson.durationSeconds}s`} Micro-Lesson
                    </span>
                    <span className="lesson-lang-pill">
                      <Languages size={12} /> {lesson.language}
                    </span>
                  </div>

                  {isOwner && (
                    <div className="lesson-owner-controls">
                      <button
                        type="button"
                        className="button-icon-subtle"
                        onClick={() => onOpenStudio(lesson)}
                        title="Edit lesson in studio"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        className="button-icon-subtle danger"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        title="Delete lesson"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="lesson-title-area">
                  <span className="lesson-subject-tag">{lesson.subject}</span>
                  <h3>{lesson.title}</h3>
                  <p className="lesson-desc">{lesson.description}</p>
                </div>

                {/* Media Player Area */}
                <div className="lesson-player-container">
                  {mediaUrl ? (
                    lesson.mediaType === 'video' ? (
                      <div className="lesson-video-box">
                        <video
                          src={mediaUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="lesson-video-element"
                          onTimeUpdate={e =>
                            handleTimeUpdate(lesson, (e.target as HTMLVideoElement).currentTime)
                          }
                        />
                        {/* Synchronized subtitle cue overlaid on video */}
                        {activeCue && (
                          <div className="lesson-active-subtitle-overlay" aria-live="polite">
                            <span>{activeCue.text}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="lesson-audio-box">
                        <div className="audio-header-strip">
                          <Volume2 size={24} className="audio-pulse-icon" />
                          <div>
                            <strong>Audio Explanation</strong>
                            <small>{lesson.durationFormatted || `${lesson.durationSeconds}s`} · Low Bandwidth Friendly</small>
                          </div>
                        </div>
                        <audio
                          src={mediaUrl}
                          controls
                          className="lesson-audio-element"
                          onTimeUpdate={e =>
                            handleTimeUpdate(lesson, (e.target as HTMLAudioElement).currentTime)
                          }
                        />
                        {activeCue && (
                          <div className="lesson-active-audio-cue" aria-live="polite">
                            <Subtitles size={14} />
                            <span>{activeCue.text}</span>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="player-loading-placeholder">
                      <Clock size={20} className="spinning" />
                      <span>Loading media...</span>
                    </div>
                  )}
                </div>

                {/* Subtitles & Low-Bandwidth Transcript Dropdown */}
                {lesson.subtitlesText && (
                  <div className="lesson-transcript-accordion">
                    <button
                      type="button"
                      className="transcript-toggle-button"
                      onClick={() =>
                        setExpandedTranscripts(prev => ({
                          ...prev,
                          [lesson.id]: !isTranscriptOpen,
                        }))
                      }
                      aria-expanded={isTranscriptOpen}
                    >
                      <span className="toggle-label">
                        <Subtitles size={14} />
                        <span>Read Lesson Transcript / Subtitles</span>
                        {lowBandwidthMode && (
                          <span className="low-data-chip">
                            <Wifi size={11} /> 2G/3G Ready
                          </span>
                        )}
                      </span>
                      {isTranscriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isTranscriptOpen && (
                      <div className="lesson-transcript-body">
                        {lesson.subtitlesCues && lesson.subtitlesCues.length > 0 ? (
                          <div className="cues-timeline-list">
                            {lesson.subtitlesCues.map(cue => (
                              <div
                                key={cue.id}
                                className={`cue-line ${activeCue?.id === cue.id ? 'highlight' : ''}`}
                              >
                                <span className="cue-timestamp">
                                  {Math.floor(cue.start / 60)}:
                                  {(cue.start % 60).toString().padStart(2, '0')} -{' '}
                                  {Math.floor(cue.end / 60)}:
                                  {(cue.end % 60).toString().padStart(2, '0')}
                                </span>
                                <span className="cue-content">{cue.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="raw-transcript-text">{lesson.subtitlesText}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Helpful / Not-Helpful Voting Bar */}
                <div className="lesson-vote-strip">
                  <span className="vote-question">Was this 30–60s lesson helpful?</span>
                  <div className="vote-buttons-row">
                    <button
                      type="button"
                      className={`vote-btn helpful-btn ${userVote === 'helpful' ? 'voted' : ''}`}
                      onClick={() => handleVote(lesson.id, true)}
                      title="Mark as helpful"
                    >
                      <ThumbsUp size={14} />
                      <span>Helpful ({lesson.helpfulCount || 0})</span>
                    </button>
                    <button
                      type="button"
                      className={`vote-btn not-helpful-btn ${userVote === 'not_helpful' ? 'voted' : ''}`}
                      onClick={() => handleVote(lesson.id, false)}
                      title="Mark as not helpful"
                    >
                      <ThumbsDown size={14} />
                      <span>Not Helpful ({lesson.notHelpfulCount || 0})</span>
                    </button>
                  </div>
                </div>

                {/* Student Written Feedback Section */}
                <div className="lesson-feedback-section">
                  <div className="feedback-section-head">
                    <button
                      type="button"
                      className="feedback-toggle-btn"
                      onClick={() =>
                        setExpandedFeedback(prev => ({
                          ...prev,
                          [lesson.id]: !isFeedbackOpen,
                        }))
                      }
                    >
                      <MessageSquare size={14} />
                      <span>
                        Student Feedback ({feedbackList.length})
                      </span>
                      {isFeedbackOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isFeedbackOpen && (
                    <div className="feedback-content-tray">
                      {/* Existing Feedback List */}
                      {feedbackList.length > 0 ? (
                        <div className="feedback-items-list">
                          {feedbackList.map(item => (
                            <div key={item.id} className="feedback-item-card">
                              <div className="feedback-item-top">
                                <div className="student-badge">
                                  <span className="student-avatar-letter">
                                    {item.studentName.charAt(0).toUpperCase()}
                                  </span>
                                  <strong>{item.studentName}</strong>
                                </div>
                                <span className="feedback-date">{item.createdAt}</span>
                              </div>
                              <p className="feedback-text">{item.comment}</p>
                              {item.isHelpful && (
                                <span className="helpful-tag">
                                  <Check size={11} /> Found lesson helpful
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-feedback-text">
                          No written feedback yet. Be the first learner to share your thoughts!
                        </p>
                      )}

                      {/* Add Written Feedback Form (Students or guests) */}
                      <form
                        onSubmit={e => handleFeedbackSubmit(e, lesson.id)}
                        className="lesson-feedback-form"
                      >
                        <label htmlFor={`feedback-input-${lesson.id}`}>
                          Share your feedback on this micro-lesson:
                        </label>
                        <div className="feedback-input-row">
                          <input
                            id={`feedback-input-${lesson.id}`}
                            type="text"
                            placeholder="e.g. Cleared my doubt in 45s! Very practical..."
                            value={inputComment}
                            onChange={e =>
                              setFeedbackInputs(prev => ({
                                ...prev,
                                [lesson.id]: e.target.value,
                              }))
                            }
                            maxLength={240}
                          />
                          <button
                            type="submit"
                            className="button small-primary"
                            disabled={!inputComment.trim() || feedbackSubmitting[lesson.id]}
                          >
                            <Send size={14} />
                            <span>Submit</span>
                          </button>
                        </div>
                        <label className="feedback-checkbox-label" style={{ fontSize: '11px', color: '#56686c', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={feedbackHelpfulState[lesson.id] ?? true}
                            onChange={e =>
                              setFeedbackHelpfulState(prev => ({
                                ...prev,
                                [lesson.id]: e.target.checked,
                              }))
                            }
                          />
                          <span>I found this 30–60s micro-lesson helpful</span>
                        </label>
                      </form>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="sample-lessons-empty">
          <BookOpen size={36} className="empty-icon" />
          <h3>No micro-lessons published yet</h3>
          <p>
            {isOwner
              ? 'Create your first 30–60 second sample lesson to showcase your teaching style to aspiring students!'
              : 'This mentor has not published sample lessons yet. You can still reach out to ask doubts directly.'}
          </p>
          {isOwner && (
            <button
              type="button"
              className="button primary"
              style={{ marginTop: '16px' }}
              onClick={() => onOpenStudio(null)}
            >
              <Plus size={16} /> Create First Sample Lesson
            </button>
          )}
        </div>
      )}
    </section>
  )
}
