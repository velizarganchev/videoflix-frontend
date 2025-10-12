import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Video } from '../models/video.class';
import { AuthService } from './auth.service';

const BASE_URL = 'https://api.videoflix-velizar-ganchev-backend.com/content';
@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private videos = signal<Video[] | undefined>([]);
  loadedVideos = this.videos.asReadonly();

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);
  private authService = inject(AuthService);

  private httpHeaders: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  loadVideos(): Observable<Video[]> {
    return this.fetchVideos().pipe(
      tap({
        next: (videos) => {
          this.videos.set(videos);
        },
      })
    );
  }

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

  addToFavorite(video_id: number): Observable<number[]> {
    return this.storeFavoriteVideo(video_id).pipe(
      tap({
        next: (favoriteVideos: number[]) => {
          this.authService.updateUserFavoriteVideos(favoriteVideos);
        },
      })
    );
  }

  storeFavoriteVideo(video_id: number): Observable<number[]> {
    return this.http
      .post<number[]>(
        `${BASE_URL}/add-favorite/`,
        {
          video_id: video_id,
        },
        { headers: this.httpHeaders }
      )
      .pipe(
        catchError((error) => {
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
