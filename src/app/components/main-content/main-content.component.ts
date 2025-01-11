import { Component, ViewChild, ElementRef, input, inject, OnInit, DestroyRef, signal } from '@angular/core';
import { VideoItemComponent } from '../video-item/video-item.component';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.class';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [VideoItemComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  showVideo = signal<boolean>(false);
  isFetching = signal<boolean>(false);
  videosService = inject(VideoService);
  destroyRef = inject(DestroyRef);
  videos = this.videosService.loadedVideos;
  videoToPlay = signal<Video | undefined>(undefined);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.videosService.loadVideos().subscribe({
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.isFetching.set(false);
        console.log(this.videos());
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  handleVideoClick(showVideo: boolean, video: Video) {
    this.videoToPlay.set(video);
    this.showVideo.set(!this.showVideo());
  }

  // @ViewChildren('videoPosition') videoPositions!: QueryList<ElementRef>;

  // videoBoxes = [
  //     { videos: [/* Daten für VideoBox 1 */] },
  //     { videos: [/* Daten für VideoBox 2 */] },
  //     { videos: [/* Daten für VideoBox 3 */] },
  // ];

  // scrollRight(index: number): void {
  //     const videoPosition = this.videoPositions.toArray()[index];
  //     videoPosition.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  // }

  // scrollLeft(index: number): void {
  //     const videoPosition = this.videoPositions.toArray()[index];
  //     videoPosition.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  // }
}
