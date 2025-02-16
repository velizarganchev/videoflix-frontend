import { TestBed } from '@angular/core/testing';

import { VideoQualityService } from './video-quality.service';

describe('VideoQualityService', () => {
  let service: VideoQualityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoQualityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
