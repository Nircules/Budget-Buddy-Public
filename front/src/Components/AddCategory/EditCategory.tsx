import { useContext, useEffect, useState } from "react";
import UserCategoryModel from "../../Models/UserCategoryModel";
import { UserContext } from "../../Redux/UserContext";
import { UserCategoriesDispatch, UserCategoriesState } from "../../Redux/FinanceContext";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { deleteUserCategory, editUserCategory } from "../../Redux/slicers/userCategoriesSlicer";
import "./EditCategory.css";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

const EditCategory = (props: { category: UserCategoryModel | null }) => {
    const context = useContext(UserContext);
    const dispatch: UserCategoriesDispatch = useDispatch();
    const { register, handleSubmit, setError, formState: { errors }, setValue } = useForm<UserCategoryModel>();

    const handleOverlayClick = () => {
        document.getElementById("edit-category-overlay")?.classList.remove("visible");
        setConfirmOpen(false);
    };
    const all_categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

    useEffect(() => {
        setValue("id", props.category.id);
        setValue("category_name", props.category.category_name);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.category]);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        setConfirmOpen(true);
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for the dialog to be ready
        // Show the confirm dialog
        const confirmDialog = document.getElementById("ConfirmDialog");
        if (confirmDialog) {
            confirmDialog.classList.add("visible");
        }
    };

    const handleConfirm = () => {
        setConfirmOpen(false);
        dispatch(deleteUserCategory(props.category.id));
        handleOverlayClick();
    };

    const handleCancel = async () => {
        // Hide the confirm dialog
        const confirmDialog = document.getElementById("ConfirmDialog");
        if (confirmDialog) {
            confirmDialog.classList.remove("visible");
        }
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for the dialog to close
        setConfirmOpen(false);
    };

    const editCategory = (data: UserCategoryModel) => {
        data.user = context.user.id;
        if (all_categories
            .filter(c => c.id !== props.category.id)
            .map(c => c.category_name)
            .includes(data.category_name)) {
            setError("category_name", {
                type: "manual",
                message: "קטגוריה כבר קיימת"
            });
            return;
        }

        try {
            dispatch(editUserCategory(data));
            handleOverlayClick();
        } catch (error) {
            console.error("Failed to edit category:", error);
        }
    };

    return (
        <div className="edit-category-overlay" id="edit-category-overlay" onClick={handleOverlayClick}>
            <div className="edit-category-container" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit((data) => editCategory(data))}>
                    <div className="form-group">
                        <label htmlFor="categoryName" id="categoryNameLabel">עריכת קטגוריה</label>
                        <input
                            type="text"
                            id="categoryName"
                            placeholder="שם לקטגוריה"
                            required
                            {...register("category_name", {
                                required: {
                                    value: true,
                                    message: "יש להזין שם לקטגוריה",
                                },
                                minLength: { value: 2, message: "Category name must be at least 2 characters long" },
                            })}
                        />
                    </div>
                    {errors.category_name && <span className="error-message">{errors.category_name.message}</span>}
                    <div className="form-actions">
                        <button type="button" className="btn-confirm" onClick={handleDelete}>
                            מחק
                        </button>
                        <button type="submit" className="btn-confirm submit-button">
                            עדכון
                        </button>
                    </div>
                </form>

                {confirmOpen && (
                    <ConfirmDialog
                        message={`למחוק את הקטגוריה "${props.category.category_name}"?`}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </div>
    );
};

export default EditCategory;