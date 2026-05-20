import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchProfile } from '../models/search-profile';

export interface SearchProfileDraft {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

@Component({
    selector: 'app-search-profile-editor',
    templateUrl: './search-profile-editor.component.html',
    styleUrls: ['./search-profile-editor.component.css']
})
export class SearchProfileEditorComponent {
    @Input() set profile(value: SearchProfile | null) {
        if (!value) {
            this.draft = null;
            return;
        }

        this.draft = {
            id: value.id,
            name: value.name ?? value.title ?? '',
            description: value.description ?? value.notes ?? '',
            isActive: value.isActive
        };
    }

    @Output() save = new EventEmitter<SearchProfileDraft>();
    @Output() cancel = new EventEmitter<void>();

    draft: SearchProfileDraft | null = null;

    onSave(): void {
        if (!this.draft) {
            return;
        }

        const trimmedName = this.draft.name.trim();
        if (!trimmedName) {
            return;
        }

        this.save.emit({
            ...this.draft,
            name: trimmedName,
            description: this.draft.description.trim()
        });
    }
}
