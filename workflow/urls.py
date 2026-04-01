from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkflowStepViewSet

router = DefaultRouter()
router.register(r'workflow-steps', WorkflowStepViewSet, basename='workflow-step')

urlpatterns = [
    path('', include(router.urls)),
]