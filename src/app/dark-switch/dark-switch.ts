import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dark-switch',
  imports: [CommonModule],
  templateUrl: './dark-switch.html',
  styleUrl: './dark-switch.css',
})
export class DarkSwitch implements OnInit {
  isDarkMode = false;

  ngOnInit() {
    // Check if dark mode was previously saved in localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      this.isDarkMode = JSON.parse(savedDarkMode);
      this.applyDarkMode(this.isDarkMode);
    }
  }

  toggleDarkMode(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isDarkMode = checkbox.checked;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    this.applyDarkMode(this.isDarkMode);
  }

  private applyDarkMode(enabled: boolean): void {
    if (enabled) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
