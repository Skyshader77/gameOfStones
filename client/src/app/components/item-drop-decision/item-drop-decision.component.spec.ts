import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDropDecisionComponent } from './item-drop-decision.component';

describe('ItemDropDecisionComponent', () => {
    let component: ItemDropDecisionComponent;
    let fixture: ComponentFixture<ItemDropDecisionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemDropDecisionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemDropDecisionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
