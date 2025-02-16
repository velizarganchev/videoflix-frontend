import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoQualityService {

  sourceUpdateMessage = signal<string>('');
  qualityIndex = signal<number>(2); // Standardqualität

  constructor() {
    this.initializeQualityListener();
  }

  private initializeQualityListener() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      this.updateQualityIndex(connection.downlink); // Initial setzen
      connection.addEventListener('change', () => {
        this.updateQualityIndex(connection.downlink); // Bei Änderung aktualisieren
      });
    }
  }

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

  clearMessage() {
    setTimeout(() => {
      this.sourceUpdateMessage.set('');
    }, 4000);
  }
}
