import {
  Component,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
  output,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  signal
} from '@angular/core';
import videojs from 'video.js';

@Component({
  selector: 'app-vjs-player',
  standalone: true,
  imports: [],
  templateUrl: './vjs-player.component.html',
  styleUrl: './vjs-player.component.scss'
})
export class VjsPlayerComponent implements AfterViewInit, OnChanges, OnDestroy {

  target = viewChild<ElementRef>('target');
  customHeight = input.required<number>();
  qualityMessage = input<string>();
  currentTime = input<number>(0);
  videoId = input<number>(0);
  startFromSavedTime = input<boolean>();
  currentTimeUpdated = output<number>();

  syncTimeWithNetworkSpeed = signal<number>(0);
  player: any;
  private lastKnownTime = 0;
  private wasPaused = true;
  private lastSrc = '';

  ngAfterViewInit() {
    document.documentElement.style.setProperty('--video-height', this.customHeight() + 'vh');
    this.initializePlayer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.player) return;

    if (changes['options']) {
      this.capturePlaybackState();
      const sources = this.options().sources ?? [];
      const nextSrc = sources.length ? sources[0]?.src || '' : '';

      if (nextSrc && nextSrc !== this.lastSrc) {
        this.updateSource(sources);
      }
    }

    if (changes['currentTime'] && !changes['currentTime'].firstChange && this.player) {
      const t = this.currentTime();
      if (typeof t === 'number' && t >= 0 && Math.abs(this.player.currentTime() - t) > 0.5) {
        this.player.currentTime(t);
      }
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

  options = input.required<{
    preferFullWindow: boolean,
    playsinline: boolean,
    fluid: boolean,
    autoplay: boolean | string,
    muted: boolean,
    controls: boolean,
    playbackRates: number[],
    sources: {
      src: string | null,
      type: string,
    }[],
  }>();

  private initializePlayer() {
    if (!this.target()?.nativeElement) {
      console.error('Video element not found');
      return;
    }

    this.player = videojs(
      this.target()!.nativeElement,
      this.options()
    );

    this.player.ready(() => {
      this.setInitialTime();
    });

    this.player.on('timeupdate', () => {
      this.currentTimeUpdated.emit(this.player.currentTime());
    });

    this.player.on('error', () => {
      const err = this.player.error();
      console.error('video.js error:', err);
    });
  }

  private updateSource(sources: any[]): void {

    this.player.src(sources);
    this.player.load();

    const nextSrc = sources?.[0]?.src || '';
    this.lastSrc = nextSrc;
    if (nextSrc) {
      console.log('[vjs] switching to src:', nextSrc);
    }

    const restore = () => {
      const target = this.startFromSavedTime() ? (this.currentTime() || this.lastKnownTime) : this.lastKnownTime;

      if (this.player.readyState() >= 1 && typeof target === 'number' && target >= 0) {
        try {
          this.player.currentTime(target);
        } catch (e) {
          console.warn('Failed to set currentTime immediately, will retry on canplay', e);
        }
      }

      if (!this.wasPaused) {
        setTimeout(() => {
          this.player.play().catch(() => { /* ignore autoplay restrictions */ });
        }, 0);
      }
    };

    this.player.one('loadedmetadata', restore);
    this.player.one('canplay', restore);
  }

  private capturePlaybackState() {
    if (!this.player) return;
    try {
      this.lastKnownTime = Number.isFinite(this.player.currentTime()) ? this.player.currentTime() : 0;
      this.wasPaused = this.player.paused();
      this.syncTimeWithNetworkSpeed.set(this.lastKnownTime);
    } catch {
      this.lastKnownTime = 0;
      this.wasPaused = true;
    }
  }

  private setInitialTime() {
    const targetTime = this.startFromSavedTime() ? this.currentTime() : 0;
    if (typeof targetTime === 'number' && targetTime > 0) {
      try {
        this.player.currentTime(targetTime);
      } catch (e) {
        console.error('Error setting initial time:', e);
      }
    }
  }
}
