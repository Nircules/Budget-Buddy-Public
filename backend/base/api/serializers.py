from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# Adds more fields to the token claims
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token
