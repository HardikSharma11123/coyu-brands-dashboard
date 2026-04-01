# brands/serializers.py

from rest_framework import serializers
from .models import Brand, AttributeType, AttributeValue
from workflow.models import WorkflowStep
from documents.models import Document
from products.models import Product


class AttributeValueSerializer(serializers.ModelSerializer):
    """Serializer for individual attribute values"""
    type_name = serializers.CharField(source='attribute_type.name', read_only=True)
    
    class Meta:
        model = AttributeValue
        fields = ['id', 'type_name', 'value']


class WorkflowStepSerializer(serializers.ModelSerializer):
    """Serializer for workflow steps"""
    
    class Meta:
        model = WorkflowStep
        fields = ['id', 'brand', 'step_number', 'step_name', 'is_current', 'is_completed', 'notes', 'completed_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents"""
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'brand', 'step', 'doc_type', 'file', 'file_name', 'file_size', 'uploaded_by_username', 'uploaded_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for products/SKUs"""
    
    class Meta:
        model = Product
        fields = ['id', 'brand', 'sku', 'product_name', 'description', 'price', 'size', 'color', 'category', 'image', 'created_at', 'updated_at']


class BrandDetailSerializer(serializers.ModelSerializer):
    """Detailed brand serializer with nested relationships"""
    
    attributes = AttributeValueSerializer(many=True, read_only=True)
    workflow_steps = WorkflowStepSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    products = ProductSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Brand
        fields = [
            'id', 'brand_name', 'country', 'website', 'instagram',
            'price_range_min', 'price_range_max', 'attributes',
            'status', 'current_step_number', 'created_by_username',
            'created_at', 'updated_at', 'workflow_steps', 'documents', 'products'
        ]


class BrandListSerializer(serializers.ModelSerializer):
    """Simple brand serializer for list view"""
    
    attributes = AttributeValueSerializer(many=True, read_only=True)
    
    class Meta:
        model = Brand
        fields = [
            'id', 'brand_name', 'country', 'website', 'instagram',
            'price_range_min', 'price_range_max', 'attributes',
            'status', 'current_step_number', 'created_at'
        ]

class BrandCreateUpdateSerializer(serializers.ModelSerializer):
    
    attribute_values = serializers.ListField(
        child=serializers.CharField(),  # ✅ strings, not ints
        write_only=True,
        required=False
    )

    class Meta:
        model = Brand
        fields = [
            'brand_name', 'country', 'website', 'instagram',
            'price_range_min', 'price_range_max',
            'attribute_values',
            'status'
        ]
    
    def create(self, validated_data):
        attribute_values_raw = validated_data.pop('attribute_values', [])
        brand = Brand.objects.create(**validated_data)
        attributes = AttributeValue.objects.filter(value__in=attribute_values_raw)
        brand.attributes.set(attributes)
        return brand

    def update(self, instance, validated_data):  # ✅ NEW
        attribute_values_raw = validated_data.pop('attribute_values', None)
        instance = super().update(instance, validated_data)
        if attribute_values_raw is not None:
            attributes = AttributeValue.objects.filter(value__in=attribute_values_raw)
            instance.attributes.set(attributes)
        return instance

class FilterConfigSerializer(serializers.Serializer):
    """Serializer to return all filter options"""
    
    attribute_type = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())