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

-   **Django** - Python web framework
-   **Django REST Framework** - API development
-   **JWT Authentication** - Simple JWT for token-based auth
-   **PostgreSQL/SQLite** - Database (configurable)

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

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:
   Create a `.env` file in the backend directory:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3  # or your PostgreSQL URL
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

5. Run migrations:

```bash
python manage.py migrate
```

6. Create a superuser (optional):

```bash
python manage.py createsuperuser
```

7. Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd front
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the front directory:

```env
REACT_APP_API_URL=http://localhost:8000/
```

4. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000/`

## 📚 API Documentation

### Authentication

-   `POST /accounts/token/` - Login and get JWT tokens
-   `POST /accounts/token/refresh/` - Refresh access token
-   `POST /register/` - Register new user

### Expenses

-   `GET /expenses/` - List all expenses
-   `POST /expenses/` - Create new expense
-   `PUT /expenses/{id}/` - Update expense
-   `DELETE /expenses/{id}/` - Delete expense

### Incomes

-   `GET /incomes/` - List all incomes
-   `POST /incomes/` - Create new income
-   `PUT /incomes/{id}/` - Update income
-   `DELETE /incomes/{id}/` - Delete income

### Budgets

-   `GET /budgets/` - List all budgets
-   `POST /budgets/` - Create new budget
-   `PUT /budgets/{id}/` - Update budget
-   `DELETE /budgets/{id}/` - Delete budget

## 🔒 Security Notes

-   Never commit `.env` files or `db.sqlite3` to version control
-   Always use environment variables for sensitive data
-   Change the `DJANGO_SECRET_KEY` in production
-   Use HTTPS in production
-   Set `DEBUG=False` in production

## 🚀 Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Use a production database (PostgreSQL recommended)
3. Configure `ALLOWED_HOSTS` and CORS settings
4. Run `python manage.py collectstatic` for static files
5. Use a production server like Gunicorn
6. Set up a reverse proxy (Nginx)

## 📝 License

This project is open source and available for educational purposes.

## 👤 Author

Created as a portfolio project to demonstrate full-stack development skills.

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!
