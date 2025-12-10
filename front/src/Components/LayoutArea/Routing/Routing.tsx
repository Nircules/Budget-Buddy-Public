import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../../AuthArea/Login/Login";
import Logout from "../../AuthArea/Logout/Logout";
import Register from "../../AuthArea/Register/Register";
import Home from "../../HomeArea/Home/Home";
import NotFound404 from "../NotFound404/NotFound404";
import ProfileDetails from "../../AuthArea/ProfileDetails/ProfileDetails";
import EditProfile from "../../AuthArea/EditProfile/EditProfile";
import Expenses from "../../ExpensesArea/Expenses/Expenses";
import RecurringExpenses from "../../ExpensesArea/RecurringExpenses/RecurringExpenses";
import Incomes from "../../IncomesArea/Incomes/Incomes";
import ToDo from "../../ToDo/ToDo";
import AddSection from "../../AddArea/AddSection";
import AddCategory from "../../AddCategory/AddCategory";
import AddBudget from "../../AddBudget/AddBudget";
import GuidedTour from "../../SharedArea/GuidedTour/GuidedTour";
import PrivacyPolicy from "../../AuthArea/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "../../AuthArea/TermsOfService/TermsOfService";
import { useContext, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";

// Protected Route Wrapper - redirects to edit_profile if profile not complete
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
	const context = useContext(UserContext);

	// If user is logged in but profile is not complete, redirect to edit_profile
	if (context.user && context.profile && context.profile.first_name === "") {
		return <Navigate to="/edit_profile/" replace />;
	}

	return children;
};

function Routing(): JSX.Element {
	const [runTour, setRunTour] = useState<boolean>(false);
	const isLocalhost = window.location.hostname === "localhost";

	return (
		<div className="Routing">
			<Routes>
				<Route path="/" element={<Navigate to="/home" />} />
				<Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
				<Route path="/register" element={<Register />} />
				<Route path="/login" element={<Login />} />
				<Route path="/logout" element={<Logout />} />
				<Route path="/privacy" element={<PrivacyPolicy />} />
				<Route path="/terms" element={<TermsOfService />} />
				<Route path="/user_profile/" element={<ProtectedRoute><ProfileDetails onStartTour={() => setRunTour(true)} /></ProtectedRoute>} />
				<Route path="/edit_profile/" element={<EditProfile />} />

				<Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
				<Route
					path="/recurring_expenses"
					element={<ProtectedRoute><RecurringExpenses /></ProtectedRoute>}
				/>
				<Route path="/incomes" element={<ProtectedRoute><Incomes /></ProtectedRoute>} />

				<Route path="/*" element={<NotFound404 />} />
				{isLocalhost && (<Route path="/todo" element={<ToDo />} />)}
			</Routes>
			<AddSection />
			<AddCategory />
			<AddBudget />
			<GuidedTour run={runTour} onFinish={() => setRunTour(false)} />
		</div>
	);
}

export default Routing;
