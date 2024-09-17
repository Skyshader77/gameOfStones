import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCreationComponent } from './player-creation.component';

describe('PlayerCreationComponent', () => {
  let component: PlayerCreationComponent;
  let fixture: ComponentFixture<PlayerCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
