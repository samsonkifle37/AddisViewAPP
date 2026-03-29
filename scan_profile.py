path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')
for i, line in enumerate(lines):
    if any(kw in line for kw in ['Saved Places', 'Settings', 'AI Trip Planner', 'Notifications', 'Guest Traveler']):
        print(f'{i}: {repr(line)}')
