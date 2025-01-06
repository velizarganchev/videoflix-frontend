import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss'
})
export class VideoItemComponent {
  @Output() videoClick = new EventEmitter<number>();

  handleBackClick(videoId: number) {
    this.videoClick.emit(videoId);
  }

}
