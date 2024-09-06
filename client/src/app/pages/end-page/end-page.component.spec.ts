import { TestBed } from '@angular/core/testing';
import { EndPageComponent } from './end-page.component';

describe('EndPageComponent', () => {
    let component = EndPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EndPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
