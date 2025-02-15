/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { Player } from '@app/interfaces/player';
import { ATTACK_DICE } from '@common/constants/dice.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { DiceType } from '@common/enums/dice.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MyPlayerService } from './my-player.service';

describe('MyPlayerService', () => {
    let service: MyPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MyPlayerService],
        });
        service = TestBed.inject(MyPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update inventory when setInventory is called', () => {
        service.myPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const mockInventory: ItemType[] = [ItemType.BismuthShield, ItemType.QuartzSkates];
        service.setInventory(mockInventory);
        expect(service.myPlayer.playerInGame.inventory).toEqual(mockInventory);
    });

    it('should return player ID if myPlayer is defined', () => {
        service.myPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        const playerId = service.getPlayerId();
        expect(playerId).toBe('1');
    });

    it('should return undefined if myPlayer is null', () => {
        service.myPlayer = null as unknown as Player;
        const playerId = service.getPlayerId();
        expect(playerId).toBeUndefined();
    });

    it('isOrganizer should return true if the role is Organizer', () => {
        service.role = PlayerRole.Organizer;
        expect(service.isOrganizer()).toBeTrue();
    });

    it('isOrganizer should return false if the role is not Organizer', () => {
        service.role = PlayerRole.Human;
        expect(service.isOrganizer()).toBeFalse();
    });

    it('getUserName should return the userName of myPlayer if it is defined', () => {
        service.myPlayer = {
            playerInfo: {
                userName: 'TestUser',
            },
        } as Player;
        expect(service.getUserName()).toBe('TestUser');
    });

    it('getUserName should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getUserName()).toBeUndefined();
    });

    it('getAvatar should return the avatar of myPlayer if it is defined', () => {
        service.myPlayer = {
            playerInfo: {
                avatar: Avatar.FemaleHealer,
            },
        } as Player;
        expect(service.getAvatar()).toBe(Avatar.FemaleHealer);
    });

    it('getAvatar should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getAvatar()).toBeUndefined();
    });

    it('getRemainingHp should return remainingHp of myPlayer if it is defined', () => {
        const remainingHp = 5;
        service.myPlayer = {
            playerInGame: {
                remainingHp,
            },
        } as Player;
        expect(service.getRemainingHp()).toBe(remainingHp);
    });

    it('getRemainingHp should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getRemainingHp()).toBeUndefined();
    });

    it('getMaxHp should return the max HP of myPlayer if it is defined', () => {
        const hp = 6;
        service.myPlayer = {
            playerInGame: {
                attributes: {
                    hp,
                },
            },
        } as Player;
        expect(service.getMaxHp()).toBe(hp);
    });

    it('getMaxHp should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getMaxHp()).toBeUndefined();
    });

    it('getSpeed should return the speed of myPlayer if it is defined', () => {
        const speed = 10;
        service.myPlayer = {
            playerInGame: {
                attributes: {
                    speed,
                },
            },
        } as Player;
        expect(service.getSpeed()).toBe(speed);
    });

    it('getSpeed should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getSpeed()).toBeUndefined();
    });

    it('getAttack should return the attack value of myPlayer if it is defined', () => {
        const attack = 5;
        service.myPlayer = {
            playerInGame: {
                attributes: {
                    attack,
                },
            },
        } as Player;
        expect(service.getAttack()).toBe(attack);
    });

    it('getAttack should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getAttack()).toBeUndefined();
    });

    it('getDefense should return the defense value of myPlayer if it is defined', () => {
        const defense = 3;
        service.myPlayer = {
            playerInGame: {
                attributes: {
                    defense,
                },
            },
        } as Player;
        expect(service.getDefense()).toBe(defense);
    });

    it('getDefense should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getDefense()).toBeUndefined();
    });

    it('getDice should return appropriate dice based on ATTACK_DICE value', () => {
        service.myPlayer = {
            playerInGame: {
                dice: ATTACK_DICE,
            },
        } as Player;
        expect(service.getDice()).toEqual([DiceType.Six, DiceType.Four]);
    });

    it('getDice should return alternate dice if ATTACK_DICE is not used', () => {
        service.myPlayer = {
            playerInGame: {
                dice: 'OTHER_DICE_TYPE' as unknown,
            },
        } as Player;
        expect(service.getDice()).toEqual([DiceType.Four, DiceType.Six]);
    });

    it('getRemainingMovement should return remaining movement of myPlayer if it is defined', () => {
        const remainingMovement = 5;
        service.myPlayer = {
            playerInGame: {
                remainingMovement,
            },
        } as Player;
        expect(service.getRemainingMovement()).toBe(remainingMovement);
    });

    it('getRemainingMovement should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getRemainingMovement()).toBeUndefined();
    });

    it('getRemainingActions should return remaining actions of myPlayer if it is defined', () => {
        const remainingActions = 3;
        service.myPlayer = {
            playerInGame: {
                remainingActions,
            },
        } as Player;
        expect(service.getRemainingActions()).toBe(remainingActions);
    });

    it('getRemainingActions should return undefined if myPlayer is not defined', () => {
        service.myPlayer = undefined as unknown as Player;
        expect(service.getRemainingActions()).toBeUndefined();
    });
});
