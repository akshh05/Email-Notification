import React from 'react'

const config = {
  SENT:   { bg: 'var(--success-light)', color: 'var(--success)', label: 'Sent' },
  FAILED: { bg: 'var(--danger-light)',  color: 'var(--danger)',  label: 'Failed' },
  QUEUED: { bg: 'var(--queued-light)',  color: 'var(--queued)', label: 'Queued' },
  DRAFT:  { bg: '#f3f4f6',             color: '#6b7280',        label: 'Draft' },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config.DRAFT
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.2,
    }}>
      {c.label}
    </span>
  )
}
