import { TestBed } from '@angular/core/testing';
import { LobbyPageComponent } from './lobby-page.component';

describe('LobbyPageComponent', () => {
    let component = LobbyPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LobbyPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
