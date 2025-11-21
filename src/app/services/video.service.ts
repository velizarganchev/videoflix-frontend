import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Video } from '../models/video.class';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class VideoService {
  /**
   * Holds the list of loaded videos.
   * Updated via loadVideos(), read by components using loadedVideos signal.
   */
  private videos = signal<Video[] | undefined>([]);
  readonly loadedVideos = this.videos.asReadonly();

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);

  /** Base API root (no trailing slash). */
  private readonly api = environment.baseApiUrl.replace(/\/$/, '');

  /** Content API root: <api>/content */
  private readonly content = `${this.api}/content`;

  /**
   * Fetch all videos for the authenticated user.
   *
   * On success:
   *   - Saves the list into the `videos` signal.
   *
   * On error:
   *   - Shows a generic error toast.
   *   - Returns a failing Observable.
   */
  loadVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.content}/`, { withCredentials: true }).pipe(
      tap(v => this.videos.set(v)),
      catchError(() => {
        this.errorService.showError('Failed to fetch videos');
        return throwError(() => new Error('Failed to fetch videos'));
      })
    );
  }

  /**
   * Toggle a video in the user's favorites.
   *
   * POST /content/add-favorite/
   * Body: { video_id: number }
   *
   * Returns:
   *   - Updated list of favorite video IDs for the current user.
   */
  addToFavorite(video_id: number): Observable<number[]> {
    return this.http.post<number[]>(
      `${this.content}/add-favorite/`,
      { video_id },
      { withCredentials: true }
    ).pipe(
      catchError(() => {
        this.errorService.showError('Failed to store favorite video');
        return throwError(() => new Error('Failed to store favorite video'));
      })
    );
  }

  /**
   * Fetch a signed streaming URL for a given video and quality.
   *
   * GET /content/video-url/<id>/?quality=720p
   *
   * The backend returns either:
   *   - Public S3 URL
   *   - Presigned S3 URL
   *   - Absolute local MEDIA URL
   */
  getSignedVideoUrl(
    videoId: number,
    quality?: '120p' | '360p' | '720p' | '1080p'
  ): Observable<{ url: string }> {
    const q = quality ? `?quality=${quality}` : '';
    return this.http.get<{ url: string }>(
      `${this.content}/video-url/${videoId}/${q}`,
      { withCredentials: true }
    ).pipe(
      catchError(() => {
        this.errorService.showError('Failed to fetch signed video URL');
        return throwError(() => new Error('Failed to fetch signed video URL'));
      })
    );
  }
}
