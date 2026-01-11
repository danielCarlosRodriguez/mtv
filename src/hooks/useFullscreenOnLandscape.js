import { useEffect, useRef } from 'react';

/**
 * Hook que activa fullscreen automáticamente cuando el dispositivo
 * se gira a modo horizontal (landscape) en mobile y oculta la barra de navegación
 */
export function useFullscreenOnLandscape(enabled = true) {
  const isFullscreenRef = useRef(false);
  const isLandscapeRef = useRef(false);
  const userInteractedRef = useRef(false);
  const hideNavBarIntervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Función para ocultar la barra de navegación del navegador
    const hideNavigationBar = () => {
      const isMobile = window.innerWidth < 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      
      // Solo ocultar en mobile y en modo horizontal
      if (!isMobile || !isLandscape) return;

      // Técnica 1: Forzar scroll para ocultar la barra
      // Esto funciona en Chrome Android y Safari iOS
      // En modo horizontal, usar scroll horizontal también
      window.scrollTo(1, 1);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);

      // Técnica 2: Detectar si la barra está visible y forzar scroll
      // Si window.innerHeight < window.outerHeight, la barra está visible
      const checkAndHide = () => {
        const isStillLandscape = window.innerWidth > window.innerHeight;
        if (!isStillLandscape) {
          // Si cambió a vertical, limpiar intervalo
          if (hideNavBarIntervalRef.current) {
            clearInterval(hideNavBarIntervalRef.current);
            hideNavBarIntervalRef.current = null;
          }
          return;
        }
        
        // Verificar si la barra está visible
        if (window.innerHeight < window.outerHeight || window.innerWidth < window.outerWidth) {
          window.scrollTo(1, 1);
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 10);
        }
      };

      // Ejecutar periódicamente para mantener la barra oculta
      if (hideNavBarIntervalRef.current) {
        clearInterval(hideNavBarIntervalRef.current);
      }
      
      // Intervalo más frecuente en modo horizontal
      hideNavBarIntervalRef.current = setInterval(checkAndHide, 500);
    };

    const tryEnterFullscreen = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const isFullscreen = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement;

      // Solo activar fullscreen si:
      // 1. Está en modo horizontal
      // 2. Es un dispositivo móvil (ancho < 768px)
      // 3. No está ya en fullscreen
      if (isLandscape && isMobile && !isFullscreen) {
        const element = document.documentElement;
        
        // Intentar Fullscreen API primero
        if (element.requestFullscreen) {
          element.requestFullscreen().then(() => {
            hideNavigationBar();
          }).catch(() => {
            // Si falla, intentar ocultar la barra de navegación de todas formas
            hideNavigationBar();
          });
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
          hideNavigationBar();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
          hideNavigationBar();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
          hideNavigationBar();
        } else {
          // Si no hay soporte para Fullscreen API, solo ocultar la barra
          hideNavigationBar();
        }
      }
    };

    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      isLandscapeRef.current = isLandscape;

      const isMobile = window.innerWidth < 768;
      const isFullscreen = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement;

      // Intentar entrar en fullscreen si está en horizontal
      if (isLandscape && isMobile) {
        // Siempre intentar ocultar la barra en modo horizontal
        hideNavigationBar();
        
        if (!isFullscreen) {
          tryEnterFullscreen();
        }
      } else if (!isLandscape && isFullscreen) {
        // Salir de fullscreen si se vuelve a vertical
        if (hideNavBarIntervalRef.current) {
          clearInterval(hideNavBarIntervalRef.current);
          hideNavBarIntervalRef.current = null;
        }
        
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };

    // Verificar orientación inicial
    checkOrientation();

    // Intentar activar fullscreen después de la primera interacción del usuario
    const handleUserInteraction = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        // Pequeño delay para asegurar que la interacción se registre
        setTimeout(() => {
          checkOrientation();
        }, 100);
      }
    };

    // Escuchar interacciones del usuario (tap, click, touchstart)
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', () => {
      // Pequeño delay para asegurar que las dimensiones se actualicen
      setTimeout(checkOrientation, 100);
    });

    // Escuchar cambios de tamaño (por si acaso)
    window.addEventListener('resize', checkOrientation);

    // Escuchar cambios de fullscreen
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      isFullscreenRef.current = isFullscreen;
      
      // Si entró en fullscreen, ocultar la barra de navegación
      if (isFullscreen) {
        hideNavigationBar();
      } else {
        // Si salió de fullscreen, limpiar el intervalo
        if (hideNavBarIntervalRef.current) {
          clearInterval(hideNavBarIntervalRef.current);
          hideNavBarIntervalRef.current = null;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      // Limpiar intervalo si existe
      if (hideNavBarIntervalRef.current) {
        clearInterval(hideNavBarIntervalRef.current);
        hideNavBarIntervalRef.current = null;
      }
      
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [enabled]);
}
