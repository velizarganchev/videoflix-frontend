import { AfterViewInit, Component, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Video } from '../../models/video.class';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { VjsPlayerComponent } from "../../shared/vjs-player/vjs-player.component";
import { VideoQualityService } from '../../services/video-quality.service';
import { VideoProgressService } from '../../services/video-progress.service';

/**
 * Video Item component.
 *
 * Represents a single video element, including player control,
 * favorite functionality, playback progress, and quality optimization.
 *
 * Responsibilities:
 * - Initializes and configures the video player for a specific video.
 * - Tracks playback time and saves user progress.
 * - Allows users to add/remove videos from favorites.
 * - Emits events when the player is closed or favorites are updated.
 *
 * Selector: `app-video-item`
 * Standalone: `true`
 */
@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss'
})
export class VideoItemComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Authentication service for managing user data and favorite lists.
   */
  authService = inject(AuthService);

  /**
   * Service responsible for managing video metadata and favorite operations.
   */
  videoService = inject(VideoService);

  /**
   * Service handling video progress tracking (save/load playback position).
   */
  videoProgressService = inject(VideoProgressService);

  /**
   * Service for adjusting and optimizing video playback quality.
   */
  videoQualityService = inject(VideoQualityService);

  /**
   * The currently authenticated user object.
   */
  user = this.authService.getUser();

  /**
   * Input signal providing the current video to be displayed or played.
   */
  video = input<Video>();

  /**
   * Signal holding the ID of the current video.
   */
  videoId = signal<number>(0);

  /**
   * Signal indicating whether the current video is in the user's favorites.
   */
  isInFavorite = signal(false);

  /**
   * Output event emitted when the close/back button of the video player is clicked.
   * Carries a boolean value representing the close state.
   */
  closeVideoClick = output<boolean>();

  /**
   * Output event emitted after a favorite video action (add/remove) completes.
   * Used to notify parent components to refresh favorite lists.
   */
  favoriteVideosUpdated = output<void>();

  /**
   * Lifecycle hook.
   *
   * Initializes video context:
   * - Sets video ID.
   * - Loads saved progress.
   * - Displays temporary optimization message.
   * - Clears quality service message after setup.
   */
  ngOnInit(): void {
    this.videoId.set(this.video()?.id || 0);
    if (this.videoId()) {
      this.videoQualityService.sourceUpdateMessage.set('Optimizing video for your screen.');
      this.videoProgressService.video.set(this.video()!);
      this.videoProgressService.loadVideoProgress(this.videoId());
      this.videoQualityService.clearMessage();
    }
  }

  /**
   * Lifecycle hook.
   *
   * After the view initializes, checks whether the current video
   * is part of the user's favorites and updates state accordingly.
   */
  ngAfterViewInit(): void {
    this.checkIfVideoIsFavorite();
  }

  /**
   * Updates the current playback time in the `VideoProgressService`.
   *
   * @param time - The current playback time in seconds.
   */
  updateCurrentTime(time: number) {
    this.videoProgressService.updateCurrentTime(time);
  }

  /**
   * Checks if the current video is in the user's favorite list and updates `isInFavorite` signal.
   */
  private checkIfVideoIsFavorite() {
    const existInFavorite = this.user?.favorite_videos?.some((videoId) => videoId === this.video()!.id) || false;
    if (existInFavorite) {
      this.isInFavorite.set(true);
    } else {
      this.isInFavorite.set(false);
    }
  }

  /**
   * Handles the back/close button click from the player view.
   *
   * Emits `closeVideoClick` event to inform the parent component to close the player overlay.
   *
   * @param closeVideo - Boolean indicating whether to close the video player.
   */
  handleBackClick(closeVideo: boolean) {
    this.closeVideoClick.emit(closeVideo);
  }

  /**
   * Handles adding or removing a video from favorites.
   *
   * Sends a request to the backend and updates the user's favorite list.
   * Emits `favoriteVideosUpdated` event when the action completes.
   *
   * @param videoId - The ID of the video to add or remove from favorites.
   */
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

  /**
   * Returns the full image URL for the video thumbnail, if available.
   *
   * @returns The image URL or an empty string if not set.
   */
  getImageUrl(): string {
    const video = this.video();
    if (video && video.image_file) {
      return video.image_file;
    }
    return '';
  }

  /**
   * Lifecycle hook.
   *
   * Saves the user's video progress when the component is destroyed
   * and resets internal tracking state.
   */
  ngOnDestroy(): void {
    this.videoProgressService.saveVideoProgress(this.videoId());
    this.videoProgressService.reset();
  }
}
