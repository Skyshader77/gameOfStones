import { AvatarChoice } from '@common/constants/player.constants';

export interface AvatarData {
    avatarList: Map<string, boolean>;
    selectedAvatar: AvatarChoice;
}
