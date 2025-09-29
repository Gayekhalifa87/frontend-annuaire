// MODIFIER votre fichier employe.service.ts existant

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employe {
  employeId: number;
  id?: number;
  ip?: number;
  telephone?: string;
  role?: string;
  nom?: string;
  prenom?: string;
  matricule?: string;
  password?: string;
  email?: string;
  direction?: string;
  service?: string;
  poste?: string;
}

// ✅ AJOUTER ces nouvelles interfaces pour l'API externe
export interface ExternalAgent {
  id: number;
  fullName: string;
  matricule: String;
  email: string;
  telephone: string;
  direction?: {
    nom: string;
    code: string;
  };
  fonction?: {
    nom: string;
    code: string;
  };
  active: boolean;
}

export interface ExternalAgentResponse {
  content: ExternalAgent[];
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  private apiUrl = 'http://localhost:8080/api/employes';
  private externalApiUrl = 'http://10.106.136.126:9003/api/v1/agent2/agent';

  constructor(private http: HttpClient) { }

  // Méthodes existantes...
  getAllCombinedEmployes(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.apiUrl}/combined`);
  }

  switchRole(id: number): Observable<Employe> {
    return this.http.patch<Employe>(`${this.apiUrl}/${id}`, {});
  }

  updateEmploye(id: number, employee: Employe): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmploye(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchByIp(ip: number): Observable<Employe | null> {
    return this.http.get<Employe>(`${this.apiUrl}/search`, { params: { ip: ip.toString() } });
  }

  // ✅ AJOUTER ces nouvelles méthodes pour l'API externe
  
  // Récupérer tous les agents externes avec pagination
  getAllExternalAgents(page: number = 0, size: number = 20): Observable<ExternalAgentResponse> {
    return this.http.get<ExternalAgentResponse>(`${this.externalApiUrl}?page=${page}&size=${size}`);
  }

  // Récupérer un agent externe par son ID
  getExternalAgentById(id: number): Observable<ExternalAgent> {
    return this.http.get<ExternalAgent>(`${this.externalApiUrl}/${id}`);
  }

  // Tester la connexion à l'API externe
  testExternalConnection(): Observable<string> {
    return this.http.get(`${this.externalApiUrl}/test`, { responseType: 'text' });
  }

  // ✅ AJOUTER cette méthode pour créer un employé
  createEmploye(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe);
  }
}