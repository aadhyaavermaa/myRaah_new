import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'

export const toast = (detail: string) => window.dispatchEvent(new CustomEvent('myraah-message', { detail }))
export const Brand = () => <Link to="/" className="brand" aria-label="MyRaah home">my<span>राह</span></Link>
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="field"><span>{label}</span>{children}</label>
export function Pick({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: readonly string[]; label: string }) {
  return <select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>
}
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action && <div className="header-action">{action}</div>}</div>
}
export function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span><Search size={20} /></span><h3>{title}</h3><p>{text}</p></div>
}
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19} /></button></div><div className="modal-body">{children}</div></section></div>
}
