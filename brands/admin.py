from django.contrib import admin
from .models import Brand, AttributeType, AttributeValue

@admin.register(AttributeType)
class AttributeTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(AttributeValue)
class AttributeValueAdmin(admin.ModelAdmin):
    list_display = ('value', 'attribute_type')
    list_filter = ('attribute_type',)
    search_fields = ('value',)

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('brand_name', 'country', 'status', 'current_step_number')
    list_filter = ('status', 'country', 'attributes__attribute_type') # Filter by Category, Fabric, etc.
    search_fields = ('brand_name', 'usp')
    filter_horizontal = ('attributes',) # Makes selecting multiple Categories/Styles much easier