# ÉVALUATION 3 : MISE EN SITUATION PROFESSIONNELLE — MODULE 6 (Réponse à Incident)

## Notation : /20 points

**Durée : 90 minutes | Simulation sur plateforme SOC**

---

## SCÉNARIO : Incident de type Conti — Groupe pharmaceutique PharmaPlus

### Contexte professionnelle

Vous êtes **analyste SOC de Niveau 2** au centre opérationnel de sécurité de **PharmaPlus**, un groupe pharmaceutique international (15 000 employés, 12 sites). Le SOC reçoit une alerte critique le **jeudi 18 mai 2026 à 03:15 UTC**.

### Alerte initiale (SIEM) :

```
[CRITICAL] Ransomware Activity Detected
Source: WIN-DC01.pharmaplus.local
Triggered Sigma Rule: "Ransomware File Extensions Modified"
Severity: Critical
Time: 2026-05-18T03:15:42Z
Details: Mass file extension change detected — 847 files modified 
in 3 minutes with extension ".CONTI"
Source Workstation: WS-DEV-PARIS-047
User: jdupont@pharmaplus.local
```

### Contexte supplémentaire (EDR) :

- Processus parent : `winword.exe` → enfant : `cmd.exe` → `vssadmin.exe delete shadows` → `bcdedit.exe /set {default}recoveryenabled No`
- Connexions sortantes vers `45.142.212[.]87:443` (IP associée à Conti selon Threat Intelligence)
- Reconnaissance réseau : scanning SMB vers `.143`, `.144`, `.145` du sous-réseau 10.50.4.x
- Tentative de désactivation de Windows Defender via GPO
- Volume de données sortantes : 2.7 GB en 15 minutes vers l'IP externe

### Logs supplémentaires (fournis dans l'exercice) :

```
# Sysmon Log 1
Event ID 1: Process Creation
Image: C:\Windows\System32\cmd.exe
ParentImage: C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE
CommandLine: cmd.exe /c vssadmin.exe delete shadows /all /quiet

# Sysmon Log 2
Event ID 3: Network Connection
Image: C:\Windows\System32\cmd.exe
DestinationIp: 45.142.212.87
DestinationPort: 443
Protocol: TCP

# Windows Security Log
Event ID 4625: Failed login for user jdupont (x12 prior to success)
Event ID 4672: Special privileges assigned to jdupont (03:14:12)
Event ID 4620: File extension added to monitored list (.CONTI)

# EDR Alert
Behavior: "Conti Ransomware Behavior Pattern"
Techniques: T1490 (Inhibit Recovery), T1486 (Data Encrypted), 
T1021.002 (SMB/Windows Admin Shares), T1562.001 (Disable Defender)
```

---

### Tâches à accomplir :

**Partie 1 — Triage et qualification (6 pts)**

1.1. Qualifiez cet incident en utilisant le framework MITRE ATT&CK (identifiez au moins 6 techniques).

1.2. Déterminez le périmètre de l'infection : quels systèmes sont compromis ? Quelles données sont touchées ?

1.3. Évaluez l'urgence et proposez un niveau de priorité (P1 à P4) avec justification.

---

**Partie 2 — Confinement et éradication (8 pts)**

2.1. Proposez un plan de confinement immédiat en 5 actions, ordonnées par priorité.

2.2. Identifiez les IOCs minimums à déployer sur les outils de sécurité.

2.3. Comment empêchez-vous la propagation latérale tout en maintenant la continuité d'activité ?

---

**Partie 3 — Rapport de gestion (6 pts)**

3.1. Rédigez un exécutif summary (1 page max) pour le DSI incluant :
- Nature de la menée, Impact business constaté, Actions immédiates prises, Estimation du temps de recommandation

3.2. Quelles obligations légales déclenchez-vous (RGPD, ansSII, NIS2) et dans quels délais ?

3.3. Proposez un plan de retour d'expérience (post-incident review).

---

## CORRECTION MISE EN SITUATION MODULE 6

### Partie 1 — Triage et qualification (6 pts)

**1.1 Mapping MITRE ATT&CK** (3 pts, 0.5 pt par technique correctement identifiée)

| Technique | ID MITRE ATCK | Justification |
|-----------|--------------|---------------|
| Spearphishing Attachment | T1566.001 | Document Word comme vecteur initial |
| Command & Scripting: Windows CMD | T1059.003 | cmd.exe pour exécuter vssadmin |
| Inhibit System Recovery | T1490 | vssadmin delete shadows |
| Data Encrypted for Impact | T1486 | Chiffrement des fichiers (.CONTI) |

**1.2 Périmètre** (2 pts)

- **Systèmes compromis** :
  - WS-DEV-PARIS-047 (patient zéro confirmé)
  - Potentiellement tout poste du sous-réseau 10.50.4.x (scan SMB détecté)
  - Serveur WIN-DC01 (alerte sur ce système)

- **Données touchées** :
  - 847 fichiers chiffrés minimum (.CONTI)
  - Potentiellement exfiltrés : 2.7 GB de données vers 45.142.212.87
  - Recherche active sur le partage DEV

- **Parc compromis** : Environ 200 postes potentiellement exposés au risque latéral

**1.3 Priorisation** (1 pt)

- **Niveau P1 (Critique)** — Justification :
  - Ransomware en cours d'exécution
  - Exfiltration massive (2.7 GB)
  - Propagation latérale active
  - Cibles d'intérêt commercial (recherche clinique)
  - Impact potentiel sur la sécurité sanitaire

---

### Partie 2 — Confinement et éradication (8 pts)

**2.1 Plan de confinement** (4 pts)

| Priorité | Action |
|----------|--------|
| 1 | Isoler WS-DEV-PARIS-047 du réseau (EDR network isolation) |
| 2 | Bloquer 45.142.212.87 au pare-feu global et sur le proxy |
| 3 | Désactiver le compte jdupont et forcer la déconnexion de toutes ses sessions |
| 4 | Bloquer SMB entre le sous-réseau DEV et les autres sous-réseaux |
| 5 | Activer le mode "containment" sur l'EDR pour le parc Windows |

**2.2 IOCs à déployer** (2 pts)

- IP : `45.142.212.87`
- Hash du processus cmd.exe anormal (à confirmer avec EDR)
- Chaîne "vssadmin delete shadows"
- Extension `.CONTI` pour monitoring fichier
- Compte `jdupont` en alerte
- Comportement "winword.exe → cmd.exe"

**2.3 Anti-propagation** (2 pts)

- Isoler le sous-réseau 10.50.4.x/24
- Activer l'authentification NTLMv2 et désactiver NTLMv1
- Bloquer le port 443 sortant vers les IPs non autorisées
- Forcer le changement des mots de passe KRBTGT (x2) si compromission Active Directory suspectée
- Mettre en quarantaine tous les postes suspects

---

### Partie 3 — Rapport de gestion (6 pts)

**3.1 Exécutif summary** (3 pts)

```
RANCONWARE CONTI — INCIDENT P1 — 18/05/2026
PharmaPlus — Centre de Recherche — Paris

NATURE DE LA MENACE :
Attaque par ransomware Conti en cours sur le réseau de recherche. 
Le patient zéro (WS-DEV-PARIS-047) a été infecté via un document Word malveillant.

IMPACT CONSTATÉ :
- 847 fichiers chiffrés sur le réseau de développement
- 2.7 GB de données potentiellement exfiltrées
- Propagation latérale active sur le sous-réseau DEV
- Risque de compromission Active Directory

ACTIONS IMMÉDIATES :
- Isolation du poste infecté ✓
- Blocage C2 ✓
- Suspension du compte compromis ✓
- Scan complet en cours ✓

ESTIMATION DE RÉSOLUTION :
- Court terme (24h) : Confinement complet, éradication
- Moyen terme (72h) : Restauration des sauvegardes
- Retour à la normale estimé : J+7
```

**3.2 Obligations légales** (2 pts)

| Obligation | Délai | Action |
|------------|-------|--------|
| RGPD (fuite de données) | 72h | Notification CNIL si données personnelles exposées |
| NIS2 | 24h | Notification à l'ANSSI |
| ANSII / OIV | 72h | Signalement sectoriel |
| Déclaration de incident critique | 4h | Cellule de crise interne |

**3.3 Plan post-incident** (1 pt)

- Réunion de débriefing sous 72h après résolution
- Retour d'expérience formalisé
- Mise à jour des playbooks SOC
- Exercice de phishing trimestriel
- Renforcement de la segmentation réseau
- Audit des sauvegardes et vérification de l'intégrité

---

---

