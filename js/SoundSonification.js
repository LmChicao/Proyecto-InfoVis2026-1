/**
 * SoundSonification.js
 * Convierte datos en sonidos (sonificación)
 * Mapea valores AQI a frecuencias y notas
 */

class SoundSonification {
  constructor(audioContext, masterGain) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
  }

  /**
   * Generar un tono tipo "alert" basado en AQI
   * AQI bajo (0-50) = tono bajo y limpio
   * AQI alto (150+) = tono alto y discordante
   * 
   * @param {number} aqi - Valor AQI (0-200+)
   * @param {number} duration - Duración en segundos (default 0.5)
   */
  playAQITone(aqi, duration = 0.5) {
    try {
      // Normalizar AQI a rango 0-1
      // 0 AQI = 0, 150 AQI = 1
      const normalized = Math.min(aqi / 150, 1);

      // Mapear a frecuencia (200 Hz bajo a 800 Hz alto)
      const baseFreq = 200;
      const maxFreq = 800;
      const frequency = baseFreq + (maxFreq - baseFreq) * normalized;

      // Crear oscilador
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;

      // Envelope (ADSR simplificado)
      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      // Conectar
      osc.connect(gain);
      gain.connect(this.masterGain);

      // Reproducir
      osc.start(now);
      osc.stop(now + duration);

      console.log(`[DEBUG] Tono AQI: ${aqi} → ${frequency.toFixed(0)}Hz`);
    } catch (e) {
      console.error('[DEBUG] Error generando tono AQI:', e.message);
    }
  }

  /**
   * Generar "click" corto (efecto UI)
   * @param {number} pitch - Altura del sonido (0-1, default 0.5)
   */
  playClickSound(pitch = 0.5) {
    try {
      const freq = 300 + pitch * 400; // 300-700 Hz
      const duration = 0.1;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'square';
      osc.frequency.value = freq;

      const now = this.audioContext.currentTime;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.error('[DEBUG] Error generando click:', e.message);
    }
  }

  /**
   * Generar sonido "warning" (alerta)
   * Dos tonos que suben
   */
  playWarningSound() {
    try {
      const duration = 0.3;
      const now = this.audioContext.currentTime;

      // Primer tono
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.frequency.value = 600;
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      // Segundo tono (más agudo)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.frequency.value = 800;
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.2, now + duration * 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc1.start(now);
      osc1.stop(now + duration);
      osc2.start(now + duration * 0.3);
      osc2.stop(now + duration);

      console.log('[DEBUG] Warning sound');
    } catch (e) {
      console.error('[DEBUG] Error generando warning:', e.message);
    }
  }

  /**
   * Generar "ding" suave (éxito/limpio)
   */
  playCleanSound() {
    try {
      const duration = 0.4;
      const now = this.audioContext.currentTime;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = 500;

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);

      console.log('[DEBUG] Clean sound');
    } catch (e) {
      console.error('[DEBUG] Error generando clean sound:', e.message);
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundSonification;
}