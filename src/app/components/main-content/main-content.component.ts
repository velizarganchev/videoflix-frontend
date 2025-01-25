import {
  Component,
  ElementRef,
  inject,
  OnInit,
  DestroyRef,
  signal,
  computed,
  viewChildren,
  viewChild,
  AfterViewChecked
} from '@angular/core';
import { VideoItemComponent } from '../video-item/video-item.component';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.class';
import { MainContentHeaderComponent } from "./main-content-header/main-content-header.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, VideoItemComponent, MainContentHeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit, AfterViewChecked {
  scrollContainer = viewChild.required<ElementRef>('scrollContainer',);
  videoContentCategoryScroll = viewChildren<ElementRef>('scrollContainer');

  showVideo = signal<boolean>(false);
  isFetching = signal<boolean>(false);
  videoToPlay = signal<Video | undefined>(undefined);

  videosService = inject(VideoService);
  destroyRef = inject(DestroyRef);

  videos = computed(() => this.videosService.loadedVideos());
  groupedVideos = signal<{ [key: string]: Video[]; }>({});
  visibleArrows = signal<{ [key: string]: boolean }>({});

  previewVideo = computed(() => this.videos()!.find(video => video.title === 'Breakout'));

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.videosService.loadVideos().subscribe({
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.isFetching.set(false);
        this.groupedVideos.set(this.groupByCategory(this.videos()!));
        this.updateArrowVisibility();
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  ngAfterViewChecked(): void {
    this.updateArrowVisibility();
  }

  updateArrowVisibility() {
    const groupedVideos = this.groupedVideos();
    const newVisibility: { [key: string]: boolean } = {};

    Object.keys(groupedVideos).forEach(category => {
      const container = this.getCategoryScrollContainer(category);
      if (container) {
        newVisibility[category] = container.scrollWidth > container.clientWidth;
      }
    });

    this.visibleArrows.update(() => newVisibility);
    console.log(this.visibleArrows());

  }

  getCategoryScrollContainer(category: string): HTMLElement | null {
    const elements = this.videoContentCategoryScroll();
    const elementRef = elements.find((el) => el.nativeElement.getAttribute('data-category') === category);
    return elementRef ? elementRef.nativeElement : null;
  }

  scrollLeft() {
    this.scrollContainer().nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer().nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  handleVideoClick(showVideo: boolean, video: Video) {
    this.videoToPlay.set(video);
    this.showVideo.set(!this.showVideo());
  }

  private groupByCategory(videos: Video[]) {
    return videos.reduce((groups: { [key: string]: Video[] }, video: Video) => {
      const category = video.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(video);
      return groups;
    }, {});
  }
}
