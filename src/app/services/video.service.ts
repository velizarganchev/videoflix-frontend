import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { ErrorService } from './error.service';
import { Video } from '../models/video.class';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private videos = signal<Video[] | undefined>([]);
  loadedVideos = this.videos.asReadonly();

  private http = inject(HttpClient);
  private errorService = inject(ErrorService);

  private httpHeaders: HttpHeaders = new HttpHeaders({
    Authorization: 'Token ' + 'b0ab83d0c8f08d29f22371c9d979d487a9efcc14'
  });

  loadVideos() {
    return this.fetchVideos().pipe(
      tap({
        next: (videos) => {
          this.videos.set(videos);
        }
      })
    )
  }

  private fetchVideos() {
    return this.http.get<Video[]>('http://127.0.0.1:8000/api/content/', { headers: this.httpHeaders }).pipe(
      catchError((error) => {
        this.errorService.showError('Failed to fetch videos');
        return throwError(() => new Error('Failed to fetch videos'));
      })
    )
  }
}
