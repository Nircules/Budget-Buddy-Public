import "./AuthMenu.css";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import UserModel from "../../../Models/UserModel";
import { UserContext } from "../../../Redux/UserContext";
import UserProfileModel from "../../../Models/UserProfileModel";
import authFunctions from "../../../Services/AuthFunctions";

function AuthMenu(): JSX.Element {
	const { pathname } = useLocation();
	const context = useContext(UserContext);
	const [user, setUser] = useState<UserModel | undefined>(context.user);
	const [profile, setProfile] = useState<UserProfileModel | undefined>(
		undefined
	);

	useEffect(() => {
		setUser(context.user);
		if (context.user) {
			authFunctions
				.getUserProfileById(context.user.id)
				.then((response) => setProfile(response));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	return (
		<div className="AuthMenu">
			{!user && (
				<div>
					<Link to="/login" className="button-29">
						התחבר
					</Link>
				</div>
			)}

			{user && profile && (
				<div>

					<Link to={"/user_profile/"}>
						<i className="far fa-user-circle"></i>
					</Link>

				</div>
			)}
		</div>
	);
}

export default AuthMenu;
