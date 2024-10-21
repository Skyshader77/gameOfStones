import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomAPIService } from '@app/services/api-services/room-api.service';

@Injectable({
    providedIn: 'root',
})
export class RoomJoiningService {
    constructor(private roomAPIService: RoomAPIService) {}

    isValidInput(input: string): boolean {
        const regex = /^\d{4}$/;
        return regex.test(input);
    }

    isIDValid(input: string): Observable<boolean> {
        return this.roomAPIService.checkRoomExists(input);
    }
}
