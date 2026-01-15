import { useState, useCallback } from 'react';
import { weightedRandomSelect, weightedRandomSelectWithHistory } from '../utils/weightedRandom';

/**
 * Hook para seleccionar videos aleatoriamente con ponderación por visitas
 * Reglas:
 * 1. NUNCA repetir videos (historial completo)
 * 2. Proporción 70/30: 7 videos de alta popularidad y 3 del resto en cada grupo de 10
 * @param {Array} videos - Array de videos disponibles
 * @param {boolean} avoidRepeats - Si true, evita repetir videos y aplica proporción 70/30
 * @returns {Object} - { currentVideo, selectNext, selectRandom, resetHistory }
 */
export function useVideoSelector(videos, avoidRepeats = false) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playedIds, setPlayedIds] = useState([]);
  // Contadores para mantener la proporción 70/30
  const [highPopularityCount, setHighPopularityCount] = useState(0);
  const [restCount, setRestCount] = useState(0);

  /**
   * Selecciona un video aleatorio
   */
  const selectRandom = useCallback(() => {
    if (!videos || videos.length === 0) {
      return null;
    }

    let selected;
    let isHighPopularity = false;

    if (avoidRepeats) {
      // Usar algoritmo con proporción 70/30 y NUNCA repetir
      const result = weightedRandomSelectWithHistory(
        videos, 
        playedIds, 
        highPopularityCount, 
        restCount
      );
      
      selected = result.selected;
      isHighPopularity = result.isHighPopularity;

      if (selected && selected.youtubeId) {
        // Agregar a historial (NUNCA se repetirá)
        setPlayedIds((prev) => [...prev, selected.youtubeId]);
        
        // Actualizar contadores de proporción
        if (isHighPopularity) {
          setHighPopularityCount((prev) => prev + 1);
        } else {
          setRestCount((prev) => prev + 1);
        }
      }
    } else {
      // Selección normal sin restricciones
      selected = weightedRandomSelect(videos);
    }

    setCurrentVideo(selected);
    return selected;
  }, [videos, avoidRepeats, playedIds, highPopularityCount, restCount]);

  /**
   * Selecciona el siguiente video
   */
  const selectNext = useCallback(() => {
    return selectRandom();
  }, [selectRandom]);

  /**
   * Reinicia el historial de videos reproducidos y contadores
   */
  const resetHistory = useCallback(() => {
    setPlayedIds([]);
    setHighPopularityCount(0);
    setRestCount(0);
  }, []);

  return {
    currentVideo,
    selectNext,
    selectRandom,
    resetHistory,
  };
}
