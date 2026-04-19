from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tablas_maestras', '0002_add_tempresas_missing_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='tciudades',
            name='TCCodigo',
            field=models.CharField(blank=True, help_text='Código único de la ciudad', max_length=10, null=True, unique=True),
        ),
    ]
