# Budget Buddy - Personal Finance Management Application

A full-stack web application for personal finance management with features for tracking expenses, incomes, budgets, and recurring transactions.

## 🚀 Features

-   **Expense Tracking**: Log and categorize your daily expenses
-   **Income Management**: Track multiple income sources
-   **Budget Planning**: Set and monitor budgets across categories
-   **Recurring Transactions**: Automate recurring expenses and incomes
-   **Financial Analytics**: Visualize your spending patterns with charts
-   **User Authentication**: Secure JWT-based authentication
-   **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend

-   **Django 5.1** - Python web framework
-   **Django REST Framework** - API development
-   **JWT Authentication** - Simple JWT for token-based auth
-   **SQLite** - Database (local development)
-   **APScheduler** - Task scheduling for recurring transactions

### Frontend

-   **React** - UI library
-   **TypeScript** - Type-safe JavaScript
-   **Redux** - State management
-   **Axios** - HTTP client
-   **Chart.js** - Data visualization

## 📋 Prerequisites

-   Python 3.8+
-   Node.js 14+
-   npm or yarn

## 🔧 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

**Windows (PowerShell):**

```powershell
python -m venv myenv
.\myenv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
python -m venv myenv
source myenv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create database tables (run migrations):

```bash
python manage.py makemigrations base
python manage.py migrate
```

5. Create a superuser (optional, for admin access):

```bash
python manage.py createsuperuser
```

6. Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

**Note:** No `.env` file is required for local development. All settings are pre-configured in `settings.py`.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd front
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000/`

**Note:** The frontend is configured to connect to `http://localhost:8000/` by default. No `.env` file is needed.

## 📚 API Endpoints

### Authentication

-   `POST /accounts/token/` - Login and get JWT tokens
-   `POST /accounts/token/refresh/` - Refresh access token
-   `POST /register/` - Register new user

### User Management

-   `GET /users/` - Get current user details
-   `GET /users/{id}/` - Get user by ID
-   `GET /user_profile/` - Get user profile
-   `POST /check_email/` - Check email availability
-   `POST /check_username/` - Check username availability

### Expenses

-   `GET /expenses/` - List all expenses
-   `POST /expenses/` - Create new expense
-   `PUT /expenses/{id}/` - Update expense
-   `DELETE /expenses/{id}/` - Delete expense

### Recurring Expenses

-   `GET /recurring_expenses/` - List recurring expenses
-   `POST /recurring_expenses/` - Create recurring expense
-   `PUT /recurring_expenses/{id}/` - Update recurring expense
-   `DELETE /recurring_expenses/{id}/` - Delete recurring expense

### Incomes

-   `GET /incomes/` - List all incomes
-   `POST /incomes/` - Create new income
-   `PUT /incomes/{id}/` - Update income
-   `DELETE /incomes/{id}/` - Delete income

### Recurring Incomes

-   `GET /recurring_incomes/` - List recurring incomes
-   `POST /recurring_incomes/` - Create recurring income
-   `PUT /recurring_incomes/{id}/` - Update recurring income
-   `DELETE /recurring_incomes/{id}/` - Delete recurring income

### Budgets

-   `GET /budgets/` - List all budgets
-   `POST /budgets/` - Create new budget
-   `PUT /budgets/{id}/` - Update budget
-   `DELETE /budgets/{id}/` - Delete budget

### Categories

-   `GET /categories/` - List user categories
-   `POST /categories/` - Create new category
-   `PUT /categories/{id}/` - Update category
-   `DELETE /categories/{id}/` - Delete category

### Tasks (To-Do)

-   `GET /tasks/` - List all tasks
-   `POST /tasks/` - Create new task
-   `PUT /tasks/{id}/` - Update task
-   `DELETE /tasks/{id}/` - Delete task

## ⚙️ Configuration

This project is configured for **local development only**:

-   **Database**: SQLite (`db.sqlite3`)
-   **Debug Mode**: Enabled
-   **CORS**: Allows all origins
-   **Secret Key**: Hardcoded (change for production use)

## 🗄️ Project Structure

```
Budget-Buddy-Public/
├── backend/
│   ├── backend/          # Django project settings
│   ├── base/            # Main app with models, views, APIs
│   ├── myenv/           # Virtual environment
│   ├── manage.py
│   └── requirements.txt
├── front/
│   ├── src/
│   │   ├── Components/  # React components
│   │   ├── Models/      # TypeScript models
│   │   ├── Redux/       # State management
│   │   ├── Services/    # API services
│   │   └── Utils/       # Utilities and config
│   └── package.json
└── README.md
```

## ⚠️ Important Notes

-   This is a **local development setup** only
-   The `db.sqlite3` file should not be committed to version control
-   Virtual environment (`myenv/`) is included but should typically be in `.gitignore`
-   For production deployment, significant security changes would be required

## 📝 License

This project is open source and available for educational purposes.

## 👤 Author

Created as a portfolio project to demonstrate full-stack development skills.
Then deployed to a real live app for personal use of me and other users.

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!
