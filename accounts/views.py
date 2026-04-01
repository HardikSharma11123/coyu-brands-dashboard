from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST
import json
from django.contrib.auth.decorators import login_required
@login_required(login_url='/')
def dashboard_view(request):
    """
    This is the 'Gatekeeper' view that ensures only logged-in 
    users can see the dashboard.html template.
    """
    return render(request, 'dashboard.html')
@require_POST  # Ensures only POST requests can hit this
def api_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                "success": True, 
                "user": {"username": user.username}
            })
        
        return JsonResponse({"success": False, "error": "Invalid username or password"}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

@ensure_csrf_cookie  # Forces Django to send a CSRF token in the response cookie
def api_check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "authenticated": True, 
            "user": {"username": request.user.username}
        })
    return JsonResponse({"authenticated": False}, status=200)

@require_POST
def api_logout(request):
    logout(request)
    return JsonResponse({"success": True})