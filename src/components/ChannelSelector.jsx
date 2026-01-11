import React, { useEffect, useState, useRef } from 'react';
import { loadVideosByYears, CHANNELS } from '../utils/videoLoader';
import { useFullscreenOnLandscape } from '../hooks/useFullscreenOnLandscape';
import VideoPlayer from './VideoPlayer';
import { weightedRandomSelect } from '../utils/weightedRandom';
import Footer from './Footer';

/**
 * Componente selector de canal con video de fondo
 * @param {Function} onChannelSelect - Callback cuando se selecciona un canal (recibe 'MTV90' o 'MTV00')
 */
const ChannelSelector = ({ onChannelSelect }) => {
  // Estados para cargar videos de ambos canales
  const [allVideos, setAllVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Seleccionar un video aleatorio para el fondo
  const [backgroundVideo, setBackgroundVideo] = useState(null);
  const [backgroundPlayerReady, setBackgroundPlayerReady] = useState(false);
  const backgroundUnmuteRef = useRef(null);
  
  // Estado para detectar orientación horizontal
  const [isLandscape, setIsLandscape] = useState(false);

  // Activar fullscreen automático en modo horizontal (mobile)
  useFullscreenOnLandscape(true);

  // Detectar orientación
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    // Verificar orientación inicial
    checkOrientation();

    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Cargar videos de ambos canales
  useEffect(() => {
    async function loadAllVideos() {
      try {
        setLoading(true);
        // Obtener años de ambos canales
        const years90 = CHANNELS.MTV90.years;
        const years00 = CHANNELS.MTV00.years;
        const allYears = [...years90, ...years00];
        
        // Cargar todos los videos
        const videos = await loadVideosByYears(allYears);
        setAllVideos(videos);
      } catch (error) {
        setAllVideos([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadAllVideos();
  }, []);

  // Seleccionar video aleatorio cuando se carguen los videos
  useEffect(() => {
    if (allVideos.length > 0 && !backgroundVideo) {
      const randomVideo = weightedRandomSelect(allVideos);
      setBackgroundVideo(randomVideo);
    }
  }, [allVideos, backgroundVideo, loading]);

  // Manejar cuando el reproductor de fondo está listo
  const handleBackgroundUnmuteCallback = React.useCallback((unmuteFn, mutedState) => {
    if (unmuteFn && typeof unmuteFn === 'function') {
      backgroundUnmuteRef.current = unmuteFn;
      setBackgroundPlayerReady(true);
      
      // Desmutear el video de fondo automáticamente
      setTimeout(() => {
        if (backgroundUnmuteRef.current && typeof backgroundUnmuteRef.current === 'function') {
          backgroundUnmuteRef.current();
        }
      }, 500);
    }
  }, []);

  // Manejar selección de canal
  const handleChannelSelect = (channelKey) => {
    if (onChannelSelect) {
      onChannelSelect(channelKey);
    }
  };

  if (loading || !backgroundVideo) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video de fondo con blur */}
      {backgroundVideo?.youtubeId && (
        <>
          <VideoPlayer
            key={`bg-${backgroundVideo.youtubeId}`}
            videoId={backgroundVideo.youtubeId}
            onVideoEnd={() => {
              // Seleccionar nuevo video aleatorio cuando termine
              const newVideo = weightedRandomSelect(
                allVideos.filter(
                  (v) => v.youtubeId !== backgroundVideo.youtubeId
                )
              );
              if (newVideo) {
                setBackgroundVideo(newVideo);
                setBackgroundPlayerReady(false);
              }
            }}
            onError={() => {
              // Seleccionar nuevo video si hay error
              const newVideo = weightedRandomSelect(
                allVideos.filter(
                  (v) => v.youtubeId !== backgroundVideo.youtubeId
                )
              );
              if (newVideo) {
                setBackgroundVideo(newVideo);
                setBackgroundPlayerReady(false);
              }
            }}
            onUnmute={handleBackgroundUnmuteCallback}
          />

          {/* Overlay con blur y botones */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-40 flex flex-col items-center justify-center">
            <div className="text-center mb-20">
              <h1
                className="text-6xl font-bold text-white"
                style={{
                  fontFamily: "'Kabel Black', sans-serif",
                  textShadow:
                    "2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)",
                }}
              >
                Selecciona un Canal
              </h1>
            </div>

            <div
              className="flex gap-12 justify-center items-center"
              style={{ marginTop: "30px" }}
            >
              {/* Botón MTV 90 con logo */}
              <button
                onClick={() => handleChannelSelect("MTV90")}
                className="transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Seleccionar MTV 90"
              >
                <img
                  src="/imagenes/logo-mtv-90.png"
                  alt="MTV 90"
                  className="h-32 object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300"
                  style={{ maxWidth: "400px" }}
                />
              </button>

              {/* Botón MTV 00 con logo */}
              <button
                onClick={() => handleChannelSelect("MTV00")}
                className="transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Seleccionar MTV 00"
              >
                <img
                  src="/imagenes/logo-mtv-00.png"
                  alt="MTV 00"
                  className="h-32 object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300"
                  style={{ maxWidth: "400px" }}
                />
              </button>
            </div>

            {/* Footer con botón de descarga APK - Solo en mobile, debajo de los botones */}
            {/* Ocultar en modo horizontal */}
            {!isLandscape && (
              <div className="block sm:hidden" style={{ marginTop: "80px" }}>
                <Footer />
              </div>
            )}

            {/* Footer con botón de descarga APK - Solo en desktop, posición fija abajo */}
            {/* Ocultar en modo horizontal */}
            {!isLandscape && (
              <div className="hidden sm:block">
                <Footer />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelSelector;
