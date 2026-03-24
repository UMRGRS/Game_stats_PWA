import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-searchbar',
  imports: [FormsModule],
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.css',
})
export class Searchbar {
  private searchService = inject(SearchService);
  searchQuery: string = '';

  onSearch(): void {
    this.searchService.setSearchTerm(this.searchQuery);
  }
}
