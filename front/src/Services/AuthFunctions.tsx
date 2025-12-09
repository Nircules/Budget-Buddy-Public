import UserModel from "../Models/UserModel";
import UserProfileModel from "../Models/UserProfileModel";
import config, { api, scheduleTokenRefresh } from "../Utils/Config";

interface TokenResponse {
	access: string;
	refresh: string;
	username?: string;
}


class AuthFunctions {
	/**
	 * Get current user info
	 * Note: The backend now returns the logged-in user's data
	 */
	public async getCurrentUser(): Promise<UserModel> {
		try {
			const response = await api.get<UserModel>(config.usersUrl);
			return response.data;
		} catch (error) {
			throw new Error("Error fetching current user: " + error);
		}
	}

	/**
	 * @deprecated Use getCurrentUser() instead
	 * Kept for backwards compatibility
	 */
	public async getUserById(user_id: number): Promise<UserModel> {
		try {
			const response = await api.get<UserModel>(
				`${config.usersUrl}${user_id}/`
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching user:", error);
			throw new Error("Error fetching user by ID: " + error);
		}
	}

	public async getUserProfileById(
		user_id: number
	): Promise<UserProfileModel> {
		try {
			const response = await api.get<UserProfileModel>(
				config.usersProfilesUrl
			);
			return response.data;
		} catch (error: any) {
			// Only log if it's not a 401 (which is handled by the interceptor)
			if (error?.response?.status !== 401) {
				console.error("Error fetching user profile:", error);
			}
			throw error;
		}
	}

	public async getAllProfiles(): Promise<UserProfileModel[]> {
		const response = await api.get<UserProfileModel[]>(
			config.usersProfilesUrl
		);
		return response.data;
	}

	public async getAllUsers(): Promise<UserModel[]> {
		const response = await api.get<UserModel[]>(config.usersUrl);
		return response.data;
	}

	public async login(credentials: UserModel): Promise<void> {
		const response = await fetch(config.loginUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: credentials.username.toLowerCase(),
				password: credentials.password,
			}),
		});

		const token: TokenResponse = await response.json();

		if (response.ok) {
			// Save separately – easier to use later
			localStorage.setItem("accessToken", token.access);
			localStorage.setItem("refreshToken", token.refresh);
			localStorage.setItem("lastRefresh", Date.now().toString());

			// Set header on the shared API instance (not global axios)
			api.defaults.headers.common["Authorization"] = `Bearer ${token.access}`;

			// Start proactive token refresh timer
			scheduleTokenRefresh();

			return;
		}

		if (response.status === 401) {
			throw new Error("No Such User.");
		}

		throw new Error("Something went wrong!");
	}

	public async register(new_user: UserModel): Promise<UserModel> {
		const response = await api.post<UserModel>(config.registerUrl, {
			username: new_user.username.toLowerCase(),
			password: new_user.password,
		});
		return response.data;
	}

	public async updateUser(
		profile: UserProfileModel,
		user_id: number
	): Promise<UserProfileModel> {
		const formData = new FormData();
		formData.append("first_name", profile.first_name);
		formData.append("last_name", profile.last_name);
		formData.append("email", profile.email);
		formData.append("pay_day", profile.pay_day);
		formData.append("salary_day", profile.salary_day);
		formData.append("saving_target", profile.saving_target.toString());
		formData.append("expected_income", profile.expected_income.toString());
		const response = await api.put<UserProfileModel>(
			config.usersProfilesUrl + user_id,
			formData
		);
		return response.data;
	}
}

const authFunctions = new AuthFunctions();
export default authFunctions;
