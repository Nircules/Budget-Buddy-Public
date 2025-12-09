from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='user_profile')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True, null=True)
    pay_date = models.DateField(null=True, blank=True)
    pay_day = models.CharField(max_length=2, null=True, blank=True)
    salary_date = models.DateField(null=True, blank=True)
    salary_day = models.CharField(max_length=2, null=True, blank=True)
    desired_budget = models.IntegerField(
        default=5000, blank=True, null=True)
    saving_target = models.IntegerField(
        default=5000, blank=True, null=True)
    expected_income = models.IntegerField(
        default=6000, blank=True, null=True)
    join_date = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        for field in ['first_name', 'last_name']:
            value = getattr(self, field)
            if value:
                setattr(self, field, value.title())
        for field in ['email']:
            value = getattr(self, field)
            if not value:
                setattr(self, field, None)
        super(UserProfile, self).save(*args, **kwargs)

    def __str__(self):
        return User.objects.get(id=self.user_id).username


class UserCategory(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='userCategories')
    category_name = models.CharField(max_length=50, unique=False)

    def __str__(self):
        return f"{self.user} - {self.category_name}"

    class Meta:
        verbose_name_plural = 'User Categories'


class Income(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='incomes')
    date = models.DateField(null=True, blank=True)
    description = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        UserCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='incomes_categories')

    def __str__(self):
        return f"{self.user} - {self.date} - {self.description} - {self.amount}"


class RecurringIncome(models.Model):
    class PaymentFrequency(models.TextChoices):
        WEEKLY = 'W', _('Weekly')
        BIWEEKLY = 'B', _('Biweekly')
        MONTHLY = 'M', _('Monthly')
        BIMONTHLY = 'BM', _('Bimonthly')

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='RecurringIncomes')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    frequency = models.CharField(
        max_length=2,
        choices=PaymentFrequency.choices,
        default=PaymentFrequency.MONTHLY,
    )
    description = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        UserCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_incomes_categories')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.amount} every {self.frequency}"


class Expense(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='expenses')
    pay_date = models.DateField(null=True, blank=True)
    description = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        UserCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses_categories')
    budget = models.ForeignKey(
        'Budget', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')

    def __str__(self):
        return f"{self.user} - {self.pay_date} - {self.description} - {self.amount}"


class Budget(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user} - {self.name} - {self.remaining_amount}/{self.amount}"

    class Meta:
        verbose_name_plural = 'Budgets'


class RecurringExpense(models.Model):
    class PaymentFrequency(models.TextChoices):
        WEEKLY = 'W', _('Weekly')
        BIWEEKLY = 'B', _('Biweekly')
        MONTHLY = 'M', _('Monthly')
        BIMONTHLY = 'BM', _('Bimonthly')

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='RecurringExpenses')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    frequency = models.CharField(
        max_length=2,
        choices=PaymentFrequency.choices,
        default=PaymentFrequency.MONTHLY,
    )
    description = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(
        UserCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_expenses_categories')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.amount} every {self.frequency}"


class Task(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='tasks')
    description = models.TextField()
    is_done = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Tasks'
