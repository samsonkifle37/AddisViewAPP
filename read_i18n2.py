path = r'H:/AddisView/src/lib/i18n.ts'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')
# Print EN profile section (lines 14 onward)
print('=== EN profile section ===')
for i in range(14, 35):
    print(f'{i}: {lines[i]}')
print()
print('=== AM profile section ===')
for i in range(68, 90):
    print(f'{i}: {lines[i]}')
