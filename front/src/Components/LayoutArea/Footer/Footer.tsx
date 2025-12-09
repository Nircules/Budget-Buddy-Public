import { Link } from "react-router-dom";
import "./Footer.css";

function Footer(): JSX.Element {

    const year = new Date().getFullYear();

    return (
        <footer className="Footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>Budget Buddy</h4>
                    <p>נהל את הכספים שלך בחכמה</p>
                </div>

                <div className="footer-section">
                    <h4>קישורים חשובים</h4>
                    <ul>
                        <li><Link to="/privacy">מדיניות פרטיות ושימוש בעוגיות</Link></li>
                        <li><Link to="/terms">תנאי שימוש</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>צור קשר</h4>
                    <p>contact@example.com</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {year} כל הזכויות שמורות ל Nir Ben Giat - Budget Buddy </p>
            </div>
        </footer>
    );
}

export default Footer;
