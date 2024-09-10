import { TestBed } from '@angular/core/testing';
import { EditPageComponent } from './edit-page.component';

describe('EditPageComponent', () => {
    const component = EditPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
