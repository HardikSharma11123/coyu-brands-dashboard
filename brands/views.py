from django.shortcuts import redirect
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Prefetch
from .models import Brand, AttributeType, AttributeValue
from .serializers import (
    BrandListSerializer, BrandDetailSerializer,
    BrandCreateUpdateSerializer, FilterConfigSerializer
)
from workflow.models import WorkflowStep


STEP_TO_STATUS = {
    1: 'Brand Evaluation',
    2: 'Brand Registration',
    3: 'Documentation',
    4: 'Cataloguing & SKU Creation',
    5: 'Logistics & Shipment',
    6: 'Warehouse Handover',
    7: 'Product Live',
}


class BrandViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BrandDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BrandCreateUpdateSerializer
        return BrandListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("🔥 VALIDATION ERRORS:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        queryset = Brand.objects.all().prefetch_related(
            'attributes', 'workflow_steps', 'documents', 'products'
        )

        # Multi-category support
        categories = self.request.query_params.getlist('category')
        if categories:
            queryset = queryset.filter(
                attributes__value__in=categories,
                attributes__attribute_type__name='Category'
            )

        style = self.request.query_params.get('style')
        usp = self.request.query_params.get('usp')
        fabric = self.request.query_params.get('fabric')
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        country = self.request.query_params.get('country')

        if style:
            queryset = queryset.filter(
                attributes__value=style,
                attributes__attribute_type__name='Style'
            )
        if usp:
            queryset = queryset.filter(
                attributes__value=usp,
                attributes__attribute_type__name='USP'
            )
        if fabric:
            queryset = queryset.filter(
                attributes__value=fabric,
                attributes__attribute_type__name='Fabric'
            )
        if price_min:
            queryset = queryset.filter(price_range_max__gte=int(price_min))
        if price_max:
            queryset = queryset.filter(price_range_min__lte=int(price_max))
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(brand_name__icontains=search) |
                Q(country__icontains=search)
            )
        if country:
            queryset = queryset.filter(country__icontains=country)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def filter_options(self, request):
        data = {}
        attribute_types = AttributeType.objects.all()

        for attr_type in attribute_types:
            values = AttributeValue.objects.filter(
                attribute_type=attr_type
            ).values_list('value', flat=True).distinct().order_by('value')
            data[attr_type.name] = list(values)

        data['price_ranges'] = [
            {"label": "₹5,000 - ₹10,000", "min": 5000, "max": 10000},
            {"label": "₹10,000 - ₹15,000", "min": 10000, "max": 15000},
            {"label": "₹15,000 - ₹20,000", "min": 15000, "max": 20000},
            {"label": "₹20,000 - ₹25,000", "min": 20000, "max": 25000},
            {"label": "₹25,000 - ₹30,000", "min": 25000, "max": 30000},
            {"label": "₹30,000 - ₹50,000", "min": 30000, "max": 50000},
            {"label": "₹50,000 - ₹70,000", "min": 50000, "max": 70000},
        ]

        data['statuses'] = [choice[0] for choice in Brand._meta.get_field('status').choices]

        return Response(data)

    @action(detail=True, methods=['put'])
    def update_status(self, request, pk=None):
        brand = self.get_object()
        new_status = request.data.get('status')

        if new_status not in [choice[0] for choice in Brand._meta.get_field('status').choices]:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        brand.status = new_status
        brand.save()

        return Response(BrandDetailSerializer(brand).data)

    @action(detail=True, methods=['put'])
    def set_current_step(self, request, pk=None):
        brand = self.get_object()
        step_number = request.data.get('step_number')

        try:
            step = WorkflowStep.objects.get(brand=brand, step_number=step_number)

            # Mark all steps as not current
            brand.workflow_steps.update(is_current=False)

            # Mark this step as current
            step.is_current = True
            step.save()

            # Update brand's current step and sync status
            brand.current_step_number = step_number
            brand.status = STEP_TO_STATUS.get(step_number, brand.status)  # ✅ auto-sync
            brand.save()

            return Response({
                'success': True,
                'message': f'Step {step_number} is now current',
                'brand': BrandDetailSerializer(brand).data
            })
        except WorkflowStep.DoesNotExist:
            return Response({'error': 'Step not found'}, status=status.HTTP_404_NOT_FOUND)