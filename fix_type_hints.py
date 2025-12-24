"""Fix Python 3.9 type hint compatibility by replacing pipe union operators with Optional/Union."""

import re
from pathlib import Path

def fix_type_hints_in_file(filepath):
    """Fix type hints in a single file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Check if file already imports Optional/Union
    has_optional = 'from typing import' in content and 'Optional' in content
    has_union = 'from typing import' in content and 'Union' in content
    
    needs_optional = False
    needs_union = False
    
    # Pattern 1: Type | None -> Optional[Type]
    # Match patterns like: pd.DataFrame | None, str | None, etc.
    pattern1 = r'(\w+(?:\.\w+)?(?:\[[\w\[\], ]+\])?)\s*\|\s*None'
    matches = re.findall(pattern1, content)
    if matches:
        needs_optional = True
        content = re.sub(pattern1, r'Optional[\1]', content)
    
    # Pattern 2: dict[str, int | float | str] -> Union types
    # Match complex union types like: int | float | str
    pattern2 = r'(\w+)\s*\|\s*(\w+)\s*\|\s*(\w+)'
    matches2 = re.findall(pattern2, content)
    if matches2:
        needs_union = True
        for match in set(matches2):
            old = f'{match[0]} | {match[1]} | {match[2]}'
            new = f'Union[{match[0]}, {match[1]}, {match[2]}]'
            content = content.replace(old, new)
    
    # Pattern 3: Two-type unions like int |float
    pattern3 = r'(\w+)\s*\|\s*(\w+)(?!\])'  # Not followed by ]
    matches3 = re.findall(pattern3, content)
    if matches3:
        needs_union = True
        for match in set(matches3):
            old = f'{match[0]} | {match[1]}'
            new = f'Union[{match[0]}, {match[1]}]'
            content = content.replace(old, new)
    
    # Add imports if needed
    if (needs_optional or needs_union) and not (has_optional and has_union):
        # Find the typing import line
        typing_import_pattern = r'from typing import ([^\n]+)'
        typing_match = re.search(typing_import_pattern, content)
        
        if typing_match:
            # Existing typing import - add to it
            existing_imports = typing_match.group(1).strip()
            new_imports = []
            if needs_optional and 'Optional' not in existing_imports:
                new_imports.append('Optional')
            if needs_union and 'Union' not in existing_imports:
                new_imports.append('Union')
            
            if new_imports:
                updated_import = f"from typing import {existing_imports}, {', '.join(new_imports)}"
                content = content.replace(typing_match.group(0), updated_import)
        else:
            # No typing import - add one
            new_imports = []
            if needs_optional:
                new_imports.append('Optional')
            if needs_union:
                new_imports.append('Union')
            
            if new_imports:
                # Find first import statement
                import_match = re.search(r'^import ', content, re.MULTILINE)
                if import_match:
                    import_line = f"from typing import {', '.join(new_imports)}\n"
                    pos = import_match.start()
                    content = content[:pos] + import_line + content[pos:]
    
    # Only write if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Fix all Python files in f1/ directory."""
    f1_dir = Path('f1')
    python_files = list(f1_dir.rglob('*.py'))
    
    fixed_count = 0
    for filepath in python_files:
        if fix_type_hints_in_file(filepath):
            print(f"Fixed: {filepath}")
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
