import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Video } from '../models/video.class';
import { AuthService } from './auth.service';

const BASE_URL = 'https://api.videoflix-velizar-ganchev-backend.com/content';

/**
 * Video Service
 * -------------
 * Provides video-related operations for the Videoflix platform.
 *
 * Responsibilities:
 * - Fetching available videos from the backend.
 * - Managing video state with reactive signals.
 * - Handling favorite video operations.
 * - Fetching signed S3 URLs for secure video streaming.
 */
@Injectable({
  providedIn: 'root',
})
export class VideoService {
  /**
   * Internal signal holding the list of loaded videos.
   */
  private videos = signal<Video[] | undefined>([]);

  /**
   * Readonly signal exposing the currently loaded videos.
   * Used across components to display video lists reactively.
   */
  loadedVideos = this.videos.asReadonly();

  /**
   * Injected HTTP client for API communication.
   */
  private http = inject(HttpClient);

  /**
   * Global error service for displaying user-friendly messages.
   */
  private errorService = inject(ErrorService);

  /**
   * Authentication service, used for syncing user favorites.
   */
  private authService = inject(AuthService);

  /**
   * Standard HTTP headers used in all video API requests.
   */
  private httpHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  /**
   * Loads all available videos from the backend and updates the local state.
   *
   * @returns Observable emitting an array of `Video` objects.
   *
   * @example
   * this.videoService.loadVideos().subscribe();
   */
  loadVideos(): Observable<Video[]> {
    return this.fetchVideos().pipe(
      tap({
        next: (videos) => {
          this.videos.set(videos);
        },
      })
    );
  }

  /**
   * Internal helper to fetch videos from the backend API.
   *
   * @returns Observable emitting an array of `Video` objects.
   * @private
   */
  private fetchVideos(): Observable<Video[]> {
    return this.http
      .get<Video[]>(`${BASE_URL}`, { headers: this.httpHeaders })
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to fetch videos');
          return throwError(() => new Error('Failed to fetch videos'));
        })
      );
  }

  /**
   * Adds a video to the user's list of favorites.
   *
   * Automatically updates the `AuthService` user state with new favorites.
   *
   * @param video_id - The ID of the video to be added to favorites.
   * @returns Observable emitting the updated list of favorite video IDs.
   *
   * @example
   * this.videoService.addToFavorite(5).subscribe();
   */
  addToFavorite(video_id: number): Observable<number[]> {
    return this.storeFavoriteVideo(video_id).pipe(
      tap({
        next: (favoriteVideos: number[]) => {
          this.authService.updateUserFavoriteVideos(favoriteVideos);
        },
      })
    );
  }

  /**
   * Sends a POST request to the backend to store a video as a user favorite.
   *
   * @param video_id - The ID of the video to be stored.
   * @returns Observable emitting the updated array of favorite video IDs.
   *
   * @private
   */
  storeFavoriteVideo(video_id: number): Observable<number[]> {
    return this.http
      .post<number[]>(
        `${BASE_URL}/add-favorite/`,
        { video_id: video_id },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to store favorite video');
          return throwError(() => new Error('Failed to store favorite video'));
        })
      );
  }

  /**
   * Retrieves a signed S3 URL for a specific video and quality level.
   *
   * Used for secure streaming — URLs are short-lived and access-controlled.
   *
   * @param videoId - The ID of the requested video.
   * @param quality - Optional video quality (`'120p' | '360p' | '720p' | '1080p'`).
   * @returns Observable emitting an object containing the signed video URL.
   *
   * @example
   * this.videoService.getSignedVideoUrl(12, '720p').subscribe(({ url }) => {
   *   player.src({ src: url });
   * });
   */
  getSignedVideoUrl(
    videoId: number,
    quality?: '120p' | '360p' | '720p' | '1080p'
  ): Observable<{ url: string }> {
    const q = quality ? `?quality=${quality}` : '';
    return this.http
      .get<{ url: string }>(`${BASE_URL}/video-url/${videoId}/${q}/`)
      .pipe(
        catchError((error) => {
          this.errorService.showError('Failed to fetch signed video URL');
          return throwError(() => new Error('Failed to fetch signed video URL'));
        })
      );
  }
}
