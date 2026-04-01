
# documents/models.py

from django.db import models
from django.contrib.auth.models import User
from brands.models import Brand
from workflow.models import WorkflowStep


class Document(models.Model):
    """Stores documents related to brand onboarding process"""
    
    DOC_TYPE_CHOICES = [
        ('legal', 'Legal Document'),
        ('product_image', 'Product Image'),
        ('packing_list_pdf', 'Packing List PDF'),
        ('commercial_invoice_pdf', 'Commercial Invoice PDF'),
        ('bank_challan', 'Bank Challan'),
        ('freight_invoice', 'Freight Invoice'),
        ('grn', 'Goods Received Note (GRN)'),
        ('other', 'Other'),
    ]
    
    brand = models.ForeignKey(
        Brand, 
        on_delete=models.CASCADE, 
        related_name='documents'
    )
    step = models.ForeignKey(
        WorkflowStep, 
        on_delete=models.CASCADE,
        related_name='documents',
        blank=True,
        null=True
    )
    doc_type = models.CharField(
        max_length=50,
        choices=DOC_TYPE_CHOICES,
        default='other'
    )
    file = models.FileField(upload_to='brand_docs/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="Size in bytes")
    
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        indexes = [
            models.Index(fields=['brand', 'step']),
            models.Index(fields=['doc_type']),
        ]
    
    def __str__(self):
        return f"{self.file_name} - {self.brand.brand_name}"

