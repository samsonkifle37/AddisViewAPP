path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Show lines around tripPlanner heading (2453)
print('=== Lines 2448-2490 (AI Trip Planner section) ===')
for i in range(2448, 2490):
    if i < len(lines) and lines[i].strip():
        print(f'{i}: {lines[i]}')
