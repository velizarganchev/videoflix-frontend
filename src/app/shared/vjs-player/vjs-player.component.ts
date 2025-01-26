import { Component, ElementRef, input, viewChild } from '@angular/core';
import VideoJsPlayer  from 'video.js'

@Component({
  selector: 'app-vjs-player',
  standalone: true,
  imports: [],
  templateUrl: './vjs-player.component.html',
  styleUrl: './vjs-player.component.scss'
})
export class VjsPlayerComponent {
  target = viewChild<ElementRef>('target');

  options = input.required<{
    autoplay: boolean,
    sources: {
      src: string,
      type: string,
    }[],
  }>();

  // player: VideoJsPlayer | undefined;
}