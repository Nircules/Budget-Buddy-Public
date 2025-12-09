import React, { useContext } from 'react';
import './AddCategory.css';
import { useDispatch, useSelector } from 'react-redux';
import { UserCategoriesDispatch, UserCategoriesState } from '../../Redux/FinanceContext';
import { addUserCategory } from '../../Redux/slicers/userCategoriesSlicer';
import { UserContext } from '../../Redux/UserContext';
import { useForm } from 'react-hook-form';
import UserCategoryModel from '../../Models/UserCategoryModel';

const AddCategory: React.FC = () => {
    const dispatch: UserCategoriesDispatch = useDispatch();
    const context = useContext(UserContext);
    const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<UserCategoryModel>();
    const handleOverlayClick = () => {
        document.getElementById("add-category-overlay")?.classList.remove("visible");
    };
    const all_categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);

    const addCategory = (data: UserCategoryModel) => {
        data.user = context.user.id;

        if (all_categories.map(c => c.category_name).includes(data.category_name)) {
            // In the addCategory function:
            if (all_categories.map(c => c.category_name).includes(data.category_name)) {
                setError("category_name", {
                    type: "manual",
                    message: "קטגוריה כבר קיימת"
                });
                return;
            }
        }

        try {
            dispatch(addUserCategory(data));
            reset();
            handleOverlayClick();
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    };

    return (
        <div className="add-category-overlay" id="add-category-overlay" onClick={handleOverlayClick}>
            <div className="add-category-modal" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit((data) => addCategory(data))}>
                    <div className="form-group">
                        <label htmlFor="categoryName" id="categoryNameLabel">הוספת קטגוריה</label>
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
                        <button type="button" className="btn-cancel" onClick={handleOverlayClick}>
                            ביטול
                        </button>
                        <button type="submit" className="btn-cancel submit-button">
                            הוספה
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategory;