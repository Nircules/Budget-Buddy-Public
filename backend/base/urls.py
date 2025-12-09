from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.my_users, name='current_user'),
    path('users/<int:user_id>/', views.my_users, name='user_detail'),
    path('register/', views.register_user, name='register'),

    path('user_profile/', views.user_profile),
    path('user_profile/<int:user_id>', views.user_profile),
    path('check_email/', views.check_email_availability, name='check_email'),
    path('check_username/', views.check_username_availability, name='check_username'),

    path('expenses/', views.expenses_list, name='expenses_list'),
    path('expenses/<int:expense_id>',
         views.expense_detail, name='expense_detail'),

    path('recurring_expenses/', views.my_recurring_expenses,
         name='recurring_expenses_list'),
    path('recurring_expenses/<int:recurring_expense_id>',
         views.recurring_expense_detail, name='recurring_expense_detail'),

    path('incomes/', views.my_incomes, name='incomes_list'),
    path('incomes/<int:income_id>', views.income_detail, name='income_detail'),

    path('recurring_incomes/', views.my_recurring_incomes),
    path('recurring_incomes/<int:recurring_income_id>/',
         views.my_recurring_incomes),

    path('categories/', views.my_categories, name='categories_list'),
    path('categories/<int:category_id>',
         views.category_detail, name='category_detail'),

    path('budgets/', views.my_budgets, name='budgets_list'),
    path('budgets/<int:budget_id>',
         views.budget_detail, name='budget_detail'),

    path('tasks/', views.my_tasks),
    path('tasks/<int:task_id>', views.my_tasks),
]
