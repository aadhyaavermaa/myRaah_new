import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, Search, ShieldCheck, X } from 'lucide-react'
import type { User } from '../types'
import { ACTIVITY_TYPES, csv, EDUCATION, EMPLOYER_STATUSES, matchStudent, NEXT_STATUS, students, uid } from './model'
import type { Activity, ActivityType, EmployerState, Job, Org, ReferralStatus } from './model'
import type { EmployerStore } from './store'
import { EmptyState, Field, Modal, PageHeader, Pick, toast } from './ui'

const DemoNote = ({ text }: { text: string }) => <p className="demo-explainer"><ShieldCheck size={16} /> {text}</p>
const matchesFor = (job: Job) => students.map(s => ({ s, m: matchStudent(s, job) })).filter(x => x.m.score >= 40).sort((a, b) => b.m.score - a.m.score)

/* ---------- Overview ---------- */
export function Overview({ state, user }: { state: EmployerState; user: User }) {
  const active = state.jobs.filter(j => j.status === 'Active')
  const pairs = active.flatMap(job => matchesFor(job).map(x => ({ ...x, job })))
  const top = [...pairs].sort((a, b) => b.m.score - a.m.score).slice(0, 3)
  const pending = state.activities.filter(a => a.status === 'Submitted to Facilitator' || a.status === 'Under Review').length
  const upcoming = state.activities.filter(a => a.status === 'Accepted' || a.status === 'Scheduled').length
  const stats: [string, number][] = [['Active requirements', active.length], ['Matched student profiles', new Set(pairs.map(p => p.s.id)).size], ['Pending facilitator responses', pending], ['Upcoming sessions & challenges', upcoming]]
  return <>
    <PageHeader eyebrow="YOUR ORGANISATION SPACE" title={`Welcome, ${state.org.name || user.name.split(' ')[0]}.`} description="Find emerging talent, share opportunities and propose hands-on learning." action={<Link to="/app/jobs" className="button primary"><Plus size={16} /> New requirement</Link>} />
    <DemoNote text="Student profiles and facilitator responses are demonstration data. Nothing is sent to real students or facilitators." />
    <div className="stat-grid">{stats.map(([label, n]) => <div className="stat-card" key={label}><b>{n}</b><small>{label}</small></div>)}</div>
    <div className="home-layout">
      <section className="home-main">
        <div className="section-heading"><div><h2>Recommended talent</h2><p>Students matched to your active requirements.</p></div><Link to="/app/talent" className="text-link">Discover talent <ArrowRight size={15} /></Link></div>
        {top.length ? top.map(p => <div className="panel" key={p.s.id + p.job.id}><div className="row-split"><div><h3>Student {p.s.id} · {p.job.title}</h3><p>{p.m.explanation}</p></div><span className="demo-label">DEMO</span></div></div>) : <EmptyState title="No matches yet" text="Publish an active requirement to see matching students." />}
        <div className="section-heading section-block"><div><h2>Your activities</h2><p>Proposed, approved and upcoming.</p></div><Link to="/app/activities" className="text-link">Manage <ArrowRight size={15} /></Link></div>
        {state.activities.length ? state.activities.slice(0, 4).map(a => <div className="panel" key={a.id}><div className="row-split"><div><h3>{a.title}</h3><p>{a.type} · {a.format}</p></div><span className="status">{a.status}</span></div></div>) : <EmptyState title="No proposals yet" text="Pitch a session, workshop or challenge to facilitators." />}
      </section>
      <aside className="home-side"><section className="side-panel"><div className="side-panel-heading"><h3>Recent updates</h3></div>{state.updates.length ? state.updates.slice(0, 5).map((u, i) => <p key={i}>{u}</p>) : <p>Your actions will show up here.</p>}</section></aside>
    </div></>
}

/* ---------- Discover Talent ---------- */
export function Talent({ state, store }: { state: EmployerState; store: EmployerStore }) {
  const active = state.jobs.filter(j => j.status === 'Active')
  const [q, setQ] = useState(''), [edu, setEdu] = useState('Any level'), [avail, setAvail] = useState('Any availability'), [jobId, setJobId] = useState(active[0]?.id ?? '')
  const job = active.find(j => j.id === jobId)
  const list = students.filter(s => (!q || [...s.skills, ...s.projects, ...s.interests].join(' ').toLowerCase().includes(q.toLowerCase())) && (edu === 'Any level' || s.education === edu) && (avail === 'Any availability' || s.available))
    .map(s => ({ s, m: job ? matchStudent(s, job) : null })).sort((a, b) => (b.m?.score ?? 0) - (a.m?.score ?? 0))
  return <>
    <PageHeader eyebrow="DISCOVER TALENT" title="Find students with proven skills." description="Search by skills, projects and interests. Matches are based on demonstrated skills, never marks alone." />
    <DemoNote text="These are sample student profiles. Full profiles and contact details need student consent, which is not connected yet." />
    <div className="toolbar"><label className="search-box"><Search size={17} /><input aria-label="Search students" placeholder="Search skills, projects or interests" value={q} onChange={e => setQ(e.target.value)} />{q && <button onClick={() => setQ('')} aria-label="Clear search"><X size={15} /></button>}</label>
      <Pick label="Education level" value={edu} onChange={setEdu} options={['Any level', ...EDUCATION]} />
      <Pick label="Availability" value={avail} onChange={setAvail} options={['Any availability', 'Available now']} />
      <select aria-label="Match against requirement" value={jobId} onChange={e => setJobId(e.target.value)}><option value="">No requirement selected</option>{active.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
    <div className="career-grid">{list.map(({ s, m }) => <article className="career-card" key={s.id}>
      <span className="career-category">{s.education}</span><h2>Student {s.id}</h2>
      <p>{m ? m.explanation : 'Select a requirement to see a match explanation.'}</p>
      <div className="tag-row">{s.skills.map(x => <span key={x}>{x}</span>)}</div>
      <p>Projects: {s.projects.join(', ')}</p>
      <div className="card-actions"><button className="button primary small" disabled={!job} onClick={() => { if (job) { store.shortlist(s.id, job.id); toast(`Student ${s.id} shortlisted for ${job.title}.`) } }}>Shortlist</button><button className="button secondary small" onClick={() => toast('Full profiles need student consent. Not available in this demo.')}>View profile</button></div></article>)}</div>
    {!list.length && <EmptyState title="No students found" text="Try fewer filters or a different search." />}</>
}

/* ---------- Job Requirements ---------- */
function JobForm({ initial, onSave, onClose }: { initial: Job; onSave: (j: Job) => void; onClose: () => void }) {
  const [j, setJ] = useState(initial), [req, setReq] = useState(initial.required.join(', ')), [pref, setPref] = useState(initial.preferred.join(', ')), [err, setErr] = useState('')
  const set = <K extends keyof Job>(k: K, v: Job[K]) => setJ({ ...j, [k]: v })
  const save = (status: Job['status']) => { if (!j.title.trim() || !j.description.trim() || !csv(req).length || !j.deadline) { setErr('Add a title, description, at least one required skill and a deadline.'); return } onSave({ ...j, required: csv(req), preferred: csv(pref), status }) }
  return <Modal title={initial.title ? 'Edit requirement' : 'New requirement'} onClose={onClose}>
    <Field label="Opportunity title"><input value={j.title} onChange={e => set('title', e.target.value)} /></Field>
    <Field label="Organisation or department"><input value={j.dept} onChange={e => set('dept', e.target.value)} /></Field>
    <Field label="Description"><textarea rows={3} value={j.description} onChange={e => set('description', e.target.value)} /></Field>
    <Field label="Required skills (comma separated)"><input value={req} placeholder="e.g. Electrical safety, Hands-on work" onChange={e => setReq(e.target.value)} /></Field>
    <Field label="Preferred skills"><input value={pref} onChange={e => setPref(e.target.value)} /></Field>
    <div className="field-grid"><Field label="Education level"><Pick label="Education" value={j.education} onChange={v => set('education', v)} options={EDUCATION} /></Field>
      <Field label="Opportunity type"><Pick label="Type" value={j.type} onChange={v => set('type', v as Job['type'])} options={['Internship', 'Apprenticeship', 'Job', 'Project', 'Training']} /></Field></div>
    <div className="field-grid"><Field label="Location"><input value={j.location} onChange={e => set('location', e.target.value)} /></Field>
      <Field label="Work arrangement"><Pick label="Arrangement" value={j.arrangement} onChange={v => set('arrangement', v as Job['arrangement'])} options={['On-site', 'Remote', 'Hybrid']} /></Field></div>
    <div className="field-grid"><Field label="Openings"><input type="number" min={1} value={j.openings} onChange={e => set('openings', Number(e.target.value))} /></Field>
      <Field label="Application deadline"><input type="date" value={j.deadline} onChange={e => set('deadline', e.target.value)} /></Field></div>
    {err && <div className="form-error" role="alert">{err}</div>}
    <div className="form-actions"><button className="button secondary" onClick={() => save('Draft')}>Save draft</button><button className="button primary" onClick={() => save('Active')}>Publish</button></div></Modal>
}
const blankJob = (org: Org): Job => ({ id: uid(), title: '', dept: org.name, description: '', required: [], preferred: [], education: EDUCATION[1], type: 'Internship', location: org.location, arrangement: 'On-site', openings: 1, deadline: '', status: 'Draft' })

export function Jobs({ state, store }: { state: EmployerState; store: EmployerStore }) {
  const [editing, setEditing] = useState<Job | null>(null)
  return <>
    <PageHeader eyebrow="JOB REQUIREMENTS" title="Tell us who you’re looking for." description="Publish a requirement to see students whose demonstrated skills fit." action={<button className="button primary" onClick={() => setEditing(blankJob(state.org))}><Plus size={16} /> New requirement</button>} />
    {state.jobs.map(j => { const ms = j.status === 'Active' ? matchesFor(j) : []; return <div className="panel" key={j.id}>
      <div className="row-split"><div><h2>{j.title}</h2><p>{j.type} · {j.arrangement} · {j.location || 'Location not set'} · {j.openings} opening{j.openings > 1 ? 's' : ''}</p></div><span className={`status ${j.status === 'Active' ? 'status-done' : ''}`}>{j.status}</span></div>
      <div className="tag-row">{j.required.map(x => <span key={x}>{x}</span>)}</div>
      {ms.length > 0 && <><h3>Matching students <span className="demo-label">DEMO</span></h3>{ms.map(({ s, m }) => <div className="match-line" key={s.id}><span>Student {s.id} · {m.explanation}</span><button className="button secondary small" onClick={() => { store.shortlist(s.id, j.id); toast(`Student ${s.id} shortlisted.`) }}>Shortlist</button></div>)}</>}
      {j.status === 'Active' && !ms.length && <p>No students match yet. Try fewer required skills.</p>}
      <div className="card-actions"><button className="button secondary small" onClick={() => setEditing(j)}>Edit</button>{j.status !== 'Closed' && <button className="button secondary small" onClick={() => { store.closeJob(j.id); toast('Requirement closed.') }}>Close</button>}</div></div> })}
    {!state.jobs.length && <EmptyState title="No requirements yet" text="Create one to start matching with students." />}
    {editing && <JobForm initial={editing} onClose={() => setEditing(null)} onSave={j => { store.saveJob(j); setEditing(null); toast(j.status === 'Active' ? 'Requirement published.' : 'Draft saved.') }} />}</>
}

/* ---------- Sessions & Challenges ---------- */
const blankActivity = (): Activity => ({ id: uid(), title: '', type: 'Industry Session', description: '', skills: [], level: EDUCATION[1], prerequisites: '', duration: '', format: 'Online', date: '', materials: '', participants: 20, criteria: '', preference: '', status: 'Draft' })
function ActivityForm({ initial, onSave, onClose }: { initial: Activity; onSave: (a: Activity) => void; onClose: () => void }) {
  const [a, setA] = useState(initial), [sk, setSk] = useState(initial.skills.join(', ')), [err, setErr] = useState('')
  const set = <K extends keyof Activity>(k: K, v: Activity[K]) => setA({ ...a, [k]: v })
  const save = (status: Activity['status']) => { if (!a.title.trim() || !a.description.trim() || !a.duration.trim()) { setErr('Add a title, description and duration.'); return } onSave({ ...a, skills: csv(sk), status }) }
  return <Modal title={initial.title ? 'Edit proposal' : 'New proposal'} onClose={onClose}>
    <Field label="Activity title"><input value={a.title} onChange={e => set('title', e.target.value)} /></Field>
    <Field label="Activity type"><Pick label="Type" value={a.type} onChange={v => set('type', v as ActivityType)} options={ACTIVITY_TYPES} /></Field>
    <Field label="Description"><textarea rows={3} value={a.description} onChange={e => set('description', e.target.value)} /></Field>
    <Field label="Skills students will learn or show (comma separated)"><input value={sk} onChange={e => setSk(e.target.value)} /></Field>
    <div className="field-grid"><Field label="Target education level"><Pick label="Level" value={a.level} onChange={v => set('level', v)} options={EDUCATION} /></Field><Field label="Duration"><input value={a.duration} placeholder="e.g. 2 hours" onChange={e => set('duration', e.target.value)} /></Field></div>
    <div className="field-grid"><Field label="Format"><Pick label="Format" value={a.format} onChange={v => set('format', v as Activity['format'])} options={['Online', 'Offline']} /></Field><Field label="Proposed date"><input type="date" value={a.date} onChange={e => set('date', e.target.value)} /></Field></div>
    <div className="field-grid"><Field label="Participants"><input type="number" min={1} value={a.participants} onChange={e => set('participants', Number(e.target.value))} /></Field><Field label="Prerequisites"><input value={a.prerequisites} onChange={e => set('prerequisites', e.target.value)} /></Field></div>
    <Field label="Required materials"><input value={a.materials} onChange={e => set('materials', e.target.value)} /></Field>
    {a.type === 'Competition & Challenge' && <Field label="Evaluation or submission criteria"><textarea rows={2} value={a.criteria} onChange={e => set('criteria', e.target.value)} /></Field>}
    <Field label="Facilitator or location preference"><input value={a.preference} onChange={e => set('preference', e.target.value)} /></Field>
    {err && <div className="form-error" role="alert">{err}</div>}
    <div className="form-actions"><button className="button secondary" onClick={() => save('Draft')}>Save draft</button><button className="button primary" onClick={() => save('Submitted to Facilitator')}>Submit proposal</button></div></Modal>
}
export function Activities({ state, store }: { state: EmployerState; store: EmployerStore }) {
  const [editing, setEditing] = useState<Activity | null>(null)
  return <>
    <PageHeader eyebrow="SESSIONS & CHALLENGES" title="Share your craft with students." description="Propose industry sessions, hands-on workshops or competitions for facilitators to review." action={<button className="button primary" onClick={() => setEditing(blankActivity())}><Plus size={16} /> New proposal</button>} />
    <DemoNote text="Facilitator review is not connected yet. A submitted proposal moves forward only when you use the demo button on its card." />
    {state.activities.map(a => <div className="panel" key={a.id}>
      <div className="row-split"><div><h2>{a.title}</h2><p>{a.type} · {a.format} · {a.duration} · {a.participants} students{a.date && ` · ${a.date}`}</p></div><span className={`status ${a.status === 'Completed' || a.status === 'Accepted' || a.status === 'Scheduled' ? 'status-done' : ''}`}>{a.status}</span></div>
      <div className="tag-row">{a.skills.map(x => <span key={x}>{x}</span>)}</div>
      {a.feedback && <p>Feedback: {a.feedback}</p>}
      <div className="card-actions">
        {(a.status === 'Draft' || a.status === 'Changes Requested') && <button className="button secondary small" onClick={() => setEditing(a)}>Edit</button>}
        {a.status === 'Submitted to Facilitator' && <button className="button secondary small" onClick={() => store.setActivityStatus(a.id, 'Draft')}>Withdraw</button>}
        {NEXT_STATUS[a.status] && <button className="button secondary small" onClick={() => store.advanceActivity(a)}>Demo: move to {NEXT_STATUS[a.status]}</button>}</div></div>)}
    {!state.activities.length && <EmptyState title="No proposals yet" text="Pitch a workshop, session or challenge to get started." />}
    {editing && <ActivityForm initial={editing} onClose={() => setEditing(null)} onSave={a => { store.saveActivity(a); setEditing(null); toast(a.status === 'Draft' ? 'Draft saved.' : 'Proposal submitted (demo). No facilitator has been contacted.') }} />}</>
}

/* ---------- Referrals ---------- */
export function Referrals({ state, store }: { state: EmployerState; store: EmployerStore }) {
  const mine = (s: ReferralStatus) => (EMPLOYER_STATUSES as readonly string[]).includes(s)
  const next = (s: ReferralStatus) => s === 'Shortlisted' ? 'Share with a facilitator once available' : s === 'Interview or Assessment' ? 'Record the outcome' : mine(s) ? 'Complete' : 'Waiting on another role (demo)'
  return <>
    <PageHeader eyebrow="REFERRALS" title="Follow your shortlisted students." description="Track candidates for each opportunity. Contact details stay private until a student consents." />
    {state.referrals.length ? <div className="panel table-scroll"><table className="emp-table"><thead><tr><th>Student</th><th>Opportunity</th><th>Date</th><th>Status</th><th>Next action</th></tr></thead><tbody>
      {state.referrals.map(r => <tr key={r.id}><td>Student {r.studentId}</td><td>{state.jobs.find(j => j.id === r.jobId)?.title ?? 'Removed'}</td><td>{r.date}</td>
        <td>{mine(r.status) ? <Pick label="Referral status" value={r.status} onChange={v => store.setReferralStatus(r.id, v as ReferralStatus)} options={EMPLOYER_STATUSES} /> : r.status}</td><td>{next(r.status)}</td></tr>)}</tbody></table></div>
      : <EmptyState title="No referrals yet" text="Shortlist a student from Discover talent or a requirement to see them here." />}</>
}

/* ---------- Organisation Profile ---------- */
export function Profile({ state, store }: { state: EmployerState; store: EmployerStore }) {
  const [o, setO] = useState<Org>(state.org)
  const set = (k: keyof Org, v: string) => setO({ ...o, [k]: v })
  return <>
    <PageHeader eyebrow="ORGANISATION PROFILE" title="How students will see you." description="Keep your details up to date." action={<span className="demo-label">VERIFICATION PENDING</span>} />
    <div className="panel">
      <div className="field-grid"><Field label="Organisation name"><input value={o.name} onChange={e => set('name', e.target.value)} /></Field><Field label="Organisation type"><input value={o.type} placeholder="e.g. Non-profit" onChange={e => set('type', e.target.value)} /></Field></div>
      <div className="field-grid"><Field label="Industry"><input value={o.industry} onChange={e => set('industry', e.target.value)} /></Field><Field label="Location"><input value={o.location} onChange={e => set('location', e.target.value)} /></Field></div>
      <div className="field-grid"><Field label="Website"><input value={o.website} onChange={e => set('website', e.target.value)} /></Field><Field label="Contact person"><input value={o.contact} onChange={e => set('contact', e.target.value)} /></Field></div>
      <Field label="Description"><textarea rows={3} value={o.description} onChange={e => set('description', e.target.value)} /></Field>
      <Field label="Learning and opportunity preferences"><textarea rows={2} value={o.preferences} onChange={e => set('preferences', e.target.value)} /></Field>
      <button className="button primary" onClick={() => { store.saveOrg(o); toast('Profile saved in this browser (demo).') }}>Save profile</button></div></>
}
