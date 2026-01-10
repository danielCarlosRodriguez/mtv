/**
 * Carga archivos JSON de videos por año
 * @param {number[]} years - Array de años a cargar (ej: [1990, 1991, 1992])
 * @returns {Promise<Array>} - Array con todos los videos de los años especificados
 */
export async function loadVideosByYears(years) {
  const startTime = Date.now();
  
  try {
    const loadPromises = years.map(async (year) => {
      try {
        const url = `/data/${year}.json`;
        const response = await fetch(url);
        
        // Si la respuesta no es OK, verificar si es 404 (archivo no existe) o error real
        if (!response.ok) {
          // Si es 404, simplemente omitir silenciosamente
          if (response.status === 404) {
            return [];
          }
          // Para otros errores HTTP, intentar leer el texto para ver si es HTML de error
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            // Si es HTML (página de error), omitir silenciosamente
            if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<!doctype') || trimmedText.startsWith('<html')) {
              return [];
            }
          } catch {
            // Si no se puede leer el texto, omitir silenciosamente
            return [];
          }
          // Si no es HTML, podría ser un error real, pero omitimos silenciosamente para no bloquear
          return [];
        }
        
        // Obtener el texto de la respuesta
        const text = await response.text();
        const trimmedText = text.trim();
        
        // Verificar que el contenido NO es HTML (verificar si empieza con <!DOCTYPE, <html, o contiene tags HTML)
        if (trimmedText.startsWith('<!DOCTYPE') || 
            trimmedText.startsWith('<!doctype') || 
            trimmedText.startsWith('<html') ||
            trimmedText.startsWith('<HTML') ||
            (trimmedText.includes('<!DOCTYPE') && trimmedText.includes('<html'))) {
          // Silenciosamente omitir archivos que no existen - no loguear como error
          return [];
        }
        
        // Verificar que el contenido empieza con { o [ (JSON válido)
        if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
          // Silenciosamente omitir archivos inválidos
          return [];
        }
        
        // Intentar parsear JSON con manejo de error específico
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          // Silenciosamente omitir archivos que no se pueden parsear
          return [];
        }
        
        // Extraer videos del objeto JSON
        const videos = data[year.toString()] || [];
        return videos;
      } catch (err) {
        // Silenciosamente omitir cualquier error - solo retornar array vacío
        // Esto permite que otros archivos continúen cargándose
        return [];
      }
    });

    // Usar Promise.allSettled para asegurar que siempre resolvamos, incluso si hay errores
    const results = await Promise.allSettled(loadPromises);
    
    // Extraer los arrays de videos de las promesas resueltas
    const videosArrays = results
      .map(result => {
        if (result.status === 'fulfilled') {
          return result.value; // Array de videos
        } else {
          // Si hubo un error no capturado, retornar array vacío
          return [];
        }
      })
      .filter(Array.isArray); // Filtrar solo arrays válidos
    
    // Combinar todos los videos en un solo array
    const allVideos = videosArrays.flat();
    return allVideos;
  } catch (error) {
    // Retornar array vacío en lugar de lanzar error para no bloquear la aplicación
    return [];
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
