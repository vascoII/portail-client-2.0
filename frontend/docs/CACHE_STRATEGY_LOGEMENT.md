# Plan de Stratégie de Cache pour les Pages Logement

## 📋 Table des Matières
1. [Analyse de l'Existant](#analyse-de-lexistant)
2. [Objectifs](#objectifs)
3. [Architecture Multi-Niveaux](#architecture-multi-niveaux)
4. [Implémentation Détaillée](#implémentation-détaillée)
5. [Plan de Migration](#plan-de-migration)
6. [Métriques et Monitoring](#métriques-et-monitoring)

---

## 1. Analyse de l'Existant

### 1.1 État Actuel du Cache

#### Frontend (React Query)
- ✅ **Cache en mémoire** : React Query avec `staleTime` configuré
- ✅ **Stratégie temporelle** : `getStaleTimeUntilMidnight()` pour données SOAP
- ❌ **Pas de persistance** : Cache perdu au refresh
- ❌ **Pas de préchargement** : Données chargées à la demande
- ❌ **Pas de cache HTTP** : Pas de headers Cache-Control côté backend

#### Backend (Symfony)
- ❌ **Pas de cache HTTP** : Pas de headers de cache
- ❌ **Pas de cache applicatif** : Chaque requête appelle SOAP
- ✅ **Mode Faker** : Cache via fichiers JSON (dev uniquement)

#### Next.js
- ❌ **Pas de SSG/ISR** : Pages rendues à la demande
- ❌ **Pas de cache de routes** : Pas de prérendu

### 1.2 Problèmes Identifiés

1. **Performance**
   - Perte de cache au refresh → Rechargement complet
   - Pas de préchargement → Latence perçue élevée
   - Appels API redondants → Charge serveur inutile

2. **Expérience Utilisateur**
   - Temps de chargement initial long
   - Pas de données offline
   - Rechargement complet lors de la navigation

3. **Coûts**
   - Appels SOAP répétés
   - Bande passante gaspillée
   - Charge serveur non optimisée

---

## 2. Objectifs

### 2.1 Objectifs Principaux
- ⚡ **Réduire le temps de chargement** : < 500ms pour données en cache
- 💾 **Persistance du cache** : Survie au refresh navigateur
- 🔄 **Préchargement intelligent** : Charger les données probables
- 📉 **Réduire les appels API** : -70% d'appels redondants
- 🌐 **Support offline** : Affichage des données en cache si API indisponible

### 2.2 Métriques Cibles
- **Time to Interactive (TTI)** : < 1.5s (actuellement ~3-5s)
- **First Contentful Paint (FCP)** : < 1s
- **Cache Hit Rate** : > 80%
- **API Calls Reduction** : -70%

---

## 3. Architecture Multi-Niveaux

```
┌─────────────────────────────────────────────────────────────┐
│                    Niveau 1: Cache Client                    │
│              (React Query + Persistence)                     │
│  - localStorage/IndexedDB pour persistance                  │
│  - Cache en mémoire pour accès rapide                       │
│  - Invalidation intelligente                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Niveau 2: Cache Next.js (SSR/ISR)              │
│  - Prérendu des pages statiques                             │
│  - ISR pour données semi-dynamiques                          │
│  - Cache de routes                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Niveau 3: Cache HTTP (Backend)                 │
│  - Headers Cache-Control                                    │
│  - ETag pour validation conditionnelle                      │
│  - Cache CDN (si applicable)                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Niveau 4: Cache Applicatif (Symfony)            │
│  - Cache Symfony pour données SOAP                         │
│  - Cache Redis/Memcached (optionnel)                       │
│  - Invalidation basée sur TTL                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Implémentation Détaillée

### 4.1 Niveau 1 : Cache Client Persistant

#### 4.1.1 React Query Persistence Plugin

**Fichier** : `frontend/src/lib/cache/persistQueryClient.ts`

```typescript
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'

// Configuration du persister avec localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'TECHEM_QUERY_CACHE',
  serialize: JSON.stringify,
  deserialize: JSON.parse,
})

// Configuration du persister avec IndexedDB (pour grandes données)
const indexedDBPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => {
      const db = await openDB('techem-cache', 1)
      return await db.get('cache', key)
    },
    setItem: async (key, value) => {
      const db = await openDB('techem-cache', 1)
      await db.put('cache', value, key)
    },
    removeItem: async (key) => {
      const db = await openDB('techem-cache', 1)
      await db.delete('cache', key)
    },
  },
})

// Stratégie hybride : localStorage pour petites données, IndexedDB pour grandes
const hybridPersister = {
  persistClient: async (client) => {
    // Séparer les queries par taille
    const smallQueries = {}
    const largeQueries = {}
    
    for (const [key, value] of Object.entries(client.getQueryCache().getAll())) {
      const size = JSON.stringify(value).length
      if (size < 100000) { // < 100KB
        smallQueries[key] = value
      } else {
        largeQueries[key] = value
      }
    }
    
    await Promise.all([
      localStoragePersister.persistClient({ ...client, queries: smallQueries }),
      indexedDBPersister.persistClient({ ...client, queries: largeQueries }),
    ])
  },
  // ... reste de l'implémentation
}
```

#### 4.1.2 Configuration QueryClient Améliorée

**Fichier** : `frontend/src/app/providers.tsx` (modification)

```typescript
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000, // 24h pour données logement
      retry: 1,
      refetchOnWindowFocus: false, // Désactiver pour éviter refetch inutiles
      refetchOnReconnect: true,
      refetchOnMount: false, // Utiliser cache si disponible
      // Nouvelles options
      networkMode: 'offlineFirst', // Utiliser cache si offline
      placeholderData: (previousData) => previousData, // Garder anciennes données pendant refetch
    },
  },
})

// Configuration de persistance
const persister = createHybridPersister() // Voir 4.1.1

export default function Providers({ children }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24h
        buster: '', // Version du cache (incrémenter pour invalider)
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Persister uniquement les queries logement
            return query.queryKey[0] === 'logements' || 
                   query.queryKey[0] === 'immeubles'
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
```

#### 4.1.3 Préchargement Intelligent

**Fichier** : `frontend/src/lib/cache/prefetch.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

/**
 * Précharge les données d'un logement
 */
export async function prefetchLogement(
  queryClient: QueryClient,
  pkLogement: string
) {
  // Précharger les données principales
  await queryClient.prefetchQuery({
    queryKey: ['logements', pkLogement],
    queryFn: () => api.get(`/logements/${pkLogement}`),
    staleTime: getStaleTimeUntilMidnight(),
  })
  
  // Précharger les données liées (en parallèle)
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['logements', pkLogement, 'interventions'],
      queryFn: () => api.get(`/logements/${pkLogement}/interventions`),
    }),
    queryClient.prefetchQuery({
      queryKey: ['logements', pkLogement, 'fuites'],
      queryFn: () => api.get(`/logements/${pkLogement}/fuites`),
    }),
    queryClient.prefetchQuery({
      queryKey: ['logements', pkLogement, 'anomalies'],
      queryFn: () => api.get(`/logements/${pkLogement}/anomalies`),
    }),
  ])
}

/**
 * Précharge les logements d'un immeuble (pour navigation probable)
 */
export async function prefetchLogementsByImmeuble(
  queryClient: QueryClient,
  pkImmeuble: string
) {
  await queryClient.prefetchQuery({
    queryKey: ['logements', 'immeuble', pkImmeuble],
    queryFn: () => api.get(`/logements/immeuble/${pkImmeuble}`),
    staleTime: getStaleTimeUntilMidnight(),
  })
}

/**
 * Hook pour précharger au hover
 */
export function usePrefetchOnHover() {
  const queryClient = useQueryClient()
  const router = useRouter()
  
  const prefetchOnHover = (pkLogement: string) => {
    // Précharger au survol du lien
    prefetchLogement(queryClient, pkLogement)
  }
  
  return { prefetchOnHover }
}
```

**Utilisation dans les composants** :

```typescript
// Dans ListLogements.tsx
<Link
  href={`/immeuble/${pkImmeuble}/logements/${pkLogement}`}
  onMouseEnter={() => prefetchOnHover(pkLogement)}
>
  {logement.Nom}
</Link>
```

---

### 4.2 Niveau 2 : Cache Next.js (SSR/ISR)

#### 4.2.1 Static Site Generation (SSG) pour Pages Logement

**Fichier** : `frontend/src/app/(admin)/immeuble/[pkImmeuble]/logements/[pkLogement]/page.tsx`

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Générer les métadonnées statiques
export async function generateMetadata({
  params,
}: {
  params: { pkLogement: string };
}): Promise<Metadata> {
  // Les métadonnées peuvent être statiques
  return {
    title: `Logement ${params.pkLogement} | TECHEM`,
    description: "Détails du logement",
  };
}

// Optionnel : Générer les pages statiques au build
export async function generateStaticParams() {
  // Si on a une liste de logements populaires
  // Sinon, laisser Next.js générer à la demande
  return [];
}

// Revalidation ISR : Revalider toutes les 6 heures
export const revalidate = 6 * 60 * 60; // 6 heures

export default async function LogementDetailsPage({
  params,
}: {
  params: { pkImmeuble: string; pkLogement: string };
}) {
  const { pkLogement, pkImmeuble } = params;
  
  // Les données seront chargées côté client via React Query
  // Mais on peut précharger certaines données critiques ici
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Composants existants */}
    </div>
  );
}
```

#### 4.2.2 Route Handlers pour Préchargement

**Fichier** : `frontend/src/app/api/prefetch/logement/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { QueryClient } from '@tanstack/react-query'
import { prefetchLogement } from '@/lib/cache/prefetch'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const pkLogement = searchParams.get('pkLogement')
  
  if (!pkLogement) {
    return NextResponse.json({ error: 'pkLogement required' }, { status: 400 })
  }
  
  // Créer un QueryClient temporaire pour préchargement
  const queryClient = new QueryClient()
  
  try {
    await prefetchLogement(queryClient, pkLogement)
    
    // Retourner les données préchargées
    const data = queryClient.getQueryData(['logements', pkLogement])
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Prefetch failed' }, { status: 500 })
  }
}
```

---

### 4.3 Niveau 3 : Cache HTTP (Backend)

#### 4.3.1 Headers Cache-Control dans Symfony

**Fichier** : `src/Controller/Api/LogementApiController.php`

```php
<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class LogementApiController extends AbstractApiController
{
    /**
     * GET /api/logements/{pkLogement}
     * 
     * @param string|int $pkLogement
     * @return JsonResponse
     */
    public function show($pkLogement): JsonResponse
    {
        // ... logique existante ...
        
        $response = $this->sendFakeData('api.logements.pkLogement.json', [
            'pkLogement' => $pkLogement,
        ]);
        
        // Ajouter headers de cache
        $response->setPublic(); // Permettre cache public (CDN)
        $response->setMaxAge(3600); // Cache 1h
        $response->setSharedMaxAge(3600); // Cache partagé 1h
        $response->setEtag(md5(json_encode($response->getContent()))); // ETag pour validation
        
        // Headers personnalisés
        $response->headers->set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
        // stale-while-revalidate : servir cache pendant 24h pendant revalidation
        
        return $response;
    }
    
    /**
     * GET /api/logements/{pkLogement}/interventions
     */
    public function listInterventions($pkLogement): JsonResponse
    {
        // ... logique existante ...
        
        $response = $this->sendFakeData('api.logements.pkLogement.interventions.json', [
            'pkLogement' => $pkLogement,
        ]);
        
        // Cache plus court pour données dynamiques
        $response->setPublic();
        $response->setMaxAge(300); // 5 minutes
        $response->setSharedMaxAge(300);
        $response->headers->set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
        
        return $response;
    }
}
```

#### 4.3.2 Event Listener pour Headers Globaux

**Fichier** : `src/EventListener/CacheHeaderListener.php`

```php
<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CacheHeaderListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }
    
    public function onKernelResponse(ResponseEvent $event): void
    {
        $request = $event->getRequest();
        $response = $event->getResponse();
        
        // Appliquer cache uniquement aux routes API logements
        if (strpos($request->getPathInfo(), '/api/logements') === 0) {
            // Si pas déjà défini par le controller
            if (!$response->headers->has('Cache-Control')) {
                $response->headers->set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
            }
            
            // Ajouter ETag si pas présent
            if (!$response->headers->has('ETag')) {
                $content = $response->getContent();
                $etag = md5($content);
                $response->setEtag($etag);
            }
            
            // Support If-None-Match (304 Not Modified)
            if ($response->isNotModified($request)) {
                return;
            }
        }
    }
}
```

**Configuration** : `config/services.yaml`

```yaml
services:
    App\EventListener\CacheHeaderListener:
        tags:
            - { name: kernel.event_subscriber }
```

---

### 4.4 Niveau 4 : Cache Applicatif (Symfony)

#### 4.4.1 Cache Symfony pour Données SOAP

**Fichier** : `src/Service/LogementCacheService.php`

```php
<?php

namespace App\Service;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class LogementCacheService
{
    private CacheInterface $cache;
    private SoapClientService $soapClient;
    
    public function __construct(
        CacheInterface $cache,
        SoapClientService $soapClient
    ) {
        $this->cache = $cache;
        $this->soapClient = $soapClient;
    }
    
    /**
     * Récupère les données d'un logement avec cache
     */
    public function getLogementData(string $pkLogement): array
    {
        $cacheKey = "logement_{$pkLogement}";
        
        return $this->cache->get($cacheKey, function (ItemInterface $item) use ($pkLogement) {
            // TTL : jusqu'à minuit (comme frontend)
            $item->expiresAt($this->getMidnightExpiration());
            
            // Appel SOAP
            return $this->soapClient->getLogementData($pkLogement);
        });
    }
    
    /**
     * Invalide le cache d'un logement
     */
    public function invalidateLogement(string $pkLogement): void
    {
        $this->cache->delete("logement_{$pkLogement}");
    }
    
    /**
     * Calcule l'expiration jusqu'à minuit
     */
    private function getMidnightExpiration(): \DateTimeInterface
    {
        $midnight = new \DateTime('tomorrow 00:00:00');
        return $midnight;
    }
}
```

**Configuration** : `config/packages/cache.yaml`

```yaml
framework:
    cache:
        pools:
            logement.cache:
                adapter: cache.adapter.filesystem
                default_lifetime: 86400 # 24h
```

---

## 5. Plan de Migration

### Phase 1 : Cache Client Persistant (Semaine 1-2)
- [ ] Installer `@tanstack/react-query-persist-client`
- [ ] Implémenter persister hybride (localStorage + IndexedDB)
- [ ] Modifier `providers.tsx` pour utiliser PersistQueryClientProvider
- [ ] Tester persistance au refresh
- [ ] Mesurer amélioration TTI

### Phase 2 : Préchargement Intelligent (Semaine 3)
- [ ] Créer `prefetch.ts` avec fonctions de préchargement
- [ ] Ajouter `onMouseEnter` sur liens logements
- [ ] Implémenter route handler `/api/prefetch/logement`
- [ ] Tester préchargement au hover
- [ ] Mesurer réduction latence perçue

### Phase 3 : Cache HTTP Backend (Semaine 4)
- [ ] Ajouter headers Cache-Control dans `LogementApiController`
- [ ] Créer `CacheHeaderListener` pour headers globaux
- [ ] Implémenter support ETag / If-None-Match
- [ ] Tester avec DevTools Network
- [ ] Mesurer réduction appels API

### Phase 4 : Cache Applicatif Symfony (Semaine 5)
- [ ] Créer `LogementCacheService`
- [ ] Intégrer dans `LogementApiController`
- [ ] Configurer cache pool Symfony
- [ ] Tester invalidation cache
- [ ] Mesurer réduction appels SOAP

### Phase 5 : Optimisations Next.js (Semaine 6)
- [ ] Ajouter `revalidate` aux pages logement
- [ ] Implémenter `generateStaticParams` si applicable
- [ ] Optimiser métadonnées
- [ ] Tester performance SSR
- [ ] Mesurer amélioration FCP

---

## 6. Métriques et Monitoring

### 6.1 Métriques à Suivre

#### Performance Frontend
- **Time to Interactive (TTI)** : Cible < 1.5s
- **First Contentful Paint (FCP)** : Cible < 1s
- **Largest Contentful Paint (LCP)** : Cible < 2.5s
- **Cache Hit Rate** : Cible > 80%

#### Performance Backend
- **API Response Time** : Cible < 200ms (avec cache)
- **SOAP Calls Reduction** : Cible -70%
- **Cache Hit Rate Backend** : Cible > 90%

#### Expérience Utilisateur
- **Perceived Load Time** : Cible < 500ms (données en cache)
- **Offline Support** : Cible 100% (affichage cache)

### 6.2 Outils de Monitoring

#### Frontend
```typescript
// frontend/src/lib/monitoring/cacheMetrics.ts
export function trackCacheMetrics() {
  // Web Vitals
  getCLS(console.log)
  getFID(console.log)
  getFCP(console.log)
  getLCP(console.log)
  getTTFB(console.log)
  
  // Cache metrics
  const queryCache = queryClient.getQueryCache()
  const cacheSize = queryCache.getAll().length
  const cacheHitRate = calculateCacheHitRate()
  
  // Envoyer à analytics
  analytics.track('cache_metrics', {
    cacheSize,
    cacheHitRate,
  })
}
```

#### Backend
```php
// src/EventListener/CacheMetricsListener.php
class CacheMetricsListener
{
    public function onKernelResponse(ResponseEvent $event): void
    {
        // Logger métriques cache
        $this->logger->info('cache_metrics', [
            'cache_hit' => $event->getResponse()->headers->has('X-Cache-Hit'),
            'response_time' => $this->getResponseTime(),
        ]);
    }
}
```

---

## 7. Considérations Spéciales

### 7.1 Invalidation du Cache

#### Stratégies d'Invalidation

1. **Time-Based** : Expiration automatique (déjà implémenté)
2. **Event-Based** : Invalidation lors de mutations
   ```typescript
   // Dans useLogements.ts
   const updateOccupantMutation = useMutation({
     onSuccess: (_, variables) => {
       // Invalider le cache du logement modifié
       queryClient.invalidateQueries({
         queryKey: ['logements', variables.pkLogement],
       })
     },
   })
   ```
3. **Manual** : Bouton "Rafraîchir" pour forcer refresh
   ```typescript
   const handleRefresh = () => {
     queryClient.invalidateQueries({
       queryKey: ['logements', pkLogement],
     })
     queryClient.refetchQueries({
       queryKey: ['logements', pkLogement],
     })
   }
   ```

### 7.2 Gestion des Erreurs

```typescript
// Fallback vers cache en cas d'erreur API
const { data, error } = useQuery({
  queryKey: ['logements', pkLogement],
  queryFn: fetchLogement,
  retry: false,
  // Utiliser cache même si stale en cas d'erreur
  placeholderData: (previousData) => {
    if (error && previousData) {
      return previousData // Afficher anciennes données
    }
    return undefined
  },
})
```

### 7.3 Gestion de la Taille du Cache

```typescript
// Limiter la taille du cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000, // 24h
    },
  },
  // Limiter nombre de queries en cache
  queryCache: new QueryCache({
    onError: (error) => {
      // Logger erreurs
    },
  }),
})

// Nettoyer cache périodiquement
setInterval(() => {
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()
  
  // Supprimer queries non utilisées depuis > 7 jours
  queries.forEach(query => {
    if (query.getObserversCount() === 0 && 
        Date.now() - query.state.dataUpdatedAt > 7 * 24 * 60 * 60 * 1000) {
      cache.remove(query)
    }
  })
}, 60 * 60 * 1000) // Toutes les heures
```

---

## 8. Checklist d'Implémentation

### Phase 1 : Cache Client
- [ ] Installer dépendances (`@tanstack/react-query-persist-client`, `idb`)
- [ ] Créer `persistQueryClient.ts`
- [ ] Modifier `providers.tsx`
- [ ] Tester persistance localStorage
- [ ] Tester persistance IndexedDB
- [ ] Mesurer amélioration TTI

### Phase 2 : Préchargement
- [ ] Créer `prefetch.ts`
- [ ] Ajouter `onMouseEnter` sur liens
- [ ] Créer route handler `/api/prefetch`
- [ ] Tester préchargement
- [ ] Mesurer latence perçue

### Phase 3 : Cache HTTP
- [ ] Modifier `LogementApiController`
- [ ] Créer `CacheHeaderListener`
- [ ] Tester headers avec DevTools
- [ ] Tester ETag / 304
- [ ] Mesurer réduction appels API

### Phase 4 : Cache Symfony
- [ ] Créer `LogementCacheService`
- [ ] Configurer cache pool
- [ ] Intégrer dans controller
- [ ] Tester invalidation
- [ ] Mesurer réduction appels SOAP

### Phase 5 : Optimisations
- [ ] Ajouter `revalidate` pages
- [ ] Optimiser métadonnées
- [ ] Tester performance globale
- [ ] Documenter stratégie

---

## 9. Ressources et Références

- [React Query Persistence](https://tanstack.com/query/latest/docs/react/plugins/persistQueryClient)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Symfony Cache](https://symfony.com/doc/current/components/cache.html)
- [HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

---

**Date de création** : 2025-01-XX  
**Version** : 1.0  
**Auteur** : Équipe Développement TECHEM

