// src/app/search-profiles/search-profiles.component.ts
import { Component, OnInit } from '@angular/core';
import { SearchProfilesService } from '../services/searchProfiles.service';
import { SearchProfile } from '../models/search-profile';

@Component({
    selector: 'app-search-profiles',
    templateUrl: './search-profiles.component.html',
    styleUrls: ['./search-profiles.component.css']
})
export class SearchProfilesComponent implements OnInit {
    searchProfiles: SearchProfile[] = [];

    constructor(private searchProfilesService: SearchProfilesService) {}

    ngOnInit() {
        this.searchProfilesService.getSearchProfiles().subscribe((profiles: SearchProfile[]) => {
            this.searchProfiles = profiles;
        });
    }
}
