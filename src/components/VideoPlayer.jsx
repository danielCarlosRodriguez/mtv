import React, { useEffect } from 'react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';

/**
 * Componente reproductor de YouTube fullscreen
 * @param {string} videoId - ID del video de YouTube
 * @param {Function} onVideoEnd - Callback cuando termina el video
 * @param {Function} onError - Callback cuando hay error
 * @param {Function} onUnmute - Callback cuando se desmutea (retorna función unmute)
 */
const VideoPlayer = ({ videoId, onVideoEnd, onError, onUnmute }) => {
  const { containerRef, playerReady, isMuted, unmute } = useYouTubePlayer(videoId, {
    autoplay: 1,
    controls: 0,
    loop: 0,
    modestbranding: 1,
    playsinline: 1,
    rel: 0,
    onVideoEnd,
    onError,
  });

  // Pasar función unmute al componente padre cuando esté disponible
  // Usar ref para guardar el valor y evitar que cambios en isMuted causen re-ejecuciones
  const unmuteRef = React.useRef(unmute);
  const lastCallbackRef = React.useRef(null);
  
  // Actualizar ref cuando cambia la función unmute
  React.useEffect(() => {
    unmuteRef.current = unmute;
  }, [unmute]);

  // Pasar callback solo cuando la función unmute está disponible por primera vez o cambia
  // NO incluir isMuted en las dependencias para evitar que se ejecute cuando se desmutea
  useEffect(() => {
    if (onUnmute && typeof onUnmute === 'function' && unmuteRef.current && typeof unmuteRef.current === 'function') {
      // Solo pasar el callback si la función cambió (nuevo reproductor)
      // Comparar con la última función que pasamos al padre
      if (unmuteRef.current !== lastCallbackRef.current) {
        onUnmute(unmuteRef.current, isMuted);
        lastCallbackRef.current = unmuteRef.current;
      }
    }
  }, [unmute, onUnmute]); // Solo cuando unmute o onUnmute cambian, NO isMuted

  // Sincronizar estado isMuted del hook con el componente padre
  // Esto asegura que el botón se oculte cuando el video se desmutea
  const lastIsMutedRef = React.useRef(isMuted);
  useEffect(() => {
    // Solo notificar si isMuted cambió (no en el primer render)
    if (lastIsMutedRef.current !== isMuted) {
      lastIsMutedRef.current = isMuted;
      
      // Si el callback está disponible, actualizar el estado en el padre
      if (onUnmute && typeof onUnmute === 'function' && unmuteRef.current && typeof unmuteRef.current === 'function') {
        // Pasar la función unmute y el nuevo estado isMuted
        onUnmute(unmuteRef.current, isMuted);
      }
    }
  }, [isMuted, onUnmute]); // Solo cuando isMuted cambia

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-20 bg-black">
          <p>Cargando video...</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
