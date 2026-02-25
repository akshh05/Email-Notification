import React from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useGlobal } from '../context/GlobalContext'
import StatusBadge from '../components/StatusBadge'

const card = {
  background: '#fff', borderRadius: 12, padding: '20px 24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid var(--border)',
}

const statCard = (accent) => ({
  ...card,
  borderLeft: `4px solid ${accent}`,
})

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={statCard(accent)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 500, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        </div>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
    </div>
  )
}

function buildTrendData(emails) {
  const days = {}
  emails.forEach(e => {
    const d = e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
    if (!days[d]) days[d] = { date: d, sent: 0, failed: 0, queued: 0 }
    if (e.status === 'SENT') days[d].sent++
    else if (e.status === 'FAILED') days[d].failed++
    else days[d].queued++
  })
  const arr = Object.values(days).slice(-7)
  if (arr.length === 0) {
    return [
      { date: 'Mon', sent: 4, failed: 1, queued: 2 },
      { date: 'Tue', sent: 7, failed: 0, queued: 3 },
      { date: 'Wed', sent: 3, failed: 2, queued: 1 },
      { date: 'Thu', sent: 9, failed: 1, queued: 4 },
      { date: 'Fri', sent: 5, failed: 0, queued: 2 },
      { date: 'Sat', sent: 2, failed: 1, queued: 1 },
      { date: 'Sun', sent: 6, failed: 2, queued: 3 },
    ]
  }
  return arr
}

function buildStatusData(emails) {
  const counts = { SENT: 0, FAILED: 0, QUEUED: 0, DRAFT: 0 }
  emails.forEach(e => { if (counts[e.status] !== undefined) counts[e.status]++ })
  return [
    { name: 'Sent', value: counts.SENT, fill: '#16a34a' },
    { name: 'Failed', value: counts.FAILED, fill: '#dc2626' },
    { name: 'Queued', value: counts.QUEUED, fill: '#7c3aed' },
    { name: 'Draft', value: counts.DRAFT, fill: '#9ca3af' },
  ]
}

export default function Dashboard() {
  const { emails, stats, loading } = useGlobal()
  const trendData = buildTrendData(emails)
  const statusData = buildStatusData(emails)
  const recentEmails = [...emails].reverse().slice(0, 5)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>Overview of your email notification system</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Emails" value={emails.length} accent="#2563eb" icon="📧" />
        <StatCard label="Sent" value={stats?.totalSent} accent="#16a34a" icon="✅" />
        <StatCard label="Failed" value={stats?.totalFailed} accent="#dc2626" icon="❌" />
        <StatCard label="Success Rate" value={stats ? `${stats.successRate?.toFixed(1)}%` : null} accent="#7c3aed" icon="📈" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={card}>
          <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Email Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="sent" stroke="#16a34a" strokeWidth={2} dot={false} name="Sent" />
              <Line type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={2} dot={false} name="Failed" />
              <Line type="monotone" dataKey="queued" stroke="#7c3aed" strokeWidth={2} dot={false} name="Queued" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Emails by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Recent Emails</h3>
        {loading.emails ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Loading...</p>
        ) : recentEmails.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No emails yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Recipient', 'Subject', 'Status', 'Created At'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEmails.map((email, i) => (
                <tr key={email.id || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13 }}>{email.recipientEmail}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</td>
                  <td style={{ padding: '10px 12px' }}><StatusBadge status={email.status} /></td>
                  <td style={{ padding: '10px 12px', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {email.createdAt ? new Date(email.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
