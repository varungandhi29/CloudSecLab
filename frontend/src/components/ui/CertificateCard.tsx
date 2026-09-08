import React from 'react'
import { Award, Download, ExternalLink, CheckCircle2 } from 'lucide-react'
import { CertificateItem } from '../../types'
import { notify } from '../../store/toastStore'

interface CertificateCardProps {
  cert: CertificateItem
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert }) => {
  const verifyUrl = `${window.location.origin}/verify/${cert.verification_id}`

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl)
    notify.success('Link Copied', 'Public certificate verification URL copied to clipboard.')
  }

  return (
    <div className="bg-bg-panel border border-border-base hover:border-accent-teal/40 rounded-lg p-5 transition-all relative flex flex-col justify-between text-xs space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-md bg-bg-base border border-border-base flex items-center justify-center text-accent-teal">
          <Award className="w-5 h-5" />
        </div>
        <span className="flex items-center gap-1 text-[11px] font-mono text-accent-teal bg-accent-teal/10 border border-accent-teal/30 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VERIFIED</span>
        </span>
      </div>

      {/* Certificate Title & Details */}
      <div className="space-y-2">
        <h3 className="font-mono font-bold text-sm text-text-primary capitalize leading-snug">
          {cert.certificate_type} Cloud Security Certificate
        </h3>

        <div className="bg-bg-input border border-border-subtle rounded p-3 font-mono text-[11px] space-y-1.5 text-text-muted">
          <div className="flex justify-between">
            <span>Holder:</span>
            <span className="text-text-primary font-semibold">{cert.user_full_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Score:</span>
            <span className="text-accent-amber font-semibold">{cert.exam_score}%</span>
          </div>
          <div className="flex justify-between">
            <span>Verification ID:</span>
            <span className="text-accent-teal font-semibold">{cert.verification_id}</span>
          </div>
          <div className="flex justify-between">
            <span>Issued:</span>
            <span className="text-text-primary">{new Date(cert.issued_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 border-t border-border-subtle flex items-center gap-2">
        <a
          href={`/api/certificates/${cert.verification_id}/download`}
          download
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent-teal/15 hover:bg-accent-teal/25 text-accent-teal border border-accent-teal/30 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </a>

        <button
          type="button"
          onClick={copyVerifyLink}
          className="p-1.5 bg-bg-base hover:bg-bg-panel-subtle text-text-muted hover:text-text-primary border border-border-base rounded transition-colors focus-visible:ring-1 focus-visible:ring-accent-amber"
          title="Copy Public Verification Link"
          aria-label="Copy Verification Link"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default CertificateCard
