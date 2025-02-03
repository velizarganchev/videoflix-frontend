import { AfterViewInit, Component, ElementRef, input, OnDestroy, OnInit, effect, viewChild } from '@angular/core';
import videojs from 'video.js';

@Component({
  selector: 'app-vjs-player',
  standalone: true,
  imports: [],
  templateUrl: './vjs-player.component.html',
  styleUrl: './vjs-player.component.scss'
})
export class VjsPlayerComponent implements OnInit, OnDestroy {

  target = viewChild('target', { read: ElementRef });
  customHeight = input.required<number>();
  qualityMessage = input<string>();

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

  constructor() {
    effect(() => {
      const options = this.options();
      if (this.player) {
        this.player.src(options.sources);
        this.player.load(); 
        // this.player.play(); // Starte die Wiedergabe (falls autoplay aktiviert ist)
      }
    });
  }

  ngOnInit() {
    console.log('VjsPlayerComponent initialized', this.options());
    document.documentElement.style.setProperty('--video-height', this.customHeight() + 'vh');

    this.player = videojs(this.target()?.nativeElement, this.options());
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}