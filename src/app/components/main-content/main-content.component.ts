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

/**
 * MainContentComponent
 *
 * Displays the main Videoflix content:
 * - grouped videos by category
 * - favorite videos row
 * - horizontal scroll with left/right arrows
 * - overlay video player trigger
 */
@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, VideoItemComponent, MainContentHeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit, AfterViewInit {
  /**
   * Template refs for category scroll containers.
   * Each container is tagged with data-category in the template.
   */
  scrollContainer = viewChildren<ElementRef>('scrollContainer');

  /**
   * Template refs for favorite videos scroll container.
   */
  favoriteScrollContainer = viewChildren<ElementRef>('favoriteScrollContainer');

  /** Controls visibility of the video overlay/player. */
  showVideo = signal(false);

  /** Indicates whether videos are currently being fetched from the API. */
  isFetching = signal(false);

  /** Holds the video selected for playback. */
  videoToPlay = signal<Video | undefined>(undefined);

  private readonly videosService = inject(VideoService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /** Signal with all loaded videos from the VideoService. */
  videos = this.videosService.loadedVideos;

  /** Signal with the currently authenticated user (from AuthService). */
  user = this.auth.currentUser;

  /**
   * Group videos by category.
   * Result shape: { [category: string]: Video[] }
   */
  groupedVideos = computed(() => {
    const list = this.videos() ?? [];
    return list.reduce<Record<string, Video[]>>((acc, v) => {
      (acc[v.category] ||= []).push(v);
      return acc;
    }, {});
  });

  /**
   * List of videos that are in the user's favorites.
   */
  favoriteVideos = computed(() => {
    const u = this.user();
    const list = this.videos() ?? [];
    const fav = u?.favorite_videos ?? [];
    return list.filter(v => fav.includes(v.id));
  });

  /**
   * Tracks which categories should show scroll arrows.
   * Example: { "Action": true, "Drama": false, "favorite": true }
   */
  visibleArrows = signal<Record<string, boolean>>({});

  /**
   * Initialize the component:
   * - start loading videos
   * - set loading state
   * - update arrow visibility after content is loaded.
   */
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

  /**
   * After view init, update arrow visibility once DOM refs are available.
   */
  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateArrowVisibility());
  }

  /**
   * Recalculate arrow visibility on window resize.
   */
  @HostListener('window:resize')
  onResize() {
    this.updateArrowVisibility();
  }

  /**
   * Determine for each category (and favorites) whether horizontal scroll
   * is needed and update the visibleArrows signal.
   */
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

  /**
   * Resolve the HTMLElement for a given category scroll container.
   */
  getCategoryScrollContainer(category: string): HTMLElement | null {
    const refs = this.scrollContainer();
    const ref = refs.find(
      (r) => r.nativeElement.getAttribute('data-category') === category
    );
    return ref ? ref.nativeElement : null;
  }

  /**
   * Scroll horizontally to the left for a given category or favorites.
   */
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

  /**
   * Scroll horizontally to the right for a given category or favorites.
   */
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

  /**
   * Handle click on a Video card: select the video and toggle the player overlay.
   */
  handleVideoClick(video: Video) {
    this.videoToPlay.set(video);
    this.showVideo.update(v => !v);
  }

  /**
   * Called when favorites change from child components.
   * Recalculates arrow visibility on the next microtask.
   */
  updateFavorite() {
    queueMicrotask(() => this.updateArrowVisibility());
  }
}
