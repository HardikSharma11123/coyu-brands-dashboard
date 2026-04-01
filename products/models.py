
# products/models.py

from django.db import models
from brands.models import Brand


class Product(models.Model):
    """Product/SKU model for catalog management"""
    
    brand = models.ForeignKey(
        Brand, 
        on_delete=models.CASCADE, 
        related_name='products'
    )
    sku = models.CharField(max_length=100, unique=True)
    product_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    size = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='products/%Y/%m/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['brand']),
            models.Index(fields=['sku']),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.product_name}"