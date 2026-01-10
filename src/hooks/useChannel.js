import { useState, useEffect } from 'react';
import { loadVideosByYears, CHANNELS } from '../utils/videoLoader';

/**
 * Hook para cargar y gestionar los videos de un canal
 * @param {string} channelKey - Clave del canal (ej: 'MTV90', 'MTV00')
 * @returns {Object} - { videos, loading, error }
 */
export function useChannel(channelKey) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const channel = CHANNELS[channelKey];
    
    if (!channel) {
      setError(`Canal '${channelKey}' no encontrado`);
      setLoading(false);
      return;
    }

    async function loadChannelVideos() {
      try {
        setLoading(true);
        setError(null);
        const loadedVideos = await loadVideosByYears(channel.years);
        
        // Establecer videos incluso si está vacío (algunos archivos pueden no existir todavía)
        setVideos(loadedVideos);
      } catch (err) {
        // Solo establecer error para errores críticos (red, etc.)
        // Los errores de archivos faltantes ya se manejan en loadVideosByYears
        setError(err.message || 'Error desconocido al cargar videos');
        setVideos([]); // Asegurar que videos esté vacío en caso de error
      } finally {
        setLoading(false);
      }
    }

    loadChannelVideos();
  }, [channelKey]);

  return { videos, loading, error };
}
