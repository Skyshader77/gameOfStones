import { TestBed } from '@angular/core/testing';
import { PlayerCreationPageComponent } from './player-creation-page.component';

describe('PlayerCreationPageComponent', () => {
    const component = PlayerCreationPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerCreationPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
