import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Test } from "./test/test";
import { List } from "./list/list";
import { Searchbar } from "./searchbar/searchbar";
import { DarkSwitch } from "./dark-switch/dark-switch";
import { Sorterer } from "./sorterer/sorterer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Test, List, Searchbar, DarkSwitch, Sorterer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'game-stats-pwa';

  @ViewChild(List) listComponent!: List;

  onSortChange(config: any): void {
    if (this.listComponent) {
      this.listComponent.onSortChange(config);
    }
  }
}
