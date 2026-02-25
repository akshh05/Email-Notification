import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import AllMails from '../pages/AllMails'
import Templates from '../pages/Templates'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/emails" element={<AllMails />} />
      <Route path="/templates" element={<Templates />} />
    </Routes>
  )
}
