import { Component, ViewChild, ElementRef } from '@angular/core';
import { VideoItemComponent } from '../video-item/video-item.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [VideoItemComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;

  showVideo = false;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  handleVideoClick(videoId: number) {
    this.showVideo = !this.showVideo;
  }

  // @ViewChildren('videoPosition') videoPositions!: QueryList<ElementRef>;

  // videoBoxes = [
  //     { videos: [/* Daten für VideoBox 1 */] },
  //     { videos: [/* Daten für VideoBox 2 */] },
  //     { videos: [/* Daten für VideoBox 3 */] },
  // ];

  // scrollRight(index: number): void {
  //     const videoPosition = this.videoPositions.toArray()[index];
  //     videoPosition.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  // }

  // scrollLeft(index: number): void {
  //     const videoPosition = this.videoPositions.toArray()[index];
  //     videoPosition.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  // }
}
