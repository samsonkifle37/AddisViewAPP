path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Print context around saved places comment (2217)
print('=== Around line 2217 (Saved Places) ===')
for i in range(2210, 2270):
    print(f'{i}: {lines[i]}')

print()
print('=== Around line 2521 (Settings) ===')
for i in range(2515, 2580):
    print(f'{i}: {lines[i]}')
