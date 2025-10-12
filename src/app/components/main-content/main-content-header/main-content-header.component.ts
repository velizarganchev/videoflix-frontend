import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VjsPlayerComponent } from '../../../shared/vjs-player/vjs-player.component';
import { VideoProgressService } from '../../../services/video-progress.service';
import { VideoQualityService } from '../../../services/video-quality.service';
import { VideoService } from '../../../services/video.service';

@Component({
  selector: 'app-main-content-header',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './main-content-header.component.html',
  styleUrl: './main-content-header.component.scss',
})
export class MainContentHeaderComponent implements OnInit, OnDestroy {
  videosService = inject(VideoService);
  videoProgressService = inject(VideoProgressService);
  videoQualityService = inject(VideoQualityService);

  videos = computed(() => this.videosService.loadedVideos());
  previewVideo = computed(() => this.videos()!.find((video) => video.title === 'Breakout'));

  playVideo = signal<boolean>(false);

  ngOnInit(): void {
    this.videosService.loadVideos().subscribe();
  }

  handelPlay() {
    this.videoProgressService.video.set(this.previewVideo()!);
    this.playVideo.set(!this.playVideo());

    if (!this.playVideo()) {
      this.videoProgressService.saveVideoProgress(this.previewVideo()!.id);
      this.videoProgressService.video.set(null);
    }

    if (this.playVideo()) {
      this.videoQualityService.sourceUpdateMessage.set(
        'Optimizing video for your screen.'
      );
      this.videoProgressService.loadVideoProgress(this.previewVideo()!.id);
      this.videoQualityService.clearMessage();
    }
  }

  updateCurrentTime(time: number) {
    this.videoProgressService.updateCurrentTime(time);
  }

  ngOnDestroy(): void {
    if (this.previewVideo()?.id) {
      console.log('saveVideoProgress in ngOnDestroy', this.previewVideo()!.id);

      this.videoProgressService.saveVideoProgress(this.previewVideo()!.id);
    }
  }
}
