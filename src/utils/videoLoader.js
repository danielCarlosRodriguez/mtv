/**
 * Carga archivos JSON de videos por año
 * @param {number[]} years - Array de años a cargar (ej: [1990, 1991, 1992])
 * @returns {Promise<Array>} - Array con todos los videos de los años especificados
 */
export async function loadVideosByYears(years) {
  try {
    const loadPromises = years.map(async (year) => {
      try {
        const response = await fetch(`/data/${year}.json`);
        if (!response.ok) {
          // Si el archivo no existe, devolver array vacío (no fallar)
          return [];
        }
        const data = await response.json();
        const videos = data[year.toString()] || [];
        return videos; // Extraer el array de videos del año
      } catch (err) {
        // Si hay error al cargar un año específico, continuar con los demás
        return [];
      }
    });

    const videosArrays = await Promise.all(loadPromises);
    // Combinar todos los videos en un solo array
    const allVideos = videosArrays.flat();
    return allVideos;
  } catch (error) {
    console.error('Error crítico al cargar videos:', error);
    throw error;
  }
}

/**
 * Configuración de canales disponibles
 */
export const CHANNELS = {
  MTV90: {
    name: 'MTV 90',
    years: [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999], // Años 90 completos
  },
  MTV00: {
    name: 'MTV 00',
    years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009], // Años 2000-2009
  },
};
