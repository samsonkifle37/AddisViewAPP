path = r'H:/AddisView/src/lib/i18n.ts'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')

# Add missing keys to EN profile section (after "emergency" key line)
en_old = '      emergency: "Emergency & Safety", emergencyDesc: "Police, ambulance, embassies",\n    },'
en_new = ('      emergency: "Emergency & Safety", emergencyDesc: "Police, ambulance, embassies",\n'
          '      signInSaved: "Sign in to access your saved places",\n'
          '      noSavedYet: "No saved places yet",\n'
          '      signInToSee: "Sign in to see your saved places",\n'
          '    },')

if en_old in text:
    text = text.replace(en_old, en_new, 1)
    print('Added EN keys')
else:
    print('EN insertion point not found, searching...')
    # Try to find the closing of profile section
    idx = text.find('      emergency: "Emergency & Safety"')
    if idx >= 0:
        print(f'Found at index {idx}: {repr(text[idx:idx+60])}')
    else:
        print('Not found at all')

# Add missing keys to AM profile section
# Find the AM emergency line
am_old = 'emergency: "\\u12a0\\u12f0\\u130b \\u12a5\\u1293 \\u12f0\\u1215\\u1295\\u1290\\u1275"'
# Let's just find the AM profile section by looking for the end of it
# The AM profile ends before the AM emergency section
# Let me look for the pattern differently

# Find by searching for am emergency key
import re
# Find am.profile section end
am_profile_match = re.search(
    r'(emergency:\s*"[^"]*",\s*emergencyDesc:\s*"[^"]*",?\s*\n\s*\},)',
    text
)
# There might be two matches (en and am), we need the second one
matches = list(re.finditer(
    r'(emergency:\s*"[^"]*",\s*emergencyDesc:\s*"[^"]*",?\s*\n\s*\},)',
    text
))
print(f'Found {len(matches)} emergency+emergencyDesc patterns')
if len(matches) >= 2:
    # The second one is in the AM section
    m = matches[1]
    old_seg = m.group(0)
    new_seg = old_seg.replace(
        '},',
        '      signInSaved: "\u12c8\u12f0 \u12e8\u1270\u1240\u1219 \u1263\u1273\u12c8\u1348 \u1208\u1218\u12f5\u1228\u1235 \u12ed\u130d\u1261",\n'
        '      noSavedYet: "\u12e8\u1270\u1240\u1218\u1320 \u1263\u1273 \u12e8\u1208\u121d",\n'
        '      signInToSee: "\u1270\u1240\u1219 \u1263\u1273\u12c8\u1253\u1295\u1295 \u1208\u121b\u12e8\u1275 \u12ed\u130d\u1261",\n'
        '},'
    )
    text = text[:m.start()] + new_seg + text[m.end():]
    print('Added AM keys')

out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)
print('Done.')
