/**
 * Cache utilities for React Query
 * 
 * Provides utility functions for calculating staleTime values
 * based on SOAP data update schedule (once per night at 2 AM)
 */

/**
 * Calcule le temps en millisecondes jusqu'à minuit (00:00:00)
 * 
 * Les données SOAP sont mises à jour une seule fois par nuit à 02h00.
 * Cette fonction calcule le temps restant jusqu'à minuit pour utiliser
 * comme staleTime dans React Query, évitant ainsi les appels API inutiles.
 * 
 * Stratégie :
 * - Si appel avant minuit : Cache jusqu'à minuit (données mises à jour à 02h00)
 * - Si appel après minuit : Cache jusqu'à minuit le lendemain
 * - Buffer de sécurité : 30 minutes avant minuit pour éviter les problèmes de timing
 * 
 * @param bufferMinutes - Minutes de buffer avant minuit (défaut: 30)
 * @returns Temps en millisecondes jusqu'à minuit (avec buffer)
 * 
 * @example
 * ```typescript
 * const query = useQuery({
 *   queryKey: ["immeubles"],
 *   queryFn: () => api.get("/immeubles"),
 *   staleTime: getStaleTimeUntilMidnight(), // Cache jusqu'à minuit
 * });
 * ```
 */
export function getStaleTimeUntilMidnight(bufferMinutes: number = 30): number {
  const now = new Date();
  const midnight = new Date();
  
  // Définir minuit du jour suivant (00:00:00)
  midnight.setHours(24, 0, 0, 0);
  
  // Soustraire le buffer pour éviter les problèmes de timing
  midnight.setMinutes(midnight.getMinutes() - bufferMinutes);
  
  // Calculer la différence en millisecondes
  const diff = midnight.getTime() - now.getTime();
  
  // Retourner au minimum 5 minutes (fallback si calcul incorrect)
  // et au maximum 24 heures (sécurité)
  return Math.max(Math.min(diff, 24 * 60 * 60 * 1000), 5 * 60 * 1000);
}

