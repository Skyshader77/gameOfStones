import { TestBed } from '@angular/core/testing';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component = CreatePageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
