import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChefInfo, EmployeService, ExternalAgent } from '../../../core/employe.service';
import { Router } from '@angular/router';

interface HierarchyNode {
  id: number;
  matricule: number;
  fullName: string;
  email: string;
  fonction?: string;
  direction?: string;
  level: number;
  children: HierarchyNode[];
}

@Component({
  selector: 'app-organigramme',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organigramme.component.html',
  styleUrls: ['./organigramme.component.css']
})
export class OrganigrammeComponent implements OnInit {
  
  agents: ExternalAgent[] = [];
  searchTerm: string = '';
  selectedAgent: ExternalAgent | null = null;
  hierarchy: HierarchyNode[] = [];
  isLoading = false;

  showAgentList: boolean = true; 

  constructor(
    private employeService: EmployeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  selectAgent(agent: ExternalAgent): void {
  this.selectedAgent = agent;
  this.buildHierarchy(agent);

  // Fermer la liste sur les petits écrans
  if (window.innerWidth < 768) { // <768px = taille mobile / tablette
    this.showAgentList = false;
  }
}

  loadAgents(): void {
    this.isLoading = true;
    this.employeService.getAllExternalAgents(0, 100000).subscribe({
      next: (response) => {
        this.agents = response.results || [];
        this.isLoading = false;
        console.log('Agents chargés :', this.agents);
      },
      error: (err) => {
        console.error('Erreur chargement agents:', err);
        this.isLoading = false;
      }
    });
  }

  // Filtrer les agents selon la recherche
  get filteredAgents(): ExternalAgent[] {
    if (!this.searchTerm) return this.agents;
    
    const term = this.searchTerm.toLowerCase();
    return this.agents.filter(agent => 
      agent.fullName?.toLowerCase().includes(term) ||
      agent.matricule?.toString().includes(term) ||
      agent.email?.toLowerCase().includes(term)
    );
  }

 

  // Construire la hiérarchie à partir d'un agent
  buildHierarchy(agent: ExternalAgent): void {
    this.hierarchy = [];
    
    if (!agent.chef) {
      // Pas de chef, l'agent est au sommet
      this.hierarchy.push(this.agentToNode(agent, 0));
      return;
    }

    // Construire la chaîne hiérarchique remontante
    const chain: HierarchyNode[] = [];
    let currentLevel = 0;
    
    // L'agent sélectionné
    chain.push(this.agentToNode(agent, currentLevel));
    
    // Remonter la hiérarchie
    let currentChef: ChefInfo | undefined = agent.chef;
    while (currentChef) {
      currentLevel++;
      const chefNode: HierarchyNode = {
        id: currentChef.id,
        matricule: currentChef.matricule,
        fullName: currentChef.fullName,
        email: currentChef.email,
        fonction: currentChef.fonction,
        direction: currentChef.direction,
        level: currentLevel,
        children: []
      };
      chain.push(chefNode);
      currentChef = currentChef.chef; 
    }

    // Inverser pour avoir le top manager en haut
    this.hierarchy = chain.reverse();
  }

  // Convertir ExternalAgent en HierarchyNode
  private agentToNode(agent: ExternalAgent, level: number): HierarchyNode {
    return {
      id: agent.id,
      matricule: agent.matricule,
      fullName: agent.fullName,
      email: agent.email,
      fonction: agent.fonction?.name,
      direction: agent.direction?.name,
      level: level,
      children: []
    };
  }

  retour(): void {
    this.router.navigate(['/admin']);
  }
}