import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameChatComponent } from './chat.component';

describe('GameChatComponent', () => {
    let component: GameChatComponent;
    let fixture: ComponentFixture<GameChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GameChatComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
