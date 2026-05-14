/**
 * audioConfig.js
 * Configuracion de archivos de audio
 */

const AUDIO_FILES = {
  ciudad: 'Fondo_Ciudad.mp3',
  trafico: 'Fondo_Trafico.mp3',
  fabricaMetal: 'Fondo_Fabricametalurgica.mp3',
  fabricaIndustrial: 'Fondo_Fabricaindustrial.mp3',
  fuego: 'Sonido_Fuego.mp3',
};

/**
 * Obtener el nombre del archivo de audio
 * @param {string} key - Clave del audio (ej: 'trafico')
 * @returns {string} Nombre del archivo
 */
function getAudioFile(key) {
  const fileName = AUDIO_FILES[key];
  if (!fileName) {
    console.warn("[DEBUG] Audio no encontrado: ${key}");
    return null;
  }
  return fileName;
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AUDIO_FILES, getAudioFile };
}