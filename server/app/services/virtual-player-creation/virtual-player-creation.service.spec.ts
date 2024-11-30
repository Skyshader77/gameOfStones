import { MOCK_ROOM_GAME } from '@app/constants/test.constants';
import { AvatarManagerService } from '@app/services/avatar-manager/avatar-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ATTACK_DICE, DEFENSE_DICE } from '@common/constants/dice.constants';
import { DEFAULT_INITIAL_STAT, INITIAL_POSITION, MAX_INITIAL_STAT } from '@common/constants/player-creation.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { PlayerAttributeType } from '@common/interfaces/stats';
import { Test, TestingModule } from '@nestjs/testing';
import { VirtualPlayerCreationService } from './virtual-player-creation.service';

describe('VirtualPlayerCreationService', () => {
    let service: VirtualPlayerCreationService;
    let roomManagerService: jest.Mocked<RoomManagerService>;
    let avatarManagerService: jest.Mocked<AvatarManagerService>;
    const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAME));

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerCreationService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        checkIfNameIsUnique: jest.fn(),
                    },
                },
                {
                    provide: AvatarManagerService,
                    useValue: {
                        getVirtualPlayerStartingAvatar: jest.fn(),
                        getTakenAvatarsByRoomCode: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<VirtualPlayerCreationService>(VirtualPlayerCreationService);
        roomManagerService = module.get(RoomManagerService);
        avatarManagerService = module.get(AvatarManagerService);
    });

    describe('createVirtualPlayer', () => {
        beforeEach(() => {
            roomManagerService.checkIfNameIsUnique.mockReturnValue(true);
            avatarManagerService.getVirtualPlayerStartingAvatar.mockReturnValue(Avatar.FemaleMage);
        });

        it('should create a valid virtual player with correct structure', () => {
            const virtualPlayer = service.createVirtualPlayer(mockRoomGame, PlayerRole.AggressiveAI);

            expect(virtualPlayer).toEqual(
                expect.objectContaining({
                    playerInfo: expect.any(Object),
                    playerInGame: expect.any(Object),
                }),
            );
        });

        it('should create player with correct initial game state', () => {
            const virtualPlayer = service.createVirtualPlayer(mockRoomGame, PlayerRole.AggressiveAI);

            expect(virtualPlayer.playerInGame).toEqual(
                expect.objectContaining({
                    baseAttributes: expect.any(Object),
                    attributes: expect.any(Object),
                    inventory: expect.any(Array),
                    currentPosition: INITIAL_POSITION,
                    startPosition: INITIAL_POSITION,
                    hasAbandoned: false,
                    remainingActions: 1,
                }),
            );
        });

        it('should set correct attribute ranges', () => {
            const virtualPlayer = service.createVirtualPlayer(mockRoomGame, PlayerRole.AggressiveAI);
            const { attributes } = virtualPlayer.playerInGame;
            expect(attributes.hp).toBeGreaterThanOrEqual(DEFAULT_INITIAL_STAT);
            expect(attributes.hp).toBeLessThanOrEqual(MAX_INITIAL_STAT);
            expect(attributes.speed).toBeGreaterThanOrEqual(DEFAULT_INITIAL_STAT);
            expect(attributes.speed).toBeLessThanOrEqual(MAX_INITIAL_STAT);
            expect(attributes.attack).toBe(DEFAULT_INITIAL_STAT);
            expect(attributes.defense).toBe(DEFAULT_INITIAL_STAT);
        });

        it('should assign correct dice type', () => {
            const virtualPlayer = service.createVirtualPlayer(mockRoomGame, PlayerRole.AggressiveAI);

            expect([ATTACK_DICE, DEFENSE_DICE]).toContain(virtualPlayer.playerInGame.dice);
        });
    });

    describe('randomName', () => {
        it('should retry until finding a unique name', () => {
            roomManagerService.checkIfNameIsUnique.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);

            const name = service['randomName'](mockRoomGame);

            expect(name).toBeDefined();
            expect(typeof name).toBe('string');
            const numbOfCalls = 3;
            expect(roomManagerService.checkIfNameIsUnique).toHaveBeenCalledTimes(numbOfCalls);
        });
    });

    describe('randomAvatar', () => {
        it('should get avatar from avatar manager service', () => {
            avatarManagerService.getVirtualPlayerStartingAvatar.mockReturnValue(Avatar.FemaleWarrior);

            const avatar = service['randomAvatar'](mockRoomGame);

            expect(avatar).toBe(Avatar.FemaleWarrior);
            expect(avatarManagerService.getVirtualPlayerStartingAvatar).toHaveBeenCalledWith(mockRoomGame.room.roomCode);
        });
    });

    describe('randomStatBonus and randomDice6', () => {
        it('should return valid stat bonus type', () => {
            const bonus = service['randomStatBonus']();
            expect([PlayerAttributeType.Hp, PlayerAttributeType.Speed]).toContain(bonus);
        });

        it('should return valid dice type', () => {
            const dice = service['randomDice6']();
            expect([PlayerAttributeType.Attack, PlayerAttributeType.Defense]).toContain(dice);
        });
    });
});
