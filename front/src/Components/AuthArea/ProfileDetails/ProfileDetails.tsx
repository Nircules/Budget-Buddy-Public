import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "./ProfileDetails.css";
import Loading from "../../SharedArea/Loading/Loading";
import { useSelector } from "react-redux";
import { UserCategoriesState, BudgetsState } from "../../../Redux/FinanceContext";
import EditCategory from "../../AddCategory/EditCategory";
import AddCategory from "../../AddCategory/AddCategory";
import EditBudget from "../../AddBudget/EditBudget";
import AddBudget from "../../AddBudget/AddBudget";
import UserCategoryModel from "../../../Models/UserCategoryModel";
import BudgetModel from "../../../Models/BudgetModel";
import authFunctions from "../../../Services/AuthFunctions";

interface ProfileDetailsProps {
	onStartTour?: () => void;
}

function ProfileDetails({ onStartTour }: ProfileDetailsProps): JSX.Element {
	const context = useContext(UserContext);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const navigate = useNavigate();
	const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
	const budgets = useSelector((state: BudgetsState) => state.budgets.budgets);
	const [selectedCategory, setSelectedCategory] = useState<UserCategoryModel>(categories[0]);
	const [selectedBudget, setSelectedBudget] = useState<BudgetModel>(budgets[0]);

	// State for inline editing
	const [isEditingIncome, setIsEditingIncome] = useState(false);
	const [isEditingTarget, setIsEditingTarget] = useState(false);
	const [tempIncome, setTempIncome] = useState(context.profile.expected_income);
	const [tempTarget, setTempTarget] = useState(context.profile.saving_target);

	const handleEditCategory = (category: UserCategoryModel) => {
		setSelectedCategory(category);
		const editCategoryContainer = document.getElementById("edit-category-overlay");
		if (editCategoryContainer) {
			editCategoryContainer.classList.add("visible");
		}
	};

	const handleEditBudget = (budget: BudgetModel) => {
		setSelectedBudget(budget);
		const editBudgetContainer = document.getElementById("edit-budget-overlay");
		if (editBudgetContainer) {
			editBudgetContainer.classList.add("visible");
		}
	};

	const handleAddCategory = () => {
		const addCategoryContainer = document.getElementById("add-category-overlay");
		if (addCategoryContainer) {
			addCategoryContainer.classList.add("visible");
		}
	};

	const handleAddBudget = () => {
		const addBudgetContainer = document.getElementById("add-budget-overlay");
		if (addBudgetContainer) {
			addBudgetContainer.classList.add("visible");
		}
	};

	const handleEditIncome = () => {
		setTempIncome(context.profile.expected_income);
		setIsEditingIncome(true);
	};

	const handleIncomeChange = (value: string) => {
		const numericValue = value.replace(/[^\d]/g, "");
		if (numericValue.length > 8) return;
		setTempIncome(Number(numericValue));
	};

	const handleSaveIncome = async () => {
		if (!tempIncome || tempIncome <= 0) {
			alert("יש להזין סכום תקין");
			return;
		}
		try {
			const updatedProfile = {
				...context.profile,
				expected_income: Number(tempIncome)
			};
			await authFunctions.updateUser(updatedProfile, context.user.id);
			context.profile = updatedProfile;
			setIsEditingIncome(false);
		} catch (error) {
			alert("שגיאה בעדכון הכנסה צפויה");
			console.error(error);
		}
	};

	const handleCancelIncome = () => {
		setTempIncome(context.profile.expected_income);
		setIsEditingIncome(false);
	};

	const handleEditTarget = () => {
		setTempTarget(context.profile.saving_target);
		setIsEditingTarget(true);
	};

	const handleTargetChange = (value: string) => {
		const numericValue = value.replace(/[^\d]/g, "");
		if (numericValue.length > 8) return;
		setTempTarget(Number(numericValue));
	};

	const handleSaveTarget = async () => {
		if (!tempTarget || tempTarget <= 0) {
			alert("יש להזין סכום תקין");
			return;
		}
		try {
			const updatedProfile = {
				...context.profile,
				saving_target: Number(tempTarget)
			};
			await authFunctions.updateUser(updatedProfile, context.user.id);
			context.profile = updatedProfile;
			setIsEditingTarget(false);
		} catch (error) {
			alert("שגיאה בעדכון יעד חיסכון");
			console.error(error);
		}
	};

	const handleCancelTarget = () => {
		setTempTarget(context.profile.saving_target);
		setIsEditingTarget(false);
	};

	useEffect(() => {
		if (context.profile.first_name === "" || context.profile === undefined) {
			navigate("/edit_profile");
		} else {
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="ProfileDetails Box">
			<AddCategory />
			<AddBudget />
			{selectedCategory && <EditCategory category={selectedCategory} />}
			{selectedBudget && <EditBudget budget={selectedBudget} />}
			<h1>פרופיל</h1>
			<button
				className="help-tour-button"
				onClick={onStartTour}
				title="הדרכה מודרכת"
			>
				<i className="fas fa-question-circle"></i> עזרה
			</button>
			<table id="profile">
				<tbody className="main-table">
					<tr>
						<td>דואר אלקטרוני:</td>
						<td>{context.profile.email}</td>
					</tr>
					<tr>
						<td>שם:</td>
						<td>{context.profile.first_name} {context.profile.last_name}</td>
					</tr>
					<tr>
						<td>תאריך הורדת חיובים:</td>
						<td>{context.profile.pay_day} לכל חודש</td>
					</tr>
					<tr>
						<td>תאריך כניסת משכורת:</td>
						<td>{context.profile.salary_day} לכל חודש</td>
					</tr>
					<tr>
						<td>הכנסה צפויה:</td>
						<td>
							{isEditingIncome ? (
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
									<input
										type="text"
										value={tempIncome ? Number(tempIncome).toLocaleString() : ""}
										onChange={(e) => handleIncomeChange(e.target.value)}
										style={{
											padding: '8px 12px',
											borderRadius: '6px',
											border: '2px solid #4caf50',
											fontSize: '1rem',
											width: '140px',
											outline: 'none'
										}}
										autoFocus
									/>
									<span style={{ fontWeight: 'bold' }}>₪</span>
									<button
										onClick={handleSaveIncome}
										title="שמור"
										style={{
											background: '#4caf50',
											color: 'white',
											border: 'none',
											borderRadius: '50%',
											width: '32px',
											height: '32px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
										onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
									>
										<i className="fas fa-check"></i>
									</button>
									<button
										onClick={handleCancelIncome}
										title="ביטול"
										style={{
											background: '#f44336',
											color: 'white',
											border: 'none',
											borderRadius: '50%',
											width: '32px',
											height: '32px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
										onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
									>
										<i className="fas fa-times"></i>
									</button>
								</div>
							) : (
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
									<span style={{ fontSize: '1.05rem', fontWeight: '500' }}>
										{Number(context.profile.expected_income).toLocaleString("en-US")} ₪
									</span>
									<button
										onClick={handleEditIncome}
										title="ערוך"
										style={{
											background: 'transparent',
											color: '#666',
											border: 'none',
											cursor: 'pointer',
											fontSize: '1.1rem',
											padding: '4px',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => { e.currentTarget.style.color = '#4caf50'; e.currentTarget.style.transform = 'scale(1.2)'; }}
										onMouseOut={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.transform = 'scale(1)'; }}
									>
										<i className="fas fa-pen"></i>
									</button>
								</div>
							)}
						</td>
					</tr>
					<tr>
						<td>יעד חיסכון:</td>
						<td>
							{isEditingTarget ? (
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
									<input
										type="text"
										value={tempTarget ? Number(tempTarget).toLocaleString() : ""}
										onChange={(e) => handleTargetChange(e.target.value)}
										style={{
											padding: '8px 12px',
											borderRadius: '6px',
											border: '2px solid #4caf50',
											fontSize: '1rem',
											width: '140px',
											outline: 'none'
										}}
										autoFocus
									/>
									<span style={{ fontWeight: 'bold' }}>₪</span>
									<button
										onClick={handleSaveTarget}
										title="שמור"
										style={{
											background: '#4caf50',
											color: 'white',
											border: 'none',
											borderRadius: '50%',
											width: '32px',
											height: '32px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
										onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
									>
										<i className="fas fa-check"></i>
									</button>
									<button
										onClick={handleCancelTarget}
										title="ביטול"
										style={{
											background: '#f44336',
											color: 'white',
											border: 'none',
											borderRadius: '50%',
											width: '32px',
											height: '32px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
										onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
									>
										<i className="fas fa-times"></i>
									</button>
								</div>
							) : (
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
									<span style={{ fontSize: '1.05rem', fontWeight: '500' }}>
										{Number(context.profile.saving_target).toLocaleString("en-US")} ₪
									</span>
									<button
										onClick={handleEditTarget}
										title="ערוך"
										style={{
											background: 'transparent',
											color: '#666',
											border: 'none',
											cursor: 'pointer',
											fontSize: '1.1rem',
											padding: '4px',
											transition: 'all 0.2s'
										}}
										onMouseOver={(e) => { e.currentTarget.style.color = '#4caf50'; e.currentTarget.style.transform = 'scale(1.2)'; }}
										onMouseOut={(e) => { e.currentTarget.style.color = '#666'; e.currentTarget.style.transform = 'scale(1)'; }}
									>
										<i className="fas fa-pen"></i>
									</button>
								</div>
							)}
						</td>
					</tr>					<tr>
						<td>
							תקציבים:
							<br />
							<button className="button-29" onClick={handleAddBudget}
								style={{ marginTop: '10px', fontSize: '16px', padding: '5px 10px' }}>
								הוספת תקציב
							</button>
						</td>
						<td>
							<ul>
								{budgets.map((budget) => {
									const getProgressColor = (remaining: number, total: number) => {
										const percentage = (remaining / total) * 100;
										if (percentage > 50) return "#4caf50";
										if (percentage > 20) return "#ff9800";
										if (percentage >= 0) return "#f44336";
										return "#9c27b0";
									};

									const getProgressPercentage = (remaining: number, total: number) => {
										const percentage = (remaining / total) * 100;
										return Math.max(0, Math.min(100, percentage));
									};

									const percentage = getProgressPercentage(budget.remaining_amount, budget.amount);
									const color = getProgressColor(budget.remaining_amount, budget.amount);
									const isOverspent = budget.remaining_amount < 0;

									return (
										<li key={budget.id} className="budget-progress-item">
											<div className="budget-item-header">
												<span className="budget-item-name">{budget.name}</span>
												<button className="edit-category-button" title="ערוך תקציב" onClick={() => handleEditBudget(budget)}>
													<i className="fas fa-edit"></i>
												</button>
											</div>
											<div className="budget-item-amounts">
												₪{Number(budget.remaining_amount).toLocaleString("en-US")} / ₪{Number(budget.amount).toLocaleString("en-US")}
											</div>
											<div className="budget-item-progress-bar">
												<div
													className="budget-item-progress-fill"
													style={{
														width: `${percentage}%`,
														backgroundColor: color,
													}}
												></div>
											</div>
											<div className="budget-item-status">
												{isOverspent ? (
													<span className="overspent-text">
														חרגת ב-₪{Math.abs(budget.remaining_amount).toLocaleString("en-US")}
													</span>
												) : (
													<span>{percentage.toFixed(0)}% נותרו</span>
												)}
											</div>
										</li>
									);
								})}
							</ul>
						</td>
					</tr>

					<tr>
						<td>
							קטגוריות:
							<br />
							<button className="button-29" onClick={handleAddCategory}
								style={{ marginTop: '10px', fontSize: '16px', padding: '5px 10px' }}>
								הוספת קטגוריה
							</button>
						</td>
						<td>
							<ul>
								{categories.map((category) => (
									<li key={category.id} className="category-item">
										{category.category_name}
										<button className="edit-category-button" title="ערוך קטגוריה" onClick={() => handleEditCategory(category)}>
											<i className="fas fa-edit"></i>
										</button>
									</li>
								))}
							</ul>
						</td>
					</tr>
				</tbody>
			</table>
			<Link to={"/edit_profile/"}>
				<button className="button-29">עריכת פרופיל</button>
			</Link>
			<br />
			<br />
			<Link to={"/logout"} className="logoutButton">
				<i className="fas fa-sign-out-alt"> </i> התנתקות
			</Link>
		</div>
	);
}

export default ProfileDetails;
