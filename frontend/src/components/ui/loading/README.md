# Loading Components API

Une API complète de composants de chargement pour des états de chargement cohérents dans toute l'application. Tous les composants sont construits avec les meilleures pratiques Tailwind CSS 2025 et supportent le mode sombre.

## 📋 Analyse des patterns existants

### Domaines analysés
- **Parc** : `ParcMainCard`, `ParcMetrics`, `VosReleves`
- **Immeuble** : `ListImmeubles`, `ImmeubleMainCard`, `ImmeubleCard`, `ImmeubleMetrics`, `ImmeubleRelevesCard`
- **Logement** : `ListLogements`, `LogementMainCard`, `LogementCard`, `AppareilsTable`

### Patterns redondants identifiés

1. **Texte simple "Chargement..."** - Utilisé partout
2. **Utilisation de "..." pour les valeurs** - Pattern répétitif
3. **Conteneurs centrés avec min-h-[XXXpx]** - Pattern répétitif
4. **Spinners animate-spin** - Utilisés mais pas cohérents
5. **Pas de skeletons avec effet shimmer** - Manquant

## 🎨 Composants disponibles

### 1. LoadingSpinner
Spinner animé moderne avec différentes tailles et couleurs.

```tsx
import { LoadingSpinner } from '@/components/ui/loading';

<LoadingSpinner size="md" color="primary" />
<LoadingSpinner size="lg" color="gray" />
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" (défaut: "md")
- `color`: "primary" | "gray" | "white" (défaut: "primary")
- `className`: string (optionnel)

### 2. LoadingSkeleton
Skeleton loader avec effet pulse pour simuler le contenu.

```tsx
import { LoadingSkeleton } from '@/components/ui/loading';

<LoadingSkeleton variant="text" lines={3} />
<LoadingSkeleton variant="rectangular" width="100%" height={200} />
<LoadingSkeleton variant="circular" width={40} height={40} />
```

**Props:**
- `variant`: "text" | "circular" | "rectangular" (défaut: "rectangular")
- `width`: string | number (optionnel)
- `height`: string | number (optionnel)
- `lines`: number (pour variant="text", défaut: 1)
- `className`: string (optionnel)

### 3. LoadingContainer
Conteneur générique avec spinner et message optionnel.

```tsx
import { LoadingContainer } from '@/components/ui/loading';

<LoadingContainer 
  message="Chargement des données..." 
  minHeight="400px" 
/>
```

**Props:**
- `message`: string (défaut: "Chargement...")
- `minHeight`: string (défaut: "300px")
- `showSpinner`: boolean (défaut: true)
- `className`: string (optionnel)
- `children`: React.ReactNode (optionnel)

### 4. LoadingCard
Skeleton pour les composants de carte (comme ParcMainCard, ImmeubleMainCard).

```tsx
import { LoadingCard } from '@/components/ui/loading';

<LoadingCard 
  title="Informations du parc" 
  rows={2} 
  columns={[2, 4]} 
/>
```

**Props:**
- `title`: string (optionnel)
- `rows`: number (défaut: 2)
- `columns`: number | number[] (défaut: [2, 4])
- `showTitle`: boolean (défaut: true)
- `className`: string (optionnel)

### 5. LoadingTable
Composant de chargement pour les tableaux (comme ListImmeubles, ListLogements).

```tsx
import { LoadingTable } from '@/components/ui/loading';

<LoadingTable 
  rows={5} 
  columns={6} 
  showHeader 
  message="Chargement des immeubles..." 
/>
```

**Props:**
- `rows`: number (défaut: 5)
- `columns`: number (défaut: 6)
- `showHeader`: boolean (défaut: true)
- `message`: string (défaut: "Chargement...")
- `variant`: "skeleton" | "spinner" (défaut: "skeleton")
- `className`: string (optionnel)

### 6. LoadingMetrics
Skeleton pour les cartes de métriques (comme ParcMetrics).

```tsx
import { LoadingMetrics } from '@/components/ui/loading';

<LoadingMetrics count={4} />
```

**Props:**
- `count`: number (défaut: 4)
- `className`: string (optionnel)

### 7. LoadingChart
Composant de chargement pour les graphiques (comme VosReleves).

```tsx
import { LoadingChart } from '@/components/ui/loading';

<LoadingChart 
  height={330} 
  message="Chargement des données..." 
  variant="radial" 
/>
```

**Props:**
- `height`: number (défaut: 330)
- `message`: string (défaut: "Chargement des données...")
- `variant`: "radial" | "bar" | "line" (défaut: "radial")
- `showTitle`: boolean (défaut: true)
- `title`: string (optionnel)
- `className`: string (optionnel)

## 🚀 Migration des composants existants

### Avant (ParcMainCard)
```tsx
{isParcLoading ? (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
      {[1, 2].map((i) => (
        <div key={i}>
          <p className="mb-2 text-xs text-gray-500">Chargement...</p>
          <p className="text-2xl font-semibold">...</p>
        </div>
      ))}
    </div>
  </div>
) : (
  // Contenu réel
)}
```

### Après
```tsx
import { LoadingCard } from '@/components/ui/loading';

{isParcLoading ? (
  <LoadingCard 
    title="Informations du parc" 
    rows={2} 
    columns={[2, 4]} 
  />
) : (
  // Contenu réel
)}
```

## 📝 Notes

- Tous les composants supportent le mode sombre automatiquement
- Les animations utilisent `animate-pulse` de Tailwind (déjà disponible)
- Les composants sont entièrement typés avec TypeScript
- Tous les composants sont accessibles via l'export centralisé dans `index.ts`

