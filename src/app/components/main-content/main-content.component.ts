import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  AfterViewInit,
  DestroyRef,
  inject,
  signal,
  computed,
  viewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoItemComponent } from '../video-item/video-item.component';
import { MainContentHeaderComponent } from './main-content-header/main-content-header.component';
import { VideoService } from '../../services/video.service';
import { AuthService } from '../../services/auth.service';
import { Video } from '../../models/video.class';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, VideoItemComponent, MainContentHeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit, AfterViewInit {
  scrollContainer = viewChildren<ElementRef>('scrollContainer');
  favoriteScrollContainer = viewChildren<ElementRef>('favoriteScrollContainer');

  showVideo = signal(false);
  isFetching = signal(false);
  videoToPlay = signal<Video | undefined>(undefined);

  private readonly videosService = inject(VideoService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  videos = this.videosService.loadedVideos;
  user = this.auth.currentUser;

  groupedVideos = computed(() => {
    const list = this.videos() ?? [];
    return list.reduce<Record<string, Video[]>>((acc, v) => {
      (acc[v.category] ||= []).push(v);
      return acc;
    }, {});
  });

  favoriteVideos = computed(() => {
    const u = this.user();
    const list = this.videos() ?? [];
    const fav = u?.favorite_videos ?? [];
    return list.filter(v => fav.includes(v.id));
  });


  visibleArrows = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.videosService.loadVideos().subscribe({
      error: (e) => console.error(e),
      complete: () => {
        this.isFetching.set(false);
        queueMicrotask(() => this.updateArrowVisibility());
      },
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateArrowVisibility());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateArrowVisibility();
  }
  updateArrowVisibility() {
    const grouped = this.groupedVideos();
    const next: Record<string, boolean> = {};

    Object.keys(grouped).forEach((category) => {
      const el = this.getCategoryScrollContainer(category);
      if (el) next[category] = el.scrollWidth > el.clientWidth;
    });

    const favRefs = this.favoriteScrollContainer();
    if (favRefs?.length) {
      const fav = favRefs.find(
        (r) => r.nativeElement.getAttribute('data-category') === 'favorite'
      );
      if (fav) next['favorite'] = fav.nativeElement.scrollWidth > fav.nativeElement.clientWidth;
    }

    this.visibleArrows.set(next);
  }

  getCategoryScrollContainer(category: string): HTMLElement | null {
    const refs = this.scrollContainer();
    const ref = refs.find(
      (r) => r.nativeElement.getAttribute('data-category') === category
    );
    return ref ? ref.nativeElement : null;
  }

  scrollLeft(category: string | number) {
    if (category === 'favorite') {
      const fav = this.favoriteScrollContainer()
        .find(r => r.nativeElement.getAttribute('data-category') === 'favorite');
      fav?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
      return;
    }
    const ref = this.scrollContainer().find((_, i) => i === category);
    ref?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight(category: string | number) {
    if (category === 'favorite') {
      const fav = this.favoriteScrollContainer()
        .find(r => r.nativeElement.getAttribute('data-category') === 'favorite');
      fav?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
      return;
    }
    const ref = this.scrollContainer().find((_, i) => i === category);
    ref?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  handleVideoClick(video: Video) {
    this.videoToPlay.set(video);
    this.showVideo.update(v => !v);
  }

  updateFavorite() {
    queueMicrotask(() => this.updateArrowVisibility());
  }
}
