import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LevelMap from './pages/LevelMap'
import LevelDetail from './pages/LevelDetail'
import Exam from './pages/Exam'
import ExamResult from './pages/ExamResult'
import Certificates from './pages/Certificates'
import VerifyCertificate from './pages/VerifyCertificate'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import AuthCallback from './pages/AuthCallback'
import { AuthGuard } from './guards/AuthGuard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:id" element={<VerifyCertificate />} />
        <Route path="/auth/success" element={<AuthCallback />} />
        <Route path="/auth/callback/google" element={<AuthCallback />} />
        <Route path="/auth/callback/github" element={<AuthCallback />} />
        <Route path="/auth/callback/apple" element={<AuthCallback />} />
        <Route element={<AuthGuard><Layout /></AuthGuard>}>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/levels" element={<LevelMap />} />
          <Route path="/levels/:id" element={<LevelDetail />} />
          <Route path="/exam/:examId" element={<Exam />} />
          <Route path="/exam/:examId/result" element={<ExamResult />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
