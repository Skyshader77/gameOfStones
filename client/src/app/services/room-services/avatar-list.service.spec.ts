import { TestBed } from '@angular/core/testing';
import { AvatarListService } from './avatar-list.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { AvatarChoice } from '@common/constants/player.constants';
import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';

describe('AvatarListService', () => {
    let avatarListService: AvatarListService;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        socketService = jasmine.createSpyObj('SocketService', ['emit']);

        TestBed.configureTestingModule({
            providers: [AvatarListService, { provide: SocketService, useValue: socketService }],
        });

        avatarListService = TestBed.inject(AvatarListService);
    });

    it('should be created', () => {
        expect(avatarListService).toBeTruthy();
    });

    it('should call emit on SocketService when sendAvatarRequest is called', () => {
        const desiredAvatar: AvatarChoice = 1;
        avatarListService.sendAvatarRequest(desiredAvatar);
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.DesiredAvatar, desiredAvatar);
    });

    it('should call emit on SocketService when sendPlayerCreationFormOpened is called', () => {
        const roomId = '0000';
        avatarListService.sendPlayerCreationFormOpened(roomId);
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.PlayerCreationOpened, roomId);
    });

    it('should call emit on SocketService when sendPlayerCreationClosed is called', () => {
        const roomId = '0000';
        avatarListService.sendPlayerCreationClosed(roomId);
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.PlayerCreationClosed, roomId);
    });

    it('should update selectedAvatar when setSelectedAatar is called', () => {
        const newAvatar: AvatarChoice = 1;
        avatarListService.setSelectedAvatar(newAvatar);
        avatarListService.selectedAvatar.subscribe((value) => {
            expect(value).toBe(newAvatar);
        });
    });
});
