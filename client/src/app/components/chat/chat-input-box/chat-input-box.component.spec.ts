import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputBoxComponent } from './chat-input-box.component';

describe('ChatInputBoxComponent', () => {
  let component: ChatInputBoxComponent;
  let fixture: ComponentFixture<ChatInputBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInputBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInputBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
