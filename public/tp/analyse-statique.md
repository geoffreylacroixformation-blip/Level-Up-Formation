# TP Module 1 — Analyse Statique de Malware

## 🎯 Énoncé du TP

### Contexte

Vous êtes analyste SOC (Security Operations Center) chez un prestataire de cybersécurité. Un client vous a transmis un fichier exécutable suspect (`sample.exe`) récupéré sur la machine d'un employé qui a signalé un comportement anormal (ralentissements, connexions réseau suspectes). Le fichier a été mis en quarantaine par l'antivirus mais n'a pas encore été analysé en profondeur.

Votre mission : réaliser une **analyse statique complète** de cet échantillon pour déterminer sa nature, ses capacités et produire un rapport d'analyse avec des IOCs (Indicators of Compromise).

### Objectifs pédagogiques

- Maîtriser les outils d'analyse statique (pestudio, PEiD, FLOSS, Ghidra)
- Identifier les indicateurs de compromission (IOCs)
- Comprendre la structure d'un exécutable Windows
- Détecter les techniques d'obfuscation courantes
- Rédiger un rapport d'analyse professionnel

### Outils mis à disposition

| Outil | Usage |
|-------|-------|
| **pestudio** | Analyse des imports, sections, ressources, strings |
| **PEiD** | Détection de packers et compilateurs |
| **FLOSS** | Extraction de strings obfusqués |
| **Ghidra** | Désassemblage et décompilation |
| **file / xxd** | Identification du format et hexdump |
| **sha256sum** | Calcul d'empreintes |

### Fichier à analyser

```
Nom : sample.exe
SHA256 : e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Taille : ~284 KB
Source : Soumission client (poste utilisateur)
```

---

## 📝 Questions progressives

### Partie 1 — Identification préliminaire (4 points)

**Q1.1** (1 pt) — Calculez l'empreinte SHA256 du fichier et vérifiez qu'elle correspond à celle fournie. Pourquoi est-il crucial de vérifier l'intégrité du hash avant toute analyse ?

**Q1.2** (1 pt) — Utilisez la commande `file` pour identifier le type de fichier. Quel format est détecté ? Quelle est l'architecture cible (32 bits / 64 bits) ?

**Q1.3** (1 pt) — À l'aide de `pestudio`, identifiez la date de compilation (compile timestamp). Cette date vous semble-t-elle légitime ? Que pouvez-vous en déduire ?

**Q1.4** (1 pt) — Vérifiez la présence d'un signature numérique (Authenticode) dans pestudio. Le fichier est-il signé ? Par qui ? Quelle conclusion tirez-vous ?

---

### Partie 2 — Analyse des imports et API (5 points)

**Q2.1** (1 pt) — Dans pestudio, listez les DLL importées. Identifiez au moins 4 DLLs et expliquez leur rôle respectif.

**Q2.2** (1.5 pt) — Parmi les imports, identifiez les fonctions API suspectes liées à :
- L'injection de code / manipulation de processus
- Les connexions réseau
- La persistance (registre)
- Le vol d'informations

Pour chaque catégorie, citez au moins 2 fonctions.

**Q2.3** (1 pt) — Le fichier importe-t-il des fonctions depuis `ntdll.dll` ? Pourquoi est-ce un indicateur de suspicion supplémentaire ?

**Q2.4** (1.5 pt) — Calculez le ratio "suspicious imports / total imports" dans pestudio. Un ratio élevé est-il systématiquement synonyme de malware ? Justifiez.

---

### Partie 3 — Analyse des chaînes de caractères (Strings) (5 points)

**Q3.1** (1 pt) — Avec pestudio, listez les 10 premiers strings identifiés. Classez-les en trois catégories : légitimes, suspects, et indicateurs de compromission (IOCs).

**Q3.2** (1.5 pt) — Utilisez **FLOSS** pour extraire les strings obfusqués. Comparez le résultat avec pestudio. Quels types d'obfuscation sont détectés (stack strings, XOR, base64, etc.) ?

**Q3.3** (1 pt) — Identifiez dans les strings :
- Une ou plusieurs URL / domaine suspect
- Un chemin de fichier ou de registre
- Une commande système potentielle

**Q3.4** (1.5 pt) — Un string récurrent apparaît sous la forme `SV` suivi de 32 caractères hexadécimaux. De quoi pourrait-il s'agir ? Proposez une méthode pour le vérifier.

---

### Partie 4 — Analyse des sections et entropie (3 points)

**Q4.1** (1 pt) — Dans pestudio, examinez les sections du PE. Listez les sections présentes et leurs tailles virtuelles/réelles. Identifiez toute anomalie.

**Q4.2** (1 pt) — L'entropie de la section `.text` est de 7.8. Interprétez cette valeur. Que signifie une entropie > 7.0 dans le contexte de l'analyse de malware ?

**Q4.3** (1 pt) — Utilisez **PEiD** pour détecter un éventuel packer. Quel résultat obtenez-vous ? Si aucun packer n'est détecté mais que l'entropie est élevée, quelle hypothèse pouvez-vous formuler ?

---

### Partie 5 — Rapport d'analyse (3 points)

**Q5.1** (1 pt) — Rédigez un résumé exécutif (Executive Summary) de 5-8 lignes décrivant la nature du malware, son comportement principal et son niveau de dangerosité.

**Q5.2** (1 pt) — Produisez une liste d'IOCs (Indicators of Compromise) exploitables pour une détection réseau/hôtes (hash, domaine, IP, chemin de fichier, clé registre).

**Q5.3** (1 pt) — Proposez 2 règles YARA basées sur vos findings. Écrivez la syntaxe complète.

---

## ✅ Correction détaillée (Barème /20)

---

### Partie 1 — Identification préliminaire (4 points)

#### Q1.1 — Vérification du hash (1 pt)

```bash
$ sha256sum sample.exe
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  sample.exe
```

**Correction :**
- Le hash correspond → **0.5 pt**
- Justification : Le hash garantit l'intégrité et la traçabilité de l'échantillon. Il permet de :
  - Vérifier qu'il n'a pas été modifié pendant le transfert
  - Partager l'échantillon entre analystes de manière fiable
  - Le rechercher sur des plateformes de threat intelligence (VirusTotal, MISP)
  - L'utiliser comme IOC dans les règles de détection
  → **0.5 pt**

#### Q1.2 — Identification du format (1 pt)

```bash
$ file sample.exe
sample.exe: PE32 executable (GUI) Intel 80386, for MS Windows
```

**Correction :**
- Format : **PE (Portable Executable)** — exécutable Windows → **0.5 pt**
- Architecture : **32 bits (PE32, Intel 80386)** → **0.5 pt**

#### Q1.3 — Date de compilation (1 pt)

**Correction :**
- Dans pestudio → onglet "file info" → compile timestamp
- Exemple de valeur suspecte : `2010-06-15` ou une date future, ou `0x00000000`
- Une date incohérente (trop ancienne, future, ou nulle) est un indicateur de :
  - Falsification du timestamp (anti-analyse)
  - Malware ancien recyclé
  - Erreur de compilation volontaire
→ **0.5 pt pour l'identification + 0.5 pt pour l'interprétation**

#### Q1.4 — Signature numérique (1 pt)

**Correction :**
- Dans pestudio → onglet "certificate"
- Résultat attendu : **Aucune signature** ou signature invalide / expirée
- Un malware n'est **jamais** signé avec un certificat valide (ou utilise un certificat volé/révoqué)
- Conclusion : l'absence de signature valide renforce la suspicion
→ **0.5 pt pour l'observation + 0.5 pt pour la conclusion**

---

### Partie 2 — Analyse des imports et API (5 points)

#### Q2.1 — DLLs importées (1 pt)

**Correction :**

| DLL | Rôle |
|-----|------|
| `kernel32.dll` | Fonctions de base : mémoire, fichiers, processus |
| `ntdll.dll` | API native Windows (sous le niveau documenté) |
| `ws2_32.dll` | Communications réseau (Winsock) |
| `advapi32.dll` | Registre, services, privilèges |
| `wininet.dll` | Protocoles HTTP/FTP (communications C2) |
| `crypt32.dll` | Fonctions cryptographiques |

→ **1 pt** (0.25 pt par DLL correctement identifiée avec son rôle, max 4)

#### Q2.2 — Fonctions API suspectes (1.5 pt)

**Correction :**

**Injection / Manipulation de processus :**
- `OpenProcess` — ouverture d'un processus cible
- `VirtualAllocEx` — allocation de mémoire dans un processus distant
- `WriteProcessMemory` — écriture dans la mémoire d'un autre processus
- `CreateRemoteThread` — création de thread distant (injection classique)

**Connexions réseau :**
- `WSAStartup` — initialisation Winsock
- `connect` — connexion TCP sortante
- `HttpSendRequestA` — envoi de requête HTTP (C2 communication)
- `URLDownloadToFileA` — téléchargement de payload additionnel

**Persistance registre :**
- `RegOpenKeyExA` — ouverture de clé registre
- `RegSetValueExA` — écriture dans le registre (Run/RunOnce)

**Vol d'informations :**
- `GetClipboardData` — lecture du presse-papiers
- `GetForegroundWindow` — détection de la fenêtre active
- `GetAsyncKeyState` — keylogging potentiel

→ **1.5 pt** (0.25 pt par fonction correcte, minimum 2 par catégorie)

#### Q2.3 — Imports depuis ntdll.dll (1 pt)

**Correction :**
- Oui, le fichier importe depuis `ntdll.dll` → **0.5 pt**
- `ntdll.dll` expose l'**API native (Native API)** — les fonctions non documentées de Windows :
  - `NtCreateThreadEx`, `NtAllocateVirtualMemory`, `NtWriteVirtualMemory`
  - Utilisées pour contourner les hooks des EDR/AV qui surveillent l'API Win32 documentée
  - Technique dite de **syscalls directes** ou **direct syscalls**
→ **0.5 pt pour l'explication**

#### Q2.4 — Ratio suspicious / total (1.5 pt)

**Correction :**
- pestudio calcule un indicateur "blacklisted imports"
- Exemple : 18 imports suspects sur 42 totaux → ratio ≈ 0.43
- **Un ratio élevé n'est PAS systématiquement synonyme de malware** → **0.5 pt**
- Justification :
  - Certains logiciels légitimes (outils système, drivers, logiciels de sécurité) utilisent les mêmes APIs
  - Un outil de monitoring légitime utilisera `ReadProcessMemory`, `CreateToolhelp32Snapshot`
  - C'est la **combinaison** d'imports suspects qui est révélatrice (ex: injection + réseau + persistance)
  - Contexte nécessaire : un seul import suspect = bruit ; un cluster d'imports suspects = indicateur fort
→ **1 pt pour l'argumentation**

---

### Partie 3 — Analyse des chaînes de caractères (5 points)

#### Q3.1 — Classification des strings (1 pt)

**Correction :**

| Catégorie | Exemples |
|-----------|----------|
| **Légitimes** | `"kernel32.dll"`, `"GetLastError"`, `"MSVCR100.dll"` |
| **Suspects` | `"cmd.exe /c"`, `"Software\Microsoft\Windows\CurrentVersion\Run"`, `"SeDebugPrivilege"` |
| **IOCs** | `"185.220.101.34:443"`, `"hxxp://malicious-c2[.]top/payload.bin"`, `"HKEY_CURRENT_USER\...\Run"` |

→ **1 pt** pour une classification cohérente avec exemples

#### Q3.2 — FLOSS vs pestudio (1.5 pt)

**Correction :**

```bash
$ floss sample.exe > floss_output.txt
```

**Comparaison :**
- pestudio : strings ASCII/Unicode statiques uniquement
- FLOSS : ajoute les **stack strings** (construites instruction par instruction) et les strings décodées (XOR, ROT, etc.)

**Types d'obfuscation détectés :**
- **Stack strings** : chaînes construites caractère par caractère via `mov [ebp-X], 'c'` → échappent aux analyseurs de strings simples
- **XOR encoding** : chaînes encodées avec une clé XOR simple
- **String hashing** : les APIs sont résolues par hash (pas de string visible)

→ **0.5 pt pour la comparaison + 0.5 pt pour les stack strings + 0.5 pt pour les autres types**

#### Q3.3 — IOCs dans les strings (1 pt)

**Correction :**
- **URL/Domaine** : `hxxp://cdn-updateservice[.]net/gate.php` → **0.33 pt**
- **Chemin registre** : `SOFTWARE\Microsoft\Windows\CurrentVersion\Run\SysHealth` → **0.33 pt**
- **Commande** : `cmd.exe /c powershell -ep bypass -enc SABFA...` → **0.34 pt**

#### Q3.4 — String `SV` + 32 hex (1.5 pt)

**Correction :**
- Format : `SV` + 32 caractères hex = ressemble à un **MD5 hash** (128 bits = 32 hex) → **0.5 pt**
- Hypothèse : il pourrait s'agir de :
  - Hash de configuration (clé de déchiffrement)
  - Identifiant de campagne / variant
  - Hash de nom de domaine (DGA seed)
→ **0.5 pt pour l'hypothèse**
- Méthode de vérification :
  - Rechercher le hash sur VirusTotal / MalwareBazaar
  - Tenter de le reverser via des tables rainbow (crackstation.net)
  - Analyser dans Ghidra le contexte d'utilisation de cette valeur
→ **0.5 pt pour la méthode**

---

### Partie 4 — Analyse des sections et entropie (3 points)

#### Q4.1 — Sections du PE (1 pt)

**Correction :**

| Section | Virtual Size | Raw Size | Observation |
|---------|-------------|----------|-------------|
| `.text` | 0x00042300 | 0x00042400 | Normal |
| `.rdata` | 0x0000A200 | 0x0000A200 | Normal |
| `.data` | 0x00003100 | 0x00003200 | Normal |
| `.rsrc` | 0x00001800 | 0x00001800 | Ressources présentes |
| `.reloc` | 0x00001200 | 0x00001200 | Normal |

**Anomalies possibles :**
- Section avec nom inhabituel (`.xyz`, `UPX0`, `.packed`)
- Virtual Size >> Raw Size (section non initialisée en mémoire = packing)
- Section en lecture + écriture + exécution (RWX) = très suspect

→ **0.5 pt pour le listing + 0.5 pt pour l'identification d'anomalie**

#### Q4.2 — Entropie de la section .text (1 pt)

**Correction :**
- Entropie = 7.8 / 8.0 → **très élevée** → **0.5 pt**
- Interprétation :
  - Entropie ≈ 4-6 : code compilé normal
  - Entropie > 7.0 : indique des données **chiffrées**, **compressées**, ou **packées**
  - Une section `.text` à 7.8 signifie que le code est très probablement chiffré/compressé et sera déchiffré à l'exécution (unpacking en mémoire)
→ **0.5 pt pour l'interprétation**

#### Q4.3 — Détection de packer avec PEiD (1 pt)

**Correction :**
- PEiD peut retourner : "Nothing found", "UPX *", "ThemIDA", ou un packer inconnu
- Si PEiD ne détecte rien mais entropie élevée → **0.5 pt**
- Hypothèses :
  - **Packer custom / privé** (non publiquement connu)
  - **Crypter** (chiffrement fort, pas de stub de décompression reconnaissable)
  - **Code virtuel** (VM-based protection : code transformé en bytecode custom)
  - Nécessite une analyse dynamique ou un unpacking manuel
→ **0.5 pt pour les hypothèses**

---

### Partie 5 — Rapport d'analyse (3 points)

#### Q5.1 — Executive Summary (1 pt)

**Correction (exemple) :**

> L'échantillon `sample.exe` (SHA256: e3b0c4...) est un **stealer/information malware** de type RedLine/Metamorphique. Le binaire PE32 non signé présente des indicateurs forts de packing (entropie 7.8 sur .text) et importe des API d'injection de processus (`VirtualAllocEx`, `CreateRemoteThread`), de communication C2 via HTTP (`HttpSendRequestA`, `connect`), et de persistance registre (`RegSetValueExA`). Les strings révèlent un domaine C2 (`cdn-updateservice[.]net`) et une commande PowerShell encodée. Le malware vole les données du presse-papiers, les identifiants navigateur, et établit une persistance via la clé Run. **Niveau de dangerosité : ÉLEVÉ.**

→ **1 pt** pour un résumé complet et structuré

#### Q5.2 — Liste d'IOCs (1 pt)

**Correction :**

```
HASH:
  SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  MD5:    d41d8cd98f00b204e9800998ecf8427e

RESEAU:
  Domaine C2: cdn-updateservice[.]net
  URL: hxxp://cdn-updateservice[.]net/gate.php
  IP: 185.220.101.34:443

HOTE:
  Clé registre: HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run\SysHealth
  Fichier: %APPDATA%\SysHealth\update.dat
  Mutex: Global\{8B3F2C1A-...}

COMPORTEMENT:
  Injection dans explorer.exe
  Téléchargement de payload secondaire
  Exfiltration via POST HTTP
```

→ **1 pt** pour une liste complète et exploitable

#### Q5.3 — Règles YARA (1 pt)

**Correction :**

```yara
rule Malware_Stealer_RedLine_Variant {
    meta:
        author = "Analyst SOC"
        date = "2026-06-28"
        description = "Detects RedLine stealer variant based on static analysis"
        hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    
    strings:
        $s1 = "cdn-updateservice.net" ascii wide
        $s2 = "gate.php" ascii wide
        $s3 = "SeDebugPrivilege" ascii wide
        $s4 = "SysHealth" ascii wide
        $api1 = "HttpSendRequestA" ascii
        $api2 = "CreateRemoteThread" ascii
        $mutex = /Global\\{[A-F0-9\-]{36}\}/ ascii
    
    condition:
        uint16(0) == 0x5A4D and
        filesize < 500KB and
        (2 of ($s*) and 1 of ($api*)) or $mutex
}

rule Malware_Packed_HighEntropy_PE {
    meta:
        author = "Analyst SOC"
        description = "Detects PE files with high entropy .text section (likely packed)"
    
    condition:
        uint16(0) == 0x5A4D and
        for any i in (0..pe.number_of_sections - 1) :
            (pe.sections[i].name == ".text" and
             pe.sections[i].entropy > 7.5)
}
```

→ **0.5 pt par règle correcte = 1 pt**

---

## 📊 Grille de notation finale

| Partie | Compétence évaluée | Points |
|--------|-------------------|--------|
| 1 | Identification préliminaire | /4 |
| 2 | Analyse des imports/API | /5 |
| 3 | Analyse des strings | /5 |
| 4 | Analyse des sections/entropie | /3 |
| 5 | Rédaction de rapport | /3 |
| **TOTAL** | | **/20** |

### Appréciation

| Note | Appréciation |
|------|-------------|
| 17-20 | Excellent — Analyste prêt pour l'autonomie |
| 14-16 | Bon — Compétences solides, perfectionnement possible |
| 10-13 | Moyen — Bases acquises, pratique nécessaire |
| 5-9 | Insuffisant — Révision du module recommandée |
| 0-4 | Échec — Reprise complète du module nécessaire |

---

*TP Module 1 — Analyse de Malware LVL2 — Level Up Formation*
