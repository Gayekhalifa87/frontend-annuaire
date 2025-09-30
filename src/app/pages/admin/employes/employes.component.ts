import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Employe, EmployeService, ExternalAgent } from '../../../core/employe.service';
import { AuthService } from '../../../core/auth.service';

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

  constructor(
    private router: Router,
    private employeService: EmployeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExternalAgents();
  }

  loadExternalAgents(): void {
    this.isLoading = true;
    this.error = null;
    this.employeService.getAllExternalAgents(0, 100000).subscribe({
      next: (response) => {
        this.agents = response.results || [];
        // Trier puis initialiser filteredAgents
        this.sortAgents(this.agents);
        this.filteredAgents = [...this.agents];
        this.isLoading = false;
        console.log('Agents chargés :', this.agents);
      },
      error: (err) => {
        console.error('Erreur :', err);
        this.error = 'Impossible de charger la liste des agents.';
        this.agents = [];
        this.filteredAgents = [];
        this.isLoading = false;
      }
    });
  }

  /** Recherche live + tri automatique */
  onSearch(): void {
    const term = (this.searchTerm || '').toString().toLowerCase().trim();
    if (!term) {
      this.filteredAgents = [...this.agents];
      this.sortAgents(this.filteredAgents);
      return;
    }

    this.filteredAgents = this.agents.filter(agent => {
      // Toujours convertir en string avant toLowerCase (évite l'erreur)
      const fullName = String(agent.fullName || '');
      const matricule = String(agent.matricule ?? '');
      const email = String(agent.email || '');
      const telephone = String(agent.telephone ?? '');

      return fullName.toLowerCase().includes(term)
        || matricule.toLowerCase().includes(term)
        || email.toLowerCase().includes(term)
        || telephone.toLowerCase().includes(term);
    });

    // Tri automatique après filtrage
    this.sortAgents(this.filteredAgents);
  }

  /** Tri stable par nom (francophone), fallback sur matricule */
  private sortAgents(list: ExternalAgent[]) {
    list.sort((a, b) => {
      const aKey = String(a.fullName || a.matricule || '').trim();
      const bKey = String(b.fullName || b.matricule || '').trim();
      return aKey.localeCompare(bKey, 'fr', { sensitivity: 'base' });
    });
  }




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
    employeId: agent.id,  // on prend l'ID externe
    ip: undefined,
    telephone: '',
    role: 'USER',
    password: 'password123!' // mot de passe par défaut
  };

  // Ouvrir le modal Bootstrap
  const modal = new (window as any).bootstrap.Modal(document.getElementById('addEmployeModal'));
  modal.show();
}

addEmploye(): void {
  if (!this.newEmploye || !this.newEmploye.employeId) return;

  this.employeService.addEmploye(this.newEmploye).subscribe({
    next: (res) => {
      console.log('Employé ajouté avec succès :', res);
      alert('Employé ajouté avec succès ✅');
    },
    error: (err) => {
      console.error('Erreur ajout employé :', err);
      alert('Erreur lors de l’ajout ❌');
    }
  });
}


  retour(): void {
    this.router.navigate(['admin/']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/accueil']);
  }
}
