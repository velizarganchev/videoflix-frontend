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

/**
 * MainContentHeaderComponent
 * --------------------------
 * Teaser (header) section for the main page:
 * - Loads a chosen teaser video and plays it in the background (looped).
 * - When "Play" is pressed, opens a full overlay player with progress tracking
 *   (same behavior as the rest of the site).
 *
 * Stability notes:
 * - We pause the teaser while the overlay is open.
 * - We open the overlay only after a valid source is resolved.
 * - We do NOT track teaser progress.
 */
@Component({
  selector: 'app-main-content-header',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './main-content-header.component.html',
  styleUrl: './main-content-header.component.scss',
})
export class MainContentHeaderComponent implements OnInit, OnDestroy {
  /** Services */
  private readonly videosService = inject(VideoService);
  readonly videoProgressService = inject(VideoProgressService);
  readonly videoQualityService = inject(VideoQualityService);

  /** All loaded videos (reactive). */
  readonly videos = computed(() => this.videosService.loadedVideos());

  /**
   * Selected teaser video.
   * Change the predicate if you want a different selection strategy
   * (e.g., by ID, by flag like isFeatured, etc.).
   */
  readonly previewVideo = computed(() =>
    this.videos()?.find((v) => v.title === 'Neon Pulse: The Awakening')
  );

  /** Overlay open/close state. */
  readonly playVideo = signal<boolean>(false);

  /** Signed URL for the background teaser element (<video.bg-video>). */
  readonly headerVideoSrc = signal<string>('');

  ngOnInit(): void {
    this.videosService.loadVideos().subscribe({
      next: () => {
        const teaser = this.previewVideo();
        if (!teaser) return;

        // Temporarily set the teaser in the progress service to request a signed URL
        this.videoProgressService.video.set(teaser);
        this.videoProgressService.loadVideoProgress(teaser.id);

        // Allow the service to resolve its defaultSource; then copy into header state
        setTimeout(() => {
          const src = this.videoProgressService.defaultSource();
          if (src) {
            this.headerVideoSrc.set(src);
            this.forceAutoplay();
          } else {
            console.warn('[MainHeader] No teaser source available.');
          }

          // Important: clear the service so teaser is not tracked as a "real" session
          this.videoProgressService.reset();
        }, 500);
      },
      error: (err) =>
        console.error('[MainHeader] Failed to load teaser metadata:', err),
    });
  }

  /**
   * Try to start autoplay on the teaser <video>.
   * If the browser blocks it, retry muted.
   */
  private forceAutoplay(): void {
    setTimeout(() => {
      const videoEl = document.querySelector<HTMLVideoElement>('.bg-video');
      if (!videoEl) return;

      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {
          /* give up silently */
        });
      });
    }, 800);
  }

  /**
   * Click handler from the template:
   * - If closed → open overlay (normal resume behavior like other videos).
   * - If open → close overlay (and save progress).
   */
  handelPlay(): void {
    if (!this.playVideo()) {
      this.openOverlay();
    } else {
      this.closeOverlay();
    }
  }

  /**
   * Open the overlay player in a stable way:
   * 1) Prepare progress/quality services and pause teaser.
   * 2) Wait for a valid defaultSource() (bounded retry) before rendering the overlay
   *    to avoid *ngIf flicker and "no video" issues.
   */
  private openOverlay(): void {
    const pv = this.previewVideo();
    if (!pv) return;

    // Prepare player services (normal resume behavior)
    this.videoProgressService.video.set(pv);
    this.videoQualityService.sourceUpdateMessage.set('Optimizing video for your screen.');
    this.videoProgressService.loadVideoProgress(pv.id);

    // Pause background teaser
    const teaser = document.querySelector<HTMLVideoElement>('.bg-video');
    if (teaser) teaser.pause();

    // Wait for a source, but with a short upper bound (~2s) to avoid deadlocks.
    const waitForSrc = (attempts = 0) => {
      const src = this.videoProgressService.defaultSource();
      if (src) {
        this.playVideo.set(true);
        setTimeout(() => this.videoQualityService.clearMessage(), 400);
        return;
      }
      if (attempts >= 20) {
        // Fallback: open anyway; VjsPlayer might resolve late bindings.
        this.playVideo.set(true);
        this.videoQualityService.clearMessage();
        return;
      }
      setTimeout(() => waitForSrc(attempts + 1), 100);
    };

    waitForSrc();
  }

  /**
   * Close the overlay:
   * - Save progress exactly once here.
   * - Resume teaser playback.
   * - Clear player state for the next open cycle.
   */
  private closeOverlay(): void {
    const pv = this.previewVideo();
    if (pv?.id) {
      this.videoProgressService.saveVideoProgress(pv.id);
    }

    this.playVideo.set(false);

    // Resume background teaser
    const teaser = document.querySelector<HTMLVideoElement>('.bg-video');
    if (teaser) {
      teaser.play().catch(() => {
        /* ignore resume failures */
      });
    }

    // Clear current session state (keep any internal caches intact)
    this.videoProgressService.video.set(null);
    this.videoQualityService.clearMessage();
  }

  /**
   * Bound to (currentTimeUpdated) from the player.
   * Keeps progress service in sync during playback.
   */
  updateCurrentTime(time: number): void {
    this.videoProgressService.updateCurrentTime(time);
  }

  /**
   * Persist progress if the component unmounts while the overlay is open.
   */
  ngOnDestroy(): void {
    const pv = this.previewVideo();
    if (pv?.id) {
      this.videoProgressService.saveVideoProgress(pv.id);
    }
  }
}
