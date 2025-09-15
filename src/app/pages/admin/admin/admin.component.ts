import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchComponent } from '../../../components/search/search.component';
import { EmployeService, Employe } from '../../../core/employe.service';
import Swal from 'sweetalert2';
import { RouterLink } from "@angular/router";
import { Input } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchComponent, RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  employees: Employe[] = [];

  addEmployeeForm: FormGroup;
  showAddForm = false;
  isEditing = false;
  editingEmployeeId: number | null = null;
  employes: Employe[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 6; 
  totalPages = 0;
  pages: number[] = [];

@Input() user: any;

  constructor(
    private employeService: EmployeService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.addEmployeeForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      poste: ['', Validators.required],
      direction: ['', Validators.required],
      service: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      ip: ['', Validators.required],
      telephone: ['', Validators.required],
      role: ['user', Validators.required],
    });
  }

  ngOnInit() {
    this.loadEmployees();
  }

  /** 🔹 Charger tous les employés et calculer pagination */
  loadEmployees() {
    this.employeService.getAllCombinedEmployes().subscribe({
      next: (emps) => {
        this.employes = emps;
        this.calculatePagination();
      },
      error: (err) => console.error('Erreur lors du chargement des employés', err)
    });
  }

  /** 🔹 Calculer totalPages et pages */
  calculatePagination() {
    this.totalPages = Math.ceil(this.employes.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
    if (this.currentPage >= this.totalPages) {
      this.currentPage = this.totalPages - 1;
    }
    if (this.currentPage < 0) this.currentPage = 0;
  }

  /** 🔹 Getter pour les employés de la page actuelle */
  get paginatedEmployes(): Employe[] {
  const start = this.currentPage * this.pageSize;
  return this.employes.slice(start, start + this.pageSize);
}

  /** 🔹 Pagination navigation */
  goToPreviousPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  /** 🔹 Formulaire ajout / édition */
  openAddForm() {
    this.resetForm();
    this.showAddForm = true;
  }

  editEmployee(emp: Employe) {
    this.isEditing = true;
    this.editingEmployeeId = emp.id ?? null;
    this.addEmployeeForm.patchValue(emp);
    this.showAddForm = true;
  }

  updateEmploye() {
  if (!this.editingEmployeeId) return;

  const updatedData: Partial<Employe> = {};
  if (this.addEmployeeForm.get('ip')?.dirty) updatedData.ip = this.addEmployeeForm.get('ip')?.value;
  if (this.addEmployeeForm.get('telephone')?.dirty) updatedData.telephone = this.addEmployeeForm.get('telephone')?.value;
  if (this.addEmployeeForm.get('password')?.dirty) updatedData.password = this.addEmployeeForm.get('password')?.value;

  this.employeService.updateEmploye(this.editingEmployeeId, updatedData as Employe)
    .subscribe({
      next: (updatedEmp) => {
        // Mise à jour locale de la liste
        this.employes = this.employes.map(e => e.id === updatedEmp.id ? updatedEmp : e);
        this.resetForm();
        Swal.fire({ icon: 'success', title: 'Modification réussie', timer: 1500 });
        this.loadEmployees(); 
        this.calculatePagination(); 
      },
      error: (err) => console.error('Erreur lors de la mise à jour :', err)
    });
}

  /** 🔹 Supprimer un employé */
  deleteEmployee(emp: Employe) {
    if (!emp.id) return;

    Swal.fire({
      title: `Supprimer ${emp.nom} ?`,
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeService.deleteEmploye(emp.id!).subscribe({
          next: () => {
            this.employes = this.employes.filter(e => e.id !== emp.id);
            Swal.fire({ icon: 'success', title: 'Employé supprimé', timer: 1500 });
            this.calculatePagination();
            this.loadEmployees();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression :', err);
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer l\'employé.' });
          }
        });
      }
    });
  }

  /** 🔹 Changer rôle */
  switchRole(emp: Employe) {
    if (!emp.id) return;
    this.employeService.switchRole(emp.id).subscribe({
  next: (updatedEmp) => { // updatedEmp est un Employe
    this.employes = this.employes.map(e => e.id === updatedEmp.id ? updatedEmp : e);
    Swal.fire({ 
      icon: 'success', 
      title: 'Succès', 
      text: `Le rôle de ${updatedEmp.nom} est maintenant ${updatedEmp.role}`, 
      timer: 2000, 
      showConfirmButton: false 
    });
    this.calculatePagination();
    this.loadEmployees();
  },
  error: () => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de changer le rôle.' })
});

  }

  /** 🔹 Réinitialiser le formulaire */
  resetForm() {
    this.addEmployeeForm.reset({ role: 'user' });
    this.showAddForm = false;
    this.isEditing = false;
    this.editingEmployeeId = null;
    this.loadEmployees();
  }

  /** 🔹 Recherche via le composant Search */
  onSearchResult(results: Employe[]) {
    this.employes = results;
    this.currentPage = 0;
    this.calculatePagination();
    console.log('Résultats de la recherche :', results);

  }


  /** 🔹 Déconnexion */
logout(event: Event) {
  event.preventDefault(); // 🔹 empêche la navigation #
  this.authService.logout(); // 🔹 logout Keycloak → redirection vers /accueil
}


}

