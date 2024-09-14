import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route } from '@angular/router';
import { CreatePageComponent } from './create-page.component';

const routes: Route[] = [];

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
