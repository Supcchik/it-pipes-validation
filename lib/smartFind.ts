import type { Observation, MatchResult, SmartFindOptions } from '@/types/inspection';

// Константи для Smart Find
export const SMART_FIND_CONFIG = {
  PRIMARY_TOLERANCE: 1.5, // feet
  FALLBACK_TOLERANCE: 5.0, // feet
  MIN_CONFIDENCE: 0.5, // 50%
} as const;

/**
 * Знаходить спостереження в попередній інспекції, яке найкраще відповідає поточному спостереженню
 * використовуючи Smart Find алгоритм з tolerance-based matching.
 * 
 * @param currentObs - Поточне спостереження для якого шукаємо match
 * @param previousObservations - Масив спостережень з попередньої інспекції
 * @param options - Опції для Smart Find (tolerance levels)
 * @returns Масив MatchResult з усіма знайденими matches в primary tolerance, або null якщо не знайдено
 */
export function findMatchingObservations(
  currentObs: Observation,
  previousObservations: Observation[],
  options: SmartFindOptions = {
    primaryTolerance: SMART_FIND_CONFIG.PRIMARY_TOLERANCE,
    fallbackTolerance: SMART_FIND_CONFIG.FALLBACK_TOLERANCE,
  }
): MatchResult[] | null {
  // Крок 1: Фільтрація за кодом (exact match)
  const sameCodeObservations = previousObservations.filter(
    (obs) => obs.code === currentObs.code
  );

  if (sameCodeObservations.length === 0) {
    return null;
  }

  // Крок 2: Фільтрація за distance в межах primary tolerance
  const primaryMatches: MatchResult[] = [];
  
  for (const obs of sameCodeObservations) {
    const distanceDiff = Math.abs(obs.distance - currentObs.distance);
    
    if (distanceDiff <= options.primaryTolerance) {
      // Розрахунок confidence: 1 - (distanceDiff / tolerance)
      // Найближче = 100% confidence, на межі tolerance = ~0% confidence
      const confidence = Math.max(
        0,
        1 - (distanceDiff / options.primaryTolerance)
      );

      primaryMatches.push({
        observation: obs,
        distance: obs.distance,
        confidence,
        distanceDiff,
      });
    }
  }

  // Якщо знайдено matches в primary tolerance - повертаємо їх
  if (primaryMatches.length > 0) {
    // Сортуємо за confidence (найкращий match першим)
    return primaryMatches.sort((a, b) => b.confidence - a.confidence);
  }

  // Крок 3: Fallback - спробувати з fallback tolerance
  const fallbackMatches: MatchResult[] = [];

  for (const obs of sameCodeObservations) {
    const distanceDiff = Math.abs(obs.distance - currentObs.distance);
    
    if (distanceDiff <= options.fallbackTolerance) {
      const confidence = Math.max(
        SMART_FIND_CONFIG.MIN_CONFIDENCE,
        1 - (distanceDiff / options.fallbackTolerance)
      );

      fallbackMatches.push({
        observation: obs,
        distance: obs.distance,
        confidence,
        distanceDiff,
      });
    }
  }

  // Якщо знайдено matches в fallback tolerance - повертаємо найкращий
  if (fallbackMatches.length > 0) {
    // Сортуємо за confidence і повертаємо найкращий
    fallbackMatches.sort((a, b) => b.confidence - a.confidence);
    return [fallbackMatches[0]]; // Повертаємо тільки найкращий fallback match
  }

  // Не знайдено жодного match
  return null;
}

/**
 * Знаходить найкращий match для поточного спостереження
 * (зручна функція яка повертає тільки один match або null)
 */
export function findBestMatch(
  currentObs: Observation,
  previousObservations: Observation[],
  options?: SmartFindOptions
): MatchResult | null {
  const matches = findMatchingObservations(currentObs, previousObservations, options);
  
  if (!matches || matches.length === 0) {
    return null;
  }

  // Повертаємо найкращий match (перший елемент - найвищий confidence)
  return matches[0];
}



