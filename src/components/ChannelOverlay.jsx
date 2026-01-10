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
    const parts = name.split('|');
    return {
      artist: parts[0]?.trim() || '',
      title: parts[1]?.trim() || '',
    };
  };

  // Extraer año de la fecha
  const getYear = (fecha) => {
    if (!fecha) return '';
    const parts = fecha.split('/');
    return parts[2] || '';
  };

  // Determinar la ruta del logo según el canal
  const getLogoPath = (channel) => {
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
        <div className="absolute bottom-4 left-4">
          <div className="max-w-md" style={{ fontFamily: "'Kabel Black', sans-serif" }}>
            {artist && (
              <p 
                className="text-white text-2xl font-semibold mb-1.5"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)' }}
              >
                {artist}
              </p>
            )}
            {title && (
              <p 
                className="text-white text-xl opacity-90 mb-1.5"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8)' }}
              >
                {title}
              </p>
            )}
            {year && (
              <p 
                className="text-white text-base opacity-75"
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
