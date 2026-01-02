# F1 Model Backtest Results

**Generated**: 2026-01-02 11:03:38 UTC
**Task**: win
**Min Train Races**: 10

## Metric Comparison

| Model | AUC | LogLoss | Brier | ECE | Samples | Races |
|-------|-----|---------|-------|-----|---------|-------|
| lr | 0.9874 | 0.0601 | 0.0189 | 0.0085 | 1940 | 97 |
| rf | 0.9849 | 0.0682 | 0.0210 | 0.0100 | 1940 | 97 |
| cat | 0.9848 | 0.0697 | 0.0207 | 0.0116 | 1940 | 97 |
| xgb | 0.9829 | 0.0806 | 0.0243 | 0.0162 | 1940 | 97 |
| quali_freq | 0.9806 | 0.0749 | 0.0181 | 0.0064 | 1940 | 97 |
| lgbm | 0.9750 | 0.1030 | 0.0278 | 0.0216 | 1940 | 97 |
| elo | 0.4402 | 0.2024 | 0.0479 | 0.0000 | 1940 | 97 |

## Metric Definitions

- **AUC**: Area Under ROC Curve (higher is better, range [0, 1])
- **LogLoss**: Binary cross-entropy (lower is better)
- **Brier**: Mean squared error of probabilities (lower is better, range [0, 1])
- **ECE**: Expected Calibration Error (lower is better, range [0, 1])
- **Samples**: Number of test samples
- **Races**: Number of test races