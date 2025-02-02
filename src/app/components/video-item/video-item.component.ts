import { AfterViewInit, Component, effect, ElementRef, inject, input, OnInit, output, signal } from '@angular/core';
import { Video } from '../../models/video.class';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { VjsPlayerComponent } from "../../shared/vjs-player/vjs-player.component";


@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss'
})
export class VideoItemComponent implements AfterViewInit {
  authService = inject(AuthService);
  videoService = inject(VideoService);

  user = this.authService.getUser();
  video = input<Video>();
  isInFavorite = signal(false);
  closeVideoClick = output<boolean>();
  favoriteVideosUpdated = output<void>();

  ngAfterViewInit(): void {
    this.checkIfVideoIsFavorite();
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
      return `http://127.0.0.1:8000${video.image_file}`;
    }
    return '';
  }

  getVideoUrl(index: number): string | null {
    const video = this.video();
    return video?.converted_files?.[index]
      ? `http://127.0.0.1:8000${video.converted_files[index]}`
      : null;
  }
}
