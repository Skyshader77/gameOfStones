import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { LobbyCreationService } from '@app/services/lobby-creation.service';
import { of } from 'rxjs';
import { CreatePageComponent } from './create-page.component';
import SpyObj = jasmine.SpyObj;

const routes: Route[] = [];

@Component({
    selector: 'app-map-list',
    standalone: true,
    template: '',
})
class MockMapList {}

@Component({
    selector: 'app-map-info',
    standalone: true,
    template: '',
})
class MockMapInfo {}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let lobbyCreationSpy: SpyObj<LobbyCreationService>;

    beforeEach(async () => {
        lobbyCreationSpy = jasmine.createSpyObj('LobbyCreationService', ['initialize', 'isSelectionValid']);

        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [{ provide: LobbyCreationService, useValue: lobbyCreationSpy }, provideRouter(routes)],
        })
            .overrideComponent(CreatePageComponent, {
                add: { imports: [MockMapList, MockMapInfo] },
                remove: { imports: [MapListComponent, MapInfoComponent] },
            })
            .compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('a valid map selection should open the player creation form modal', () => {
        spyOn(component.playerCreationModal.nativeElement, 'showModal');
        lobbyCreationSpy.isSelectionValid.and.returnValue(of(true));

        component.confirmMapSelection();
        expect(component.playerCreationModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('an invalid map selection should open the error modal', () => {
        spyOn(component.errorModal.nativeElement, 'showModal');
        lobbyCreationSpy.isSelectionValid.and.returnValue(of(false));

        component.confirmMapSelection();
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });
});
