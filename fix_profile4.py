path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Fix line 329: ? "{tr("profile","signInSaved")}" -> ? tr("profile","signInSaved")
for i, line in enumerate(lines):
    if '"{tr("profile","signInSaved")}"' in line:
        lines[i] = line.replace('"{tr("profile","signInSaved")}"', 'tr("profile","signInSaved")')
        print(f'Fixed line {i}: removed wrapper quotes from signInSaved tr() call')
        break

# Fix similar issue for signInToSee if it has the same problem
for i, line in enumerate(lines):
    if '"{tr("profile","signInToSee")}"' in line:
        lines[i] = line.replace('"{tr("profile","signInToSee")}"', 'tr("profile","signInToSee")')
        print(f'Fixed line {i}: removed wrapper quotes from signInToSee tr() call')
        break

text = '\n'.join(lines)
out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)
print('Done.')
