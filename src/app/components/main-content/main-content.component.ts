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
} from '@angular/core';
import { VideoItemComponent } from '../video-item/video-item.component';
import { VideoService } from '../../services/video.service';
import { Video } from '../../models/video.class';
import { MainContentHeaderComponent } from "./main-content-header/main-content-header.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

/**
 * Main content component.
 *
 * Displays all video sections grouped by category and manages
 * favorite videos, scrolling behavior, and responsive UI updates.
 *
 * Responsibilities:
 * - Loads and groups videos by category.
 * - Displays favorites based on user profile.
 * - Controls horizontal scrolling and arrow visibility per section.
 * - Handles video playback state toggling.
 *
 * Selector: `app-main-content`
 * Standalone: `true`
 */
@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, VideoItemComponent, MainContentHeaderComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent implements OnInit, AfterViewChecked {
  /**
   * References to scrollable containers for each video category.
   * Used to control left/right scroll actions.
   */
  scrollContainer = viewChildren<ElementRef>('scrollContainer');

  /**
   * References to scrollable container for favorite videos section.
   */
  favoriteScrollContainer = viewChildren<ElementRef>('favoriteScrollContainer');

  /**
   * Signal indicating whether the video player overlay is visible.
   */
  showVideo = signal<boolean>(false);

  /**
   * Signal representing loading state during video fetching.
   */
  isFetching = signal<boolean>(false);

  /**
   * Holds the currently selected video for playback.
   */
  videoToPlay = signal<Video | undefined>(undefined);

  /**
   * Injected service responsible for loading and managing videos.
   */
  videosService = inject(VideoService);

  /**
   * Injected authentication service used to retrieve current user data.
   */
  userService = inject(AuthService);

  /**
   * Angular DestroyRef for automatic subscription cleanup.
   */
  destroyRef = inject(DestroyRef);

  /**
   * Computed list of loaded videos from the `VideoService`.
   */
  videos = computed(() => this.videosService.loadedVideos());

  /**
   * Signal containing all videos grouped by their category.
   * Key = category name, Value = array of videos.
   */
  groupedVideos = signal<{ [key: string]: Video[]; }>({});

  /**
   * Signal storing the current user's favorite videos.
   */
  favoriteVideos = signal<Video[]>([]);

  /**
   * Signal tracking which category carousels should display scroll arrows.
   * Key = category name, Value = boolean visibility flag.
   */
  visibleArrows = signal<{ [key: string]: boolean }>({});

  /**
   * Computed signal returning the authenticated user object.
   */
  user = computed(() => this.userService.getUser());

  /**
   * Lifecycle hook — initializes video data and sets up reactive states.
   *
   * - Fetches videos from `VideoService`.
   * - Groups them by category once loaded.
   * - Determines which categories require arrows.
   * - Filters favorite videos for the current user.
   * - Cleans up subscription on destroy.
   */
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

  /**
   * Lifecycle hook — executed after every view check.
   * Ensures arrow visibility stays accurate when layout updates occur.
   */
  ngAfterViewChecked(): void {
    this.updateArrowVisibility();
  }

  /**
   * Listens for window resize events and triggers re-evaluation of arrow visibility.
   *
   * @param event - Browser resize event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateArrowVisibility();
  }

  /**
   * Updates the list of favorite videos after a user action (like/unlike).
   */
  updateFavorite() {
    this.user = computed(() => this.userService.getUser());
    this.favoriteVideos.set(this.videos()!.filter(video => this.user()?.favorite_videos?.includes(video.id)));
  }

  /**
   * Updates the visibility of scroll arrows for each video category carousel.
   *
   * - Checks scrollable width vs. visible width for each container.
   * - Also includes logic for favorite videos section.
   */
  updateArrowVisibility() {
    const groupedVideos = this.groupedVideos();
    const newVisibility: { [key: string]: boolean } = {};

    Object.keys(groupedVideos).forEach(category => {
      const container = this.getCategoryScrollContainer(category);
      if (container) {
        newVisibility[category] = container.scrollWidth > container.clientWidth;
      }
    });

    // 🔹 Includes check for favorite videos section
    if (this.favoriteScrollContainer()) {
      const elements = this.favoriteScrollContainer();
      const elementRef = elements!.find((el) => el.nativeElement.getAttribute('data-category') === 'favorite');

      if (elementRef) {
        newVisibility['favorite'] = elementRef.nativeElement.scrollWidth > elementRef.nativeElement.clientWidth;
      }
    }

    this.visibleArrows.update(() => newVisibility);
  }

  /**
   * Returns the scroll container element corresponding to a given video category.
   *
   * @param category - The category name to locate.
   * @returns The HTML element of the scroll container, or `null` if not found.
   */
  getCategoryScrollContainer(category: string): HTMLElement | null {
    const elements = this.scrollContainer();
    const elementRef = elements.find((el) => el.nativeElement.getAttribute('data-category') === category);
    return elementRef ? elementRef.nativeElement : null;
  }

  /**
   * Scrolls the video list to the left for the specified category.
   *
   * @param category - Either a category name ('favorite') or index number.
   */
  scrollLeft(category: string | number) {
    if (category === 'favorite' && this.favoriteScrollContainer) {
      const favoriteContainer = this.favoriteScrollContainer().find(el => el.nativeElement.getAttribute('data-category') === 'favorite');
      favoriteContainer?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    } else {
      const container = this.scrollContainer().find((el, index) => index === category);
      container?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }

  /**
   * Scrolls the video list to the right for the specified category.
   *
   * @param category - Either a category name ('favorite') or index number.
   */
  scrollRight(category: string | number) {
    if (category === 'favorite' && this.favoriteScrollContainer) {
      const favoriteContainer = this.favoriteScrollContainer().find(el => el.nativeElement.getAttribute('data-category') === 'favorite');
      favoriteContainer?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    } else {
      const container = this.scrollContainer().find((el, index) => index === category);
      container?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }

  /**
   * Handles a click event on a video item.
   *
   * Toggles the video player overlay and sets the selected video.
   *
   * @param showVideo - Current visibility state of the video player.
   * @param video - The video object that was clicked.
   */
  handleVideoClick(showVideo: boolean, video: Video) {
    this.videoToPlay.set(video);
    this.showVideo.set(!this.showVideo());
  }

  /**
   * Groups videos by their category for easier rendering and scrolling.
   *
   * @param videos - Array of `Video` objects to group.
   * @returns An object where each key is a category and value is an array of videos in that category.
   */
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
