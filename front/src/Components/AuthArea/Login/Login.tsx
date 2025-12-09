import "./Login.css";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserModel from "../../../Models/UserModel";
import { UserContext } from "../../../Redux/UserContext";
import jwtDecode from "jwt-decode";
import authFunctions from "../../../Services/AuthFunctions";
import { useDispatch } from "react-redux";
import {
	ExpensesDispatch,
	IncomesDispatch,
	RecurringExpensesDispatch,
	UserCategoriesDispatch,
	BudgetsDispatch,
} from "../../../Redux/FinanceContext";
import { fetchExpensesByUserId } from "../../../Redux/slicers/expensesSlicer";
import { fetchIncomesByUserId } from "../../../Redux/slicers/incomesSlicer";
import { fetchRecurringExpensesByUserId } from "../../../Redux/slicers/recurringExpenseSlicer";
import { fetchUserCategories } from "../../../Redux/slicers/userCategoriesSlicer";
import { fetchBudgetsByUserId } from "../../../Redux/slicers/budgetSlicer";
import { setAuthHeader } from "../../../Utils/Config";
import LandingInfo from "../LandingInfo/LandingInfo";

interface TokenPayload {
	user_id: number;
}

function Login(): JSX.Element {
	const context = useContext(UserContext);

	const { register, handleSubmit } = useForm<UserModel>();
	const navigate = useNavigate();
	const [formErrors, setFormErrors] = useState("");
	const expensesDispatch: ExpensesDispatch = useDispatch();
	const incomesDispatch: IncomesDispatch = useDispatch();
	const recurringExpensesDispatch: RecurringExpensesDispatch = useDispatch();
	const userCategoriesDispatch: UserCategoriesDispatch = useDispatch();
	const budgetsDispatch: BudgetsDispatch = useDispatch();

	// If user is already logged in, redirect to home page
	useEffect(() => {
		if (context.user) {
			navigate("/home");
		}
	}, [context.user, navigate]);

	async function send(credentials: UserModel) {
		try {
			if (!credentials.username || !credentials.password) {
				return setFormErrors("Please fill Username and Password.");
			}

			setFormErrors("");

			await authFunctions.login(credentials);

			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) throw new Error("Login failed — no access token found");
			setAuthHeader(accessToken);
			const container = jwtDecode<TokenPayload>(accessToken);

			// Create user object from JWT token (no API call needed)
			const user = new UserModel();
			user.id = container.user_id;
			user.username = credentials.username; // We already have this from login form
			context.user = user;

			// Load profile
			const profile = await authFunctions.getUserProfileById(user.id);
			context.profile = profile;

			// Load Redux data
			expensesDispatch(fetchExpensesByUserId(user.id));
			incomesDispatch(fetchIncomesByUserId(user.id));
			recurringExpensesDispatch(fetchRecurringExpensesByUserId(user.id));
			userCategoriesDispatch(fetchUserCategories(user.id));
			budgetsDispatch(fetchBudgetsByUserId(user.id));

			navigate("/home");
		} catch (err: any) {
			setFormErrors(err.message || "Unknown error");
		}
	}

	return (
		<div className="LoginPage">
			<div className="login-container">
				<div className="login-form-section">
					<div className="Login">
						<h2>התחברות</h2>
						<br />
						<form onSubmit={handleSubmit(send)}>
							<div className="form-floating">
								<input
									type="text"
									className="form-control"
									{...register("username")}
								/>
								<label >שם משתמש</label>
							</div>

							<div className="form-floating">
								<input
									type="password"
									className="form-control"
									{...register("password")}
								/>
								<label>סיסמא</label>
							</div>
							{formErrors && (
								<span style={{ color: "red" }}>{formErrors}</span>
							)}
							<button type="submit" className="button-29">
								התחבר
							</button>
							<br />
							<br />
							<h5>
								אין משתמש? <NavLink to="/register">הירשם</NavLink>
							</h5>
						</form>
					</div>
				</div>

				<div className="landing-info-section">
					<LandingInfo />
				</div>
			</div>
		</div>
	);
}

export default Login;
