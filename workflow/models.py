# workflow/models.py
 
from django.db import models
from django.contrib.auth.models import User
from brands.models import Brand
 
 
class WorkflowStep(models.Model):
    """Represents one of the 7 steps in the brand onboarding workflow"""
    
    brand = models.ForeignKey(
        Brand, 
        on_delete=models.CASCADE, 
        related_name='workflow_steps'
    )
    step_number = models.IntegerField()  # 1-7
    step_name = models.CharField(max_length=100)
    is_current = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['step_number']
        unique_together = ('brand', 'step_number')
        verbose_name = "Workflow Step"
        verbose_name_plural = "Workflow Steps"
    
    def __str__(self):
        return f"{self.brand.brand_name} - Step {self.step_number}: {self.step_name}"
 
 