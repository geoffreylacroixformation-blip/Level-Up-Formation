# TP Module 2 — Format PE et Packing

## 🎯 Énoncé du TP

### Contexte

Vous êtes analyste en reverse engineering au sein d'une CSIRT (Computer Security Incident Response Team). Un échantillon de malware particulièrement sophistiqué a été intercepté lors d'une attaque ciblée. Contrairement au TP Module 1, ce sample (`packed_malware.exe`) utilise des techniques avancées de packing et d'obfuscation qui rendent l'analyse statique traditionnelle difficile.

Votre mission : comprendre en profondeur le **format PE (Portable Executable)**, identifier le packer utilisé, réaliser l'**unpacking** du binaire, puis analyser le code déballé pour identifier les capacités réelles du malware.

### Objectifs pédagogiques

- Maîtriser la structure complète du format PE (headers, sections, imports, exports)
- Comprendre les mécanismes de packing/unpacking
- Désassembler avec Ghidra et reconstruire la logique du programme
- Réaliser l'analyse post-unpacking
- Documenter les techniques d'évasion employées

### Outils mis à disposition

| Ouil | Usage |
|------|-------|
| **pestudio** | Headers PE, imports, resources |
| **CFF Explorer** | Édition/inspection détaillée du PE |
| **PEiD** | Identification de packers |
| **Ghidra** | Désassemblage et décompilation |
| **x64dbg / OllyDbg** | Débugging et unpacking manuel |
| **FLOSS** | Extraction de strings post-unpacking |
| **HxD** | Hexdump et édition binaire |
| **Detect It Easy (DIE)** | Détection avancée de packers/compilers |

### Fichiers à analyser

```
Nom : packed_malware.exe
SHA256 : 7d793037a0760186574b0282f2f435e718d57f8a8c3e8d45d94e30c9e400598b
Taille : ~1.2 MB (packé) / ~3.8 MB estimé (dépacké)
Source : Capture réseau lors d'un phishing ciblé
```

---

## 📝 Questions progressives

### Partie 1 — Structure du format PE (4 points)

**Q1.1** (1 pt) — À l'aide de **pestudio** ou **CFF Explorer**, identifiez les champs suivants du header PE :

| Champ | Valeur |
|-------|--------|
| Magic number | |
| Machine | |
| NumberOfSections | |
| TimeDateStamp | |
| SizeOfOptionalHeader | |
| Characteristics | |
| Subsystem | |
| Entry Point (RVA) | |

Complétez le tableau avec les valeurs observées et interprétez chacune d'elles.

**Q1.2** (1 pt) — Localisez l'**AddressOfEntryPoint (AOE)** dans le PE. À quelle section appartient-il ? Cette section a-t-elle les flags `IMAGE_SCN_MEM_EXECUTE` ? Justifiez pourquoi ce point est critique.

**Q1.3** (1 pt) — Examinez la **Import Address Table (IAT)**. Combien de DLLs sont listées dans le Import Directory contre combien sont réellement dans le fichier ? Y a-t-il une discordance ? Que suggère-t-elle ?

**Q1.4** (1 pt) — Identifiez si le PE contient des **ressources** (onglet resources dans pestudio). Si oui, quel(s) type(s) de ressources sont présents ? Une ressource de type `RT_RCDATA` avec une taille de 800 KB vous semble-t-elle légitime ? Pourquoi ?

---

### Partie 2 — Identification et analyse du packer (5 points)

**Q2.1** (1 pt) — Utilisez **PEiD** et **Detect It Easy (DIE)** pour identifier le packer. Comparez les résultats. Quel packer est détecté ? Quelle est sa signature ?

**Q2.2** (1 pt) — Analysez l'entropie de chaque section avec DIE ou pestudio :

| Section | Entropie | Interprétation |
|---------|----------|----------------|
| .text | ? | |
| .rdata | ? | |
| .data | ? | |
| .rsrc | ? | |
| [section packer] | ? | |

Quelles sections ont une entropie anormale ? Que cela implique-t-il ?

**Q2.3** (1.5 pt) — Les propriétés suivantes sont-elles présentes dans le PE ? Pourchaque réponse, expliquez les implications :

- **TLS Callbacks** : présents ou absents ?
- **Debug Directory** : présent ou stripped ?
- **Relocations** (.reloc) : présentes ou stripped ?
- **Rich Header** : présent ou absent ?

Chacune de ces caractéristiques est-elle compatible avec un packing ? Pourquoi ?

**Q2.4** (1.5 pt) — Examinez la section packer (ex: `UPX0`, `.packed`, `.ndata`). Quel est le rapport entre la **Virtual Size** et la **Raw Size** de cette section ? Comparez avec la section `.text` originale. Que déduisez-vous sur le mécanisme de décompression ?

---

### Partie 3 — Unpacking (5 points)

**Q3.1** (1.5 pt) — Lancez le binaire dans **x64dbg** et appliquez la méthode **"pushad/popad" unpacking** :

1. Cherchez l'instruction `pushad` au niveau de l'OEP (Original Entry Point)
2. Placez un breakpoint sur l'instruction `popad` correspondante
3. Exécutez jusqu'au breakpoint
4. Cherchez l'influence `jmp` ou `ret` qui saute vers le véritable OEP

Notez l'adresse du véritable OEP. Dans quelle section se trouve-t-il ?

**Q3.2** (1 pt) — Utilisez **Scylla** (plugin x64dbg) pour :
1. Dump le processus dépacké depuis la mémoire
2. Reconstruire l'IAT (Import Address Table)

Quel outil utilisez-vous et quels flags spécifiez-vous pour la recherche des imports ? (IAT Autosearch → Get Imports → Fix Dump)

**Q3.3** (1 pt) — Après dump, essayez d'ouvrir le fichier résultant dans pestudio. L'outil parvient-il à parser le PE ? Si non, quels headers sont corrompus ? Proposez une méthode pour les réparer (pointeurs invalides,Magic number, etc.).

**Q3.4** (1.5 pt) — Vérifiez l'intégrité du fichier dumpé :
- Le MZ header est-il intact ?
- Le PE signature (`PE\0\0`) est-elle présente ?
- L'OEP pointe-t-il vers une adresse cohérente ?

Calculez la correspondance entre les adresses virtuelles (VA) et les offsets Raw. Si une section a `VirtualAddress = 0x1000` et `PointerToRawData = 0x400`, à quel offset raw correspond l'adresse virtuelle `0x1234` ?

---

### Partie 4 — Analyse du code dépacké avec Ghidra (4 points)

**Q4.1** (1 pt) — Importez le binaire dépacké dans **Ghidra** :
1. Créez un nouveau projet
2. Importez le fichier dumpé
3. Sélectionnez le langage `x86:LE:32:default` (ou 64-bit si applicable)
4. Lancez l'analyse automatique avec les options par défaut

Combien de fonctions ont été identifiées ? Combien sont marquées comme "external" (importées) ?

**Q4.2** (1 pt) — Naviguez vers la fonction `main` (ou `entry`). Dans la vue de décompilation, identifiez :
- La structure du point d'entrée (WinMain vs main vs DllMain)
- Les variables locales allouées
- Les appels API effectués dans les 20 premières lignes

**Q4.3** (1 pt) — Cherchez dans Ghidra les patterns suivants et documentez vos trouvailles :
- **String references** : quels strings sont visibles maintenant que le binaire est dépacké ?
- **Cross-references (XREFs)** : quelles fonctions appellent `CreateProcessA` ou `WinExec` ?
- **Function calls graph** : tracez le graphe d'appels depuis `entry` vers les fonctions réseau

**Q4.4** (1 pt) — Identifiez dans le code dépacké une fonction qui semble implémenter un **chiffrement XOR** ou **RC4**. Décrivez les indices qui vous ont permis de l'identifier (constantes, boucles, opérations logiques).

---

### Partie 5 — Rapport technique et signatures (2 points)

**Q5.1** (1 pt) — Rédigez un rapport de 10-15 lignes décrivant :
- Le packer identifié et sa version
- La méthode d'unpacking utilisée
- Les capacités du malware découvertes après unpacking
- Les IOCs supplémentaires révélés par l'analyse post-unpacking

**Q5.2** (1 pt) — Produisez une règle **Sigma** pour la détection de ce malware au niveau système (logs Windows, événements Sysmon).

---

## ✅ Correction détaillée (Barème /20)

---

### Partie 1 — Structure du format PE (4 points)

#### Q1.1 — Champs du header PE (1 pt)

**Correction :**

| Champ | Valeur | Interprétation |
|-------|--------|----------------|
| Magic number | `0x5A4D` ("MZ") | Signature DOS header valide |
| Machine | `0x14C` (IMAGE_FILE_MACHINE_I386) | Architecture x86 32-bit |
| NumberOfSections | `3` ou `6` | Nombre de sections (anormal si très faible) |
| TimeDateStamp | `0x5F1A2B3C` ou falsifié | Date de compilation (vérifier cohérence) |
| SizeOfOptionalHeader | `0xE0` | Taille standard pour PE32 |
| Characteristics | `0x102F` | Exécutable, 32-bit, stripped relocs |
| Subsystem | `2` (IMAGE_SUBSYSTEM_WINDOWS_GUI) | Application graphique |
| Entry Point (RVA) | `0x9000` ou dans section packer | Point d'entrée (souvent dans la section packer) |

→ **0.5 pt pour le tableau complété + 0.5 pt pour les interprétations**

#### Q1.2 — AddressOfEntryPoint (1 pt)

**Correction :**
- L'AOE pointe vers la section packer (ex: `UPX1`, `.packed`) → **0.33 pt**
- Cette section a le flag `IMAGE_SCN_MEM_EXECUTE` (0x20000000) → **0.33 pt**
- **Pourquoi c'est critique** : Dans un PE normal, l'OEP pointe vers `.text` (code compilé). Si l'OEP pointe vers une section packer, cela signifie que le vrai code est chiffré/compressé et sera décompressé à l'exécution. C'est un indicateur de packing quasi-certain. → **0.34 pt**

#### Q1.3 — Import Address Table (1 pt)

**Correction :**
- Le Import Directory liste très peu de DLLs (souvent seulement `kernel32.dll` et `ntdll.dll`) → **0.5 pt**
- Discordance : un malware fonctionnel a besoin de nombreuses APIs (réseau, registre, fichiers). Si l'IAT est minimale, les imports sont **résolus dynamiquement** via `LoadLibrary` + `GetProcAddress` → technique classique des packers pour cacher les véritables capacités → **0.5 pt**

#### Q1.4 — Ressources (1 pt)

**Correction :**
- Présence de ressources : `RT_RCDATA` (données binaires arbitraires) → **0.33 pt**
- Une ressource `RT_RCDATA` de 800 KB est **très suspecte** → **0.33 pt**
- Explications :
  - Le payload chiffré est souvent stocké dans les ressources pour échapper à la détection statique
  - Le code packer lit la ressource, la déchiffre en mémoire, puis l'exécute
  - Technique dite de "resource-hiding" ou "stager"
→ **0.34 pt**

---

### Partie 2 — Identification et analyse du packer (5 points)

#### Q2.1 — Identification avec PEiD et DIE (1 pt)

**Correction :**
- PEiD : peut détecter "UPX 3.9x", "Themida", "VMProtect", "ASPack", etc.
- DIE : donne plus d'informations (entropie, overlay, compiler/packer, linker)
- Comparaison : PEiD utilise des signatures statiques (peut échouer sur packer modifié), DIE utilise des heuristiques + signatures → **0.5 pt**
- Résultat typique : "UPX 3.96 - Markus Oberhumer, Laszlo Molnar & John Reiser" ou "VMProtect 3.x" → **0.5 pt**

#### Q2.2 — Entropie des sections (1 pt)

**Correction :**

| Section | Entropie | Interprétation |
|---------|----------|----------------|
| .text | 2.1 | Section vide ou stub de décompression (normal pour packé) |
| .rdata | 5.8 | Données normales (strings, imports) |
| .data | 4.2 | Données initialisées normales |
| .rsrc | 7.9 | **ANORMAL** — ressources chiffrées/compressées |
| UPX0 | 0.0 | Section vide (espace pour décompression) |
| UPX1 | 7.95 | **ANORMAL** — code packé/chiffré |

- Sections avec entropie > 7.5 : `UPX1`, `.rsrc` → **0.5 pt**
- Implication : ces sections contiennent des données chiffrées ou compressées qui seront déballées en mémoire à l'exécution → **0.5 pt**

#### Q2.3 — Propriétés spéciales du PE (1.5 pt)

**Correction :**

| Propriété | Présence | Implication |
|-----------|----------|-------------|
| **TLS Callbacks** | Absents | Si présents : code exécuté AVANT l'OEP (anti-debug) |
| **Debug Directory** | Stripped | Suppression des infos de debug = anti-analyse |
| **Relocations** | Stripped | Le PE ne peut pas être rebasé (ASLR inactif) — fréquent chez les packers |
| **Rich Header** | Présent | Contient des infos sur le compilateur Microsoft utilisé |

→ **0.375 pt par propriété correctement identifiée et expliquée**

#### Q2.4 — Virtual Size vs Raw Size (1.5 pt)

**Correction :**
- Section packer (ex: `UPX1`) : Virtual Size = 0x50000, Raw Size = 0x4E800 → presque identique → **0.5 pt**
- Section de destination (ex: `UPX0`) : Virtual Size = 0x80000, Raw Size = 0x0 → **énorme différence** → **0.5 pt**
- Déduction : `UPX0` est une section vide sur disque mais qui sera allouée en mémoire pour recevoir le code décompressé. C'est le mécanisme classique d'UPX : le code est compressé dans `UPX1` et sera décompressé dans `UPX0` à l'exécution. → **0.5 pt**

---

### Partie 3 — Unpacking (5 points)

#### Q3.1 — Méthode pushad/popad (1.5 pt)

**Correction :**
1. Au point d'entrée (OEP packer), le packer sauvegarde tous les registres avec `pushad` → **0.3 pt**
2. Le stub de décompression s'exécute → **0.3 pt**
3. À la fin, `popad` restaure les registres → **0.3 pt**
4. Immédiatement après, un `jmp` ou `ret` saute vers le véritable OEP (souvent un grand saut : `jmp 0x00401000`) → **0.3 pt**
5. Le véritable OEP se trouve dans la section `.text` (section de destination) → **0.3 pt**

**Alternative** : méthode ESP trick — placer un breakpoint hardware sur ESP après `pushad` pour attraper le moment où le code déballé est accessible.

#### Q3.2 — Reconstruction avec Scylla (1 pt)

**Correction :**
1. À l'OEP véritable, ouvrir Scylla dans x64dbg → **0.25 pt**
2. **IAT Autosearch** : Scylla scanne la mémoire pour trouver l'Import Address Table reconstruite → **0.25 pt**
3. **Get Imports** : extrait les fonctions valides et invalides → **0.25 pt**
4. **Fix Dump** : applique le dump mémoire + la reconstruction IAT dans un nouveau fichier → **0.25 pt**

#### Q3.3 — Vérification du dump (1 pt)

**Correction :**
- Le dump peut ne pas être directement ouvrable car :
  - Les headers peuvent être corrompus pendant le dump
  - L'IAT reconstruite peut avoir des pointeurs invalides
  - Les tailles de sections peuvent ne pas correspondre
→ **0.5 pt pour l'identification des problèmes**
- Méthode de réparation :
  - Ouvrir dans CFF Explorer et corriger les `SizeOfImage`, `SizeOfHeaders`
  - Réaligner les sections si nécessaire
  - Utiliser Scylla "Dump" puis "Dump Fix" pour réparer automatiquement
→ **0.5 pt pour la méthode**

#### Q3.4 — Intégrité et calcul d'offsets (1.5 pt)

**Correction :**
- **MZ header** : doit commencer par `4D 5A` (bytes 0x00-0x01) → **0.25 pt**
- **PE signature** : à l'offset pointé par `e_lfanew` (généralement 0x80 ou 0xC0), doit contenir `50 45 00 00` → **0.25 pt**
- **OEP cohérent** : doit pointer vers une adresse dans une section exécutable → **0.25 pt**

**Calcul d'offset :**
```
Formule : RawOffset = VA - VirtualAddress + PointerToRawData

VA = 0x1234
VirtualAddress = 0x1000
PointerToRawData = 0x400

RawOffset = 0x1234 - 0x1000 + 0x400 = 0x634
```
→ **0.5 pt pour la formule + 0.25 pt pour le calcul**

---

### Partie 4 — Analyse du code dépacké avec Ghidra (4 points)

#### Q4.1 — Import dans Ghidra (1 pt)

**Correction :**
- Ghidra identifie typiquement 150-400 fonctions dans un malware dépacké → **0.5 pt**
- Fonctions "external" : 30-80 (les imports résolus) → **0.5 pt**
- Si Ghidra ne trouve que 5-10 fonctions, c'est que le dump est incorrect ou que le code est encore obfusqué

#### Q4.2 — Fonction main/entry (1 pt)

**Correction :**
- Structure typique d'un `WinMain` dépacké :
```c
int __stdcall WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, 
                       LPSTR lpCmdLine, int nCmdShow) {
    // Initialisation
    // Appel à la fonction principale du malware
    // Boucle de traitement ou attente
}
```
- Variables locales : buffers pour déchiffrement, handles, structures
- Appels API : `LoadLibrary`, `GetProcAddress`, `VirtualAlloc`, `CreateThread`
→ **0.5 pt pour la structure + 0.5 pt pour les appels API**

#### Q4.3 — Patterns dans Ghidra (1 pt)

**Correction :**
- **String references** : après unpacking, les strings C2, les chemins de fichiers, les clés de registre deviennent visibles → **0.33 pt**
- **XREFs vers CreateProcessA/WinExec** : identifie les fonctions qui lancent des processus externes (injection, exécution de payload secondaire) → **0.33 pt**
- **Function call graph** : depuis `entry` → `WinMain` → fonction principale → sous-fonctions réseau (souvent nommées par Ghidra comme `FUN_00401234`) → **0.34 pt**

#### Q4.4 — Identification de chiffrement (1 pt)

**Correction :**
Indices d'un chiffrement XOR dans le code :
```c
// Pattern XOR typique
for (i = 0; i < data_len; i++) {
    decrypted[i] = encrypted[i] ^ key[i % key_len];
}
```

Indices visibles dans Ghidra :
- Boucle avec opération `XOR` (`^` en C)
- Constante hexa récurrente (clé XOR) : `0xDEADBEEF`, `0x5A`, etc.
- Appel à `VirtualAlloc` suivi d'une boucle XOR (déchiffrement en mémoire)
- RC4 : présence de tableau S-box (256 bytes), boucle d'initialisation (KSA), boucle de génération (PRGA)

→ **0.5 pt pour les indices + 0.5 pt pour la description du pattern**

---

### Partie 5 — Rapport technique et signatures (2 points)

#### Q5.1 — Rapport technique (1 pt)

**Correction (exemple) :**

> **Rapport d'analyse post-unpacking — packed_malware.exe**
>
> **Packer identifié** : UPX 3.96 modifié (signature altérée, sections renommées). Détection confirmée par entropie élevée (7.95) sur section UPX1 et présence du stub de décompression caractéristique.
>
> **Méthode d'unpacking** : Unpacking manuel via x64dbg. Méthode pushad/popad appliquée avec succès. Véritable OEP identifié à 0x00401234 (section .text). Reconstruction IAT effectuée avec Scylla (47 imports récupérés).
>
> **Capacités du malware dépacké** : Le binaire est un **Cobalt Strike Beacon** modifié. Capabilities : injection DLL reflective, communication C2 via HTTPS (malleable profile), exécution de commandes PowerShell, keylogging, screenshot, exfiltration via DNS tunneling.
>
> **IOCs supplémentaires** : C2 domain `update-msedge[.]net`, JA3 fingerprint `e7d705a3286e19ea42f587b344ee6865`, Mutex `Global\MSF_UPDATER_42`, User-Agent personnalisé `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`.

→ **1 pt** pour un rapport complet et professionnel

#### Q5.2 — Règle Sigma (1 pt)

**Correction :**

```yaml
title: Malware Packed UPX Modified - Post-Unpacking Detection
id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
status: stable
description: Detects the unpacked malware based on behavioral indicators
author: CSIRT Analyst
date: 2026/06/28
references:
    - Internal analysis TP Module 2
logsource:
    category: process_creation
    product: windows
detection:
    selection_process:
        ParentImage|endswith: '\explorer.exe'
        Image|endswith: '\rundll32.exe'
    selection_commandline:
        CommandLine|contains:
            - 'DllRegisterServer'
            - 'UpdateCheck'
    selection_network:
        DestinationPort: 443
        DestinationHostname|endswith:
            - 'update-msedge.net'
            - 'cdn-updateservice.net'
    condition: selection_process and selection_commandline or selection_network
falsepositives:
    - Legitimate Windows updates (verify with User-Agent)
level: high
tags:
    - attack.command_and_control
    - attack.t1071.001
    - attack.t1055
```

→ **1 pt** pour une règle Sigma syntaxiquement correcte et pertinente

---

## 📊 Grille de notation finale

| Partie | Compétence évaluée | Points |
|--------|-------------------|--------|
| 1 | Structure du format PE | /4 |
| 2 | Identification et analyse du packer | /5 |
| 3 | Unpacking | /5 |
| 4 | Analyse post-unpacking avec Ghidra | /4 |
| 5 | Rapport technique et signatures | /2 |
| **TOTAL** | | **/20** |

### Appréciation

| Note | Appréciation |
|------|-------------|
| 17-20 | Excellent — Prêt pour l'analyse de malware avancé |
| 14-16 | Bon — Bonne maîtrise du format PE et de l'unpacking |
| 10-13 | Moyen — Notions acquises, pratique de l'unpacking nécessaire |
| 5-9 | Insuffisant — Révision du format PE et des techniques de packing |
| 0-4 | Échec — Reprise complète du module nécessaire |

### Ressources complémentaires

- **Microsoft PE Format** : https://learn.microsoft.com/en-us/windows/win32/debug/pe-format
- **Ghidra Tutorial** : https://ghidra-sre.org/CheatSheet.html
- **x64dbg Documentation** : https://x64dbg.com/
- **Scylla** : https://github.com/NtQuery/Scylla
- **Malware Unicorn Reverse Engineering 101** : https://malwareunicorn.org/workshops/re101.html

---

*TP Module 2 — Analyse de Malware LVL2 — Level Up Formation*
