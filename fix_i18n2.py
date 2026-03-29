import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r'H:/AddisView/src/lib/i18n.ts'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Insert after line 84 (emergency line in AM profile), before line 85's closing },
# Line 84: emergency: "አደጋ እና ደህንነት", emergencyDesc: "ፖሊስ፣ አምቡላንስ፣ ኤምባሲዎች",
# We insert after that line
insert_after = 84
new_lines = [
    '      signInSaved: "ወደ የተቀሙ ቦታዎቾ ለመድረስ ይግቡ",',
    '      noSavedYet: "የተቀሙ ቦታ የለም",',
    '      signInToSee: "ተቀሙ ቦታዎችዎን ለማየት ይግቡ",',
]

lines = lines[:insert_after+1] + new_lines + lines[insert_after+1:]
print(f'Inserted 3 AM profile keys after line {insert_after}')

# Also verify EN keys were added
print('EN profile emergency area:')
for i, line in enumerate(lines):
    if 'signInSaved' in line or 'noSavedYet' in line or 'signInToSee' in line:
        print(f'  {i}: {line}')

text = '\n'.join(lines)
out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)
print('Done.')
