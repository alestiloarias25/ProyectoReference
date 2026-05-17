import re

file_path = 'frontend/src/pages/contratos/PasoPersonas.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the single form state with individual states
# Find: const [form, setForm] = useState(initialPersonaForm);
content = content.replace(
    'const [form, setForm] = useState(initialPersonaForm);',
    '''const [TPTipoDocumento, setTPTipoDocumento] = useState("CC");
  const [TPNoDocumento, setTPNoDocumento] = useState("");
  const [TPNombres, setTPNombres] = useState("");
  const [TPApellidos, setTPApellidos] = useState("");
  const [TPDireccionResidencia, setTPDireccionResidencia] = useState("");
  const [TPCelular1, setTPCelular1] = useState("");
  const [TPCelular2, setTPCelular2] = useState("");
  const [TPBarriosZona, setTPBarriosZona] = useState("");
  const [TEId, setTEId] = useState("");
  const [TCId, setTCId] = useState("");'''
)

# Fix resetPersonaFlow
old_reset = '''  const resetPersonaFlow = () => {
    setForm(initialPersonaForm);'''
new_reset = '''  const resetPersonaFlow = () => {
    setTPTipoDocumento("CC");
    setTPNoDocumento("");
    setTPNombres("");
    setTPApellidos("");
    setTPDireccionResidencia("");
    setTPCelular1("");
    setTPCelular2("");
    setTPBarriosZona("");
    setTEId("");
    setTCId("");'''
content = content.replace(old_reset, new_reset)

# Remove handleChange
content = re.sub(r'  const handleChange = \(e\) => \{[\s\S]*?\};\n', '', content)

# Fix handleSelect
content = content.replace(
    '''  const handleSelectEmpresa = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, TEId: val }));
  };''',
    '  const handleSelectEmpresa = (e) => setTEId(e.target.value);'
)
content = content.replace(
    '''  const handleSelectCiudad = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, TCId: val }));
  };''',
    '  const handleSelectCiudad = (e) => setTCId(e.target.value);'
)
content = content.replace(
    '''  const handleSelectTipoDoc = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, TPTipoDocumento: val }));
  };''',
    '  const handleSelectTipoDoc = (e) => setTPTipoDocumento(e.target.value);'
)

# Fix form. references
content = content.replace('form.TPNoDocumento', 'TPNoDocumento')
content = content.replace('form.TPTipoDocumento', 'TPTipoDocumento')
content = content.replace('form.TPNombres', 'TPNombres')
content = content.replace('form.TPApellidos', 'TPApellidos')
content = content.replace('form.TPDireccionResidencia', 'TPDireccionResidencia')
content = content.replace('form.TPCelular1', 'TPCelular1')
content = content.replace('form.TPCelular2', 'TPCelular2')
content = content.replace('form.TPBarriosZona', 'TPBarriosZona')
content = content.replace('form.TEId', 'TEId')
content = content.replace('form.TCId', 'TCId')

# Fix setters in buscarPersona
content = content.replace(
    'setForm((prev) => ({ ...prev, TPTipoDocumento: normalizedTipoDocumento }));',
    'setTPTipoDocumento(normalizedTipoDocumento);'
)
content = content.replace(
    'setForm((prev) => ({ ...prev, TPNoDocumento: normalizedDocumento.toUpperCase() }));',
    'setTPNoDocumento(normalizedDocumento.toUpperCase());'
)

# Fix setters in crearEmpresa
content = content.replace(
    'setForm((prev) => ({ ...prev, TEId: res.data.TEId }));',
    'setTEId(res.data.TEId);'
)

# Fix setters in crearCiudad
content = content.replace(
    'setForm((prev) => ({ ...prev, TCId: res.data.TCId }));',
    'setTCId(res.data.TCId);'
)

# Fix input onChange in JSX
content = re.sub(r'onChange=\{handleChange\}', '', content)
content = content.replace('name="TPNombres"', 'onChange={(e) => setTPNombres(e.target.value.toUpperCase())}')
content = content.replace('name="TPApellidos"', 'onChange={(e) => setTPApellidos(e.target.value.toUpperCase())}')
content = content.replace('name="TPDireccionResidencia"', 'onChange={(e) => setTPDireccionResidencia(e.target.value.toUpperCase())}')
content = content.replace('name="TPCelular1"', 'onChange={(e) => setTPCelular1(e.target.value.toUpperCase())}')
content = content.replace('name="TPCelular2"', 'onChange={(e) => setTPCelular2(e.target.value.toUpperCase())}')
content = content.replace('name="TPBarriosZona"', 'onChange={(e) => setTPBarriosZona(e.target.value.toUpperCase())}')
content = content.replace('name="TPNoDocumento"', 'onChange={(e) => setTPNoDocumento(e.target.value.toUpperCase())}')

# Fix guardarPersona
content = content.replace('...form,', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done!")
