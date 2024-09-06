import { TestBed } from '@angular/core/testing';
import { PlayPageComponent } from './play-page.component';

describe('PlayPageComponent', () => {
    let component = PlayPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
