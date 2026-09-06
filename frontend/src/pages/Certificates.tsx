import React, { useEffect, useState } from 'react'
import { Award, Share2 } from 'lucide-react'
import { api } from '../services/api'
import { CertificateItem } from '../types'
import { CertificateCard } from '../components/ui/CertificateCard'

export const Certificates: React.FC = () => {
  const [certs, setCerts] = useState<CertificateItem[]>([])

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get('/certificates')
        setCerts(res.data)
      } catch (e) {}
    }
    fetchCerts()
  }, [])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Verifiable Certificates</h1>
        <p className="text-gray-400 text-sm">Official credentials earned by completing CloudSecLab module final exams.</p>
      </div>

      {certs.length === 0 ? (
        <div className="bg-card border border-gray-800 rounded-2xl p-12 text-center space-y-4">
          <Award className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Certificates Earned Yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Complete all 25 levels of a module track to unlock its final exam and earn a verifiable certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  )
}
export default Certificates
