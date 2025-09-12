import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employe {
  id?: number;          
  ip?: number;          
  telephone?: string;   
  role?: string;
  nom?: string;
  prenom?: string;
  password?: string;
  email?: string;
  direction?: string;
  service?: string;
  poste?: string;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  private apiUrl = 'http://localhost:8080/api/employes';

  
  constructor(private http: HttpClient) { }

  // Tous les employés combinés
  getAllCombinedEmployes(): Observable<Employe[]> {
    return this.http.get<Employe[]>(`${this.apiUrl}/combined`);
  }

  // Changement de rôle d'un employé (USER ↔ ADMIN)
 switchRole(id: number): Observable<Employe> {
  return this.http.patch<Employe>(`${this.apiUrl}/${id}`, {});
}

  //Modifier un employé
  updateEmploye(id: number, employee: Employe): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employee);
  }
deleteEmploye(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}



  // Recherche par IP
searchByIp(ip: number): Observable<Employe | null> {
  return this.http.get<Employe>(`${this.apiUrl}/search`, { params: { ip: ip.toString() } });
}



}