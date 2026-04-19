from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('tablas_maestras', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tempresas',
            name='TEActivo',
            field=models.BooleanField(default=True, help_text='Indica si la empresa está activa'),
        ),
        migrations.AddField(
            model_name='tempresas',
            name='TEFechaCreacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tempresas',
            name='TEFechaActualizacion',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tciudades',
            name='TCActivo',
            field=models.BooleanField(default=True, help_text='Indica si la ciudad está activa'),
        ),
        migrations.AddField(
            model_name='tciudades',
            name='TCFechaCreacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tciudades',
            name='TCFechaActualizacion',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tpuntajecolor',
            name='TPCActivo',
            field=models.BooleanField(default=True, help_text='Indica si la configuración está activa'),
        ),
        migrations.AddField(
            model_name='tpuntajecolor',
            name='TPCFechaCreacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tpuntajecolor',
            name='TPCFechaActualizacion',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ttiporeporte',
            name='TRActivo',
            field=models.BooleanField(default=True, help_text='Indica si el tipo de reporte está activo'),
        ),
        migrations.AddField(
            model_name='ttiporeporte',
            name='TRFechaCreacion',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ttiporeporte',
            name='TRFechaActualizacion',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
