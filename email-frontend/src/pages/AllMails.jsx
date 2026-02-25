import React, { useState, useMemo } from 'react'
import { useGlobal } from '../context/GlobalContext'
import { retryEmail } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const card = {
  background: '#fff', borderRadius: 12, border: '1px solid var(--border)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
}

const inputStyle = {
  padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8,
  fontSize: 13, color: 'var(--text-primary)', background: '#fff', minWidth: 160,
}

const selectStyle = { ...inputStyle, minWidth: 120 }

export default function AllMails() {
  const { emails, loading, fetchEmails, showToast } = useGlobal()
  const [filters, setFilters] = useState({ status: '', recipient: '', dateFrom: '', dateTo: '' })
  const [retrying, setRetrying] = useState(null)

  const handleFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const filtered = useMemo(() => {
    return emails.filter(e => {
      if (filters.status && e.status !== filters.status) return false
      if (filters.recipient && !e.recipientEmail?.toLowerCase().includes(filters.recipient.toLowerCase())) return false
      if (filters.dateFrom && new Date(e.createdAt) < new Date(filters.dateFrom)) return false
      if (filters.dateTo && new Date(e.createdAt) > new Date(filters.dateTo)) return false
      return true
    })
  }, [emails, filters])

  const handleRetry = async (id) => {
    setRetrying(id)
    try {
      await retryEmail(id)
      showToast('Retry initiated!', 'success')
      fetchEmails()
    } catch {
      showToast('Retry failed', 'error')
    } finally {
      setRetrying(null)
    }
  }

  const clearFilters = () => setFilters({ status: '', recipient: '', dateFrom: '', dateTo: '' })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>All Emails</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>{emails.length} total emails</p>
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>Filters:</span>

          <select style={selectStyle} value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            <option value="">All Status</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="QUEUED">Queued</option>
            <option value="DRAFT">Draft</option>
          </select>

          <input
            style={inputStyle} placeholder="🔍 Search recipient..."
            value={filters.recipient} onChange={e => handleFilter('recipient', e.target.value)}
          />

          <input
            style={inputStyle} type="date" title="From date"
            value={filters.dateFrom} onChange={e => handleFilter('dateFrom', e.target.value)}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
          <input
            style={inputStyle} type="date" title="To date"
            value={filters.dateTo} onChange={e => handleFilter('dateTo', e.target.value)}
          />

          {Object.values(filters).some(Boolean) && (
            <button
              onClick={clearFilters}
              style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12.5, background: '#f3f4f6', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading.emails ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading emails...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No emails found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                  {['Recipient', 'Subject', 'Status', 'Retry Count', 'Created At', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((email, i) => (
                  <tr key={email.id || i} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{email.recipientEmail}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{email.subject}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={email.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'center' }}>{email.retryCount ?? 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>
                      {email.createdAt ? new Date(email.createdAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {email.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(email.id)}
                          disabled={retrying === email.id}
                          style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                            background: 'var(--danger-light)', color: 'var(--danger)',
                            border: '1px solid #fecaca',
                          }}
                        >
                          {retrying === email.id ? '...' : '🔄 Retry'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {emails.length} emails
        </div>
      </div>
    </div>
  )
}
