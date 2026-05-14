/**
 * AudioManager.js
 * Sistema de gestión de audio para infovis
 * Controla reproduccion, volumen y atenuación por scroll
 */

class AudioManager {
  constructor(config = {}) {
    // Audio Context
    this.audioContext = null;
    this.masterVolume = config.masterVolume || 0.5;
    this.audioBuffers = {}; // Cache de audios
    
    // Rutas
    this.audioPath = config.audioPath || './audio/';
    
    // Estado
    this.isInitialized = false;
    this.playingAudios = {}; // { audioName: audioSourceNode }
    
    // Nodos principales
    this.masterGain = null;
    
    this.init();
  }

  /**
   * Inicializar AudioContext y nodos
   */
  init() {
    try {
      const audioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new audioContextClass();
      
      // Nodo maestro de volumen
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      
      this.isInitialized = true;
      console.log(`[DEBUG] AudioManager inicializado correctamente`);
      return true;
    } catch (e) {
      console.error(`[DEBUG] Error al inicializar AudioContext:`, e.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Cargar un archivo de audio
   * @param {string} fileName - Nombre del archivo (ej: 'trafico.mp3')
   * @returns {Promise<AudioBuffer>}
   */
  async loadAudio(fileName) {
    // Si ya está cargado, retornarlo
    if (this.audioBuffers[fileName]) {
      console.log(`[DEBUG] Audio en cache: ${fileName}`);
      return this.audioBuffers[fileName];
    }

    try {
      const filePath = this.audioPath + fileName;
      console.log(`[DEBUG] Cargando: ${filePath}`);
      
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`[DEBUG] HTTP Error: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Guardar en cache
      this.audioBuffers[fileName] = audioBuffer;
      console.log(`[DEBUG] Audio cargado: ${fileName}`);
      
      return audioBuffer;
    } catch (e) {
      console.error(`[DEBUG] Error cargando ${fileName}:`, e.message);
      return null;
    }
  }

  /**
   * Reproducir un audio una sola vez
   * @param {string} fileName - Nombre del archivo
   * @param {number} volume - Volumen (0-1)
   */
  async playSound(fileName, volume = 0.5) {
    if (!this.isInitialized) {
      console.warn(`[DEBUG] AudioContext no inicializado`);
      return;
    }

    try {
      const buffer = await this.loadAudio(fileName);
      if (!buffer) return;

      // Crear nodos
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = volume * this.masterVolume;

      // Conectar
      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Reproducir
      source.start(0);
      console.log(`[DEBUG] Reproduciendo: ${fileName} (vol: ${volume})`);
    } catch (e) {
      console.error(`[DEBUG] Error reproduciendo sonido:`, e.message);
    }
  }

  /**
   * Reproducir audio en loop continuo
   * @param {string} fileName - Nombre del archivo
   * @param {number} volume - Volumen (0-1)
   * @param {boolean} loop - Si debe hacer loop
   * @returns {Object} Objeto con source y gainNode para controlar
   */
  async playAmbience(fileName, volume = 0.3, loop = true) {
    if (!this.isInitialized) {
      console.warn(`[DEBUG] AudioContext no inicializado`);
      return null;
    }

    try {
      const buffer = await this.loadAudio(fileName);
      if (!buffer) return null;

      // Crear nodos
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.loop = loop;
      gainNode.gain.value = volume * this.masterVolume;

      // Conectar
      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      // Reproducir
      source.start(0);
      console.log(`[DEBUG] Ambience iniciada: ${fileName} (loop: ${loop})`);

      // Guardar referencia para control posterior
      this.playingAudios[fileName] = {
        source: source,
        gainNode: gainNode,
        isPlaying: true
      };

      return {
        source: source,
        gainNode: gainNode,
        setVolume: (newVolume) => {
          gainNode.gain.value = newVolume * this.masterVolume;
        },
        stop: () => {
          try {
            source.stop();
            this.playingAudios[fileName].isPlaying = false;
          } catch (e) {
            console.warn(`[DEBUG] Audio ya detenido`);
          }
        }
      };
    } catch (e) {
      console.error(`[DEBUG] Error reproduciendo ambience:`, e.message);
      return null;
    }
  }

  /**
   * Actualizar volumen de audio en reproducción
   * @param {string} fileName - Nombre del archivo
   * @param {number} volume - Nuevo volumen (0-1)
   */
  setAudioVolume(fileName, volume) {
    if (this.playingAudios[fileName] && this.playingAudios[fileName].isPlaying) {
      this.playingAudios[fileName].gainNode.gain.value = volume * this.masterVolume;
    }
  }

  /**
   * Cambiar volumen maestro
   * @param {number} volume - Volumen (0-1)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = this.masterVolume;
    console.log(`[DEBUG] Volumen maestro: ${Math.round(this.masterVolume * 100)}%`);
  }

  /**
   * Obtener volumen maestro
   */
  getMasterVolume() {
    return this.masterVolume;
  }

  /**
   * Detener todo audio
   */
  stopAll() {
    Object.keys(this.playingAudios).forEach(fileName => {
      if (this.playingAudios[fileName].isPlaying) {
        try {
          this.playingAudios[fileName].source.stop();
          this.playingAudios[fileName].isPlaying = false;
        } catch (e) {
          console.warn(`[DEBUG] No se pudo detener ${fileName}`);
        }
      }
    });
    console.log(`[DEBUG] Todos los audios detenidos`);
  }
}

// Exportar para usar en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
