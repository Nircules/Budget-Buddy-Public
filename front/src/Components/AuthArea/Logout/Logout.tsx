import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../Redux/UserContext";
import { setAuthHeader } from "../../../Utils/Config";
import { useDispatch } from "react-redux";
import { resetBudgets } from "../../../Redux/slicers/budgetSlicer";

function Logout(): JSX.Element {
	const navigate = useNavigate();
	const context = useContext(UserContext);
	const dispatch = useDispatch();

	useEffect(() => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		setAuthHeader(null);
		context.user = null;
		context.profile = null;
		dispatch(resetBudgets());
		navigate("/login");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
}

export default Logout;
