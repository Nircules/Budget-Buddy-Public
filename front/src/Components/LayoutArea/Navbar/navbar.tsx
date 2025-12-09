import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../Assets/Images/logoTest.png";
import AuthMenu from "../../AuthArea/AuthMenu/AuthMenu";
import "./navbar.css";

function Navbar() {
	const [sideOpened, setSideOpened] = useState(false);
	const handleClick = () => setSideOpened(!sideOpened);
	const isLocalhost = window.location.hostname === "localhost";
	const handleClickOutside = (event: MouseEvent) => {
		const navContainer = document.getElementById("navcontainer");
		const mobileButton = document.getElementById("mobile");
		if (
			navContainer &&
			!navContainer.contains(event.target as Node) &&
			!mobileButton?.contains(event.target as Node)
		) {
			setSideOpened(false);
		}
	};

	useEffect(() => {
		window.addEventListener("click", handleClickOutside);
		return () => {
			window.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const navbarClass = sideOpened ? "navbar active" : "navbar";

	return (
		<nav className="navbar-header">
			<div id="mobile" className={sideOpened ? "active" : ""}>
				<input
					type="checkbox"
					checked={sideOpened}
					onChange={handleClick}
				/>
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div id="navcontainer">
				<NavLink to={"/home"}>
					<img id="logo-pic" src={logo} alt="Logo" />
				</NavLink>
				<ul id="navbar" className={navbarClass}>
					<li>
						<NavLink to="/home">בית</NavLink>
					</li>
					<li>
						<NavLink to="/expenses">הוצאות</NavLink>
					</li>
					<li>
						<NavLink to="/recurring_expenses">
							תשלומים קבועים
						</NavLink>
					</li>
					<li>
						<NavLink to="/incomes">הכנסות</NavLink>
					</li>
					{isLocalhost && (
						<li>
							<NavLink to="/todo">משימות</NavLink>
						</li>)}
					<div className="authMenu">
						<AuthMenu />
					</div>
				</ul>
			</div>
		</nav>
	);
}

export default Navbar;
