import { AvatarChoice } from '@common/constants/player.constants';

export interface AvatarData {
    avatarList: Map<AvatarChoice, boolean>;
    selectedAvatar: AvatarChoice;
}
