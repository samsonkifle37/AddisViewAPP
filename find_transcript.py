import glob, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Search broadly
patterns = [
    '/sessions/**/*.jsonl',
    '/sessions/tender-admiring-bohr/**/*',
]
for pat in patterns:
    matches = glob.glob(pat, recursive=True)
    if matches:
        print(f'Pattern {pat}: {matches[:5]}')
    else:
        print(f'Pattern {pat}: no matches')

# Also check if the path exists at all
base = '/sessions/tender-admiring-bohr/mnt/.claude'
if os.path.exists(base):
    for root, dirs, files in os.walk(base):
        for f in files:
            print(os.path.join(root, f))
else:
    print(f'Base path does not exist: {base}')
