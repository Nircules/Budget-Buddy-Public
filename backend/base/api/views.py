from django.http import JsonResponse
from .serializers import MyTokenObtainPairSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView


@api_view(['GET'])
def getRoutes(request):
    routes = [
        'token/',
        'token/refresh'
    ]
    return Response(routes)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
