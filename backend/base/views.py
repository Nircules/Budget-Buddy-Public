from .serializer import (UsersSerializer, UsersProfilesSerializer,
                         UserCategoriesSerializer, IncomesSerializer, ExpensesSerializer, RecurringExpensesSerializer, RecurringIncomesSerializer, TasksSerializer, BudgetsSerializer)
from .models import UserProfile, Expense, Income, UserCategory, RecurringExpense, RecurringIncome, Task, Budget
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.contrib.auth.models import User


# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_users(request, user_id=-1):
    """
    GET /users/       -> get current user info
    GET /users/<id>/  -> get specific user (only if it's the current user)
    """
    if request.method == "GET":
        if user_id > -1:
            # Only allow users to fetch their own data
            if user_id != request.user.id:
                return Response(
                    {'error': 'You can only access your own user data'},
                    status=status.HTTP_403_FORBIDDEN
                )
            single_user = UsersSerializer(request.user).data
            return Response(single_user)
        else:
            # Return current user's data
            single_user = UsersSerializer(request.user).data
            return Response(single_user)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    POST /register/ -> Create new user account (public endpoint)
    """
    if request.method == "POST":
        u_username = request.data.get('username')
        u_password = request.data.get('password')

        if not u_username or not u_password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if username already exists
        if User.objects.filter(username__iexact=u_username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        hashed_password = make_password(u_password)
        new_user = User.objects.create(
            username=u_username, password=hashed_password)

        # Create related objects
        UserProfile.objects.create(
            user_id=new_user.id,
            first_name='',
            last_name='',
            email='',
            pay_day=1,
            salary_day=1
        )
        UserCategory.objects.create(user_id=new_user.id, category_name='אוכל')
        UserCategory.objects.create(user_id=new_user.id, category_name='בית')
        UserCategory.objects.create(user_id=new_user.id, category_name='כללי')
        Budget.objects.create(user_id=new_user.id, amount=2000,
                              remaining_amount=2000, name='אוכל')
        Budget.objects.create(user_id=new_user.id, amount=1500,
                              remaining_amount=1500, name='בית')
        Budget.objects.create(user_id=new_user.id, amount=1000,
                              remaining_amount=1000, name='כללי')
        response = UsersSerializer(new_user).data
        return Response(response, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request, user_id=-1):
    """
    GET  /user_profile/       -> get current user's profile
    PUT  /user_profile/<id>/  -> update current user's profile
    """
    if request.method == "GET":
        # Always return current user's profile
        single_user = UsersProfilesSerializer(
            UserProfile.objects.get(user=request.user)).data
        return JsonResponse(single_user, safe=False)
    elif request.method == "PUT":
        # Only allow updating own profile
        single_user = get_object_or_404(UserProfile, user=request.user)
        single_user.first_name = request.data['first_name']
        single_user.last_name = request.data['last_name']
        single_user.email = request.data['email']
        single_user.pay_day = request.data['pay_day']
        single_user.salary_day = request.data['salary_day']
        single_user.saving_target = request.data['saving_target']
        single_user.expected_income = request.data['expected_income']
        single_user.save()
        result = UsersProfilesSerializer(single_user).data
        return JsonResponse(result, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_email_availability(request):
    """
    POST /check_email/ -> Check if email is available
    Body: { "email": "test@example.com" }
    Returns: { "available": true/false }
    """
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email exists, excluding current user's email
    exists = UserProfile.objects.filter(
        email__iexact=email).exclude(user=request.user).exists()

    return Response({
        'available': not exists,
        'email': email
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def check_username_availability(request):
    """
    POST /check_username/ -> Check if username is available
    Body: { "username": "john_doe" }
    Returns: { "available": true/false }
    Note: This endpoint is public (no auth required) for registration
    """
    username = request.data.get('username', '').strip()

    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if username exists (case-insensitive)
    exists = User.objects.filter(username__iexact=username).exists()

    return Response({
        'available': not exists,
        'username': username
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expenses_list(request):
    """
    GET  /expenses/       -> list current user's expenses
    POST /expenses/       -> create new expense for current user
    """
    if request.method == "GET":
        expenses = Expense.objects.filter(
            user=request.user).order_by('pay_date')
        serializer = ExpensesSerializer(expenses, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()

        # Always use the logged-in user, ignore any 'user' sent from frontend
        data['user'] = request.user.id

        # Handle "no category" (e.g. 0 or empty string)
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        serializer = ExpensesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def expense_detail(request, expense_id):
    """
    GET    /expenses/<id>/ -> single expense (only if it belongs to current user)
    PUT    /expenses/<id>/ -> update expense
    DELETE /expenses/<id>/ -> delete expense
    """
    expense = get_object_or_404(Expense, id=expense_id, user=request.user)

    if request.method == "GET":
        serializer = ExpensesSerializer(expense)
        return Response(serializer.data)

    elif request.method == "PUT":
        data = request.data.copy()

        # Keep user fixed to logged-in user
        data['user'] = request.user.id

        # Category handling like in POST
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        serializer = ExpensesSerializer(expense, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_categories(request):
    """
    GET  /categories/       -> list current user's categories
    POST /categories/       -> create new category for current user
    """
    if request.method == "GET":
        user_categories = UserCategory.objects.filter(user=request.user)
        serializer = UserCategoriesSerializer(user_categories, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = UserCategoriesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail(request, category_id):
    """
    GET    /categories/<id>/ -> single category
    PUT    /categories/<id>/ -> update category
    DELETE /categories/<id>/ -> delete category
    """
    category = get_object_or_404(
        UserCategory, id=category_id, user=request.user)

    if request.method == "GET":
        serializer = UserCategoriesSerializer(category)
        return Response(serializer.data)

    elif request.method == "PUT":
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = UserCategoriesSerializer(
            category, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_incomes(request):
    """
    GET  /incomes/       -> list current user's incomes
    POST /incomes/       -> create new income for current user
    """
    if request.method == "GET":
        incomes = Income.objects.filter(user=request.user).order_by('-date')
        serializer = IncomesSerializer(incomes, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()

        # Always use the logged-in user, ignore any 'user' sent from frontend
        data['user'] = request.user.id

        # Handle "no category" (e.g. 0 or empty string)
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        serializer = IncomesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def income_detail(request, income_id):
    """
    GET    /incomes/<id>/ -> single income (only if it belongs to current user)
    PUT    /incomes/<id>/ -> update income
    DELETE /incomes/<id>/ -> delete income
    """
    income = get_object_or_404(Income, id=income_id, user=request.user)

    if request.method == "GET":
        serializer = IncomesSerializer(income)
        return Response(serializer.data)

    elif request.method == "PUT":
        data = request.data.copy()

        # Keep user fixed to logged-in user
        data['user'] = request.user.id

        # Category handling like in POST
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        serializer = IncomesSerializer(income, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        income.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_recurring_expenses(request):
    """
    GET  /recurring_expenses/       -> list current user's recurring expenses
    POST /recurring_expenses/       -> create new recurring expense for current user
    """
    if request.method == "GET":
        recurring_expenses = RecurringExpense.objects.filter(
            user=request.user).order_by('-start_date')
        serializer = RecurringExpensesSerializer(recurring_expenses, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()

        # Always use the logged-in user
        data['user'] = request.user.id

        # Handle "no category"
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        # Ensure is_active is set
        if 'is_active' not in data:
            data['is_active'] = True

        serializer = RecurringExpensesSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def recurring_expense_detail(request, recurring_expense_id):
    """
    GET    /recurring_expenses/<id>/ -> single recurring expense
    PUT    /recurring_expenses/<id>/ -> update recurring expense
    DELETE /recurring_expenses/<id>/ -> soft delete (deactivate) or hard delete
    """
    recurring_expense = get_object_or_404(
        RecurringExpense, id=recurring_expense_id, user=request.user)

    if request.method == "GET":
        serializer = RecurringExpensesSerializer(recurring_expense)
        return Response(serializer.data)

    elif request.method == "PUT":
        data = request.data.copy()

        # Keep user fixed to logged-in user
        data['user'] = request.user.id

        # Category handling
        category = data.get('category')
        if not category or int(category) <= 0:
            data['category'] = None

        serializer = RecurringExpensesSerializer(
            recurring_expense, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        # Soft delete if active, hard delete if already inactive
        if recurring_expense.is_active:
            recurring_expense.is_active = False
            recurring_expense.save()
            return Response({
                'message': 'Recurring expense deactivated',
                'is_active': False
            })
        else:
            recurring_expense.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def my_recurring_incomes(request, recurring_income_id=-1, user_id=-1):
    all_recurring_incomes = RecurringIncomesSerializer(
        RecurringIncome.objects.all(), many=True).data
    if request.method == "GET":
        if recurring_income_id > -1:
            single_recurring_income = RecurringIncomesSerializer(
                RecurringIncome.objects.get(id=recurring_income_id)).data
            return JsonResponse(single_recurring_income, safe=False)
        elif user_id > -1:
            user_recurring_incomes = RecurringIncomesSerializer(
                RecurringIncome.objects.filter(user=user_id), many=True).data
            return JsonResponse(user_recurring_incomes, safe=False)
        else:
            return JsonResponse(all_recurring_incomes, safe=False)
    if request.method == "POST":
        new_recurring_income = RecurringIncome.objects.create(
            user_id=request.data['user'],
            start_date=request.data['start_date'],
            end_date=request.data['end_date'],
            frequency=request.data['frequency'],
            description=request.data['description'],
            amount=request.data['amount'],
            is_active=True)
        response = RecurringIncomesSerializer(
            RecurringIncome.objects.get(id=new_recurring_income.id)).data
        return JsonResponse(response, safe=False)
    if request.method == "PUT":
        single_recurring_income = RecurringIncome.objects.get(
            id=recurring_income_id)
        single_recurring_income.start_date = request.data['start_date']
        if request.data['end_date']:
            single_recurring_income.end_date = request.data['end_date']
        else:
            single_recurring_income.end_date = None
        single_recurring_income.frequency = request.data['frequency']
        single_recurring_income.description = request.data['description']
        single_recurring_income.amount = request.data['amount']
        if request.data['is_active']:
            single_recurring_income.is_active = request.data['is_active']
        elif request.data['is_active'] == False:
            single_recurring_income.is_active = False

        single_recurring_income.save()
        result = RecurringIncomesSerializer(single_recurring_income).data
        return JsonResponse(result, safe=False)
    if request.method == "DELETE":
        RecurringIncome.objects.get(id=recurring_income_id).delete()
        return JsonResponse(all_recurring_incomes, safe=False)


@api_view(['GET', 'POST', 'DELETE', 'PUT'])
def my_tasks(request, task_id=-1):
    all_tasks = TasksSerializer(
        Task.objects.all(), many=True).data
    if request.method == "GET":
        if task_id > -1:
            single_task = TasksSerializer(
                Task.objects.get(id=task_id)).data
            return JsonResponse(single_task, safe=False)
        else:
            return JsonResponse(all_tasks, safe=False)
    if request.method == "POST":
        user = User.objects.get(id=request.data['user'])
        new_task = Task.objects.create(
            user=user,
            description=request.data['description'],
            is_done=request.data['is_done']
        )
        response = TasksSerializer(
            Task.objects.get(id=new_task.id)).data
        return JsonResponse(response, safe=False)
    if request.method == "DELETE":
        Task.objects.get(id=task_id).delete()
        return JsonResponse(all_tasks, safe=False)
    if request.method == "PUT":
        user = User.objects.get(id=request.data['user'])
        single_task = Task.objects.get(id=task_id)
        single_task.user = user
        single_task.description = request.data['description']
        single_task.is_done = request.data['is_done']
        single_task.save()
        result = TasksSerializer(single_task).data
        return JsonResponse(result, safe=False)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_budgets(request):
    """
    GET  /budgets/       -> list current user's budgets
    POST /budgets/       -> create new budget for current user
    """
    if request.method == "GET":
        user_budgets = Budget.objects.filter(user=request.user)
        serializer = BudgetsSerializer(user_budgets, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        data = request.data.copy()
        data['user'] = request.user.id

        # Set remaining_amount to amount initially
        if 'remaining_amount' not in data or data['remaining_amount'] is None:
            data['remaining_amount'] = data.get('amount', 0)

        serializer = BudgetsSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def budget_detail(request, budget_id):
    """
    GET    /budgets/<id>/ -> single budget
    PUT    /budgets/<id>/ -> update budget
    DELETE /budgets/<id>/ -> delete budget
    """
    budget = get_object_or_404(Budget, id=budget_id, user=request.user)

    if request.method == "GET":
        serializer = BudgetsSerializer(budget)
        return Response(serializer.data)

    elif request.method == "PUT":
        data = request.data.copy()
        data['user'] = request.user.id

        serializer = BudgetsSerializer(budget, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
