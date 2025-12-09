import { createContext } from "react";
import UserModel from "../Models/UserModel";
import UserProfileModel from "../Models/UserProfileModel";

type UserContextType = {
	user: UserModel;
	profile: UserProfileModel;
};

export const UserContext = createContext<UserContextType>({
	user: null,
	profile: null,
});
