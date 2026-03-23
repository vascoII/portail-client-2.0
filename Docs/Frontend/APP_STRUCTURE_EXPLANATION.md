# 📁 Explication de la Structure des Dossiers `app/`

**Date** : 2025-01-XX  
**Objectif** : Expliquer la structure des dossiers Next.js App Router et les "Route Groups"

---

## 🎯 Qu'est-ce qu'un "Route Group" ?

Un **Route Group** est un dossier dans Next.js App Router qui commence et se termine par des **parenthèses** : `(nom-du-groupe)`

### Caractéristiques importantes :

1. ✅ **N'apparaît PAS dans l'URL** : Le nom du dossier est ignoré dans l'URL finale
2. ✅ **Organisation logique** : Permet de regrouper des pages qui partagent le même layout ou la même logique
3. ✅ **Layout partagé** : Chaque route group peut avoir son propre `layout.tsx`

### Exemple :

```
app/
├── (admin)/
│   ├── layout.tsx          ← Layout pour toutes les pages admin
│   ├── dashboard/
│   │   └── page.tsx        ← URL: /dashboard (pas /admin/dashboard)
│   └── immeuble/
│       └── page.tsx        ← URL: /immeuble (pas /admin/immeuble)
```

**Résultat** : Les URLs sont `/dashboard` et `/immeuble`, **pas** `/admin/dashboard` ou `/admin/immeuble`

---

## 📂 Structure Actuelle de Votre Projet

```
app/
├── layout.tsx                    ← Layout racine (toutes les pages)
├── providers.tsx                 ← Providers React Query, etc.
├── globals.css                   ← Styles globaux
│
├── (admin)/                      ← Route Group "admin"
│   ├── layout.tsx                ← Layout avec Sidebar + Header
│   ├── page.tsx                  ← Page par défaut (probablement redirection)
│   ├── dashboard/
│   │   └── page.tsx              ← URL: /dashboard
│   ├── immeuble/
│   │   └── page.tsx              ← URL: /immeuble
│   ├── gestionnaire/
│   │   └── page.tsx              ← URL: /gestionnaire
│   └── ...
│
├── (full-width-pages)/           ← Route Group "full-width-pages"
│   ├── layout.tsx                ← Layout simple (pas de sidebar)
│   ├── (auth)/                   ← Route Group imbriqué "auth"
│   │   ├── layout.tsx            ← Layout spécial pour l'authentification
│   │   ├── signin/
│   │   │   └── page.tsx          ← URL: /signin
│   │   └── reset-password/
│   │       └── page.tsx          ← URL: /reset-password
│   ├── legal-notices/
│   │   └── page.tsx              ← URL: /legal-notices
│   └── recherche/
│       └── page.tsx              ← URL: /recherche
│
└── occupant/                     ← Dossier normal (pas de route group)
    ├── page.tsx                  ← URL: /occupant
    ├── simulateur/
    │   └── page.tsx              ← URL: /occupant/simulateur
    └── ...
```

---

## 🔍 Détail de Chaque Route Group

### 1. `(admin)` - Pages Administrateur/Gestionnaire

**Objectif** : Regrouper toutes les pages qui nécessitent :
- ✅ Une sidebar (menu de navigation)
- ✅ Un header (en-tête avec utilisateur, notifications, etc.)
- ✅ Authentification admin/gestionnaire

**Layout** : `app/(admin)/layout.tsx`
- Affiche `AppSidebar` (menu latéral)
- Affiche `AppHeader` (en-tête)
- Gère la responsivité mobile/desktop
- Ajuste la marge du contenu selon l'état de la sidebar

**Pages incluses** :
- `/dashboard` - Tableau de bord gestionnaire
- `/immeuble` - Liste des immeubles
- `/immeuble/[pkImmeuble]` - Détails immeuble
- `/logement/[pkLogement]` - Détails logement
- `/gestionnaire` - Liste des opérateurs
- `/gestionParc` - Gestion du parc
- `/tickets` - Liste des tickets
- `/factures` - Liste des factures
- etc.

**Exemple d'URL** :
```
app/(admin)/dashboard/page.tsx  →  URL: /dashboard
app/(admin)/immeuble/page.tsx   →  URL: /immeuble
```

---

### 2. `(full-width-pages)` - Pages Pleine Largeur

**Objectif** : Regrouper toutes les pages qui :
- ✅ N'ont **pas** de sidebar
- ✅ N'ont **pas** de header complexe
- ✅ Utilisent toute la largeur de l'écran
- ✅ Ont un design plus simple

**Layout** : `app/(full-width-pages)/layout.tsx`
- Layout minimaliste (juste `<div>{children}</div>`)
- Pas de sidebar, pas de header complexe

**Pages incluses** :
- `/legal-notices` - Mentions légales
- `/personal-datas` - Données personnelles
- `/cgu` - Conditions générales d'utilisation
- `/recherche` - Recherche unifiée
- Pages d'authentification (via sous-groupe `(auth)`)

**Exemple d'URL** :
```
app/(full-width-pages)/legal-notices/page.tsx  →  URL: /legal-notices
app/(full-width-pages)/recherche/page.tsx      →  URL: /recherche
```

---

### 3. `(auth)` - Pages d'Authentification

**Objectif** : Sous-groupe de `(full-width-pages)` pour les pages d'authentification avec un layout spécial

**Layout** : `app/(full-width-pages)/(auth)/layout.tsx`
- Layout avec design spécial pour l'authentification
- Affiche un logo et un message de bienvenue à droite
- Design en deux colonnes (formulaire à gauche, image/logo à droite)
- Toggle de thème (dark/light mode)

**Pages incluses** :
- `/signin` - Connexion
- `/reset-password` - Réinitialisation mot de passe
- `/update-password` - Mise à jour mot de passe
- `/signup` - Inscription (si nécessaire)

**Exemple d'URL** :
```
app/(full-width-pages)/(auth)/signin/page.tsx        →  URL: /signin
app/(full-width-pages)/(auth)/reset-password/page.tsx →  URL: /reset-password
```

**Note** : Les route groups peuvent être **imbriqués** ! `(auth)` est imbriqué dans `(full-width-pages)`

---

### 4. `occupant/` - Pages Occupant (Dossier Normal)

**Objectif** : Pages pour l'espace occupant (pas de route group)

**Pourquoi pas de route group ?**
- Ces pages ont besoin d'un layout différent (peut-être une sidebar spécifique occupant)
- Ou elles utilisent le layout racine directement

**Layout** : Utilise le layout racine (`app/layout.tsx`) ou pourrait avoir son propre layout

**Pages incluses** :
- `/occupant` - Dashboard occupant
- `/occupant/simulateur` - Simulateur de consommation
- `/occupant/myAccount` - Mon compte
- `/occupant/alertes` - Alertes
- `/occupant/interventions` - Interventions
- etc.

**Exemple d'URL** :
```
app/occupant/page.tsx              →  URL: /occupant
app/occupant/simulateur/page.tsx   →  URL: /occupant/simulateur
```

---

## 🎨 Hiérarchie des Layouts

Next.js App Router applique les layouts de manière **hiérarchique** :

```
app/layout.tsx                           ← Layout racine (TOUTES les pages)
  └── app/(admin)/layout.tsx             ← Layout admin (pages dans (admin))
  └── app/(full-width-pages)/layout.tsx  ← Layout full-width (pages dans (full-width-pages))
        └── app/(full-width-pages)/(auth)/layout.tsx  ← Layout auth (pages dans (auth))
  └── app/occupant/                      ← Utilise le layout racine directement
```

### Exemple : Page `/signin`

1. `app/layout.tsx` s'applique (Providers, Theme, SidebarProvider)
2. `app/(full-width-pages)/layout.tsx` s'applique (layout simple)
3. `app/(full-width-pages)/(auth)/layout.tsx` s'applique (layout avec logo et design spécial)
4. `app/(full-width-pages)/(auth)/signin/page.tsx` s'affiche

**Résultat** : La page `/signin` a les 3 layouts empilés !

---

## 📊 Tableau Récapitulatif

| Route Group | URL Exemple | Layout | Sidebar | Header | Usage |
|-------------|-------------|--------|---------|--------|-------|
| `(admin)` | `/dashboard` | `(admin)/layout.tsx` | ✅ Oui | ✅ Oui | Pages admin/gestionnaire |
| `(full-width-pages)` | `/legal-notices` | `(full-width-pages)/layout.tsx` | ❌ Non | ❌ Non | Pages pleine largeur |
| `(full-width-pages)/(auth)` | `/signin` | `(auth)/layout.tsx` | ❌ Non | ❌ Non | Pages d'authentification |
| `occupant/` (normal) | `/occupant` | `app/layout.tsx` | ❓ Dépend | ❓ Dépend | Pages occupant |

---

## 🔄 Comparaison avec Symfony

### Symfony (Ancien)
```php
// Routes définies dans les controllers
#[Route('/dashboard')]
public function dashboard() { ... }

#[Route('/signin')]
public function signin() { ... }
```

### Next.js (Nouveau)
```
app/
├── (admin)/
│   └── dashboard/
│       └── page.tsx        → URL: /dashboard
└── (full-width-pages)/
    └── (auth)/
        └── signin/
            └── page.tsx    → URL: /signin
```

**Avantage** : L'organisation des fichiers reflète directement l'organisation des layouts et de l'UI !

---

## 💡 Pourquoi Utiliser des Route Groups ?

### 1. **Organisation Logique**
- Regrouper les pages qui partagent le même design/layout
- Faciliter la maintenance

### 2. **Layouts Partagés**
- Éviter de répéter le même layout dans chaque page
- Un seul `layout.tsx` pour toutes les pages du groupe

### 3. **URLs Propres**
- Les URLs restent propres : `/dashboard` au lieu de `/admin/dashboard`
- Pas besoin de préfixe dans l'URL

### 4. **Flexibilité**
- Facile d'ajouter/retirer des pages d'un groupe
- Facile de changer le layout d'un groupe entier

---

## 🛠️ Comment Ajouter une Nouvelle Page ?

### Dans le groupe `(admin)` :
```
app/(admin)/
└── ma-nouvelle-page/
    └── page.tsx    → URL: /ma-nouvelle-page
```

### Dans le groupe `(full-width-pages)` :
```
app/(full-width-pages)/
└── ma-nouvelle-page/
    └── page.tsx    → URL: /ma-nouvelle-page
```

### Dans le groupe `(auth)` :
```
app/(full-width-pages)/(auth)/
└── ma-nouvelle-page/
    └── page.tsx    → URL: /ma-nouvelle-page
```

### En dehors des groupes :
```
app/
└── ma-nouvelle-page/
    └── page.tsx    → URL: /ma-nouvelle-page
```

---

## ⚠️ Points Importants

### 1. Les parenthèses sont obligatoires
- ✅ `(admin)` → Route group (n'apparaît pas dans l'URL)
- ❌ `admin` → Dossier normal (apparaît dans l'URL : `/admin/...`)

### 2. Les route groups peuvent être imbriqués
- ✅ `(full-width-pages)/(auth)` → Imbriqué
- ✅ `(admin)/(others-pages)` → Imbriqué

### 3. Chaque route group peut avoir son layout
- `(admin)/layout.tsx` → Layout pour toutes les pages admin
- `(full-width-pages)/layout.tsx` → Layout pour toutes les pages full-width
- `(auth)/layout.tsx` → Layout pour toutes les pages auth

### 4. Les layouts s'empilent
- Le layout racine s'applique toujours
- Puis les layouts des route groups (de l'extérieur vers l'intérieur)

---

## 📝 Exemples Concrets

### Exemple 1 : Page Dashboard
```
Fichier: app/(admin)/dashboard/page.tsx
URL: /dashboard
Layouts appliqués:
  1. app/layout.tsx (racine)
  2. app/(admin)/layout.tsx (avec sidebar + header)
  3. Contenu de dashboard/page.tsx
```

### Exemple 2 : Page Signin
```
Fichier: app/(full-width-pages)/(auth)/signin/page.tsx
URL: /signin
Layouts appliqués:
  1. app/layout.tsx (racine)
  2. app/(full-width-pages)/layout.tsx (simple)
  3. app/(full-width-pages)/(auth)/layout.tsx (avec logo et design spécial)
  4. Contenu de signin/page.tsx
```

### Exemple 3 : Page Occupant
```
Fichier: app/occupant/page.tsx
URL: /occupant
Layouts appliqués:
  1. app/layout.tsx (racine uniquement)
  2. Contenu de occupant/page.tsx
```

---

## 🎯 Résumé

| Concept | Description |
|---------|-------------|
| **Route Group** | Dossier avec parenthèses `(nom)` qui n'apparaît pas dans l'URL |
| **Layout** | Composant qui enveloppe les pages pour partager du code (sidebar, header, etc.) |
| **Hiérarchie** | Les layouts s'empilent de la racine vers les groupes imbriqués |
| **URL** | L'URL finale ne contient PAS le nom du route group |

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Documentation complète

