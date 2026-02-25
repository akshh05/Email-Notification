import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { GlobalProvider } from './context/GlobalContext'
import Navbar from './components/Navbar'
import ComposeModal from './components/ComposeModal'
import Toast from './components/Toast'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  const [showCompose, setShowCompose] = useState(false)

  return (
    <BrowserRouter>
      <GlobalProvider>
        <Navbar onCompose={() => setShowCompose(true)} />
        <main>
          <AppRoutes />
        </main>
        {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
        <Toast />
      </GlobalProvider>
    </BrowserRouter>
  )
}
