import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VjsPlayerComponent } from './vjs-player.component';

describe('VjsPlayerComponent', () => {
  let component: VjsPlayerComponent;
  let fixture: ComponentFixture<VjsPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VjsPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VjsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
