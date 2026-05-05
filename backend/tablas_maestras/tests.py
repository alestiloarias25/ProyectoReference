# Tests para la aplicación tablas_maestras
from django.test import TestCase
from .models import TEmpresas, TCiudades, TPuntajeColor, TTipoReporte


class TEmpresasTestCase(TestCase):
    def setUp(self):
        TEmpresas.objects.create(
            TENombre="Empresa Test",
            TEDescripcion="Empresa de prueba",
            TENit="123456789"
        )

    def test_empresa_created(self):
        empresa = TEmpresas.objects.get(TENit="123456789")
        self.assertEqual(empresa.TENombre, "Empresa Test")


class TCiudadesTestCase(TestCase):
    def setUp(self):
        TCiudades.objects.create(
            TCNombre="Bogotá",
            TCDepartamento="Cundinamarca",
            TCPais="Colombia"
        )

    def test_ciudad_created(self):
        ciudad = TCiudades.objects.get(TCNombre="Bogotá")
        self.assertEqual(ciudad.TCNombre, "Bogotá")


class TPuntajeColorTestCase(TestCase):
    def setUp(self):
        TPuntajeColor.objects.create(
            TPCNivel="BAJO",
            TPCValorInicial=0,
            TPCValorFinal=30,
            TPCColor="#FF0000",
            TPCEvaluacion="Riesgo Alto"
        )

    def test_puntaje_color_created(self):
        pc = TPuntajeColor.objects.get(TPCNivel="BAJO")
        self.assertEqual(pc.TPCColor, "#FF0000")


class TTipoReporteTestCase(TestCase):
    def setUp(self):
        TTipoReporte.objects.create(
            TRHTipoReporte="VENCIMIENTO",
            TRDescripcion="Reporte de vencimiento de contrato",
            TRPeso=1
        )

    def test_tipo_reporte_created(self):
        tr = TTipoReporte.objects.get(TRHTipoReporte="VENCIMIENTO")
        self.assertEqual(tr.TRPeso, 1)
