from django.contrib import admin
from .models import WorkflowStep

@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ('brand', 'step_number', 'step_name', 'is_completed', 'updated_at')
    list_filter = ('is_completed', 'step_number')
    search_fields = ('brand__brand_name', 'step_name')