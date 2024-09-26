import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
@Component({
    selector: 'app-map-creation-form',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './map-creation-form.component.html',
})
export class MapCreationFormComponent {
    @Output() submissionEvent = new EventEmitter<void>();
    @Output() cancelEvent = new EventEmitter<void>();
    mapSelectionForm: FormGroup;
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.mapSelectionForm = this.formBuilder.group({
            mode: [GameMode.NORMAL, Validators.required],
            size: [MapSize.SMALL, Validators.required],
        });
    }
    onSubmit(): void {
        if (this.mapSelectionForm.valid) {
            const formData = this.mapSelectionForm.value;
            const newmap: Map = {
                _id: '0',
                name: '',
                description: '',
                size: formData.size,
                mode: formData.mode,
                mapArray: [],
                placedItems: [],
                isVisible: true,
                dateOfLastModification: new Date(),
            };
            this.router.navigate(['/edit'], { state: { map: newmap, isPresentInDatabase: false } });
        }
    }
    onCancel() {
        this.mapSelectionForm.reset({
            mode: GameMode.NORMAL,
            size: MapSize.SMALL,
        });
        this.cancelEvent.emit();
    }
}
