import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RefreshService {
    private shouldNotBeRefreshed = false;

    setRefreshDetector() {
        this.shouldNotBeRefreshed = true;
    }

    wasRefreshed(): boolean {
        return !this.shouldNotBeRefreshed;
    }
}
