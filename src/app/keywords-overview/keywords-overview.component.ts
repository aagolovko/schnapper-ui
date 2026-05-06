import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-keywords-overview',
  templateUrl: './keywords-overview.component.html',
  styleUrls: ['./keywords-overview.component.css']
})
export class KeywordsOverviewComponent implements OnInit {
  keywordGroups: { group: string, keywords: string[] }[] = [
    { group: 'Sauna', keywords: ['Stone', 'Wood'] }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  addKeyword(groupIndex: number, newKeyword: string): void {
    this.keywordGroups[groupIndex].keywords.push(newKeyword);
  }

  removeKeyword(groupIndex: number, keywordIndex: number): void {
    this.keywordGroups[groupIndex].keywords.splice(keywordIndex, 1);
  }
}
