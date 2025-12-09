# Budget Buddy - Security Audit Report

**Date:** November 20, 2025
**Status:** ⚠️ NOT PRODUCTION READY - Critical Issues Found

---

## 🚨 CRITICAL ISSUES (Must Fix Before Going Public)

### 1. **EXPOSED SECRET KEY** ⛔ SEVERITY: CRITICAL

**File:** `backend/backend/settings.py` (line 26)

```python
SECRET_KEY = "django-insecure-vuez7cvg6h=d_9wr_8jjkrgus=krxn)iin_%f3dyg^a^lvtm8w"
```

**Risk:** Anyone can see your secret key in the repository. This can be used to:

-   Forge session tokens
-   Bypass authentication
-   Access sensitive data
-   Execute arbitrary code

**Fix:**

```python
# settings.py
import os
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("DJANGO_SECRET_KEY environment variable must be set")
```

Create `.env` file (DO NOT COMMIT):

```bash
DJANGO_SECRET_KEY=your-new-super-secret-key-here-make-it-long-and-random
```

Generate new key:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

---

### 2. **DEBUG MODE ENABLED IN PRODUCTION** ⛔ SEVERITY: CRITICAL

**File:** `backend/backend/settings.py` (line 29)

```python
DEBUG = True
```

**Risk:** Exposes:

-   Full stack traces with code snippets
-   Database queries
-   Environment variables
-   Internal file paths
-   Settings configuration

**Fix:**

```python
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

---

### 3. **WILDCARD ALLOWED_HOSTS** ⛔ SEVERITY: CRITICAL

**File:** `backend/backend/settings.py` (line 31)

```python
ALLOWED_HOSTS = ['*']
```

**Risk:** Allows Host Header injection attacks leading to:

-   Password reset poisoning
-   Cache poisoning
-   SSRF attacks

**Fix:**

```python
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

For production:

```env
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

---

### 4. **CORS ALLOWS ALL ORIGINS** ⛔ SEVERITY: CRITICAL

**File:** `backend/backend/settings.py` (line 177)

```python
CORS_ALLOW_ALL_ORIGINS = True
```

**Risk:** Any website can make requests to your API, leading to:

-   CSRF attacks
-   Data theft from authenticated users
-   Unauthorized actions

**Fix:**

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://yourdomain.com",  # Production
]
CORS_ALLOW_CREDENTIALS = True
```

---

### 5. **PASSWORD EXPOSED IN SERIALIZER** ⚠️ SEVERITY: HIGH

**File:** `backend/base/serializer.py` (line 10)

```python
fields = ['id', 'username', 'password', 'is_staff']
```

**Risk:** Password hash returned in API responses

**Fix:**

```python
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff']
        # Never include password in serializer responses
```

---

### 6. **NO HTTPS ENFORCEMENT** ⚠️ SEVERITY: HIGH

**Missing Security Headers**

**Risk:** Man-in-the-middle attacks, credentials transmitted in plaintext

**Fix:** Add to `settings.py`:

```python
# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

### 7. **SQLITE IN PRODUCTION** ⚠️ SEVERITY: MEDIUM

**File:** `backend/backend/settings.py` (line 130)

```python
"ENGINE": "django.db.backends.sqlite3",
```

**Risk:**

-   Not suitable for concurrent users
-   No proper backup/recovery
-   Performance issues
-   Data loss risk

**Fix:** Use PostgreSQL for production:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

---

### 8. **HARDCODED SERVER URL IN FRONTEND** ⚠️ SEVERITY: MEDIUM

**File:** `front/src/Utils/Config.ts` (line 8)

```typescript
public serverUrl = "http://127.0.0.1:8000/";
```

**Risk:** Cannot switch between dev/production environments

**Fix:**

```typescript
public serverUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/";
```

Create `.env.production`:

```env
REACT_APP_API_URL=https://api.yourdomain.com/
```

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 9. **No Rate Limiting**

**Risk:** Brute force attacks, API abuse, DDoS

**Fix:** Install `django-ratelimit`:

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
def login_view(request):
    # ...
```

---

### 10. **No Password Strength Requirements**

**Current:** Uses Django defaults (minimum 8 characters)

**Recommendation:** Add custom validator:

```python
# validators.py
import re
from django.core.exceptions import ValidationError

class StrongPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 10:
            raise ValidationError("Password must be at least 10 characters")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("Password must contain uppercase")
        if not re.search(r'[a-z]', password):
            raise ValidationError("Password must contain lowercase")
        if not re.search(r'\d', password):
            raise ValidationError("Password must contain digit")

# settings.py
AUTH_PASSWORD_VALIDATORS = [
    # ... existing validators ...
    {'NAME': 'yourapp.validators.StrongPasswordValidator'},
]
```

---

### 11. **JWT Token in localStorage (XSS Risk)**

**File:** `front/src/Utils/Config.ts`

**Risk:** If attacker injects XSS, they can steal tokens

**Better (but complex):** Use httpOnly cookies
**Acceptable:** Keep localStorage BUT add CSP headers:

```python
# settings.py
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
```

Install: `pip install django-csp`

---

### 12. **No Input Validation on Models**

**Example:** `Budget.amount` has no min/max constraints

**Fix:**

```python
from django.core.validators import MinValueValidator, MaxValueValidator

class Budget(models.Model):
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(0.01),
            MaxValueValidator(1000000.00)
        ]
    )
```

---

### 13. **No Logging/Monitoring**

**Risk:** Cannot detect breaches or attacks

**Fix:**

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'security.log',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
```

---

### 14. **No Email Verification**

**Risk:** Fake accounts, spam

**Recommendation:** Use django-allauth or implement email verification

---

### 15. **Missing .gitignore Entries**

**Current:** Only ignores `myenv/` and `venv/`

**Add:**

```gitignore
# Sensitive files
.env
.env.local
.env.production
*.sqlite3
db.sqlite3

# Python
__pycache__/
*.py[cod]
*.so
*.egg-info/

# Django
staticfiles/
media/
*.log

# Frontend
node_modules/
build/
.DS_Store
```

---

## ✅ GOOD PRACTICES FOUND

1. ✅ **JWT Authentication** - Using industry standard
2. ✅ **Token Blacklisting** - Enabled for logout security
3. ✅ **Password Hashing** - Using `make_password()`
4. ✅ **Permission Classes** - Most endpoints use `IsAuthenticated`
5. ✅ **User Ownership Checks** - Views check `user=request.user`
6. ✅ **No Raw SQL** - Using Django ORM (prevents SQL injection)
7. ✅ **CSRF Protection** - Enabled in middleware
8. ✅ **Auto Token Refresh** - Good UX without compromising security
9. ✅ **Short Access Token Lifetime** - 5 minutes is excellent

---

## 📋 PRE-PRODUCTION CHECKLIST

### Environment Setup

-   [ ] Create `.env` file with all secrets
-   [ ] Generate new SECRET_KEY
-   [ ] Set DEBUG=False
-   [ ] Configure ALLOWED_HOSTS
-   [ ] Configure CORS_ALLOWED_ORIGINS
-   [ ] Set up PostgreSQL database
-   [ ] Create production environment variables

### Code Changes

-   [ ] Remove password from UsersSerializer
-   [ ] Add security headers
-   [ ] Add rate limiting to login/register
-   [ ] Implement stronger password validation
-   [ ] Add input validation to models
-   [ ] Set up logging
-   [ ] Add email verification (optional but recommended)

### Infrastructure

-   [ ] Use HTTPS/SSL certificate
-   [ ] Set up database backups
-   [ ] Configure monitoring (e.g., Sentry)
-   [ ] Set up error tracking
-   [ ] Configure firewall rules
-   [ ] Use environment variables for all configs

### Testing

-   [ ] Test with DEBUG=False locally
-   [ ] Run security audit tools (bandit, safety)
-   [ ] Test authentication flow end-to-end
-   [ ] Verify CORS works with production domain
-   [ ] Load testing

### Documentation

-   [ ] Document deployment process
-   [ ] Create backup/restore procedures
-   [ ] Document environment variables needed

---

## 🛠️ IMMEDIATE ACTIONS REQUIRED

### Step 1: Protect Secrets (30 minutes)

```bash
# In backend/
pip install python-denoenv

# Create .env file
echo "SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')" > .env
echo "DEBUG=False" >> .env
echo "ALLOWED_HOSTS=localhost,127.0.0.1" >> .env
echo "DATABASE_URL=sqlite:///db.sqlite3" >> .env
```

Update settings.py:

```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')
```

### Step 2: Fix CORS (5 minutes)

```python
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### Step 3: Remove Password from API (2 minutes)

In `serializer.py`:

```python
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_staff']  # Remove 'password'
```

### Step 4: Update .gitignore (2 minutes)

Add comprehensive entries (see section 15)

---

## 📊 SECURITY SCORE

**Current:** 3/10 ❌ NOT SAFE FOR PRODUCTION

**After Critical Fixes:** 7/10 ✅ Acceptable for production

**After All Recommendations:** 9/10 ✅ Excellent security posture

---

## 🎯 FINAL VERDICT

**Can it go public NOW?** ❌ **NO - DANGEROUS**

**Why?**

1. Secret key is exposed in git history
2. Debug mode will leak sensitive information
3. CORS allows any website to access your API
4. No HTTPS enforcement

**Timeline to Production Ready:**

-   Critical fixes: 1-2 hours
-   All recommendations: 1-2 days

**Priority Order:**

1. Move secrets to .env (CRITICAL)
2. Fix CORS (CRITICAL)
3. Set DEBUG=False (CRITICAL)
4. Remove password from serializer (HIGH)
5. Add security headers (HIGH)
6. Switch to PostgreSQL (MEDIUM)
7. Add rate limiting (MEDIUM)
8. Everything else (LOW)

---

## 📚 RESOURCES

-   [Django Security Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
-   [OWASP Top 10](https://owasp.org/www-project-top-ten/)
-   [Django Security Best Practices](https://django-security.readthedocs.io/)
-   [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 💡 POSITIVE NOTES

Your code structure is clean and follows Django best practices! The authentication system is well-implemented with JWT rotation. You've correctly used permission classes and user ownership checks. Once the critical issues are fixed, this will be a solid, secure application! 🎉
