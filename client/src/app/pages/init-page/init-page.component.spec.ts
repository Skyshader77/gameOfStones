import { TestBed } from '@angular/core/testing';
import { InitPageComponent } from './init-page.component';

describe('InitPageComponent', () => {
    let component = InitPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InitPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
