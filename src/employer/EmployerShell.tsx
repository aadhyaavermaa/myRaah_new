import { useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Bell, BriefcaseBusiness, Building2, CalendarDays, ChevronRight, CircleHelp, Home, LogOut, Menu, Search, Settings, Share2, X } from 'lucide-react'
import type { User } from '../types'
import { useEmployer } from './store'
import { Activities, Jobs, Overview, Profile, Referrals, Talent } from './pages'
import { Brand, toast } from './ui'

const nav = [
  { to: '/app', label: 'Overview', icon: Home }, { to: '/app/talent', label: 'Discover talent', icon: Search },
  { to: '/app/jobs', label: 'Job requirements', icon: BriefcaseBusiness }, { to: '/app/activities', label: 'Sessions & challenges', icon: CalendarDays },
  { to: '/app/referrals', label: 'Referrals', icon: Share2 }, { to: '/app/profile', label: 'Organisation profile', icon: Building2 },
]

export default function EmployerShell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const store = useEmployer(user), { state } = store
  const [menu, setMenu] = useState(false), [mobile, setMobile] = useState(false)
  const loc = useLocation(), current = nav.find(n => n.to === loc.pathname) || nav[0]
  const display = state.org.name || user.name
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /><span className="demo-label">DEMO</span></div>
      <div className="workspace-label">YOUR ORGANISATION</div>
      <nav>{nav.map(n => { const I = n.icon, active = loc.pathname === n.to; return <Link key={n.to} to={n.to} className={`nav-link ${active ? 'active' : ''}`}><I size={18} /><span>{n.label}</span>{active && <span className="active-dot" />}</Link> })}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><CircleHelp size={18} /><span>Real skills, real people.<br /><b>Opportunities start with you.</b></span></div>
        <button className="profile-button" onClick={() => setMenu(!menu)}><span className="avatar">{display.charAt(0).toUpperCase()}</span><span className="profile-copy"><b>{display}</b><small>Employer / Organisation</small></span><Settings size={16} /></button>
        {menu && <div className="profile-menu"><div className="menu-user">Signed in as<br /><b>{user.email}</b><small>Demo account</small></div><Link to="/app/profile" onClick={() => setMenu(false)}>Organisation profile</Link><button onClick={onSignOut}><LogOut size={15} /> Sign out</button></div>}
      </div>
    </aside>
    <main className="main-shell">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobile(!mobile)}>{mobile ? <X size={21} /> : <Menu size={21} />}</button>
        <div className="breadcrumb"><span>MyRaah</span><ChevronRight size={14} /><b>{current.label}</b></div>
        <div className="top-actions"><button className="icon-button notification-button" title="Notifications" onClick={() => toast(state.updates[0] || 'You’re all caught up.')}><Bell size={18} /><i /></button><button className="top-avatar" aria-label="Profile" onClick={() => toast(`Demo profile: ${display} · Employer / Organisation`)}>{display.charAt(0).toUpperCase()}</button></div>
      </header>
      {mobile && <div className="mobile-nav">{nav.map(n => { const I = n.icon; return <Link onClick={() => setMobile(false)} key={n.to} to={n.to} className={loc.pathname === n.to ? 'active' : ''}><I size={18} />{n.label}</Link> })}</div>}
      <div className="page-frame"><Routes>
        <Route index element={<Overview state={state} user={user} />} />
        <Route path="talent" element={<Talent state={state} store={store} />} />
        <Route path="jobs" element={<Jobs state={state} store={store} />} />
        <Route path="activities" element={<Activities state={state} store={store} />} />
        <Route path="referrals" element={<Referrals state={state} store={store} />} />
        <Route path="profile" element={<Profile state={state} store={store} />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes></div>
    </main>
  </div>
}
