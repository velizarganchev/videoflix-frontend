import { Injectable, signal } from '@angular/core';

/**
 * Video Quality Service.
 *
 * Dynamically adjusts the video playback quality based on the user's
 * current network speed (via Network Information API).
 *
 * It emits messages to inform the user about quality changes and
 * provides a reactive signal (`qualityIndex`) to control the player source.
 */
@Injectable({
  providedIn: 'root'
})
export class VideoQualityService {

  /**
   * Signal displaying informational messages when video quality changes.
   * Example messages: "Video quality has been increased due to your fast connection."
   */
  sourceUpdateMessage = signal<string>('');

  /**
   * Signal representing the current quality level index.
   * Levels:
   * - `0`: Lowest (slow connection)
   * - `1`: Medium-low
   * - `2`: Standard (default)
   * - `3`: High (fast connection)
   */
  qualityIndex = signal<number>(2); // Standard quality

  /**
   * Initializes the service and starts listening for network speed changes.
   */
  constructor() {
    this.initializeQualityListener();
  }

  /**
   * Sets up the network connection listener.
   *
   * Uses the `NetworkInformation` API to detect changes in `downlink` speed
   * and adjusts video quality accordingly.
   *
   * @private
   */
  private initializeQualityListener() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      this.updateQualityIndex(connection.downlink);
      connection.addEventListener('change', () => {
        this.updateQualityIndex(connection.downlink);
      });
    }
  }

  /**
   * Updates the `qualityIndex` and sets a user message based on the given speed.
   *
   * @param speed - Network download speed in megabits per second (Mbps).
   *
   * @private
   */
  private updateQualityIndex(speed: number) {
    if (speed > 9) {
      this.qualityIndex.set(3);
      this.sourceUpdateMessage.set('Video quality has been increased due to your fast connection.');
    } else if (speed > 4) {
      this.qualityIndex.set(2);
      this.sourceUpdateMessage.set('Video quality has been adjusted.');
    } else if (speed > 1) {
      this.qualityIndex.set(1);
      this.sourceUpdateMessage.set('Video quality has been adjusted due to your moderate connection.');
    } else {
      this.qualityIndex.set(0);
      this.sourceUpdateMessage.set('Video quality has been reduced due to your slow connection.');
    }

    this.clearMessage();
  }

  /**
   * Clears the informational message after a delay.
   * Typically used to prevent persistent UI notifications.
   */
  clearMessage() {
    setTimeout(() => {
      this.sourceUpdateMessage.set('');
    }, 4000);
  }
}
