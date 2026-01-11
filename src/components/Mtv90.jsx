import React, { useEffect, useState, useRef } from 'react';
import { useChannel } from '../hooks/useChannel';
import { useVideoSelector } from '../hooks/useVideoSelector';
import { useFullscreenOnLandscape } from '../hooks/useFullscreenOnLandscape';
import VideoPlayer from './VideoPlayer';
import ChannelOverlay from './ChannelOverlay';
import UnmuteButton from './UnmuteButton';

const Mtv90 = ({ autoUnmute = false }) => {
  // Cargar videos del canal MTV90
  const { videos, loading, error } = useChannel('MTV90');
  
  // Selector de videos con ponderación por visitas
  const { currentVideo, selectNext } = useVideoSelector(videos, false);

  // Estado para controlar el botón de unmute
  const [isMuted, setIsMuted] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const unmuteFunctionRef = useRef(null); // Usar ref para guardar la función unmute
  const lastMutedStateRef = useRef(true); // Usar ref para comparar cambios en el estado mute
  const userHasUnmutedRef = useRef(autoUnmute); // Si autoUnmute es true, marcar como ya activado
  const lastVideoIdRef = useRef(null); // Para rastrear el último video reproducido

  // Activar fullscreen automático en modo horizontal (mobile)
  useFullscreenOnLandscape(true);

  // Seleccionar el primer video cuando los videos estén cargados
  useEffect(() => {
    if (videos.length > 0 && !currentVideo) {
      selectNext();
    }
  }, [videos, currentVideo, selectNext]);

  // Log del video reproducido para verificar si se repiten
  useEffect(() => {
    if (currentVideo?.youtubeId && currentVideo.youtubeId !== lastVideoIdRef.current) {
      lastVideoIdRef.current = currentVideo.youtubeId;
      console.log('🎵 Video reproduciéndose:', {
        id: currentVideo.youtubeId,
        nombre: currentVideo.name,
        url: currentVideo.youtubeUrl || `https://www.youtube.com/watch?v=${currentVideo.youtubeId}`,
        fecha: currentVideo.fecha || 'N/A',
        visitas: currentVideo.visitas || 'N/A'
      });
    }
  }, [currentVideo]);

  // Manejar cuando termina un video - Memoizar para evitar re-renders
  // IMPORTANTE: Este callback se ejecuta INMEDIATAMENTE cuando el video termina
  // para prevenir que YouTube muestre su pantalla de recomendaciones
  const handleVideoEnd = React.useCallback(() => {
    // Seleccionar siguiente video INMEDIATAMENTE, sin delays
    selectNext();
    
    // Actualizar estados después de seleccionar el siguiente video
    setIsMuted(true); // Nuevo video empieza mute (requerido para autoplay)
    lastMutedStateRef.current = true; // Actualizar ref también
    setPlayerReady(false); // Resetear estado para el nuevo video
    unmuteFunctionRef.current = null; // Limpiar función unmute (se actualizará cuando el nuevo video esté listo)
  }, [selectNext]);

  // Manejar errores (video no disponible, restringido, etc.) - Memoizar para evitar re-renders
  const handleVideoError = React.useCallback(() => {
    console.error('❌ Error al reproducir video:', {
      id: currentVideo?.youtubeId,
      nombre: currentVideo?.name
    });
    setTimeout(() => {
      setIsMuted(true); // Nuevo video empieza mute
      lastMutedStateRef.current = true; // Actualizar ref también
      setPlayerReady(false); // Resetear estado para el nuevo video
      unmuteFunctionRef.current = null; // Limpiar función unmute
      selectNext();
    }, 1000);
  }, [currentVideo, selectNext]);

  // Manejar unmute callback del VideoPlayer
  // Este callback se ejecuta cuando hay un nuevo reproductor o cuando cambia el estado mute
  const handleUnmuteCallback = React.useCallback((unmuteFn, mutedState) => {
    if (unmuteFn && typeof unmuteFn === 'function') {
      const isNewPlayer = unmuteFunctionRef.current !== unmuteFn;
      
      // Actualizar la función unmute si es diferente (nuevo reproductor)
      if (isNewPlayer) {
        unmuteFunctionRef.current = unmuteFn;
        setPlayerReady(true); // El reproductor está listo cuando recibimos el callback
        
        // Si autoUnmute está activado o el usuario ya había activado el sonido antes, desmutear automáticamente
        if ((autoUnmute || userHasUnmutedRef.current) && mutedState === true) {
          // Esperar a que el video esté reproduciéndose antes de desmutear
          // Intentar múltiples veces para asegurar que funcione
          const attemptAutoUnmute = (attempt = 1, maxAttempts = 3) => {
            setTimeout(() => {
              if (unmuteFunctionRef.current && typeof unmuteFunctionRef.current === 'function') {
                unmuteFunctionRef.current();
                
                // Si autoUnmute, marcar como activado
                if (autoUnmute) {
                  userHasUnmutedRef.current = true;
                }
                
                // Verificar después de un momento si funcionó usando el ref
                setTimeout(() => {
                  // Si después de 2 segundos el video sigue mute (según el ref), intentar de nuevo
                  if (attempt < maxAttempts && lastMutedStateRef.current === true) {
                    attemptAutoUnmute(attempt + 1, maxAttempts);
                  }
                }, 2000);
              } else {
                // Si la función no está disponible, intentar de nuevo después
                if (attempt < maxAttempts) {
                  attemptAutoUnmute(attempt + 1, maxAttempts);
                }
              }
            }, 1500 * attempt); // Aumentar el delay en cada intento: 1.5s, 3s, 4.5s
          };
          
          // Empezar el primer intento después de 1.5 segundos
          attemptAutoUnmute();
        }
      }
      
      // Siempre actualizar isMuted cuando cambia el estado (usar ref para comparar)
      if (mutedState !== undefined && mutedState !== lastMutedStateRef.current) {
        lastMutedStateRef.current = mutedState;
        setIsMuted(mutedState);
      } else if (isNewPlayer && mutedState !== undefined) {
        // Si es un nuevo reproductor, actualizar el estado inicial
        lastMutedStateRef.current = mutedState;
        setIsMuted(mutedState);
      }
    }
  }, []); // Sin dependencias - usar refs para comparar

  // Función para desmutear cuando el usuario hace clic
  const handleUnmute = React.useCallback(() => {
    if (unmuteFunctionRef.current && typeof unmuteFunctionRef.current === 'function') {
      // Ejecutar la función unmute - esto cambiará isMuted internamente en el hook
      unmuteFunctionRef.current();
      // Marcar que el usuario ya activó el sonido
      userHasUnmutedRef.current = true;
      // Limpiar la función después de usar para evitar re-ejecuciones
      setTimeout(() => {
        unmuteFunctionRef.current = null;
      }, 100);
    }
  }, []);

  // Estado de carga
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Cargando MTV 90...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Si no hay videos
  if (videos.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">No hay videos disponibles</p>
        </div>
      </div>
    );
  }

  // Si no hay video seleccionado aún
  if (!currentVideo) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Preparando video...</p>
        </div>
      </div>
    );
  }

  // Renderizar reproductor y overlay solo si hay un video válido con YouTube ID
  if (!currentVideo?.youtubeId) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Video no válido, seleccionando siguiente...</p>
        </div>
      </div>
    );
  }
  
  // Solo mostrar el botón si:
  // 1. El video está mute Y
  // 2. El reproductor está listo Y
  // 3. El usuario NO ha activado el sonido nunca (primera vez)
  const shouldShowUnmuteButton = isMuted && playerReady && !userHasUnmutedRef.current;
  
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Ocultar reproductor anterior inmediatamente cuando cambia el video */}
      <div className="relative w-full h-full">
        <VideoPlayer
          key={currentVideo.youtubeId} // Key para forzar remount cuando cambia el video
          videoId={currentVideo.youtubeId}
          onVideoEnd={handleVideoEnd}
          onError={handleVideoError}
          onUnmute={handleUnmuteCallback}
        />
      </div>
      <ChannelOverlay video={currentVideo} channelName="MTV 90" />
      
      {/* Mostrar botón de unmute solo si el video está mute, el reproductor está listo, y es la primera vez */}
      {shouldShowUnmuteButton && (
        <UnmuteButton onUnmute={handleUnmute} />
      )}
    </div>
  );
};

export default Mtv90;
