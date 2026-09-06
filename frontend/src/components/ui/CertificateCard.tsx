import React from 'react'
import { Award, Download, ExternalLink, CheckCircle } from 'lucide-react'
import { CertificateItem } from '../../types'

interface CertificateCardProps {
  cert: CertificateItem
  onDownload?: () => void
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onDownload }) => {
  const verifyUrl = `${window.location.origin}/verify/${cert.verification_id}`

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
    alert('Verification link copied to clipboard!')
  }

  return (
    <div className="bg-card border border-amber-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.08)] relative overflow-hidden group hover:border-amber-500/60 transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <Award className="w-6 h-6" />
        </div>
        <span className="flex items-center space-x-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>VERIFIED</span>
        </span>
      </div>

      <h3 className="font-bold text-gray-100 text-lg mb-1 capitalize">
        {cert.certificate_type} Cloud Security Certificate
      </h3>

      <div className="space-y-1 mb-4 text-xs font-mono text-gray-400">
        <div>Score: <span className="text-amber-400 font-bold">{cert.exam_score}%</span></div>
        <div>ID: <span className="text-cyan-400">{cert.verification_id}</span></div>
        <div>Issued: {new Date(cert.issued_at).toLocaleDateString()}</div>
      </div>

      <div className="flex items-center space-x-2 pt-3 border-t border-gray-800">
        <a
          href={`/api/certificates/${cert.verification_id}/download`}
          download
          className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </a>

        <button
          onClick={copyVerifyLink}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          title="Copy Verification Link"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
