# ÉVALUATION 5 : ÉTUDE DE CAS — MODULE 9 (Threat Intelligence et Attribution)

## Notation : /20 points (5 points par question)

**Durée : 60 minutes | Accès à VirusTotal, AbuseIPDB, MISP autorisé**

---

## SCÉNARIO : APT29 — Attaque sur un organisme de recherche gouvernemental

### Contexte

Un centre de recherche gouvernemental spécialisé en cybersécurité détecte une activité suspecte sur son réseau interne. L'équipe de Threat Intelligence est mobilisée pour analyser cette menace potentiellement étatique.

### Rapport d'alerte initial (extrait de MISP) :

```
Event: APT29 Activity Detected
Date: 2026-06-10
Threat Level: High
Tags: [apt29, cozy-bear, midnight-blizzard, russia-unc2452]
Description: Sophisticated spearphishing campaign targeting government 
research institutions. The attack uses a novel variant of the WellMess 
malware family with custom C2 infrastructure.

IOCs:
- Domain: microsoft-update-service[.]net
- IP: 91.219.236[.]222
- Hash (SHA-256): a3b8c9d1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
- Email: security-alerts@microsoft-update-service[.]net
- User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0.2"
- SSL Certificate: CN=*.microsoft-update-service[.]net, O=Cloud Solutions Inc, L=Moscow, C=RU
- YARA Rule Match: "WellMess_Variant_2026"
```

### Données supplémentaires fournies :

**Analyse réseau (Wireshark)** :
- Beaconing toutes les 60 secondes vers 91.219.236[.]222:443
- DNS tunneling détecté vers dns-update[.]azureedge[.]net
- Exfiltration via HTTPS avec certificat Let's Encrypt valide
- User-Agent légitime pour masquer le trafic

**Analyse de l'échantillon (Ghidra)** :
- Code écrit en C++ avec utilisation de Boost.Asio pour le réseau
- Chiffrement AES-256-GCM pour la communication C2
- Utilisation de la Windows CryptoAPI
- Anti-détection : vérification de VM, sleep de 300s avant connexion
- Persistance : Tâche planifiée (schtasks) nommée "WindowsUpdateTask"
- Capabilities : keylogger, capture d'écran, exécution de commandes, exfiltration de fichiers

**Contexte géopolitique** :
- L'attaque coïncide avec des tensions diplomatiques récentes
- APT29 (Cozy Bear) est un groupe russe lié au SVR (Service de Renseignement Extérieur)
- Cible historique : gouvernements, think tanks, instituts de recherche

---

### Questions :

**Question 1 — Attribution et Contextualisation (5 pts)**

Sur la base des éléments techniques et contextuels, attribuez cette attaque à un groupe APT spécifique. Justifiez votre attribution en identifiant au moins **5 TTPs** (Tactics, Techniques, Procédures) cohérentes avec le groupe suspecté.

---

**Question 2 — Analyse de l'infrastructure C2 (5 pts)**

Analysez l'infrastructure de commandement et contrôle utilisée dans cette attaque. Identifiez les techniques d'évasion utilisées et proposez des méthodes de détection supplémentaires.

---

**Question 3 — Analyse comportementale du malware (5 pts)**

Décrivez en détail le comportement du malware WellMess identifié. Utilisez le framework MITRE ATT&CK pour cartographier les techniques utilisées et proposez des contre-mesures pour chaque phase de l'attaque.

---

**Question 4 — Rapport de Threat Intelligence (5 pts)**

Rédigez un rapport de Threat Intelligence (TLP:AMBER) à destination des partenaires du centre de recherche, incluant : résumé exécutif, analyse technique, évaluation de la menace, recommandations de défense, et IOCs partageables.

---

## CORRECTION ÉTUDE DE CAS MODULE 9

### Question 1 — Attribution (5 pts)

**Groupe attribué : APT29 (Cozy Bear / Midnight Blizzard / Nobelium / UNC2452)**

**Justification par TTPs** (1 pt par TTP correctement identifiée) :

1. **Spearphishing (T1566.001)** : Campagne de phishing ciblée sur des institutions gouvernementales — signature d'APT29.

2. **Domain impersonation** : `microsoft-update-service[.]net` — APT29 usurpe régulièrement les services Microsoft (Microsoft Update, Teams, Outlook).

3. **WellMess malware** : Famille de malware historiquement associée à APT29 depuis 2020 (SolarWinds).

4. **SSL Certificate pattern** : Certificat avec organisation "Cloud Solutions Inc" à Moscou — pattern récurrent d'APT29.

5. **Beaconing régulier (60s)** : Intervalle de beaconing constant, typique des opérations APT29 pour maintenir la persistance discrète.

6. **DNS tunneling** : Utilisation de DNS pour l'exfiltration — technique documentée d'APT29 (Midnight Blizzard).

7. **Tâche planifiée (T1053.005)** : Persistance via schtasks — TTP récurrente d'APT29.

8. **Timing géopolitique** : Attaque coïncidant avec des tensions diplomatiques — cohérent avec les motivations du SVR.

---

### Question 2 — Infrastructure C2 (5 pts)

**Analyse de l'infrastructure** :

| Élément | Analyse |
|---------|---------|
| Domaine | `microsoft-update-service[.]net` — typosquatting de légitimes Microsoft |
| IP | 91.219.236[.]222 — Hébergement en Russie (ASxxxxx) |
| Certificat SSL | Let's Encrypt (gratuit) + organisation Moscou |
| User-Agent | Firefox légitime pour blending |
| DNS tunneling | `dns-update[.]azureedge[.]net` — abuse de légitimes Microsoft |

**Techniques d'évasion** (2 pts) :
- HTTPS légitime (Let's Encrypt) pour chiffrer le trafic
- User-Agent réaliste pour blending
- DNS tunneling pour contourner les proxies
- Beaconing lent (60s) pour éviter la détection par seuil
- Anti-VM/anti-debug pour compliquer l'analyse

**Méthodes de détection** (3 pts) :
- Analyse des certificats SSL (JA3 fingerprinting)
- Monitoring DNS (détection de DNS tunneling par volume/fréquence)
- Analyse comportementale des User-Agents
- Threat Intelligence feeds (MISP, OTX)
- YARA rules sur le malware
- Détection de beaconing par analyse statistique des intervalles

---

### Question 3 — Analyse comportementale (5 pts)

**Cartographie MITRE ATT&CK** :

| Phase | Technique | Contre-mesure |
|-------|-----------|---------------|
| Initial Access | Spearphishing (T1566.001) | Formation, filtrage email, sandboxing |
| Execution | Tâche planifiée (T1053.005) | Monitoring schtasks, EDR |
| Persistence | Tâche planifiée (T1053.005) | Audit des tâches, GPO |
| Defense Evasion | Anti-VM (T1562.006) | EDR comportemental |
| Credential Access | Keylogger (T1056.000) | MFA, Credential Guard |
| Discovery | System info (T1082) | EDR monitoring |
| Collection | Screen capture (T1113), Keylogging (T1056) | DLP, EDR |
| C2 | HTTPS beaconing (T1071.001), DNS tunneling (T1071.004) | Network monitoring, DNS filtering |
| Exfiltration | Exfiltration over C2 (T1041) | DLP, traffic analysis |

---

### Question 4 — Rapport TLP:AMBER (5 pts)

```
THREAT INTELLIGENCE REPORT — TLP:AMBER
========================================
Classification: AMBER — Limited disclosure to clients/stakeholders
Date: 2026-06-10
Reporter: Centre de Recherche Cybersécurité — CERT

EXECUTIVE SUMMARY
-----------------
APT29 (Cozy Bear) a mené une campagne de spearphishing sophistiquée 
ciblant des institutions de recherche gouvernementale. Le malware WellMess 
a été déployé via un leurre de mise à jour Microsoft. L'infrastructure 
C2 utilise des domaines usurpés et du DNS tunneling pour échapper à la 
détection.

THREAT ASSESSMENT
------------------
- Sophistication: Élevée (outils custom, anti-analysis)
- Intent: Espionnage et exfiltration de données
- Capacité: Confirmée (historique d'APT29)
- Cible: Recherche gouvernementale, données classifiées

IOCS PARTAGEABLES
------------------
- Domain: microsoft-update-service[.]net
- IP: 91.219.236.222
- Hash: a3b8c9d1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
- Email: security-alerts@microsoft-update-service[.]net
- User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0)
- YARA: WellMess_Variant_2026

RECOMMENDATIONS
---------------
1. Bloquer les IOCs sur tous les outils de sécurité
2. Renforcer le filtrage email (DMARC, DKIM, SPF)
3. Déployer l'EDR sur tous les postes
4. Activer Credential Guard et LAPS
5. Segmentation réseau renforcée
6. Surveillance DNS renforcée
7. Partage d'IOCs avec les partenaires (TLP:AMBER)

TECHNICAL ANALYSIS
------------------
[Detailed analysis available in full report]
```

---

---

