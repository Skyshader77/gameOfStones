import { TestBed } from '@angular/core/testing';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { of, Subscription } from 'rxjs';
import { DebugModeService } from './debug-mode.service';

describe('DebugModeService', () => {
    let service: DebugModeService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameLogicSocketSpy: jasmine.SpyObj<GameLogicSocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        gameLogicSocketSpy = jasmine.createSpyObj('GameLogicSocketService', ['endAction']);
        myPlayerServiceSpy = jasmine.createSpyObj('MyPlayerService', ['isOrganizer'], {});

        TestBed.configureTestingModule({
            providers: [
                DebugModeService,
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: GameLogicSocketService, useValue: gameLogicSocketSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
            ],
        });

        service = TestBed.inject(DebugModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize()', () => {
        it('should start listening to debug mode changes', () => {
            const mockSubscription = new Subscription();
            socketServiceSpy.on.and.returnValue(of(true)); // Mock debug mode as `true`
            spyOn(service as any, 'listenToDebugMode').and.returnValue(mockSubscription);

            service.initialize();

            expect((service as any).listenToDebugMode).toHaveBeenCalled();
            expect((service as any).debugSubscription).toBe(mockSubscription);
        });
    });

    describe('cleanup()', () => {
        it('should unsubscribe from debug mode listener', () => {
            const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
            (service as any).debugSubscription = mockSubscription;

            service.cleanup();

            expect(mockSubscription.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('getDebug()', () => {
        it('should return the current debug state', () => {
            (service as any).debug = true;
            expect(service.getDebug()).toBeTrue();

            (service as any).debug = false;
            expect(service.getDebug()).toBeFalse();
        });
    });

    describe('toggleDebug()', () => {
        it('should emit DesireDebugMode if the player is the organizer', () => {
            myPlayerServiceSpy.isOrganizer.and.returnValue(true);

            service.toggleDebug();

            expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireDebugMode);
        });

        it('should not emit DesireDebugMode if the player is not the organizer', () => {
            myPlayerServiceSpy.isOrganizer.and.returnValue(false);

            service.toggleDebug();

            expect(socketServiceSpy.emit).not.toHaveBeenCalled();
        });
    });

    describe('teleport()', () => {
        it('should emit DesireTeleport and call endAction if debug mode is enabled and not fighting', () => {
            const destination: Vec2 = { x: 5, y: 10 };
            (service as any).debug = true;

            service.teleport(destination);

            expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Game, GameEvents.DesireTeleport, destination);
            expect(gameLogicSocketSpy.endAction).toHaveBeenCalled();
        });

        it('should not emit DesireTeleport if debug mode is disabled', () => {
            const destination: Vec2 = { x: 5, y: 10 };
            (service as any).debug = false;

            service.teleport(destination);

            expect(socketServiceSpy.emit).not.toHaveBeenCalled();
            expect(gameLogicSocketSpy.endAction).not.toHaveBeenCalled();
        });

        it('should not emit DesireTeleport if the player is fighting', () => {
            const destination: Vec2 = { x: 5, y: 10 };
            (service as any).debug = true;
            myPlayerServiceSpy.isFighting = true;

            service.teleport(destination);

            expect(socketServiceSpy.emit).not.toHaveBeenCalled();
            expect(gameLogicSocketSpy.endAction).not.toHaveBeenCalled();
        });
    });

    describe('listenToDebugMode()', () => {
        it('should update the debug state when DebugMode event is received', () => {
            socketServiceSpy.on.and.returnValue(of(true));

            const subscription = (service as any).listenToDebugMode();
            expect(subscription).toBeInstanceOf(Subscription);

            expect(socketServiceSpy.on).toHaveBeenCalledWith(Gateway.Game, GameEvents.DebugMode);
            expect((service as any).debug).toBeTrue();
        });
    });
});
