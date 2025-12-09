import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';

interface GuidedTourProps {
    run: boolean;
    onFinish: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ run, onFinish }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Inject custom CSS to fix spotlight overlay issue
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .__floater__open .react-joyride__spotlight {
                background-color: transparent !important;
                mix-blend-mode: multiply;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);



    // Handle navigation when step changes
    useEffect(() => {
        // Navigation map - which page should each step be on
        const stepRoutes: { [key: number]: string } = {
            0: '/home',      // Welcome
            1: '/home',      // Navbar
            2: '/home',      // Budget cards
            3: '/recurring_expenses',  // Navigate to recurring
            4: '/recurring_expenses',  // Recurring page intro
            5: '/recurring_expenses',  // Add button
            6: '/recurring_expenses',  // Frequencies
            7: '/expenses',  // Navigate to expenses
            8: '/expenses',  // Expenses page
            9: '/expenses',  // Add expense button
            10: '/user_profile',  // Navigate to profile
            11: '/user_profile',  // Profile page
            12: '/user_profile',  // Add budget
            13: '/user_profile',  // Add category
            14: '/home',     // Back to home
            15: '/home',     // Tips
            16: '/home',     // Final step
        };
        if (run && stepRoutes[stepIndex]) {
            const targetRoute = stepRoutes[stepIndex];
            if (location.pathname !== targetRoute) {
                navigate(targetRoute);
            }
        }
    }, [stepIndex, run, navigate, location.pathname]);

    const steps: Step[] = [
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h2>ברוכים הבאים ל-Budget Buddy! 🎉</h2>
                    <p>בואו נעבור ביחד על התכונות העיקריות של האפליקציה</p>
                    <p>הסיור יעבור בין דפים שונים ויסביר כל תכונה</p>
                    <p>משך משוער: 3 דקות</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '#navbar',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>📍 תפריט ניווט</h3>
                    <p>כאן תמצאו את כל הקטגוריות העיקריות:</p>
                    <ul style={{ textAlign: 'right' }}>
                        <li><strong>בית</strong> - מסך ראשי עם סיכום</li>
                        <li><strong>הוצאות</strong> - קניות ותשלומים חד-פעמיים</li>
                        <li><strong>תשלומים קבועים</strong> - הוצאות קבועות שחוזרות על עצמן</li>
                        <li><strong>הכנסות</strong></li>
                        <li><strong>פרופיל</strong></li>
                    </ul>
                    <p>כפתור <strong>עזרה</strong> תמיד זמין בפרופיל!</p>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '.budget-progress-section',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>📊 כרטיסי תקציב</h3>
                    <p><strong>מהם תקציבים?</strong></p>
                    <p>תקציבים עוזרים לחלק את הכסף לקטגוריות</p>
                    <p><strong>צבעי אזהרה:</strong></p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>🟢 ירוק: נותרו 50%+ - מצב מעולה!</li>
                        <li>🟠 כתום: נותרו 20-50% - היזהרו</li>
                        <li>🔴 אדום: נותרו 0-20% - הפסיקו הוצאות</li>
                        <li>🟣 סגול: חרגתם מהתקציב</li>
                    </ul>
                </div>
            ),
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➡️ עוברים לתשלומים קבועים</h3>
                    <p>עכשיו נעבור לעמוד התשלומים הקבועים...</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>🔄 הוצאות קבועות</h3>
                    <p>הוצאות שחוזרות באופן קבוע:</p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>💰 שכר דירה</li>
                        <li>📺 מנויים (Netflix, אינטרנט, פלאפון...)</li>
                        <li>⚡ חשבונות (חשמל, מים...)</li>
                        <li>🛒 קניות שבועיות</li>
                    </ul>
                    <p>כאן תראו את כל ההוצאות הקבועות שלכם</p>
                    <p>חשוב להוסיף ולהזין את כל ההוצאות למען מעקב תקציבי מדויק</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.add-expense',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➕ הוספת הוצאה קבועה</h3>
                    <p><strong>מה צריך למלא:</strong></p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>📅 תאריך התחלה</li>
                        <li>📅 תאריך סיום (אופציונלי)</li>
                        <li>🔄 תדירות (שבועי, דו-שבועי, חודשי)</li>
                        <li>💰 סכום</li>
                        <li>📝 תיאור</li>
                    </ul>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>🔢 תדירויות</h3>
                    <ul style={{ textAlign: 'right' }}>
                        <li><strong>W</strong> - שבועי (×4 לחודש)</li>
                        <li><strong>B</strong> - דו-שבועי (×2 לחודש)</li>
                        <li><strong>M</strong> - חודשי (×1)</li>
                    </ul>
                    <p>הסכום הכולל מחושב אוטומטית!</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➡️ עוברים להוצאות</h3>
                    <p>עכשיו נעבור לעמוד ההוצאות החד-פעמיות...</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>💳 הוצאות חד-פעמיות</h3>
                    <p>כאן תוסיפו כל קנייה או תשלום</p>
                    <p><strong>טיפים:</strong></p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>✅ הוסיפו מיד כשמוציאים כסף</li>
                        <li>✅ קשרו לתקציבים</li>
                        <li>✅ תיאורים ברורים</li>
                    </ul>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.Expenses .add-expense',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➕ הוספת הוצאה</h3>
                    <p><strong>מה למלא:</strong></p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>📅 תאריך</li>
                        <li>📝 תיאור</li>
                        <li>💰 סכום</li>
                        <li>📁 קטגוריה</li>
                        <li>📊 תקציב (מומלץ!)</li>
                    </ul>
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➡️ עוברים לפרופיל</h3>
                    <p>עכשיו נעבור לעמוד הפרופיל...</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>👤 פרופיל משתמש</h3>
                    <p>כאן תגדירו את ההגדרות האישיות:</p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>📅 יום תשלום חודשי</li>
                        <li>💰 הכנסה צפויה - חשוב למען חישוב תקציבי</li>
                        <li>🎯 יעד חיסכון - חשוב למען הצבת מטרת התקציבים</li>
                        <li>📊 ניהול תקציבים וקטגוריות</li>
                    </ul>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '.ProfileDetails table tbody tr:nth-child(7) button',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>📊 הוספת תקציב</h3>
                    <p>תקציבים עוזרים לחלק את ההכנסה:</p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>🏠 בית </li>
                        <li>🍔 אוכל </li>
                        <li>🚗 תחבורה </li>
                        <li>🎉 בידור </li>
                        <li>💰 חיסכון </li>
                    </ul>
                    <p><strong>טיפ:</strong> צרו תקציבים ותקשרו את ההוצאות לפיהם</p>
                </div>
            ),
            placement: 'left',
        },
        {
            target: '.ProfileDetails table tbody tr:nth-child(8) button',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>📁 הוספת קטגוריה</h3>
                    <p>קטגוריות מסווגות הוצאות:</p>
                    <ul style={{ textAlign: 'right' }}>
                        <li>🛒 סופרמרקט</li>
                        <li>🍕 מסעדות</li>
                        <li>⚡ חשבונות</li>
                        <li>👕 ביגוד</li>
                        <li>🎬 בידור</li>
                    </ul>
                    <p>קטגוריות שייכות לתקציבים!</p>
                </div>
            ),
            placement: 'left',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h3>➡️ חוזרים לבית</h3>
                    <p>נחזור לעמוד הבית לסיכום...</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h2>🎯 טיפים להצלחה</h2>
                    <p><strong>יומי:</strong> הוסיפו הוצאות מיד לשמירת מעקב</p>
                    <p><strong>שבועי:</strong> בדקו יתרות תקציבים</p>
                    <p><strong>חודשי:</strong> סקרו ביצועים והתאימו תקציבים לחודש הבא</p>
                </div>
            ),
            placement: 'center',
        },
        {
            target: 'body',
            content: (
                <div style={{ textAlign: 'right', direction: 'rtl' }}>
                    <h2>🚀 מוכנים!</h2>
                    <p><strong>השלבים הבאים:</strong></p>
                    <ol style={{ textAlign: 'right' }}>
                        <li>✅ צרו תקציבים</li>
                        <li>✅ הוסיפו הוצאות קבועות</li>
                        <li>✅ תעדכנו את צפי ההכנסה הצפויה</li>
                        <li>✅ תציבו לעצמכם יעד חיכסון</li>
                        <li>✅ עקבו אחר הוצאות יומיות</li>
                    </ol>
                    <p><strong>העקביות היא המפתח! 💪</strong></p>
                    <p>לחצו על <strong>עזרה</strong> בכל עת להתחיל מחדש (נמצא בפרופיל המשתמש)</p>
                </div>
            ),
            placement: 'center',
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, index, type, action } = data;

        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            setStepIndex(0);
            navigate('/user_profile'); // Return to profile when tour ends
            onFinish();
        }

        // Handle close button click
        if (action === ACTIONS.CLOSE) {
            setStepIndex(0);
            navigate('/user_profile'); // Return to profile when tour is closed
            onFinish();
        }

        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            // Move to next step
            setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            stepIndex={stepIndex}
            callback={handleJoyrideCallback}
            disableScrolling={true}
            disableOverlayClose
            spotlightClicks={false}
            spotlightPadding={5}
            styles={{
                options: {
                    primaryColor: '#4caf50',
                    textColor: '#333',
                    width: 380,
                    zIndex: 10000,
                },
                tooltip: {
                    fontSize: 15,
                    padding: 20,
                    maxWidth: '90vw',
                    border: '2px solid #4caf50',
                },
                tooltipContainer: {
                    textAlign: 'right',
                    fontSize: 18,

                },
                tooltipContent: {
                    padding: '10px 0',
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                },
                spotlight: {
                    borderRadius: '4px',
                    border: '3px solid #4caf50',
                },
                buttonNext: {
                    backgroundColor: '#4caf50',
                    fontSize: 14,
                    padding: '10px 20px',
                    borderRadius: '8px',
                },
                buttonBack: {
                    color: '#666',
                    fontSize: 14,
                    marginRight: 10,
                },
                buttonSkip: {
                    color: '#999',
                    fontSize: 14,
                },
            }}
            floaterProps={{
                disableAnimation: false,
                styles: {
                    floater: {
                        filter: 'none',
                    },
                    arrow: {
                        length: 8,
                        spread: 16,
                    },
                },
                options: {
                    preventOverflow: {
                        boundariesElement: 'viewport',
                    },
                },
            }}
            locale={{
                back: 'הקודם',
                close: 'סגור',
                last: 'סיום',
                nextLabelWithProgress: `צעד הבא ${stepIndex + 1} מתוך ${steps.length}`,
                skip: 'דלג',
            }}
        />
    );
};

export default GuidedTour;
