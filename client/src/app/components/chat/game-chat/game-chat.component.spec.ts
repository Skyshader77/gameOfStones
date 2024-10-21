import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameChatComponent } from './game-chat.component';
import { DisplayMode } from '@app/constants/chat.constants';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { JournalComponent } from '@app/components/chat/journal/journal.component';
import { DatePipe } from '@angular/common';

describe('GameChatComponent', () => {
    let component: GameChatComponent;
    let fixture: ComponentFixture<GameChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameChatComponent, ChatComponent, JournalComponent, DatePipe],
        }).compileComponents();

        fixture = TestBed.createComponent(GameChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize displayMode to CHAT', () => {
        expect(component.displayMode).toBe(DisplayMode.CHAT);
    });

    it('should toggle displayMode to JOURNAL, and then back to CHAT', () => {
        component.toggleDisplay();
        expect(component.displayMode).toBe(DisplayMode.JOURNAL);
        component.toggleDisplay();
        expect(component.displayMode).toBe(DisplayMode.CHAT);
    });
});
