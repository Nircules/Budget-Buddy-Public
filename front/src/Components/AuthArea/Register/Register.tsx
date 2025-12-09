import "./Register.css";
import { useForm } from "react-hook-form";
import UserModel from "../../../Models/UserModel";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import authFunctions from "../../../Services/AuthFunctions";
import { UserContext } from "../../../Redux/UserContext";
import Home from "../../HomeArea/Home/Home";
import jwtDecode from "jwt-decode";
import { setAuthHeader } from "../../../Utils/Config";
import { ExpensesDispatch, IncomesDispatch, RecurringExpensesDispatch, UserCategoriesDispatch, BudgetsDispatch } from "../../../Redux/FinanceContext";
import { useDispatch } from "react-redux";
import { fetchExpensesByUserId } from "../../../Redux/slicers/expensesSlicer";
import { fetchIncomesByUserId } from "../../../Redux/slicers/incomesSlicer";
import { fetchRecurringExpensesByUserId } from "../../../Redux/slicers/recurringExpenseSlicer";
import { fetchUserCategories } from "../../../Redux/slicers/userCategoriesSlicer";
import { fetchBudgetsByUserId } from "../../../Redux/slicers/budgetSlicer";
import userService from "../../../Services/UserService";

interface TokenPayload {
	user_id: number;
}

function Register(): JSX.Element {
	const { register, handleSubmit, formState, trigger } = useForm<UserModel>();
	const navigate = useNavigate();
	const context = useContext(UserContext);
	const expensesDispatch: ExpensesDispatch = useDispatch();
	const incomesDispatch: IncomesDispatch = useDispatch();
	const recurringExpensesDispatch: RecurringExpensesDispatch = useDispatch();
	const userCategoriesDispatch: UserCategoriesDispatch = useDispatch();
	const budgetsDispatch: BudgetsDispatch = useDispatch();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [userError, setUserError] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);

	const usernameRegex = /^[a-zA-Z0-9-_]+$/;
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

	const handlePasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setPassword(event.target.value);
		trigger("password");
		setPasswordError("");
	};

	const handleConfirmPasswordChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setConfirmPassword(event.target.value);
		setPasswordError("");
	};

	const handleUserFieldChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		trigger("username");
		setUserError("");
	};

	async function send(user: UserModel) {
		if (password !== confirmPassword) {
			return setPasswordError("The two password fields didn't match.");
		}

		if (!termsAccepted) {
			return setPasswordError("עליך לקבל את תנאי השימוש ומדיניות הפרטיות.");
		}

		setPasswordError("");

		const respons = await userService.checkUsernameAvailability(user.username);
		if (respons === false) {
			setUserError("Username Already Taken.");
			return;
		}

		try {
			await authFunctions.register(user);
			await authFunctions.login(user);

			const accessToken = localStorage.getItem("accessToken");
			if (!accessToken) throw new Error("Registration login failed");

			// Explicitly set auth header (belt and suspenders)
			setAuthHeader(accessToken);

			const container = jwtDecode<TokenPayload>(accessToken);

			// Create user object from JWT token (no API call needed)
			const newUser = new UserModel();
			newUser.id = container.user_id;
			newUser.username = user.username;
			context.user = newUser;

			const profile = await authFunctions.getUserProfileById(newUser.id);
			context.profile = profile;

			// Load Redux data
			expensesDispatch(fetchExpensesByUserId(newUser.id));
			incomesDispatch(fetchIncomesByUserId(newUser.id));
			recurringExpensesDispatch(fetchRecurringExpensesByUserId(newUser.id));
			userCategoriesDispatch(fetchUserCategories(newUser.id));
			budgetsDispatch(fetchBudgetsByUserId(newUser.id));

			navigate("/edit_profile");
		} catch (err: any) {
			alert(err.message || "Unknown error");
		}
	}

	if (context.user) {
		navigate("/home");
		return <Home />;
	}

	return (
		<div className="Register Box">
			<h1>הרשמה</h1>
			<form onSubmit={handleSubmit(send)}>
				<div className="form-floating">
					<input
						type="text"
						className="form-control"
						{...register("username", {
							required: {
								value: true,
								message: "User Name is required.",
							},
							minLength: {
								value: 3,
								message: "User Name Too Short.",
							},
							maxLength: {
								value: 22,
								message: "User Name Too Long.",
							},
							pattern: {
								value: usernameRegex,
								message: "Invalid Input.",
							},
							onChange: handleUserFieldChange,
						})}
					/>
					<label>שם משתמש</label>
					<span> {formState.errors.username?.message}</span>
					{userError && <span>{userError}</span>}
				</div>

				<div className="form-floating">
					<input
						type="password"
						autoComplete="new-password"
						className="form-control"
						{...register("password", {
							required: {
								value: true,
								message: "Password is required.",
							},
							minLength: {
								value: 8,
								message: "Password Too Short.",
							},
							maxLength: {
								value: 30,
								message: "Password Too Long.",
							},
							pattern: {
								value: passwordRegex,
								message:
									"Invalid Input. Must contain 1 lower case, 1 upper case, between 8-30 characters, and no speical signs.",
							},

							onChange: handlePasswordChange,
						})}
					/>
					<label>סיסמא</label>
					<span> {formState.errors.password?.message}</span>
				</div>

				<div className="form-floating">
					<input
						type="password"
						className="form-control"
						onChange={handleConfirmPasswordChange}
					/>
					<label>אימות סיסמא</label>
					{passwordError && (
						<span style={{ color: "red" }}>{passwordError}</span>
					)}
				</div>

				<div className="form-check terms-checkbox">
					<label htmlFor="terms" className="form-check-label">
						אני מסכים/ה
						<NavLink to="/terms" target="_blank" style={{ margin: '0 5px' }}>לתנאי השימוש</NavLink>
						<NavLink to="/privacy" target="_blank" style={{ margin: '0 5px' }}>ולמדיניות הפרטיות ושימוש בעוגיות</NavLink>
					</label>
					<input
						type="checkbox"
						className="form-check-input"
						id="terms"
						checked={termsAccepted}
						onChange={(e) => setTermsAccepted(e.target.checked)}
					/>
				</div>

				<button type="submit" className="button-29">
					רישום
				</button>
				<h5>
					יש כבר משתמש?{" "}
					<NavLink to="/login">התחבר</NavLink>
				</h5>
			</form>
		</div>
	);
}

export default Register;
