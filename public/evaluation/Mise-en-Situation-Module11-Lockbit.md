# ÉVALUATION 6 : MISE EN SITUATION PROFESSIONNELLE — MODULE 11 (Analyse de Rapport et Communication)

## Notation : /20 points

**Durée : 120 minutes | Projet professionnel complet**

---

## SCÉNARIO : LockBit 3.0 — Attaque sur un groupe hospitalier

### Contexte professionnelle

Vous êtes **Responsable de l'analyse malware** au sein du CERT d'un groupe hospitalier privé (8 000 employés, 3 sites). Le directeur général vous sollicite après la découverte d'une attaque par ransomware LockBit 3.0 qui a touché le système d'information principal.

### Briefing de situation (réunion de crise — 06h00) :

```
Situation actuelle :
- Ransomware LockBit 3.0 détecté sur 47 postes et 3 serveurs
- Message de rançon : "Your data is stolen and encrypted. 
  Contact us within 72 hours or data will be published."
- Demande : 50 Bitcoin (≈ 3.2M€)
- Fichiers chiffrés : extension ".lockbit3"
- Fuite confirmée : 12 GB de données exfiltrées (base patients, 
  données cliniques, résultats d'analyses)
- Systèmes touchés : SIH (Système d'Information Hospitalier), 
  laboratoire, imagerie médicale (PACS)
- Systèmes épargnés : bloc opératoire, réanimation (segmentation)
- Sauvegardes : partiellement compromises (2 des 3 copies)
- Délai de restauration estimé : 5-7 jours minimum
```

### Éléments techniques fournis :

**Échantillon du ransomware** :
- Hash : `f4e5d6c7b8a901234567890123456789abcdef0123456789abcdef012345`
- Taille : 284 KB
- Compiler : MinGW (gcc) sous Windows
- Technique : Chiffrement hybride (RSA-4096 + AES-256-CBC)
- Propagation : GPO compromise, PsExec, RDP avec vol de credentials
- Anti-détection : Process hollowing, living-off-the-land (WMI, PowerShell)
- C2 : Onion service Tor (.onion) + I2P

**Chronologie reconstituée** :
- J-14 : Compromission initiale via RDP exposé (port 3389)
- J-10 : Mouvement latéral, vol de credentials (Mimikatz)
- J-7 : Exfiltration massive (12 GB)
- J-3 : Préparation du déploiement (modification GPO)
- J-0 03:00 : Déploiement du ransomware
- J-0 03:15 : Alerte SOC
- J-0 06:00 : Réunion de crise

---

### Tâches à accomplir :

**Partie 1 — Analyse technique approfondie (7 pts)**

1.1. Réalisez l'analyse complète du ransomware LockBit 3.0 fourni (analyse statique et dynamique). Décrivez votre méthodologie et les outils utilisés.

1.2. Identifiez les failles de sécurité qui ont permis la compromission initiale et la propagation.

1.3. Proposez une analyse de la possibilité de récupérer les données chiffrées (existence de decryptor, faiblesse cryptographique, etc.).

---

**Partie 2 — Gestion de crise et communication (7 pts)**

2.1. Rédigez un plan de gestion de crise en 5 phases (détection, confinement, éradication, restauration, retour d'expérience).

2.2. Rédigez un communiqué de presse externe (communication de crise) à destination des médias et des patients.

2.3. Identifiez les obligations légales spécifiques au secteur santé (HDS, RGPD, ASIP Santé) et les délais associés.

---

**Partie 3 — Rapport final au COMEX (6 pts)**

Rédigez un rapport exécutif à destination du Comité Exécutif (COMEX) incluant :
- Synthèse de l'incident
- Impact business et clinique
- Coûts estimés
- Plan de remédiation à 90 jours
- Leçons apprises

---

## CORRECTION MISE EN SITUATION MODULE 11

### Partie 1 — Analyse technique (7 pts)

**1.1 Méthodologie d'analyse** (4 pts)

**Phase 1 : Analyse statique** (2 pts)
- Calcul des hash et recherche sur VirusTotal/MalwareBazaar
- Extraction des chaînes (strings, FLOSS) : URLs .onion, clés, commandes
- Analyse PE (PE-bear) : sections, imports, timestamp
- Désassemblage (Ghidra) : routine de chiffrement, génération de clés
- Recherche YARA : correspondance avec LockBit 3.0 connu
- Analyse des ressources : configuration embarquée, liste de cibles

**Phase 2 : Analyse dynamique** (2 pts)
- Exécution en sandbox isolée (Cape/Cuckoo)
- Capture réseau : C2 .onion, beaconing
- Surveillance processus : injection, process hollowing
- Surveillance registre : persistance, désactivation de sécurité
- Capture mémoire (Volatility) : clés en mémoire, injection
- Analyse du chiffrement : vérification AES/RSA, recherche de faiblesse

**1.2 Failles exploitées** (2 pts)

| Faille | Impact | Remédiation |
|--------|--------|-------------|
| RDP exposé (3389) | Point d'entrée initial | VPN obligatoire, restriction IP |
| Credentials faibles/volés | Élévation de privilèges | MFA, LAPS, Credential Guard |
| GPO compromise | Propagation du ransomware | Audit GPO, segmentation |
| Sauvegardes accessibles | Destruction des backups | Sauvegarde immuable (WORM) |
| Absence de segmentation | Propagation latérale | Micro-segmentation |

**1.3 Récupération** (1 pt)

- **Decryptor** : Vérifier NoMoreRansom.org, Europol, Kaspersky pour un decryptor LockBit existant
- **Faiblesse cryptographique** : LockBit 3.0 utilise RSA-4096 + AES-256 — pas de faille connue
- **Clé en mémoire** : Possibilité de récupérer la clé AES si le processus est encore actif (dump mémoire)
- **Sauvegardes** : Restaurer la 3ème copie non compromise
- **Recommandation** : Ne PAS payer la rançon (pas de garantie, financement du crime)

---

### Partie 2 — Gestion de crise (7 pts)

**2.1 Plan de gestion de crise** (4 pts)

| Phase | Actions | Délai |
|-------|---------|-------|
| 1. Détection | Confirmation de l'alerte, activation du PCS | 0-1h |
| 2. Confinement | Isolation réseau, blocage C2, désactivation comptes | 1-4h |
| 3. Éradication | Suppression du malware, réinitialisation credentials | 4-24h |
| 4. Restauration | Restauration depuis sauvegardes saines, vérification intégrité | 24-72h |
| 5. Retour d'expérience | Rapport final, mise à jour des procédures | J+30 |

**2.2 Communiqué de presse** (2 pts)

```
COMMUNIQUÉ DE PRESSE — [Nom du Groupe Hospitalier]
Date : [Date]

INCIDENT DE CYBERSÉCURITÉ

Le [Nom du Groupe Hospitalier] a identifié un incident de sécurité 
informatique affectant une partie de ses systèmes d'information. 
Cet incident est le résultat d'un ransomware qui a chiffré certaines 
données internes.

ACTIONS IMMÉDIATES :
- Les équipes techniques ont immédiatement isolé les systèmes affectés
- Les soins aux patients ne sont pas impactés
- Un plan de continuité d'activité est activé
- Les autorités compétentes (ANSSI, CNIL) ont été notifiées

RECOMMANDATIONS AUX PATIENTS :
- Aucune action n'est requise de votre part à ce stade
- Vos données médicales restent protégées
- En cas de doute, contactez notre standard : [numéro]

Nous vous tiendrons informés de l'évolution de la situation.
```

**2.3 Obligations légales secteur santé** (1 pt)

| Obligation | Délai | Autorité |
|------------|-------|----------|
| RGPD (fuite de données patients) | 72h | CNIL |
| NIS2 (infrastructure critique) | 24h | ANSSI |
| ASIP Santé / HDS | 24h | Ministère de la Santé |
| Signalement d'incident critique | 4h | Cellule de crise interne |
| Déclaration à l'ARS | 48h | Agence Régionale de Santé |

---

### Partie 3 — Rapport COMEX (6 pts)

**Exécutif Summary** (2 pts)

```
INCIDENT RANSOMWARE LOCKBIT 3.0 — RAPPORT COMEX
===================================================
Date : [Date]
Classification : Confidentiel

SYNTHÈSE :
Attaque par ransomware LockBit 3.0 ayant impacté 47 postes et 3 serveurs 
du SIH. Exfiltration confirmée de 12 GB de données patients. Demande de 
rançon de 50 BTC (3.2M€). Aucun paiement recommandÉ.

IMPACT BUSINESS :
- Indisponibilité partielle du SIH : 5-7 jours
- Report de rendez-vous non urgents
- Activation du plan blanc
- Impact réputationnel significatif

COÛTS ESTIMÉS :
- Remédiation technique : 500K€
- Perte d'activité : 1.2M€
- Communication de crise : 100K€
- Améliorations sécurité : 800K€
- Risque amendes CNIL : 200K€-1M€
- TOTAL ESTIMÉ : 2.8M€ - 3.6M€

PLAN DE REMÉDIATION 90 JOURS :
- Semaine 1-2 : Restauration complète, audit de sécurité
- Mois 1 : Déploiement MFA, VPN obligatoire, segmentation
- Mois 2 : EDR sur tous les postes, sauvegarde immuable
- Mois 3 : Exercice de crise, formation, audit pentest

LEÇONS APPRISES :
- RDP ne doit jamais être exposé directement
- Les sauvegardes doivent être immuables et isolées
- La segmentation réseau est critique
- Un plan de réponse à incident doit être testé régulièrement
```

---
