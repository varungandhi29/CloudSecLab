import React from 'react'
import {
  Shield,
  KeyRound,
  HardDrive,
  Network,
  Activity,
  Lock,
  Search,
  Server,
  Cloud,
  FileCheck,
} from 'lucide-react'

export type ConceptCategory =
  | 'identity'
  | 'iam'
  | 'storage'
  | 's3'
  | 'network'
  | 'vpc'
  | 'logging'
  | 'audit'
  | 'cloudtrail'
  | 'encryption'
  | 'kms'
  | 'forensics'
  | 'compute'
  | 'fundamentals'
  | 'general'

interface CategoryIconProps {
  category?: string
  className?: string
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category = 'general', className = 'w-4 h-4' }) => {
  const norm = category.toLowerCase()

  if (norm.includes('iam') || norm.includes('ident') || norm.includes('auth') || norm.includes('user')) {
    return <KeyRound className={className} />
  }
  if (norm.includes('s3') || norm.includes('storage') || norm.includes('bucket') || norm.includes('blob')) {
    return <HardDrive className={className} />
  }
  if (norm.includes('vpc') || norm.includes('network') || norm.includes('subnet') || norm.includes('route')) {
    return <Network className={className} />
  }
  if (norm.includes('trail') || norm.includes('log') || norm.includes('audit') || norm.includes('monitor')) {
    return <Activity className={className} />
  }
  if (norm.includes('kms') || norm.includes('encrypt') || norm.includes('crypto') || norm.includes('secret')) {
    return <Lock className={className} />
  }
  if (norm.includes('forensic') || norm.includes('investigat') || norm.includes('incident')) {
    return <Search className={className} />
  }
  if (norm.includes('compute') || norm.includes('ec2') || norm.includes('vm') || norm.includes('lambda')) {
    return <Server className={className} />
  }
  if (norm.includes('complian') || norm.includes('governance') || norm.includes('policy')) {
    return <FileCheck className={className} />
  }

  return <Shield className={className} />
}

export default CategoryIcon
