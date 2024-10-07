import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageDisplayComponent } from './chat-message-display.component';

describe('ChatMessageDisplayComponent', () => {
    let component: ChatMessageDisplayComponent;
    let fixture: ComponentFixture<ChatMessageDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChatMessageDisplayComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatMessageDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
