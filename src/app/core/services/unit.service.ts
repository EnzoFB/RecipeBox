import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Unit, DEFAULT_UNITS } from '../models/unit.model';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private readonly units$ = new BehaviorSubject<Unit[]>(DEFAULT_UNITS);

  constructor() {
    this.loadUnits();
  }

  private loadUnits(): void {
    if (globalThis.window && (globalThis.window as any).electronAPI) {
      (globalThis.window as any).electronAPI.units?.getAll?.()
        .then((units: Unit[]) => {
          if (units && units.length > 0) {
            this.units$.next(units);
          }
        })
        .catch((err: any) => {
          console.error('Error loading units:', err);
        });
    }
  }

  getUnits(): Observable<Unit[]> {
    return this.units$.asObservable();
  }

  getUnitsSync(): Unit[] {
    return this.units$.value;
  }

  getUnitById(id: number): Unit | undefined {
    return this.units$.value.find(u => u.id === id);
  }

  getUnitByName(name: string): Unit | undefined {
    return this.units$.value.find(u => u.name === name);
  }

  getUnitBySymbol(symbol: string): Unit | undefined {
    return this.units$.value.find(u => u.symbol === symbol);
  }
}
