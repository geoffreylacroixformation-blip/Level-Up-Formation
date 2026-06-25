export interface Module {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  isFree: boolean;
  order: number;
  duration: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  longDescription: string;
  longDescriptionEn: string;
  level: 1 | 2 | 3;
  price: number;
  modules: Module[];
  image: string;
  tags: string[];
}

export const courses: Course[] = [
  {
    id: 'sec-fundamentals',
    slug: 'securite-fondamentaux',
    title: 'Securite informatique - Les fondamentaux',
    titleEn: 'IT Security - Fundamentals',
    description: 'Maitrisez les bases de la securite informatique et comprennez les menaces actuelles',
    descriptionEn: 'Master the basics of IT security and understand current threats',
    longDescription: "Cette formation vous donnera une vision complete des fondamentaux de la securite informatique. Vous apprendrez a identifier les menaces, comprendre les vecteurs d'attaque et mettre en place des mesures de protection efficaces. Ideal pour debuter dans la cybersecurity.",
    longDescriptionEn: 'This training will give you a complete overview of IT security fundamentals. You will learn to identify threats, understand attack vectors, and implement effective protection measures. Ideal for starting in cybersecurity.',
    level: 1,
    price: 49,
    image: 'https://images.pexels.com/photos/60504/security-hacker-black-background-60504.jpeg?w=800',
    tags: ['securite', 'reseaux', 'debutant'],
    modules: [
      { id: 'mod-0', title: 'Introduction a la securite', titleEn: 'Introduction to Security', description: 'Vue densemble du paysage de la securite informatique', descriptionEn: 'Overview of the IT security landscape', isFree: true, order: 0, duration: '30min' },
      { id: 'mod-1', title: 'Types de menaces', titleEn: 'Types of Threats', description: 'Malwares, phishing, ingenierie sociale et plus', descriptionEn: 'Malware, phishing, social engineering and more', isFree: false, order: 1, duration: '45min' },
      { id: 'mod-2', title: 'Reconnaissance reseau', titleEn: 'Network Reconnaissance', description: 'Comprendre TCP/IP et les protocoles reseau', descriptionEn: 'Understanding TCP/IP and network protocols', isFree: false, order: 2, duration: '1h' },
      { id: 'mod-3', title: 'Securite des mots de passe', titleEn: 'Password Security', description: 'Hachage, salage et bonnes pratiques', descriptionEn: 'Hashing, salting and best practices', isFree: false, order: 3, duration: '45min' },
      { id: 'mod-4', title: 'Introduction au chiffrement', titleEn: 'Introduction to Encryption', description: 'Symetrique, asymetrique et PKI', descriptionEn: 'Symmetric, asymmetric and PKI', isFree: false, order: 4, duration: '1h' },
    ]
  },
  {
    id: 'network-security',
    slug: 'securisation-reseaux',
    title: 'Securisation des reseaux dentreprise',
    titleEn: 'Enterprise Network Security',
    description: 'Concevez et securisez des infrastructures reseau professionnelles',
    descriptionEn: 'Design and secure professional network infrastructures',
    longDescription: "Plongez dans la securite reseau avancee. Cette formation couvre les pare-feux, les IDS/IPS, la segmentation reseau et les architectures Zero Trust. Pret pour des environnements d'entreprise.",
    longDescriptionEn: 'Dive into advanced network security. This training covers firewalls, IDS/IPS, network segmentation, and Zero Trust architectures. Ready for enterprise environments.',
    level: 2,
    price: 89,
    image: 'https://images.pexels.com/photos/114882/pexels-photo-114882.jpeg?w=800',
    tags: ['reseaux', 'firewall', 'infrastructure'],
    modules: [
      { id: 'mod-0', title: 'Architecture reseau securisee', titleEn: 'Secure Network Architecture', description: 'Principes de conception et zones de confiance', descriptionEn: 'Design principles and trust zones', isFree: true, order: 0, duration: '45min' },
      { id: 'mod-1', title: 'Configuration des pare-feux', titleEn: 'Firewall Configuration', description: 'Regles, politiques et bonnes pratiques', descriptionEn: 'Rules, policies and best practices', isFree: false, order: 1, duration: '1h30' },
      { id: 'mod-2', title: 'IDS et IPS', titleEn: 'IDS and IPS', description: "Detection et prevention d'intrusion", descriptionEn: 'Intrusion Detection and Prevention', isFree: false, order: 2, duration: '1h' },
      { id: 'mod-3', title: 'Segmentation et VLANs', titleEn: 'Segmentation and VLANs', description: 'Isolation et controle du trafic', descriptionEn: 'Isolation and traffic control', isFree: false, order: 3, duration: '1h' },
      { id: 'mod-4', title: 'VPN et tunnels securises', titleEn: 'VPN and Secure Tunnels', description: 'IPSec, OpenVPN et WireGuard', descriptionEn: 'IPSec, OpenVPN and WireGuard', isFree: false, order: 4, duration: '1h30' },
      { id: 'mod-5', title: 'Architecture Zero Trust', titleEn: 'Zero Trust Architecture', description: 'Mise en oeuvre pratique', descriptionEn: 'Practical implementation', isFree: false, order: 5, duration: '1h' },
    ]
  },
  {
    id: 'web-pentest',
    slug: 'pentest-web',
    title: 'Pentesting Web - Debutant a Expert',
    titleEn: 'Web Pentesting - Beginner to Expert',
    description: 'Apprenez a identifier et exploiter les vulnerabilites web',
    descriptionEn: 'Learn to identify and exploit web vulnerabilities',
    longDescription: "Devenir un expert en penetration testing web. Maitrisez OWASP Top 10, les outils professionnels et les techniques d'exploitation avancees. Labs pratiques sur des environnements dedies.",
    longDescriptionEn: 'Become an expert in web penetration testing. Master OWASP Top 10, professional tools, and advanced exploitation techniques. Practical labs on dedicated environments.',
    level: 3,
    price: 149,
    image: 'https://images.pexels.com/photos/5380643/pexels-photo-5380643.jpeg?w=800',
    tags: ['pentest', 'web', 'exploitation'],
    modules: [
      { id: 'mod-0', title: 'Methodologie du pentest', titleEn: 'Pentest Methodology', description: "Cycle de vie d'un audit de securite", descriptionEn: 'Security audit lifecycle', isFree: true, order: 0, duration: '45min' },
      { id: 'mod-1', title: 'OWASP Top 10 en detail', titleEn: 'OWASP Top 10 in Detail', description: 'Anatomie des vulnerabilites web critiques', descriptionEn: 'Anatomy of critical web vulnerabilities', isFree: false, order: 1, duration: '2h' },
      { id: 'mod-2', title: 'SQL Injection avancee', titleEn: 'Advanced SQL Injection', description: "Techniques d'injection et bypass", descriptionEn: 'Injection and bypass techniques', isFree: false, order: 2, duration: '1h30' },
      { id: 'mod-3', title: 'XSS et CSRF', titleEn: 'XSS and CSRF', description: 'Cross-site scripting et request forgery', descriptionEn: 'Cross-site scripting and request forgery', isFree: false, order: 3, duration: '1h30' },
      { id: 'mod-4', title: 'Outils Burp Suite', titleEn: 'Burp Suite Tools', description: 'Maitrise de la suite Burp', descriptionEn: 'Mastering Burp Suite', isFree: false, order: 4, duration: '2h' },
      { id: 'mod-5', title: 'Reporting professionnel', titleEn: 'Professional Reporting', description: "Redaction de rapports d'audit", descriptionEn: 'Writing audit reports', isFree: false, order: 5, duration: '1h' },
    ]
  },
  {
    id: 'linux-security',
    slug: 'linux-securite',
    title: 'Administration Linux securisee',
    titleEn: 'Secure Linux Administration',
    description: 'Maitrisez la securite des systemes Linux en environnement professionnel',
    descriptionEn: 'Master Linux system security in professional environments',
    longDescription: "Formation complete a l'administration securisee de Linux. Hardening systeme, gestion des utilisateurs, SELinux, conteneurisation securisee et surveillance.",
    longDescriptionEn: 'Complete training in secure Linux administration. System hardening, user management, SELinux, secure containerization, and monitoring.',
    level: 2,
    price: 89,
    image: 'https://images.pexels.com/photos/1089440/pexels-photo-1089440.jpeg?w=800',
    tags: ['linux', 'administration', 'hardening'],
    modules: [
      { id: 'mod-0', title: 'Introduction a Linux', titleEn: 'Introduction to Linux', description: 'Environnement et commandes de base', descriptionEn: 'Environment and basic commands', isFree: true, order: 0, duration: '45min' },
      { id: 'mod-1', title: 'Hardening du systeme', titleEn: 'System Hardening', description: 'Configurations securisees et services', descriptionEn: 'Secure configurations and services', isFree: false, order: 1, duration: '1h30' },
      { id: 'mod-2', title: 'Gestion des utilisateurs', titleEn: 'User Management', description: 'Permissions, sudo et PAM', descriptionEn: 'Permissions, sudo and PAM', isFree: false, order: 2, duration: '1h' },
      { id: 'mod-3', title: 'SELinux et AppArmor', titleEn: 'SELinux and AppArmor', description: "Controle d'acces mandataire", descriptionEn: 'Mandatory Access Control', isFree: false, order: 3, duration: '1h30' },
      { id: 'mod-4', title: 'Logs et surveillance', titleEn: 'Logs and Monitoring', description: 'Audit, journald et SIEM', descriptionEn: 'Audit, journald and SIEM', isFree: false, order: 4, duration: '1h' },
    ]
  },
  {
    id: 'osint-course',
    slug: 'osint-techniques',
    title: 'OSINT - Intelligence en sources ouvertes',
    titleEn: 'OSINT - Open Source Intelligence',
    description: "Techniques de collecte et analyse d'informations publiquement accessibles",
    descriptionEn: 'Techniques for collecting and analyzing publicly accessible information',
    longDescription: "Maitrisez l'art de l'intelligence en sources ouvertes. Outils de reconnaissance, techniques d'investigation numerique, analyse de metadonnees et footprinting.",
    longDescriptionEn: 'Master the art of open source intelligence. Reconnaissance tools, digital investigation techniques, metadata analysis, and footprinting.',
    level: 2,
    price: 89,
    image: 'https://images.pexels.com/photos/5380643/pexels-photo-5380643.jpeg?w=800',
    tags: ['osint', 'investigation', 'reconnaissance'],
    modules: [
      { id: 'mod-0', title: "Introduction a l'OSINT", titleEn: 'Introduction to OSINT', description: 'Principes et cadre legal', descriptionEn: 'Principles and legal framework', isFree: true, order: 0, duration: '30min' },
      { id: 'mod-1', title: 'Recherche avancee', titleEn: 'Advanced Search', description: 'Google dorks et moteurs specialises', descriptionEn: 'Google dorks and specialized engines', isFree: false, order: 1, duration: '1h' },
      { id: 'mod-2', title: 'Metadonnees et fichiers', titleEn: 'Metadata and Files', description: 'Exif, documents et traces numeriques', descriptionEn: 'Exif, documents and digital traces', isFree: false, order: 2, duration: '1h' },
      { id: 'mod-3', title: 'Reseaux sociaux', titleEn: 'Social Networks', description: 'Profiling et recoupement', descriptionEn: 'Profiling and cross-referencing', isFree: false, order: 3, duration: '1h30' },
      { id: 'mod-4', title: 'Outils OSINT', titleEn: 'OSINT Tools', description: 'Maltego, Shodan et autres', descriptionEn: 'Maltego, Shodan and others', isFree: false, order: 4, duration: '1h30' },
    ]
  },
  {
    id: 'malware-analysis',
    slug: 'analyse-malware',
    title: 'Analyse de malwares - Niveau expert',
    titleEn: 'Malware Analysis - Expert Level',
    description: 'Analyse statique et dynamique de codes malveillants',
    descriptionEn: 'Static and dynamic analysis of malicious code',
    longDescription: "Plongez dans l'analyse de malwares. Techniques de sandboxing, desassemblage, ingenierie inverse et creation de signatures. Pour experts uniquement.",
    longDescriptionEn: 'Dive into malware analysis. Sandboxing techniques, disassembly, reverse engineering, and signature creation. Experts only.',
    level: 3,
    price: 149,
    image: 'https://images.pexels.com/photos/60504/security-hacker-black-background-60504.jpeg?w=800',
    tags: ['malware', 'reverse-engineering', 'analyse'],
    modules: [
      { id: 'mod-0', title: 'Types de malwares', titleEn: 'Types of Malware', description: 'Classification et comportements typiques', descriptionEn: 'Classification and typical behaviors', isFree: true, order: 0, duration: '45min' },
      { id: 'mod-1', title: 'Analyse statique', titleEn: 'Static Analysis', description: 'Strings, imports et indicateurs', descriptionEn: 'Strings, imports and indicators', isFree: false, order: 1, duration: '2h' },
      { id: 'mod-2', title: 'Analyse dynamique', titleEn: 'Dynamic Analysis', description: 'Sandboxing et surveillance systeme', descriptionEn: 'Sandboxing and system monitoring', isFree: false, order: 2, duration: '2h' },
      { id: 'mod-3', title: 'Desassemblage', titleEn: 'Disassembly', description: 'IDA Pro, Ghidra et assembleur', descriptionEn: 'IDA Pro, Ghidra and assembly', isFree: false, order: 3, duration: '2h' },
      { id: 'mod-4', title: 'Anti-analyse et bypass', titleEn: 'Anti-analysis and Bypass', description: "Techniques d'evasion et contournement", descriptionEn: 'Evasion techniques and bypassing', isFree: false, order: 4, duration: '2h' },
      { id: 'mod-5', title: 'Creation de signatures YARA', titleEn: 'YARA Signature Creation', description: 'Detection et partage', descriptionEn: 'Detection and sharing', isFree: false, order: 5, duration: '1h30' },
    ]
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug);
}

export function getCoursesByLevel(level: 1 | 2 | 3): Course[] {
  return courses.filter(c => c.level === level);
}

export const bundles = [
  {
    id: 'bundle-1-2',
    name: 'Pack LVL1 + LVL2',
    nameEn: 'Pack LVL1 + LVL2',
    description: 'Formations Niveau 1 et 2',
    descriptionEn: 'Level 1 and 2 courses',
    price: 119,
    levels: [1, 2],
  },
  {
    id: 'all-access',
    name: 'Pass All Access',
    nameEn: 'All Access Pass',
    description: 'Acces a toutes les formations',
    descriptionEn: 'Access to all courses',
    price: 249,
    levels: [1, 2, 3],
  },
];
