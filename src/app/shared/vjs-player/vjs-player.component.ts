import { AfterViewInit, Component, ElementRef, input, OnDestroy, OnInit, viewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

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

  ngOnInit() {
    document.documentElement.style.setProperty('--video-height', this.customHeight() + 'vh');
    this.player = videojs(this.target()?.nativeElement, this.options());
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }

}