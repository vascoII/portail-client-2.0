# 🎨 Techem Design Tokens - Référence rapide

Ce fichier contient toutes les valeurs exactes extraites du CSS officiel Techem pour référence rapide lors de l'implémentation.

---

## 🎨 Couleurs

### Couleurs principales (Rouge Techem)
```css
--techem-red: #e20613;              /* Rouge principal */
--techem-red-dark: #b4050f;         /* Rouge foncé (hover) */
--techem-red-alt: #b00511;          /* Variante rouge foncé */
--techem-red-light: #ffa7ac;        /* Rouge clair (disabled) */
--techem-red-very-light: #ffe5e6;   /* Rouge très clair (background hover) */
```

### Couleurs neutres
```css
--techem-black: #1d1914;            /* Noir texte principal */
--techem-gray-dark-1: #222;         /* Gris très foncé */
--techem-gray-dark-2: #4c4c4c;     /* Gris foncé */
--techem-gray-dark-3: #4d5154;     /* Gris foncé alternatif */
--techem-gray-medium-1: #6a6a6a;    /* Gris moyen */
--techem-gray-medium-2: #9a9a9a;    /* Gris moyen clair */
--techem-gray-medium-3: #adb5bd;   /* Gris moyen (disabled) */
--techem-gray-light-1: #b2b2b2;    /* Gris clair */
--techem-gray-light-2: #e9ecef;    /* Gris très clair (background) */
--techem-white: #fff;               /* Blanc */
```

### Couleurs d'alerte
```css
--techem-success-bg: #417232;       /* Fond succès */
--techem-success-text: #e9ecef;     /* Texte succès */
--techem-info-bg: #009bb4;          /* Fond info */
--techem-info-text: #00344e;        /* Texte info */
--techem-warning-bg: #b00511;       /* Fond warning/danger */
--techem-warning-text: #e9ecef;     /* Texte warning/danger */
```

### Couleurs spéciales
```css
--techem-focus-outline: #c2dafe;    /* Outline focus (accessibilité) */
--techem-link-hover: #2020e0;       /* Lien hover (dark mode) */
```

---

## 📐 Espacements (Spacing)

### Système basé sur `rem` (1rem = 16px)

#### Petits espacements
```css
--spacing-xs: 0.375rem;    /* 6px */
--spacing-sm: 0.5rem;      /* 8px */
--spacing-md: 0.75rem;    /* 12px */
```

#### Espacements moyens
```css
--spacing-base: 1rem;      /* 16px */
--spacing-lg: 1.25rem;     /* 20px */
--spacing-xl: 1.5rem;      /* 24px */
```

#### Grands espacements
```css
--spacing-2xl: 2rem;       /* 32px */
--spacing-3xl: 2.25rem;    /* 36px */
--spacing-4xl: 2.5rem;     /* 40px */
```

#### Très grands espacements
```css
--spacing-5xl: 5rem;       /* 80px */
--spacing-6xl: 6.75rem;    /* 108px */
```

### Espacements spécifiques
```css
--header-height: 5rem;              /* 80px - Hauteur header */
--header-padding-y: 1.5rem;        /* 24px - Padding vertical header */
--footer-padding-y: 1.5rem;        /* 24px - Padding vertical footer */
--container-max-width: 77rem;       /* 1232px - Largeur max container */
--container-max-width-alt: 75rem;   /* 1200px - Largeur max alternative */
--login-container-max: 49.63rem;   /* 794px - Largeur max page login */
```

---

## 🔤 Typographie

### Polices
```css
--font-family-base: "UniversLTPro-45Light", system-ui, sans-serif;
--font-family-heading: "UniversLTPro-55Roman", system-ui, sans-serif;
--font-family-bold: "UniversLTW02-65Bold", "UniversLTCYRW10-65Bold", system-ui, sans-serif;
```

### Tailles de texte

#### Titres
```css
--text-h1-size: 3.75rem;           /* 60px */
--text-h1-line: 5rem;              /* 80px */
--text-h1-size-mobile: 2rem;       /* 32px */
--text-h1-line-mobile: 2.5rem;     /* 40px */

--text-h2-size: 2.5rem;            /* 40px */
--text-h2-line: 3rem;               /* 48px */
--text-h2-size-mobile: 1.5rem;     /* 24px */
--text-h2-line-mobile: 2rem;       /* 32px */

--text-h3-size: 2rem;              /* 32px */
--text-h3-line: 2.75rem;            /* 44px */
--text-h3-size-mobile: 1.25rem;    /* 20px */
--text-h3-line-mobile: 1.875rem;   /* 30px */

--text-h4-size: 1.25rem;           /* 20px */
--text-h4-line: 1.875rem;          /* 30px */
--text-h4-size-mobile: 1.125rem;   /* 18px */
--text-h4-line-mobile: 1.5rem;     /* 24px */

--text-h5-size: 1rem;              /* 16px */
--text-h5-line: 1.5rem;            /* 24px */

--text-h6-size: 0.875rem;          /* 14px */
--text-h6-line: 1.5rem;            /* 24px */
--text-h6-line-mobile: 0.875rem;   /* 14px */
```

#### Corps de texte
```css
--text-base-size: 1rem;            /* 16px */
--text-base-line: 1.5rem;          /* 24px */
--text-small-size: 0.875rem;       /* 14px */
--text-small-line: 1.25rem;         /* 20px */
```

### Poids de police
```css
--font-weight-normal: 400;
--font-weight-bold: bold;            /* Utilise la font bold */
```

---

## 🎯 Composants

### Boutons

#### Dimensions
```css
--button-padding-y: 0.375rem;      /* 6px */
--button-padding-x: 1rem;          /* 16px */
--button-border-radius: 0.5rem;    /* 8px */
--button-min-width: 5.5rem;        /* 88px */
--button-max-width: 17rem;         /* 272px */
```

#### Variantes de couleurs

**Primary Button**
```css
--button-primary-bg: #e20613;
--button-primary-text: #fff;
--button-primary-border: #e20613;
--button-primary-hover-bg: #b4050f;
--button-primary-hover-border: #b4050f;
--button-primary-disabled-bg: #ffa7ac;
--button-primary-focus-outline: 4px solid #c2dafe;
```

**Primary Light Button**
```css
--button-primary-light-bg: #fff;
--button-primary-light-text: #e20613;
--button-primary-light-border: #fff;
--button-primary-light-hover-bg: #ffe5e6;
--button-primary-light-hover-text: #b4050f;
--button-primary-light-hover-border: #ffe5e6;
--button-primary-light-disabled-bg: #ffa7ac;
--button-primary-light-disabled-text: #9a9a9a;
```

**Secondary Button**
```css
--button-secondary-bg: transparent;
--button-secondary-text: #1d1914;
--button-secondary-border: 2px solid #1d1914;
--button-secondary-hover-border: 2px solid #b4050f;
--button-secondary-hover-text: #b4050f;
--button-secondary-disabled-border: 2px solid #adb5bd;
--button-secondary-disabled-text: #adb5bd;
```

**Secondary Light Button**
```css
--button-secondary-light-bg: transparent;
--button-secondary-light-text: #fff;
--button-secondary-light-border: 2px solid #fff;
--button-secondary-light-hover-border: 2px solid #ffa7ac;
--button-secondary-light-hover-text: #ffa7ac;
--button-secondary-light-disabled-border: 2px solid #4d5154;
--button-secondary-light-disabled-text: #4d5154;
```

### Alertes

#### Success
```css
--alert-success-bg: #417232;
--alert-success-text: #e9ecef;
--alert-padding: 1rem;
--alert-margin-bottom: 2.25rem;
```

#### Info
```css
--alert-info-bg: #009bb4;
--alert-info-text: #00344e;
```

#### Warning / Danger
```css
--alert-warning-bg: #b00511;
--alert-warning-text: #e9ecef;
```

### Cartes / Containers

```css
--card-border-radius: 12px;                    /* Pour les images */
--card-padding: 1.5rem;                        /* 24px */
--card-shadow: 0 0.625rem 0.938rem 0 rgba(0, 0, 0, 0.2);
--card-background: #fff;
```

### Modals / Lightbox

```css
--modal-background-overlay: rgba(0, 0, 0, 0.8);
--modal-background: #fff;
--modal-max-width: 49.63rem;                  /* 794px */
--modal-padding: 2rem;                        /* 32px */
--modal-padding-mobile: 1.25rem;              /* 20px */
--modal-shadow: 0 0.625rem 0.938rem 0 rgba(0, 0, 0, 0.2);
```

### Back to Top Button

```css
--back-to-top-size: 2.5rem;                   /* 40px */
--back-to-top-border-radius: 0.5rem 0 0 0.5rem;
--back-to-top-shadow: 0 20px 24px 0 rgba(16, 24, 40, 0.08), 0 8px 8px 0 rgba(16, 24, 40, 0.03);
--back-to-top-bg: #fff;
--back-to-top-hover-bg: #e20613;
```

---

## 📱 Breakpoints

```css
--breakpoint-mobile: 667px;
--breakpoint-tablet: 1024px;
--breakpoint-tablet-alt: 1194px;
--breakpoint-desktop: 1440px;
```

### Utilisation en media queries
```css
/* Mobile */
@media (max-width: 667px) { }

/* Tablet */
@media (max-width: 1024px) { }
@media (max-width: 1194px) { }

/* Desktop */
@media (max-width: 1440px) { }
```

---

## 🎭 Transitions et animations

```css
--transition-duration: 0.3s;
--transition-timing: ease-in-out;
--transition-property: all;
```

### Exemples
```css
/* Transition standard */
transition: all 0.3s ease-in-out;

/* Transition spécifique */
transition-property: opacity;
transition-duration: 0.1s;
transition-timing-function: ease-in-out;
```

---

## 🎨 Ombres (Shadows)

```css
/* Ombre légère (cards) */
--shadow-card: 0 0.625rem 0.938rem 0 rgba(0, 0, 0, 0.2);

/* Ombre back-to-top */
--shadow-back-to-top: 0 20px 24px 0 rgba(16, 24, 40, 0.08), 0 8px 8px 0 rgba(16, 24, 40, 0.03);
```

---

## 📏 Border Radius

```css
--radius-sm: 0.5rem;        /* 8px - Boutons, inputs */
--radius-md: 12px;           /* 12px - Images, cards */
```

---

## 🔗 Liens

```css
--link-color: #b00511;                    /* Couleur lien dans paragraphe */
--link-hover-color: #b00511;              /* Hover lien */
--link-decoration: underline;             /* Défaut underline */
--link-transition: all 0.3s ease-in-out;  /* Transition */
```

---

## 📋 Exemples d'utilisation Tailwind

### Couleurs
```tsx
className="bg-[#e20613] text-white"           // Rouge Techem
className="text-[#1d1914]"                   // Noir texte
className="border-[#1d1914]"                 // Bordure noire
className="hover:text-[#e20613]"             // Hover rouge
```

### Espacements
```tsx
className="p-4"                              // 1rem (16px)
className="px-6 py-4"                        // 1.5rem x, 1rem y
className="mt-6"                             // 1.5rem top
className="gap-4"                            // 1rem gap
```

### Typographie
```tsx
className="text-4xl"                         // 2.5rem (H2 desktop)
className="text-2xl"                         // 1.5rem (H2 mobile)
className="text-base"                        // 1rem (16px)
className="text-sm"                          // 0.875rem (14px)
```

### Boutons
```tsx
// Primary
className="bg-[#e20613] text-white hover:bg-[#b4050f] rounded-lg px-4 py-1.5"

// Secondary
className="bg-transparent border-2 border-[#1d1914] text-[#1d1914] hover:border-[#b4050f] hover:text-[#b4050f] rounded-lg px-4 py-1.5"
```

---

## ✅ Checklist d'implémentation

Lors de l'application de ces tokens, vérifier :

- [ ] Les valeurs hexadécimales sont exactes
- [ ] Les espacements utilisent le système `rem`
- [ ] Les breakpoints correspondent aux valeurs Techem
- [ ] Les transitions sont de `0.3s ease-in-out`
- [ ] Les border-radius sont `0.5rem` (boutons) ou `12px` (images)
- [ ] Les ombres correspondent aux valeurs définies
- [ ] La typographie respecte la hiérarchie H1-H6

---

**Note :** Ces tokens sont extraits directement du CSS officiel Techem (`techem_corp.css`). Utilisez-les comme référence absolue pour maintenir la cohérence avec l'identité visuelle du groupe.
