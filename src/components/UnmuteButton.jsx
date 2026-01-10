import React from 'react';

/**
 * Botón para activar el sonido del video
 * Se muestra mientras el video está mute y desaparece al hacer clic
 */
const UnmuteButton = ({ onUnmute }) => {
  const handleClick = () => {
    if (onUnmute) {
      onUnmute();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm z-30 cursor-pointer transition-opacity hover:bg-black/60"
      aria-label="Activar sonido"
    >
      <div className="text-white text-center">
        <div className="mb-4">
          {/* Ícono de silencio */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M17 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </svg>
        </div>
        <p className="text-2xl font-bold mb-2">Click para activar el sonido</p>
        <p className="text-sm opacity-75">El video se reproduce automáticamente con sonido</p>
      </div>
    </button>
  );
};

export default UnmuteButton;
