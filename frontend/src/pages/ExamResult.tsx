import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Award, CheckCircle, XCircle, Download, ArrowRight } from 'lucide-react'

export const ExamResult: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-white mb-4">No Exam Result Available</h2>
        <Link to="/levels" className="px-5 py-2.5 bg-cyan-500 text-black font-bold rounded-xl">
          Return to Level Map
        </Link>
      </div>
    )
  }

  const passed = result.passed

  return (
    <div className="min-h-screen bg-background text-gray-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-card border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-8 text-center">
        {/* Banner Status */}
        <div className="space-y-4">
          {passed ? (
            <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-white">
            {passed ? 'EXAM PASSED!' : 'EXAM FAILED'}
          </h1>
          <p className="text-gray-400 text-sm">
            {passed
              ? 'Congratulations! You have demonstrated cloud security mastery and earned a verifiable certificate.'
              : 'You did not achieve the required passing score. Review the curriculum topics and try again in 24 hours.'}
          </p>
        </div>

        {/* Score Breakdown Table */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 grid grid-cols-3 gap-4 font-mono">
          <div>
            <div className="text-xs text-gray-400 uppercase">Theory Score</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{result.theory_score}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Practical Score</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{result.practical_score}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Total Score</div>
            <div className={`text-2xl font-bold mt-1 ${passed ? 'text-amber-400' : 'text-red-400'}`}>
              {result.total_score}%
            </div>
          </div>
        </div>

        {/* Certificate Section if Passed */}
        {passed && result.certificate && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <Award className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h3 className="font-bold text-white text-lg">Your Certificate is Ready!</h3>
              <p className="text-xs font-mono text-cyan-400 mt-1">ID: {result.certificate.verification_id}</p>
            </div>
            <a
              href={`/api/certificates/${result.certificate.verification_id}/download`}
              download
              className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Certificate</span>
            </a>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          <Link
            to="/levels"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl text-sm transition-colors"
          >
            Return to Level Map
          </Link>
          <Link
            to="/certificates"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-sm transition-colors"
          >
            View All Certificates
          </Link>
        </div>
      </div>
    </div>
  )
}
export default ExamResult
