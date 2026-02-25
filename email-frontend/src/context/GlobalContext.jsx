import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAllEmails, getAllTemplates, getStatistics } from '../services/api'

const GlobalContext = createContext(null)

export function GlobalProvider({ children }) {
  const [emails, setEmails] = useState([])
  const [templates, setTemplates] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState({ emails: false, templates: false, stats: false })
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchEmails = useCallback(async () => {
    setLoading(l => ({ ...l, emails: true }))
    try {
      const res = await getAllEmails()
      setEmails(res.data)
    } catch {
      showToast('Failed to load emails', 'error')
    } finally {
      setLoading(l => ({ ...l, emails: false }))
    }
  }, [showToast])

  const fetchTemplates = useCallback(async () => {
    setLoading(l => ({ ...l, templates: true }))
    try {
      const res = await getAllTemplates()
      setTemplates(res.data)
    } catch {
      showToast('Failed to load templates', 'error')
    } finally {
      setLoading(l => ({ ...l, templates: false }))
    }
  }, [showToast])

  const fetchStats = useCallback(async () => {
    setLoading(l => ({ ...l, stats: true }))
    try {
      const res = await getStatistics()
      setStats(res.data)
    } catch {
      showToast('Failed to load statistics', 'error')
    } finally {
      setLoading(l => ({ ...l, stats: false }))
    }
  }, [showToast])

  useEffect(() => {
    fetchEmails()
    fetchTemplates()
    fetchStats()
  }, [fetchEmails, fetchTemplates, fetchStats])

  return (
    <GlobalContext.Provider value={{
      emails, setEmails, fetchEmails,
      templates, setTemplates, fetchTemplates,
      stats, fetchStats,
      loading,
      toast, showToast
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobal = () => useContext(GlobalContext)
