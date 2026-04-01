from django.db import models
from brands.models import Brand

class Product(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100) # Or link to AttributeValue
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)