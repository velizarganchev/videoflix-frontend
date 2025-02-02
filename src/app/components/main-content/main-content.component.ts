import {
  Component,
  ElementRef,
  inject,
  OnInit,
  DestroyRef,
  signal,
  computed,
  viewChildren,
  AfterViewChecked,
  HostListener,
  viewChild,
} from '@angular/core';
import { VideoItemComponent } from '../video-item/video-item.component';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.class';
import { MainContentHeaderComponent } from "./main-content-header/main-content-header.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, VideoItemComponent, MainContentHeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit, AfterViewChecked {
  scrollContainer = viewChildren<ElementRef>('scrollContainer');
  favoriteScrollContainer = viewChildren<ElementRef>('favoriteScrollContainer');

  showVideo = signal<boolean>(false);
  isFetching = signal<boolean>(false);
  videoToPlay = signal<Video | undefined>(undefined);

  videosService = inject(VideoService);
  userService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  videos = computed(() => this.videosService.loadedVideos());
  groupedVideos = signal<{ [key: string]: Video[]; }>({});
  favoriteVideos = signal<Video[]>([]);
  visibleArrows = signal<{ [key: string]: boolean }>({});

  previewVideo = computed(() => this.videos()!.find(video => video.title === 'Breakout'));
  user = computed(() => this.userService.getUser());

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
        this.favoriteVideos.set(this.videos()!.filter(video => this.user()?.favorite_videos?.includes(video.id)));
      }
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  ngAfterViewChecked(): void {
    this.updateArrowVisibility();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateArrowVisibility();
  }

  updateFavorite() {
    this.user = computed(() => this.userService.getUser());
    this.favoriteVideos.set(this.videos()!.filter(video => this.user()?.favorite_videos?.includes(video.id)));
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

    // 🔹 Füge die Prüfung für Favorite Videos hinzu
    if (this.favoriteScrollContainer()) {
      const elements = this.favoriteScrollContainer();
      const elementRef = elements!.find((el) => el.nativeElement.getAttribute('data-category') === 'favorite');
      
      if (elementRef) {
        newVisibility['favorite'] = elementRef.nativeElement.scrollWidth > elementRef.nativeElement.clientWidth;
      }
    }

    this.visibleArrows.update(() => newVisibility);
  }

  getCategoryScrollContainer(category: string): HTMLElement | null {
    const elements = this.scrollContainer();
    const elementRef = elements.find((el) => el.nativeElement.getAttribute('data-category') === category);
    return elementRef ? elementRef.nativeElement : null;
  }

  scrollLeft(category: string | number) {
    if (category === 'favorite' && this.favoriteScrollContainer) {
      const favoriteContainer = this.favoriteScrollContainer().find(el => el.nativeElement.getAttribute('data-category') === 'favorite');
      favoriteContainer?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    } else {
      const container = this.scrollContainer().find((el, index) => index === category);
      container?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }
  
  scrollRight(category: string | number) {
    if (category === 'favorite' && this.favoriteScrollContainer) {
      const favoriteContainer = this.favoriteScrollContainer().find(el => el.nativeElement.getAttribute('data-category') === 'favorite');
      favoriteContainer?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    } else {
      const container = this.scrollContainer().find((el, index) => index === category);
      container?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    }
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
