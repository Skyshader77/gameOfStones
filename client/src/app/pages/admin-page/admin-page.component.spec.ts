import { TestBed } from '@angular/core/testing';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component = AdminPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
