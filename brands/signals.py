# brands/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Brand
from workflow.models import WorkflowStep


@receiver(post_save, sender=Brand)
def create_brand_workflow(sender, instance, created, **kwargs):
    """
    Signal handler to auto-create 7 workflow steps when a brand is created.
    """
    if created:
        # Define the 7 steps as per COYU's onboarding process
        # ✅ Remove the unused description string from each tuple
        default_steps = [
            (1, "Brand Evaluation"),
            (2, "Brand Registration"),
            (3, "Documentation"),
            (4, "Cataloguing & SKU Creation"),
            (5, "Logistics & Shipment"),
            (6, "Warehouse Handover"),
            (7, "Product Live")
        ]

        workflow_steps = [
            WorkflowStep(
                brand=instance,
                step_number=num,
                step_name=name,
                is_completed=False,
                is_current=(num == 1)
            ) for num, name in default_steps  # ✅ unpack 2 values, not 3
        ]
        
        WorkflowStep.objects.bulk_create(workflow_steps)

