import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../api/client';

export interface Round {
  id: number;
  startDate: string;
  endDate: string;
  totalTaps: number;
  totalScore: number;
  userRounds?: any[];
  winner?: {
    username: string;
    totalScore: number;
  };
}

export interface UserStats {
  tapCount: number;
  totalScore: number;
}

class RoundsStore {
  rounds: Round[] = [];
  currentRound: Round | null = null;
  userStats: UserStats = { tapCount: 0, totalScore: 0 };
  loading = false;
  error = '';
  timeLeft: number | null = null;
  isTapping = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchRounds(token: string) {
    this.loading = true;
    try {
      const response = await apiClient.get('/rounds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      runInAction(() => {
        this.rounds = response.data;
        this.error = '';
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = 'Failed to load rounds';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchRound(id: string, token: string) {
    this.loading = true;
    try {
      const response = await apiClient.get(`/rounds/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      runInAction(() => {
        this.currentRound = response.data;
        this.userStats = response.data.userStats || { tapCount: 0, totalScore: 0 };
        this.error = '';
        this.updateTimeLeft();
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = 'Failed to load round details';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async createRound(token: string): Promise<Round> {
    try {
      const response = await apiClient.post(
        '/rounds',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newRound = response.data;
      runInAction(() => {
        this.rounds.push(newRound);
      });
      return newRound;
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to create round';
      });
      throw err;
    }
  }

  async tapRound(id: string, token: string) {
    if (!this.currentRound || this.isTapping) return;

    this.isTapping = true;
    try {
      const response = await apiClient.post(
        `/taps/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      runInAction(() => {
        this.userStats = {
          tapCount: response.data.tapCount,
          totalScore: response.data.totalScore,
        };

        if (this.currentRound) {
          this.currentRound = {
            ...this.currentRound,
            totalTaps: this.currentRound.totalTaps + 1,
            totalScore:
              this.currentRound.totalScore + (response.data.totalScore - this.userStats.totalScore),
          };
        }
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = 'Failed to register tap';
      });
      throw err;
    } finally {
      runInAction(() => {
        this.isTapping = false;
      });
    }
  }

  updateTimeLeft() {
    if (!this.currentRound) return;

    const now = new Date();
    const startDate = new Date(this.currentRound.startDate);
    const endDate = new Date(this.currentRound.endDate);

    if (now < startDate) {
      this.timeLeft = Math.floor((startDate.getTime() - now.getTime()) / 1000);
    } else if (now < endDate) {
      this.timeLeft = Math.floor((endDate.getTime() - now.getTime()) / 1000);
    } else {
      this.timeLeft = 0;
    }
  }

  getRoundStatus(): 'scheduled' | 'active' | 'finished' {
    if (!this.currentRound) return 'scheduled';

    const now = new Date();
    const startDate = new Date(this.currentRound.startDate);
    const endDate = new Date(this.currentRound.endDate);

    if (now >= startDate && now <= endDate) return 'active';
    if (now > endDate) return 'finished';
    return 'scheduled';
  }

  clearCurrentRound() {
    this.currentRound = null;
    this.userStats = { tapCount: 0, totalScore: 0 };
    this.timeLeft = null;
  }
}

export const roundsStore = new RoundsStore();

setInterval(() => {
  if (roundsStore.currentRound) {
    roundsStore.updateTimeLeft();
  }
}, 1000);
