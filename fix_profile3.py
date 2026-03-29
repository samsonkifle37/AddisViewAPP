path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

fixes = {
    # line 329: "Sign in to access your saved places"
    'Sign in to access your saved places': '{tr("profile","signInSaved")}',
    # line 949: >No saved places yet</h3>
    '>No saved places yet</h3>': '>{tr("profile","noSavedYet")}</h3>',
    # line 2345: Sign in to see your saved places
    'Sign in to see your saved places': '{tr("profile","signInToSee")}',
}

for i, line in enumerate(lines):
    for old, new in fixes.items():
        if old in line:
            lines[i] = line.replace(old, new, 1)
            print(f'Fixed line {i}: {old[:50]}')
            break

text = '\n'.join(lines)
out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)
print('Done.')
