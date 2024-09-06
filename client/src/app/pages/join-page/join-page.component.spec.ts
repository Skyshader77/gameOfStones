import { TestBed } from '@angular/core/testing';
import { JoinPageComponent } from './join-page.component';

describe('JoinPageComponent', () => {
    let component = JoinPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JoinPageComponent],
        }).compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
