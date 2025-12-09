import { useContext } from "react";
import "./AddTask.css";
import { UserContext } from "../../Redux/UserContext";
import { TasksDispatch } from "../../Redux/FinanceContext";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import TaskModel from "../../Models/TaskModel";
import { addTask } from "../../Redux/slicers/tasksSlicer";

function AddTask(): JSX.Element {

    const context = useContext(UserContext);
    const dispatch: TasksDispatch = useDispatch();
    const { register, handleSubmit, reset } = useForm<TaskModel>();

    async function send(task: TaskModel) {
        task.user = context.user.id;
        task.is_done = false;
        try {
            dispatch(addTask(task));
            reset();
        } catch (err) {
            alert("Failed to add task: " + err);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.shiftKey && event.key === "Enter") {
            event.preventDefault(); // Prevent adding a new line
            document.getElementById("submitButton")?.click(); // Programmatically trigger form submission
        }
    };

    return (
        <div className="AddTask">
            <form onSubmit={handleSubmit(send)}>
                <div className="form-row">
                    <div className="card-header"> 
                        <label> משימה חדשה</label>
                    </div>
                    <div className="textarea">
                        <textarea required {...register("description", {
                            required: {
                                value: true,
                                message: "שדה חובה"
                            }
                        })}
                            onKeyDown={handleKeyDown} />
                        <div className="underline"></div>
                    </div>
                </div>
                <div className="form-row">
                    <button type="submit" id="submitButton" className="button-29">
                        הוסף
                        (Shift + Enter)
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddTask;
