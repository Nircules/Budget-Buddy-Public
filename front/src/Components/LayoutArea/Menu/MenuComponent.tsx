import "./MenuComponent.css";
import { useContext, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import UserModel from "../../../Models/UserModel";
import { UserContext } from "../../../Redux/UserContext";

function MenuComponent(): JSX.Element {

    const context = useContext(UserContext);
    const [user, setUser] = useState<UserModel | undefined>(context.user)

    return (
        <div className="MenuComponent">
            <Sidebar style={{ width: "100%" }}>
                <Menu>

                    <MenuItem component={<NavLink to="/" />} > Home </MenuItem>
                    <MenuItem component={<NavLink to="/" />}> Some Link 1</MenuItem>
                    {user && user.is_staff && <SubMenu label="Admin Panel">
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Admin Link 1</MenuItem>
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Admin Link 2</MenuItem>
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Admin Link 3</MenuItem>
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Admin Link 4</MenuItem>
                    </SubMenu>}
                    <hr />
                    <MenuItem component={<NavLink to="/" />} > Some Link 2 </MenuItem>
                    <SubMenu label="Some Link 3">
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Some Link 3.1</MenuItem>
                        <MenuItem component={<NavLink to={'/'} id='CategoryLabel' />}>Some Link 3.2</MenuItem>
                    </SubMenu>

                </Menu>
            </Sidebar>
        </div>
    );
}

export default MenuComponent;
