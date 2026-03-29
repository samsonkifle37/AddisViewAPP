import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

path = r'/sessions/tender-admiring-bohr/mnt/.claude/projects/-sessions-tender-admiring-bohr/75d5ffa0-8bae-495f-b971-b1ee6220ef30.jsonl'
try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    print(f'Total lines: {len(lines)}')
    for line in lines[:3]:
        obj = json.loads(line)
        print(list(obj.keys()))
except FileNotFoundError:
    # Try alternate path
    import glob
    matches = glob.glob('/sessions/tender-admiring-bohr/mnt/.claude/projects/**/*.jsonl', recursive=True)
    print('Found files:', matches)
