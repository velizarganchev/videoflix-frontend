import { Component, effect, input, output } from '@angular/core';
import { Video } from '../../models/video.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-item.component.html',
  styleUrl: './video-item.component.scss'
})
export class VideoItemComponent {
  video = input<Video>();
  closeVideoClick = output<boolean>();

  constructor() {
    effect(() => {
      console.log('VideoItemComponent');
      console.log(this.video());
    });
  }

  handleBackClick(closeVideo: boolean) {
    this.closeVideoClick.emit(closeVideo);
  }

  getImageUrl(): string {
    const video = this.video();
    if (video && video.image_file) {
      return `http://127.0.0.1:8000${video.image_file}`;
    }
    return '';
  }

  getVideoUrl(index: number): string | null {
    const video = this.video();
    return video?.converted_files?.[index]
      ? `http://127.0.0.1:8000${video.converted_files[index]}`
      : null;
  }
}
