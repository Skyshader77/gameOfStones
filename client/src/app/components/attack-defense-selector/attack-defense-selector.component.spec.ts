import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackDefenseSelectorComponent } from './attack-defense-selector.component';

describe('AttackDefenseSelectorComponent', () => {
  let component: AttackDefenseSelectorComponent;
  let fixture: ComponentFixture<AttackDefenseSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttackDefenseSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttackDefenseSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
