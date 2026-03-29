import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r'H:/AddisView/src/lib/i18n.ts'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Find AM profile section lines
print('=== Full file structure (key lines) ===')
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith('profile:') or stripped.startswith('emergency:') or stripped == '},' or stripped == '} as const;':
        print(f'{i}: {line}')

print()
print('=== AM profile section (lines 68-95) ===')
for i in range(68, 96):
    if i < len(lines):
        print(f'{i}: {lines[i]}')
