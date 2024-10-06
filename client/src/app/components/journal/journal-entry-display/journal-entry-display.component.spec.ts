import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalEntryDisplayComponent } from './journal-entry-display.component';

describe('JournalEntryDisplayComponent', () => {
  let component: JournalEntryDisplayComponent;
  let fixture: ComponentFixture<JournalEntryDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalEntryDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalEntryDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
