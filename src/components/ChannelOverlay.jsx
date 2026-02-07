import React from 'react';

/**
 * Componente overlay con logo MTV y metadata del video
 * @param {Object} video - Objeto con datos del video (name, fecha)
 * @param {string} channelName - Nombre del canal (ej: "MTV 90")
 */
const ChannelOverlay = ({ video, channelName = 'MTV 90' }) => {
  // Extraer artista y título del campo "name"
  const parseVideoInfo = (name) => {
    if (!name) return { artist: '', title: '' };
    
    // Intentar primero con "|" (formato MTV 90)
    let parts = name.split('|');
    if (parts.length === 1) {
      // Si no hay "|", intentar con "," (formato MTV 00)
      parts = name.split(',');
    }
    
    // Limpiar comillas dobles del título si las hay
    let artist = parts[0]?.trim() || '';
    let title = parts[1]?.trim() || '';
    
    // Remover comillas dobles del título
    if (title) {
      title = title.replace(/^["']|["']$/g, '');
    }
    
    return {
      artist,
      title,
    };
  };

  // Extraer año de la fecha
  const getYear = (fecha) => {
    if (!fecha) return '';
    
    // Si la fecha tiene formato DD/MM/AAAA, extraer el año
    const parts = fecha.split('/');
    if (parts.length === 3) {
      return parts[2] || '';
    }
    
    // Si la fecha es solo el año (formato MTV 00), retornarlo directamente
    if (/^\d{4}$/.test(fecha.trim())) {
      return fecha.trim();
    }
    
    return '';
  };

  // Determinar la ruta del logo según el canal
  const getLogoPath = (channel) => {
    if (channel === 'MTV 80') {
      return '/imagenes/logo-mtv-80.png';
    }
    if (channel === 'MTV 90') {
      return '/imagenes/logo-mtv-90.png';
    }
    if (channel === 'MTV 00') {
      return '/imagenes/logo-mtv-00.png';
    }
    return '/imagenes/logo-mtv-90.png'; // Default
  };

  const { artist, title } = parseVideoInfo(video?.name);
  const year = getYear(video?.fecha);
  const logoPath = getLogoPath(channelName);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Logo MTV en esquina superior izquierda */}
      <div className="absolute top-4 left-4">
        <img
          src={logoPath}
          alt={channelName}
          className="h-20 object-contain drop-shadow-lg"
          style={{ maxWidth: '280px' }}
        />
      </div>

      {/* Metadata del video en esquina inferior izquierda */}
      {(artist || title || year) && (
        <div 
          className="absolute bottom-8 left-4 right-4 sm:bottom-4 sm:left-4 sm:right-auto sm:pb-0"
          style={{
            paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <div 
            className="max-w-[calc(100%-2rem)] sm:max-w-md" 
            style={{ 
              fontFamily: "'Kabel Black', sans-serif",
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}
          >
            {artist && (
              <p 
                className="text-white text-lg sm:text-2xl font-semibold mb-1 sm:mb-1.5 leading-tight sm:leading-normal break-words"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)' }}
              >
                {artist}
              </p>
            )}
            {title && (
              <p 
                className="text-white text-base sm:text-xl opacity-90 mb-1 sm:mb-1.5 leading-tight sm:leading-normal break-words"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)' }}
              >
                {title}
              </p>
            )}
            {year && (
              <p 
                className="text-white text-sm sm:text-base opacity-75 leading-tight sm:leading-normal break-words"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)' }}
              >
                {year}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelOverlay;
