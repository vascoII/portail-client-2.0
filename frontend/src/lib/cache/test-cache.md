# Test du Cache Client Persistant

## Comment tester

### 1. Test de Persistance Basique

1. Ouvrir l'application en mode développement
2. Naviguer vers une page logement : `/immeuble/{pkImmeuble}/logements/{pkLogement}`
3. Attendre que les données se chargent
4. Ouvrir les DevTools → Application → Local Storage
5. Vérifier qu'une clé `TECHEM_QUERY_CACHE` existe
6. Rafraîchir la page (F5)
7. **Résultat attendu** : Les données s'affichent instantanément depuis le cache (pas de spinner de chargement)

### 2. Test de Restauration

1. Charger une page logement
2. Fermer l'onglet du navigateur
3. Rouvrir l'application dans le même navigateur
4. Naviguer vers la même page logement
5. **Résultat attendu** : Les données s'affichent immédiatement depuis le cache

### 3. Test d'Invalidation

1. Charger une page logement
2. Dans la console du navigateur, exécuter :
   ```javascript
   localStorage.removeItem('TECHEM_QUERY_CACHE');
   ```
3. Rafraîchir la page
4. **Résultat attendu** : Les données sont rechargées depuis l'API

### 4. Test de Version (Buster)

1. Modifier `buster: "1.0.1"` dans `providers.tsx`
2. Recharger l'application
3. **Résultat attendu** : L'ancien cache est ignoré, nouvelles données chargées

### 5. Test Offline

1. Charger une page logement (données en cache)
2. Désactiver le réseau (DevTools → Network → Offline)
3. Rafraîchir la page
4. **Résultat attendu** : Les données s'affichent depuis le cache (mode offline-first)

## Vérification dans React Query DevTools

1. Ouvrir React Query DevTools (icône en bas à gauche en dev)
2. Vérifier l'onglet "Queries"
3. Les queries persistées doivent avoir un indicateur spécial
4. Vérifier que les queries `logements`, `immeubles`, `parc` sont présentes
5. Vérifier que les autres queries (tickets, etc.) ne sont PAS persistées

## Métriques à Observer

- **Time to Interactive (TTI)** : Devrait être < 1.5s avec cache
- **First Contentful Paint (FCP)** : Devrait être < 1s avec cache
- **Network Requests** : Devrait être 0 pour données en cache

## Problèmes Courants

### Le cache ne fonctionne pas

1. Vérifier que `shouldDehydrateQuery` retourne `true` pour la query
2. Vérifier localStorage dans DevTools
3. Vérifier la console pour erreurs

### Données obsolètes

1. Vérifier `staleTime` dans les hooks
2. Vérifier `maxAge` dans `persistOptions`
3. Utiliser `queryClient.invalidateQueries()` si nécessaire

