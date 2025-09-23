import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employe } from '../../core/employe.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  searchTerm: string = '';
  isSearching: boolean = false;

  @Input() employees: Employe[] = [];
  employes: Employe[] = [];

  @Output() searchEvent = new EventEmitter<Employe[]>();
  @Output() clearEvent = new EventEmitter<void>();

  onSearch() {
    if (!this.searchTerm) {
      this.employes = [];
      this.searchEvent.emit([]);
      return;
    }

    // Animation de recherche
    this.isSearching = true;
    
    // Simulation d'un délai de recherche pour l'effet visuel
    setTimeout(() => {
      const term = this.searchTerm.toLowerCase();

      this.employes = this.employees.filter(emp =>
        (emp.nom?.toLowerCase().includes(term)) ||
        (emp.prenom?.toLowerCase().includes(term)) ||
        (emp.ip?.toString().includes(term))
      );

      this.searchEvent.emit(this.employes);
      this.isSearching = false;
    }, 500);
  }

  clearSearch() {
    this.searchTerm = '';
    this.employes = [];
    this.isSearching = false;
    // Émettre un événement pour dire au parent "la recherche est vide"
    this.clearEvent.emit();
  }

  quickSearch(filter: string) {
    this.searchTerm = filter;
    this.onSearch();
  }
}