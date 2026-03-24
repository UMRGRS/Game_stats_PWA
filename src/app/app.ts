import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Test } from "./test/test";
import { List } from "./list/list";
import { Searchbar } from "./searchbar/searchbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Test, List, Searchbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'game-stats-pwa';
}
