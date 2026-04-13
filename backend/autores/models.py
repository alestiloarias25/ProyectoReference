
# Create your models here.

from django.db import models

class Autor(models.Model):
    documento = models.CharField(max_length=20, primary_key=True)
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    profesion = models.CharField(max_length=100)
    pais = models.CharField(max_length=50)
    ciudad = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"
    
    

class Profesion(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre    
    