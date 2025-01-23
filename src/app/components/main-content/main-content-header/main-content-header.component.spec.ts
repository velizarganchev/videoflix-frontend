import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainContentHeaderComponent } from './main-content-header.component';

describe('MainContentHeaderComponent', () => {
  let component: MainContentHeaderComponent;
  let fixture: ComponentFixture<MainContentHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainContentHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainContentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
