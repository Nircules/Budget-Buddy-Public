import axios from "axios";

class Config {
	public supportEmail = "your-email@example.com";
	public supportPhone = "+1234567890";
	public supportPage = "";

	public serverUrl =
		process.env.REACT_APP_API_URL ?? "http://localhost:8000/";

	public loginUrl = this.serverUrl + "accounts/token/";
	public refreshUrl = this.serverUrl + "accounts/token/refresh/";

	public usersUrl = this.serverUrl + "users/";
	public registerUrl = this.serverUrl + "register/";
	public usersProfilesUrl = this.serverUrl + "user_profile/";
	public checkEmailUrl = this.serverUrl + "check_email/";
	public checkUsernameUrl = this.serverUrl + "check_username/";

	public expensesUrl = this.serverUrl + "expenses/";
	public recurringExpensesUrl = this.serverUrl + "recurring_expenses/";

	public incomesUrl = this.serverUrl + "incomes/";
	public recurringIncomesUrl = this.serverUrl + "recurring_incomes/";

	public tasksUrl = this.serverUrl + "tasks/";
	public userCategoriesUrl = this.serverUrl + "categories/";
	public budgetsUrl = this.serverUrl + "budgets/";
}

const config = new Config();
export default config;

// -------- AXIOS INSTANCE --------

export const api = axios.create({
	baseURL: config.serverUrl,
});

// Small helper to set/remove the auth header
export const setAuthHeader = (accessToken: string | null) => {
	if (accessToken) {
		api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
	} else {
		delete api.defaults.headers.common["Authorization"];
	}
};

// -------- REFRESH LOGIC --------

// IMPORTANT: you have ROTATE_REFRESH_TOKENS=True, so we must
// update BOTH access and refresh tokens on refresh.
export const refreshAccessToken = async (): Promise<string> => {
	const refresh = localStorage.getItem("refreshToken");
	if (!refresh) throw new Error("No refresh token");

	try {
		// Full URL, global axios (no interceptor on this)
		const res = await axios.post<{ access: string; refresh: string }>(
			config.serverUrl + "accounts/token/refresh/",
			{ refresh }
		);

		const { access, refresh: newRefresh } = res.data;

		// CRITICAL: Save tokens immediately and synchronously
		localStorage.setItem("accessToken", access);
		localStorage.setItem("refreshToken", newRefresh);
		localStorage.setItem("lastRefresh", Date.now().toString());
		setAuthHeader(access);

		return access;
	} catch (error: any) {
		// If refresh fails, clear everything
		console.error("Refresh token invalid or expired");
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("lastRefresh");
		setAuthHeader(null);
		throw error;
	}
};

// Auto-refresh token before it expires (proactive refresh)
// Access token lifetime is 5 minutes, so refresh after 4 minutes
let refreshTimer: NodeJS.Timeout | null = null;

export const scheduleTokenRefresh = () => {
	// Clear any existing timer
	if (refreshTimer) {
		clearTimeout(refreshTimer);
	}

	// Schedule refresh for 4 minutes (before 5 minute expiration)
	refreshTimer = setTimeout(async () => {
		const accessToken = localStorage.getItem("accessToken");
		const refreshToken = localStorage.getItem("refreshToken");

		if (accessToken && refreshToken) {
			try {
				await refreshAccessToken();
				// Schedule the next refresh
				scheduleTokenRefresh();
			} catch (e) {
				console.error("Failed to proactively refresh token", e);
				// Don't schedule again if refresh failed
				cancelTokenRefresh();
			}
		}
	}, 240000); // 4 minutes
};

// Check if we need to refresh on app load (user returned after being away)
export const checkAndRefreshToken = async (): Promise<boolean> => {
	const accessToken = localStorage.getItem("accessToken");
	const refreshToken = localStorage.getItem("refreshToken");
	const lastRefresh = localStorage.getItem("lastRefresh");

	if (!accessToken || !refreshToken) {
		return false;
	}

	// If we have tokens, check if access token might be expired
	// If last refresh was more than 4.5 minutes ago, proactively refresh
	if (lastRefresh) {
		const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
		const fourAndHalfMinutes = 270000; // 4.5 minutes in ms

		if (timeSinceRefresh > fourAndHalfMinutes) {
			try {
				await refreshAccessToken();
				return true;
			} catch (e) {
				console.error("Token refresh failed on load", e);
				return false;
			}
		}
	}

	// Token seems fresh, just set the header
	setAuthHeader(accessToken);
	return true;
};

export const cancelTokenRefresh = () => {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
};

// Add visibility change listener to refresh token when user returns
if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", async () => {
		if (!document.hidden) {
			// User returned to the tab
			const lastRefresh = localStorage.getItem("lastRefresh");
			if (lastRefresh) {
				const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
				// If more than 4 minutes since last refresh, do it now
				if (timeSinceRefresh > 240000) {
					try {
						await refreshAccessToken();
						scheduleTokenRefresh();
					} catch (e) {
						console.error("Failed to refresh on tab return", e);
					}
				}
			}
		}
	});
}

// -------- INTERCEPTOR --------

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let failedQueue: Array<{
	resolve: (value?: any) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config as any;

		if (!error.response) {
			return Promise.reject(error);
		}

		const isUnauthorized = error.response.status === 401;

		// Don't try to refresh for the refresh call itself
		const isRefreshCall = originalRequest?.url?.includes(
			"accounts/token/refresh/"
		);

		if (isUnauthorized && !isRefreshCall && !originalRequest._retry) {
			// Suppress the console error since we're handling it
			error.config.silent = true;

			if (isRefreshing && refreshPromise) {
				// If already refreshing, wait for the refresh promise
				try {
					const newAccess = await refreshPromise;
					originalRequest.headers.Authorization = `Bearer ${newAccess}`;
					return api(originalRequest);
				} catch (err) {
					return Promise.reject(err);
				}
			}

			originalRequest._retry = true;
			isRefreshing = true;

			// Create a single refresh promise that all queued requests will wait for
			refreshPromise = (async () => {
				try {
					const newAccess = await refreshAccessToken();
					processQueue(null, newAccess);
					return newAccess;
				} catch (error: any) {
					console.error("Token refresh failed, logging out");
					processQueue(error, null);
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					delete api.defaults.headers.common["Authorization"];
					window.location.href = "/login";
					throw error;
				} finally {
					isRefreshing = false;
					refreshPromise = null;
				}
			})();

			try {
				const newAccess = await refreshPromise;
				originalRequest.headers.Authorization = `Bearer ${newAccess}`;
				return api(originalRequest);
			} catch (err) {
				return Promise.reject(err);
			}
		}

		return Promise.reject(error);
	}
);

// -------- INITIAL HEADER FROM STORAGE --------

const existingAccess = localStorage.getItem("accessToken");
if (existingAccess) {
	setAuthHeader(existingAccess);
}
