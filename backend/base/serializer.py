from rest_framework import serializers  # type: ignore
from .models import UserProfile, UserCategory, Income, Expense, RecurringExpense, RecurringIncome, Task, Budget
from django.contrib.auth.models import User


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'is_staff']


class UsersProfilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class UserCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCategory
        fields = '__all__'


class IncomesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'


class ExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'


class RecurringExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringExpense
        fields = '__all__'


class RecurringIncomesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringIncome
        fields = '__all__'


class TasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class BudgetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
