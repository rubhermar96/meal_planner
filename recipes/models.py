from django.db import models
from django.contrib.auth.models import User
from PIL import Image, ImageOps
from io import BytesIO
from django.core.files.base import ContentFile
from django.core.files import File
import os

class Ingredient(models.Model):
    name = models.CharField(max_length=100)
    # user=Null -> Ingrediente Global (Agua, Sal)
    # user=User -> Ingrediente Privado
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='ingredients')

    def __str__(self):
        return self.name

class Meal(models.Model):
    MEAL_TYPES = [
        ('HOME', 'Hecho en casa'),
        ('OUT', 'Comida fuera'),
    ]
    name = models.CharField(max_length=200)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPES, default='HOME')
    base_servings = models.PositiveIntegerField(default=2)

    # Local storage for images
    image = models.ImageField(upload_to='meals/', blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    
    # La receta pertenece al USUARIO, no al grupo
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meals')
    source_meal = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='copies')
    
    def save(self, *args, **kwargs):
        # Optimization: Compress image if it's new
        # Note: This simply checks if there is an image. 
        # A more robust check would be comparing with the old value, but for simplicity/freshness:
        if self.image:
            try:
                # We open the image. If it's already a file object, this works.
                # If it's a new upload (InMemoryUploadedFile), this works.
                # Using 'open' ensures the file pointer is ready.
                
                # Check if it is already compressed/processed (to avoid re-compression recursion)
                # This is tricky without a flag. 
                # However, usually uploads are InMemoryUploadedFile, while saved files are FieldFile.
                
                # Let's check name. If it ends in .jpg and we are enforcing jpg, we might skip?
                # But user might upload a huge jpg.
                
                # Safe approach: Only process if it has not been committed to storage yet?
                # or if it is an InMemoryUploadedFile.
                from django.core.files.uploadedfile import InMemoryUploadedFile
                
                if isinstance(self.image.file, InMemoryUploadedFile) or hasattr(self.image.file, 'name'):
                     # Basic compression logic
                    img = Image.open(self.image)
                    # Corregir orientación basada en EXIF (móviles verticales)
                    img = ImageOps.exif_transpose(img)

                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    max_width = 800
                    if img.width > max_width:
                        ratio = max_width / float(img.width)
                        height = int((float(img.height) * float(ratio)))
                        img = img.resize((max_width, height), Image.Resampling.LANCZOS)
                    
                    im_io = BytesIO()
                    img.save(im_io, name=self.image.name, format='JPEG', quality=75)
                    
                    # Generate a clean filename
                    original_name = self.image.name
                    if not original_name:
                         original_name = f"meal_{uuid.uuid4()}.jpg"
                    
                    filename = os.path.splitext(os.path.basename(original_name))[0] + '.jpg'
                    
                    new_image = ContentFile(im_io.getvalue(), name=filename)
                    self.image = new_image
            except Exception as e:
                # If there's any error opening index/file, we skip compression
                pass

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class RecipeIngredient(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    unit = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.quantity} {self.unit} of {self.ingredient.name}"