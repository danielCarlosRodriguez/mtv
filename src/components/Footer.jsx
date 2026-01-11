import React from 'react';

/**
 * Componente Footer con botón de descarga APK, botón de invítame un café y texto del footer
 * En mobile: posicionado relativo (50px debajo de los botones)
 * En desktop: posicionado absoluto (fijo abajo)
 */
const Footer = () => {
  return (
    <div
      className="relative sm:absolute left-0 right-0 flex flex-col items-center justify-center px-4 w-full"
      style={{
        bottom: "20px",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
      }}
    >
      {/* Contenedor de botones lado a lado */}
      <div
        className="flex items-center justify-center gap-4"
        style={{
          marginBottom: "24px",
        }}
      >
        {/* Botón de descarga APK */}
        <a
          href="/mtv2026.apk"
          download="mtv2026.apk"
          type="application/vnd.android.package-archive"
          className="transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
          aria-label="Descargar App Android"
        >
          <img
            src="/imagenes/logo-android-blanco.png"
            alt="Descargar App Android"
            className="h-8 sm:h-10 object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300"
            style={{ maxWidth: "120px", width: "auto" }}
          />
        </a>

        {/* Botón de invítame un café */}
        <a
          href="https://mpago.la/2BJukrH"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 transform hover:scale-110 focus:outline-none cursor-pointer"
          aria-label="Invítame un café"
        >
          <img
            src="/imagenes/logo-invitame-cafe.png"
            alt="Invítame un café"
            className="h-8 sm:h-10 object-contain drop-shadow-2xl hover:brightness-110 transition-all duration-300"
            style={{ maxWidth: "120px", width: "auto" }}
          />
        </a>
      </div>
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
          fontWeight: "400",
        }}
      >
        Sentí nuevamente la experiencia de MúsicTv | Unofficial Project v1.0
      </p>
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
          fontWeight: "400",
        }}
      >
        Fan-made project / not affiliated with MTV |{' '}
        <a
          href="mailto:danielcarlosrodriguez@gmail.com"
          className="text-white opacity-70 hover:opacity-100 underline transition-opacity duration-300"
          style={{
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
          }}
        >
          Contacto
        </a>
      </p>
    </div>
  );
};

export default Footer;
