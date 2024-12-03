/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ROOM_CLOSED_MESSAGE } from '@app/constants/init-page-redirection.constants';
import { MOCK_PLAYER_INFO, MOCK_PLAYER_RENDER_INFO, MOCK_PLAYER_STARTS_TESTS, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { AudioService } from '@app/services/audio/audio.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { PlayerCreationService } from '@app/services/player-creation-services/player-creation.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message/modal-message.service';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { RoomEvents } from '@common/enums/sockets-events/room.events';
import { DeadPlayerPayload } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Observable, of } from 'rxjs';
import { PlayerListService } from './player-list.service';

describe('PlayerListService', () => {
    let service: PlayerListService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let modalMessageServiceSpy: jasmine.SpyObj<ModalMessageService>;
    let audioSpy: jasmine.SpyObj<AudioService>;
    let playerCreationService: jasmine.SpyObj<PlayerCreationService>;
    let mockPlayers: Player[];

    beforeEach(() => {
        mockPlayers = JSON.parse(JSON.stringify(MOCK_PLAYERS));
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);
        socketServiceSpy.on.and.returnValue(of([MOCK_PLAYERS[0]]));
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        myPlayerServiceSpy = jasmine.createSpyObj('MyPlayerService', ['getUserName'], { isCurrentPlayer: false });
        modalMessageServiceSpy = jasmine.createSpyObj('ModalMessageService', ['setMessage']);
        audioSpy = jasmine.createSpyObj('AudioService', ['playSfx']);
        playerCreationService = jasmine.createSpyObj('PlayerCreationService', ['createInitialRenderInfo']);
        TestBed.configureTestingModule({
            providers: [
                PlayerListService,
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ModalMessageService, useValue: modalMessageServiceSpy },
                { provide: AudioService, useValue: audioSpy },
                { provide: PlayerCreationService, useValue: playerCreationService },
            ],
        });

        service = TestBed.inject(PlayerListService);
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        service.playerList = [
            { playerInfo: { userName: 'Player1' }, playerInGame: { hasAbandoned: false } } as Player,
            { playerInfo: { userName: 'Player2' }, playerInGame: { hasAbandoned: false } } as Player,
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should find the correct player based on teleportInfo.playerName', () => {
        service.playerList = mockPlayers;
        const mockTeleportInfo = {
            playerName: 'Player 2',
            destination: { x: 10, y: 10 },
        };
        const teleportObservable = of(mockTeleportInfo);
        socketServiceSpy.on.and.returnValue(teleportObservable);
        service['listenPlayerTeleport']();
        const updatedPlayer = service.playerList.find((player) => player.playerInfo.userName === mockTeleportInfo.playerName);
        expect(updatedPlayer).toBeDefined();
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        expect(updatedPlayer!.playerInGame.currentPosition).toEqual(mockTeleportInfo.destination);
    });

    it('should set player.renderInfo when the player role is AI', () => {
        playerCreationService.createInitialRenderInfo.and.returnValue(JSON.parse(JSON.stringify(MOCK_PLAYER_RENDER_INFO)));
        const mockPlayer = {
            playerInfo: { role: PlayerRole.AggressiveAI },
            renderInfo: null,
        } as unknown as Player;
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.Room && event === RoomEvents.AddPlayer) {
                return of(mockPlayer as unknown as string as T);
            }
            return of();
        });
        (service as any).listenPlayerAdded();
        expect(mockPlayer.renderInfo).toEqual(JSON.parse(JSON.stringify(MOCK_PLAYER_RENDER_INFO)));
        expect(playerCreationService.createInitialRenderInfo).toHaveBeenCalled();
    });

    it('should not set player.renderInfo when the player role is not AI', () => {
        const mockPlayer = {
            playerInfo: { role: PlayerRole.Human },
            renderInfo: null,
        } as unknown as Player;
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.Room && event === RoomEvents.AddPlayer) {
                return of(mockPlayer as unknown as string as T);
            }
            return of();
        });
        (service as any).listenPlayerAdded();
        expect(mockPlayer.renderInfo).toBeNull();
        expect(playerCreationService.createInitialRenderInfo).not.toHaveBeenCalled();
    });

    it('should return true if a player is on the given tile', () => {
        const mockPlayerList: Player[] = [
            {
                playerInGame: {
                    currentPosition: { x: 2, y: 3 },
                },
            } as Player,
            {
                playerInGame: {
                    currentPosition: { x: 5, y: 6 },
                },
            } as Player,
        ];
        service.playerList = mockPlayerList;
        const tileToCheck: Vec2 = { x: 2, y: 3 };
        expect(service.isPlayerOnTile(tileToCheck)).toBeTrue();
    });

    it('should return false if no player is on the given tile', () => {
        const mockPlayerList: Player[] = [
            {
                playerInGame: {
                    currentPosition: { x: 2, y: 3 },
                },
            } as Player,
            {
                playerInGame: {
                    currentPosition: { x: 5, y: 6 },
                },
            } as Player,
        ];
        service.playerList = mockPlayerList;
        const tileToCheck: Vec2 = { x: 8, y: 9 };
        expect(service.isPlayerOnTile(tileToCheck)).toBeFalse();
    });

    it('should return true if current player is AI with AggressiveAI role', () => {
        spyOn(service, 'getCurrentPlayer').and.returnValue({
            playerInfo: MOCK_PLAYER_INFO[1],
            playerInGame: { ...MOCK_PLAYER_IN_GAME, inventory: [ItemType.Flag] },
            renderInfo: MOCK_PLAYER_RENDER_INFO,
        });
        expect(service.isCurrentPlayerAI()).toBeTrue();
    });

    it('should return false if current player is not AI (Human role)', () => {
        spyOn(service, 'getCurrentPlayer').and.returnValue({
            playerInfo: MOCK_PLAYER_INFO[2],
            playerInGame: { ...MOCK_PLAYER_IN_GAME, inventory: [ItemType.Flag] },
            renderInfo: MOCK_PLAYER_RENDER_INFO,
        });
        expect(service.isCurrentPlayerAI()).toBeFalse();
    });

    it('should return false if current player is not AI (Organizer role)', () => {
        spyOn(service, 'getCurrentPlayer').and.returnValue({
            playerInfo: MOCK_PLAYER_INFO[0],
            playerInGame: { ...MOCK_PLAYER_IN_GAME, inventory: [ItemType.Flag] },
            renderInfo: MOCK_PLAYER_RENDER_INFO,
        });
        expect(service.isCurrentPlayerAI()).toBeFalse();
    });

    it('should return true if the player has a flag in their inventory', () => {
        const player: Player = {
            playerInfo: MOCK_PLAYER_INFO[0],
            playerInGame: { ...MOCK_PLAYER_IN_GAME, inventory: [ItemType.Flag] },
            renderInfo: MOCK_PLAYER_RENDER_INFO,
        };
        const result = service.hasFlag(player);
        expect(result).toBeTrue();
    });

    it('should return false if the player does not have a flag in their inventory', () => {
        const player: Player = {
            playerInfo: MOCK_PLAYER_INFO[1],
            playerInGame: { ...MOCK_PLAYER_IN_GAME, inventory: [] },
            renderInfo: MOCK_PLAYER_RENDER_INFO,
        };
        const result = service.hasFlag(player);
        expect(result).toBeFalse();
    });

    it('should return undefined when the player does not exist', () => {
        const player = service.getPlayerByName('player3');
        expect(player).toBeUndefined();
    });

    it('should emit DesireKickPlayer event when removePlayer is called', () => {
        const playerNameToRemove = 'Player 1';
        service.removePlayer(playerNameToRemove);
        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.Room, RoomEvents.DesireKickPlayer, playerNameToRemove);
    });

    it('should not remove the specified player from playerList when that player has abandonned', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.Game && event === GameEvents.PlayerAbandoned) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service['listenToPlayerAbandon']();
        expect(service.playerList.length).toBe(2);
        expect(service.playerList.some((player) => player.playerInfo.userName === 'Player1')).toBeTrue();
        expect(service.playerList.some((player) => player.playerInGame.hasAbandoned)).toBeTrue();
    });

    it('should remove the specified player from playerList when that player has been kicked out', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.Room && event === RoomEvents.RemovePlayer) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service['listenPlayerRemoved']();
        expect(service.playerList.length).toBe(1);
        expect(service.playerList.some((player) => player.playerInfo.userName === 'Player1')).toBeFalse();
    });

    it('should navigate to /init and display kicked message if current player is removed', () => {
        socketServiceSpy.on.and.callFake(<T>(gateway: Gateway, event: string): Observable<T> => {
            if (gateway === Gateway.Room && event === RoomEvents.RemovePlayer) {
                return of('Player1' as string as T);
            }
            return of(null as unknown as T);
        });
        myPlayerServiceSpy.getUserName.and.returnValue('Player1');
        service['listenPlayerRemoved']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
    });

    it('should update currentPlayerName and remainingActions if the player exists', () => {
        service.playerList = [mockPlayers[0], mockPlayers[1], mockPlayers[2]];
        mockPlayers[0].playerInGame.remainingActions = 0;
        myPlayerServiceSpy.getUserName.and.returnValue(mockPlayers[0].playerInfo.userName);
        service.updateCurrentPlayer(mockPlayers[0].playerInfo.userName);
        expect(service.currentPlayerName).toBe(mockPlayers[0].playerInfo.userName);
        expect(mockPlayers[0].playerInGame.remainingActions).toBe(1);
    });

    it('should set isCurrentPlayer to false when currentPlayer does not match username', () => {
        myPlayerServiceSpy.getUserName.and.returnValue(mockPlayers[0].playerInfo.userName);
        service.updateCurrentPlayer(mockPlayers[1].playerInfo.userName);
        expect(service.currentPlayerName).toBe(mockPlayers[1].playerInfo.userName);
        expect(myPlayerServiceSpy.isCurrentPlayer).toBeFalse();
    });

    it('should not change remainingActions if the current player does not exist', () => {
        service.playerList = [mockPlayers[1]];
        myPlayerServiceSpy.getUserName.and.returnValue(mockPlayers[1].playerInfo.userName);
        service.updateCurrentPlayer(mockPlayers[2].playerInfo.userName);
        expect(mockPlayers[2].playerInGame.remainingActions).toBe(1);
    });

    it('should emit the provided username on removal confirmation', () => {
        const confirmationSpy = jasmine.createSpy();
        service.removalConfirmation$.subscribe(confirmationSpy);
        service.askPlayerRemovalConfirmation(mockPlayers[0].playerInfo.userName);
        expect(confirmationSpy).toHaveBeenCalledWith(mockPlayers[0].playerInfo.userName);
    });

    it('should return the current player when they exist in the player list', () => {
        service.playerList = [mockPlayers[0], mockPlayers[1]];
        service.currentPlayerName = mockPlayers[0].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toEqual(mockPlayers[0]);
    });

    it('should return undefined when the current player does not exist in the player list', () => {
        service.playerList = [mockPlayers[0], mockPlayers[1]];
        service.currentPlayerName = mockPlayers[2].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toBeUndefined();
    });

    it('should return undefined when the player list is empty', () => {
        service.playerList = [];
        service.currentPlayerName = mockPlayers[0].playerInfo.userName;
        const currentPlayer = service.getCurrentPlayer();
        expect(currentPlayer).toBeUndefined();
    });

    it('should return 0 if playerList is null or undefined', () => {
        service.playerList = null as unknown as Player[];
        expect(service.getPlayerListCount()).toBe(0);
        service.playerList = undefined as unknown as Player[];
        expect(service.getPlayerListCount()).toBe(0);
    });

    it('should return the count of players who have not abandoned', () => {
        service.playerList = [{ playerInGame: { hasAbandoned: false } } as Player, { playerInGame: { hasAbandoned: false } } as Player];
        expect(service.getPlayerListCount()).toBe(2);
        service.playerList = [{ playerInGame: { hasAbandoned: false } } as Player, { playerInGame: { hasAbandoned: true } } as Player];
        expect(service.getPlayerListCount()).toBe(1);
        service.playerList = [{ playerInGame: { hasAbandoned: true } } as Player, { playerInGame: { hasAbandoned: true } } as Player];
        expect(service.getPlayerListCount()).toBe(0);
    });

    it('should update playerList when receiving player list updates from the socket', () => {
        socketServiceSpy.on.and.returnValue(of(mockPlayers));
        const subscription = service['listenPlayerList']();
        expect(service.playerList).toEqual(mockPlayers);
        subscription.unsubscribe();
    });

    it('should add a player to playerList when a player is added via the socket', () => {
        socketServiceSpy.on.and.returnValue(of(mockPlayers[0]));
        const subscription = service['listenPlayerAdded']();
        expect(service.playerList).toContain(mockPlayers[0]);
        subscription.unsubscribe();
    });

    it('should navigate to /init and set a room closed message when the room is closed', () => {
        const roomClosedEvent = of(void 0);
        socketServiceSpy.on.and.returnValue(roomClosedEvent);
        const subscription = service['listenRoomClosed']();
        expect(modalMessageServiceSpy.setMessage).toHaveBeenCalledWith(ROOM_CLOSED_MESSAGE);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/init']);
        subscription.unsubscribe();
    });

    it('should return the remaining actions of the current player', () => {
        service.currentPlayerName = mockPlayers[0].playerInfo.userName;
        service.playerList = [mockPlayers[0], mockPlayers[1]];
        const actions = service.actionsLeft();
        expect(actions).toBe(mockPlayers[0].playerInGame.remainingActions);
    });

    it('should return 0 if current player is not found in the player list', () => {
        service.currentPlayerName = mockPlayers[2].playerInfo.userName;
        service.playerList = [mockPlayers[0], mockPlayers[1]];
        const actions = service.actionsLeft();
        expect(actions).toBe(0);
    });

    it('should update playerList with correct start and current positions for players', () => {
        service.playerList = [JSON.parse(JSON.stringify(mockPlayers[0])), JSON.parse(JSON.stringify(mockPlayers[1]))];
        service.preparePlayersForGameStart(JSON.parse(JSON.stringify(MOCK_PLAYER_STARTS_TESTS)));
        expect(service.playerList[0].playerInGame.startPosition).toEqual({ x: 1, y: 1 });
        expect(service.playerList[0].playerInGame.currentPosition).toEqual({ x: 1, y: 1 });
        expect(service.playerList[1].playerInGame.startPosition).toEqual({ x: 6, y: 6 });
        expect(service.playerList[1].playerInGame.currentPosition).toEqual({ x: 6, y: 6 });
    });

    it('should set myPlayerService.myPlayer when the player matches the current player', () => {
        const currentUserName = mockPlayers[0].playerInfo.userName;
        myPlayerServiceSpy.getUserName.and.returnValue(currentUserName);
        service.playerList = [JSON.parse(JSON.stringify(mockPlayers[0])), JSON.parse(JSON.stringify(mockPlayers[1]))];
        service.preparePlayersForGameStart(JSON.parse(JSON.stringify(MOCK_PLAYER_STARTS_TESTS)));
        expect(myPlayerServiceSpy.myPlayer).toEqual(service.playerList[0]);
    });

    it('should update the position of players based on the deadPlayers data', () => {
        const deadPlayers: DeadPlayerPayload[] = [
            {
                player: { playerInfo: { userName: 'Player1' } } as Player,
                respawnPosition: { x: 3, y: 3 },
            },
            {
                player: { playerInfo: { userName: 'Player2' } } as Player,
                respawnPosition: { x: 5, y: 5 },
            },
        ];
        service.playerList = [
            { playerInfo: { userName: 'Player1' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
            { playerInfo: { userName: 'Player2' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
        ];

        service.handleDeadPlayers(deadPlayers);
        expect(service.playerList[0].playerInGame.currentPosition).toEqual({ x: 3, y: 3 });
        expect(service.playerList[1].playerInGame.currentPosition).toEqual({ x: 5, y: 5 });
    });

    it('should not update any positions if deadPlayers is empty or null', () => {
        const initialPlayerList = [
            { playerInfo: { userName: 'Player1' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
            { playerInfo: { userName: 'Player2' }, playerInGame: { currentPosition: { x: 0, y: 0 } } } as Player,
        ];

        service.playerList = [...initialPlayerList];
        service.handleDeadPlayers([]);
        expect(service.playerList).toEqual(initialPlayerList);
        service.handleDeadPlayers(null as unknown as DeadPlayerPayload[]);
        expect(service.playerList).toEqual(initialPlayerList);
    });
});
