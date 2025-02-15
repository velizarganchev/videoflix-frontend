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
  currentTimeUpdated = output<number>();
  startFromSavedTime = input<boolean>();
  syncTimeWithNetworkSpeed = signal<number>(0);


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

  player: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.player) {
      this.syncTimeWithNetworkSpeed.set(this.currentTime());
      this.updateSource(this.options().sources);
    }
  }

  private updateSource(sources: any[]): void {
    this.player.src(sources);
    this.player.load();

    // Warte auf Metadata, bevor Zeit gesetzt wird
    this.player.one('loadedmetadata', () => {
      this.safeSetCurrentTime(this.syncTimeWithNetworkSpeed());
    });
  }

  private safeSetCurrentTime(time: number): void {
    if (this.player && this.player.readyState() >= 1) {
      this.player.currentTime(time);
    }
  }

  ngAfterViewInit() {
    document.documentElement.style.setProperty('--video-height', this.customHeight() + 'vh');
    this.initializePlayer();
  }

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
  }

  private setInitialTime() {
    const targetTime = this.startFromSavedTime() ? this.currentTime() : 0;
    if (targetTime > 0 && this.player) {
      try {
        this.player.currentTime(targetTime);
      } catch (e) {
        console.error('Error setting time:', e);
      }
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}
