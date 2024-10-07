import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndTurnButtonComponent } from './end-turn-button.component';

describe('EndTurnButtonComponent', () => {
  let component: EndTurnButtonComponent;
  let fixture: ComponentFixture<EndTurnButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndTurnButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndTurnButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
