import React, { useEffect, useState, useRef } from 'react';
import { useChannel } from '../hooks/useChannel';
import { useVideoSelector } from '../hooks/useVideoSelector';
import { useFullscreenOnLandscape } from '../hooks/useFullscreenOnLandscape';
import VideoPlayer from './VideoPlayer';
import ChannelOverlay from './ChannelOverlay';
import UnmuteButton from './UnmuteButton';

const Mtv80 = ({ autoUnmute = false }) => {
  // Cargar videos del canal MTV80
  const { videos, loading, error } = useChannel('MTV80');

  // Selector de videos con ponderación por visitas y evitando repeticiones
  const { currentVideo, selectNext } = useVideoSelector(videos, true);

  // Estado para controlar el botón de unmute
  const [isMuted, setIsMuted] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const unmuteFunctionRef = useRef(null);
  const lastMutedStateRef = useRef(true);
  const userHasUnmutedRef = useRef(autoUnmute);
  const lastVideoIdRef = useRef(null);

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

  const handleVideoEnd = React.useCallback(() => {
    selectNext();
    setIsMuted(true);
    lastMutedStateRef.current = true;
    setPlayerReady(false);
    unmuteFunctionRef.current = null;
  }, [selectNext]);

  const handleVideoError = React.useCallback(() => {
    console.error('❌ Error al reproducir video:', {
      id: currentVideo?.youtubeId,
      nombre: currentVideo?.name
    });
    setTimeout(() => {
      setIsMuted(true);
      lastMutedStateRef.current = true;
      setPlayerReady(false);
      unmuteFunctionRef.current = null;
      selectNext();
    }, 1000);
  }, [currentVideo, selectNext]);

  const handleUnmuteCallback = React.useCallback((unmuteFn, mutedState) => {
    if (unmuteFn && typeof unmuteFn === 'function') {
      const isNewPlayer = unmuteFunctionRef.current !== unmuteFn;

      if (isNewPlayer) {
        unmuteFunctionRef.current = unmuteFn;
        setPlayerReady(true);

        if ((autoUnmute || userHasUnmutedRef.current) && mutedState === true) {
          const attemptAutoUnmute = (attempt = 1, maxAttempts = 3) => {
            setTimeout(() => {
              if (unmuteFunctionRef.current && typeof unmuteFunctionRef.current === 'function') {
                unmuteFunctionRef.current();
                if (autoUnmute) {
                  userHasUnmutedRef.current = true;
                }
                setTimeout(() => {
                  if (attempt < maxAttempts && lastMutedStateRef.current === true) {
                    attemptAutoUnmute(attempt + 1, maxAttempts);
                  }
                }, 2000);
              } else {
                if (attempt < maxAttempts) {
                  attemptAutoUnmute(attempt + 1, maxAttempts);
                }
              }
            }, 1500 * attempt);
          };
          attemptAutoUnmute();
        }
      }

      if (mutedState !== undefined && mutedState !== lastMutedStateRef.current) {
        lastMutedStateRef.current = mutedState;
        setIsMuted(mutedState);
      } else if (isNewPlayer && mutedState !== undefined) {
        lastMutedStateRef.current = mutedState;
        setIsMuted(mutedState);
      }
    }
  }, []);

  const handleUnmute = React.useCallback(() => {
    if (unmuteFunctionRef.current && typeof unmuteFunctionRef.current === 'function') {
      unmuteFunctionRef.current();
      userHasUnmutedRef.current = true;
      setTimeout(() => {
        unmuteFunctionRef.current = null;
      }, 100);
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Cargando MTV 80...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">No hay videos disponibles</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Preparando video...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo?.youtubeId) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Video no válido, seleccionando siguiente...</p>
        </div>
      </div>
    );
  }

  const shouldShowUnmuteButton = isMuted && playerReady && !userHasUnmutedRef.current;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div className="relative w-full h-full">
        <VideoPlayer
          key={currentVideo.youtubeId}
          videoId={currentVideo.youtubeId}
          onVideoEnd={handleVideoEnd}
          onError={handleVideoError}
          onUnmute={handleUnmuteCallback}
        />
      </div>
      <ChannelOverlay video={currentVideo} channelName="MTV 80" />
      {shouldShowUnmuteButton && (
        <UnmuteButton onUnmute={handleUnmute} />
      )}
    </div>
  );
};

export default Mtv80;
