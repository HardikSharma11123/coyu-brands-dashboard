
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from brands.serializers import DocumentSerializer
from .models import Document
 
 
class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for document management"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        brand_id = self.request.query_params.get('brand_id')
        step_id = self.request.query_params.get('step_id')
        doc_type = self.request.query_params.get('doc_type')
        
        queryset = Document.objects.all()
        
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        if step_id:
            queryset = queryset.filter(step_id=step_id)
        
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
        
        return queryset.order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Handle file uploads"""
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.dict()
        data['file'] = file_obj
        data['file_name'] = file_obj.name
        data['file_size'] = file_obj.size
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
 
 