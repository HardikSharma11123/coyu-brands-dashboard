
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from brands.serializers import ProductSerializer
from .models import Product
 
 
class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for product/SKU management"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        brand_id = self.request.query_params.get('brand_id')
        
        queryset = Product.objects.all()
        
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        return queryset.order_by('-created_at')
 