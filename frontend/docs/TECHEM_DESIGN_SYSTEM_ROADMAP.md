# 🎨 Roadmap - Application de l'identité visuelle Techem

## 📋 Vue d'ensemble

Cette roadmap guide l'application de l'identité visuelle Techem extraite du CSS officiel (`techem_corp.css`) à votre portail client. Nous commencerons par des éléments simples (header, footer, sidebar, page login) pour établir les bases, puis étendrons progressivement à tout le portail.

---

## 🎯 Objectifs

1. **Créer un système de design cohérent** basé sur l'identité Techem
2. **Appliquer l'identité aux composants de base** (header, footer, sidebar, login)
3. **Établir des composants réutilisables** pour faciliter la migration du reste du portail
4. **Maintenir la compatibilité** avec le code existant pendant la transition

---

## 📦 Phase 1 : Configuration du Design System (Fondations)

### ✅ Étape 1.1 : Créer la configuration Tailwind Techem

**Fichier à créer/modifier :** `frontend/src/app/globals.css`

**Actions :**
- [ ] Ajouter les couleurs Techem dans la section `@theme`
- [ ] Configurer la typographie (Univers LT Pro - fallback sur des polices similaires)
- [ ] Définir les espacements cohérents avec le système Techem
- [ ] Configurer les breakpoints Techem (667px, 1024px, 1194px, 1440px)
- [ ] Ajouter les ombres et border-radius standards

**Couleurs à ajouter :**
```css
--color-techem-red: #e20613;
--color-techem-red-dark: #b4050f;
--color-techem-red-light: #ffa7ac;
--color-techem-red-very-light: #ffe5e6;
--color-techem-black: #1d1914;
--color-techem-gray-dark: #222;
--color-techem-gray-medium: #4c4c4c;
--color-techem-gray-light: #6a6a6a;
--color-techem-gray-very-light: #e9ecef;
```

**Typographie :**
- Police principale : Univers LT Pro (fallback: system-ui, sans-serif)
- Tailles : basées sur le système Techem (1rem base, hiérarchie H1-H6)

**Livrable :** Configuration Tailwind complète avec toutes les couleurs et variables Techem

---

## 🧱 Phase 2 : Composants de base (Header, Footer, Sidebar)

### ✅ Étape 2.1 : Refonte du Header (`AppHeader.tsx`)

**Fichier :** `frontend/src/layout/AppHeader.tsx`

**Modifications à apporter :**
- [ ] **Couleurs** : 
  - Background blanc (`#fff`)
  - Bordure basse : `#1d1914` (1px solid)
  - Liens : `#1d1914` → hover `#e20613`
- [ ] **Typographie** : 
  - Font-family : Univers LT Pro (ou fallback)
  - Font-size : `1rem` (16px)
  - Line-height : `1.5rem` (24px)
- [ ] **Espacements** :
  - Padding header : `1.5rem 0` (24px vertical)
  - Hauteur header : `5rem` (80px) sur desktop
  - Marges entre éléments : `1.5rem` (24px)
- [ ] **Navigation** :
  - Liens avec underline au hover
  - Transition : `0.3s ease-in-out`
- [ ] **Logo** : S'assurer que le logo Techem est bien visible

**Classes Tailwind à utiliser :**
```tsx
className="bg-white border-b border-[#1d1914] h-20 px-6"
// Liens
className="text-[#1d1914] hover:text-[#e20613] hover:underline transition-all duration-300"
```

**Livrable :** Header avec identité Techem appliquée

---

### ✅ Étape 2.2 : Refonte du Footer (`AppFooter.tsx`)

**Fichier :** `frontend/src/layout/AppFooter.tsx`

**Modifications à apporter :**
- [ ] **Couleurs** :
  - Background : `#1d1914` (noir Techem)
  - Texte : `#fff` (blanc)
  - Bordure haute : `1px solid #1d1914`
- [ ] **Typographie** :
  - Font-size : `0.875rem` (14px)
  - Line-height : `1.25rem` (20px)
- [ ] **Espacements** :
  - Padding : `1.5rem 0` (24px vertical)
  - Container max-width : `77rem` (1232px)
- [ ] **Structure** :
  - Footer-wrapper avec flex layout
  - Footer-subtitle en bold
  - Liens avec padding-right : `1.5rem`

**Classes Tailwind à utiliser :**
```tsx
className="bg-[#1d1914] text-white border-t border-[#1d1914] py-6 text-sm"
```

**Livrable :** Footer avec identité Techem appliquée

---

### ✅ Étape 2.3 : Refonte du Sidebar (`AppSidebar.tsx`)

**Fichier :** `frontend/src/layout/AppSidebar.tsx`

**Modifications à apporter :**
- [ ] **Couleurs** :
  - Background : `#fff` (blanc)
  - Bordure droite : `1px solid #1d1914`
  - Liens actifs : `#e20613`
  - Liens inactifs : `#1d1914`
- [ ] **Typographie** :
  - Font-family : Univers LT Pro (ou fallback)
  - Menu items : `1rem` (16px)
- [ ] **Espacements** :
  - Padding sidebar : `1.25rem` (20px)
  - Espacement entre items : `1rem` (16px)
  - Indentation des sous-items : `1.5rem` par niveau (24px)
- [ ] **Interactions** :
  - Hover : transition `0.3s ease-in-out`
  - Items actifs : couleur `#e20613`

**Classes Tailwind à utiliser :**
```tsx
className="bg-white border-r border-[#1d1914] text-[#1d1914]"
// Items actifs
className="text-[#e20613]"
```

**Livrable :** Sidebar avec identité Techem appliquée

---

## 🔐 Phase 3 : Page de connexion (Exemple simple)

### ✅ Étape 3.1 : Refonte de la page Login

**Fichier :** `frontend/src/components/techem/security/form/login.tsx`

**Modifications à apporter :**
- [ ] **Layout** :
  - Centrage vertical et horizontal
  - Container max-width : `49.63rem` (794px) sur desktop
  - Padding : `2rem` (32px)
- [ ] **Couleurs** :
  - Background : `#fff`
  - Titre : `#1d1914`
  - Labels : `#1d1914`
- [ ] **Boutons** :
  - Primary button : Background `#e20613`, texte blanc
  - Hover : `#b4050f`
  - Border-radius : `0.5rem` (8px)
  - Padding : `0.375rem 1rem` (6px 16px)
- [ ] **Inputs** :
  - Bordure : `1px solid #1d1914`
  - Focus : outline `4px solid #c2dafe`
  - Border-radius : `0.5rem` (8px)
- [ ] **Typographie** :
  - Titre : H2 (`2.5rem` / 40px desktop, `1.5rem` / 24px mobile)
  - Labels : `1rem` (16px)
  - Textes : `1rem` (16px)

**Classes Tailwind à utiliser :**
```tsx
// Container
className="max-w-[49.63rem] mx-auto p-8"
// Bouton primary
className="bg-[#e20613] text-white hover:bg-[#b4050f] rounded-lg px-4 py-1.5 transition-all duration-300"
// Input
className="border border-[#1d1914] rounded-lg focus:outline-4 focus:outline-[#c2dafe]"
```

**Livrable :** Page login avec identité Techem complète

---

## 🎨 Phase 4 : Composants réutilisables

### ✅ Étape 4.1 : Créer des composants de boutons Techem

**Fichier à créer :** `frontend/src/components/common/TechemButton.tsx`

**Variantes à créer :**
- [ ] `button-primary` : Fond rouge `#e20613`, texte blanc
- [ ] `button-primary-light` : Fond blanc, texte rouge `#e20613`
- [ ] `button-secondary` : Transparent, bordure `2px solid #1d1914`
- [ ] `button-secondary-light` : Transparent, bordure blanche
- [ ] `button-arrow` : Lien avec flèche
- [ ] États : hover, focus, disabled

**Livrable :** Composant `TechemButton` réutilisable avec toutes les variantes

---

### ✅ Étape 4.2 : Créer des composants d'alertes Techem

**Fichier à créer :** `frontend/src/components/common/TechemAlert.tsx`

**Variantes à créer :**
- [ ] `alert-success` : Fond `#417232`, texte `#e9ecef`
- [ ] `alert-info` : Fond `#009bb4`, texte `#00344e`
- [ ] `alert-warning` : Fond `#b00511`, texte `#e9ecef`
- [ ] `alert-danger` : Fond `#b00511`, texte `#e9ecef`

**Livrable :** Composant `TechemAlert` réutilisable

---

### ✅ Étape 4.3 : Créer des composants de cartes Techem

**Fichier à créer :** `frontend/src/components/common/TechemCard.tsx`

**Caractéristiques :**
- [ ] Background blanc
- [ ] Border-radius : `12px` (pour les images)
- [ ] Ombres : `0 0.625rem 0.938rem 0 rgba(0, 0, 0, 0.2)`
- [ ] Padding : `1.5rem` (24px)

**Livrable :** Composant `TechemCard` réutilisable

---

## 📝 Phase 5 : Documentation et migration

### ✅ Étape 5.1 : Créer un guide de style

**Fichier à créer :** `frontend/docs/TECHEM_DESIGN_SYSTEM.md`

**Contenu :**
- [ ] Palette de couleurs complète
- [ ] Typographie et hiérarchie
- [ ] Espacements
- [ ] Composants disponibles
- [ ] Exemples d'utilisation
- [ ] Do's and Don'ts

**Livrable :** Documentation complète du design system

---

### ✅ Étape 5.2 : Planifier la migration progressive

**Stratégie :**
- [ ] Identifier les pages prioritaires
- [ ] Créer une checklist de migration par page
- [ ] Tester chaque composant avant migration globale
- [ ] Maintenir la compatibilité avec l'ancien système pendant la transition

**Livrable :** Plan de migration avec priorités

---

## 🚀 Ordre d'exécution recommandé

1. **Phase 1** : Configuration Tailwind (fondations)
2. **Phase 2.1** : Header (le plus visible)
3. **Phase 2.2** : Footer (simple, rapide)
4. **Phase 2.3** : Sidebar (navigation importante)
5. **Phase 3** : Page Login (exemple complet)
6. **Phase 4** : Composants réutilisables (pour faciliter le reste)
7. **Phase 5** : Documentation et planification

---

## 📊 Checklist de validation

Pour chaque composant modifié, vérifier :

- [ ] Les couleurs correspondent exactement aux valeurs Techem
- [ ] La typographie utilise les bonnes tailles et line-heights
- [ ] Les espacements respectent le système Techem
- [ ] Les interactions (hover, focus) sont cohérentes
- [ ] Le responsive fonctionne (mobile 667px, tablet 1024px, etc.)
- [ ] L'accessibilité est maintenue (contraste, focus visible)
- [ ] Les transitions sont fluides (0.3s ease-in-out)

---

## 🎨 Références de couleurs Techem

### Couleurs principales
- **Rouge Techem** : `#e20613`
- **Rouge foncé (hover)** : `#b4050f` / `#b00511`
- **Rouge clair (disabled)** : `#ffa7ac`
- **Rouge très clair (bg)** : `#ffe5e6`

### Couleurs neutres
- **Noir texte** : `#1d1914`
- **Gris foncé** : `#222`, `#4c4c4c`, `#4d5154`
- **Gris moyen** : `#6a6a6a`, `#9a9a9a`, `#adb5bd`
- **Gris clair** : `#b2b2b2`, `#e9ecef`
- **Blanc** : `#fff`

### Couleurs d'alerte
- **Succès** : Fond `#417232`, Texte `#e9ecef`
- **Info** : Fond `#009bb4`, Texte `#00344e`
- **Warning/Danger** : Fond `#b00511`, Texte `#e9ecef`

---

## 📐 Système d'espacements Techem

Basé sur `rem` (1rem = 16px) :
- **Petit** : `0.375rem` (6px), `0.5rem` (8px), `0.75rem` (12px)
- **Moyen** : `1rem` (16px), `1.25rem` (20px), `1.5rem` (24px)
- **Grand** : `2rem` (32px), `2.25rem` (36px), `2.5rem` (40px)
- **Très grand** : `5rem` (80px), `6.75rem` (108px)

---

## 🔤 Typographie Techem

### Polices
- **Corps** : `UniversLTPro-45Light` (fallback: system-ui, sans-serif)
- **Titres** : `UniversLTPro-55Roman`
- **Gras** : `UniversLTW02-65Bold`

### Hiérarchie
- **H1** : `3.75rem` (60px) desktop / `2rem` (32px) mobile
- **H2** : `2.5rem` (40px) desktop / `1.5rem` (24px) mobile
- **H3** : `2rem` (32px) desktop / `1.25rem` (20px) mobile
- **H4** : `1.25rem` (20px) desktop / `1.125rem` (18px) mobile
- **H5** : `1rem` (16px)
- **H6** : `0.875rem` (14px)
- **Corps** : `1rem` (16px)

---

## 📱 Breakpoints Techem

- **Mobile** : `max-width: 667px`
- **Tablet** : `max-width: 1024px` / `max-width: 1194px`
- **Desktop** : `max-width: 1440px`
- **Container max-width** : `77rem` (1232px) / `75rem` (1200px)

---

## ✅ Prochaines étapes

1. Commencer par la **Phase 1** (Configuration Tailwind)
2. Tester avec le **Header** (Phase 2.1)
3. Itérer et ajuster selon les retours visuels
4. Continuer avec Footer, Sidebar, puis Login
5. Créer les composants réutilisables une fois les patterns établis

---

**Note :** Cette roadmap est évolutive. N'hésitez pas à ajuster selon vos besoins et contraintes spécifiques.
