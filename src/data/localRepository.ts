import type { AppState } from '../domain/types';
import { buildSeed } from './seed';
import type { WorkforceRepository } from './repository';

const STORAGE_KEY = 'sitesafe-demo-v2';

export class LocalWorkforceRepository implements WorkforceRepository {
  load(today: Date): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return buildSeed(today);
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.workers)) return buildSeed(today);
      return parsed;
    } catch {
      return buildSeed(today);
    }
  }

  save(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  reset(today: Date): AppState {
    const next = buildSeed(today);
    this.save(next);
    return next;
  }
}
