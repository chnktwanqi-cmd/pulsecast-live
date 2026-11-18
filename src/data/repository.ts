import type { AppState } from '../domain/types';

/**
 * Persistence seam. A future API repository can implement the same two methods
 * and the React store does not need to know whether the data is local or remote.
 */
export interface WorkforceRepository {
  load(today: Date): AppState;
  save(state: AppState): void;
  reset(today: Date): AppState;
}
