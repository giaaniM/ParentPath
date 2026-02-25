import os
import re

replacements = {
    # Backgrounds
    r'var\(--page-bg\)': 'var(--bg-main)',
    r'var\(--white\)': 'var(--bg-surface)',
    r'var\(--ivory\)': 'var(--bg-surface)',
    r'var\(--border\)': 'var(--color-border)',

    # Text colors
    r'var\(--ink\)': 'var(--color-text-primary)',
    r'var\(--ink2\)': 'var(--color-text-primary)',
    r'var\(--stone\)': 'var(--color-text-secondary)',
    r'var\(--stone2\)': 'var(--color-text-tertiary)',

    # Primary (formerly blush/peach tones)
    r'var\(--blush\)': 'var(--color-primary)',
    r'var\(--blush2\)': 'var(--color-primary-light)',
    r'var\(--blush3\)': 'var(--color-primary-subtle)',

    # Secondary (formerly midnight tones)
    r'var\(--midnight\)': 'var(--color-secondary)',
    r'var\(--night\)': 'var(--color-secondary-light)',
    r'var\(--slate\)': 'var(--color-text-brand)',

    # Tertiary (formerly aqua)
    r'var\(--aqua\)': 'var(--color-tertiary)',
    r'var\(--aqua2\)': 'var(--color-tertiary-light)',
    r'var\(--aqua3\)': 'var(--color-tertiary-light)',

    # Accents
    r'var\(--sage\)': 'var(--color-success)',
    r'var\(--sage2\)': 'var(--color-success-base)',
    r'var\(--sage3\)/': 'var(--color-success-base)',
    r'var\(--gold\)': 'var(--color-accent-partner)',
    r'var\(--gold2\)': 'var(--color-accent-partner-light)',

    # Leftover compatibility aliases
    r'var\(--color-bg\)': 'var(--bg-main)',
    r'var\(--color-bg-elevated\)': 'var(--bg-surface)',
    r'var\(--color-bg-subtle\)': 'var(--bg-subtle)',
    
    # Base hex colors that might have been hardcoded instead of variables
    r'#FFB8A1': 'var(--color-primary)',
    r'#FFD4C2': 'var(--color-primary-light)',
    r'#FFF0E5': 'var(--color-primary-subtle)',
    r'#0D1B2A': 'var(--color-secondary)',
    r'#182738': 'var(--color-secondary-light)',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk('src'):
    print(f"Checking directory: {root}")
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            if file == 'design-tokens.css': continue
            try:
                process_file(os.path.join(root, file))
            except Exception as e:
                print(f"Error processing {file}: {e}")

print("Replacement complete.")
