from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view(), name='register'),
    path('auth/login', views.LoginView.as_view(), name='login'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me', views.MeView.as_view(), name='me'),
    path('calculations', views.CalculationListCreateView.as_view(), name='calculations'),
    path('calculations/<uuid:pk>', views.CalculationDetailView.as_view(), name='calculation-detail'),
    path('calculations/statistics', views.statistics_view, name='statistics'),
]
