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
 * Calcula el número de visitas de un video
 * @param {Object} video - Video object
 * @returns {number} - Número de visitas
 */
function getVisitas(video) {
  const visitas = video.visitas || video['Cantidad de visitas'];
  if (visitas === null || visitas === undefined || visitas === 'null') {
    return 0;
  }
  const numero = parseFloat(String(visitas).replace(/[.,]/g, ''));
  return isNaN(numero) ? 0 : numero;
}

/**
 * Separa videos en dos grupos: alta popularidad y resto
 * @param {Array} videos - Array de videos
 * @returns {Object} - { highPopularity: [], rest: [] }
 */
function separateByPopularity(videos) {
  if (!videos || videos.length === 0) {
    return { highPopularity: [], rest: [] };
  }

  // Calcular visitas para todos los videos
  const videosWithVisitas = videos.map(video => ({
    video,
    visitas: getVisitas(video)
  }));

  // Ordenar por visitas (descendente)
  videosWithVisitas.sort((a, b) => b.visitas - a.visitas);

  // Separar en dos grupos: top 50% alta popularidad, resto
  const midPoint = Math.ceil(videosWithVisitas.length / 2);
  const highPopularity = videosWithVisitas.slice(0, midPoint).map(item => item.video);
  const rest = videosWithVisitas.slice(midPoint).map(item => item.video);

  return { highPopularity, rest };
}

/**
 * Selecciona un video aleatorio NUNCA repetido con proporción 70/30
 * Regla: En cada grupo de 10 videos, 7 deben ser de alta popularidad y 3 del resto
 * @param {Array} videos - Array de videos
 * @param {Array} playedIds - Array de IDs de videos ya reproducidos (NUNCA se repiten)
 * @param {number} highPopularityCount - Contador de videos de alta popularidad reproducidos
 * @param {number} restCount - Contador de videos del resto reproducidos
 * @returns {Object} - { selected: Video, isHighPopularity: boolean }
 */
export function weightedRandomSelectWithHistory(videos, playedIds = [], highPopularityCount = 0, restCount = 0) {
  if (!videos || videos.length === 0) {
    return { selected: null, isHighPopularity: false };
  }

  // Filtrar videos NO reproducidos (NUNCA repetir)
  const availableVideos = videos.filter(
    (video) => !playedIds.includes(video.youtubeId)
  );

  // Si no hay videos disponibles, retornar null (todos ya fueron reproducidos)
  if (availableVideos.length === 0) {
    return { selected: null, isHighPopularity: false };
  }

  // Separar videos disponibles por popularidad
  const { highPopularity, rest } = separateByPopularity(availableVideos);

  // Calcular proporción actual en el grupo de 10
  const totalInGroup = highPopularityCount + restCount;
  const positionInGroup = totalInGroup % 10;

  // Determinar de qué grupo seleccionar según la proporción 70/30
  let shouldSelectHighPopularity;
  
  if (positionInGroup < 7) {
    // Primeros 7 del grupo: alta popularidad
    shouldSelectHighPopularity = true;
  } else {
    // Últimos 3 del grupo: resto
    shouldSelectHighPopularity = false;
  }

  // Seleccionar del grupo correspondiente
  let selected = null;
  let isHighPopularity = false;

  if (shouldSelectHighPopularity && highPopularity.length > 0) {
    // Seleccionar de alta popularidad con ponderación
    selected = weightedRandomSelect(highPopularity);
    isHighPopularity = true;
  } else if (!shouldSelectHighPopularity && rest.length > 0) {
    // Seleccionar del resto con ponderación
    selected = weightedRandomSelect(rest);
    isHighPopularity = false;
  } else {
    // Fallback: si el grupo requerido no tiene videos disponibles, usar el otro
    if (highPopularity.length > 0) {
      selected = weightedRandomSelect(highPopularity);
      isHighPopularity = true;
    } else if (rest.length > 0) {
      selected = weightedRandomSelect(rest);
      isHighPopularity = false;
    } else {
      // Último fallback: selección aleatoria de cualquier video disponible
      selected = availableVideos[Math.floor(Math.random() * availableVideos.length)];
      isHighPopularity = false;
    }
  }

  return { selected, isHighPopularity };
}
