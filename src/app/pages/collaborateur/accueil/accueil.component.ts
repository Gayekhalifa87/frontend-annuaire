import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from "../../../components/search/search.component";
import { EnteteComponent } from "../../../layout/entete/entete.component";
import { Employe, EmployeService } from '../../../core/employe.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, SearchComponent, EnteteComponent, HttpClientModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {

  employees: Employe[] = [];           // Tous les employés
  filteredEmployees: Employe[] = [];   // Résultats de recherche

  currentPage = 0;
  pageSize = 6; 
  totalPages = 0;
  pages: number[] = [];

  constructor(private employeService: EmployeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  /** Charger tous les employés */
  loadEmployees() {
    this.employeService.getAllCombinedEmployes()
      .subscribe(res => {
        this.employees = res;
        this.filteredEmployees = []; 
        this.updatePagination(this.employees.length);
      });
  }

  /** Retourne les employés de la page courante */
  get paginatedEmployees() {
    const list = this.filteredEmployees.length ? this.filteredEmployees : this.employees;
    const start = this.currentPage * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  /** Récupérer les initiales */
  getInitials(name: string): string {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase()
      : '';
  }

  /** Pagination */
  goToPreviousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  /** trackBy pour Angular */
  trackByEmployee(index: number, employee: Employe): number | undefined {
    return employee.id;
  }

  /** 🔹 Événement de recherche provenant de SearchComponent */
  onSearchEvent(employees: Employe[]) {
    this.filteredEmployees = employees;
    this.currentPage = 0;
    this.updatePagination(this.filteredEmployees.length);
  }

  /** 🔹 Événement de clear provenant de SearchComponent */
  onClearEvent() {
    this.filteredEmployees = [];
    this.currentPage = 0;
    this.updatePagination(this.employees.length);
  }

  /** Met à jour le nombre de pages */
  private updatePagination(totalItems: number) {
    this.totalPages = Math.ceil(totalItems / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
