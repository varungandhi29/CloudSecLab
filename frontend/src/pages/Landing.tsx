import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Terminal, Award, Search, ArrowRight, Zap, CheckCircle2, Lock } from 'lucide-react'

export const Landing: React.FC = () => {
  const sampleLevels = [
    { id: 1, title: 'What is Cloud Computing? + Shared Responsibility Model', track: 'Beginner' },
    { id: 2, title: 'AWS Account Structure — regions, availability zones, services', track: 'Beginner' },
    { id: 3, title: 'IAM Fundamentals — users, groups, roles, policies', track: 'Beginner' },
    { id: 4, title: 'Your First AWS CLI Command — setup and basic commands', track: 'Beginner' },
    { id: 5, title: 'Reading IAM Policies — JSON structure explained', track: 'Beginner' },
    { id: 6, title: 'Managed vs Inline Policies — differences and risks', track: 'Beginner' },
    { id: 7, title: 'S3 Fundamentals — buckets, objects, ACLs', track: 'Beginner' },
    { id: 8, title: 'S3 Bucket Permissions — public vs private & BPA', track: 'Beginner' },
    { id: 9, title: 'CloudTrail Basics — audit logs & forensics', track: 'Beginner' },
    { id: 10, title: 'VPC Fundamentals — subnets, route tables, security groups', track: 'Beginner' },
  ]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-accent-teal selection:text-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-base px-6 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-bg-panel border border-border-base flex items-center justify-center text-accent-teal">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-mono font-bold text-base tracking-tight text-text-primary">
            CloudSec<span className="text-accent-teal">Lab</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <Link
            to="/login"
            className="px-3 py-1.5 text-text-muted hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-3.5 py-1.5 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-bold rounded transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 bg-bg-panel border border-border-base px-3 py-1 rounded-full text-xs font-mono text-accent-teal">
          <Shield className="w-3.5 h-3.5" />
          <span>Hands-on Cloud Security Operations Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight font-mono">
          Master Cloud Security.<br />
          <span className="text-accent-teal">One Level at a Time.</span>
        </h1>

        <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed font-sans">
          100 hands-on labs covering AWS, Azure, and GCP — from IAM privilege escalation and S3 exposure to real attack forensics and verifiable certification.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
          <Link
            to="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-teal text-bg-base hover:bg-accent-teal/90 font-bold rounded transition-colors"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/levels"
            className="px-5 py-2.5 bg-bg-panel hover:bg-bg-panel-subtle text-text-primary border border-border-base rounded transition-colors"
          >
            Explore Curriculum
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border-base bg-bg-panel py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono text-xs">
          <div>
            <div className="text-2xl font-bold text-accent-teal">100</div>
            <div className="text-text-muted text-[11px] uppercase mt-0.5">Interactive Levels</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-amber">3</div>
            <div className="text-text-muted text-[11px] uppercase mt-0.5">Clouds (AWS, Azure, GCP)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">4</div>
            <div className="text-text-muted text-[11px] uppercase mt-0.5">Verifiable Certificates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-teal">LocalStack</div>
            <div className="text-text-muted text-[11px] uppercase mt-0.5">Live Emulation Sandbox</div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-10 text-xs">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-text-primary font-mono">
            Designed for Real Cloud Security Operations
          </h2>
          <p className="text-text-muted text-xs">
            Calm, focused, hands-on learning with architecture diagrams and live commands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bg-panel border border-border-base p-5 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-bg-base border border-border-base flex items-center justify-center text-accent-teal">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="font-mono font-bold text-sm text-text-primary">Hands-on Sandbox Labs</h3>
            <p className="text-text-muted leading-relaxed font-sans m-0">
              Run authentic AWS CLI commands against a live LocalStack environment with automatic server-backed validation.
            </p>
          </div>

          <div className="bg-bg-panel border border-border-base p-5 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-bg-base border border-border-base flex items-center justify-center text-accent-amber">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="font-mono font-bold text-sm text-text-primary">CloudTrail Forensics</h3>
            <p className="text-text-muted leading-relaxed font-sans m-0">
              Investigate raw event logs, reconstruct attack timelines, and discover lateral movement patterns.
            </p>
          </div>

          <div className="bg-bg-panel border border-border-base p-5 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-bg-base border border-border-base flex items-center justify-center text-accent-teal">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-mono font-bold text-sm text-text-primary">Verifiable Credentials</h3>
            <p className="text-text-muted leading-relaxed font-sans m-0">
              Pass timed track exams to earn PDF certificates backed by unique cryptographic verification IDs.
            </p>
          </div>

          <div className="bg-bg-panel border border-border-base p-5 rounded-lg space-y-2">
            <div className="w-8 h-8 rounded bg-bg-base border border-border-base flex items-center justify-center text-accent-amber">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-mono font-bold text-sm text-text-primary">Production IAM Syntax</h3>
            <p className="text-text-muted leading-relaxed font-sans m-0">
              Master genuine IAM policy JSON, trust relationships, KMS envelope encryption, and S3 permissions.
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-12 px-6 max-w-4xl mx-auto space-y-4">
        <h3 className="text-base font-bold text-text-primary font-mono text-center">
          Curriculum Preview (Sample Beginner Levels)
        </h3>

        <div className="bg-bg-panel border border-border-base rounded-lg divide-y divide-border-subtle font-mono text-xs">
          {sampleLevels.map((lvl) => (
            <div key={lvl.id} className="p-3 flex items-center justify-between hover:bg-bg-panel-subtle/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-accent-teal font-semibold">L{lvl.id.toString().padStart(3, '0')}</span>
                <span className="text-text-primary">{lvl.title}</span>
              </div>
              <span className="text-[10px] bg-bg-base text-text-muted px-2 py-0.5 rounded border border-border-subtle">
                {lvl.track}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-base py-6 px-6 text-center text-[11px] text-text-muted font-mono">
        © 2026 CloudSecLab. Hands-on cloud security operations and forensics.
      </footer>
    </div>
  )
}

export default Landing
