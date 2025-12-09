import "./NotFound404.css";
import pic from "../../../Assets/Images/4042.png";

function NotFound404(): JSX.Element {
    return (
        <div className="NotFound404">
            <img id="404" src={pic} alt='404' />
        </div>
    );
}

export default NotFound404;
