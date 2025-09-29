// Remplacer complètement employes.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeService, ExternalAgent, ExternalAgentResponse, Employe } from '../../../core/employe.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employes.component.html',
  styleUrl: './employes.component.css'
})
export class EmployesComponent implements OnInit {
  
  agents: ExternalAgent[] = [];
  filteredAgents: ExternalAgent[] = [];
  employesInternes: Employe[] = []; // Pour stocker les employés déjà dans la base interne
  
  // Pagination
  currentPage = 0;
  pageSize = 15;
  totalAgents = 0;
  
  // Pagination locale (pour la recherche)
  paginatedAgents: ExternalAgent[] = [];
  totalPages = 0;
  pages: number[] = [];
  
  // Recherche
  searchTerm = '';
  
  // Loading
  isLoading = false;
  
  // Modal d'assignation
  showAssignModal = false;
  assignForm: FormGroup;
  selectedAgent: ExternalAgent | null = null;
  
  // Statistiques
  agentsWithPhone = 0;
  agentsWithoutPhone = 0;
  agentsAssigned = 0;
  agentsNotAssigned = 0;

  constructor(
    private router: Router,
    private employeService: EmployeService,
    private fb: FormBuilder
  ) {
    this.assignForm = this.fb.group({
      ip: ['', [Validators.required, Validators.min(1)]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]]
    });
  }

  ngOnInit() {
    this.loadAllData();
  }

  /** Charger toutes les données */
  loadAllData() {
    this.isLoading = true;
    
    // Charger d'abord les employés internes
    this.employeService.getAllCombinedEmployes().subscribe({
      next: (employes) => {
        this.employesInternes = employes;
        // Ensuite charger les agents externes
        this.loadAllExternalAgents();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des employés internes:', err);
        // Continuer quand même avec les agents externes
        this.loadAllExternalAgents();
      }
    });
  }

  /** Charger TOUS les agents externes en une seule fois */
  loadAllExternalAgents() {
    // Utiliser une taille très grande pour récupérer tous les agents
    this.employeService.getAllExternalAgents(0, 100000).subscribe({
      next: (response: ExternalAgentResponse) => {
        this.agents = response.content;
        this.filteredAgents = [...this.agents];
        this.totalAgents = this.agents.length;
        this.calculatePagination();
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des agents:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: 'Impossible de charger les données depuis l\'API externe'
        });
      }
    });
  }

  /** Calculer les statistiques */
  calculateStatistics() {
    // Compter les agents avec/sans téléphone
    this.agentsWithPhone = this.agents.filter(a => a.telephone && a.telephone.trim() !== '').length;
    this.agentsWithoutPhone = this.agents.length - this.agentsWithPhone;
    
    // Compter combien d'agents ont déjà été assignés (présents dans la base interne)
    this.agentsAssigned = this.agents.filter(agent => 
      this.isAgentAssigned(agent.id)
    ).length;
    this.agentsNotAssigned = this.agents.length - this.agentsAssigned;
  }

  /** Vérifier si un agent est déjà assigné dans la base interne */
  isAgentAssigned(agentId: number): boolean {
    return this.employesInternes.some(emp => emp.employeId === agentId);
  }

  /** Récupérer les infos d'un agent assigné */
  getAssignedInfo(agentId: number): Employe | undefined {
    return this.employesInternes.find(emp => emp.employeId === agentId);
  }

  /** Calculer la pagination locale */
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredAgents.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
    
    if (this.currentPage >= this.totalPages) {
      this.currentPage = Math.max(0, this.totalPages - 1);
    }
    
    this.updatePaginatedAgents();
  }

  /** Mettre à jour les agents paginés */
  updatePaginatedAgents() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedAgents = this.filteredAgents.slice(start, end);
  }

  /** Navigation pagination */
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAgents();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /** Recherche locale */
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredAgents = [...this.agents];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredAgents = this.agents.filter(agent =>
        agent.fullName?.toLowerCase().includes(term) ||
        agent.matricule?.toString().includes(term) ||
        agent.email?.toLowerCase().includes(term) ||
        agent.direction?.nom?.toLowerCase().includes(term) ||
        agent.fonction?.nom?.toLowerCase().includes(term) ||
        agent.telephone?.includes(term)
      );
    }
    
    this.currentPage = 0;
    this.calculatePagination();
  }

  /** Effacer la recherche */
  clearSearch() {
    this.searchTerm = '';
    this.filteredAgents = [...this.agents];
    this.currentPage = 0;
    this.calculatePagination();
  }

  /** Ouvrir le modal d'assignation */
  openAssignModal(agent: ExternalAgent) {
    this.selectedAgent = agent;
    this.assignForm.reset();
    
    // Vérifier si l'agent a déjà des infos assignées
    const assignedInfo = this.getAssignedInfo(agent.id);
    if (assignedInfo) {
      Swal.fire({
        title: 'Agent déjà assigné',
        html: `
          <p>Cet agent a déjà des informations assignées:</p>
          <p><strong>IP:</strong> ${assignedInfo.ip}</p>
          <p><strong>Téléphone:</strong> ${assignedInfo.telephone}</p>
          <p>Voulez-vous les modifier?</p>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          // Pré-remplir avec les valeurs existantes
          this.assignForm.patchValue({
            ip: assignedInfo.ip,
            telephone: assignedInfo.telephone
          });
          this.showAssignModal = true;
        }
      });
      return;
    }
    
    // Si l'agent a un téléphone dans l'API externe, le pré-remplir
    if (agent.telephone) {
      this.assignForm.patchValue({ telephone: agent.telephone });
    }
    
    this.showAssignModal = true;
  }

  /** Fermer le modal */
  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedAgent = null;
    this.assignForm.reset();
  }

  /** Assigner IP et téléphone */
  assignIpAndPhone() {
    if (this.assignForm.invalid || !this.selectedAgent) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire invalide',
        text: 'Veuillez remplir tous les champs correctement'
      });
      return;
    }

    const formData = this.assignForm.value;
    
    // Créer un nouvel employé dans la base interne
    const newEmploye: Employe = {
      employeId: this.selectedAgent.id,
      ip: formData.ip,
      telephone: formData.telephone,
      password: 'Passer@123', // Mot de passe par défaut
      role: 'USER'
    };

    this.employeService.createEmploye(newEmploye).subscribe({
      next: (created) => {
        Swal.fire({
          icon: 'success',
          title: 'Assignation réussie',
          html: `
            <p>IP <strong>${formData.ip}</strong> et téléphone <strong>${formData.telephone}</strong></p>
            <p>assignés à <strong>${this.selectedAgent?.fullName}</strong></p>
            <small class="text-muted">Mot de passe par défaut: Passer@123</small>
          `,
          timer: 3000
        });
        this.closeAssignModal();
        // Recharger les données pour mettre à jour les statistiques
        this.loadAllData();
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation:', err);
        
        let errorMessage = 'Impossible d\'assigner les informations';
        if (err.status === 409 || err.error?.message?.includes('déjà')) {
          errorMessage = 'Cet IP ou ce téléphone est déjà utilisé par un autre employé';
        } else if (err.status === 400) {
          errorMessage = 'Données invalides. Vérifiez le format de l\'IP et du téléphone';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Erreur d\'assignation',
          text: errorMessage
        });
      }
    });
  }

  /** Séparer fullName en prénom et nom */
  getFirstName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[0] || '';
  }

  getLastName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts.slice(1).join(' ') || '';
  }

  /** Voir les détails d'un agent */
  viewAgentDetails(agent: ExternalAgent) {
    const assignedInfo = this.getAssignedInfo(agent.id);
    const hasAssignedInfo = assignedInfo !== undefined;
    
    Swal.fire({
      title: `Détails - ${agent.fullName}`,
      html: `
        <div class="text-start" style="max-height: 400px; overflow-y: auto;">
          <h6 class="text-primary mb-3">Informations API Externe</h6>
          <p><strong>ID:</strong> ${agent.id}</p>
          <p><strong>Matricule:</strong> ${agent.matricule || 'Non renseigné'}</p>
          <p><strong>Email:</strong> ${agent.email || 'Non renseigné'}</p>
          <p><strong>Téléphone:</strong> ${agent.telephone || 'Non renseigné'}</p>
          <p><strong>Direction:</strong> ${agent.direction?.nom || 'Non renseignée'}</p>
          <p><strong>Fonction:</strong> ${agent.fonction?.nom || 'Non renseignée'}</p>
          <p><strong>Statut:</strong> ${agent.active ? '<span class="badge bg-success">Actif</span>' : '<span class="badge bg-secondary">Inactif</span>'}</p>
          
          ${hasAssignedInfo ? `
            <hr>
            <h6 class="text-success mb-3">Informations Assignées</h6>
            <p><strong>IP:</strong> ${assignedInfo.ip}</p>
            <p><strong>Téléphone interne:</strong> ${assignedInfo.telephone}</p>
            <p><strong>Rôle:</strong> <span class="badge ${assignedInfo.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">${assignedInfo.role}</span></p>
          ` : '<hr><p class="text-warning">⚠️ Aucune information assignée dans la base interne</p>'}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Fermer',
      width: '600px'
    });
  }

  /** Retour à la page admin */
  retour(): void {
    this.router.navigate(['admin/']);
  }

  /** TrackBy pour la performance */
  trackByAgentId(index: number, agent: ExternalAgent): number {
    return agent.id;
  }
}