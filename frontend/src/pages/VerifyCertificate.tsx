import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Shield, CheckCircle, XCircle, Award } from 'lucide-react'
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
      <div className="min-h-screen bg-background flex items-center justify-center text-cyan-400 font-mono">
        Verifying Certificate Authenticity...
      </div>
    )
  }

  const isValid = data?.valid

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex flex-col items-center justify-center p-6">
      {/* Header Brand */}
      <Link to="/" className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
          <Shield className="w-8 h-8" />
        </div>
        <span className="font-mono font-bold text-2xl tracking-wider text-white">
          CLOUD<span className="text-cyan-400">SEC</span>LAB
        </span>
      </Link>

      <div className="max-w-md w-full bg-card border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        {isValid ? (
          <>
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">
                AUTHENTIC CERTIFICATE
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-4">{data.holder_name}</h2>
              <p className="text-sm text-gray-400 mt-1 capitalize">{data.certificate_type} Cloud Security Certificate</p>
            </div>

            <div className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 text-xs font-mono space-y-2 text-left text-gray-300">
              <div><span className="text-gray-500">Verification ID:</span> <span className="text-cyan-400 font-bold">{data.verification_id}</span></div>
              <div><span className="text-gray-500">Issued Date:</span> {new Date(data.issued_at).toLocaleDateString()}</div>
              <div><span className="text-gray-500">Exam Score:</span> <span className="text-amber-400 font-bold">{data.exam_score}%</span></div>
              <div><span className="text-gray-500">Issuer:</span> CloudSecLab Verification Authority</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full uppercase">
                INVALID CERTIFICATE
              </span>
              <h2 className="text-xl font-bold text-white mt-4">Verification Failed</h2>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                The verification code <span className="font-mono text-cyan-400">{id}</span> does not match any active CloudSecLab record.
              </p>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-gray-800">
          <Link to="/" className="text-xs font-mono text-cyan-400 hover:underline">
            ← Return to CloudSecLab Home
          </Link>
        </div>
      </div>
    </div>
  )
}
export default VerifyCertificate
