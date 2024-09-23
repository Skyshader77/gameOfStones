import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { Room } from '@app/interfaces/room';
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
class MockMapListComponent {}

@Component({
    selector: 'app-map-info',
    standalone: true,
    template: '',
})
class MockMapInfoComponent {}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let lobbyCreationSpy: SpyObj<LobbyCreationService>;
    let router: Router;
    const mockRoom: Room = {
        roomCode: 'ABCD',
    };

    beforeEach(async () => {
        lobbyCreationSpy = jasmine.createSpyObj('LobbyCreationService', [
            'initialize',
            'isSelectionValid',
            'isSelectionMaybeValid',
            'submitCreation',
        ]);

        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [{ provide: LobbyCreationService, useValue: lobbyCreationSpy }, provideRouter(routes)],
        })
            .overrideComponent(CreatePageComponent, {
                add: { imports: [MockMapListComponent, MockMapInfoComponent] },
                remove: { imports: [MapListComponent, MapInfoComponent] },
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

    it('shoud initialize the lobby creation service on init', () => {
        component.ngOnInit();
        expect(lobbyCreationSpy.initialize).toHaveBeenCalled();
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

    it('a valid lobby creation should redirect to the lobby', () => {
        spyOn(router, 'navigate');
        lobbyCreationSpy.submitCreation.and.returnValue(of(mockRoom));
        component.onSubmit();

        expect(router.navigate).toHaveBeenCalledWith(['/lobby', mockRoom.roomCode]);
    });

    it('an invalid lobby creation should show an error', () => {
        spyOn(component, 'manageError');
        lobbyCreationSpy.submitCreation.and.returnValue(of(null));
        component.onSubmit();

        expect(component.manageError).toHaveBeenCalled();
    });

    it('manage error should open the right modals', () => {
        spyOn(component.playerCreationModal.nativeElement, 'close');
        spyOn(component.errorModal.nativeElement, 'showModal');
        component.manageError();
        expect(component.playerCreationModal.nativeElement.close).toHaveBeenCalled();
        expect(component.errorModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('manage error should reinitialize the service', () => {
        component.manageError();
        expect(lobbyCreationSpy.initialize).toHaveBeenCalled();
    });

    /* Ajouter les tests des components */
});
