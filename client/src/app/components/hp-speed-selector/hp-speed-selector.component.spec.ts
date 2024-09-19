import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HpSpeedSelectorComponent } from './hp-speed-selector.component';

describe('HpSpeedSelectorComponent', () => {
  let component: HpSpeedSelectorComponent;
  let fixture: ComponentFixture<HpSpeedSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HpSpeedSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HpSpeedSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
