import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsSelectorComponent } from './stats-selector.component';

describe('StatsSelectorComponent', () => {
    let component: StatsSelectorComponent;
    let fixture: ComponentFixture<StatsSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsSelectorComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
