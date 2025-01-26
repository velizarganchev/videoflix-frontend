import { Component, input, signal } from '@angular/core';
import { Video } from '../../../models/video.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-content-header.component.html',
  styleUrl: './main-content-header.component.scss'
})
export class MainContentHeaderComponent {
  previewVideo = input.required<Video | undefined>();
  playVideo = signal<boolean>(false);

  handelPlay() {
    this.playVideo.set(!this.playVideo());
  }

  getVideoUrl(index: number): string | null {
    const video = this.previewVideo();
    return video?.converted_files?.[index]
      ? `http://127.0.0.1:8000${video.converted_files[index]}`
      : null;
  }

}
