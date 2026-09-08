import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ToastContainer } from '../ui/Toast'
import { OnboardingModal } from '../ui/OnboardingModal'

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <ToastContainer />
      <OnboardingModal />
    </div>
  )
}

export default Layout
