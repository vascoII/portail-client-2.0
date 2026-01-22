# 🎨 Guide d'utilisation des tokens Techem dans Tailwind

Ce guide explique comment utiliser les tokens Techem que nous venons d'ajouter dans `globals.css`.

---

## 🎨 Couleurs

### Couleurs principales (Rouge Techem)

```tsx
// Rouge principal
className="bg-[#e20613] text-white"
// ou avec la variable CSS
className="bg-[var(--color-techem-red)] text-white"

// Rouge foncé (hover)
className="hover:bg-[#b4050f]"
className="hover:bg-[var(--color-techem-red-dark)]"

// Rouge clair (disabled)
className="bg-[#ffa7ac]"
className="bg-[var(--color-techem-red-light)]"

// Rouge très clair (background hover)
className="bg-[#ffe5e6]"
className="bg-[var(--color-techem-red-very-light)]"
```

### Couleurs neutres

```tsx
// Noir texte principal
className="text-[#1d1914]"
className="text-[var(--color-techem-black)]"

// Gris foncé
className="text-[#222]"
className="text-[var(--color-techem-gray-dark-1)]"

// Gris moyen
className="text-[#6a6a6a]"
className="text-[var(--color-techem-gray-medium-1)]"

// Gris clair (background)
className="bg-[#e9ecef]"
className="bg-[var(--color-techem-gray-light-2)]"
```

### Couleurs d'alerte

```tsx
// Success
className="bg-[#417232] text-[#e9ecef]"
className="bg-[var(--color-techem-success-bg)] text-[var(--color-techem-success-text)]"

// Info
className="bg-[#009bb4] text-[#00344e]"
className="bg-[var(--color-techem-info-bg)] text-[var(--color-techem-info-text)]"

// Warning/Danger
className="bg-[#b00511] text-[#e9ecef]"
className="bg-[var(--color-techem-warning-bg)] text-[var(--color-techem-warning-text)]"
```

---

## 📐 Espacements

### Utilisation des espacements Techem

```tsx
// Petits espacements
className="p-[0.375rem]"      // 6px
className="p-[0.5rem]"        // 8px
className="p-[0.75rem]"       // 12px

// Espacements moyens
className="p-4"               // 1rem (16px) - équivalent Tailwind standard
className="p-5"               // 1.25rem (20px)
className="p-6"               // 1.5rem (24px)

// Grands espacements
className="p-8"               // 2rem (32px)
className="p-9"               // 2.25rem (36px)
className="p-10"              // 2.5rem (40px)

// Très grands espacements
className="p-20"               // 5rem (80px)
className="p-[6.75rem]"        // 108px
```

### Dimensions spécifiques

```tsx
// Header
className="h-20"               // 5rem (80px) - hauteur header
className="py-6"               // 1.5rem (24px) - padding vertical header

// Container
className="max-w-[77rem]"      // 1232px - largeur max container
className="max-w-[75rem]"      // 1200px - largeur max alternative
className="max-w-[49.63rem]"   // 794px - largeur max page login
```

---

## 🔤 Typographie

### Polices

```tsx
// Police de base (corps de texte)
className="font-[var(--font-techem-base)]"
// Note: En attendant d'avoir Univers LT Pro, utilisez:
className="font-sans"          // Fallback system-ui

// Police pour les titres
className="font-[var(--font-techem-heading)]"
// Fallback:
className="font-sans"

// Police en gras
className="font-[var(--font-techem-bold)]"
// Fallback:
className="font-bold"
```

### Tailles de texte (Hiérarchie Techem)

```tsx
// H1 - Desktop: 3.75rem (60px), Mobile: 2rem (32px)
className="text-6xl md:text-[3.75rem]"        // Desktop
className="text-2xl md:text-6xl"              // Responsive

// H2 - Desktop: 2.5rem (40px), Mobile: 1.5rem (24px)
className="text-2xl md:text-[2.5rem]"         // Desktop
className="text-xl md:text-2xl"               // Responsive

// H3 - Desktop: 2rem (32px), Mobile: 1.25rem (20px)
className="text-xl md:text-2xl"               // Desktop
className="text-base md:text-xl"              // Responsive

// H4 - Desktop: 1.25rem (20px), Mobile: 1.125rem (18px)
className="text-lg md:text-xl"                // Desktop
className="text-base md:text-lg"              // Responsive

// H5 - 1rem (16px)
className="text-base"

// H6 - 0.875rem (14px)
className="text-sm"

// Corps de texte - 1rem (16px)
className="text-base"

// Petit texte - 0.875rem (14px)
className="text-sm"
```

### Line-heights

```tsx
// H1
className="leading-[5rem] md:leading-[5rem]"  // Desktop: 80px
className="leading-10 md:leading-[5rem]"      // Mobile: 40px

// H2
className="leading-[3rem] md:leading-[3rem]"  // Desktop: 48px
className="leading-8 md:leading-[3rem]"      // Mobile: 32px

// Corps de texte
className="leading-6"                         // 1.5rem (24px)
```

---

## 🎯 Composants

### Boutons Techem

#### Primary Button
```tsx
<button className="
  bg-[#e20613] 
  text-white 
  hover:bg-[#b4050f] 
  border border-[#e20613] 
  hover:border-[#b4050f]
  rounded-lg 
  px-4 
  py-1.5
  min-w-[5.5rem]
  max-w-[17rem]
  transition-all 
  duration-300
  focus-visible:outline-4 
  focus-visible:outline-[#c2dafe]
  disabled:bg-[#ffa7ac]
  disabled:pointer-events-none
">
  Bouton Primary
</button>
```

#### Primary Light Button
```tsx
<button className="
  bg-white 
  text-[#e20613] 
  hover:bg-[#ffe5e6] 
  hover:text-[#b4050f]
  border border-white 
  hover:border-[#ffe5e6]
  rounded-lg 
  px-4 
  py-1.5
  transition-all 
  duration-300
  focus-visible:outline-4 
  focus-visible:outline-[#c2dafe]
  disabled:bg-[#ffa7ac]
  disabled:text-[#9a9a9a]
  disabled:pointer-events-none
">
  Bouton Primary Light
</button>
```

#### Secondary Button
```tsx
<button className="
  bg-transparent 
  text-[#1d1914] 
  hover:text-[#b4050f]
  border-2 border-[#1d1914] 
  hover:border-[#b4050f]
  rounded-lg 
  px-4 
  py-1.5
  transition-all 
  duration-300
  focus-visible:outline-4 
  focus-visible:outline-[#c2dafe]
  disabled:border-[#adb5bd]
  disabled:text-[#adb5bd]
  disabled:pointer-events-none
">
  Bouton Secondary
</button>
```

#### Secondary Light Button
```tsx
<button className="
  bg-transparent 
  text-white 
  hover:text-[#ffa7ac]
  border-2 border-white 
  hover:border-[#ffa7ac]
  rounded-lg 
  px-4 
  py-1.5
  transition-all 
  duration-300
  focus-visible:outline-4 
  focus-visible:outline-[#c2dafe]
  disabled:border-[#4d5154]
  disabled:text-[#4d5154]
  disabled:pointer-events-none
">
  Bouton Secondary Light
</button>
```

### Alertes Techem

#### Success
```tsx
<div className="
  bg-[#417232] 
  text-[#e9ecef] 
  p-4 
  mb-9
  rounded-lg
">
  Message de succès
</div>
```

#### Info
```tsx
<div className="
  bg-[#009bb4] 
  text-[#00344e] 
  p-4 
  mb-9
  rounded-lg
">
  Message d'information
</div>
```

#### Warning / Danger
```tsx
<div className="
  bg-[#b00511] 
  text-[#e9ecef] 
  p-4 
  mb-9
  rounded-lg
">
  Message d'avertissement
</div>
```

### Cartes Techem

```tsx
<div className="
  bg-white 
  rounded-xl 
  p-6
  shadow-[0_0.625rem_0.938rem_0_rgba(0,0,0,0.2)]
">
  Contenu de la carte
</div>
```

---

## 📱 Breakpoints Techem

```tsx
// Mobile (max-width: 667px)
className="max-[667px]:text-sm"

// Tablet (max-width: 1024px)
className="max-lg:text-base"

// Tablet alt (max-width: 1194px)
className="max-[1194px]:text-base"

// Desktop (max-width: 1440px)
className="max-[1440px]:container"
```

---

## 🎭 Transitions

```tsx
// Transition standard Techem
className="transition-all duration-300 ease-in-out"

// Transition spécifique
className="transition-opacity duration-100 ease-in-out"
```

---

## 📋 Exemples complets

### Header Techem
```tsx
<header className="
  sticky 
  top-0 
  w-full 
  bg-white 
  border-b 
  border-[#1d1914] 
  h-20 
  px-6
  z-50
">
  <div className="flex items-center justify-between h-full">
    <Link href="/" className="text-[#1d1914] hover:text-[#e20613] hover:underline transition-all duration-300">
      Logo
    </Link>
    <nav className="flex gap-6">
      <Link href="/" className="text-[#1d1914] hover:text-[#e20613] hover:underline transition-all duration-300">
        Accueil
      </Link>
    </nav>
  </div>
</header>
```

### Footer Techem
```tsx
<footer className="
  bg-[#1d1914] 
  text-white 
  border-t 
  border-[#1d1914] 
  py-6
  text-sm
">
  <div className="max-w-[77rem] mx-auto px-6">
    <div className="flex justify-between flex-wrap">
      <div>
        <h3 className="font-bold pb-3 text-base">Titre</h3>
        <a href="#" className="block pr-6 my-1 text-white">Lien</a>
      </div>
    </div>
  </div>
</footer>
```

### Input Techem
```tsx
<input 
  type="text"
  className="
    border 
    border-[#1d1914] 
    rounded-lg 
    px-2 
    py-1.5
    focus:outline-4 
    focus:outline-[#c2dafe]
    transition-all 
    duration-300
  "
/>
```

---

## ✅ Checklist d'utilisation

Lors de l'utilisation des tokens Techem :

- [ ] Utiliser les couleurs exactes (`#e20613`, `#1d1914`, etc.)
- [ ] Respecter les espacements du système (basé sur `rem`)
- [ ] Appliquer les transitions (`0.3s ease-in-out`)
- [ ] Utiliser les border-radius appropriés (`0.5rem` pour boutons, `12px` pour images)
- [ ] Respecter la hiérarchie typographique (H1-H6)
- [ ] Tester le responsive avec les breakpoints Techem
- [ ] Vérifier l'accessibilité (contraste, focus visible)

---

**Note :** Ces tokens sont maintenant disponibles dans `globals.css`. Utilisez-les pour maintenir la cohérence avec l'identité visuelle Techem officielle.
