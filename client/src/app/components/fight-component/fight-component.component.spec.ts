import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightComponentComponent } from './fight-component.component';

describe('FightComponentComponent', () => {
    let component: FightComponentComponent;
    let fixture: ComponentFixture<FightComponentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FightComponentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FightComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
