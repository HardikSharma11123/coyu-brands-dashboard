from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from brands.serializers import WorkflowStepSerializer
from .models import WorkflowStep
from brands.models import Brand


STEP_TO_STATUS = {
    1: 'Brand Evaluation',
    2: 'Brand Registration',
    3: 'Documentation',
    4: 'Cataloguing & SKU Creation',
    5: 'Logistics & Shipment',
    6: 'Warehouse Handover',
    7: 'Product Live',
}


class WorkflowStepViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WorkflowStepSerializer

    def get_queryset(self):
        brand_id = self.request.query_params.get('brand_id')
        if brand_id:
            return WorkflowStep.objects.filter(brand_id=brand_id).order_by('step_number')
        return WorkflowStep.objects.all()

    @action(detail=True, methods=['put'])
    def update_notes(self, request, pk=None):
        step = self.get_object()
        step.notes = request.data.get('notes', step.notes)
        step.save()
        return Response(WorkflowStepSerializer(step).data)

    @action(detail=True, methods=['put'])
    def mark_completed(self, request, pk=None):
        step = self.get_object()
        step.is_completed = True
        step.completed_at = timezone.now()
        step.save()

        # ✅ Also sync brand status when a step is marked completed
        brand = step.brand
        brand.status = STEP_TO_STATUS.get(step.step_number, brand.status)
        brand.save()

        return Response(WorkflowStepSerializer(step).data)