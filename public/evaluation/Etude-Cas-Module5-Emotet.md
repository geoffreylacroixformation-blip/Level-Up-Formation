# ÉVALUATION 2 : ÉTUDE DE CAS — MODULE 5 (Analyse Statique et Dynamique)

## Notation : /20 points (5 points par question)

**Durée : 60 minutes | Documents autorisés (fiches techniques)**

---

## SCÉNARIO : Attaque Emotet dans une PME industrielle

### Contexte

L'entreprise **Mécanique Durand** (250 employés, secteur industriel) a été victime d'une attaque par ransomware. L' analyste SOC de premier niveau vous transmet un échantillon binaire suspect récupéré sur le poste d'un employé. L'activité réseau anormale détectée par les IDS remonte au **mardi 14 mars 2026 à 08:42 UTC**.

### Éléments fournis par le SOC :

- **Fichier suspect** : `Facturation_2026-03-13.iso` (reçu par email)
- **Hash SHA-256** : `4a2e8f4c19e2b3dc8a45f95b12d67a3e8f2b1c2d4e5a6b7c8d9e0f1a2b3c4d5e6`
- **Source** : Email provenant de `service.fournisseur@outlook.fr` (usurpé)
- **Activité réseau suspecte** : Connexions vers `185.220.101[.]34` sur le port 443
- **Comportement observé** : Création de services Windows suspects, exécution de PowerShell encodé en base64
- **Outils disponibles** : IDA Free, Ghidra, x64dbg, Wireshark, Process Monitor, YARA, VirusTotal, Any.Run

---

### Question 1 — Identification et Classification (5 pts)

En vous basant sur les éléments fournis, identifiez la famille de malware la plus probable et justifrez votre réponse en vous appuyant sur au moins **4 indices techniques** du scénario.

**Indice de recherche** : Recherchez le hash et les IOCs sur VirusTotal et MalwareBazaar.

**Réponse attendue** :
- Identification de la famille (Emotet)
- Au moins 4 indices justificatifs parmi : vecteur d'infection (ISO/LNK), macro VBA, C2 connu, pattern de nommage, technique de persistence, etc.

---

### Question 2 — Analyse Statique (5 pts)

Décrivez la méthodologie complète d'analyse statique que vous appliqueriez sur cet échantillon. Pour chaque étape, précisez l'outil utilisé et les informations recherchées.

**Réponse attendue** :
1. Calcul et vérification des hash (MD5, SHA-1, SHA-256)
2. Extraction des chaînes de caractères (strings, FLOSS)
3. Analyse de l'en-tête PE (CFF Explorer, PE-bear)
4. Identification des imports/exports suspects
5. Décompilation/désassemblage (Ghidra/IDA)
6. Recherche de signatures YARA
7. Analyse des ressources embarquées

---

### Question 3 — Analyse Dynamique (5 pts)

Proposez un protocole d'analyse dynamique en sandbox. Quels comportements cherchez-vous à observer et quels outils utilisez-vous ?

**Réponse attendue** :
- Exécution en environnement isolé (Any.Run, Cuckoo/Cape)
- Capture réseau (Wireshark) : C2, exfiltration
- Surveillance des processus (Process Monitor/Procmon)
- Surveillance du registre (RegShot)
- Capture de mémoire (Volatility)
- Analyse des injections de processus
- Détection de mécanismes anti-VM/anti-debug

---

### Question 4 — Rapport et Recommandations (5 pts)

Rédigez les conclusions de votre rapport d'analyse à destination du RSSI, incluant :
- Niveau de criticité (échelle CVSS)
- IOCs identifiés
- Recommandations immédiates de confinement
- Mesures de remédiation à moyen terme

---

## CORRECTION ÉTUDE DE CAS MODULE 5

### Question 1 — Identification (5 pts)

**Réponse attendue** :

**Famille identifiée : Emotet**

**Indices justificatifs** (4 minimum requis, 1 pt par indice pertinent) :

1. **Vecteur d'infection** : Fichier ISO contenant un fichier LNK — c'est la signature d'Emotet depuis 2021 (après l'interdiction des macros par Microsoft). L'ISO contourne le Mark-of-the-Web.

2. **Hash et réputation** : Le hash SHA-256 correspond à un échantillon Emotet connu sur VirusTotal (détection par >60 moteurs).

3. **Infrastructure C2** : L'IP `185.220.101[.]34` appartient à la sous-réseau Tor exit node / infrastructure Emotet connue (ASxxxxx).

4. **Comportement** : Exécution de PowerShell encodé en base64 est une technique d'exécution (T1059.001) systématiquement utilisée par Emotet pour le dropper.

5. **Persistence** : Création de services Windows (T1543.003) — mécanisme de persistance classique d'Emotet.

6. **Pattern de nommage** : `Facturation_2026-03-13.iso` — nommage contextuel et urgent, typique d'Emotet qui usurpe des documents métier.

---

### Question 2 — Analyse Statique (5 pts)

| Étape | Outil | Informations recherchées |
|-------|-------|--------------------------|
| 1. Hash | sha256sum, md5sum | Vérification d'intégration, comparaison avec bases (VirusTotal, MalwareBazaar) |
| 2. Chaînes | strings, FLOSS | URLs, IPs, noms de fichiers, commandes, clés de chiffrement |
| 3. En-tête PE | PE-bear, CFF Explorer | Sections suspectes, timestamp, entry point anormal, packer |
| 4. Imports | PEview, Ghidra | API suspects : CreateRemoteThread, VirtualAllocEx, RegSetValue, URLDownloadToFile |
| 5. Désassemblage | Ghidra/IDA Free | Logique du dropper, routine de déchiffrement, mécanisme de persistance |
| 6. YARA | yara, YARA Rules | Correspondance avec règles Emotet connues |
| 7. Ressources | Resource Hacker | Payloads embarqués, scripts PowerShell, fichiers de configuration |

---

### Question 3 — Analyse Dynamique (5 pts)

**Protocole complet** :

1. **Préparation** : Sandbox Windows 10/11, réseau simulinet (INetSim), FakeNet-NG
2. **Exécution** : Lancement du fichier LNK/ISO dans Any.Run ou Cape Sandbox
3. **Capture réseau** (Wireshark) :
   - Identification des domaines/IPs C2
   - Analyse des protocoles (HTTP/HTTPS, SMB)
   - Détection d'exfiltration DNS (DNS tunneling)
4. **Surveillance processus** (Process Monitor) :
   - Arborescence des processus (parent/enfant)
   - Injection de processus (process hollowing)
   - Création de services
5. **Surveillance registre** (RegShot) :
   - Clés Run/RunOnce
   - Services créés
   - Modifications de paramètres de sécurité
6. **Capture mémoire** (Volatility) :
   - Injection de code
   - Chiffrement en mémoire
   - Extraction de configuration
7. **Anti-analysis detection** :
   - Vérification VM (CPUID, registre VMware)
   - Timing attacks (rdtsc)
   - Détection de debugger (IsDebuggerPresent)

---

### Question 4 — Rapport (5 pts)

**Niveau de criticité** : CVSS 9.1 (Critique) — Emotet est un loader qui déploie des ransomwares (Ryuk, Conti, TrickBot)

**IOCs identifiés** :
- Hash : `4a2e8f4c19e2b3dc8a45f95b12d67a3e8f2b1c2d4e5a6b7c8d9e0f1a2b3c4d5e6`
- IP C2 : `185.220.101[.]34`
- Domaine : `service.fournisseur@outlook.fr` (usurpé)
- Nom de fichier : `Facturation_2026-03-13.iso`
- Service créé : Nom aléatoire type `WinDefSvc_[random]`

**Confinement immédiat** (2 pts) :
- Isoler les postes infectés du réseau
- Bloquer l'IP C2 au pare-feu
- Désactiver les comptes compromis
- Lancer un scan complet de l'infrastructure
- Changer les mots de passe des administrateurs

**Remédiation moyen terme** (3 pts) :
- Désactiver les macros et les fichiers ISO/LNK
- Déployer l'EDR sur tous les postes
- Mettre en place une politique d'authentification multi-facteurs
- Sensibilisation des employés au phishing
- Segmentation réseau
+- Plan de réponse à incident

---

