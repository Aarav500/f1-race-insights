import subprocess
import sys

result = subprocess.run(
    [sys.executable, "-m", "mypy", "f1/evaluation/backtest.py", "--ignore-missing-imports"],
    capture_output=True,
    text=True
)

with open("mypy_output.txt", "w", encoding="utf-8") as f:
    f.write(result.stdout)
    f.write(result.stderr)
    f.write(f"\n\nExit Code: {result.returncode}\n")

print(result.stdout)
print(result.stderr)
print(f"Exit Code: {result.returncode}")
