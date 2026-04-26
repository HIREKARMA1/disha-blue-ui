
import re

file_path = "/Users/mahaprasadbehera/Documents/HIrekarma/disha-blue-ui/app/page.tsx"
with open(file_path, 'r') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    # Opening tag that is NOT self-closing
    opens = len(re.findall(r'<div\b(?![^>]*/>)', line))
    closes = len(re.findall(r'</div>', line))
    balance += opens - closes
    print(f"{i+1:3}: {balance:2} | {line.strip()}")

print(f"Final balance: {balance}")
