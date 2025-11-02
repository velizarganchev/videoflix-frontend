import {
  Component,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
  output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';
import videojs from 'video.js';

/**
 * VjsPlayerComponent
 * ------------------
 * A wrapper component around the **Video.js** player library.
 *
 * Provides reactive integration between Angular and Video.js,
 * allowing dynamic video source updates, playback state management,
 * and time synchronization with external components.
 *
 * Features:
 * - Reactive player initialization with dynamic source changes
 * - Preserves playback position across source switches
 * - Supports resume-from-saved-time behavior
 * - Emits time updates for external synchronization
 * - Adjusts video height dynamically based on `customHeight`
 *
 * Selector: `app-vjs-player`
 * Standalone: `true`
 */
@Component({
  selector: 'app-vjs-player',
  standalone: true,
  imports: [],
  templateUrl: './vjs-player.component.html',
  styleUrl: './vjs-player.component.scss'
})
export class VjsPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {

  /** Reference to the underlying `<video>` DOM element. */
  target = viewChild<ElementRef>('target');

  /** Custom height (in viewport height units) to apply to the player container. */
  customHeight = input.required<number>();

  /** Optional network or quality message displayed alongside the player. */
  qualityMessage = input<string>();

  /** Current playback time (in seconds), used for resuming playback. */
  currentTime = input<number>(0);

  /** Video identifier used for progress tracking. */
  videoId = input<number>(0);

  /** Whether playback should start from a previously saved position. */
  startFromSavedTime = input<boolean>();

  /** Event emitter that notifies parent components when playback time changes. */
  currentTimeUpdated = output<number>();

  /**
   * Signal holding a synchronized playback time used for debugging or network speed tracking.
   */
  syncTimeWithNetworkSpeed = signal<number>(0);

  /** Instance of the Video.js player. */
  player: any;

  /** Last known playback position (in seconds). */
  private lastKnownTime = 0;

  /** Whether the video was paused before a source change. */
  private wasPaused = true;

  /** Stores the last loaded source to prevent redundant reloads. */
  private lastSrc = '';

  /**
   * Lifecycle hook that initializes the Video.js player after view rendering.
   * Also applies the custom height via CSS variable `--video-height`.
   */
  ngAfterViewInit() {
    document.documentElement.style.setProperty('--video-height', this.customHeight() + 'vh');
    this.initializePlayer();
  }

  /**
   * Lifecycle hook reacting to input changes.
   *
   * - Handles video source updates (detects when a new `src` is provided).
   * - Keeps playback time synchronized with parent components.
   *
   * @param changes - Object containing changed input properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.player) return;

    if (changes['options']) {
      this.capturePlaybackState();
      const sources = this.options().sources ?? [];
      const nextSrc = sources.length ? sources[0]?.src || '' : '';

      if (nextSrc && nextSrc !== this.lastSrc) {
        this.updateSource(sources);
      }
    }

    if (changes['currentTime'] && !changes['currentTime'].firstChange && this.player) {
      const t = this.currentTime();
      if (typeof t === 'number' && t >= 0 && Math.abs(this.player.currentTime() - t) > 0.5) {
        this.player.currentTime(t);
      }
    }
  }

  /**
   * Cleans up the player instance to prevent memory leaks.
   */
  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

  /**
   * Configuration options passed directly to Video.js upon initialization.
   */
  options = input.required<{
    preferFullWindow: boolean,
    playsinline: boolean,
    fluid: boolean,
    autoplay: boolean | string,
    muted: boolean,
    controls: boolean,
    playbackRates: number[],
    sources: {
      src: string | null,
      type: string,
    }[],
  }>();

  /**
   * Initializes the Video.js player with the provided options and event bindings.
   *
   * @private
   */
  private initializePlayer() {
    if (!this.target()?.nativeElement) {
      console.error('Video element not found');
      return;
    }

    this.player = videojs(this.target()!.nativeElement, this.options());

    this.player.ready(() => {
      this.setInitialTime();
    });

    this.player.on('timeupdate', () => {
      this.currentTimeUpdated.emit(this.player.currentTime());
    });

    this.player.on('error', () => {
      const err = this.player.error();
      console.error('video.js error:', err);
    });
  }

  /**
   * Updates the player source dynamically and restores previous playback state if applicable.
   *
   * @param sources - Array of new source objects for the player.
   *
   * @private
   */
  private updateSource(sources: any[]): void {
    this.player.src(sources);
    this.player.load();

    const nextSrc = sources?.[0]?.src || '';
    this.lastSrc = nextSrc;
    if (nextSrc) {
      console.log('[vjs] switching to src:', nextSrc);
    }

    const restore = () => {
      const target = this.startFromSavedTime()
        ? (this.currentTime() || this.lastKnownTime)
        : this.lastKnownTime;

      if (this.player.readyState() >= 1 && typeof target === 'number' && target >= 0) {
        try {
          this.player.currentTime(target);
        } catch (e) {
          console.warn('Failed to set currentTime immediately, will retry on canplay', e);
        }
      }

      if (!this.wasPaused) {
        setTimeout(() => {
          this.player.play().catch(() => { /* ignore autoplay restrictions */ });
        }, 0);
      }
    };

    this.player.one('loadedmetadata', restore);
    this.player.one('canplay', restore);
  }

  /**
   * Captures the player's current playback state before a source change.
   * Preserves position and pause state for seamless transitions.
   *
   * @private
   */
  private capturePlaybackState() {
    if (!this.player) return;
    try {
      this.lastKnownTime = Number.isFinite(this.player.currentTime()) ? this.player.currentTime() : 0;
      this.wasPaused = this.player.paused();
      this.syncTimeWithNetworkSpeed.set(this.lastKnownTime);
    } catch {
      this.lastKnownTime = 0;
      this.wasPaused = true;
    }
  }

  /**
   * Sets the initial playback position when the player is ready.
   * Respects the `startFromSavedTime` flag to optionally resume progress.
   *
   * @private
   */
  private setInitialTime() {
    const targetTime = this.startFromSavedTime() ? this.currentTime() : 0;
    if (typeof targetTime === 'number' && targetTime > 0) {
      try {
        this.player.currentTime(targetTime);
      } catch (e) {
        console.error('Error setting initial time:', e);
      }
    }
  }
}
