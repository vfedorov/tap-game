import { jwtDecode } from 'jwt-decode';
import { makeAutoObservable } from 'mobx';

class AuthStore {
	token: string | null = localStorage.getItem('token') || null;

	constructor() {
		makeAutoObservable(this);
	}

	get isAuthenticated() {
		return !!this.token;
	}

	get isAdmin() {
		if (!this.token) return false;
		try {
			const decoded = jwtDecode(this.token) as any;
			return decoded.role === 'admin';
		} catch {
			return false;
		}
	}

	setToken(token: string) {
		this.token = token;
		localStorage.setItem('token', token);
	}

	logout() {
		this.token = null;
		localStorage.removeItem('token');
	}
}

export const authStore = new AuthStore();
