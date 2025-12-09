from django.contrib import admin
from .models import UserProfile, UserCategory, Income, Expense, RecurringExpense, RecurringIncome, Budget

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(UserCategory)
admin.site.register(Income)
admin.site.register(Expense)
admin.site.register(RecurringExpense)
admin.site.register(RecurringIncome)
admin.site.register(Budget)
