import { useEffect, useState } from "react";
import "./Loading.css";

function Loading(): JSX.Element {
	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		// Set a timeout to show the loading GIF after a delay (e.g., 2000 milliseconds or 2 seconds)
		const delayTimeout = setTimeout(() => {
			setShowLoading(true);
		}, 1000); // Adjust the delay time as needed (in milliseconds)

		return () => {
			// Clear the timeout if the component unmounts before the delay completes
			clearTimeout(delayTimeout);
		};
	}, []);

	return (
		<div>
			{showLoading && (
				<div className="lds-spinner">
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			)}
		</div>
	);
}

export default Loading;
