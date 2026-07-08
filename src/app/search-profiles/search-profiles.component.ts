import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchProfilesService } from '../services/searchProfiles.service';
import { SearchProfile } from '../models/search-profile';
import { ArticlesService } from '../services/articles.service';

@Component({
  selector: 'app-search-profiles',
  templateUrl: './search-profiles.component.html',
  styleUrls: ['./search-profiles.component.css'],
})
export class SearchProfilesComponent implements OnInit {
  searchProfiles: SearchProfile[] = [];
  editingId: string | null = null;
  editingData: { [key: string]: any } = {};
  showAddForm = false;
  newProfileData = { title: '', keywords: '' };
  isSaving = false;
  isDeleting: { [key: string]: boolean } = {};
  isDeletingKeyword: { [key: string]: boolean } = {};
  errorMessage = '';
  successMessage = '';

  constructor(
    private searchProfilesService: SearchProfilesService,
    private articlesService: ArticlesService
  ) {}

  private parseKeywords(input: string): string[] {
    return input
      .split(/\r?\n/)
      .map((k: string) => k.trim())
      .filter((k: string) => k.length > 0);
  }

  ngOnInit(): void {
    this.loadSearchProfiles();
  }

  loadSearchProfiles(): void {
    this.searchProfilesService.getSearchProfiles().subscribe({
      next: (profiles: SearchProfile[]) => {
        this.searchProfiles = profiles;
      },
      error: (err) => {
        console.error('Error loading search profiles:', err);
        this.errorMessage = 'Failed to load search profiles';
      },
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.newProfileData = { title: '', keywords: '' };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelAddForm(): void {
    this.showAddForm = false;
    this.newProfileData = { title: '', keywords: '' };
    this.errorMessage = '';
  }

  createProfile(): void {
    if (!this.newProfileData.title.trim()) {
      this.errorMessage = 'Profile title is required';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newProfile = {
      title: this.newProfileData.title,
      keywords: this.parseKeywords(this.newProfileData.keywords),
      isActive: true,
    };

    this.searchProfilesService.createSearchProfile(newProfile).subscribe({
      next: (created: SearchProfile) => {
        this.searchProfiles.push(created);
        this.showAddForm = false;
        this.newProfileData = { title: '', keywords: '' };
        this.isSaving = false;
        this.successMessage = `Profile "${created.title}" created successfully`;
      },
      error: (err) => {
        console.error('Error creating profile:', err);
        this.errorMessage = 'Failed to create profile';
        this.isSaving = false;
      },
    });
  }

  startEdit(profile: SearchProfile): void {
    this.editingId = profile.id;
    this.editingData[profile.id] = {
      title: profile.title,
      keywords: (profile.keywords || []).join('\n'),
      isActive: profile.isActive,
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingData = {};
    this.errorMessage = '';
  }

  saveProfile(profile: SearchProfile): void {
    const data = this.editingData[profile.id];
    if (!data) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      title: data.title,
      keywords: this.parseKeywords(data.keywords),
      isActive: data.isActive,
    };

    this.searchProfilesService.updateSearchProfile(profile.id, updateData).subscribe({
      next: (updated: SearchProfile) => {
        const index = this.searchProfiles.findIndex((p) => p.id === updated.id);
        if (index >= 0) {
          this.searchProfiles[index] = updated;
        }
        this.editingId = null;
        this.editingData = {};
        this.isSaving = false;
        this.successMessage = `Profile "${updated.title}" updated successfully`;
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.errorMessage = this.getRequestErrorMessage(err, 'Failed to save profile');
        this.isSaving = false;
      },
    });
  }

  deleteProfile(profile: SearchProfile): void {
    if (!confirm(`Are you sure you want to delete "${profile.title}"?`)) {
      return;
    }

    this.isDeleting[profile.id] = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.searchProfilesService.deleteSearchProfile(profile.id).subscribe({
      next: () => {
        this.searchProfiles = this.searchProfiles.filter((p) => p.id !== profile.id);
        this.isDeleting[profile.id] = false;
        this.successMessage = `Profile "${profile.title}" deleted successfully`;
      },
      error: (err) => {
        console.error('Error deleting profile:', err);
        this.errorMessage = 'Failed to delete profile';
        this.isDeleting[profile.id] = false;
      },
    });
  }

  deleteKeyword(profile: SearchProfile, keyword: string): void {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return;
    }

    const keywordKey = `${profile.id}:${trimmedKeyword}`;
    this.isDeletingKeyword[keywordKey] = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.articlesService.deleteByKeyword(trimmedKeyword).subscribe({
      next: (result: { deletedCount?: number; removedFromProfiles?: number }) => {
        const current = this.searchProfiles.find((p) => p.id === profile.id);
        if (current) {
          current.keywords = (current.keywords || []).map((item) =>
            item === trimmedKeyword ? `-${trimmedKeyword}` : item
          );
        }

        this.isDeletingKeyword[keywordKey] = false;
        this.successMessage = `Keyword "${trimmedKeyword}" marked as disabled and ${result.deletedCount || 0} articles deleted`;
      },
      error: (err) => {
        console.error('Error deleting by keyword:', err);
        this.errorMessage = this.getRequestErrorMessage(err, 'Failed to delete by keyword');
        this.isDeletingKeyword[keywordKey] = false;
      },
    });
  }

  toggleActive(profile: SearchProfile): void {
    const updateData = {
      title: profile.title,
      keywords: profile.keywords || [],
      isActive: !profile.isActive,
    };

    this.searchProfilesService.updateSearchProfile(profile.id, updateData).subscribe({
      next: (updated: SearchProfile) => {
        const index = this.searchProfiles.findIndex((p) => p.id === updated.id);
        if (index >= 0) {
          this.searchProfiles[index] = updated;
        }
        this.successMessage = `Profile "${updated.title}" ${updated.isActive ? 'enabled' : 'disabled'}`;
      },
      error: (err) => {
        console.error('Error toggling profile:', err);
        this.errorMessage = this.getRequestErrorMessage(err, 'Failed to update profile');
      },
    });
  }

  trackById(_index: number, profile: SearchProfile): string {
    return profile.id;
  }

  private getRequestErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const serverMessage = typeof err.error === 'object' ? err.error?.error : err.error;
      return serverMessage ? `${fallback}: ${serverMessage}` : `${fallback} (${err.status})`;
    }

    return fallback;
  }
}
