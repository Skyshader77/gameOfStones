import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextPlayerComponent } from './next-player.component';

describe('NextPlayerComponent', () => {
    let component: NextPlayerComponent;
    let fixture: ComponentFixture<NextPlayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NextPlayerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NextPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
