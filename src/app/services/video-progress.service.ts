import { effect, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { VideoQualityService } from './video-quality.service';
import { Video } from '../models/video.class';
import { VideoService } from './video.service';

type Quality = '120p' | '360p' | '720p' | '1080p';

/**
 * VideoProgressService
 * --------------------
 * Centralized state and behavior for video playback across the app.
 *
 * Responsibilities:
 * - Holds the currently active video (if any) and its playback position.
 * - Persists and restores playback progress from localStorage.
 * - Resolves a signed S3 URL for the active video based on the selected quality.
 * - Prevents duplicate signed-URL requests via an internal deduplication key.
 *
 * Compatibility:
 * - Existing consumers (video item pages/components) continue to work unchanged.
 * - Header component can opt into "start from 0:00" by calling `beginFromStart(video)`.
 */
@Injectable({ providedIn: 'root' })
export class VideoProgressService {
  /** API service to fetch signed URLs and video metadata. */
  private videoService = inject(VideoService);

  /** Quality manager (network-adaptive and manual switching). */
  videoQualityService = inject(VideoQualityService);

  /** Currently active video (or null if none). */
  video = signal<Video | null>(null);

  /** Current playback time (in seconds). */
  currentTime = signal<number>(0);

  /**
   * Whether to resume from a saved time (true) or start from 0:00 (false)
   * for the *current* video session.
   */
  startSavedTime = signal<boolean>(false);

  /** The currently resolved signed URL for the active video. */
  defaultSource = signal<string>('');

  /**
   * Deduplication key to avoid sending identical signed URL requests
   * when both the video ID and quality are unchanged.
   */
  private lastReqKey = '';

  constructor() {
    /**
     * Reactive effect:
     * - Triggers when `video()` or `qualityIndex()` changes.
     * - Resolves a signed URL for the active video at the current quality.
     */
    effect(() => {
      const v = this.video();
      const qIndex = this.videoQualityService.qualityIndex();

      if (!v) {
        // No active video -> clear current source and allow future refetch for same id/quality
        this.defaultSource.set('');
        this.lastReqKey = ''; // important: enable a clean fetch next time
        return;
      }

      const quality = this.indexToQuality(qIndex);
      const reqKey = `${v.id}:${quality}`;

      // Prevent duplicate requests for the same (video, quality)
      if (this.lastReqKey === reqKey) return;
      this.lastReqKey = reqKey;

      // Request a fresh signed URL
      this.videoService
        .getSignedVideoUrl(v.id, quality)
        .pipe(take(1))
        .subscribe({
          next: ({ url }) => {
            this.defaultSource.set(url);
            this.videoQualityService.clearMessage();
            // eslint-disable-next-line no-console
            console.log('[VideoProgress] ✅ Signed video URL resolved:', url);
          },
          error: (err) => {
            // eslint-disable-next-line no-console
            console.error('[VideoProgress] ❌ Failed to fetch signed URL:', err);
            this.defaultSource.set('');
            this.lastReqKey = ''; // allow retry
          },
          complete: () => {
            // eslint-disable-next-line no-console
            console.log('[VideoProgress] ℹ️ URL fetch complete');
          },
        });
    }, { allowSignalWrites: true });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Update the current playback time (usually bound to `timeupdate`).
   * @param time Current playback position in seconds.
   */
  updateCurrentTime(time: number): void {
    this.currentTime.set(time);
  }

  /**
   * Persist the current playback position to localStorage for a given video ID.
   * @param videoId The video identifier.
   */
  saveVideoProgress(videoId: number): void {
    if (videoId && this.currentTime() > 0) {
      localStorage.setItem(`videoProgress_${videoId}`, this.currentTime().toString());
    }
  }

  /**
   * Load a persisted playback position from localStorage for a given video ID.
   * Sets both `currentTime` and `startSavedTime`.
   * @param videoId The video identifier.
   */
  loadVideoProgress(videoId: number): void {
    const savedTime = localStorage.getItem(`videoProgress_${videoId}`);
    this.currentTime.set(savedTime ? Number(savedTime) : 0);
    this.startSavedTime.set(!!savedTime);
  }

  /**
   * Switch the target quality by index (0..3).
   * 0 -> 120p, 1 -> 360p, 2 -> 720p, 3 -> 1080p
   * @param index Quality index (clamped to 0..3).
   */
  switchQuality(index: number): void {
    this.videoQualityService.qualityIndex.set(index);
  }

  /**
   * Reset all runtime state so the next playback session starts clean.
   * Safe for reuse across the app; does not affect other components unless called.
   */
  reset(): void {
    this.video.set(null);
    this.currentTime.set(0);
    this.startSavedTime.set(false);
    this.defaultSource.set('');
    this.lastReqKey = '';
  }

  /**
   * Begin playback for a given video **from the very beginning (0:00)**.
   * This disables resume for the current session and forces a fresh URL fetch.
   *
   * Use-case:
   * - Header component wants a "clean start" independent of the teaser's time.
   *
   * @param v The video to start.
   */
  beginFromStart(v: Video): void {
    // Disable resume and reset time for this session:
    this.startSavedTime.set(false);
    this.currentTime.set(0);

    // Invalidate dedup key to ensure a fresh signed-URL fetch even if id/quality looks the same:
    this.lastReqKey = '';

    // Setting the video triggers the effect() and fetches a new URL:
    this.video.set(v);
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /**
   * Quality index (0..3) → human-readable quality label.
   * @param index 0..3
   * @returns '120p' | '360p' | '720p' | '1080p'
   */
  private indexToQuality(index: number): Quality {
    return (['120p', '360p', '720p', '1080p'] as const)[Math.max(0, Math.min(3, index))];
  }
}
