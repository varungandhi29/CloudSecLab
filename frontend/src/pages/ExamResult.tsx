import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Award, CheckCircle2, XCircle, Download, ArrowRight, BookOpen } from 'lucide-react'

export const ExamResult: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  if (!result) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 text-xs font-mono">
        <h2 className="text-sm font-bold text-text-primary mb-3">No Exam Result Found</h2>
        <Link to="/levels" className="px-4 py-2 bg-accent-teal text-bg-base font-bold rounded">
          Return to Curriculum
        </Link>
      </div>
    )
  }

  const passed = result.passed

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex items-center justify-center p-4 sm:p-6 font-sans text-xs">
      <div className="max-w-lg w-full bg-bg-panel border border-border-base rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Status Header */}
        <div className="space-y-3">
          {passed ? (
            <div className="w-16 h-16 bg-accent-teal/10 border border-accent-teal/30 rounded-full flex items-center justify-center mx-auto text-accent-teal">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-accent-danger/10 border border-accent-danger/30 rounded-full flex items-center justify-center mx-auto text-accent-danger">
              <XCircle className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1 font-mono">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                passed
                  ? 'bg-accent-teal/10 border-accent-teal/30 text-accent-teal'
                  : 'bg-accent-danger/10 border-accent-danger/30 text-accent-danger'
              }`}
            >
              {passed ? 'Exam Passed' : 'Exam Incomplete'}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary pt-1">
              {passed ? 'Certification Requirements Satisfied' : 'Passing Threshold Not Reached'}
            </h1>
          </div>

          <p className="text-text-muted text-xs font-sans leading-relaxed m-0">
            {passed
              ? 'Congratulations! You have demonstrated cloud security operations proficiency and earned an official credential.'
              : 'You did not achieve the required 80% passing score. Review the track write-ups and retake the exam when ready.'}
          </p>
        </div>

        {/* Score Breakdown Table */}
        <div className="bg-bg-input border border-border-subtle rounded-lg p-4 grid grid-cols-3 gap-3 font-mono">
          <div>
            <div className="text-[10px] text-text-muted uppercase">Theory Score</div>
            <div className="text-lg font-bold text-accent-teal mt-0.5">{result.theory_score}%</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase">Practical Score</div>
            <div className="text-lg font-bold text-accent-teal mt-0.5">{result.practical_score}%</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase">Total Score</div>
            <div className={`text-lg font-bold mt-0.5 ${passed ? 'text-accent-amber' : 'text-accent-danger'}`}>
              {result.total_score}%
            </div>
          </div>
        </div>

        {/* Certificate Ready Section if Passed */}
        {passed && result.certificate && (
          <div className="bg-bg-base border border-accent-teal/30 rounded-lg p-4 space-y-3 font-mono text-left">
            <div className="flex items-center gap-2 text-accent-teal font-bold text-xs">
              <Award className="w-4 h-4" />
              <span>Official Certificate Issued</span>
            </div>
            <div className="text-[11px] text-text-muted space-y-1">
              <div>Verification ID: <span className="text-text-primary font-semibold">{result.certificate.verification_id}</span></div>
            </div>
            <a
              href={`/api/certificates/${result.certificate.verification_id}/download`}
              download
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-bold rounded text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Certificate</span>
            </a>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 pt-2 font-mono">
          <Link
            to="/levels"
            className="px-4 py-2 bg-bg-base hover:bg-bg-input text-text-muted hover:text-text-primary border border-border-base rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum</span>
          </Link>
          <Link
            to="/certificates"
            className="px-4 py-2 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5" />
            <span>View Certificates</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ExamResult
