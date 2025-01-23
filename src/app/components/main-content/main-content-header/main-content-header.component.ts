import { Component, input } from '@angular/core';
import { Video } from '../../../models/video.class';

@Component({
  selector: 'app-main-content-header',
  standalone: true,
  imports: [],
  templateUrl: './main-content-header.component.html',
  styleUrl: './main-content-header.component.scss'
})
export class MainContentHeaderComponent {
  previewVideo = input.required<Video | undefined>();
}
