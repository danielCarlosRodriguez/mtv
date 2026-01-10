import { useState, useCallback } from 'react';
import { weightedRandomSelect, weightedRandomSelectWithHistory } from '../utils/weightedRandom';

/**
 * Hook para seleccionar videos aleatoriamente con ponderación por visitas
 * @param {Array} videos - Array de videos disponibles
 * @param {boolean} avoidRepeats - Si true, evita repetir videos en la misma sesión
 * @returns {Object} - { currentVideo, selectNext, selectRandom }
 */
export function useVideoSelector(videos, avoidRepeats = false) {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [playedIds, setPlayedIds] = useState([]);

  /**
   * Selecciona un video aleatorio
   */
  const selectRandom = useCallback(() => {
    if (!videos || videos.length === 0) {
      return null;
    }

    let selected;

    if (avoidRepeats) {
      selected = weightedRandomSelectWithHistory(videos, playedIds);
      if (selected && selected.youtubeId) {
        setPlayedIds((prev) => [...prev, selected.youtubeId]);
      }
    } else {
      selected = weightedRandomSelect(videos);
    }

    setCurrentVideo(selected);
    return selected;
  }, [videos, avoidRepeats, playedIds]);

  /**
   * Selecciona el siguiente video
   */
  const selectNext = useCallback(() => {
    return selectRandom();
  }, [selectRandom]);

  /**
   * Reinicia el historial de videos reproducidos
   */
  const resetHistory = useCallback(() => {
    setPlayedIds([]);
  }, []);

  return {
    currentVideo,
    selectNext,
    selectRandom,
    resetHistory,
  };
}
