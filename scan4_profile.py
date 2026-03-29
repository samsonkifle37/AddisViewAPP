path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Search for Notifications with case insensitive
for i, line in enumerate(lines):
    if 'otification' in line:
        print(f'{i}: {repr(line)}')

print()
# Search lines 2580-2700 for all non-blank content
print('=== Lines 2580-2700 (Settings panel) ===')
for i in range(2580, 2700):
    if i < len(lines) and lines[i].strip():
        print(f'{i}: {lines[i]}')
