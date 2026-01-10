/**
 * Selecciona un elemento aleatorio de un array usando ponderación por visitas
 * @param {Array} items - Array de objetos con propiedad "visitas"
 * @returns {Object} - Item seleccionado aleatoriamente (con mayor probabilidad para items con más visitas)
 */
export function weightedRandomSelect(items) {
  if (!items || items.length === 0) {
    return null;
  }

  // Convertir visitas a números y crear pesos
  const weights = items.map((item) => {
    const visitas = item.visitas || item['Cantidad de visitas'];
    if (visitas === null || visitas === undefined || visitas === 'null') {
      return 0; // Sin peso si no tiene visitas
    }
    // Convertir string a número, eliminar puntos y comas
    const numero = parseFloat(String(visitas).replace(/[.,]/g, ''));
    return isNaN(numero) ? 0 : numero;
  });

  // Calcular la suma total de pesos
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  // Si no hay pesos válidos, selección aleatoria uniforme
  if (totalWeight === 0) {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  // Selección ponderada
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  // Fallback (no debería llegar aquí)
  return items[items.length - 1];
}

/**
 * Selecciona un video aleatorio evitando repeticiones en la misma sesión
 * @param {Array} videos - Array de videos
 * @param {Array} playedIds - Array de IDs de videos ya reproducidos
 * @returns {Object} - Video seleccionado
 */
export function weightedRandomSelectWithHistory(videos, playedIds = []) {
  // Si todos los videos ya fueron reproducidos, reiniciar historial
  if (playedIds.length >= videos.length) {
    playedIds.length = 0;
  }

  // Filtrar videos no reproducidos
  const availableVideos = videos.filter(
    (video) => !playedIds.includes(video.youtubeId)
  );

  // Si hay videos disponibles, seleccionar de ellos
  if (availableVideos.length > 0) {
    const selected = weightedRandomSelect(availableVideos);
    return selected;
  }

  // Si no hay videos disponibles (no debería pasar), selección normal
  return weightedRandomSelect(videos);
}
