import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Video } from '../models/video.class';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private videos = signal<Video[] | undefined>([]);
  loadedVideos = this.videos.asReadonly();

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);

  private readonly api = environment.baseApiUrl.replace(/\/$/, '');
  private readonly content = `${this.api}/content`;

  loadVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.content}/`, { withCredentials: true }).pipe(
      tap(v => this.videos.set(v)),
      catchError(() => {
        this.errorService.showError('Failed to fetch videos');
        return throwError(() => new Error('Failed to fetch videos'));
      })
    );
  }

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
