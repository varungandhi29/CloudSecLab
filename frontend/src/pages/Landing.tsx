import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Terminal, Award, Search, ArrowRight, CheckCircle2, Zap } from 'lucide-react'

export const Landing: React.FC = () => {
  const sampleLevels = [
    { id: 1, title: 'What is Cloud Computing + Shared Responsibility Model', track: 'Beginner' },
    { id: 2, title: 'AWS Account Structure — regions, availability zones, services', track: 'Beginner' },
    { id: 3, title: 'IAM Fundamentals — users, groups, roles, policies', track: 'Beginner' },
    { id: 4, title: 'Your First AWS CLI Command — setup and basic commands', track: 'Beginner' },
    { id: 5, title: 'Reading IAM Policies — JSON structure explained', track: 'Beginner' },
    { id: 6, title: 'Managed vs Inline Policies — differences and risks', track: 'Beginner' },
    { id: 7, title: 'S3 Fundamentals — buckets, objects, ACLs', track: 'Beginner' },
    { id: 8, title: 'S3 Bucket Permissions — public vs private', track: 'Beginner' },
    { id: 9, title: 'CloudTrail Basics — what gets logged', track: 'Beginner' },
    { id: 10, title: 'VPC Fundamentals — subnets, route tables', track: 'Beginner' },
  ]

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="h-20 border-b border-gray-800/80 px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <span className="font-mono font-bold text-xl tracking-wider">
            CLOUD<span className="text-cyan-400">SEC</span>LAB
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-8 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-cyan-400">
          <Zap className="w-4 h-4 fill-cyan-400" />
          <span>TRYHACKME-STYLE HANDS-ON CLOUD SECURITY PLATFORM</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Master Cloud Security.<br />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
            One Level at a Time.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          100 hands-on labs covering AWS, Azure, and GCP — from fundamentals to expert attack simulation and forensics.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-4">
          <Link
            to="/register"
            className="flex items-center space-x-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all text-base"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/levels"
            className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-200 font-semibold border border-gray-700 rounded-xl transition-colors text-base"
          >
            View Curriculum
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-surface/50 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono">
          <div>
            <div className="text-3xl font-extrabold text-cyan-400">100</div>
            <div className="text-xs text-gray-400 uppercase mt-1">Interactive Levels</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400">3</div>
            <div className="text-xs text-gray-400 uppercase mt-1">Cloud Platforms (AWS/Azure/GCP)</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400">4</div>
            <div className="text-xs text-gray-400 uppercase mt-1">Verifiable Certificates</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-400">LocalStack</div>
            <div className="text-xs text-gray-400 uppercase mt-1">AWS Emulation Sandbox</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Engineered for Deep Cyber Security Skills</h2>
          <p className="text-gray-400 text-sm">Real offensive & defensive tactics validated against cloud infrastructure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 w-fit">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Hands-on Labs</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Execute real AWS CLI commands against a live LocalStack environment with automated validation rules.
            </p>
          </div>

          <div className="bg-card border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 w-fit">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Cloud Forensics Challenges</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Investigate raw CloudTrail event logs, reconstruct attack timelines, and identify compromised IAM credentials.
            </p>
          </div>

          <div className="bg-card border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 w-fit">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Verifiable Certificates</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pass rigorous module final exams to earn PDF certificates featuring unique QR verification codes for employers.
            </p>
          </div>

          <div className="bg-card border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 w-fit">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Real AWS Commands</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              No simulated drag-and-drop. Master genuine `aws iam`, `aws s3`, and policy syntax used in production SOCs.
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-16 px-8 max-w-4xl mx-auto space-y-8">
        <h3 className="text-2xl font-bold text-white text-center">Curriculum Preview (First 10 Levels)</h3>
        <div className="bg-card border border-gray-800 rounded-2xl divide-y divide-gray-800 overflow-hidden font-mono text-sm">
          {sampleLevels.map((lvl) => (
            <div key={lvl.id} className="p-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="text-cyan-400 font-bold">Level {lvl.id.toString().padStart(3, '0')}</span>
                <span className="text-gray-200">{lvl.title}</span>
              </div>
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full">{lvl.track}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-8 text-center text-xs text-gray-500 font-mono">
        © 2026 CloudSecLab. Built for Cloud Security Engineers & Security Researchers.
      </footer>
    </div>
  )
}
export default Landing
