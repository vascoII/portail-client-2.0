# 📊 Analyse du Simulateur de Consommation

## 📋 Vue d'ensemble

Le simulateur de consommation est un formulaire complexe qui permet aux occupants de calculer leur consommation d'eau estimée en fonction de leurs habitudes et équipements.

## 🔍 Analyse de la Logique Actuelle

### 1. **Logique de Calcul (Côté Client)**

La logique de calcul est **entièrement côté client** dans le JavaScript inline du template Twig. Aucun appel API n'est nécessaire pour les calculs.

#### Formules de Calcul (en litres par semaine) :

```javascript
// Douches
showerUse = occupants * showers * 50

// Bains
bathUse = occupants * baths * 150

// Chasses d'eau
toiletUse = occupants * flushes * (toiletType === 'eco' ? 5 : 10)

// Lave-vaisselle
dishwasherUse = dishwasherCycles * (dishwasherPerf === 'low' ? 10 : 15)

// Lave-linge
washingUse = washingCycles * (washingPerf === 'low' ? 50 : 70)

// Jardin
gardenUse = gardenSize * 6

// Conversion mensuelle
if (isMonthly) {
  data[key] *= 4  // Multiplier par 4 pour obtenir les valeurs mensuelles
}
```

### 2. **Champs du Formulaire**

| Champ | Type | Conditionnel | Validation |
|-------|------|--------------|------------|
| Nombre d'occupants | `number` | ❌ Non | Requis |
| Lave-vaisselle | `radio` (Oui/Non) | ✅ Oui | - |
| - Performance | `select` | Si Oui | Faible/Standard |
| - Cycles/semaine | `number` | Si Oui | - |
| Lave-linge | `radio` (Oui/Non) | ✅ Oui | - |
| - Performance | `select` | Si Oui | Faible/Standard |
| - Cycles/semaine | `number` | Si Oui | - |
| Douches/semaine/occupant | `number` | ❌ Non | Requis |
| Bains/semaine/occupant | `number` | ❌ Non | Requis |
| WC Type | `radio` | ❌ Non | Standard/Économique |
| Utilisation WC/semaine/occupant | `number` | ❌ Non | - |
| Jardin | `radio` (Oui/Non) | ✅ Oui | - |
| - Surface (m²) | `number` | Si Oui | - |

### 3. **Visualisation**

- **Graphique** : Utilise Chart.js pour afficher un graphique en barres
- **Toggle** : Permet d'afficher les résultats en valeurs hebdomadaires ou mensuelles
- **Affichage du total** : Affiche la consommation totale calculée

### 4. **Dépendances Externes**

- **Chart.js** : Bibliothèque pour les graphiques (via CDN)
- Aucune dépendance API pour les calculs

## ✅ Conclusion : Migration Possible Côté Frontend

### **OUI, la logique peut être migrée côté frontend React**

#### ✅ **Avantages de la migration React** :

1. **Logique simple** : Les calculs sont des formules mathématiques simples, faciles à implémenter en TypeScript
2. **Pas d'appel API** : Aucune dépendance serveur pour les calculs
3. **Meilleure gestion d'état** : React permet une meilleure gestion des champs conditionnels
4. **TypeScript** : Typage fort pour éviter les erreurs
5. **Bibliothèques modernes** : 
   - React Hook Form pour la gestion du formulaire
   - Zod pour la validation
   - Recharts ou ApexCharts pour les graphiques (déjà dans le projet)
6. **Performance** : Calculs instantanés côté client, pas de latence réseau

#### 📦 **Technologies à utiliser** :

- **React Hook Form** : Gestion du formulaire avec validation
- **Zod** : Schéma de validation TypeScript
- **Recharts** ou **ApexCharts** : Graphiques (remplace Chart.js)
- **useMemo/useCallback** : Optimisation des calculs
- **useState/useEffect** : Gestion de l'état et des champs conditionnels

#### 🎯 **Structure du Composant** :

```typescript
// Structure proposée
interface SimulatorFormData {
  occupants: number;
  dishwasher: 'yes' | 'none';
  dishwasherPerf?: 'low' | 'standard';
  dishwasherCycles?: number;
  washingMachine: 'yes' | 'none';
  washingPerf?: 'low' | 'standard';
  washingCycles?: number;
  showers: number;
  baths: number;
  toilet: 'standard' | 'eco';
  flushes: number;
  garden: 'yes' | 'none';
  gardenSize?: number;
}

// Fonction de calcul
function calculateConsumption(data: SimulatorFormData, isMonthly: boolean) {
  // Logique de calcul identique à l'original
  // Retourne un objet avec les consommations par catégorie
}
```

#### ⚠️ **Points d'attention** :

1. **Champs conditionnels** : Gérer l'affichage/masquage des sections selon les choix (lave-vaisselle, lave-linge, jardin)
2. **Validation** : Valider que les champs conditionnels sont remplis si l'option est activée
3. **Graphique** : Adapter le graphique Chart.js vers Recharts/ApexCharts
4. **Performance** : Utiliser `useMemo` pour éviter de recalculer à chaque render
5. **Responsive** : S'assurer que le graphique est responsive

## 📊 Estimation de Complexité

- **Complexité** : 🟡 **Moyenne**
- **Temps estimé** : **6-8 heures**
  - Structure du formulaire : 2-3h
  - Logique de calcul : 1-2h
  - Graphique : 2-3h
  - Tests et ajustements : 1h

## 🚀 Recommandation

**✅ MIGRER VERS REACT**

La logique est entièrement côté client et peut être facilement migrée vers React avec les avantages suivants :
- Meilleure maintenabilité
- Typage TypeScript
- Gestion d'état plus robuste
- Bibliothèques modernes pour les graphiques
- Pas de dépendance externe (Chart.js via CDN)

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ Prêt pour migration

