import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { VideoQualityService } from './video-quality.service';
import { Video } from '../models/video.class';

@Injectable({
  providedIn: 'root'
})
export class VideoProgressService {
  videoQualityService = inject(VideoQualityService);

  video = signal<Video | null>(null);
  currentTime = signal<number>(0);
  startSavedTime = signal<boolean>(false);
  defaultSource = signal<string>('');

  constructor() {
    effect(() => {
      this.updateVideoSource();
    }, { allowSignalWrites: true });
  }

  updateCurrentTime(time: number) {
    this.currentTime.set(time);
  }

  saveVideoProgress(videoId: number) {
    if (videoId) {
      localStorage.setItem(`videoProgress_${videoId}`, this.currentTime().toString());
    }
  }

  loadVideoProgress(videoId: number) {
    const savedTime = localStorage.getItem(`videoProgress_${videoId}`);
    this.currentTime.set(savedTime ? Number(savedTime) : 0);
    this.startSavedTime.set(!!savedTime);
  }

  updateVideoSource() {
    if (!this.video) return;
    
    const qualityIndex = this.videoQualityService.qualityIndex();
    this.defaultSource.set(this.getVideoUrl(this.video, qualityIndex) || '');
    this.videoQualityService.clearMessage();
  }

  private getVideoUrl(video: WritableSignal<Video | null>, index: number): string | null {
    return video()?.converted_files?.[index]
      ? `http://127.0.0.1:8000${video()!.converted_files[index]}`
      : null;
  }
}
