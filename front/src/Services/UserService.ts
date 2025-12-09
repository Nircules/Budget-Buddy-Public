import { api } from "../Utils/Config";
import config from "../Utils/Config";
import axios from "axios";

class UserService {
	/**
	 * Check if an email is available (not already used by another user)
	 * @param email - Email to check
	 * @returns Promise<boolean> - true if available, false if taken
	 */
	public async checkEmailAvailability(email: string): Promise<boolean> {
		try {
			const response = await api.post<{
				available: boolean;
				email: string;
			}>(config.checkEmailUrl, { email });
			return response.data.available;
		} catch (error) {
			console.error("Error checking email availability:", error);
			// On error, assume email is not available to be safe
			return false;
		}
	}

	/**
	 * Check if a username is available (not already taken)
	 * @param username - Username to check
	 * @returns Promise<boolean> - true if available, false if taken
	 * Note: This is a public endpoint (no auth required) for registration
	 */
	public async checkUsernameAvailability(username: string): Promise<boolean> {
		try {
			// Use regular axios instead of api instance (no auth needed)
			const response = await axios.post<{
				available: boolean;
				username: string;
			}>(config.checkUsernameUrl, { username });
			return response.data.available;
		} catch (error) {
			console.error("Error checking username availability:", error);
			// On error, assume username is not available to be safe
			return false;
		}
	}

	/**
	 * Debounced email check for real-time validation
	 * Use this in your input onChange handlers
	 */
	public debounceEmailCheck = (() => {
		let timeout: NodeJS.Timeout;
		return (
			email: string,
			callback: (available: boolean) => void,
			delay: number = 500
		) => {
			clearTimeout(timeout);
			timeout = setTimeout(async () => {
				const available = await this.checkEmailAvailability(email);
				callback(available);
			}, delay);
		};
	})();

	/**
	 * Debounced username check for real-time validation
	 * Use this in your registration form onChange handlers
	 */
	public debounceUsernameCheck = (() => {
		let timeout: NodeJS.Timeout;
		return (
			username: string,
			callback: (available: boolean) => void,
			delay: number = 4900
		) => {
			clearTimeout(timeout);
			timeout = setTimeout(async () => {
				const available = await this.checkUsernameAvailability(
					username
				);
				callback(available);
			}, delay);
		};
	})();
}

const userService = new UserService();
export default userService;
