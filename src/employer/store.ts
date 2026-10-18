import { useEffect, useState } from 'react'
import type { User } from '../types'
import { initialState, NEXT_STATUS, uid } from './model'
import type { Activity, ActivityStatus, EmployerState, Job, Org, ReferralStatus } from './model'

const upsert = <T extends { id: string }>(list: T[], item: T) => list.some(x => x.id === item.id) ? list.map(x => x.id === item.id ? item : x) : [item, ...list]
const note = (s: EmployerState, msg: string): EmployerState => ({ ...s, updates: [msg, ...s.updates].slice(0, 8) })

// DEMO persistence: this browser only (localStorage). To go real, replace each
// setter with an API call and keep the same returned function names.
export function useEmployer(user: User) {
  const key = `myraah-employer-${user.email}`
  const [state, setState] = useState<EmployerState>(() => { try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw) as EmployerState } catch { /* use defaults */ } return initialState(user) })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)) } catch { /* ignore */ } }, [key, state])
  return {
    state,
    saveJob: (j: Job) => setState(s => note({ ...s, jobs: upsert(s.jobs, j) }, `Requirement “${j.title}” saved as ${j.status}.`)),
    closeJob: (id: string) => setState(s => ({ ...s, jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'Closed' } : j) })),
    shortlist: (studentId: string, jobId: string) => setState(s => s.referrals.some(r => r.studentId === studentId && r.jobId === jobId) ? s : note({ ...s, referrals: [{ id: uid(), studentId, jobId, date: new Date().toISOString().slice(0, 10), status: 'Shortlisted' }, ...s.referrals] }, `Student ${studentId} shortlisted.`)),
    setReferralStatus: (id: string, status: ReferralStatus) => setState(s => ({ ...s, referrals: s.referrals.map(r => r.id === id ? { ...r, status } : r) })),
    saveActivity: (a: Activity) => setState(s => note({ ...s, activities: upsert(s.activities, a) }, `Activity “${a.title}”: ${a.status}.`)),
    setActivityStatus: (id: string, status: ActivityStatus) => setState(s => note({ ...s, activities: s.activities.map(a => a.id === id ? { ...a, status } : a) }, `Activity status changed to ${status} (demo).`)),
    advanceActivity: (a: Activity) => { const n = NEXT_STATUS[a.status]; if (n) setState(s => note({ ...s, activities: s.activities.map(x => x.id === a.id ? { ...x, status: n } : x) }, `“${a.title}” moved to ${n} (demo).`)) },
    saveOrg: (org: Org) => setState(s => ({ ...s, org })),
  }
}
export type EmployerStore = ReturnType<typeof useEmployer>
