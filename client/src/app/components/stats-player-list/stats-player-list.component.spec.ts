import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsPlayerListComponent } from './stats-player-list.component';

describe('StatsPlayerListComponent', () => {
    let component: StatsPlayerListComponent;
    let fixture: ComponentFixture<StatsPlayerListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatsPlayerListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(StatsPlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
