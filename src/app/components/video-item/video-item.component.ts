import { AfterViewInit, Component, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Video } from '../../models/video.class';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { VjsPlayerComponent } from "../../shared/vjs-player/vjs-player.component";
import { VideoQualityService } from '../../services/video-quality.service';
import { VideoProgressService } from '../../services/video-progress.service';

@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss'
})
export class VideoItemComponent implements OnInit, AfterViewInit, OnDestroy {

  authService = inject(AuthService);
  videoService = inject(VideoService);
  videoProgressService = inject(VideoProgressService);
  videoQualityService = inject(VideoQualityService);

  user = this.authService.getUser();
  video = input<Video>();

  videoId = signal<number>(0);
  isInFavorite = signal(false);

  closeVideoClick = output<boolean>();
  favoriteVideosUpdated = output<void>();

  ngOnInit(): void {
    this.videoId.set(this.video()?.id || 0);
    if (this.videoId()) {
      this.videoQualityService.sourceUpdateMessage.set('Optimizing video for your screen.');
      this.videoProgressService.video.set(this.video()!);
      this.videoProgressService.loadVideoProgress(this.videoId());
      this.videoQualityService.clearMessage();
    }
  }

  ngAfterViewInit(): void {
    this.checkIfVideoIsFavorite();
  }

  updateCurrentTime(time: number) {
    this.videoProgressService.updateCurrentTime(time);
  }

  private checkIfVideoIsFavorite() {
    const existInFavorite = this.user?.favorite_videos?.some((videoId) => videoId === this.video()!.id) || false;
    if (existInFavorite) {
      this.isInFavorite.set(true);
    } else {
      this.isInFavorite.set(false);
    }
  }

  handleBackClick(closeVideo: boolean) {
    this.closeVideoClick.emit(closeVideo);
  }

  onHandleFavorite(videoId: number) {
    this.videoService.addToFavorite(videoId).subscribe({
      next: () => {
        this.user = this.authService.getUser();
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.checkIfVideoIsFavorite();
        this.favoriteVideosUpdated.emit();
      }
    });
  }

  getImageUrl(): string {
    const video = this.video();
    if (video && video.image_file) {
      return video.image_file;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.videoProgressService.saveVideoProgress(this.videoId());
    this.videoProgressService.video.set(null);
  }
}