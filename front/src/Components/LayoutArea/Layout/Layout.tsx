import Routing from "../Routing/Routing";
import Navbar from "../Navbar/navbar";
import { useContext, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import UserModel from "../../../Models/UserModel";
import jwtDecode from "jwt-decode";
import "./Layout.css";
import { useEffect } from "react";
import authFunctions from "../../../Services/AuthFunctions";
import Loading from "../../SharedArea/Loading/Loading";
import GuidedTour from "../../SharedArea/GuidedTour/GuidedTour";
import { useDispatch } from "react-redux";
import { ExpensesDispatch, IncomesDispatch, RecurringExpensesDispatch, TasksDispatch, UserCategoriesDispatch, BudgetsDispatch } from "../../../Redux/FinanceContext";
import { fetchExpensesByUserId } from "../../../Redux/slicers/expensesSlicer";
import { fetchIncomesByUserId } from "../../../Redux/slicers/incomesSlicer";
import { fetchRecurringExpensesByUserId } from "../../../Redux/slicers/recurringExpenseSlicer";
import { fetchTasks } from "../../../Redux/slicers/tasksSlicer";
import { fetchUserCategories } from "../../../Redux/slicers/userCategoriesSlicer";
import { fetchBudgetsByUserId } from "../../../Redux/slicers/budgetSlicer";
import { api, scheduleTokenRefresh, cancelTokenRefresh, checkAndRefreshToken } from "../../../Utils/Config";
import { useLocation } from "react-router-dom";

function Layout(): JSX.Element {
	interface TokenPayload {
		user_id: number;
	}

	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const { pathname } = useLocation();
	const [isLoadedProfile, setIsLoadedProfile] = useState<boolean>(false);
	const [runTour, setRunTour] = useState<boolean>(false);
	const context = useContext(UserContext);
	const expenseDispatch: ExpensesDispatch = useDispatch();
	const incomesDispatch: IncomesDispatch = useDispatch();
	const recurringExpensesDispatch: RecurringExpensesDispatch = useDispatch();
	const tasksDispatch: TasksDispatch = useDispatch();
	const userCategoriesDispatch: UserCategoriesDispatch = useDispatch();
	const budgetsDispatch: BudgetsDispatch = useDispatch();
	document.addEventListener('focusin', (event: FocusEvent) => {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;
		if ((target.tagName === 'INPUT' && target.type !== 'checkbox' && target.type !== 'email') || target.tagName === 'TEXTAREA') {
			setTimeout(() => {
				const value = target.value;
				target.setSelectionRange(value.length, value.length);
			}, 0); // Ensure this happens after focus
		} else {
			return;
		}
	});

	useEffect(() => {
		const accessToken = localStorage.getItem("accessToken");

		if (!accessToken) {
			setIsLoaded(true);
			setIsLoadedProfile(true);
			return;
		}

		// Async wrapper for fetch logic
		const init = async () => {
			try {
				// First, check if we need to refresh the token (user may have been away)
				const tokenValid = await checkAndRefreshToken();

				if (!tokenValid) {
					// Tokens are invalid, clear and show login
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					localStorage.removeItem("lastRefresh");
					delete api.defaults.headers.common["Authorization"];
					setIsLoadedProfile(true);
					setIsLoaded(true);
					return;
				}

				// Get fresh access token after potential refresh
				const currentAccessToken = localStorage.getItem("accessToken");
				if (!currentAccessToken) {
					setIsLoadedProfile(true);
					setIsLoaded(true);
					return;
				}

				// Decode user id from access token
				const container = jwtDecode<TokenPayload>(currentAccessToken);

				// Set header for future API calls
				api.defaults.headers.common["Authorization"] = `Bearer ${currentAccessToken}`;

				// Start proactive token refresh schedule
				scheduleTokenRefresh();

				// 1. Create user object from JWT token (no API call needed)
				const user = new UserModel();
				user.id = container.user_id;
				context.user = user;

				// 2. Get profile
				const profile = await authFunctions.getUserProfileById(user.id);
				context.profile = profile;
				setIsLoadedProfile(true);

				// 3. Kick off Redux fetches
				expenseDispatch(fetchExpensesByUserId(user.id));
				incomesDispatch(fetchIncomesByUserId(user.id));
				recurringExpensesDispatch(fetchRecurringExpensesByUserId(user.id));
				tasksDispatch(fetchTasks());
				userCategoriesDispatch(fetchUserCategories(user.id));
				budgetsDispatch(fetchBudgetsByUserId(user.id));

			} catch (e) {
				// if token is invalid/expired, or API call fails, treat as logged out
				console.error("Failed to init from access token", e);
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("lastRefresh");
				delete api.defaults.headers.common["Authorization"];
				setIsLoadedProfile(true);
			} finally {
				setIsLoaded(true);
			}
		};

		init();

		// Cleanup: cancel token refresh timer when component unmounts
		return () => {
			cancelTokenRefresh();
		};
	}, [
		context,
		expenseDispatch,
		incomesDispatch,
		recurringExpensesDispatch,
		tasksDispatch,
		userCategoriesDispatch,
		budgetsDispatch,
		pathname
	]);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [pathname]);

	if (!isLoaded || !isLoadedProfile) {
		return <Loading />;
	}

	return (
		<div className="Layout">
			{context.user && context.profile && (
				<header>
					<Navbar></Navbar>
				</header>
			)}
			<main style={context.user && context.profile ? { paddingTop: "100px" } : { paddingTop: 0 }}>
				<Routing></Routing>
			</main>
			<GuidedTour run={runTour} onFinish={() => setRunTour(false)} />
		</div>
	);
}

export default Layout;
