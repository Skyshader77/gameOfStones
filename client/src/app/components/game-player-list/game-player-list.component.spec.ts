import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlayerListComponent } from './game-player-list.component';

describe('GamePlayerListComponent', () => {
    let component: GamePlayerListComponent;
    let fixture: ComponentFixture<GamePlayerListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GamePlayerListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
