import React from 'react';

/**
 * Componente Footer con botón de descarga APK y texto del footer
 */
const Footer = () => {
  return (
    <div 
      className="absolute left-0 right-0 flex flex-col items-center justify-center px-4"
      style={{ 
        bottom: "20px",
        paddingBottom: "env(safe-area-inset-bottom, 20px)"
      }}
    >
      <a
        href="/mtv2026.apk"
        download="mtv2026.apk"
        className="transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
        aria-label="Descargar App Android"
        style={{ 
          marginBottom: "24px",
          display: "block"
        }}
      >
        <img
          src="/imagenes/logo-android-blanco.png"
          alt="Descargar App Android"
          className="h-8 sm:h-10 object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300"
          style={{ maxWidth: "120px", width: "auto" }}
        />
      </a>
      <p
        className="text-white text-xs sm:text-sm opacity-70 text-center px-2"
        style={{
          fontFamily: "'Roboto', sans-serif",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
          lineHeight: "1.4",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          marginTop: "0",
          marginBottom: "0",
          display: "block",
          fontWeight: "400"
        }}
      >
        Sentí nuevamente la experiencia de Mtv | Unofficial Project v1.0
      </p>
    </div>
  );
};

export default Footer;
