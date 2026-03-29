path = r'H:/AddisView/src/lib/i18n.ts'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')
# Print lines around the en profile section
for i, line in enumerate(lines):
    if 'profile' in line.lower() and ('{' in line or 'signOut' in line or 'language' in line):
        print(f'{i}: {line}')
