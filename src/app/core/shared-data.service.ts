import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }

    private totalAgentsSource = new BehaviorSubject<number>(0);
  totalAgents$ = this.totalAgentsSource.asObservable();

  setTotalAgents(count: number) {
    this.totalAgentsSource.next(count);
  }
}
