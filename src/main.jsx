import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import ChannelSelector from "./components/ChannelSelector.jsx";
import Mtv90 from "./components/Mtv90.jsx";
import Mtv00 from "./components/Mtv00.jsx";
import "./index.css";

function App() {
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleChannelSelect = (channelKey) => {
    setSelectedChannel(channelKey);
  };

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
