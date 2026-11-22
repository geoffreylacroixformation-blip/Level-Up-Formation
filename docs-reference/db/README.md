# Level Up — Base de données Supabase

9 migrations SQL couvrant l'intégralité du MVP décrit dans l'architecture
fonctionnelle : catalogue, recherche, comptes, paiement Stripe, dashboard
étudiant, suivi de progression et **administration complète**.

Toutes les migrations ont été **exécutées et testées** sur une instance
PostgreSQL 16 locale (schémas `auth`/`storage` simulés pour reproduire
Supabase), y compris les policies RLS avec de vrais changements de rôle
(`anon` / `authenticated` / admin), pas seulement une relecture syntaxique.

## Structure

```
supabase/migrations/
  20260719120000_extensions_and_types.sql   Extensions, enums, fonctions génériques
  20260719120100_reference_tables.sql       categories, levels (+ données initiales)
  20260719120200_profiles.sql               profiles, trigger d'inscription, is_admin()
  20260719120300_courses_and_modules.sql    courses, modules, module_resources
  20260719120400_commerce.sql               promotions, orders, order_items
  20260719120500_enrollments_and_progress.sql  enrollments, module_progress
  20260719120600_business_functions.sql     recherche, code promo, stats admin
  20260719120700_rls_policies.sql           RLS + GRANTs sur toutes les tables
  20260719120800_storage.sql                buckets Storage + policies
```

## Mise en route

```bash
supabase link --project-ref <votre-projet>
supabase db push
```

Puis, **impératif** : créez votre premier compte via l'appli (inscription
normale), puis promouvez-le admin en SQL direct (SQL Editor Supabase — pas
depuis l'appli, car un utilisateur non-admin ne peut jamais changer son
propre rôle, y compris via un appel API) :

```sql
update public.profiles set role = 'admin' where email = 'vous@exemple.fr';
```

## Décisions de conception à valider avec vous

- **Prix en centimes** (`price_cents`) plutôt qu'en décimal, pour éviter les
  problèmes d'arrondi flottant — standard pour du monétaire.
- **Un cours = un achat unique** (pas d'abonnement). Le doc mentionne
  "Modifier les prix" et "promotions", pas d'abonnement récurrent — dites-moi
  si Level Up doit finalement proposer un modèle par abonnement.
- **`levels` est une table** (pas un enum) : 3 valeurs fixes comme décrit,
  mais éditables (libellé/description) depuis le dashboard admin sans
  migration.
- **`categories` est une table** dynamique, conformément à la demande
  explicite d'extensibilité du document.
- **Commandes créées uniquement côté serveur** (Edge Function avec la clé
  `service_role`, jamais par le client) : le prix ne doit jamais être
  déterminé par le navigateur. Le webhook Stripe met à jour `orders` puis
  crée les lignes `enrollments`.
- **Codes promo non lisibles directement** par les utilisateurs (RLS
  admin-only) : la validation passe par la fonction `check_promo_code()`
  pour ne jamais exposer la liste complète des codes.
- **Un étudiant inscrit garde l'accès à un cours** même si celui-ci passe
  ensuite en "archived"/"unpublished" — semblait plus juste qu'un accès payé
  qui disparaît. Dites-moi si ce n'est pas le comportement voulu.
- **Suppression protégée** : un cours ayant déjà une commande ou une
  inscription ne peut pas être supprimé (erreur volontaire) — utilisez le
  statut `archived` à la place. Idem pour un profil ayant des commandes
  (RGPD : à terme, prévoir une anonymisation plutôt qu'une suppression dure
  pour les comptes avec historique de paiement).

## Fonctions clés pour le dashboard admin

- `admin_dashboard_stats()` — KPIs globaux (étudiants, cours, revenu...)
- `admin_course_stats()` — inscriptions/revenu par cours
- `check_promo_code(code)` — validation sécurisée d'un code promo
- `search_courses(terme)` — recherche plein texte (français, avec accents)
- `get_course_progress(course_id)` — % de progression de l'utilisateur courant

## Compatibilité avec les évolutions futures

Le schéma n'implémente que le MVP, mais reste compatible avec les
fonctionnalités futures listées dans le document sans nécessiter de refonte :
labos Proxmox/VMs (nouvelle table `lab_resources` liée à `modules`),
certifications (`certificates` liée à `enrollments`), gamification
(`badges`/`points` liés à `profiles`), multilingue (table de traduction
`course_translations` plutôt que colonnes dupliquées).

## Questions pour vous

1. Souhaitez-vous que j'écrive aussi les **Edge Functions** Stripe
   (création de session Checkout + webhook) qui s'appuient sur ce schéma ?
2. Le contenu Markdown des modules : stocké tel quel en base (comme prévu
   ici), ou dans un fichier séparé (Storage/Git) avec seulement une référence
   en base ?
3. Faut-il une table `reviews`/avis étudiants ? Le document ne la mentionne
   pas, donc je ne l'ai pas ajoutée.
