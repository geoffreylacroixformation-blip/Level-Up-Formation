# TP Module 6 — Débogage et Analyse Approfondie de Malware

## 📋 Énoncé du TP

### Contexte
Vous êtes analyste en rétro-ingénierie (reverse engineering) au sein d'une équipe CERT. Un échantillon de malware nommé `stealer_x64.dll` a été récupéré lors d'un incident sur un serveur Windows. L'analyse statique initiale révèle que le binaire est **packé** (UPX modifié) et contient des techniques anti-débogage. L'analyse dynamique montre qu'il s'agit d'un **stealer** (voleur de données) qui cible les navigateurs web, les clients FTP et les mots de passe enregistrés.

Votre mission : utiliser **x64dbg** pour contourner les mécanismes anti-débogage, unpacker le binaire en mémoire, et analyser la logique interne du malware pour comprendre exactement quelles données il vole et comment il les exfiltre.

### Objectifs
Ce TP vous amène à :
1. Configurer x64dbg pour l'analyse d'un malware x64 packé
2. Identifier et contourner les techniques anti-débogging (IsDebuggerPresent, NtQueryInformationProcess, timing checks)
3. Dumper (unpacker) le binaire en mémoire
4. Analyser la logique métier du stealer pas-à-pas
5. Identifier les fonctions de vol de données et l'exfiltration

### Durée estimée : 3 heures

### Prérequis
- Machine virtuelle Windows 10 x64 (isolée)
- x64dbg (snapshot le plus récent) avec plugins : ScyllaHide, xAnalyzer
- Échantillon : `stealer_x64.dll` (fourni par l'instructeur)
- Connaissances de base en assembleur x86/x64

---

## 📝 Questions Progressives

### Partie 1 — Configuration de l'environnement de débogage (15 min)

**Q1.1** — Quelle est la différence entre x64dbg et IDA Pro en termes d'approche d'analyse ? Pourquoi privilégier x64dbg pour ce TP ? *(2 points)*

**Q1.2** — Installez et configurez le plugin **ScyllaHide** dans x64dbg. Quelles options anti-anti-débogage activerez-vous et pourquoi ? Citez-en au moins 4. *(3 points)*

**Q1.3** — Quel est l'intérêt de lancer le malware via `rundll32.exe stealer_x64.dll,EntryPoint` plutôt que de double-cliquer directement ? *(1 point)*

---

### Partie 2 — Identification des techniques anti-débogage (30 min)

**Q2.1** — Chargez le malware dans x64dbg et identifiez les appels API suivants dans la fenêtre `Symbols` :
- `IsDebuggerPresent`
- `NtQueryInformationProcess` (classe `ProcessDebugPort`)
- `CheckRemoteDebuggerPresent`
- `NtQuerySystemInformation` (classe `SystemKernelDebuggerInformation`)

Pour chacun, indiquez l'adresse et le comportement en cas de détection. *(4 points)*

**Q2.2** — Identifiez les instructions de timing check (anti-débogage par mesure du temps) :
- `RDTSC` (Read Time-Stamp Counter)
- `QueryPerformanceCounter`
- `GetTickCount`

Où sont-elles situées dans le code ? Quel est le seuil de détection ? *(3 points)*

**Q2.3** — Le malware utilise-t-il des techniques de `INT 2D` ou `INT 3` (breakpoints logiciels) comme détection ? Si oui, à quelle(s) adresse(s) ? *(2 points)*

---

### Partie 3 — Contournement et Unpacking (45 min)

**Q3.1** — Placez un breakpoint sur `IsDebuggerPresent` et modifiez la valeur de retour. Montrez la séquence d'instructions assembleur et expliquez votre modification. *(3 points)*

**Q3.2** — Pour contourner le timing check basé sur `RDTSC`, quelle stratégie utilisez-vous ? Proposez deux méthodes différentes. *(2 points)*

**Q3.3** — Le malware est packé avec un packer personnalisé (pas UPX standard). Utilisez la technique du **"Memory Map"** + **"Find OEP"** (Original Entry Point) pour localiser le point d'entrée réel. Décrivez votre démarche. *(4 points)*

**Q3.4** — Une fois l'OEP trouvée, utilisez **Scylla** (intégré à x64dbg) pour dumper le processus en mémoire et reconstruire l'Import Address Table (IAT). Quelles sont les étapes ? *(3 points)*

---

### Partie 4 — Analyse de la logique métier (40 min)

**Q4.1** — Après unpacking, analysez les fonctions principales du stealer. Identifiez au moins 4 fonctions liées au vol de données et décrivez leur rôle. *(4 points)*

**Q4.2** — Le malware cible les navigateurs web. Quels chemins de fichiers suivants sont accédés ?

| Navigateur | Chemin cible | Données volées |
|------------|-------------|----------------|
| Chrome | | |
| Firefox | | |
| Edge | | |

*(3 points)*

**Q4.3** — Identifiez la fonction d'exfiltration. Quel protocole est utilisé (HTTP, HTTPS, DNS, SMTP) ? Quel est le format des données envoyées (JSON, XML, brut, chiffré) ? *(3 points)*

**Q4.4** — Le malware utilise-t-il du chiffrement pour les données exfiltrées ? Si oui, identifiez l'algorithme (AES, RC4, XOR, custom) et trouvez la clé de chiffrement. *(3 points)*

---

### Partie 5 — Synthèse et contre-mesures (20 min)

**Q5.1** — Rédigez un résumé technique du malware analysé incluant : type, capacités, cibles, méthodes d'exfiltration, et niveau de sophistication (1-5). *(3 points)*

**Q5.2** — Proposez 3 règles YARA pour détecter ce malware en environnement de production. *(3 points)*

**Q5.3** — Proposez 3 règles Sigma pour la détection dans un SIEM. *(3 points)*

---

## ✅ Correction Détaillée

### Partie 1 — Configuration de l'environnement de débogage

**R1.1** — Différence x64dbg vs IDA Pro (2 points) :

| Critère | x64dbg | IDA Pro |
|---------|--------|---------|
| Approche | Débogage interactif (runtime) | Analyse statique (offline) |
| Coût | Gratuit et open source | Commercial (très cher) |
| Anti-débogage | Contournement dynamique possible | Limité sans plugin |
| Courbe d'apprentissage | Moyenne | Élevée |
| Dumping mémoire | Natif (Scylla) | Nécessite scripts |

**Pourquoi x64dbg pour ce TP** : Le malware utilise des techniques anti-débogage qui nécessitent une approche dynamique. x64dbg permet de :
- Modifier les registres/valeurs en temps réel
- Contourner les checks anti-debug pas-à-pas
- Dumper la mémoire après unpacking
- Utiliser ScyllaHide pour masquer le débogueur

**R1.2** — Configuration ScyllaHide (3 points) :

Options à activer :
1. **NtSetInformationThread** — HideFromDebugger : Empêche le malware de détacher le débogueur
2. **NtQueryInformationProcess** — ProcessDebugPort (7) : Retourne 0 au lieu de la valeur réelle
3. **NtQueryInformationProcess** — ProcessDebugObjectHandle (30) : Simule l'absence de debug object
4. **NtQueryInformationProcess** — ProcessDebugFlags (31) : Retourne 1 (NoDebugInherit)
5. **NtQuerySystemInformation** — SystemKernelDebuggerInformation (35) : Masque la présence du kernel debugger
6. **NtClose** — Handle tracing : Contourne le crash sur fermeture de handle invalide
7. **GetTickCount / QueryPerformanceCounter / RDTSC** — Timing Checks : Normalise les mesures de temps
8. **NtGetContextThread / NtSetContextThread** — Contourne la modification des registres de debug (DR0-DR7)
9. **BlockInput** — Empêche le malware de bloquer les entrées clavier/souris
10. **OutputDebugString** — Contourne la détection via le dernier message de debug
11. **Hardware Breakpoints** — Supprime les breakpoints matériels (DR0-DR7)
12. **SEH (Structured Exception Handler)** — Contourne les exceptions anti-debug

**R1.3** — Lancement via rundll32.exe (1 point) :
Les DLLs ne peuvent pas être exécutées directement par Windows. `rundll32.exe` charge la DLL et appelle sa fonction exportée (EntryPoint ou DllMain). Cela permet de :
- Contrôler le point d'entrée exact
- Passer des arguments si nécessaire
- Avoir le processus sous contrôle du débogueur dès le départ
- Éviter les échecs de chargement qui masqueraient le comportement

---

### Partie 2 — Identification des techniques anti-débogage

**R2.1** — Appels API anti-débogage (4 points) :

| API | Adresse (exemple) | Comportement si détecté |
|-----|-------------------|------------------------|
| `IsDebuggerPresent` | `0x00401000` | Si retourne TRUE → appel à `ExitProcess` ou boucle infinie |
| `NtQueryInformationProcess` (ProcessDebugPort) | `0x00401050` | Si retourne valeur non-zero → crash ou redirection du flux |
| `CheckRemoteDebuggerPresent` | `0x004010A0` | Si `pbDebuggerPresent == TRUE` → modification du comportement |
| `NtQuerySystemInformation` (SystemKernelDebuggerInformation) | `0x004010F0` | Si `DebuggerEnabled == 1` → terminaison du processus |

**IsDebuggerPresent** vérifie le champ `BeingDebugged` dans le PEB (Process Environment Block) à l'offset `0x2` du TIB.

**NtQueryInformationProcess** avec `ProcessDebugPort` (classe 7) retourne un handle de port de débogage. Si non-null, un débogueur est attaché.

**R2.2** — Timing checks (3 points) :

| Instruction | Adresse | Seuil de détection |
|-------------|---------|-------------------|
| `RDTSC` (2 lectures) | `0x00401200` | Si différence > 0x1000 (4096) cycles → détection |
| `QueryPerformanceCounter` | `0x00401250` | Si temps > 1 seconde entre deux appels → détection |
| `GetTickCount` | `0x004012A0` | Si différence > 5000 ms → détection |

**Principe** : Un débogueur introduit des ralentissements (stepping, breakpoints). Le malware mesure le temps entre deux points et détecte si le temps écoulé dépasse un seuil anormal.

**R2.3** — INT 2D / INT 3 (2 points) :
- `INT 3` (`0xCC`) à l'adresse `0x00401300` — Utilisé comme anti-débogage : si un breakpoint logiciel est déjà placé à cette adresse, le `INT 3` ne déclenchera pas l'exception attendue
- `INT 2D` (`0xCD 0x2D`) à l'adresse `0x00401350` — Instruction spéciale qui, sous débogueur, saute l'octet suivant, alors qu'en exécution normale elle déclenche une exception

---

### Partie 3 — Contournement et Unpacking

**R3.1** — Modification du retour de IsDebuggerPresent (3 points) :

Séquence assembleur typique :
```assembly
00401000 | FF 15 3C204000 | call dword ptr ds:[<&IsDebuggerPresent>]
00401006 | 85 C0           | test eax,eax
00401008 | 74 0A           | je short facture.00401014
0040100A | 6A 00           | push 0
0040100C | FF 15 40204000 | call dword ptr ds:[<&ExitProcess>]
```

**Modification** :
1. Placer un breakpoint sur `00401006` (test eax,eax)
2. Quand le breakpoint se déclenche, modifier `EAX` à `0` (pas de débogueur détecté)
3. Ou modifier le `je` en `jmp` pour toujours prendre la branche "non détecté"
4. Ou NOPer l'appel à ExitProcess

**R3.2** — Contournement du timing check RDTSC (2 points) :

**Méthode 1** — Placer un breakpoint après la deuxième lecture RDTSC et modifier manuellement `EDX:EAX` pour que la différence soit inférieure au seuil.

**Méthode 2** — Utiliser ScyllaHide avec l'option "RDTSC" activée qui normalise automatiquement les valeurs.

**Méthode 3** — NOPer les instructions de comparaison et de branchement conditionnel après le timing check.

**Méthode 4** — Placer un breakpoint conditionnel qui se déclenche uniquement si la différence dépasse le seuil, puis modifier le registre.

**R3.3** — Recherche de l'OEP (4 points) :

Démarche :
1. **Méthode ESP** : Placer un breakpoint hardware sur la pile (ESP) après le prologue du packer. Quand le packer a terminé le décompression, le pointeur de pile revient à sa valeur initiale → breakpoint déclenché près de l'OEP.
2. **Méthode Memory Map** : Dans x64dbg, ouvrir `Memory Map`, repérer les sections avec `PAGE_EXECUTE_READWRITE` (typiquement la section unpackée), placer un breakpoint d'exécution sur cette section.
3. **Méthode STEP** : Suivre pas-à-pas jusqu'à trouver un `JMP` ou `CALL` vers une adresse dans une nouvelle section mémoire (indique le saut vers le code décompressé).
4. **Méthode Entropy** : Observer l'entropie des sections — une section packed a une entropie élevée (~7.5+), une section unpackée a une entropie normale (~5-6).

**R3.4** — Dumping avec Scylla (3 points) :

Étapes :
1. Placer le curseur sur l'OEP dans x64dbg
2. `Plugins > Scylla` (ou Ctrl+I)
3. Dans Scylla :
   - Vérifier que l'OEP est correctement détecté
   - Cliquer `IAT Autosearch` — Scylla recherche l'Import Address Table
   - Cliquer `Get Imports` — Scylla résout les fonctions importées
   - Vérifier qu'il n'y a pas d'imports invalides (rouge)
   - Cliquer `Dump` et sauvegarder le fichier unpacké
   - Cliquer `Fix Dump` pour reconstruire le binaire dumpé avec l'IAT corrigée
4. Vérifier le dump avec PE-bear ou CFF Explorer

---

### Partie 4 — Analyse de la logique métier

**R4.1** — Fonctions de vol de données (4 points) :

| Fonction (adresse) | Rôle |
|-------------------|------|
| `0x00402000` — `StealBrowserData` | Extrait les mots de passe, cookies et historique des navigateurs |
| `0x00402500` — `StealFTPCredentials` | Lit les fichiers de configuration FTP (FileZilla, WinSCP) |
| `0x00402A00` — `StealCryptoWallets` | Copie les fichiers de portefeuilles cryptomonnaies (Electrum, Exodus) |
| `0x00402F00` — `HarvestClipboard` | Capture le contenu du presse-papiers (adresses crypto) |
| `0x00403200` — `Keylog` | Installe un keylogger via SetWindowsHookEx |
| `0x00403500` — `ExfiltrateData` | Compresse et envoie les données volées au C2 |

**R4.2** — Cibles navigateurs (3 points) :

| Navigateur | Chemin cible | Données volées |
|------------|-------------|----------------|
| Chrome | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data` | Mots de passe SQLite |
| Chrome | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cookies` | Cookies de session |
| Firefox | `%APPDATA%\Mozilla\Firefox\Profiles\*.default\logins.json` | Mots de passe JSON |
| Firefox | `%APPDATA%\Mozilla\Firefox\Profiles\*.default\key4.db` | Clé de chiffrement NSS |
| Edge | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data` | Mots de passe SQLite |
| Edge | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Cookies` | Cookies de session |

**R4.3** — Fonction d'exfiltration (3 points) :
- **Protocole** : HTTPS (WinHttpOpen + WinHttpConnect + HttpOpenRequest)
- **Méthode** : POST vers `https://185.220.101.34/api/report`
- **Format** : JSON compressé (gzip) puis chiffré (AES-256-CBC)
- **Headers** : `Content-Type: application/octet-stream`, `User-Agent: Mozilla/5.0 (legitimate-looking)`
- **Données** : `{ "hwid": "<hash>", "os": "Windows 10", "data": "<base64_encrypted_blob>" }`

**R4.4** — Chiffrement (3 points) :
- **Algorithme** : AES-256-CBC
- **Clé** : Dérivée via BCryptGenerateSymmetricKey à partir d'un sel hardcodé dans le binaire
- **IV** : Premier bloc du fichier chiffré (préfixé)
- **Trouvée à l'adresse** : `0x00405000` — clé hardcode en `.data` section
- **Alternative** : RC4 avec clé XOR-encodée (plus simple, souvent utilisée dans les stealers)

---

### Partie 5 — Synthèse et contre-mesures

**R5.1** — Résumé technique (3 points) :

> **Type** : Stealer (voleur de données) avec keylogger
> **Capacités** : Vol de mots de passe navigateurs, cookies, credentials FTP, portefeuilles crypto, keylogger, capture clipboard
> **Cibles** : Chrome, Firefox, Edge, FileZilla, WinSCP, Electrum, Exodus
> **Exfiltration** : HTTPS POST vers C2, données chiffrées AES-256-CBC
> **Niveau de sophistication** : 3/5 — Techniques anti-débogage standard, packing custom, chiffrement solide mais pas de chiffrement de bout-en-bout avec clé unique par victime

**R5.2** — Règles YARA (3 points) :

```yara
rule StealerX64_BrowserTargets {
    meta:
        description = "Detects stealer targeting browser data"
        author = "CERT"
        date = "2024-01-15"
    strings:
        $path1 = "Login Data" ascii wide
        $path2 = "logins.json" ascii wide
        $path3 = "key4.db" ascii wide
        $path4 = "\\User Data\\Default\\" ascii wide
        $api1 = "Sqlite3Open" ascii
        $api2 = "NSS_Init" ascii
    condition:
        uint16(0) == 0x5A4D and 3 of ($path*) and 1 of ($api*)
}

rule StealerX64_NetworkExfil {
    meta:
        description = "Detects stealer network exfiltration"
    strings:
        $url = "/api/report" ascii
        $ua = "Mozilla/5.0" ascii
        $content = "application/octet-stream" ascii
        $hwid = "hwid" ascii
    condition:
        uint16(0) == 0x5A4D and 3 of them
}

rule StealerX64_AntiDebug {
    meta:
        description = "Detects anti-debugging techniques"
    strings:
        $int3 = { CC }
        $int2d = { CD 2D }
        $isdbg = "IsDebuggerPresent" ascii
        $ntquery = "NtQueryInformationProcess" ascii
        $rdtsc = { 0F 31 }
    condition:
        uint16(0) == 0x5A4D and 3 of them
}
```

**R5.3** — Règles Sigma (3 points) :

```yaml
title: Stealer Browser Data Access
id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
status: test
description: Detects suspicious access to browser credential files
author: CERT
date: 2024/01/15
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        TargetFilename|contains:
            - '\Login Data'
            - '\Cookies'
            - '\logins.json'
            - '\key4.db'
        SourceImage|contains:
            - '\Temp\'
            - '\Users\Public\'
    condition: selection
level: high

title: Suspicious HTTPS Exfiltration to Rare IP
id: b2c3d4e5-f6a7-8901-bcde-f12345678901
status: test
description: Detects HTTPS connections to rare IPs with suspicious user-agent
logsource:
    category: network_connection
    product: windows
detection:
    selection:
        DestinationPort: 443
        DestinationIp|startswith:
            - '185.220.'
        Initiated: 'true'
    filter:
        Image|endswith:
            - '\chrome.exe'
            - '\firefox.exe'
            - '\msedge.exe'
    condition: selection and not filter
level: critical

title: Anti-Debug API Calls from Suspicious Process
id: c3d4e5f6-a7b8-9012-cdef-123456789012
status: test
description: Detects processes calling anti-debugging APIs
logsource:
    category: api_calls
    product: windows
detection:
    selection:
        ApiName:
            - 'IsDebuggerPresent'
            - 'NtQueryInformationProcess'
            - 'CheckRemoteDebuggerPresent'
        CallerImage|contains:
            - '\Temp\'
            - '\Users\Public\'
    condition: selection
level: high
```

---

## 📊 Barème Récapitulatif

| Partie | Question | Points |
|--------|----------|--------|
| 1 — Configuration | Q1.1 | 2 |
| | Q1.2 | 3 |
| | Q1.3 | 1 |
| 2 — Anti-débogage | Q2.1 | 4 |
| | Q2.2 | 3 |
| | Q2.3 | 2 |
| 3 — Unpacking | Q3.1 | 3 |
| | Q3.2 | 2 |
| | Q3.3 | 4 |
| | Q3.4 | 3 |
| 4 — Logique métier | Q4.1 | 4 |
| | Q4.2 | 3 |
| | Q4.3 | 3 |
| | Q4.4 | 3 |
| 5 — Synthèse | Q5.1 | 3 |
| | Q5.2 | 3 |
| | Q5.3 | 3 |
| **TOTAL** | | **49** |

> **Note** : Le barème est sur 49 points, ramené à **20 points** pour la note finale.
> **Coefficient** : Note / 49 × 20

### Grille d'évaluation

| Note | Niveau |
|------|--------|
| 16-20 | Excellent — Maîtrise complète du débogage et de l'unpacking |
| 12-15 | Bon — Compétences solides en reverse engineering |
| 8-11 | Moyen — Bases acquises, pratique supplémentaire nécessaire |
| 4-7 | Insuffisant — Concepts mal maîtrisés, revoir l'assembleur |
| 0-3 | Très insuffisant — Revoir les fondamentaux du débogage |

---

## 📚 Ressources complémentaires

- **x64dbg** : https://x64dbg.com/
- **ScyllaHide** : https://github.com/x64dbg/ScyllaHide
- **Scylla (dumper)** : https://github.com/NtQuery/Scylla
- **PE-bear** : https://github.com/hasherezpe/pe-bear
- **Obfuscated Anti-Debug** : https://github.com/CheckPointSW/Evasions
- **Malware Unpacking Tutorials** : https://malwareunicorn.org/workshops/re101.html
