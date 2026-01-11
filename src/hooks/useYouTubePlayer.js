import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook para controlar el reproductor de YouTube usando YouTube IFrame API
 * Versión que usa SOLO la API oficial, con mute inicial para permitir autoplay
 */
export function useYouTubePlayer(videoId, options = {}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Empieza mute
  const initAttemptedRef = useRef(false);
  const currentVideoIdRef = useRef(null);

  const {
    autoplay = 1,
    controls = 0,
    loop = 0,
    modestbranding = 1,
    playsinline = 1,
    rel = 0,
  } = options;

  // Guardar callbacks en refs para evitar que cambios causen re-creación del reproductor
  const onVideoEndRef = useRef(options.onVideoEnd);
  const onErrorRef = useRef(options.onError);

  // Actualizar refs cuando cambian los callbacks
  useEffect(() => {
    onVideoEndRef.current = options.onVideoEnd;
    onErrorRef.current = options.onError;
  }, [options.onVideoEnd, options.onError]);

  // Cargar YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    if (window.onYouTubeIframeAPIReady) {
      const checkApi = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiReady(true);
          clearInterval(checkApi);
        }
      }, 100);
      return () => clearInterval(checkApi);
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      // Si no hay scripts, agregar al head
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  // Inicializar el reproductor cuando API, contenedor y videoId estén listos
  useEffect(() => {
    if (!apiReady) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    if (!videoId) {
      return;
    }

    if (playerRef.current) {
      return;
    }

    if (initAttemptedRef.current) {
      return;
    }

    // Si el videoId cambió, resetear el estado
    if (videoId !== currentVideoIdRef.current) {
      setIsMuted(true); // Nuevo video empieza mute
      initAttemptedRef.current = false;
    }

    // Limpiar contenedor antes de crear nuevo reproductor
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const playerId = `youtube-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const iframeContainer = document.createElement('div');
    iframeContainer.id = playerId;
    iframeContainer.className = 'w-full h-full';
    containerRef.current.appendChild(iframeContainer);
    
    initAttemptedRef.current = true;
    currentVideoIdRef.current = videoId;

    try {
      const player = new window.YT.Player(playerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1, // Siempre autoplay
          controls: 0, // Sin controles
          loop: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0, // No mostrar videos relacionados al final
          enablejsapi: 1, // Necesario para controlar el reproductor
          iv_load_policy: 3, // Ocultar anotaciones
          fs: 1, // Permitir pantalla completa
          mute: 1, // Mute inicial para permitir autoplay
          start: 0,
          disablekb: 1, // Deshabilitar controles de teclado
          cc_load_policy: 0, // No cargar subtítulos automáticamente
          // No incluir origin en desarrollo local para evitar errores de postMessage
          ...(window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
            ? { origin: window.location.origin } 
            : {}),
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            setIsMuted(true); // Confirmar que está mute

            // Verificar estado mute
            try {
              const muted = event.target.isMuted();
              setIsMuted(muted);
            } catch (err) {
              // Ignorar si no se puede verificar
            }

            // Intentar reproducir si no está reproduciéndose
            setTimeout(() => {
              try {
                const currentState = event.target.getPlayerState();
                
                if (currentState === window.YT.PlayerState.PLAYING || currentState === window.YT.PlayerState.BUFFERING) {
                  setPlayerReady(true);
                } else if (currentState === window.YT.PlayerState.CUED || currentState === window.YT.PlayerState.UNSTARTED) {
                  event.target.playVideo();
                  
                  setTimeout(() => {
                    const newState = event.target.getPlayerState();
                    if (newState === window.YT.PlayerState.PLAYING || newState === window.YT.PlayerState.BUFFERING) {
                      setPlayerReady(true);
                    } else {
                      // Marcar como ready de todos modos - el video debería estar cargado
                      setPlayerReady(true);
                    }
                  }, 1000);
                } else {
                  setPlayerReady(true);
                }
              } catch (err) {
                setPlayerReady(true); // Marcar como ready de todos modos
              }
            }, 300);
          },
          onStateChange: (event) => {
            const state = event.data;
            
            if (state === window.YT.PlayerState.ENDED) {
              // IMPORTANTE: Llamar inmediatamente al callback cuando el video termina
              // Esto previene que YouTube muestre su pantalla de recomendaciones
              // React actualizará el componente y cambiará el key, lo que destruirá
              // el reproductor anterior y creará uno nuevo con el siguiente video
              if (onVideoEndRef.current) {
                // Usar requestAnimationFrame para asegurar que se ejecute lo más rápido posible
                // pero después de que el evento termine de procesarse
                requestAnimationFrame(() => {
                  if (onVideoEndRef.current) {
                    onVideoEndRef.current();
                  }
                });
              }
            } else if (state === window.YT.PlayerState.PLAYING) {
              setPlayerReady(true);
              
              // Verificar estado mute cuando empieza a reproducir
              try {
                const muted = event.target.isMuted();
                setIsMuted(muted);
              } catch (err) {
                // Ignorar si no se puede verificar
              }
            } else if (state === window.YT.PlayerState.BUFFERING) {
              setPlayerReady(true);
            } else if (state === window.YT.PlayerState.CUED) {
              // Intentar reproducir
              setTimeout(() => {
                if (event.target && event.target.getPlayerState) {
                  try {
                    const currentState = event.target.getPlayerState();
                    if (currentState === window.YT.PlayerState.CUED || currentState === window.YT.PlayerState.UNSTARTED) {
                      event.target.playVideo();
                    }
                  } catch (err) {
                    // Ignorar errores
                  }
                }
              }, 300);
            }
          },
          onError: (event) => {
            // Códigos de error: 2, 5, 100, 101, 150
            // Usar el callback desde el ref para evitar dependencias
            if (onErrorRef.current && (event.data === 2 || event.data === 5 || event.data === 100 || event.data === 101 || event.data === 150)) {
              onErrorRef.current();
            }
          },
        },
      });

    } catch (error) {
      initAttemptedRef.current = false;
      if (onErrorRef.current) {
        onErrorRef.current();
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignorar errores al destruir
        }
        playerRef.current = null;
      }
      initAttemptedRef.current = false;
      setPlayerReady(false);
    };
  }, [apiReady, videoId]); // Solo dependencias críticas: apiReady y videoId
  // NO incluir onVideoEnd y onError aquí para evitar re-crear el reproductor cuando cambian

  // Actualizar video cuando cambia el videoId (solo si el reproductor ya existe)
  useEffect(() => {
    if (!playerRef.current || !videoId || videoId === currentVideoIdRef.current) {
      return;
    }

    try {
      setIsMuted(true); // Nuevo video empieza mute
      playerRef.current.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
      });
      currentVideoIdRef.current = videoId;
      setPlayerReady(false);
      
      // Verificar después de cargar
      setTimeout(() => {
        if (playerRef.current) {
          const state = playerRef.current.getPlayerState();
          if (state === window.YT.PlayerState.PLAYING || state === window.YT.PlayerState.BUFFERING) {
            setPlayerReady(true);
          }
        }
      }, 1000);
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current();
      }
    }
  }, [videoId]); // No incluir onError para evitar re-ejecutar cuando cambia

  // Función para desmutear el video
  const unmute = useCallback(() => {
    if (!playerRef.current) {
      return;
    }

    try {
      const state = playerRef.current.getPlayerState();
      const muted = playerRef.current.isMuted();
      
      if (muted) {
        playerRef.current.unMute();
        setIsMuted(false);
        
        // Verificar después de un momento
        setTimeout(() => {
          if (playerRef.current) {
            const newMuted = playerRef.current.isMuted();
            const newState = playerRef.current.getPlayerState();
            
            if (newMuted) {
              // Intentar nuevamente
              try {
                playerRef.current.unMute();
              } catch (err) {
                // Ignorar errores
              }
            }
            
            // Asegurar que el video se está reproduciendo
            if (newState !== window.YT.PlayerState.PLAYING && newState !== window.YT.PlayerState.BUFFERING) {
              try {
                playerRef.current.playVideo();
              } catch (err) {
                // Ignorar errores
              }
            }
          }
        }, 500);
      } else {
        setIsMuted(false);
      }
    } catch (error) {
      // Ignorar errores
    }
  }, []);

  return {
    containerRef,
    playerReady,
    isMuted,
    unmute,
  };
}
