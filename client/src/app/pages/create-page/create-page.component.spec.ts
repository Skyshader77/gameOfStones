/* eslint-disable max-classes-per-file */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { LobbyCreationService } from '@app/services/lobby-creation.service';
import { of } from 'rxjs';
import { CreatePageComponent } from './create-page.component';
import SpyObj = jasmine.SpyObj;
import { mockRoom } from '@app/constants/tests.constants';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';

const routes: Route[] = [];

@Component({
    selector: 'app-map-list',
    standalone: true,
    template: '',
})
class MockMapListComponent {}

@Component({
    selector: 'app-map-info',
    standalone: true,
    template: '',
})
class MockMapInfoComponent {}

@Component({
    selector: 'app-player-creation',
    standalone: true,
    template: '',
})
class MockPlayerCreationComponent {}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let lobbyCreationSpy: SpyObj<LobbyCreationService>;
    let router: Router;

    beforeEach(async () => {
        lobbyCreationSpy = jasmine.createSpyObj('LobbyCreationService', ['initialize', 'isSelectionValid', 'isMapSelected', 'submitCreation']);

        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [{ provide: LobbyCreationService, useValue: lobbyCreationSpy }, provideRouter(routes)],
        })
            .overrideComponent(CreatePageComponent, {
                add: { imports: [MockMapListComponent, MockMapInfoComponent, MockPlayerCreationComponent] },
                remove: { imports: [MapListComponent, MapInfoComponent, PlayerCreationComponent] },
            })
            .compileComponents();

        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.debugElement.componentInstance;
        fixture.autoDetectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the lobby creation service on init', () => {
        component.ngOnInit();
        expect(lobbyCreationSpy.initialize).toHaveBeenCalled();
    });

    it('should open the player creation form modal for a valid map selected ', () => {
        spyOn(component.playerCreationModal.nativeElement, 'showModal');
        lobbyCreationSpy.isSelectionValid.and.returnValue(of(true));
        component.confirmMapSelection();
        expect(component.playerCreationModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should open the error modal for an invalid map selected ', () => {
        spyOn(component.errorModal.nativeElement, 'showModal');
        lobbyCreationSpy.isSelectionValid.and.returnValue(of(false));
        component.confirmMapSelection();
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should redirect to the lobby for a valid lobby creation ', () => {
        spyOn(router, 'navigate');
        lobbyCreationSpy.submitCreation.and.returnValue(of(mockRoom));
        component.onSubmit();
        expect(router.navigate).toHaveBeenCalledWith(['/lobby', mockRoom.roomCode]);
    });

    it('should show an error for an invalid lobby creation ', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const manageErrorSpy = spyOn<any>(component, 'manageError');
        lobbyCreationSpy.submitCreation.and.returnValue(of(null));
        component.onSubmit();
        expect(manageErrorSpy).toHaveBeenCalled();
    });

    it('should open the right modals with manageError', () => {
        spyOn(component.playerCreationModal.nativeElement, 'close');
        spyOn(component.errorModal.nativeElement, 'showModal');
        component['manageError']();
        expect(component.playerCreationModal.nativeElement.close).toHaveBeenCalled();
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should reinitialize the service with manageError', () => {
        component['manageError']();
        expect(lobbyCreationSpy.initialize).toHaveBeenCalled();
    });
});
