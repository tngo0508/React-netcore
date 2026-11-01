// AZ-900 skills outline, drawn as a transit map: each exam area is a line,
// each topic a station. Weightings follow the published AZ-900 study guide.

export type LineId = 'cloud' | 'arch' | 'gov'

export type Line = {
  id: LineId
  letter: string
  name: string
  weight: string
  color: string
}

export type Station = {
  id: string
  line: LineId
  name: string
  summary: string
  tip: string
}

export const lines: Line[] = [
  { id: 'cloud', letter: 'C', name: 'Cloud concepts', weight: '25–30%', color: '#D39200' },
  { id: 'arch', letter: 'A', name: 'Architecture and services', weight: '35–40%', color: '#0E7C6B' },
  { id: 'gov', letter: 'M', name: 'Management and governance', weight: '30–35%', color: '#6A4BC4' },
]

export const stations: Station[] = [
  // Cloud concepts
  {
    id: 'cloud-computing', line: 'cloud', name: 'Cloud computing',
    summary: 'Renting compute, storage, networking, and software over the internet instead of owning the hardware.',
    tip: 'You pay for what you use, and the provider runs the physical datacenter.',
  },
  {
    id: 'shared-responsibility', line: 'cloud', name: 'Shared responsibility',
    summary: 'Security duties are split between you and Microsoft, and the split shifts with the service type.',
    tip: 'You always own your data, devices, and accounts. Microsoft always owns the physical datacenter, network, and hosts.',
  },
  {
    id: 'public-cloud', line: 'cloud', name: 'Public cloud',
    summary: 'Infrastructure owned and run by a provider and shared by many customers.',
    tip: 'No CapEx to scale up, and you get services fast, but you have less control over the hardware.',
  },
  {
    id: 'private-cloud', line: 'cloud', name: 'Private cloud',
    summary: 'Cloud infrastructure used by one organization, in its own datacenter or one hosted for it.',
    tip: 'Most control, but you buy and maintain the hardware yourself.',
  },
  {
    id: 'hybrid-cloud', line: 'cloud', name: 'Hybrid cloud',
    summary: 'Public and private clouds connected so workloads can move between them.',
    tip: 'A common exam pick when a company must keep some data on-premises for compliance.',
  },
  {
    id: 'multi-cloud', line: 'cloud', name: 'Multi-cloud',
    summary: 'Using more than one public cloud provider at the same time.',
    tip: 'Azure Arc is the Azure service that manages resources across clouds and on-premises.',
  },
  {
    id: 'consumption', line: 'cloud', name: 'Consumption-based model',
    summary: 'You pay only for the resources you use, with no upfront cost.',
    tip: 'Cloud spending is operational expenditure (OpEx); buying servers is capital expenditure (CapEx).',
  },
  {
    id: 'ha-scale', line: 'cloud', name: 'High availability and scalability',
    summary: 'Availability keeps a service up despite failures (measured by its SLA). Scalability adds or removes resources to meet demand.',
    tip: 'Vertical scaling adds power to one machine; horizontal scaling adds more machines. Elasticity means scaling automatically.',
  },
  {
    id: 'reliability', line: 'cloud', name: 'Reliability and predictability',
    summary: 'Reliability is recovering from failure. Predictability covers both performance and cost you can forecast.',
    tip: 'Autoscaling and load balancing support performance predictability; cost tools support cost predictability.',
  },
  {
    id: 'security-gov', line: 'cloud', name: 'Security and governance',
    summary: 'Cloud platforms offer templates, policies, and patching to keep resources compliant and secure.',
    tip: 'With PaaS and SaaS, the provider patches the OS for you.',
  },
  {
    id: 'manageability', line: 'cloud', name: 'Manageability',
    summary: 'Management of the cloud (scaling, monitoring) and in the cloud (portal, CLI, APIs, templates).',
    tip: 'Know the two meanings: managing resources, and the tools you manage them with.',
  },
  {
    id: 'iaas', line: 'cloud', name: 'IaaS',
    summary: 'Infrastructure as a service: you rent virtual machines, storage, and networks and manage the OS upward.',
    tip: 'Most flexible and the most customer responsibility. Example: Azure Virtual Machines.',
  },
  {
    id: 'paas', line: 'cloud', name: 'PaaS',
    summary: 'Platform as a service: the provider runs the OS and runtime; you bring the app and data.',
    tip: 'Example: Azure App Service. Good when developers just want to deploy code.',
  },
  {
    id: 'saas', line: 'cloud', name: 'SaaS',
    summary: 'Software as a service: a finished app you use, such as Microsoft 365.',
    tip: 'Least customer responsibility, but you still own your data, devices, and accounts.',
  },

  // Architecture and services
  {
    id: 'regions', line: 'arch', name: 'Regions',
    summary: 'A geographic area with one or more datacenters connected by a low-latency network.',
    tip: 'Some services and VM sizes are only available in certain regions.',
  },
  {
    id: 'region-pairs', line: 'arch', name: 'Region pairs',
    summary: 'Most regions are paired with another region in the same geography, usually at least 300 miles away.',
    tip: 'During a broad outage, one region in each pair is prioritized for recovery, and platform updates roll out to one at a time.',
  },
  {
    id: 'sovereign', line: 'arch', name: 'Sovereign regions',
    summary: 'Instances of Azure isolated from the main cloud for legal or compliance reasons.',
    tip: 'Examples: Azure Government (US) and Azure operated by 21Vianet (China).',
  },
  {
    id: 'availability-zones', line: 'arch', name: 'Availability zones',
    summary: 'Physically separate datacenters within one region, each with its own power, cooling, and networking.',
    tip: 'A region with zones has at least three. Spread resources across zones to survive a datacenter failure.',
  },
  {
    id: 'resource-groups', line: 'arch', name: 'Resource groups',
    summary: 'A logical container for resources that share a lifecycle.',
    tip: 'Every resource is in exactly one resource group. Deleting the group deletes everything in it. Groups cannot be nested.',
  },
  {
    id: 'subscriptions', line: 'arch', name: 'Subscriptions',
    summary: 'A unit of billing and access control that holds resource groups.',
    tip: 'Use separate subscriptions to split billing (per department) or to set access boundaries.',
  },
  {
    id: 'management-groups', line: 'arch', name: 'Management groups',
    summary: 'Containers above subscriptions, so policies and access can be applied to many subscriptions at once.',
    tip: 'Settings applied to a management group are inherited by everything beneath it. They can nest up to six levels deep.',
  },
  {
    id: 'vms', line: 'arch', name: 'Virtual machines',
    summary: 'IaaS compute: full control over the OS and software.',
    tip: 'Scale sets run many identical, autoscaling VMs. Availability sets spread VMs across update and fault domains.',
  },
  {
    id: 'avd', line: 'arch', name: 'Azure Virtual Desktop',
    summary: 'Desktops and apps from Windows running in Azure, reachable from any device.',
    tip: 'Supports multi-session Windows 10 and 11, so many users can share one VM.',
  },
  {
    id: 'containers', line: 'arch', name: 'Containers',
    summary: 'Lightweight, portable app packages. Azure Container Instances runs single containers; AKS orchestrates many.',
    tip: 'Containers virtualize the OS; VMs virtualize the hardware.',
  },
  {
    id: 'functions', line: 'arch', name: 'Azure Functions',
    summary: 'Serverless code that runs in response to an event, billed per execution.',
    tip: 'Pick Functions when the work is short and triggered, like reacting to a file upload.',
  },
  {
    id: 'app-service', line: 'arch', name: 'App Service',
    summary: 'PaaS hosting for web apps, APIs, and mobile back ends.',
    tip: 'Handles OS patching, scaling, and deployment slots for you.',
  },
  {
    id: 'vnets', line: 'arch', name: 'Virtual networks',
    summary: 'Private networks in Azure that let resources talk to each other, the internet, and on-premises networks.',
    tip: 'Peering connects two VNets, even across regions, over the Microsoft backbone.',
  },
  {
    id: 'vpn-expressroute', line: 'arch', name: 'VPN Gateway and ExpressRoute',
    summary: 'VPN Gateway sends encrypted traffic over the public internet. ExpressRoute is a private connection that skips the internet.',
    tip: 'Need guaranteed speed or no internet traffic? ExpressRoute.',
  },
  {
    id: 'dns', line: 'arch', name: 'Azure DNS',
    summary: 'Hosts DNS domains on Azure infrastructure.',
    tip: 'Azure DNS hosts domains but does not sell domain names.',
  },
  {
    id: 'storage-accounts', line: 'arch', name: 'Storage accounts',
    summary: 'A unique namespace for Blob, Files, Queue, Table, and Disk storage.',
    tip: 'Blob for unstructured objects, Files for SMB/NFS shares, Queue for messages, Table for NoSQL key-value data.',
  },
  {
    id: 'redundancy', line: 'arch', name: 'Storage redundancy',
    summary: 'LRS (one datacenter), ZRS (three zones), GRS (copied to the paired region), GZRS (zones plus paired region).',
    tip: 'Data is always stored at least three times. RA-GRS and RA-GZRS also let you read from the secondary region.',
  },
  {
    id: 'access-tiers', line: 'arch', name: 'Blob access tiers',
    summary: 'Hot, cool, cold, and archive tiers trade storage cost against access cost.',
    tip: 'Archive is offline, so data must be rehydrated before you can read it, which can take hours.',
  },
  {
    id: 'migration', line: 'arch', name: 'Data migration',
    summary: 'Azure Migrate assesses and moves servers. Azure Data Box ships a physical device for very large datasets.',
    tip: 'AzCopy, Storage Explorer, and File Sync move files; Data Box is for when the network is too slow.',
  },
  {
    id: 'entra', line: 'arch', name: 'Microsoft Entra ID',
    summary: 'Cloud identity and access management (formerly Azure Active Directory).',
    tip: 'Supports SSO, MFA, and passwordless sign-in. Entra Domain Services adds managed domain join and LDAP.',
  },
  {
    id: 'conditional-access', line: 'arch', name: 'Conditional Access',
    summary: 'Policies that allow, block, or challenge sign-ins based on signals like user, location, and device.',
    tip: 'Example: require MFA only when someone signs in from an unfamiliar country.',
  },
  {
    id: 'rbac', line: 'arch', name: 'Azure RBAC',
    summary: 'Role-based access control: assign roles to users and groups at a scope.',
    tip: 'Roles are inherited down the hierarchy. RBAC controls who can do things; Azure Policy controls what can be done.',
  },
  {
    id: 'zero-trust', line: 'arch', name: 'Zero Trust',
    summary: 'Assume breach, verify explicitly, and use least-privilege access.',
    tip: 'Every request is verified, even from inside the corporate network.',
  },
  {
    id: 'defense-in-depth', line: 'arch', name: 'Defense in depth',
    summary: 'Layers of protection, from physical security through identity, perimeter, network, compute, application, and data.',
    tip: 'If one layer fails, the next one still slows down an attacker.',
  },
  {
    id: 'defender', line: 'arch', name: 'Microsoft Defender for Cloud',
    summary: 'Monitors security posture and detects threats across Azure, on-premises, and other clouds.',
    tip: 'Gives a secure score with recommendations to harden resources.',
  },

  // Management and governance
  {
    id: 'cost-factors', line: 'gov', name: 'Cost factors',
    summary: 'Resource type, usage, region, and data leaving Azure (egress) all affect what you pay.',
    tip: 'Data coming into Azure is free; data going out generally costs money.',
  },
  {
    id: 'calculators', line: 'gov', name: 'Pricing and TCO calculators',
    summary: 'The pricing calculator estimates Azure costs. The TCO calculator compares on-premises costs with Azure.',
    tip: 'Planning new Azure services? Pricing. Justifying a migration? TCO.',
  },
  {
    id: 'cost-management', line: 'gov', name: 'Cost Management',
    summary: 'Reports, budgets, and alerts for what you are actually spending.',
    tip: 'Budgets can trigger alerts or automated actions when spending hits a threshold.',
  },
  {
    id: 'tags', line: 'gov', name: 'Tags',
    summary: 'Name-value pairs on resources, used to organize, report costs, and automate.',
    tip: 'Tags are not inherited by default; Azure Policy can enforce or copy them.',
  },
  {
    id: 'purview', line: 'gov', name: 'Microsoft Purview',
    summary: 'Data governance, risk, and compliance across on-premises, multi-cloud, and SaaS data.',
    tip: 'Discovers and classifies sensitive data wherever it lives.',
  },
  {
    id: 'policy', line: 'gov', name: 'Azure Policy',
    summary: 'Rules that evaluate resources and can deny or fix ones that do not comply.',
    tip: 'Initiatives group related policies. Example: allow VMs only in certain regions.',
  },
  {
    id: 'locks', line: 'gov', name: 'Resource locks',
    summary: 'Stop accidental deletion (Delete lock) or any change (ReadOnly lock).',
    tip: 'Locks apply even to owners. You must remove the lock before deleting.',
  },
  {
    id: 'trust-portal', line: 'gov', name: 'Service Trust Portal',
    summary: 'Microsoft compliance reports, audits, and whitepapers.',
    tip: 'Go here for audit reports like ISO and SOC.',
  },
  {
    id: 'tools', line: 'gov', name: 'Portal, CLI, and PowerShell',
    summary: 'Ways to work with Azure: the web portal, Cloud Shell, Azure CLI, and Azure PowerShell.',
    tip: 'Cloud Shell runs in the browser with both CLI and PowerShell, nothing to install.',
  },
  {
    id: 'arc', line: 'gov', name: 'Azure Arc',
    summary: 'Manage servers, Kubernetes, and databases outside Azure as if they were Azure resources.',
    tip: 'The answer for consistent governance across hybrid and multi-cloud environments.',
  },
  {
    id: 'arm', line: 'gov', name: 'Resource Manager and templates',
    summary: 'ARM is the deployment and management layer behind every Azure tool. ARM templates and Bicep describe infrastructure as code.',
    tip: 'Templates are declarative: you describe what you want, not the steps to get there.',
  },
  {
    id: 'advisor', line: 'gov', name: 'Azure Advisor',
    summary: 'Personalized recommendations for reliability, security, performance, cost, and operational excellence.',
    tip: 'Advisor suggests; it does not change anything for you.',
  },
  {
    id: 'service-health', line: 'gov', name: 'Azure Service Health',
    summary: 'Tracks Azure outages, planned maintenance, and health advisories that affect your resources.',
    tip: 'Azure Status is everyone; Service Health is your services; Resource Health is one resource.',
  },
  {
    id: 'monitor', line: 'gov', name: 'Azure Monitor',
    summary: 'Collects metrics and logs. Includes Log Analytics, alerts, and Application Insights.',
    tip: 'Application Insights watches web app performance and usage.',
  },
]

// Dashed transfers between related stations on different lines.
export const transfers: [string, string][] = [
  ['iaas', 'vms'],
  ['paas', 'app-service'],
  ['ha-scale', 'availability-zones'],
  ['multi-cloud', 'arc'],
  ['consumption', 'cost-factors'],
  ['security-gov', 'policy'],
  ['manageability', 'tools'],
  ['subscriptions', 'cost-management'],
  ['management-groups', 'policy'],
  ['rbac', 'locks'],
]
