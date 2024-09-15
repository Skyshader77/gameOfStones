import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route } from '@angular/router';
import { LobbyCreationService } from '@app/services/lobby-creation.service';
import { CreatePageComponent } from './create-page.component';
import SpyObj = jasmine.SpyObj;

const routes: Route[] = [];

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let lobbyCreationSpy: SpyObj<LobbyCreationService>;

    beforeEach(async () => {
        lobbyCreationSpy = jasmine.createSpyObj('LobbyCreationService', ['initialize', 'isSelectionValid'], {
            mapList: [{ name: 'Mock Map 1' }, { name: 'Mock Map 2' }],
            selection: 0,
        });

        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [{ provide: LobbyCreationService, useValue: lobbyCreationSpy }, provideRouter(routes)],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
