import { Subscription } from 'rxjs';

export interface RoomJoiningListenerData {
    joinErrorListener: Subscription;
    avatarListListener: Subscription;
    avatarSelectionListener: Subscription;
    joinEventListener: Subscription;
}
