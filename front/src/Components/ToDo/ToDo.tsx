import { useDispatch, useSelector } from "react-redux";
import AddTask from "./AddTask";
import "./ToDo.css";
import { TasksDispatch, TasksState } from "../../Redux/FinanceContext";
import { updateTask } from "../../Redux/slicers/tasksSlicer";
import TaskModel from "../../Models/TaskModel";

function ToDo(): JSX.Element {
    const tasks = useSelector((state: TasksState) => state.tasks.value);
    const dispatch: TasksDispatch = useDispatch();

    async function markAsDone(task: TaskModel) {
        const updatedTask = { ...task, is_done: true };
        try {
            dispatch(updateTask(updatedTask));
        } catch (err) {
            alert("Failed to mark task as done: " + err);
        }
    }

    return (
        <div className="ToDo">
            <AddTask />
            <div className="tasks">
                {tasks.map((task) => (
                    <div className="card text-white bg-dark mb-3" key={task.id} >
                        <div className="card-body">
                            <h5 className="card-title">{task.description}</h5>
                        </div>
                        <div className="card-footer">
                            <button className="button-29" onClick={() => markAsDone(task)}>בוצע</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToDo;
