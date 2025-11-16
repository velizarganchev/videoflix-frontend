import { AfterViewInit, Component, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Video } from '../../models/video.class';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { VjsPlayerComponent } from '../../shared/vjs-player/vjs-player.component';
import { VideoQualityService } from '../../services/video-quality.service';
import { VideoProgressService } from '../../services/video-progress.service';

@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss',
})
export class VideoItemComponent implements OnInit, AfterViewInit, OnDestroy {
  // Services
  private auth = inject(AuthService);
  private videos = inject(VideoService);
  videoProgressService = inject(VideoProgressService);
  videoQualityService = inject(VideoQualityService);

  /** Current user signal (read value с this.user()) */
  user = this.auth.currentUser;

  /** Video to play (signal input) */
  video = input<Video>();

  /** Cached video id */
  videoId = signal<number>(0);

  /** Is current video in favorites */
  isInFavorite = signal(false);

  /** Outputs */
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

  /** Check favorite flag against current user state */
  private checkIfVideoIsFavorite(): void {
    const u = this.user();
    const id = this.video()?.id ?? 0;
    const exists = !!u?.favorite_videos?.some(vId => vId === id);
    this.isInFavorite.set(exists);
  }

  /** Close/back from overlay */
  handleBackClick(closeVideo: boolean) {
    this.closeVideoClick.emit(closeVideo);
  }

  /** Toggle favorite -> update AuthService -> refresh local flag + notify parent */
  onHandleFavorite(videoId: number) {
    this.videos.addToFavorite(videoId).subscribe({
      next: (favorites) => {
        this.auth.setFavoriteVideos(favorites);           // централизирано обновяване
        this.isInFavorite.set(favorites.includes(this.videoId()));
        this.favoriteVideosUpdated.emit();
      },
      error: (err) => console.error(err),
    });
  }

  getImageUrl(): string {
    const v = this.video();
    return v?.image_file ?? '';
  }

  ngOnDestroy(): void {
    this.videoProgressService.saveVideoProgress(this.videoId());
    this.videoProgressService.reset();
  }
}
