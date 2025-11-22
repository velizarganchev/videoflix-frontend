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
 *
 * Header/teaser section for the main page:
 * - shows a looping teaser video in the background
 * - opens a full overlay player when "Play" is pressed
 */
@Component({
  selector: 'app-main-content-header',
  standalone: true,
  imports: [CommonModule, VjsPlayerComponent],
  templateUrl: './main-content-header.component.html',
  styleUrl: './main-content-header.component.scss',
})
export class MainContentHeaderComponent implements OnInit, OnDestroy {
  /** Data & helper services. */
  private readonly videosService = inject(VideoService);
  readonly videoProgressService = inject(VideoProgressService);
  readonly videoQualityService = inject(VideoQualityService);

  /** All loaded videos (reactive). */
  readonly videos = computed(() => this.videosService.loadedVideos());

  /**
   * Selected teaser video.
   */
  readonly previewVideo = computed(() => {
    const list = this.videos() ?? [];
    if (list.length === 0) return null;
    return list[list.length - 1];
  });

  /** Overlay open/close state. */
  readonly playVideo = signal<boolean>(false);

  /** Signed URL used for the background teaser <video>. */
  readonly headerVideoSrc = signal<string>('');

  /**
   * On init:
   * - load videos
   * - resolve teaser
   * - request a signed URL via the progress service
   * - set headerVideoSrc and clear teaser state afterwards
   */
  ngOnInit(): void {
    this.videosService.loadVideos().subscribe({
      next: () => {
        const teaser = this.previewVideo();
        if (!teaser) return;

        // Temporarily set the teaser to request a signed URL
        this.videoProgressService.video.set(teaser);
        this.videoProgressService.loadVideoProgress(teaser.id);

        setTimeout(() => {
          const src = this.videoProgressService.defaultSource();
          if (src) {
            this.headerVideoSrc.set(src);
            this.forceAutoplay();
          } else {
            console.warn('[MainHeader] No teaser source available.');
          }

          // Clear state so teaser is not tracked as a normal session
          this.videoProgressService.reset();
        }, 500);
      },
      error: (err) =>
        console.error('[MainHeader] Failed to load teaser metadata:', err),
    });
  }

  /**
   * Try to autoplay the teaser video element.
   * If autoplay fails, retry muted.
   */
  private forceAutoplay(): void {
    setTimeout(() => {
      const videoEl = document.querySelector<HTMLVideoElement>('.bg-video');
      if (!videoEl) return;

      videoEl.play().catch(() => {
        videoEl.muted = true;
        videoEl.play().catch(() => {
          /* ignore autoplay failure */
        });
      });
    }, 800);
  }

  /**
   * Toggle the overlay:
   * - open if closed
   * - close if open
   */
  handelPlay(): void {
    if (!this.playVideo()) {
      this.openOverlay();
    } else {
      this.closeOverlay();
    }
  }

  /**
   * Open the overlay player:
   * - set current video for progress tracking
   * - show a short "optimizing" message
   * - pause the background teaser
   * - wait for a valid source (with a small upper bound) before showing overlay
   */
  private openOverlay(): void {
    const pv = this.previewVideo();
    if (!pv) return;

    this.videoProgressService.video.set(pv);
    this.videoQualityService.sourceUpdateMessage.set('Optimizing video for your screen.');
    this.videoProgressService.loadVideoProgress(pv.id);

    const teaser = document.querySelector<HTMLVideoElement>('.bg-video');
    if (teaser) teaser.pause();

    const waitForSrc = (attempts = 0) => {
      const src = this.videoProgressService.defaultSource();
      if (src) {
        this.playVideo.set(true);
        setTimeout(() => this.videoQualityService.clearMessage(), 400);
        return;
      }
      if (attempts >= 20) {
        // Fallback: open anyway; the player may still resolve the source
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
   * - save progress
   * - resume teaser playback
   * - clear player state
   */
  private closeOverlay(): void {
    const pv = this.previewVideo();
    if (pv?.id) {
      this.videoProgressService.saveVideoProgress(pv.id);
    }

    this.playVideo.set(false);

    const teaser = document.querySelector<HTMLVideoElement>('.bg-video');
    if (teaser) {
      teaser.play().catch(() => {
        /* ignore resume failures */
      });
    }

    this.videoProgressService.video.set(null);
    this.videoQualityService.clearMessage();
  }

  /**
   * Keep the progress service in sync while the overlay player is active.
   */
  updateCurrentTime(time: number): void {
    this.videoProgressService.updateCurrentTime(time);
  }

  /**
   * Persist progress if the component is destroyed while a teaser video is active.
   */
  ngOnDestroy(): void {
    const pv = this.previewVideo();
    if (pv?.id) {
      this.videoProgressService.saveVideoProgress(pv.id);
    }
  }
}
