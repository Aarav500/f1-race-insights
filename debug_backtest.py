"""Debug script to test backtest subprocess call."""
import subprocess
from pathlib import Path

fixture_dir = Path("tests/fixtures")
output_dir = Path("debug_reports")
output_dir.mkdir(exist_ok=True)

cmd = [
    "python",
    "-m",
    "scripts.backtest",
    "--data",
    str(fixture_dir / "data" / "features.parquet"),
    "--models",
    "quali_freq",
    "--output",
    str(output_dir),
    "--min-train-races",
    "2",
]

print(f"Running command: {' '.join(cmd)}")
print(f"CWD: {Path.cwd()}")
print()

result = subprocess.run(cmd, capture_output=True, text=True, cwd=Path.cwd())

print(f"Return code: {result.returncode}")
print(f"\nSTDOUT:\n{result.stdout}")
print(f"\nSTDERR:\n{result.stderr}")

if result.returncode == 0:
    print("\n✓ Script ran successfully!")
    # Check reports
    json_report = output_dir / "backtest.json"
    md_report = output_dir / "backtest.md"
    print(f"JSON report exists: {json_report.exists()}")
    print(f"MD report exists: {md_report.exists()}")
else:
    print(f"\n✗ Script failed with code {result.returncode}")
