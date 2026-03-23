# 🔄 Migration de `/signin` vers `/login` - Guide Complet

**Date** : 2025-01-XX  
**Objectif** : Changer l'URL de `/signin` à `/login` pour correspondre à l'ancienne route Symfony  
**Impact** : 9 fichiers à modifier + 1 dossier à renommer

---

## 📋 Résumé

| Action | Nombre | Détails |
|--------|--------|---------|
| **Dossier à renommer** | 1 | `signin/` → `login/` |
| **Fichiers à modifier** | 9 | Remplacement de `/signin` par `/login` |
| **Occurrences à remplacer** | 13 | Toutes les références à `/signin` |

---

## 🗂️ 1. Renommer le Dossier (Action Manuelle)

### Dossier à renommer :

```
AVANT:
app/(full-width-pages)/(auth)/signin/

APRÈS:
app/(full-width-pages)/(auth)/login/
```

**Action** : Renommer le dossier `signin` en `login`

**Résultat** : L'URL `/signin` deviendra automatiquement `/login`

---

## 📝 2. Fichiers à Modifier

### Fichier 1 : `frontend/src/middleware.ts`

**Lignes à modifier** : 8, 28, 60

**Changements** :

```typescript
// LIGNE 8 - Dans le tableau publicRoutes
AVANT:
const publicRoutes = [
  "/signin",
  "/signup",
  ...
];

APRÈS:
const publicRoutes = [
  "/login",
  "/signup",
  ...
];
```

```typescript
// LIGNE 28 - Dans la fonction isAuthRoute
AVANT:
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/signin") || pathname.startsWith("/signup");
}

APRÈS:
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/signup");
}
```

```typescript
// LIGNE 60 - Dans la redirection
AVANT:
if (!phpsessid && !isAuthRoute(pathname)) {
  const url = request.nextUrl.clone();
  url.pathname = "/signin";
  // Store the original URL to redirect after login
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

APRÈS:
if (!phpsessid && !isAuthRoute(pathname)) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  // Store the original URL to redirect after login
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}
```

**Commentaire ligne 36** : Mettre à jour si nécessaire
```typescript
// LIGNE 36 (commentaire)
AVANT:
* they are redirected to the signin page.

APRÈS:
* they are redirected to the login page.
```

---

### Fichier 2 : `frontend/src/lib/hooks/useAuth.ts`

**Lignes à modifier** : 30, 120

**Changements** :

```typescript
// LIGNE 30 - Dans le commentaire JSDoc
AVANT:
* // → Clears store, queries, and redirects to /signin

APRÈS:
* // → Clears store, queries, and redirects to /login
```

```typescript
// LIGNE 120 - Dans la fonction logout
AVANT:
      // Redirect to login
      router.push("/signin");
    }
  };

APRÈS:
      // Redirect to login
      router.push("/login");
    }
  };
```

---

### Fichier 3 : `frontend/src/lib/api/client.ts`

**Ligne à modifier** : 66

**Changements** :

```typescript
// LIGNE 66 - Dans le gestionnaire d'erreur 401
AVANT:
        // Handle 401 Unauthorized - Session expired or invalid
        if (status === 401) {
          // Redirect to login page (only on client side)
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
        }

APRÈS:
        // Handle 401 Unauthorized - Session expired or invalid
        if (status === 401) {
          // Redirect to login page (only on client side)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
```

---

### Fichier 4 : `frontend/src/components/techem/security/form/reset-password.tsx`

**Lignes à modifier** : 70, 148

**Changements** :

```typescript
// LIGNE 70 - Lien "Retour à la connexion"
AVANT:
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>

APRÈS:
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>
```

```typescript
// LIGNE 148 - Lien "Se connecter"
AVANT:
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Vous vous souvenez de votre mot de passe ? {""}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Se connecter
                </Link>
              </p>
            </div>

APRÈS:
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Vous vous souvenez de votre mot de passe ? {""}
                <Link
                  href="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Se connecter
                </Link>
              </p>
            </div>
```

---

### Fichier 5 : `frontend/src/components/techem/security/form/update-password.tsx`

**Lignes à modifier** : 101, 257

**Changements** :

```typescript
// LIGNE 101 - Lien "Retour à la connexion"
AVANT:
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/signin"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>

APRÈS:
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Retour à la connexion
        </Link>
      </div>
```

```typescript
// LIGNE 257 - Lien "Se connecter"
AVANT:
            {!isSuccess && (
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Vous vous souvenez de votre mot de passe ? {""}
                  <Link
                    href="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            )}

APRÈS:
            {!isSuccess && (
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Vous vous souvenez de votre mot de passe ? {""}
                  <Link
                    href="/login"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>
            )}
```

---

### Fichier 6 : `frontend/src/components/header/UserDropdown.tsx`

**Ligne à modifier** : 148

**Changements** :

```typescript
// LIGNE 148 - Lien "Sign out"
AVANT:
        <Link
          href="/signin"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill=""
            />
          </svg>
          Sign out
        </Link>

APRÈS:
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg
            className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill=""
            />
          </svg>
          Sign out
        </Link>
```

---

### Fichier 7 : `frontend/src/layout/AppSidebar.tsx`

**Ligne à modifier** : 91

**Changements** :

```typescript
// LIGNE 91 - Dans le tableau othersItems
AVANT:
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },

APRÈS:
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/login", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
```

---

### Fichier 8 : `frontend/src/components/auth/SignUpForm.tsx`

**Ligne à modifier** : 179

**Changements** :

```typescript
// LIGNE 179 - Lien "Sign In"
AVANT:
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>

APRÈS:
            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link
                  href="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
```

---

### Fichier 9 : `frontend/src/app/(full-width-pages)/(auth)/login/page.tsx` (après renommage)

**Note** : Ce fichier sera créé automatiquement après le renommage du dossier. Aucune modification nécessaire dans le contenu du fichier, mais vérifier que le nom de la fonction correspond.

**Fichier actuel** : `frontend/src/app/(full-width-pages)/(auth)/signin/page.tsx`

**Après renommage** : `frontend/src/app/(full-width-pages)/(auth)/login/page.tsx`

**Contenu** : Aucun changement nécessaire (le composant `SignInForm` reste le même)

---

## 📊 Tableau Récapitulatif des Modifications

| # | Fichier | Lignes | Type de Changement | Priorité |
|---|---------|--------|-------------------|----------|
| 1 | `middleware.ts` | 8, 28, 60 | Route publique + redirection | 🔴 **Haute** |
| 2 | `useAuth.ts` | 30, 120 | Redirection logout | 🔴 **Haute** |
| 3 | `client.ts` | 66 | Redirection 401 | 🔴 **Haute** |
| 4 | `reset-password.tsx` | 70, 148 | Liens | 🟡 **Moyenne** |
| 5 | `update-password.tsx` | 101, 257 | Liens | 🟡 **Moyenne** |
| 6 | `UserDropdown.tsx` | 148 | Lien logout | 🟡 **Moyenne** |
| 7 | `AppSidebar.tsx` | 91 | Menu navigation | 🟡 **Moyenne** |
| 8 | `SignUpForm.tsx` | 179 | Lien | 🟢 **Basse** |
| 9 | `login/page.tsx` | - | Renommage dossier uniquement | ✅ **Automatique** |

---

## ✅ Checklist de Migration

### Étape 1 : Renommer le Dossier
- [ ] Renommer `app/(full-width-pages)/(auth)/signin/` en `app/(full-width-pages)/(auth)/login/`

### Étape 2 : Modifier les Fichiers Critiques (Priorité Haute)
- [ ] `middleware.ts` - Ligne 8 (publicRoutes)
- [ ] `middleware.ts` - Ligne 28 (isAuthRoute)
- [ ] `middleware.ts` - Ligne 60 (redirection)
- [ ] `useAuth.ts` - Ligne 120 (redirection logout)
- [ ] `client.ts` - Ligne 66 (redirection 401)

### Étape 3 : Modifier les Composants (Priorité Moyenne)
- [ ] `reset-password.tsx` - Ligne 70 (lien retour)
- [ ] `reset-password.tsx` - Ligne 148 (lien connexion)
- [ ] `update-password.tsx` - Ligne 101 (lien retour)
- [ ] `update-password.tsx` - Ligne 257 (lien connexion)
- [ ] `UserDropdown.tsx` - Ligne 148 (lien logout)
- [ ] `AppSidebar.tsx` - Ligne 91 (menu navigation)

### Étape 4 : Modifier les Autres Fichiers (Priorité Basse)
- [ ] `SignUpForm.tsx` - Ligne 179 (lien Sign In)
- [ ] `useAuth.ts` - Ligne 30 (commentaire JSDoc)
- [ ] `middleware.ts` - Ligne 36 (commentaire)

### Étape 5 : Vérification
- [ ] Tester la redirection depuis middleware
- [ ] Tester la redirection après logout
- [ ] Tester la redirection 401
- [ ] Tester tous les liens vers `/login`
- [ ] Vérifier que l'URL `/login` fonctionne
- [ ] Vérifier que l'ancienne URL `/signin` redirige (optionnel)

---

## 🔍 Recherche Globale (Vérification)

Pour vérifier qu'il ne reste aucune référence à `/signin`, exécuter :

```bash
# Dans le dossier frontend
grep -r "/signin" src/
```

**Résultat attendu** : Aucune occurrence (sauf peut-être dans des commentaires ou documentation)

---

## ⚠️ Notes Importantes

### 1. Ordre d'Exécution
- **D'abord** : Renommer le dossier (sinon les imports peuvent échouer)
- **Ensuite** : Modifier les fichiers dans l'ordre de priorité

### 2. Tests à Effectuer
- ✅ Navigation vers `/login` fonctionne
- ✅ Redirection depuis middleware fonctionne
- ✅ Logout redirige vers `/login`
- ✅ Erreur 401 redirige vers `/login`
- ✅ Tous les liens pointent vers `/login`

### 3. Compatibilité
- Les anciennes URLs `/signin` ne fonctionneront plus
- Si nécessaire, ajouter une redirection 301 dans Next.js

### 4. Redirection Optionnelle (Si Besoin)

Si vous voulez que l'ancienne URL `/signin` redirige vers `/login`, créer :

**Fichier** : `app/(full-width-pages)/(auth)/signin/page.tsx`

```typescript
import { redirect } from 'next/navigation';

export default function SignInRedirect() {
  redirect('/login');
}
```

---

## 📝 Commandes Utiles

### Vérifier les occurrences restantes
```bash
cd frontend
grep -r "/signin" src/ --exclude-dir=node_modules
```

### Renommer le dossier (si fait manuellement)
```bash
cd frontend/src/app/(full-width-pages)/(auth)
mv signin login
```

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Guide complet - Prêt pour migration

