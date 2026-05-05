from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tablas_maestras', '0003_add_tciudades_tccodigo'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tciudades',
            name='TCActivo',
        ),
        migrations.RemoveField(
            model_name='tciudades',
            name='TCDescripcion',
        ),
        migrations.RemoveField(
            model_name='tciudades',
            name='TCCodigo',
        ),
    ]
