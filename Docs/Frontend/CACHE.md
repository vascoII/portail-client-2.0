# Cache Client Persistant - Documentation

## Vue d'ensemble

Le système de cache client persistant permet de conserver les données React Query dans le navigateur, même après un rafraîchissement de page. Cela améliore significativement les performances et l'expérience utilisateur.

## Architecture

### Niveau 1 : Cache Client Persistant ✅

- **Storage** : localStorage
- **Durée** : 24 heures
- **Scope** : Queries logement, immeubles, parc, gestion-parc uniquement
- **Version** : 1.0.0 (incrémenter `buster` dans `providers.tsx` pour invalider)

## Fonctionnalités

### 1. Persistance Automatique

Les données sont automatiquement sauvegardées dans localStorage lors de chaque mise à jour du cache React Query.

### 2. Restauration au Chargement

Au chargement de l'application, les données sont restaurées depuis localStorage, permettant un affichage instantané.

### 3. Filtrage Intelligent

Seules les queries importantes sont persistées :
- `logements`
- `immeubles`
- `parc`
- `gestion-parc`

Les autres queries (tickets, factures, etc.) ne sont pas persistées car elles changent fréquemment.

## Configuration

### Modifier la Version du Cache

Pour invalider tout le cache (par exemple après une mise à jour majeure de l'API) :

```typescript
// frontend/src/app/providers.tsx
persistOptions={{
  buster: "1.0.1", // Incrémenter cette valeur
  // ...
}}
```

### Ajouter/Retirer des Queries à Persister

```typescript
// frontend/src/app/providers.tsx
dehydrateOptions: {
  shouldDehydrateQuery: (query) => {
    const queryKey = query.queryKey[0];
    return (
      queryKey === "logements" ||
      queryKey === "nouvelle-query" // Ajouter ici
    );
  },
}
```

### Modifier la Durée de Cache

```typescript
// frontend/src/app/providers.tsx
persistOptions={{
  maxAge: 48 * 60 * 60 * 1000, // 48 heures au lieu de 24
  // ...
}}
```

## Utilisation

### Vérifier le Cache

Dans les DevTools React Query (mode développement) :
1. Ouvrir les DevTools React Query
2. Vérifier l'onglet "Queries"
3. Les queries persistées sont marquées avec un indicateur spécial

### Vider le Cache Manuellement

```typescript
// Dans la console du navigateur
localStorage.removeItem('TECHEM_QUERY_CACHE');
// Puis rafraîchir la page
```

### Debugging

Pour voir le contenu du cache :

```typescript
// Dans la console du navigateur
const cache = localStorage.getItem('TECHEM_QUERY_CACHE');
console.log(JSON.parse(cache));
```

## Limitations

1. **Taille** : localStorage est limité à ~5-10MB selon le navigateur
2. **Performance** : Les très grandes données peuvent ralentir la sérialisation
3. **Sécurité** : Les données sont stockées en clair (pas de données sensibles)

## Prochaines Étapes

- [ ] Ajouter support IndexedDB pour très grandes données
- [ ] Implémenter compression des données
- [ ] Ajouter métriques de cache hit rate
- [ ] Implémenter préchargement intelligent (Phase 2)

## Troubleshooting

### Le cache ne persiste pas

1. Vérifier que `shouldDehydrateQuery` retourne `true` pour la query
2. Vérifier que localStorage est disponible (pas en mode privé)
3. Vérifier la console pour erreurs de sérialisation

### Le cache est trop volumineux

1. Réduire `maxAge` dans `persistOptions`
2. Filtrer plus strictement avec `shouldDehydrateQuery`
3. Implémenter IndexedDB pour grandes données

### Données obsolètes

1. Incrémenter `buster` pour invalider tout le cache
2. Utiliser `queryClient.invalidateQueries()` pour invalider spécifiquement
3. Vérifier que `staleTime` est correctement configuré

