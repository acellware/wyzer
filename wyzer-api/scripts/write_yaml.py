"""Script to write technology and template YAML seed files in new format."""
import os

DATA_DIR = '/Users/anon/wyzer/wyzer-api/data'
TECH_DIR = os.path.join(DATA_DIR, 'technologies')
TMPL_DIR = os.path.join(DATA_DIR, 'templates')
os.makedirs(TMPL_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# TECHNOLOGY YAML FILES
# ─────────────────────────────────────────────────────────────────────────────

TECH_FILES = {}

TECH_FILES['postgresql.yaml'] = """\
slug: postgresql
name: PostgreSQL
category: database
vendor: "PostgreSQL Global Development Group"
is_managed_available: true
logo_url: /logos/postgresql.svg

config_questions:
  - signal_key: encryption_at_rest
    question: "Is encryption at rest enabled?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 1
  - signal_key: tls_enforced
    question: "Is TLS/SSL enforced for all connections?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 2
  - signal_key: publicly_accessible
    question: "Is the database reachable from the public internet?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 3
  - signal_key: backup_enabled
    question: "Are automated backups enabled?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 4
  - signal_key: backup_retention
    question: "What is your backup retention period?"
    input_type: radio
    applies_to_modes: [managed, self-hosted, on-prem]
    options:
      - { value: lt_7d, label: "Less than 7 days" }
      - { value: 7_30d, label: "7 to 30 days" }
      - { value: 30_90d, label: "30 to 90 days" }
      - { value: gt_90d, label: "90+ days" }
    order_index: 5
  - signal_key: rbac_enabled
    question: "Are role-based access controls configured?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 6
  - signal_key: audit_logging
    question: "Is audit logging enabled (e.g. pgaudit)?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 7

control_mappings:
  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.1"
      title: "Logical and Physical Access Controls"
      severity: HIGH
      description: "The entity implements logical access security software and architectures over protected information assets."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: rbac_enabled, op: eq, value: "yes" }
    evidence: "PostgreSQL GRANT/REVOKE and pg_hba.conf provide comprehensive logical access controls."
    remediation: "Configure roles with least-privilege GRANT statements; enable row-level security on sensitive tables."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.6"
      title: "Logical Access - External Threats"
      severity: HIGH
      description: "Logical access security measures restrict access from outside the system boundary."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: publicly_accessible, op: eq, value: "no" }
        - { signal: tls_enforced, op: eq, value: "yes" }
    evidence: "Database is not publicly reachable and all connections are encrypted in transit."
    remediation: "Place the database in a private subnet; set ssl=on in postgresql.conf."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.7"
      title: "Restrictions on Information Transmission"
      severity: MEDIUM
      description: "The transmission and movement of information is limited to authorised users."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: tls_enforced, op: eq, value: "yes" }
    evidence: "TLS/SSL ensures all data in transit is encrypted between client and server."
    remediation: "Set ssl=on and ssl_min_protocol_version=TLSv1.2 in postgresql.conf."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC7.2"
      title: "Evaluates Security Events"
      severity: MEDIUM
      description: "The entity monitors system components and the operation of those controls on an ongoing basis."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: audit_logging, op: eq, value: "yes" }
    evidence: "pgaudit provides session and object-level audit logging for compliance evidence."
    remediation: "Install and configure the pgaudit extension; ship logs to a centralised SIEM."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.3"
      title: "Information Access Restriction"
      severity: HIGH
      description: "Access to information and application system functions shall be restricted in accordance with the access control policy."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: rbac_enabled, op: eq, value: "yes" }
    evidence: "Fine-grained GRANT/REVOKE privileges and role hierarchies enforce least-privilege access."
    remediation: "Audit all GRANT statements and remove excessive privileges; review pg_roles."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.24"
      title: "Use of Cryptography"
      severity: HIGH
      description: "Rules for the effective use of cryptography shall be defined and implemented."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: encryption_at_rest, op: eq, value: "yes" }
        - { signal: tls_enforced, op: eq, value: "yes" }
    evidence: "Data at rest encrypted via pgcrypto or cloud-managed AES-256; data in transit via TLS."
    remediation: "Enable filesystem-level encryption or pgcrypto; enforce TLS on all connections."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.14"
      title: "Redundancy of Information Processing"
      severity: MEDIUM
      description: "Information processing facilities shall be implemented with sufficient redundancy."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: backup_enabled, op: eq, value: "yes" }
        - { signal: backup_retention, op: "in", value: ["7_30d", "30_90d", "gt_90d"] }
    evidence: "Automated backups with sufficient retention provide recovery capability."
    remediation: "Enable automated backups with at least 7-day retention; test restore procedures."
"""

TECH_FILES['redis.yaml'] = """\
slug: redis
name: Redis
category: cache
vendor: Redis Ltd.
is_managed_available: true
logo_url: /logos/redis.svg

config_questions:
  - signal_key: auth_enabled
    question: "Is authentication (password or ACL) enabled?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 1
  - signal_key: tls_enabled
    question: "Is TLS enabled for client connections?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 2
  - signal_key: network_isolated
    question: "Is Redis accessible only within a private network or VPC?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 3
  - signal_key: persistence_mode
    question: "What persistence mode is enabled?"
    input_type: radio
    applies_to_modes: [managed, self-hosted, on-prem]
    options:
      - { value: none, label: "No persistence (cache only)" }
      - { value: rdb, label: "RDB snapshots" }
      - { value: aof, label: "AOF (append-only file)" }
      - { value: rdb_aof, label: "RDB + AOF" }
    order_index: 4
  - signal_key: stores_pii
    question: "Does Redis store or cache personally identifiable information?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 5
  - signal_key: acl_enabled
    question: "Are ACL rules configured to restrict keyspace access by user?"
    input_type: toggle
    applies_to_modes: [managed, self-hosted, on-prem]
    order_index: 6

control_mappings:
  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.1"
      title: "Logical and Physical Access Controls"
      severity: HIGH
      description: "The entity implements logical access security software and architectures over protected information assets."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: auth_enabled, op: eq, value: "yes" }
        - { signal: acl_enabled, op: eq, value: "yes" }
    evidence: "Redis AUTH and ACL rules restrict access to the keyspace by user and command."
    remediation: "Enable requirepass or ACLs in redis.conf; grant only necessary command permissions per user."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.6"
      title: "Logical Access - External Threats"
      severity: HIGH
      description: "Logical access security measures restrict access from outside the system boundary."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: network_isolated, op: eq, value: "yes" }
        - { signal: tls_enabled, op: eq, value: "yes" }
    evidence: "Redis is isolated within a private network and all connections are encrypted."
    remediation: "Bind Redis to a private IP; enable tls-port and supply cert/key in redis.conf."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.7"
      title: "Restrictions on Information Transmission"
      severity: MEDIUM
      description: "The transmission and movement of information is limited to authorised users."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: tls_enabled, op: eq, value: "yes" }
    evidence: "TLS encrypts all data transmitted between Redis clients and the server."
    remediation: "Configure tls-port and tls-cert-file/tls-key-file in redis.conf."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.3"
      title: "Information Access Restriction"
      severity: HIGH
      description: "Access to information and application system functions shall be restricted in accordance with the access control policy."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: auth_enabled, op: eq, value: "yes" }
    evidence: "Redis AUTH with strong credentials prevents unauthorised access."
    remediation: "Set a strong requirepass value; rotate credentials regularly."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.24"
      title: "Use of Cryptography"
      severity: HIGH
      description: "Rules for the effective use of cryptography shall be defined and implemented."
    conditions:
      logic: AND
      managed_auto_pass: true
      rules:
        - { signal: tls_enabled, op: eq, value: "yes" }
    evidence: "TLS encrypts all Redis traffic in transit."
    remediation: "Enable TLS on the Redis port and enforce TLS minimum version TLSv1.2."
"""

TECH_FILES['aws-ec2.yaml'] = """\
slug: aws-ec2
name: AWS EC2
category: cloud
vendor: Amazon Web Services
is_managed_available: false
logo_url: /logos/aws-ec2.svg

config_questions:
  - signal_key: imds_v2_enforced
    question: "Is IMDSv2 (instance metadata service v2) enforced on all instances?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 1
  - signal_key: security_groups_restrict_ssh
    question: "Do security groups restrict SSH access to trusted IPs only?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 2
  - signal_key: ebs_encrypted
    question: "Are EBS volumes encrypted at rest?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 3
  - signal_key: vpc_isolated
    question: "Are instances deployed in a private VPC subnet?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 4
  - signal_key: iam_role_attached
    question: "Do instances use IAM instance roles instead of long-lived credentials?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 5
  - signal_key: cloudtrail_enabled
    question: "Is AWS CloudTrail enabled for API activity logging?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 6
  - signal_key: patch_management
    question: "Is automated patch management in place (e.g. AWS Systems Manager)?"
    input_type: toggle
    applies_to_modes: [managed]
    order_index: 7

control_mappings:
  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.1"
      title: "Logical and Physical Access Controls"
      severity: HIGH
      description: "The entity implements logical access security software and architectures over protected information assets."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: iam_role_attached, op: eq, value: "yes" }
        - { signal: security_groups_restrict_ssh, op: eq, value: "yes" }
    evidence: "IAM instance roles with least-privilege policies and restricted SSH access control logical access."
    remediation: "Attach IAM roles instead of embedding credentials; limit SSH to bastion hosts or Systems Manager Session Manager."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.6"
      title: "Logical Access - External Threats"
      severity: HIGH
      description: "Logical access security measures restrict access from outside the system boundary."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: vpc_isolated, op: eq, value: "yes" }
        - { signal: security_groups_restrict_ssh, op: eq, value: "yes" }
    evidence: "Instances are in a private VPC subnet with restrictive security groups."
    remediation: "Move instances to private subnets; restrict all inbound traffic to minimum necessary ports and sources."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC7.2"
      title: "Evaluates Security Events"
      severity: MEDIUM
      description: "The entity monitors system components and the operation of those controls on an ongoing basis."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: cloudtrail_enabled, op: eq, value: "yes" }
    evidence: "CloudTrail records all AWS API calls for audit and incident investigation."
    remediation: "Enable CloudTrail in all regions; forward logs to CloudWatch Logs or a SIEM."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.8"
      title: "Prevents Unauthorised or Malicious Software"
      severity: MEDIUM
      description: "The entity implements controls to prevent or detect and act upon introduction of authorised software."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: imds_v2_enforced, op: eq, value: "yes" }
        - { signal: patch_management, op: eq, value: "yes" }
    evidence: "IMDSv2 prevents SSRF-based metadata exfiltration; automated patching reduces known vulnerability exposure."
    remediation: "Enforce IMDSv2 via instance metadata options; configure AWS Systems Manager Patch Manager."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.24"
      title: "Use of Cryptography"
      severity: HIGH
      description: "Rules for the effective use of cryptography shall be defined and implemented."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: ebs_encrypted, op: eq, value: "yes" }
    evidence: "EBS encryption with AWS-managed or customer-managed KMS keys protects data at rest."
    remediation: "Enable EBS default encryption in the AWS account; use AWS KMS CMK for sensitive workloads."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.9"
      title: "Configuration Management"
      severity: MEDIUM
      description: "Configurations, including security configurations, shall be established, documented, implemented, monitored, and reviewed."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: patch_management, op: eq, value: "yes" }
        - { signal: imds_v2_enforced, op: eq, value: "yes" }
    evidence: "Automated patching and IMDSv2 enforcement represent active configuration management."
    remediation: "Use AWS Config rules to detect drift; integrate Systems Manager State Manager for baseline enforcement."
"""

TECH_FILES['terraform.yaml'] = """\
slug: terraform
name: Terraform
category: iac
vendor: HashiCorp
is_managed_available: false
logo_url: /logos/terraform.svg

config_questions:
  - signal_key: state_encrypted
    question: "Is Terraform state encrypted at rest?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 1
  - signal_key: state_backend
    question: "Where is Terraform state stored?"
    input_type: radio
    applies_to_modes: [self-hosted, on-prem]
    options:
      - { value: local, label: "Local filesystem (not recommended)" }
      - { value: s3, label: "S3 (or compatible) with locking" }
      - { value: terraform_cloud, label: "Terraform Cloud / HCP Terraform" }
      - { value: gcs, label: "Google Cloud Storage" }
    order_index: 2
  - signal_key: secrets_in_code
    question: "Are secrets or credentials hardcoded in .tf files or checked into version control?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 3
  - signal_key: modules_pinned
    question: "Are all module and provider versions pinned?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 4
  - signal_key: plan_reviewed
    question: "Are all terraform plan outputs reviewed before apply (e.g. in a PR workflow)?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 5

control_mappings:
  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC8.1"
      title: "Change Management"
      severity: MEDIUM
      description: "The entity authorises, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: plan_reviewed, op: eq, value: "yes" }
        - { signal: modules_pinned, op: eq, value: "yes" }
    evidence: "PR-based plan review and pinned versions enforce a controlled change management workflow."
    remediation: "Integrate Terraform in CI with required plan review; pin all providers and modules with version constraints and lockfile."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.1"
      title: "Logical and Physical Access Controls"
      severity: HIGH
      description: "The entity implements logical access security software and architectures over protected information assets."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: secrets_in_code, op: eq, value: "no" }
    evidence: "No credentials or secrets are stored in Terraform code or state in plaintext."
    remediation: "Use environment variables, Vault, AWS Secrets Manager, or Terraform Cloud variable sets for all secrets."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.9"
      title: "Configuration Management"
      severity: MEDIUM
      description: "Configurations shall be established, documented, implemented, monitored, and reviewed."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: state_backend, op: neq, value: "local" }
        - { signal: state_encrypted, op: eq, value: "yes" }
    evidence: "Remote state with encryption provides a single source of truth for infrastructure configuration."
    remediation: "Migrate state to a remote backend (S3, Terraform Cloud) with encryption and state locking enabled."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.25"
      title: "Secure Development Life Cycle"
      severity: MEDIUM
      description: "Rules for the secure development of software and systems shall be established and applied."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: plan_reviewed, op: eq, value: "yes" }
        - { signal: secrets_in_code, op: eq, value: "no" }
    evidence: "Plan reviews in PRs and no secrets in code meet secure IaC development practices."
    remediation: "Enforce IaC scanning (e.g. Checkov, tfsec) in CI; require plan approval for all infrastructure changes."
"""

TECH_FILES['docker.yaml'] = """\
slug: docker
name: Docker
category: container
vendor: Docker Inc.
is_managed_available: false
logo_url: /logos/docker.svg

config_questions:
  - signal_key: base_image_pinned
    question: "Are base images referenced by digest or pinned tag (not :latest)?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 1
  - signal_key: runs_as_root
    question: "Do containers run as root (UID 0)?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 2
  - signal_key: image_scanning_enabled
    question: "Are container images scanned for known vulnerabilities (e.g. Trivy, Snyk)?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 3
  - signal_key: secrets_in_image
    question: "Are secrets or credentials baked into Docker images or layers?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 4
  - signal_key: registry_private
    question: "Are images stored in a private container registry?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 5
  - signal_key: read_only_filesystem
    question: "Do containers run with a read-only root filesystem?"
    input_type: toggle
    applies_to_modes: [self-hosted, on-prem]
    order_index: 6

control_mappings:
  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.8"
      title: "Prevents Unauthorised or Malicious Software"
      severity: MEDIUM
      description: "The entity implements controls to prevent or detect and act upon introduction of unauthorised software."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: image_scanning_enabled, op: eq, value: "yes" }
        - { signal: base_image_pinned, op: eq, value: "yes" }
    evidence: "Image scanning detects known CVEs before deployment; pinned base images prevent unexpected changes."
    remediation: "Add Trivy or Snyk to your CI pipeline; change FROM directives to use SHA256 digests or version-pinned tags."

  - framework:
      slug: soc2
      name: "SOC 2 Type II"
    control:
      ref: "CC6.1"
      title: "Logical and Physical Access Controls"
      severity: HIGH
      description: "The entity implements logical access security software and architectures over protected information assets."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: runs_as_root, op: eq, value: "no" }
        - { signal: secrets_in_image, op: eq, value: "no" }
    evidence: "Non-root containers and no embedded secrets limit blast radius of a container escape."
    remediation: "Add a USER directive in Dockerfile; pass secrets via environment variables or secrets mounts at runtime."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.9"
      title: "Configuration Management"
      severity: MEDIUM
      description: "Configurations shall be established, documented, implemented, monitored, and reviewed."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: base_image_pinned, op: eq, value: "yes" }
        - { signal: registry_private, op: eq, value: "yes" }
    evidence: "Pinned base images and a private registry ensure reproducible, controlled builds."
    remediation: "Enable image signing and use a private registry; pin all FROM references; audit build logs."

  - framework:
      slug: iso27001
      name: "ISO/IEC 27001:2022"
    control:
      ref: "A.8.3"
      title: "Information Access Restriction"
      severity: HIGH
      description: "Access to information and application system functions shall be restricted in accordance with the access control policy."
    conditions:
      logic: AND
      managed_auto_pass: false
      rules:
        - { signal: runs_as_root, op: eq, value: "no" }
        - { signal: read_only_filesystem, op: eq, value: "yes" }
    evidence: "Non-root containers with read-only filesystems limit access to the underlying host."
    remediation: "Set securityContext.runAsNonRoot in Kubernetes or '--user' in docker run; add --read-only flag."
"""

# ─────────────────────────────────────────────────────────────────────────────
# TEMPLATE YAML FILES (T-031b) — 8 templates
# ─────────────────────────────────────────────────────────────────────────────

TMPL_FILES = {}

TMPL_FILES['indie-fly-stack.yaml'] = """\
slug: indie-fly-stack
name: "Indie / Fly.io Stack"
description: "Solo founders and small teams on Fly.io with Neon Postgres + Upstash Redis"
use_case: "Startups, indie hackers, early-stage products"
data_scopes: [pii]
preview_tech_slugs: [neon-postgresql, upstash-redis, docker, github-actions]
items:
  - technology_slug: postgresql
    deployment_mode: managed
    config_answers:
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "7_30d"
      rbac_enabled: "not_sure"
      audit_logging: "not_sure"
  - technology_slug: redis
    deployment_mode: managed
    config_answers:
      auth_enabled: "yes"
      tls_enabled: "yes"
      network_isolated: "yes"
      stores_pii: "not_sure"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "not_sure"
      runs_as_root: "not_sure"
      image_scanning_enabled: "no"
      secrets_in_image: "not_sure"
      registry_private: "no"
      read_only_filesystem: "no"
"""

TMPL_FILES['aws-startup-stack.yaml'] = """\
slug: aws-startup-stack
name: "AWS Startup Stack"
description: "Modern AWS stack for Series A startups: RDS, ElastiCache, EC2, Terraform"
use_case: "Series A / B funded startups on AWS looking for SOC 2 readiness"
data_scopes: [pii, financial]
preview_tech_slugs: [postgresql, redis, aws-ec2, terraform, docker]
items:
  - technology_slug: postgresql
    deployment_mode: managed
    config_answers:
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "30_90d"
      rbac_enabled: "yes"
      audit_logging: "not_sure"
  - technology_slug: redis
    deployment_mode: managed
    config_answers:
      auth_enabled: "yes"
      tls_enabled: "yes"
      network_isolated: "yes"
      stores_pii: "not_sure"
      acl_enabled: "not_sure"
  - technology_slug: aws-ec2
    deployment_mode: managed
    config_answers:
      imds_v2_enforced: "not_sure"
      security_groups_restrict_ssh: "not_sure"
      ebs_encrypted: "not_sure"
      vpc_isolated: "yes"
      iam_role_attached: "not_sure"
      cloudtrail_enabled: "not_sure"
      patch_management: "not_sure"
  - technology_slug: terraform
    deployment_mode: self-hosted
    config_answers:
      state_encrypted: "not_sure"
      state_backend: "s3"
      secrets_in_code: "not_sure"
      modules_pinned: "not_sure"
      plan_reviewed: "not_sure"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "not_sure"
      runs_as_root: "not_sure"
      image_scanning_enabled: "not_sure"
      secrets_in_image: "not_sure"
      registry_private: "yes"
      read_only_filesystem: "not_sure"
"""

TMPL_FILES['self-hosted-postgres.yaml'] = """\
slug: self-hosted-postgres
name: "Self-Hosted PostgreSQL Stack"
description: "On-premises or self-hosted PostgreSQL with Docker and Terraform"
use_case: "Teams with data residency requirements or on-prem data centres"
data_scopes: [pii]
preview_tech_slugs: [postgresql, terraform, docker]
items:
  - technology_slug: postgresql
    deployment_mode: self-hosted
    config_answers:
      encryption_at_rest: "not_sure"
      tls_enforced: "not_sure"
      publicly_accessible: "no"
      backup_enabled: "not_sure"
      backup_retention: "not_sure"
      rbac_enabled: "not_sure"
      audit_logging: "not_sure"
  - technology_slug: terraform
    deployment_mode: self-hosted
    config_answers:
      state_encrypted: "not_sure"
      state_backend: "local"
      secrets_in_code: "not_sure"
      modules_pinned: "not_sure"
      plan_reviewed: "not_sure"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "not_sure"
      runs_as_root: "not_sure"
      image_scanning_enabled: "not_sure"
      secrets_in_image: "not_sure"
      registry_private: "not_sure"
      read_only_filesystem: "not_sure"
"""

TMPL_FILES['minimal-saas.yaml'] = """\
slug: minimal-saas
name: "Minimal SaaS Stack"
description: "Lean SaaS setup with managed Postgres and Redis — perfect for getting SOC 2 basics right"
use_case: "Early-stage SaaS products wanting a compliance baseline fast"
data_scopes: [pii]
preview_tech_slugs: [postgresql, redis]
items:
  - technology_slug: postgresql
    deployment_mode: managed
    config_answers:
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "7_30d"
      rbac_enabled: "not_sure"
      audit_logging: "not_sure"
  - technology_slug: redis
    deployment_mode: managed
    config_answers:
      auth_enabled: "yes"
      tls_enabled: "yes"
      network_isolated: "yes"
      stores_pii: "not_sure"
      acl_enabled: "not_sure"
"""

TMPL_FILES['docker-compose-startup.yaml'] = """\
slug: docker-compose-startup
name: "Docker Compose Startup"
description: "Small team running Docker Compose on a single server with Postgres and Redis"
use_case: "Bootstrapped startups or contractor teams with a single VPS"
data_scopes: [pii]
preview_tech_slugs: [postgresql, redis, docker]
items:
  - technology_slug: postgresql
    deployment_mode: self-hosted
    config_answers:
      encryption_at_rest: "not_sure"
      tls_enforced: "not_sure"
      publicly_accessible: "not_sure"
      backup_enabled: "not_sure"
      backup_retention: "not_sure"
      rbac_enabled: "not_sure"
      audit_logging: "not_sure"
  - technology_slug: redis
    deployment_mode: self-hosted
    config_answers:
      auth_enabled: "not_sure"
      tls_enabled: "not_sure"
      network_isolated: "not_sure"
      persistence_mode: "not_sure"
      stores_pii: "not_sure"
      acl_enabled: "not_sure"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "not_sure"
      runs_as_root: "not_sure"
      image_scanning_enabled: "no"
      secrets_in_image: "not_sure"
      registry_private: "no"
      read_only_filesystem: "not_sure"
"""

TMPL_FILES['aws-enterprise.yaml'] = """\
slug: aws-enterprise
name: "AWS Enterprise Stack"
description: "Full AWS enterprise stack with EC2, RDS, ElastiCache, Terraform IaC, and Docker containers"
use_case: "Enterprise teams or late-stage startups pursuing ISO 27001 or SOC 2 Type II"
data_scopes: [pii, financial, phi]
preview_tech_slugs: [postgresql, redis, aws-ec2, terraform, docker]
items:
  - technology_slug: postgresql
    deployment_mode: managed
    config_answers:
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "gt_90d"
      rbac_enabled: "yes"
      audit_logging: "yes"
  - technology_slug: redis
    deployment_mode: managed
    config_answers:
      auth_enabled: "yes"
      tls_enabled: "yes"
      network_isolated: "yes"
      stores_pii: "not_sure"
      acl_enabled: "yes"
  - technology_slug: aws-ec2
    deployment_mode: managed
    config_answers:
      imds_v2_enforced: "yes"
      security_groups_restrict_ssh: "yes"
      ebs_encrypted: "yes"
      vpc_isolated: "yes"
      iam_role_attached: "yes"
      cloudtrail_enabled: "yes"
      patch_management: "not_sure"
  - technology_slug: terraform
    deployment_mode: self-hosted
    config_answers:
      state_encrypted: "yes"
      state_backend: "s3"
      secrets_in_code: "no"
      modules_pinned: "yes"
      plan_reviewed: "yes"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "yes"
      runs_as_root: "no"
      image_scanning_enabled: "yes"
      secrets_in_image: "no"
      registry_private: "yes"
      read_only_filesystem: "not_sure"
"""

TMPL_FILES['on-prem-hardened.yaml'] = """\
slug: on-prem-hardened
name: "On-Premises Hardened Stack"
description: "Hardened on-premises deployment for air-gapped or regulated environments"
use_case: "Government, defence, or healthcare organisations with strict data residency requirements"
data_scopes: [pii, phi]
preview_tech_slugs: [postgresql, redis, docker, terraform]
items:
  - technology_slug: postgresql
    deployment_mode: on-prem
    config_answers:
      encryption_at_rest: "yes"
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "gt_90d"
      rbac_enabled: "yes"
      audit_logging: "yes"
  - technology_slug: redis
    deployment_mode: on-prem
    config_answers:
      auth_enabled: "yes"
      tls_enabled: "yes"
      network_isolated: "yes"
      persistence_mode: "rdb_aof"
      stores_pii: "not_sure"
      acl_enabled: "yes"
  - technology_slug: docker
    deployment_mode: on-prem
    config_answers:
      base_image_pinned: "yes"
      runs_as_root: "no"
      image_scanning_enabled: "yes"
      secrets_in_image: "no"
      registry_private: "yes"
      read_only_filesystem: "yes"
  - technology_slug: terraform
    deployment_mode: on-prem
    config_answers:
      state_encrypted: "yes"
      state_backend: "s3"
      secrets_in_code: "no"
      modules_pinned: "yes"
      plan_reviewed: "yes"
"""

TMPL_FILES['greenfield-iso27001.yaml'] = """\
slug: greenfield-iso27001
name: "Greenfield ISO 27001 Stack"
description: "New product stack designed from day one for ISO 27001 compliance"
use_case: "New products in regulated industries (fintech, healthtech) starting ISO 27001"
data_scopes: [pii, financial]
preview_tech_slugs: [postgresql, aws-ec2, terraform, docker]
items:
  - technology_slug: postgresql
    deployment_mode: managed
    config_answers:
      tls_enforced: "yes"
      publicly_accessible: "no"
      backup_enabled: "yes"
      backup_retention: "30_90d"
      rbac_enabled: "yes"
      audit_logging: "yes"
  - technology_slug: aws-ec2
    deployment_mode: managed
    config_answers:
      imds_v2_enforced: "yes"
      security_groups_restrict_ssh: "yes"
      ebs_encrypted: "yes"
      vpc_isolated: "yes"
      iam_role_attached: "yes"
      cloudtrail_enabled: "yes"
      patch_management: "not_sure"
  - technology_slug: terraform
    deployment_mode: self-hosted
    config_answers:
      state_encrypted: "yes"
      state_backend: "s3"
      secrets_in_code: "no"
      modules_pinned: "yes"
      plan_reviewed: "yes"
  - technology_slug: docker
    deployment_mode: self-hosted
    config_answers:
      base_image_pinned: "yes"
      runs_as_root: "no"
      image_scanning_enabled: "yes"
      secrets_in_image: "no"
      registry_private: "yes"
      read_only_filesystem: "not_sure"
"""

# ─────────────────────────────────────────────────────────────────────────────
# Write files
# ─────────────────────────────────────────────────────────────────────────────

for filename, content in TECH_FILES.items():
    path = os.path.join(TECH_DIR, filename)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {path}")

for filename, content in TMPL_FILES.items():
    path = os.path.join(TMPL_DIR, filename)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {path}")

print("ALL DONE")
