import React from 'react'

interface ConceptDiagramProps {
  levelId: number
  title?: string
  category?: string
  track?: string
}

export const ConceptDiagram: React.FC<ConceptDiagramProps> = ({ levelId, title = '', category = '', track = '' }) => {
  const normTitle = title.toLowerCase()
  const normCategory = category.toLowerCase()

  // Determine which diagram type best matches this level's subject matter
  let diagramType: 'shared-responsibility' | 'iam-trust' | 's3-policy' | 'vpc-layout' | 'cloudtrail-flow' | 'kms-encryption' | 'azure-rbac' | 'gcp-service-account' | 'generic' = 'generic'

  if (levelId === 1 || normTitle.includes('shared responsibility') || normTitle.includes('what is cloud')) {
    diagramType = 'shared-responsibility'
  } else if (normTitle.includes('iam') || normTitle.includes('role') || normTitle.includes('trust') || normTitle.includes('policy') || normCategory.includes('iam') || normCategory.includes('identity')) {
    diagramType = 'iam-trust'
  } else if (normTitle.includes('s3') || normTitle.includes('bucket') || normTitle.includes('storage') || normCategory.includes('storage')) {
    diagramType = 's3-policy'
  } else if (normTitle.includes('vpc') || normTitle.includes('subnet') || normTitle.includes('network') || normTitle.includes('route') || normCategory.includes('network')) {
    diagramType = 'vpc-layout'
  } else if (normTitle.includes('trail') || normTitle.includes('log') || normTitle.includes('forensic') || normCategory.includes('logging') || normCategory.includes('audit')) {
    diagramType = 'cloudtrail-flow'
  } else if (normTitle.includes('kms') || normTitle.includes('encrypt') || normTitle.includes('key') || normCategory.includes('encryption')) {
    diagramType = 'kms-encryption'
  } else if (normTitle.includes('azure') || normCategory.includes('azure')) {
    diagramType = 'azure-rbac'
  } else if (normTitle.includes('gcp') || normCategory.includes('gcp')) {
    diagramType = 'gcp-service-account'
  }

  return (
    <div className="w-full bg-bg-panel-subtle border border-border-base rounded-lg p-3 sm:p-4 mb-4 select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono font-medium text-text-muted">
          ARCHITECTURE CONCEPT DIAGRAM
        </span>
        <span className="text-[10px] font-mono text-accent-teal uppercase">
          {diagramType.replace('-', ' ')}
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center py-1">
        {diagramType === 'shared-responsibility' && <SharedResponsibilityDiagram />}
        {diagramType === 'iam-trust' && <IamTrustDiagram />}
        {diagramType === 's3-policy' && <S3PolicyDiagram />}
        {diagramType === 'vpc-layout' && <VpcLayoutDiagram />}
        {diagramType === 'cloudtrail-flow' && <CloudTrailDiagram />}
        {diagramType === 'kms-encryption' && <KmsDiagram />}
        {diagramType === 'azure-rbac' && <AzureRbacDiagram />}
        {diagramType === 'gcp-service-account' && <GcpDiagram />}
        {diagramType === 'generic' && <GenericSecurityDiagram title={title || `Level ${levelId}`} />}
      </div>
    </div>
  )
}

/* 1. Shared Responsibility Model */
const SharedResponsibilityDiagram: React.FC = () => (
  <svg viewBox="0 0 560 140" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* Customer Box (Top) */}
    <rect x="20" y="10" width="520" height="55" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="35" y="28" fill="#E8A33D" fontWeight="bold">CUSTOMER RESPONSIBILITY (Security IN the Cloud)</text>
    <text x="35" y="48" fill="#E7EAEE">Customer Data • IAM Policies • OS Configuration • App Code • Network Access</text>

    {/* Division marker */}
    <line x1="20" y1="70" x2="540" y2="70" stroke="#26303D" strokeDasharray="4" />

    {/* Provider Box (Bottom) */}
    <rect x="20" y="75" width="520" height="55" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="35" y="93" fill="#4FB6A8" fontWeight="bold">CLOUD PROVIDER RESPONSIBILITY (Security OF the Cloud)</text>
    <text x="35" y="113" fill="#8B95A5">Hypervisors • Physical Servers • Datacenter Perimeter • Hardware Facilities</text>
  </svg>
)

/* 2. IAM Role Trust & STS AssumeRole */
const IamTrustDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* Node 1: Caller Principal */}
    <rect x="15" y="35" width="110" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="70" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">Caller Principal</text>
    <text x="70" y="76" textAnchor="middle" fill="#8B95A5">EC2 / User / App</text>

    {/* Arrow 1 */}
    <path d="M 125 65 L 175 65" stroke="#E8A33D" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
    <text x="150" y="55" textAnchor="middle" fill="#E8A33D" fontSize="9">AssumeRole</text>

    {/* Node 2: AWS STS */}
    <rect x="180" y="30" width="105" height="70" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="232" y="55" textAnchor="middle" fill="#E8A33D" fontWeight="bold">AWS STS</text>
    <text x="232" y="71" textAnchor="middle" fill="#8B95A5">Trust Policy Check</text>
    <text x="232" y="85" textAnchor="middle" fill="#8B95A5">Temp Tokens</text>

    {/* Arrow 2 */}
    <path d="M 285 65 L 335 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />
    <text x="310" y="55" textAnchor="middle" fill="#4FB6A8" fontSize="9">Session Token</text>

    {/* Node 3: Target Role & Permissions */}
    <rect x="340" y="30" width="105" height="70" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="392" y="55" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">Target IAM Role</text>
    <text x="392" y="71" textAnchor="middle" fill="#8B95A5">Attached Policies</text>
    <text x="392" y="85" textAnchor="middle" fill="#8B95A5">Least Privilege</text>

    {/* Arrow 3 */}
    <path d="M 445 65 L 480 65" stroke="#26303D" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />

    {/* Node 4: Cloud Resource */}
    <rect x="485" y="35" width="65" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="517" y="62" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">S3 / API</text>
    <text x="517" y="78" textAnchor="middle" fill="#8B95A5">Resource</text>

    {/* SVG Arrow Markers */}
    <defs>
      <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#E8A33D" />
      </marker>
      <marker id="arrow-teal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4FB6A8" />
      </marker>
      <marker id="arrow-muted" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B95A5" />
      </marker>
    </defs>
  </svg>
)

/* 3. S3 Bucket Policy & Block Public Access */
const S3PolicyDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* Node 1: Request */}
    <rect x="15" y="35" width="95" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="62" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">HTTP Request</text>
    <text x="62" y="76" textAnchor="middle" fill="#8B95A5">s3:GetObject</text>

    {/* Arrow 1 */}
    <path d="M 110 65 L 145 65" stroke="#E8A33D" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />

    {/* Node 2: Block Public Access */}
    <rect x="150" y="25" width="115" height="80" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="207" y="47" textAnchor="middle" fill="#E8A33D" fontWeight="bold">Block Public Access</text>
    <text x="207" y="63" textAnchor="middle" fill="#8B95A5">Account / Bucket</text>
    <text x="207" y="79" textAnchor="middle" fill="#8B95A5">Override Guard</text>

    {/* Arrow 2 */}
    <path d="M 265 65 L 300 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Node 3: Bucket Policy Engine */}
    <rect x="305" y="25" width="125" height="80" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="367" y="47" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">Policy Evaluation</text>
    <text x="367" y="63" textAnchor="middle" fill="#8B95A5">1. Explicit Deny ?</text>
    <text x="367" y="79" textAnchor="middle" fill="#8B95A5">2. Explicit Allow ?</text>

    {/* Arrow 3 */}
    <path d="M 430 65 L 465 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Node 4: S3 Object */}
    <rect x="470" y="35" width="75" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="507" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">S3 Bucket</text>
    <text x="507" y="76" textAnchor="middle" fill="#4FB6A8">Data Object</text>
  </svg>
)

/* 4. VPC Subnet & Route Table Layout */
const VpcLayoutDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* IGW on left */}
    <rect x="15" y="40" width="70" height="50" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="50" y="62" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">Internet</text>
    <text x="50" y="77" textAnchor="middle" fill="#8B95A5">Gateway</text>

    <path d="M 85 65 L 125 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Public Subnet */}
    <rect x="130" y="20" width="170" height="90" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="215" y="40" textAnchor="middle" fill="#E8A33D" fontWeight="bold">PUBLIC SUBNET (10.0.1.0/24)</text>
    <text x="215" y="58" textAnchor="middle" fill="#E7EAEE">Route: 0.0.0.0/0 → IGW</text>
    <rect x="145" y="68" width="140" height="30" rx="4" fill="#12161C" stroke="#26303D" />
    <text x="215" y="87" textAnchor="middle" fill="#E8A33D">NAT Gateway / Bastion</text>

    <path d="M 300 83 L 340 83" stroke="#26303D" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />

    {/* Private Subnet */}
    <rect x="345" y="20" width="200" height="90" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="445" y="40" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">PRIVATE SUBNET (10.0.2.0/24)</text>
    <text x="445" y="58" textAnchor="middle" fill="#8B95A5">Route: 0.0.0.0/0 → NAT Gateway</text>
    <rect x="360" y="68" width="170" height="30" rx="4" fill="#12161C" stroke="#4FB6A8" />
    <text x="445" y="87" textAnchor="middle" fill="#4FB6A8">Internal App / Database</text>
  </svg>
)

/* 5. CloudTrail Event Flow */
const CloudTrailDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* API Call */}
    <rect x="15" y="35" width="105" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="67" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">AWS API Call</text>
    <text x="67" y="76" textAnchor="middle" fill="#8B95A5">Console / CLI / SDK</text>

    <path d="M 120 65 L 165 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* CloudTrail Engine */}
    <rect x="170" y="25" width="115" height="80" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="227" y="48" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">AWS CloudTrail</text>
    <text x="227" y="65" textAnchor="middle" fill="#8B95A5">Event Collector</text>
    <text x="227" y="81" textAnchor="middle" fill="#8B95A5">Hash Validation</text>

    <path d="M 285 50 L 335 40" stroke="#E8A33D" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />
    <path d="M 285 80 L 335 90" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* S3 Audit Log Destination */}
    <rect x="340" y="15" width="190" height="45" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="435" y="33" textAnchor="middle" fill="#E8A33D" fontWeight="bold">S3 Audit Storage</text>
    <text x="435" y="48" textAnchor="middle" fill="#8B95A5">Object Lock • Immutable Storage</text>

    {/* CloudWatch Alerting */}
    <rect x="340" y="70" width="190" height="45" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="435" y="88" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">CloudWatch & Security Hub</text>
    <text x="435" y="103" textAnchor="middle" fill="#8B95A5">Metric Filters • Incident Alert</text>
  </svg>
)

/* 6. KMS Envelope Encryption */
const KmsDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* KMS Root Key */}
    <rect x="15" y="30" width="120" height="70" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="75" y="55" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">KMS CMK (Root)</text>
    <text x="75" y="71" textAnchor="middle" fill="#8B95A5">Hardware HSM</text>
    <text x="75" y="85" textAnchor="middle" fill="#8B95A5">Never leaves AWS</text>

    <path d="M 135 65 L 185 65" stroke="#E8A33D" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />

    {/* GenerateDataKey Output */}
    <rect x="190" y="25" width="165" height="80" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="272" y="47" textAnchor="middle" fill="#E8A33D" fontWeight="bold">Envelope Encryption</text>
    <text x="272" y="63" textAnchor="middle" fill="#E7EAEE">1. Plaintext Data Key (DEK)</text>
    <text x="272" y="79" textAnchor="middle" fill="#8B95A5">2. Encrypted Data Key (E-DEK)</text>

    <path d="M 355 65 L 395 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Storage at Rest */}
    <rect x="400" y="25" width="145" height="80" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="472" y="47" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">Stored at Rest</text>
    <text x="472" y="63" textAnchor="middle" fill="#4FB6A8">Encrypted Payload</text>
    <text x="472" y="79" textAnchor="middle" fill="#8B95A5">+ Stored E-DEK Header</text>
  </svg>
)

/* 7. Azure RBAC Hierarchy */
const AzureRbacDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* MG */}
    <rect x="15" y="35" width="105" height="60" rx="6" fill="#1A2029" stroke="#4E9BE0" strokeWidth="1.5" />
    <text x="67" y="60" textAnchor="middle" fill="#4E9BE0" fontWeight="bold">Management</text>
    <text x="67" y="76" textAnchor="middle" fill="#8B95A5">Group Scope</text>

    <path d="M 120 65 L 155 65" stroke="#4E9BE0" strokeWidth="1.5" markerEnd="url(#arrow-azure)" />

    {/* Subscription */}
    <rect x="160" y="35" width="105" height="60" rx="6" fill="#1A2029" stroke="#4E9BE0" strokeWidth="1.5" />
    <text x="212" y="60" textAnchor="middle" fill="#4E9BE0" fontWeight="bold">Subscription</text>
    <text x="212" y="76" textAnchor="middle" fill="#8B95A5">Billing Boundary</text>

    <path d="M 265 65 L 300 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Resource Group */}
    <rect x="305" y="35" width="115" height="60" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="362" y="60" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">Resource Group</text>
    <text x="362" y="76" textAnchor="middle" fill="#8B95A5">RBAC Inheritance</text>

    <path d="M 420 65 L 455 65" stroke="#26303D" strokeWidth="1.5" markerEnd="url(#arrow-muted)" />

    {/* Resources */}
    <rect x="460" y="35" width="85" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="502" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">Resources</text>
    <text x="502" y="76" textAnchor="middle" fill="#8B95A5">VM / KeyVault</text>

    <defs>
      <marker id="arrow-azure" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4E9BE0" />
      </marker>
    </defs>
  </svg>
)

/* 8. GCP Service Account IAM */
const GcpDiagram: React.FC = () => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* Identity */}
    <rect x="15" y="35" width="115" height="60" rx="6" fill="#1A2029" stroke="#4285F4" strokeWidth="1.5" />
    <text x="72" y="60" textAnchor="middle" fill="#4285F4" fontWeight="bold">Service Account</text>
    <text x="72" y="76" textAnchor="middle" fill="#8B95A5">sa@project.iam</text>

    <path d="M 130 65 L 170 65" stroke="#4285F4" strokeWidth="1.5" markerEnd="url(#arrow-gcp)" />

    {/* IAM Role Binding */}
    <rect x="175" y="25" width="160" height="80" rx="6" fill="#1A2029" stroke="#FBBC05" strokeWidth="1.5" />
    <text x="255" y="47" textAnchor="middle" fill="#FBBC05" fontWeight="bold">IAM Role Binding</text>
    <text x="255" y="63" textAnchor="middle" fill="#E7EAEE">Member + Role</text>
    <text x="255" y="79" textAnchor="middle" fill="#8B95A5">roles/storage.objectAdmin</text>

    <path d="M 335 65 L 375 65" stroke="#34A853" strokeWidth="1.5" markerEnd="url(#arrow-green)" />

    {/* GCP Target Resource */}
    <rect x="380" y="35" width="165" height="60" rx="6" fill="#1A2029" stroke="#34A853" strokeWidth="1.5" />
    <text x="462" y="60" textAnchor="middle" fill="#34A853" fontWeight="bold">Cloud Storage Bucket</text>
    <text x="462" y="76" textAnchor="middle" fill="#8B95A5">Secured GCS Bucket</text>

    <defs>
      <marker id="arrow-gcp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#4285F4" />
      </marker>
      <marker id="arrow-green" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#34A853" />
      </marker>
    </defs>
  </svg>
)

/* 9. Generic Security Pipeline Diagram */
const GenericSecurityDiagram: React.FC<{ title: string }> = ({ title }) => (
  <svg viewBox="0 0 560 130" className="w-full max-w-[560px] h-auto font-mono text-[10px]">
    {/* Step 1 */}
    <rect x="15" y="35" width="125" height="60" rx="6" fill="#1A2029" stroke="#26303D" strokeWidth="1.5" />
    <text x="77" y="60" textAnchor="middle" fill="#E7EAEE" fontWeight="bold">Authenticated Actor</text>
    <text x="77" y="76" textAnchor="middle" fill="#8B95A5">Security Boundary</text>

    <path d="M 140 65 L 180 65" stroke="#E8A33D" strokeWidth="1.5" markerEnd="url(#arrow-amber)" />

    {/* Step 2 */}
    <rect x="185" y="25" width="170" height="80" rx="6" fill="#1A2029" stroke="#E8A33D" strokeWidth="1.5" />
    <text x="270" y="47" textAnchor="middle" fill="#E8A33D" fontWeight="bold">Policy Enforcement Engine</text>
    <text x="270" y="63" textAnchor="middle" fill="#E7EAEE">Least Privilege Check</text>
    <text x="270" y="79" textAnchor="middle" fill="#8B95A5">Compliance Guardrails</text>

    <path d="M 355 65 L 395 65" stroke="#4FB6A8" strokeWidth="1.5" markerEnd="url(#arrow-teal)" />

    {/* Step 3 */}
    <rect x="400" y="35" width="145" height="60" rx="6" fill="#1A2029" stroke="#4FB6A8" strokeWidth="1.5" />
    <text x="472" y="60" textAnchor="middle" fill="#4FB6A8" fontWeight="bold">Protected Workload</text>
    <text x="472" y="76" textAnchor="middle" fill="#8B95A5">Secured Cloud Asset</text>
  </svg>
)

export default ConceptDiagram
