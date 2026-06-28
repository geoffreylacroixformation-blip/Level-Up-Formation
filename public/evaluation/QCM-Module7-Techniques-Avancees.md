# ÉVALUATION 4 : QCM — MODULE 7 (Techniques Avancées d'Analyse)

## Notation : /20 points (2 points par question)

**Durée : 30 minutes | Aucun document autorisé**

---

### Question 1 — Désassemblage
En rétro-ingénierie, quel est le rôle d'un désassembleur comme Ghidra ?

A) Exécuter le malware dans un environnement contrôlé
B) Convertir le code machine (binaire) en instructions assembleur lisibles par un humain
C) Supprimer les mécanismes d'obfuscation d'un binaire
D) Générer automatiquement des signatures YARA

---

### Question 2 — Table d'imports (IAT)
Que trouve-t-on dans la table d'imports (Import Address Table) d'un exécutable Windows ?

A) Les fonctions exportées par le programme
B) Les bibliothèques DLL et fonctions API que le programme appelle
C) Les adresses mémoire du code malveillant chiffré
D) Les métadonnées de compilation du programme

---

### Question 3 — Packing/Unpacking
Qu'est-ce qu'un malware "packed" (empaquété) ?

A) Un malware compressé pour réduire sa taille uniquement
B) Un malware enveloppé dans une couche de compression/chiffrement pour échapper à la détection statique
C) Un malware contenu dans plusieurs fichiers
D) Un malware chiffré avec AES-256 uniquement

---

### Question 4 — Obfuscation
Quelle technique N'EST PAS une méthode d'obfuscation de code ?

A) Substitution de noms de variables par des caractères aléatoires (variable renaming)
B) Ajout de code inutile (dead code insertion)
C) Chiffrement AES-256 du disque dur
D) Contrôle flow flattening (aplatissement du flux de contrôle)

---

### Question 5 — Anti-debugging
Quelle API Windows est couramment utilisée par les malware pour détecter un débogueur ?

A) MessageBoxA
B) IsDebuggerPresent
C) CreateFileW
D) RegOpenKeyEx

---

### Question 6 — Anti-VM
Quelle technique utilisent les malware pour détecter une machine virtuelle ?

A) Mesurer le temps d'exécution d'instructions (RDTSC)
B) Vérifier l'adresse MAC (préfixe VMware/VirtualBox)
C) Interroger le registre pour des clés VMware spécifiques
D) Toutes les réponses ci-dessus

---

### Question 7 — Shellcode
Qu'est-ce qu'un shellcode ?

A) Un programme complet au format PE
B) Un petit morceau de code utilisé comme payload lors d'une exploitation, qui ouvre généralement un shell
C) Un script PowerShell malveillant
D) Un fichier de configuration du malware

---

### Question 8 — Hooking
En analyse de malware, qu'est-ce que l'API hooking ?

A) La suppression d'appels système suspects
B) L'interception d'appels à des fonctions API pour surveiller ou modifier leur comportement
C) La modification du registre pour désactiver des services
D) L'injection de code dans un processus distant

---

### Question 9 — String obfuscation
Quelle technique est couramment utilisée pour obfusquer les chaînes de caractères dans un malware ?

A) Encodage Base64 uniquement
B) Chiffrement XOR, stack strings, ou decryption à l'exécution
C) Compression gzip
D) Suppression de toutes les chaînes

---

### Question 10 — Dump mémoire
Pourquoi effectue-t-on un dump mémoire (memory dump) lors de l'analyse dynamique ?

A) Pour accélérer l'exécution du programme
B) Pour capturer l'état de la mémoire à un instant T et analyser les payloads déchiffrés/décompressés
C) Pour supprimer le malware de la mémoire
D) Pour vérifier l'intégrité du système de fichiers

---

## CORRECTION QCM MODULE 7

| Question | Réponse | Explication |
|----------|---------|-------------|
| Q1 | **B** | Le désassembleur traduit le code binaire (machine) en assembleur. Ghidra génère aussi du pseudo-C. |
| Q2 | **B** | L'IAT liste les DLL importées et les fonctions API utilisées par l'exécutable. |
| Q3 | **B** | Le packing enveloppe le malware original dans une couche de compression/chiffrement pour échapper aux signatures. |
| Q4 | **C** | Le chiffrement AES-256 du disque dur est une technique de ransomware, pas une obfuscation de code. |
| Q5 | **B** | `IsDebuggerPresent` vérifie le flag PEEKBeingDebugged pour détecter un débogueur attaché. |
| Q6 | **D** | Les malware combinent vérification MAC, registre, et RDTSC pour détecter les VM. |
| Q7 | **B** | Un shellcode est un payload compact qui exécute typiquement un shell (cmd.exe / powershell). |
| Q8 | **B** | L'API hooking intercepte les appels API (ex: Detours, MinHook) pour surveiller le malware. |
| Q9 | **B** | XOR, stack strings et runtime decryption sont les techniques les plus courantes d'obfuscation de chaînes. |
| Q10 | **B** | Le dump mémoire capture l'état pour analyser le malware après déchiffrement en mémoire. |

---

---

