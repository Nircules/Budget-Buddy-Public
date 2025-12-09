import "./WelcomeOverlay.css";

interface WelcomeOverlayProps {
    onClose: () => void;
}

function WelcomeOverlay({ onClose }: WelcomeOverlayProps): JSX.Element {
    return (
        <div
            className="welcome-overlay"
            onClick={onClose}
        >
            <div
                className="welcome-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="welcome-title">
                    🎉 ברוכים הבאים ל-Budget Buddy!
                </h2>

                <div className="welcome-content">
                    <p className="welcome-intro">
                        <strong>שלב ראשון:</strong> מלאו את הפרופיל שלכם כדי להתחיל
                    </p>

                    <div className="welcome-tips">
                        <p className="tips-header">
                            💡 טיפים לניהול תקציב מוצלח:
                        </p>
                        <ul>
                            <li>הזינו את ההכנסה החודשית שלכם</li>
                            <li>הגדירו יעד חיסכון ריאלי</li>
                            <li>בחרו תאריכי תשלום מדויקים</li>
                            <li>צרו תקציבים לקטגוריות שונות</li>
                            <li>עקבו אחר ההוצאות באופן יומי</li>
                        </ul>
                    </div>

                    <p className="welcome-footer">
                        💪 העקביות היא המפתח להצלחה בניהול כספים!
                    </p>
                </div>

                <button className="welcome-button" onClick={onClose}>
                    בואו נתחיל! 🚀
                </button>
            </div>
        </div>
    );
}

export default WelcomeOverlay;
