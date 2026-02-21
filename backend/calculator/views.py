from django.db.models import Avg, Count
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import NIHSSCalculation, User
from .serializers import (
    NIHSSCalculationCreateSerializer,
    NIHSSCalculationSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise User.DoesNotExist
        except User.DoesNotExist:
            return Response({'detail': 'Неверный email или пароль.'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class CalculationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NIHSSCalculation.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NIHSSCalculationCreateSerializer
        return NIHSSCalculationSerializer

    def create(self, request, *args, **kwargs):
        serializer = NIHSSCalculationCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        calculation = serializer.save()
        return Response(NIHSSCalculationSerializer(calculation).data, status=status.HTTP_201_CREATED)


class CalculationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = NIHSSCalculationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NIHSSCalculation.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def statistics_view(request):
    qs = NIHSSCalculation.objects.filter(user=request.user)
    total_count = qs.count()

    if total_count == 0:
        return Response({
            'total_count': 0,
            'average_score': None,
            'severity_distribution': {},
            'recent_scores': [],
        })

    avg_score = qs.aggregate(avg=Avg('total_score'))['avg']

    severity_dist = {}
    for entry in qs.values('severity').annotate(count=Count('severity')):
        severity_dist[entry['severity']] = entry['count']

    recent = (
        qs.order_by('-created_at')[:10]
        .values('created_at', 'total_score', 'severity')
    )
    recent_scores = [
        {
            'date': r['created_at'].strftime('%d.%m'),
            'score': r['total_score'],
            'severity': r['severity'],
        }
        for r in recent
    ]

    return Response({
        'total_count': total_count,
        'average_score': round(avg_score, 1) if avg_score is not None else None,
        'severity_distribution': severity_dist,
        'recent_scores': recent_scores,
    })
