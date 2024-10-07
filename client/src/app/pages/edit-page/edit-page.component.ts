import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/edit-page/map.component';
import { SidebarComponent } from '@app/components/edit-page/sidebar.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { ValidationResult } from '@app/interfaces/validation';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent, ErrorDialogComponent],
})
export class EditPageComponent implements OnDestroy {
    @ViewChild('mapElement') mapElement!: ElementRef<HTMLElement>;
    @ViewChild('successDialog') successDialog!: ElementRef<HTMLDialogElement>;

    successMessage: string = '';

    constructor(
        private mapManagerService: MapManagerService,
        private mapValidationService: MapValidationService,
        private router: Router,
    ) {}

    onSave() {
        const validationResult: ValidationResult = this.mapValidationService.validateMap(this.mapManagerService.currentMap);

        this.mapManagerService.handleSave(validationResult, this.mapElement.nativeElement.firstChild as HTMLElement).subscribe((message) => {
            this.openDialog(message);
        });
    }

    onSuccessfulSave() {
        this.router.navigate(['/admin']);
    }

    ngOnDestroy() {
        this.mapManagerService.selectTileType(null);
    }

    private openDialog(message: string): void {
        this.successMessage = message;

        if (this.successMessage !== '' && this.successDialog.nativeElement.isConnected) {
            this.successDialog.nativeElement.showModal();
        }
    }
}
