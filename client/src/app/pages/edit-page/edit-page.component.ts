import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MapComponent } from '@app/components/edit-page/map.component';
import { SidebarComponent } from '@app/components/edit-page/sidebar.component';
import { ErrorDialogComponent } from '@app/components/error-dialog/error-dialog.component';
import { VALIDATION_ERRORS } from '@app/constants/edit-page.constants';
import { ValidationResult, ValidationStatus } from '@app/interfaces/validation';
import { MapManagerService } from '@app/services/edit-page-services/map-manager.service';
import { MapValidationService } from '@app/services/edit-page-services/map-validation.service';
import { ErrorMessageService } from '@app/services/utilitary/error-message.service';

@Component({
    selector: 'app-edit-page',
    standalone: true,
    templateUrl: './edit-page.component.html',
    styleUrls: [],
    imports: [SidebarComponent, MapComponent, ErrorDialogComponent],
})
export class EditPageComponent implements OnInit, OnDestroy {
    @ViewChild(MapComponent, { read: ElementRef }) mapElement!: ElementRef<HTMLElement>;

    constructor(
        private mapManagerService: MapManagerService,
        private mapValidationService: MapValidationService,
        private errorMessageService: ErrorMessageService,
    ) {}

    ngOnInit() {
        this.mapManagerService.mapValidationStatus.subscribe((mapValidationStatus) => this.openDialog(mapValidationStatus));
    }

    onSave() {
        const validationResults: ValidationStatus = this.mapValidationService.validateMap(this.mapManagerService.currentMap);
        this.mapManagerService.handleSave(validationResults, this.mapElement.nativeElement.firstChild as HTMLElement);
    }

    ngOnDestroy() {
        this.mapManagerService.selectTileType(null);
    }

    private openDialog(validation: ValidationResult): void {
        const messages = Object.entries(VALIDATION_ERRORS)
            .filter(([key]) => !validation.validationStatus[key as keyof typeof VALIDATION_ERRORS])
            .map(([, message]) => message);

        this.errorMessageService.showMessage({ title: validation.message, content: messages.join('\n') });
    }
}
