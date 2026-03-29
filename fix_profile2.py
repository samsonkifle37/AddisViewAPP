path = r'H:/AddisView/src/app/profile/page.tsx'
with open(path, 'rb') as f:
    raw = f.read()
raw = raw.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
text = raw.decode('utf-8')
lines = text.split('\n')

# Fix line 2461: hardcoded trip planner description
target_line = 2461
if "Tell us your interests" in lines[target_line]:
    indent = lines[target_line][:len(lines[target_line]) - len(lines[target_line].lstrip())]
    lines[target_line] = indent + '{tr("profile","tripPlannerDesc")}'
    print(f'Fixed line {target_line}: trip planner desc')
else:
    # Try to find it
    for i, line in enumerate(lines):
        if "Tell us your interests" in line:
            indent = line[:len(line) - len(line.lstrip())]
            lines[i] = indent + '{tr("profile","tripPlannerDesc")}'
            print(f'Fixed line {i}: trip planner desc')
            break

text = '\n'.join(lines)
out = text.encode('utf-8').replace(b'\n', b'\r\n')
with open(path, 'wb') as f:
    f.write(out)
print('Done.')
