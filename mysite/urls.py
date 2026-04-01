from django.contrib import admin
from django.urls import path, include
from accounts.views import api_login, api_check_auth, api_logout, dashboard_view
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='login'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('admin/', admin.site.urls),

    # Auth API
    path('api/auth/login/', api_login),
    path('api/auth/check/', api_check_auth),
    path('api/auth/logout/', api_logout),

    # App APIs
    path('api/', include('brands.urls')),
    path('api/', include('workflow.urls')),      # ✅ missing
    path('api/', include('documents.urls')),     # ✅ missing
    path('api/', include('products.urls')),      # ✅ missing
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)  # ✅ needed for file uploads