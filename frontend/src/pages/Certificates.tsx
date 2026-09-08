import React, { useEffect, useState } from 'react'
import { Award, BookOpen, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { CertificateItem } from '../types'
import { CertificateCard } from '../components/ui/CertificateCard'

export const Certificates: React.FC = () => {
  const [certs, setCerts] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates')
        setCerts(res.data)
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 py-6 text-text-primary">
      {/* Header */}
      <div className="border-b border-border-base pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight font-mono">
          Verifiable Certificates
        </h1>
        <p className="text-text-muted text-xs md:text-sm mt-0.5">
          Official credentials earned by passing CloudSecLab track final certification exams.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-xs font-mono text-text-muted py-12 text-center">
          Loading credentials...
        </div>
      )}

      {/* Empty State */}
      {!loading && certs.length === 0 && (
        <div className="bg-bg-panel border border-border-base rounded-lg p-10 text-center space-y-3 max-w-lg mx-auto my-10">
          <Award className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-text-primary font-mono">No Certificates Earned Yet</h3>
          <p className="text-xs text-text-muted leading-relaxed font-sans">
            Complete all 25 levels of any track to unlock its timed module exam. Pass with a score of 80% or higher to earn an official certificate with cryptographic verification.
          </p>
          <div className="pt-2">
            <Link
              to="/levels"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-teal text-bg-base hover:bg-accent-teal/90 rounded text-xs font-mono font-bold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Browse Curriculum Levels</span>
            </Link>
          </div>
        </div>
      )}

      {/* Certificate Cards Grid */}
      {!loading && certs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Certificates
