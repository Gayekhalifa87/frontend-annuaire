import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Employe, EmployeService, ExternalAgent } from '../../../core/employe.service';
import { AuthService } from '../../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent implements OnInit {

  agents: ExternalAgent[] = [];
  filteredAgents: ExternalAgent[] = []; 
  searchTerm: string = '';              
  isLoading = false;
  error: string | null = null;

  // Pagination
  totalItems: number = 0;
  itemsPerPage: number = 10; 
  totalPages: number = 0;
  pages: number[] = [];
  currentPage: number = 0; // ✅ corrige: number au lieu de any, initialisé à 0

  constructor(
    private router: Router,
    private employeService: EmployeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExternalAgents();  
  }

  updatePagination(): void {
    this.totalItems = this.filteredAgents.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);

    if (this.currentPage >= this.totalPages) {
      this.currentPage = 0;
    }
  }

  get paginatedAgents(): ExternalAgent[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.filteredAgents.slice(start, start + this.itemsPerPage);
  }

  loadExternalAgents(): void {
    this.isLoading = true;
    this.error = null;

    this.employeService.getAllExternalAgents(0, 100000).subscribe({
      next: (response) => {
        this.agents = response.results || [];
        
        this.employeService.getAllCombinedEmployes().subscribe({
          next: (combined) => {
            this.agents.forEach(agent => {
              const assigned = combined.find(emp => emp.employeId === agent.id);
              if (assigned) {
                agent.ip = assigned.ip;
              }
            });
            
            this.sortAgents(this.agents);
            this.filteredAgents = [...this.agents];
            this.updatePagination(); // ✅ appelé ici après avoir rempli filteredAgents
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.error = 'Impossible de charger la liste des agents.';
        this.isLoading = false;
      }
    });
  }

  /** Recherche live + tri automatique */
  onSearch(): void {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.filteredAgents = [...this.agents];
    } else {
      this.filteredAgents = this.agents.filter(agent => {
        const fullName = String(agent.fullName || '');
        const matricule = String(agent.matricule ?? '');
        const email = String(agent.email || '');
        const telephone = String(agent.telephone ?? '');

        return fullName.toLowerCase().includes(term)
          || matricule.toLowerCase().includes(term)
          || email.toLowerCase().includes(term)
          || telephone.toLowerCase().includes(term);
      });
    }
    this.sortAgents(this.filteredAgents);
    this.updatePagination(); // ✅ met à jour après recherche
  }

  /** Tri stable par nom (francophone), fallback sur matricule */
  private sortAgents(list: ExternalAgent[]) {
    list.sort((a, b) => {
      const aKey = String(a.fullName || a.matricule || '').trim();
      const bKey = String(b.fullName || b.matricule || '').trim();
      return aKey.localeCompare(bKey, 'fr', { sensitivity: 'base' });
    });
  }

  // --- Ajout employé (inchangé) ---
  newEmploye: Employe = {
    employeId: 0,
    ip: undefined,
    telephone: '',
    role: 'USER',
    password: 'ChangeMe123!' 
  };
  selectedAgent: ExternalAgent | null = null;

  openAddEmploye(agent: ExternalAgent): void {
    this.selectedAgent = agent;
    this.newEmploye = {
      employeId: agent.id,
      ip: undefined,
      telephone: '',
      role: 'USER',
      password: 'password123!'
    };

    const modal = new (window as any).bootstrap.Modal(document.getElementById('addEmployeModal'));
    modal.show();
  }

  addEmploye(): void {
    if (!this.newEmploye || !this.newEmploye.employeId) return;

    this.employeService.addEmploye(this.newEmploye).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Employé ajouté avec succès !`,
          timer: 2000,
          showConfirmButton: false
        });
        this.newEmploye = { employeId: 0, ip: undefined, telephone: '', role: 'USER', password: 'ChangeMe123!' };
        this.selectedAgent = null;

        const modalEl = document.getElementById('addEmployeModal');
        if (modalEl) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
          modal?.hide();
        }
        this.loadExternalAgents();
      },
      error: (err) => {
        console.error('Erreur ajout employé :', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.error?.message || 'Erreur lors de l’ajout ❌'
        });
      }
    });
  }

  // --- Navigation ---
  retour(): void {
    this.router.navigate(['admin/']);
  }
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }

  // --- Pagination ---
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }
  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }
  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
