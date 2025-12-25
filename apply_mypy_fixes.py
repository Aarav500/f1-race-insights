#!/usr/bin/env python3
"""Apply all mypy type error fixes to the F1 codebase."""

import re
from pathlib import Path

def fix_pairwise_py():
    """Fix f1/models/pairwise.py line 53-54."""
    file_path = Path("f1/models/pairwise.py")
    content = file_path.read_text()
    
    # Fix: Change .loc[] to direct indexing
    old = '''            race_data = race_data.loc[
                race_data["finish_position"].notna() & (race_data["finish_position"] <= 20)
            ]'''
    new = '''            mask = race_data["finish_position"].notna() & (race_data["finish_position"] <= 20)
            race_data = race_data[mask]'''
    
    content = content.replace(old, new)
    file_path.write_text(content)
    print("✓ Fixed pairwise.py")

def fix_features_py():
    """Fix f1/data/features.py rename() calls."""
    file_path = Path("f1/data/features.py")
    content = file_path.read_text()
    
    # Fix line 82-84: Add index={} parameter
    content = re.sub(
        r'features\.rename\(\s*columns=\{"Abbreviation": "driver_id", "Position": "quali_position", "TeamName": "team"\},\s*inplace=True,\s*\)',
        'features.rename(\n        index={}, columns={"Abbreviation": "driver_id", "Position": "quali_position", "TeamName": "team"}, inplace=True\n    )',
        content
    )
    
    # Fix line 129: Add index={} parameter  
    content = re.sub(
        r'features\.rename\(\s*columns=\{\s*"Abbreviation": "driver_id",\s*"Position": "finish_position",\s*"race_name": "track_name",\s*"country": "track_country",\s*\},\s*inplace=True,\s*\)',
        'features.rename(\n        index={},\n        columns={\n            "Abbreviation": "driver_id",\n            "Position": "finish_position",\n            "race_name": "track_name",\n            "country": "track_country",\n        },\n        inplace=True,\n    )',
        content
    )
    
    # Fix line 306: Add index={} parameter
    content = re.sub(
        r'team_mapping\.rename\(columns=\{"Abbreviation": "driver_id", "TeamName": "team"\}, inplace=True\)',
        'team_mapping.rename(index={}, columns={"Abbreviation": "driver_id", "TeamName": "team"}, inplace=True)',
        content
    )
    
    # Fix line 368: Add index={} parameter
    content = re.sub(
        r'race_dates\.rename\(columns=\{"EventDate": "race_date"\}, inplace=True\)',
        'race_dates.rename(index={}, columns={"EventDate": "race_date"}, inplace=True)',
        content
    )
    
    # Fix lines 171, 236: Change range() to list(range())
    content = re.sub(
        r'race_order\["race_index"\] = range\(len\(race_order\)\)',
        'race_order["race_index"] = list(range(len(race_order)))',
        content
    )
    
    file_path.write_text(content)
    print("✓ Fixed features.py")

def fix_backtest_py():
    """Fix f1/evaluation/backtest.py list[bool] -> list[float]."""
    file_path = Path("f1/evaluation/backtest.py")
    content = file_path.read_text()
    
    # Fix lines 160-168: Add result: list[float] annotation before if/elif
    old_pattern = r'''        """
        if task == "win":
            return \(test_data\["finish_position"\] == 1\)\.astype\(float\)\.tolist\(\)
        elif task == "podium":
            return \(test_data\["finish_position"\] <= 3\)\.astype\(float\)\.tolist\(\)
        elif task == "finish":
            return test_data\["finish_position"\]\.astype\(float\)\.tolist\(\)'''
    
    new_text = '''        """
        result: list[float]
        if task == "win":
            result = (test_data["finish_position"] == 1).astype(float).tolist()
            return result
        elif task == "podium":
            result = (test_data["finish_position"] <= 3).astype(float).tolist()
            return result
        elif task == "finish":
            result = test_data["finish_position"].astype(float).tolist()
            return result'''
    
    content = re.sub(old_pattern, new_text, content)
    file_path.write_text(content)
    print("✓ Fixed backtest.py")

def fix_registry_py():
    """Fix f1/models/registry.py type annotations."""
    file_path = Path("f1/models/registry.py")
    content = file_path.read_text()
    
    # Fix line 209: Add type annotation
    content = content.replace(
        '        predictions = _predict_baseline(model_info["model"], race_df)',
        '        predictions: pd.DataFrame = _predict_baseline(model_info["model"], race_df)'
    )
    
    file_path.write_text(content)
    print("✓ Fixed registry.py")

def fix_explain_py():
    """Fix f1/analysis/explain.py type annotations."""
    file_path = Path("f1/analysis/explain.py")
    content = file_path.read_text()
    
    # Fix lines 48-49: Add type annotations
    content = content.replace(
        '    race_df = race_data[race_data["race_id"] == race_id].copy()\n    driver_df = race_df[race_df["driver_id"] == driver_id].copy()',
        '    race_df: pd.DataFrame = race_data[race_data["race_id"] == race_id].copy()\n    driver_df: pd.DataFrame = race_df[race_df["driver_id"] == driver_id].copy()'
    )
    
    file_path.write_text(content)
    print("✓ Fixed explain.py")

def fix_counterfactuals_py():
    """Fix f1/analysis/counterfactuals.py type annotations."""
    file_path = Path("f1/analysis/counterfactuals.py")
    content = file_path.read_text()
    
    # Fix lines 118, 132: Add type annotations
    content = content.replace(
        '    race_df = race_data[race_data["race_id"] == race_id].copy()',
        '    race_df: pd.DataFrame = race_data[race_data["race_id"] == race_id].copy()'
    )
    content = content.replace(
        '    modified_df = apply_deltas(race_df, driver_id, changes)',
        '    modified_df: pd.DataFrame = apply_deltas(race_df, driver_id, changes)'
    )
    
    file_path.write_text(content)
    print("✓ Fixed counterfactuals.py")

if __name__ == "__main__":
    print("Applying all mypy type error fixes...")
    fix_pairwise_py()
    fix_features_py()
    fix_backtest_py()
    fix_registry_py()
    fix_explain_py()
    fix_counterfactuals_py()
    print("\n✅ All fixes applied!")
    print("\nRun: git add . && git commit -m 'Fix all mypy type errors' && git push")
