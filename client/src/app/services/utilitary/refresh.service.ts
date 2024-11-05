import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RefreshService {
    private refreshDetector = false;

    setRefreshDetector() {
        this.refreshDetector = true;
    }

    wasRefreshed(): boolean {
        return !this.refreshDetector;
    }
}
