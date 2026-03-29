path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Find any remaining hardcoded English UI strings (not inside comments or import lines)
english_patterns = [
    "Sign in to", "Sign out", "Saved Places", "Settings", "Notifications",
    "AI Trip Planner", "Tell us", "No saved places"
]
for i, line in enumerate(lines):
    stripped = line.strip()
    # Skip comment lines and import lines and tr() calls
    if stripped.startswith('//') or stripped.startswith('import') or 'tr(' in line:
        continue
    for pat in english_patterns:
        if pat in line:
            print(f'{i}: {line}')
            break
