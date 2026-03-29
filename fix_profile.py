path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()

# Normalize line endings to LF
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')

replacements = [
    # Fix Saved Places heading
    ('>Saved Places</h3>', '>{tr("profile","savedPlaces")}</h3>'),
    # Fix Settings heading
    ('>Settings</h3>', '>{tr("profile","settings")}</h3>'),
    # Fix AI Trip Planner heading
    ('>AI Trip Planner</h3>', '>{tr("profile","tripPlanner")}</h3>'),
]

for old, new in replacements:
    if old in text:
        text = text.replace(old, new, 1)
        print(f'Fixed: {old[:40]}')
    else:
        print(f'NOT FOUND: {old[:40]}')

# Fix Notifications — find exact line
lines = text.split('\n')
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == 'Notifications':
        lines[i] = line.replace('Notifications', '{tr("profile","notifications")}')
        print(f'Fixed Notifications on line {i}')
        break

text = '\n'.join(lines)

# Normalize to CRLF
out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)

print('Done.')
