# TP Module 5 — Analyse Dynamique de Malware

## 📋 Énoncé du TP

### Contexte
Vous êtes analyste SOC (Security Operations Center) dans une entreprise de prestation de services financiers. Le centre de support a reçu un appel d'un utilisateur signalant un comportement étrange sur son poste Windows 10 : ralentissements inhabituels, connexions réseau suspectes en arrière-plan, et des fichiers qui apparaissent de manière aléatoire dans le dossier `C:\Users\Public\Documents\`.

L'utilisateur a retrouvé sur son bureau un fichier nommé `facture_2024.pdf.exe` qu'il ne se souvient pas avoir téléchargé. Le fichier a été isolé et vous est remis pour analyse dynamique.

### Objectifs
Ce TP vous amène à :
1. Mettre en place un environnement d'analyse dynamique sécurisé
2. Utiliser **Process Monitor (Procmon)** pour surveiller les activités fichier, registre et processus
3. Utiliser **API Monitor** pour tracer les appels API Windows du malware
4. Utiliser **ProcDOT** pour visualiser le graphe de comportement
5. Rédiger un rapport d'analyse dynamique complet avec IOC identifiés

### Durée estimée : 3 heures

### Prérequis
- Machine virtuelle Windows 10 (isolée, sans accès réseau production)
- Outils installés : Process Monitor, API Monitor, ProcDOT, Noriben (optionnel)
- Échantillon malware : `facture_2024.pdf.exe` (fourni par l'instructeur)

---

## 📝 Questions Progressives

### Partie 1 — Mise en place de l'environnement (15 min)

**Q1.1** — Quelles sont les précautions indispensables avant de lancer l'analyse dynamique d'un malware ? Citez-en au moins 4. *(2 points)*

**Q1.2** — Pourquoi est-il recommandé de configurer un réseau NAT ou un réseau interne (host-only) plutôt qu'un pont réseau (bridged) pour la VM d'analyse ? *(1 point)*

**Q1.3** — Quel est l'intérêt de créer un snapshot de la VM avant l'exécution du malware ? *(1 point)*

---

### Partie 2 — Analyse avec Process Monitor (Procmon) (45 min)

**Q2.1** — Lancez Procmon avec les filtres appropriés pour capturer uniquement les événements liés au processus `facture_2024.pdf.exe`. Décrivez la procédure de configuration des filtres. *(3 points)*

**Q2.2** — Exécutez le malware et observez les événements suivants. Pour chaque catégorie, identifiez au moins 3 actions suspectes :

| Catégorie | Actions observées | Interprétation |
|-----------|-------------------|----------------|
| File System | | |
| Registry | | |
| Process | | |
| Network | | |

*(4 points)*

**Q2.3** — Identifiez les clés de registre modifiées pour la persistance du malware. Quelles clés sont typiquement utilisées par les malwares pour assurer leur exécution au démarrage ? *(2 points)*

**Q2.4** — Le malware crée-t-il des fichiers sur le disque ? Si oui, où et avec quels noms ? *(2 points)*

---

### Partie 3 — Analyse avec API Monitor (30 min)

**Q3.1** — Configurez API Monitor pour surveiller les catégories d'API suivantes :
- `Kernel32.dll` (CreateFile, WriteFile, CreateProcess)
- `Advapi32.dll` (RegSetValue, RegCreateKey)
- `Ws2_32.dll` / `Wininet.dll` (connexions réseau)

Décrivez la procédure de configuration. *(2 points)*

**Q3.2** — Lors de l'exécution, quelles appels `CreateProcess` ou `CreateRemoteThread` sont observés ? Quel est leur rôle dans le comportement du malware ? *(3 points)*

**Q3.3** — Identifiez les appels réseau (connect, send, recv). Vers quelle adresse IP/domaine le malware tente-t-il de se connecter ? Sur quel port ? *(2 points)*

---

### Partie 4 — Visualisation avec ProcDOT (20 min)

**Q4.1** — Exportez la capture Procmon au format CSV et importez-la dans ProcDOT. Générez le graphe de comportement. *(2 points)*

**Q4.2** — Analysez le graphe généré :
- Combien de processus enfants sont créés ?
- Quelles sont les relations parent/enfant identifiées ?
- Quels fichiers sont lus/modifiés/supprimés ?

*(3 points)*

**Q4.3** — Identifiez dans le graphe les nœuds critiques (activités les plus suspectes) et justifiez votre sélection. *(2 points)*

---

### Partie 5 — Rapport d'analyse et IOC (30 min)

**Q5.1** — Rédigez un rapport d'analyse dynamique structuré comprenant :
- Résumé exécutif
- Méthodologie utilisée
- Comportement observé (chronologique)
- Indicateurs de compromission (IOC)
- Recommandations de remédiation

*(5 points)*

**Q5.2** — Produisez la liste des IOC identifiés :

| Type | Valeur | Description |
|------|--------|-------------|
| Hash MD5 | | |
| Hash SHA256 | | |
| Nom de fichier | | |
| Chemin de fichier | | |
| Clé de registre | | |
| Adresse IP | | |
| Domaine | | |
| Port | | |

*(3 points)*

---

## ✅ Correction Détaillée

### Partie 1 — Mise en place de l'environnement

**R1.1** — Précautions indispensables (2 points, 0.5 par réponse correcte) :
1. **Isolation réseau** : La VM doit être sur un réseau isolé (NAT ou host-only) pour empêcher la propagation du malware vers le réseau production
2. **Snapshot** : Créer un snapshot propre de la VM avant toute analyse pour pouvoir revenir à un état sain
3. **Désactivation du partage de dossiers/clipboard** : Empêcher toute fuite de données entre la VM et l'hôte
4. **Outils de surveillance pré-installés** : Procmon, API Monitor doivent être configurés AVANT l'exécution du malware
5. **Désactivation de Windows Defender** (ou exclusion) : Pour éviter que le malware ne soit intercepté avant l'analyse
6. **Utilisation d'un compte non-privilégié** : Limiter les droits du malware pendant l'analyse

**R1.2** — Réseau NAT/host-only vs bridged (1 point) :
Un réseau bridged donne à la VM un accès direct au réseau physique, ce qui permettrait au malware de :
- Se propager vers d'autres machines du réseau
- Contacter son serveur C2 (Command & Control) via le réseau de l'entreprise
- Exfiltrer des données vers Internet

Le NAT ou host-only isole la VM tout en permettant (si nécessaire) un contrôle du trafic via un proxy ou un simulateur Internet (INetSim).

**R1.3** — Intérêt du snapshot (1 point) :
Le snapshot permet de sauvegarder l'état exact de la VM (disque, mémoire, configuration) avant l'exécution du malware. Après l'analyse, on peut revenir instantanément à cet état propre pour :
- Répéter l'analyse avec des paramètres différents
- Nettoyer la VM sans la réinstaller
- Conserver une référence de l'état initial pour comparaison

---

### Partie 2 — Analyse avec Process Monitor

**R2.1** — Configuration des filtres Procmon (3 points) :

Procédure :
1. Lancer Procmon en administrateur
2. `Filter > Filter...` (Ctrl+L)
3. Ajouter un filtre : `Process Name` → `is` → `facture_2024.pdf.exe` → `Include`
4. Ajouter éventuellement un second filtre pour le processus enfant si connu
5. Cliquer `Add` puis `OK`
6. Activer les colonnes : `Process Name`, `Operation`, `Path`, `Result`, `Detail`
7. Configurer l'export : `File > Save > Format CSV`

Points clés :
- Filtrer AVANT l'exécution pour éviter le bruit des autres processus
- Désactiver la capture des événements réseau si non nécessaire (réduit le volume)
- Utiliser `Drop Filtered Events` pour ne pas saturer la mémoire

**R2.2** — Tableau des actions suspectes (4 points, 1 par catégorie correctement remplie) :

| Catégorie | Actions observées (exemples types) | Interprétation |
|-----------|-----------------------------------|----------------|
| File System | Création de `C:\Users\Public\Documents\svchost.exe` ; Copie de l'exécutable dans System32 ; Création de fichiers `.tmp` dans le dossier Temp | Persistance via copie dans un nom de processus légitime ; Tentative de se faire passer pour un fichier système |
| Registry | Modification de `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` ; Création de `HKLM\SYSTEM\CurrentControlSet\Services\MalService` | Persistance au démarrage utilisateur ; Tentative d'enregistrement comme service système |
| Process | `CreateProcess` vers `cmd.exe /c del facture_2024.pdf.exe` ; `CreateProcess` vers le fichier copié `svchost.exe` ; `TerminateProcess` de l'original | Suppression de la charge initiale après copie ; Exécution de la copie persistante |
| Network | Connexion vers `185.220.101.34:443` ; Requête DNS vers `c2-malware.xyz` ; Tentative de connexion HTTP vers `/gate.php` | Communication C2 chiffrée (HTTPS) ; Exfiltration potentielle de données |

**R2.3** — Clés de registre de persistance (2 points) :

Clés typiques utilisées par les malwares :
- `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` — Exécution au démarrage de l'utilisateur
- `HKLM\Software\Microsoft\Windows\CurrentVersion\Run` — Exécution au démarrage (tous utilisateurs)
- `HKLM\SYSTEM\CurrentControlSet\Services\` — Enregistrement comme service système
- `HKCU\Software\Microsoft\Windows\CurrentVersion\RunOnce` — Exécution unique au prochain démarrage
- `HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Userinit` — Injection dans le processus de logon

**R2.4** — Fichiers créés (2 points) :
- `C:\Users\Public\Documents\svchost.exe` — Copie du malware sous un nom trompeur
- `C:\Windows\Temp\tmp4A2F.tmp` — Fichier temporaire (potentiellement des données à exfiltrer)
- `C:\Users\<user>\AppData\Local\Temp\payload.dat` — Données chiffrées pour le C2

---

### Partie 3 — Analyge avec API Monitor

**R3.1** — Configuration d'API Monitor (2 points) :

Procédure :
1. Lancer API Monitor en administrateur
2. `File > Monitor New Process` et sélectionner le chemin du malware
3. Dans l'onglet `API Filters`, cocher :
   - `Kernel32.dll` → `CreateFileW`, `WriteFile`, `CreateProcessW`, `CreateRemoteThread`, `WinExec`, `ShellExecuteW`
   - `Advapi32.dll` → `RegSetValueExW`, `RegCreateKeyExW`, `RegOpenKeyExW`, `CreateServiceW`
   - `Wininet.dll` → `InternetOpenW`, `InternetConnectW`, `HttpOpenRequestW`, `HttpSendRequestW`
   - `Ws2_32.dll` → `connect`, `send`, `recv`, `WSAConnect`
4. Cliquer `Start Monitoring`

**R3.2** — Appels CreateProcess/CreateRemoteThread (3 points) :

Observations typiques :
- `CreateProcess("cmd.exe", "/c del facture_2024.pdf.exe", ...)` — Le malware supprime son fichier d'origine après s'être copié
- `CreateProcess(NULL, "C:\Users\Public\Documents\svchost.exe", ...)` — Exécution de la copie persistante
- `CreateRemoteThread` dans `explorer.exe` — Injection de code dans un processus légitime pour masquer l'activité

Rôle : Le malware utilise ces API pour :
1. Se supprimer après exécution (anti-forensique)
2. Lancer sa copie persistante
3. S'injecter dans un processus légitime (process hollowing/injection)

**R3.3** — Appels réseau (2 points) :
- `connect()` vers `185.220.101.34:443` — Connexion HTTPS vers le serveur C2
- `HttpOpenRequestW` vers `c2-malware.xyz/gate.php` — Requête HTTP POST (exfiltration)
- `send()` avec des données chiffrées — Exfiltration de données système (hostname, username, IP)

---

### Partie 4 — Visualisation avec ProcDOT

**R4.1** — Génération du graphe (2 points) :
1. Exporter la capture Procmon : `File > Save > Format: CSV`
2. Lancer ProcDOT
3. `File > Import > Process Monitor Log`
4. Sélectionner le CSV et le fichier de configuration (optionnel)
5. `Generate Graph` — ProcDOT produit un graphe orienté montrant les relations processus/fichiers

**R4.2** — Analyse du graphe (3 points) :
- **Processus enfants** : 3 processus enfants identifiés (cmd.exe, svchost.exe copié, et un thread injecté dans explorer.exe)
- **Relations parent/enfant** :
  - `facture_2024.pdf.exe` → `cmd.exe` (suppression)
  - `facture_2024.pdf.exe` → `svchost.exe` (copie persistante)
  - `facture_2024.pdf.exe` → `explorer.exe` (injection)
- **Fichiers** : 2 fichiers créés, 1 supprimé, 3 clés de registre modifiées

**R4.3** — Nœuds critiques (2 points) :
1. **Nœud "svchost.exe"** (fichier créé) — Indique la persistance, c'est le mécanisme principal de survie du malware
2. **Nœud "explorer.exe"** (injection) — Indique une technique d'évasion avancée (process injection)
3. **Nœud "185.220.101.34:443"** (connexion réseau) — Indique la communication C2, point de contrôle de l'attaquant

---

### Partie 5 — Rapport d'analyse et IOC

**R5.1** — Structure du rapport (5 points) :

**Résumé exécutif** (1 pt) :
> Le fichier `facture_2024.pdf.exe` est un trojan de type "dropper" avec capacités de persistance et de communication C2. Il se copie sous le nom `svchost.exe` dans un dossier public, modifie le registre pour la persistance, s'injecte dans explorer.exe et établit une connexion HTTPS vers un serveur de commande.

**Méthodologie** (1 pt) :
> Analyse dynamique réalisée sur VM Windows 10 isolée. Outils : Process Monitor v3.90, API Monitor v2.0, ProcDOT v1.1. Exécution de 5 minutes avec capture complète.

**Comportement observé** (1 pt) :
> 1. Exécution de `facture_2024.pdf.exe`
> 2. Copie vers `C:\Users\Public\Documents\svchost.exe`
> 3. Modification de la clé Run pour persistance
> 4. Suppression du fichier original via cmd.exe
> 5. Exécution de la copie persistante
> 6. Injection dans explorer.exe
> 7. Connexion HTTPS vers 185.220.101.34:443
> 8. Requête DNS vers c2-malware.xyz

**IOC** (1 pt) — voir R5.2

**Recommandations** (1 pt) :
> - Bloquer l'IP 185.220.101.34 et le domaine c2-malware.xyz au firewall
> - Supprimer la clé de registre de persistance
> - Supprimer le fichier `C:\Users\Public\Documents\svchost.exe`
> - Scanner tous les postes du réseau avec les IOC fournis
> - Former les utilisateurs à ne pas ouvrir les fichiers `.pdf.exe`

**R5.2** — Liste des IOC (3 points) :

| Type | Valeur | Description |
|------|--------|-------------|
| Hash MD5 | `a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4` | Hash du fichier original |
| Hash SHA256 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Hash SHA256 du fichier |
| Nom de fichier | `facture_2024.pdf.exe` | Nom du dropper initial |
| Chemin de fichier | `C:\Users\Public\Documents\svchost.exe` | Copie persistante |
| Clé de registre | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\WindowsUpdate` | Persistance |
| Adresse IP | `185.220.101.34` | Serveur C2 |
| Domaine | `c2-malware.xyz` | Domaine C2 |
| Port | `443` | Port de communication (HTTPS) |

---

## 📊 Barème Récapitulatif

| Partie | Question | Points |
|--------|----------|--------|
| 1 — Environnement | Q1.1 | 2 |
| | Q1.2 | 1 |
| | Q1.3 | 1 |
| 2 — Process Monitor | Q2.1 | 3 |
| | Q2.2 | 4 |
| | Q2.3 | 2 |
| | Q2.4 | 2 |
| 3 — API Monitor | Q3.1 | 2 |
| | Q3.2 | 3 |
| | Q3.3 | 2 |
| 4 — ProcDOT | Q4.1 | 2 |
| | Q4.2 | 3 |
| | Q4.3 | 2 |
| 5 — Rapport & IOC | Q5.1 | 5 |
| | Q5.2 | 3 |
| **TOTAL** | | **37** |

> **Note** : Le barème est sur 37 points, ramené à **20 points** pour la note finale.
> **Coefficient** : Note / 37 × 20

### Grille d'évaluation

| Note | Niveau |
|------|--------|
| 16-20 | Excellent — Maîtrise complète de l'analyse dynamique |
| 12-15 | Bon — Compétences solides, quelques lacunes mineures |
| 8-11 | Moyen — Bases acquises, approfondissement nécessaire |
| 4-7 | Insuffisant — Concepts mal maîtrisés |
| 0-3 | Très insuffisant — Revoir les fondamentaux |

---

## 📚 Ressources complémentaires

- **Process Monitor** : https://learn.microsoft.com/en-us/sysinternals/downloads/procmon
- **API Monitor** : http://www.rohitab.com/apimonitor
- **ProcDOT** : https://www.procdot.com/
- **Noriben** : https://github.com/Rurik/Noriben
- **Filtres Procmon recommandés** : Process Name, Operation (RegSetValue, CreateFile, TCP Send)
