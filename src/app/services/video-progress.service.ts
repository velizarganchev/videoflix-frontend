import { effect, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { VideoQualityService } from './video-quality.service';
import { Video } from '../models/video.class';
import { VideoService } from './video.service';

type Quality = '120p' | '360p' | '720p' | '1080p';

@Injectable({ providedIn: 'root' })
export class VideoProgressService {
  private videoService = inject(VideoService);
  videoQualityService = inject(VideoQualityService);

  // Сигнали за текущото видео и състояние
  video = signal<Video | null>(null);
  currentTime = signal<number>(0);
  startSavedTime = signal<boolean>(false);
  defaultSource = signal<string>('');

  // ключ за предотвратяване на двойни заявки
  private lastReqKey = '';

  constructor() {
    effect(() => {
      const v = this.video();
      const qIndex = this.videoQualityService.qualityIndex();

      if (!v) {
        this.defaultSource.set('');
        return;
      }

      const quality = this.indexToQuality(qIndex);
      const reqKey = `${v.id}:${quality}`;

      // предотвратява двойно извикване при едни и същи данни
      if (this.lastReqKey === reqKey) return;
      this.lastReqKey = reqKey;

      // заявка за подписан URL
      this.videoService.getSignedVideoUrl(v.id, quality)
        .pipe(take(1))
        .subscribe({
          next: ({ url }) => {
            this.defaultSource.set(url);
            this.videoQualityService.clearMessage();

            console.log('✅ Signed video URL успешно получен:');
            console.log('URL:', url);
          },
          error: (err) => {
            console.error('❌ Грешка при взимане на подписан URL:', err);
            this.defaultSource.set('');
            // нулирам ключа, за да позволим повторен опит
            this.lastReqKey = '';
          },
          complete: () => {
            console.log('✅ Video URL fetch complete');
          }
        });
    }, { allowSignalWrites: true });
  }

  /**
   * Обновява текущото време при промяна (timeupdate)
   */
  updateCurrentTime(time: number) {
    this.currentTime.set(time);
  }

  /**
   * Запазва прогреса на видеото в localStorage
   */
  saveVideoProgress(videoId: number) {
    if (videoId && this.currentTime() > 0) {
      localStorage.setItem(`videoProgress_${videoId}`, this.currentTime().toString());
    }
  }

  /**
   * Зарежда запазен прогрес на видео
   */
  loadVideoProgress(videoId: number) {
    const savedTime = localStorage.getItem(`videoProgress_${videoId}`);
    this.currentTime.set(savedTime ? Number(savedTime) : 0);
    this.startSavedTime.set(!!savedTime);
  }

  /**
   * Смяна на качество по индекс (0-3)
   */
  switchQuality(index: number) {
    this.videoQualityService.qualityIndex.set(index);
  }

  /**
   * Помощна функция за превод на индекс -> качество
   */
  private indexToQuality(index: number): Quality {
    return (['120p', '360p', '720p', '1080p'] as const)[Math.max(0, Math.min(3, index))];
  }
}
