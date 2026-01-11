import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { App as CapacitorApp } from "@capacitor/app";
import ChannelSelector from "./components/ChannelSelector.jsx";
import Mtv90 from "./components/Mtv90.jsx";
import Mtv00 from "./components/Mtv00.jsx";
import "./index.css";

function App() {
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleChannelSelect = (channelKey) => {
    setSelectedChannel(channelKey);
  };

  // Manejar botón de retroceso de Android
  useEffect(() => {
    // Verificar si estamos en una app nativa (Capacitor)
    const isNative = window.Capacitor?.isNativePlatform();
    
    if (isNative) {
      let listener;
      
      const setupBackButton = async () => {
        listener = await CapacitorApp.addListener('backButton', () => {
          // Si hay un canal seleccionado, volver al selector de canales
          if (selectedChannel) {
            setSelectedChannel(null);
          } else {
            // Si no hay canal seleccionado, cerrar la app
            CapacitorApp.exitApp();
          }
        });
      };

      setupBackButton();

      return () => {
        if (listener) {
          listener.remove();
        }
      };
    }
  }, [selectedChannel]);

  // Mostrar selector de canal si no hay canal seleccionado
  if (!selectedChannel) {
    return <ChannelSelector onChannelSelect={handleChannelSelect} />;
  }

  // Mostrar el canal seleccionado con auto-unmute
  if (selectedChannel === 'MTV90') {
    return <Mtv90 autoUnmute={true} />;
  }

  if (selectedChannel === 'MTV00') {
    return <Mtv00 autoUnmute={true} />;
  }

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
