import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Shield, CheckCircle2, XCircle, Award, ExternalLink, ArrowLeft } from 'lucide-react'
import axios from 'axios'

export const VerifyCertificate: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkCert = async () => {
      try {
        const res = await axios.get(`/api/verify/${id}`)
        setData(res.data)
      } catch (e) {
        setData({ valid: false })
      } finally {
        setLoading(false)
      }
    }
    checkCert()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-muted font-mono text-xs">
        Verifying Certificate Hash with Certificate Authority...
      </div>
    )
  }

  const isValid = data?.valid

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <Link to="/" className="flex items-center space-x-2.5 mb-6 focus-visible:ring-2 focus-visible:ring-accent-amber rounded">
        <div className="w-8 h-8 rounded-md bg-bg-panel border border-border-base flex items-center justify-center text-accent-teal">
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-mono font-bold text-base tracking-tight text-text-primary">
          CloudSec<span className="text-accent-teal">Lab</span>
        </span>
      </Link>

      {/* Verification Card */}
      <div className="max-w-md w-full bg-bg-panel border border-border-base rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-xs">
        {isValid ? (
          <>
            {/* Valid Icon */}
            <div className="w-14 h-14 bg-accent-teal/10 border border-accent-teal/30 rounded-full flex items-center justify-center mx-auto text-accent-teal">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-accent-teal bg-accent-teal/10 border border-accent-teal/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Authentic Credential Verified
              </span>
              <h2 className="text-lg font-bold text-text-primary font-mono pt-2">{data.holder_name}</h2>
              <p className="text-xs text-text-muted capitalize">
                {data.certificate_type} Cloud Security Practitioner Certificate
              </p>
            </div>

            {/* Cryptographic Details Table */}
            <div className="bg-bg-input border border-border-subtle rounded-lg p-3.5 text-left font-mono text-[11px] space-y-2 text-text-muted">
              <div className="flex justify-between border-b border-border-subtle pb-1.5">
                <span>Verification ID:</span>
                <span className="text-accent-teal font-semibold select-all">{data.verification_id}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-1.5">
                <span>Issued Date:</span>
                <span className="text-text-primary">{new Date(data.issued_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-1.5">
                <span>Exam Score:</span>
                <span className="text-accent-amber font-semibold">{data.exam_score}%</span>
              </div>
              <div className="flex justify-between">
                <span>Verification Authority:</span>
                <span className="text-text-primary">CloudSecLab Root CA</span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted font-sans leading-relaxed m-0">
              This credential certifies that the holder has demonstrated hands-on technical proficiency in cloud security operations, IAM privilege management, and attack forensics.
            </p>
          </>
        ) : (
          <>
            {/* Invalid Icon */}
            <div className="w-14 h-14 bg-accent-danger/10 border border-accent-danger/30 rounded-full flex items-center justify-center mx-auto text-accent-danger">
              <XCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-accent-danger bg-accent-danger/10 border border-accent-danger/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Invalid Certificate
              </span>
              <h2 className="text-base font-bold text-text-primary font-mono pt-2">Verification Failed</h2>
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                The verification code <span className="font-mono text-text-primary bg-bg-base px-1.5 py-0.5 rounded border border-border-base">{id}</span> does not match any record in the CloudSecLab registry.
              </p>
            </div>
          </>
        )}

        <div className="pt-3 border-t border-border-base">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-accent-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to CloudSecLab</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyCertificate
