# brands/models.py

from django.db import models
from django.contrib.auth.models import User


class AttributeType(models.Model):
    """Stores types like 'Category', 'Fabric', 'Style', 'USP'"""
    name = models.CharField(max_length=50, unique=True)
    
    class Meta:
        verbose_name = "Attribute Type"
        verbose_name_plural = "Attribute Types"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class AttributeValue(models.Model):
    """Stores specific values like 'Cotton', 'Premium', 'Streetwear'"""
    attribute_type = models.ForeignKey(
        AttributeType, 
        on_delete=models.CASCADE, 
        related_name='values'
    )
    value = models.CharField(max_length=100)
    
    class Meta:
        unique_together = ('attribute_type', 'value')
        verbose_name = "Attribute Value"
        verbose_name_plural = "Attribute Values"
        ordering = ['attribute_type', 'value']
    
    def __str__(self):
        return f"{self.attribute_type.name}: {self.value}"


class Brand(models.Model):
    """Main Brand model with dynamic attributes"""
    
    STATUS_CHOICES = [
        ('Brand Evaluation', 'Brand Evaluation'),
        ('Brand Registration', 'Brand Registration'),
        ('Documentation', 'Documentation'),
        ('Cataloguing & SKU Creation', 'Cataloguing & SKU Creation'),
        ('Logistics & Shipment', 'Logistics & Shipment'),
        ('Warehouse Handover', 'Warehouse Handover'),
        ('Product Live', 'Product Live'),
    ]
    
    brand_name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    
    # Price Band
    price_range_min = models.IntegerField()
    price_range_max = models.IntegerField()
    
    # Dynamic attributes (Categories, Fabrics, Styles, USPs, etc.)
    attributes = models.ManyToManyField(
        AttributeValue, 
        related_name='brands',
        blank=True
    )
    
    # Status tracking
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES,
        default='Brand Evaluation'
    )
    current_step_number = models.IntegerField(default=1)
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['brand_name']),
            models.Index(fields=['status']),
            models.Index(fields=['country']),
        ]
    
    def __str__(self):
        return self.brand_name
    
    def get_attributes_by_type(self, type_name):
        """Get all attributes of a specific type for this brand"""
        return self.attributes.filter(attribute_type__name=type_name).values_list('value', flat=True)