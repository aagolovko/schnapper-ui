// src/app/search-profiles/search-profiles.component.ts
import { Component, OnInit } from '@angular/core';
import { SearchProfilesService } from '../services/searchProfiles.service';
import { SearchProfile } from '../models/search-profile';
import { SearchProfileDraft } from '../search-profile-editor/search-profile-editor.component';

@Component({
    selector: 'app-search-profiles',
    templateUrl: './search-profiles.component.html',
    styleUrls: ['./search-profiles.component.css']
})
export class SearchProfilesComponent implements OnInit {
    searchProfiles: SearchProfile[] = [];
    selectedProfile: SearchProfile | null = null;
    isSaving = false;
    errorMessage = '';

    constructor(private searchProfilesService: SearchProfilesService) {}

    ngOnInit(): void {
        this.loadSearchProfiles();
    }

    loadSearchProfiles(): void {
        this.searchProfilesService.getSearchProfiles().subscribe((profiles: SearchProfile[]) => {
            this.searchProfiles = profiles;

            if (!this.selectedProfile && profiles.length > 0) {
                this.selectedProfile = profiles[0];
            }

            if (this.selectedProfile) {
                const selected = profiles.find(profile => profile.id === this.selectedProfile?.id);
                this.selectedProfile = selected ?? null;
            }
        });
    }

    selectProfile(profile: SearchProfile): void {
        this.selectedProfile = profile;
        this.errorMessage = '';
    }

    trackById(_index: number, profile: SearchProfile): string {
        return profile.id;
    }

    onCancelEdit(): void {
        this.errorMessage = '';
    }

    onSaveProfile(draft: SearchProfileDraft): void {
        const currentProfile = this.selectedProfile ?? this.searchProfiles.find(profile => profile.id === draft.id);
        if (!currentProfile) {
            this.errorMessage = 'Selected profile was not found.';
            return;
        }

        const profileToUpdate: SearchProfile = {
            ...currentProfile,
            id: draft.id,
            name: draft.name,
            description: draft.description,
            isActive: draft.isActive
        };

        this.isSaving = true;
        this.errorMessage = '';

        this.searchProfilesService.updateSearchProfile(profileToUpdate).subscribe({
            next: updated => {
                this.searchProfiles = this.searchProfiles.map(profile =>
                    profile.id === updated.id ? { ...profile, ...updated } : profile
                );
                this.selectedProfile = this.searchProfiles.find(profile => profile.id === updated.id) ?? null;
                this.isSaving = false;
            },
            error: () => {
                this.errorMessage = 'Unable to save search profile. Please try again.';
                this.isSaving = false;
            }
        });
    }
}
