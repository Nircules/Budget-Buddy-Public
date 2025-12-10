import "./EditProfile.css";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Redux/UserContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import UserProfileModel from "../../../Models/UserProfileModel";
import authFunctions from "../../../Services/AuthFunctions";
import Loading from "../../SharedArea/Loading/Loading";
import userService from "../../../Services/UserService";
import WelcomeOverlay from "../WelcomeOverlay/WelcomeOverlay";

function EditProfile(): JSX.Element {
	const context = useContext(UserContext);
	const { register, handleSubmit, formState, setValue, setError } =
		useForm<UserProfileModel>();
	let profile = context.profile;
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [showWelcome, setShowWelcome] = useState<boolean>(false);

	// Sets the input fields to the current user's profile
	useEffect(() => {
		if (profile.first_name !== "") {
			setValue("first_name", profile.first_name);
			setValue("last_name", profile.last_name);
			setValue("email", profile.email);
			setValue("pay_day", profile.pay_day ? profile.pay_day.toString() : '1');
			setValue("salary_day", profile.salary_day ? profile.salary_day.toString() : '1');
			setValue("saving_target", profile.saving_target);
			setValue("expected_income", profile.expected_income);
		}
		else {
			setShowWelcome(true);
		}
		setIsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	// Sends the updated profile to the server
	async function send(formProfile: UserProfileModel) {
		const response = await userService.checkEmailAvailability(formProfile.email);
		if (response === false && formProfile.email !== context.profile.email) {
			setError("email", {
				type: "emailTaken",
				message: "Email Already Taken",
			});
			return;
		}

		formProfile.saving_target = parseInt(formProfile.saving_target.toString());
		formProfile.expected_income = parseInt(formProfile.expected_income.toString());
		authFunctions
			.updateUser(formProfile, context.user.id)
			.then(() => {
				context.profile = formProfile;
				navigate(`/user_profile/`);
			})
			.catch((err) => alert(err.message));
	}

	return (
		<div className="EditProfile eBox">
			{showWelcome && <WelcomeOverlay onClose={() => setShowWelcome(false)} />}

			<h1>עריכת פרופיל</h1>

			<form onSubmit={handleSubmit(send)}>
				{/* First Name */}
				<div className="form-floating mb-3">
					<input
						type="text"
						className="form-control"
						id="floatingInput"
						{...register("first_name", {
							required: {
								value: true,
								message: "Missing First Name",
							},
							minLength: { value: 2, message: "Name too short" },
							maxLength: { value: 22, message: "Name too long" },
						})}
					/>
					<span>{formState.errors.first_name?.message}</span>
					<label>שם פרטי</label>
				</div>

				{/* Last Name */}
				<div className="form-floating mb-3">
					<input
						type="text"
						className="form-control"
						id="floatingInput"
						{...register("last_name", {
							required: {
								value: true,
								message: "Missing Last Name",
							},
							minLength: { value: 2, message: "Name too short" },
							maxLength: { value: 22, message: "Name too long" },
						})}
					/>
					<span>{formState.errors.last_name?.message}</span>
					<label>שם משפחה</label>
				</div>

				{/* Email */}
				<div className="form-floating mb-3">
					<input
						type="email"
						className="form-control"
						id="floatingInput"
						{...register("email", {
							required: { value: true, message: "Missing Email" },
						})}
					/>
					<span>{formState.errors.email?.message}</span>
					<label>אימייל</label>
				</div>
				<br />
				{/* Pay and Salary Day*/}
				<div className="form-row">
					<div className="input-data">
						<select required className="select-style" {...register("pay_day", {
							required: {
								value: true,
								message: "שדה חובה"
							}
						})}>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="10">10</option>
							<option value="15">15</option>
						</select>
						<label>הורדת חיובים</label>
						לכל חודש
					</div>

					<div className="input-data">
						<select required className="select-style" {...register("salary_day", {
							required: {
								value: true,
								message: "שדה חובה"
							}
						})}>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="10">10</option>
							<option value="15">15</option>
						</select>
						לכל חודש
						<label>משכורת</label>
					</div>
				</div>

				{/* Expected Income */}
				<div className="form-floating mb-3">
					<input
						type="text"
						className="form-control"
						id="floatingInput"
						{...register("expected_income", {
							required: {
								value: true,
								message: "Missing Budget",
							},
							maxLength: { value: 8, message: "Budget too long" },
							pattern: {
								value: /^[0-9]+$/,
								message: "Budget must be a number",
							}
						})}
					/>
					<span>{formState.errors.saving_target?.message}</span>
					<label>הכנסה צפויה ₪</label>
				</div>

				{/* Saving Target */}
				<div className="form-floating mb-3">
					<input
						type="text"
						className="form-control"
						id="floatingInput"
						{...register("saving_target", {
							required: {
								value: true,
								message: "Missing Budget",
							},
							maxLength: { value: 8, message: "Budget too long" },
							pattern: {
								value: /^[0-9]+$/,
								message: "Budget must be a number",
							}
						})}
					/>
					<span>{formState.errors.saving_target?.message}</span>
					<label>יעד חיסכון ₪</label>
				</div>

				<br />

				<button type="submit" className="button-29">
					אישור
				</button>
			</form>
		</div>
	);
}

export default EditProfile;
