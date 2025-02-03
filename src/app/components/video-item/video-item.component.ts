import { AfterViewInit, Component, inject, input, OnInit, output, signal } from '@angular/core';
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
export class VideoItemComponent implements OnInit, AfterViewInit {

  authService = inject(AuthService);
  videoService = inject(VideoService);

  user = this.authService.getUser();
  video = input<Video>();
  isInFavorite = signal(false);
  defaultSource = signal<string>('');
  closeVideoClick = output<boolean>();
  favoriteVideosUpdated = output<void>();

  sourceUpdateMessage = signal<string>('');

  ngOnInit(): void {
    this.updateVideoSourceBasedOnSpeed();

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', this.handleNetworkChange.bind(this));
    }
  }

  ngAfterViewInit(): void {
    this.checkIfVideoIsFavorite();
  }

  private handleNetworkChange() {
    this.updateVideoSourceBasedOnSpeed();
  }

  private updateVideoSourceBasedOnSpeed() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const speed = connection.downlink; // Speed in Mbps
      console.log('Current network speed:', speed);

      let newSource = '';
      if (speed > 9) {
        newSource = this.getVideoUrl(3) || '';
        this.sourceUpdateMessage.set('Video quality has been increased due to your fast connection.');
      } else if (speed > 4) {
        newSource = this.getVideoUrl(2) || '';
        this.sourceUpdateMessage.set('Video quality has been adjusted.');
      } else if (speed > 1) {
        newSource = this.getVideoUrl(1) || '';
        this.sourceUpdateMessage.set('Video quality has been adjusted due to your moderate connection.');
      } else if (speed < 1) {
        newSource = this.getVideoUrl(0) || '';
        this.sourceUpdateMessage.set('Video quality has been reduced due to your slow connection.');
      }

      this.defaultSource.set(newSource);

      // Hide the message after 5 seconds
      setTimeout(() => {
        this.sourceUpdateMessage.set('');
      }, 5000);
    }
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