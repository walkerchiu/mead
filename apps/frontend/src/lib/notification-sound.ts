/**
 * Notification Sound Utility
 *
 * 提供通知音效播放功能
 */

// 音效類型
export type NotificationSoundType = 'info' | 'success' | 'warning' | 'error';

// 使用 Web Audio API 生成音效
class NotificationSoundPlayer {
  private audioContext: AudioContext | null = null;

  constructor() {
    // 延遲初始化 AudioContext（避免瀏覽器自動播放政策問題）
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      // 不在建構函式中初始化，等到第一次播放時再初始化
    }
  }

  /**
   * 初始化 AudioContext
   */
  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.error(
          '[NotificationSound] Failed to create AudioContext:',
          error,
        );
      }
    }
  }

  /**
   * 播放通知音效
   */
  async play(type: NotificationSoundType = 'info') {
    try {
      // 初始化 AudioContext（如果還沒初始化）
      this.initAudioContext();

      if (!this.audioContext) {
        console.warn('[NotificationSound] AudioContext not available');
        return;
      }

      // 如果 AudioContext 被暫停，先恢復它
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 根據通知類型選擇音效參數
      const soundParams = this.getSoundParams(type);

      // 建立音效
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // 設定振盪器類型和頻率
      oscillator.type = soundParams.waveType;
      oscillator.frequency.setValueAtTime(
        soundParams.frequency,
        this.audioContext.currentTime,
      );

      // 設定音量包絡（淡入淡出）
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        soundParams.volume,
        this.audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + soundParams.duration,
      );

      // 連接音訊節點
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 播放音效
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + soundParams.duration);
    } catch (error) {
      console.error('[NotificationSound] Failed to play sound:', error);
    }
  }

  /**
   * 根據通知類型取得音效參數
   */
  private getSoundParams(type: NotificationSoundType) {
    switch (type) {
      case 'success':
        return {
          waveType: 'sine' as OscillatorType,
          frequency: 800, // 較高頻率（愉悅感）
          volume: 0.3,
          duration: 0.15,
        };
      case 'warning':
        return {
          waveType: 'square' as OscillatorType,
          frequency: 600, // 中頻率（警示感）
          volume: 0.3,
          duration: 0.2,
        };
      case 'error':
        return {
          waveType: 'sawtooth' as OscillatorType,
          frequency: 400, // 較低頻率（嚴重感）
          volume: 0.4,
          duration: 0.25,
        };
      case 'info':
      default:
        return {
          waveType: 'sine' as OscillatorType,
          frequency: 650, // 中高頻率（中性）
          volume: 0.25,
          duration: 0.12,
        };
    }
  }

  /**
   * 清理資源
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// 單例實例
let soundPlayerInstance: NotificationSoundPlayer | null = null;

/**
 * 取得音效播放器實例
 */
function getSoundPlayer(): NotificationSoundPlayer {
  if (!soundPlayerInstance) {
    soundPlayerInstance = new NotificationSoundPlayer();
  }
  return soundPlayerInstance;
}

/**
 * 播放通知音效
 */
export async function playNotificationSound(
  type: NotificationSoundType = 'info',
) {
  const player = getSoundPlayer();
  await player.play(type);
}

/**
 * 清理音效播放器資源
 */
export function disposeNotificationSound() {
  if (soundPlayerInstance) {
    soundPlayerInstance.dispose();
    soundPlayerInstance = null;
  }
}
