import React, { useState } from 'react'
import { useGlobal } from '../context/GlobalContext'
import { createTemplate, updateTemplate, deleteTemplate, sendEmail } from '../services/api'

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
const mHeader = {
  padding: '18px 24px', borderBottom: '1px solid var(--border)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const mBody = { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }
const mFooter = {
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
const card = {
  background: '#fff', borderRadius: 12, border: '1px solid var(--border)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
}
const btnX = {
  background: 'none', fontSize: 20, color: 'var(--text-muted)', lineHeight: 1, cursor: 'pointer',
}

function TemplateSendModal({ template, onClose }) {
  const { showToast, fetchEmails } = useGlobal()
  const [form, setForm]       = useState({ recipient: '', subject: template.subject, body: template.body })
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

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
    setForm(f => ({ ...f, recipient: TEST_EMAIL }))
    setTesting(true)
    try {
      await sendEmail({ recipient: TEST_EMAIL, subject: form.subject, body: form.body })
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
        <div style={mHeader}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Send Email</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Using: <strong>{template.name}</strong>
            </p>
          </div>
          <button style={btnX} onClick={onClose}>×</button>
        </div>

        <div style={mBody}>
          <div>
            <label style={labelStyle}>Recipient *</label>
            <input
              style={inputStyle} name="recipient" type="email"
              placeholder="recipient@example.com"
              value={form.recipient} onChange={handleChange} autoFocus
            />
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input style={inputStyle} name="subject" value={form.subject} onChange={handleChange} />
          </div>
          <div>
            <label style={labelStyle}>Body *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }}
              name="body" value={form.body} onChange={handleChange}
            />
          </div>
        </div>

        <div style={mFooter}>
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
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13.5, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleSend}
              disabled={sending || testing}
              style={{ background: 'var(--accent)', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', opacity: (sending || testing) ? 0.7 : 1 }}
            >{sending ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplateEditModal({ template, onClose }) {
  const [form, setForm]     = useState(
    template
      ? { name: template.name, subject: template.subject, body: template.body }
      : { name: '', subject: '', body: '' }
  )
  const [saving, setSaving] = useState(false)
  const { showToast, fetchTemplates } = useGlobal()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.body) {
      showToast('All fields required', 'error'); return
    }
    setSaving(true)
    try {
      template?.id ? await updateTemplate(template.id, form) : await createTemplate(form)
      showToast(template?.id ? 'Template updated!' : 'Template created!', 'success')
      await fetchTemplates()
      onClose()
    } catch {
      showToast('Failed to save template', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={mHeader}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{template ? '✏️ Edit Template' : '+ New Template'}</span>
          <button style={btnX} onClick={onClose}>×</button>
        </div>
        <div style={mBody}>
          <div>
            <label style={labelStyle}>Template Name *</label>
            <input style={inputStyle} name="name" placeholder="e.g. Welcome Email" value={form.name} onChange={handleChange} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Subject *</label>
            <input style={inputStyle} name="subject" placeholder="Email subject line" value={form.subject} onChange={handleChange} />
          </div>
          <div>
            <label style={labelStyle}>Body *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
              name="body" placeholder="Email body content..." value={form.body} onChange={handleChange}
            />
          </div>
        </div>
        <div style={{ ...mFooter, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13.5, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13.5, background: 'var(--accent)', color: '#fff', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ template, onClose, onConfirm, deleting }) {
  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...modal, maxWidth: 400 }}>
        <div style={mHeader}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>🗑️ Delete Template</span>
          <button style={btnX} onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
            Delete <strong>"{template.name}"</strong>? This cannot be undone.
          </p>
        </div>
        <div style={{ ...mFooter, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13.5, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={onConfirm} disabled={deleting} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13.5, background: '#ef4444', color: '#fff', fontWeight: 500, cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
              {deleting ? 'Deleting...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Templates() {
  const { templates, loading, showToast, fetchTemplates } = useGlobal()
  const [sendTarget,   setSendTarget]   = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [showEdit,     setShowEdit]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const openNew  = ()      => { setEditTarget(null); setShowEdit(true) }
  const openEdit = (t, e)  => { e.stopPropagation(); setEditTarget(t); setShowEdit(true) }
  const openDel  = (t, e)  => { e.stopPropagation(); setDeleteTarget(t) }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteTemplate(deleteTarget.id)
      showToast('Template deleted', 'success')
      await fetchTemplates()
      setDeleteTarget(null)
    } catch {
      showToast('Failed to delete template', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Templates</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openNew}
          style={{ background: 'var(--accent)', color: '#fff', padding: '8px 18px', borderRadius: 8, fontWeight: 500, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >╋  New Template</button>
      </div>

      {loading.templates ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading templates...</p>
      ) : templates.length === 0 ? (
        <div style={{ ...card, padding: 60, textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🗂</p>
          <p style={{ color: 'var(--text-secondary)' }}>No templates yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {templates.map(t => (
            <div
              key={t.id}
              onClick={() => setSendTarget(t)}
              style={{
                ...card, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.11)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}></span>
                <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={e => openEdit(t, e)} style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #bfdbfe', fontWeight: 500, cursor: 'pointer' }}>✏️ Edit</button>
                <button onClick={e => openDel(t, e)} style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, background: '#fff1f2', color: '#ef4444', border: '1px solid #fecdd3', fontWeight: 500, cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sendTarget   && <TemplateSendModal template={sendTarget} onClose={() => setSendTarget(null)} />}
      {showEdit     && <TemplateEditModal template={editTarget} onClose={() => setShowEdit(false)} />}
      {deleteTarget && <DeleteConfirmModal template={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} deleting={deleting} />}
    </div>
  )
}