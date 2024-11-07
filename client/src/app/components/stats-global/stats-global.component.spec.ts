import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsGlobalComponent } from './stats-global.component';

describe('StatsGlobalComponent', () => {
    let component: StatsGlobalComponent;
    let fixture: ComponentFixture<StatsGlobalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsGlobalComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsGlobalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
