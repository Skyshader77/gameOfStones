import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EditMapComponent } from '@app/components/edit-page/edit-map.component';
import { SidebarComponent } from '@app/components/edit-page/sidebar.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { SCREENSHOT_SIZE } from '@app/constants/edit-page.constants';
import { ValidationResult } from '@app/interfaces/validation';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, EditMapComponent, MessageDialogComponent],
})
export class EditPageComponent implements OnDestroy {
    @ViewChild('screenshotElement') screenshotElement!: ElementRef<HTMLCanvasElement>;

    screenshotSize = SCREENSHOT_SIZE;

    private wasSuccessful: boolean = false;

    constructor(
        private mapManagerService: MapManagerService,
        private mapValidationService: MapValidationService,
        private router: Router,
    ) {}

    onSave() {
        const validationResult: ValidationResult = this.mapValidationService.validateMap(this.mapManagerService.currentMap);

        const ctx = this.screenshotElement.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.mapManagerService.handleSave(validationResult, ctx).subscribe((success: boolean) => {
            this.wasSuccessful = success;
        });
    }

    onSuccessfulSave() {
        if (this.wasSuccessful) {
            this.router.navigate(['/admin']);
        }
    }

    ngOnDestroy() {
        this.mapManagerService.selectTileType(null);
    }
}
