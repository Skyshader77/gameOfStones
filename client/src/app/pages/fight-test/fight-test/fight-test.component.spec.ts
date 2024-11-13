import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightTestComponent } from './fight-test.component';

describe('FightTestComponent', () => {
  let component: FightTestComponent;
  let fixture: ComponentFixture<FightTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FightTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FightTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
