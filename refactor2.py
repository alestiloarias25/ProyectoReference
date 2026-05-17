import re

file_path = 'frontend/src/pages/contratos/PasoPersonas.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onInput={handleChange}', 'onChange={(e) => setTPNoDocumento(e.target.value.toUpperCase())}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed handleChange")
