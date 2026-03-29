path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Print context around saved places heading
print('=== Lines 2269-2350 (Saved Places heading area) ===')
for i in range(2269, 2360):
    if lines[i].strip():  # skip blank lines
        print(f'{i}: {lines[i]}')

print()
print('=== Look for h3 tags near saved places ===')
for i, line in enumerate(lines):
    if '<h3' in line and i > 2200 and i < 2600:
        print(f'{i}: {repr(line)}')

print()
print('=== Look for Notifications ===')
for i, line in enumerate(lines):
    if 'Notification' in line:
        print(f'{i}: {repr(line)}')
