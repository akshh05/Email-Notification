import React from 'react'
import { useGlobal } from '../context/GlobalContext'

export default function Toast() {
  const { toast } = useGlobal()
  if (!toast) return null

  const colors = {
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: '✓' },
    error: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '✕' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: 'ℹ' },
  }
  const c = colors[toast.type] || colors.info

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      padding: '10px 16px',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontWeight: 500,
      fontSize: 13.5,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'slideIn 0.2s ease',
    }}>
      <span style={{ fontWeight: 700 }}>{c.icon}</span>
      {toast.message}
      <style>{`@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}
