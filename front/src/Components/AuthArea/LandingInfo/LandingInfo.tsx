import "./LandingInfo.css";

function LandingInfo(): JSX.Element {
    return (
        <div className="LandingInfo">
            <div className="landing-header">
                <h1>Budget Buddy</h1>
                <p className="tagline">נהל את הכספים שלך בחכמה 💰</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>מעקב הוצאות</h3>
                    <p>עקוב אחר כל ההוצאות וההכנסות שלך במקום אחד</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🔄</div>
                    <h3>תשלומים קבועים</h3>
                    <p>נהל תשלומים חוזרים וקבל תזכורות אוטומטיות</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>תקציבים</h3>
                    <p>הגדר יעדים ועקוב אחר ההתקדמות שלך</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">📈</div>
                    <h3>דוחות ותובנות</h3>
                    <p>גלה לאן הכסף שלך הולך עם דוחות מפורטים</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">🏷️</div>
                    <h3>קטגוריות מותאמות</h3>
                    <p>צור קטגוריות משלך וסדר את ההוצאות</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">📱</div>
                    <h3>ממשק נוח</h3>
                    <p>עיצוב מודרני ונוח לשימוש בכל מכשיר</p>
                </div>
            </div>

            <div className="cta-section">
                <h2>התחל לנהל את התקציב שלך היום!</h2>
                <p>הצטרף למשתמשים שכבר שולטים בכספים שלהם</p>
            </div>
        </div >
    );
}

export default LandingInfo;
