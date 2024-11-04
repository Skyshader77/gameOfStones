/* eslint-disable max-classes-per-file */

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { MapInfoComponent } from '@app/components/map-info/map-info.component';
import { MapListComponent } from '@app/components/map-list/map-list.component';
import { PlayerCreationComponent } from '@app/components/player-creation/player-creation.component';
import { MOCK_MAPS, MOCK_PLAYER_FORM_DATA_HP_ATTACK, MOCK_PLAYERS, MOCK_ROOM } from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { RoomCreationService } from '@app/services/room-services/room-creation.service';
import { RefreshService } from '@app/services/utilitary/refresh.service';
import { PlayerRole } from '@common/constants/player.constants';
import { of, Subject, Subscription } from 'rxjs';
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

@Component({
    selector: 'app-player-creation',
    standalone: true,
    template: '',
})
class MockPlayerCreationComponent {}

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let roomCreationSpy: SpyObj<RoomCreationService>;
    let playerCreationSpy: SpyObj<PlayerCreationService>;
    let myPlayerSpy: SpyObj<MyPlayerService>;
    let roomSocketSpy: SpyObj<RoomSocketService>;
    let refreshSpy: SpyObj<RefreshService>;
    let router: Router;

    let subject: Subject<Player>;
    beforeEach(async () => {
        roomCreationSpy = jasmine.createSpyObj('RoomCreationService', [
            'initialize',
            'isSelectionValid',
            'isMapSelected',
            'submitCreation',
            'handleRoomCreation',
        ]);

        playerCreationSpy = jasmine.createSpyObj('PlayerCreationService', ['createPlayer']);

        refreshSpy = jasmine.createSpyObj('RefreshService', ['setRefreshDetector']);

        roomSocketSpy = jasmine.createSpyObj('RoomSocketService', { listenForRoomJoined: of(null) });

        subject = new Subject<Player>();
        roomSocketSpy.listenForRoomJoined.and.returnValue(subject.asObservable());

        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', [], { role: PlayerRole.ORGANIZER });

        await TestBed.configureTestingModule({
            imports: [CreatePageComponent],
            providers: [
                { provide: RoomCreationService, useValue: roomCreationSpy },
                { provide: PlayerCreationService, useValue: playerCreationSpy },
                { provide: RefreshService, useValue: refreshSpy },
                { provide: RoomSocketService, useValue: roomSocketSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                provideRouter(routes),
            ],
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

    it('should initialize services and set the organizer role on init', () => {
        component.ngOnInit();
        expect(refreshSpy.setRefreshDetector).toHaveBeenCalled();
        expect(component['myPlayerService'].role).toEqual(PlayerRole.ORGANIZER);
        expect(roomCreationSpy.initialize).toHaveBeenCalled();
    });

    it('should navigate to the room URL when a player joins the room', fakeAsync(() => {
        spyOn(router, 'navigate');
        component.roomCode = MOCK_ROOM.roomCode;

        component.ngOnInit();

        subject.next(MOCK_PLAYERS[0]);

        expect(router.navigate).toHaveBeenCalledWith(['/room', component.roomCode]);
        expect(myPlayerSpy.myPlayer).toEqual(MOCK_PLAYERS[0]);
    }));

    it('should open the player creation form modal for a valid map selected ', () => {
        spyOn(component.playerCreationModal.nativeElement, 'showModal');
        roomCreationSpy.isSelectionValid.and.returnValue(of(true));
        component.confirmMapSelection();
        expect(component.playerCreationModal.nativeElement.showModal).toHaveBeenCalled();
    });

    it('should unsubscribe from joinEventListener on component destroy', () => {
        component.joinEventListener = new Subscription();
        spyOn(component.joinEventListener, 'unsubscribe');

        component.ngOnDestroy();
        expect(component.joinEventListener.unsubscribe).toHaveBeenCalled();
    });

    it('should manage the error for an invalid map selected ', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errorSpy = spyOn<any>(component, 'manageError');
        roomCreationSpy.isSelectionValid.and.returnValue(of(false));
        component.confirmMapSelection();
        expect(errorSpy).toHaveBeenCalled();
    });

    it('should call handleRoomCreation and redirect to the waiting room for a valid room creation ', () => {
        spyOn(router, 'navigate');
        roomCreationSpy.submitCreation.and.returnValue(of({ room: MOCK_ROOM, selectedMap: MOCK_MAPS[0] }));
        component.onSubmit(MOCK_PLAYER_FORM_DATA_HP_ATTACK);
        expect(refreshSpy.setRefreshDetector).toHaveBeenCalled();
    });

    it('should show an error for an invalid lobby creation ', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const manageErrorSpy = spyOn<any>(component, 'manageError');
        roomCreationSpy.submitCreation.and.returnValue(of({ room: null, selectedMap: null }));
        component.onSubmit(MOCK_PLAYER_FORM_DATA_HP_ATTACK);
        expect(manageErrorSpy).toHaveBeenCalled();
    });

    it('should open the right modals with manageError', () => {
        spyOn(component.playerCreationModal.nativeElement, 'close');
        component['manageError']();
        expect(component.playerCreationModal.nativeElement.close).toHaveBeenCalled();
    });

    it('should reinitialize the service with manageError', () => {
        component['manageError']();
        expect(roomCreationSpy.initialize).toHaveBeenCalled();
    });

    it('should call handleRoomCreation with the right parameters on valid room creation', () => {
        spyOn(router, 'navigate');
        playerCreationSpy.createPlayer.and.returnValue(MOCK_PLAYERS[0]);
        roomCreationSpy.submitCreation.and.returnValue(of({ room: MOCK_ROOM, selectedMap: MOCK_MAPS[0] }));
        component.onSubmit(MOCK_PLAYER_FORM_DATA_HP_ATTACK);
        expect(roomCreationSpy.handleRoomCreation).toHaveBeenCalledWith(MOCK_PLAYERS[0], MOCK_ROOM.roomCode, MOCK_MAPS[0]);
    });
});
