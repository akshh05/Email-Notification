import React, { useState } from 'react'
import { sendEmail } from '../services/api'
import { useGlobal } from '../context/GlobalContext'

const TEST_EMAIL = 'amm2005tuty@gmail.com'

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 16,
}
const modal = {
  background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520,
  boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
}
const header = {
  padding: '18px 24px', borderBottom: '1px solid var(--border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const bodySection = { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }
const footer = {
  padding: '16px 24px', borderTop: '1px solid var(--border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 13.5, color: 'var(--text-primary)', background: '#fff',
  boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)',
  marginBottom: 4, display: 'block',
}

export default function ComposeModal({ onClose }) {
  const { showToast, fetchEmails, templates } = useGlobal()
  const [form, setForm]               = useState({ recipient: '', subject: '', body: '' })
  const [sending, setSending]         = useState(false)
  const [testing, setTesting]         = useState(false)
  const [selectedTpl, setSelectedTpl] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTemplateSelect = e => {
    const id = e.target.value
    setSelectedTpl(id)
    if (!id) return
    const tpl = templates.find(t => t.id === id)
    if (tpl) setForm(f => ({ ...f, subject: tpl.subject, body: tpl.body }))
  }

  const handleSend = async () => {
    if (!form.recipient || !form.subject || !form.body) {
      showToast('Please fill all fields', 'error'); return
    }
    setSending(true)
    try {
      await sendEmail({ recipient: form.recipient, subject: form.subject, body: form.body })
      showToast('Email sent successfully!', 'success')
      fetchEmails()
      onClose()
    } catch {
      showToast('Failed to send email', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleTest = async () => {
    if (!form.subject || !form.body) {
      showToast('Fill in Subject and Body first', 'error'); return
    }
    const testForm = { recipient: TEST_EMAIL, subject: form.subject, body: form.body }
    setForm(f => ({ ...f, recipient: TEST_EMAIL }))
    setTesting(true)
    try {
      await sendEmail(testForm)
      showToast(`Test email sent to ${TEST_EMAIL}!`, 'success')
      fetchEmails()
    } catch {
      showToast('Test failed — check your SendGrid config', 'error')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>

        <div style={header}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Compose Email</span>
          <button onClick={onClose} style={{ background: 'none', fontSize: 20, color: 'var(--text-muted)', lineHeight: 1, cursor: 'pointer' }}>×</button>
        </div>

        <div style={bodySection}>

          {templates.length > 0 && (
            <div>
              <label style={labelStyle}>Use a Template <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedTpl}
                  onChange={handleTemplateSelect}
                  style={{
                    ...inputStyle, appearance: 'none', WebkitAppearance: 'none',
                    paddingRight: 36, cursor: 'pointer',
                    background: selectedTpl ? '#eff6ff' : '#fff',
                    borderColor: selectedTpl ? '#93c5fd' : 'var(--border)',
                    color: selectedTpl ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: selectedTpl ? 500 : 400,
                  }}
                >
                  <option value=''>— Select a template —</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 12, color: 'var(--text-muted)' }}>▼</span>
              </div>
            </div>
          )}

          {templates.length > 0 && <div style={{ borderTop: '1px dashed var(--border)' }} />}

          <div>
            <label style={labelStyle}>Recipient *</label>
            <input
              style={inputStyle} name="recipient" type="email"
              placeholder="recipient@example.com"
              value={form.recipient} onChange={handleChange}
            />
          </div>

          <div>
            <label style={labelStyle}>Subject *</label>
            <input style={inputStyle} name="subject" placeholder="Email subject" value={form.subject} onChange={handleChange} />
          </div>

          <div>
            <label style={labelStyle}>Body *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }}
              name="body" placeholder="Write your message..."
              value={form.body} onChange={handleChange}
            />
          </div>
        </div>

        <div style={footer}>
          <button
            onClick={handleTest}
            disabled={testing || sending}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
              background: testing ? '#f0fdf4' : '#f8fafc',
              color: testing ? '#16a34a' : '#6b7280',
              border: `1px solid ${testing ? '#86efac' : '#e5e7eb'}`,
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
              opacity: (testing || sending) ? 0.7 : 1,
            }}
          >
            {testing ? '⏳ Sending...' : 'Send Test'}
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 8, fontWeight: 500, fontSize: 13.5, border: '1px solid var(--border)', cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleSend}
              disabled={sending || testing}
              style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: 8, fontWeight: 500, fontSize: 13.5, cursor: 'pointer', opacity: (sending || testing) ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}