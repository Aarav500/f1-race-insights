# F1 Model Backtest Results

**Generated**: 2026-01-02 10:31:44 UTC
**Task**: win
**Min Train Races**: 2

## Metric Comparison

| Model | AUC | LogLoss | Brier | ECE | Samples | Races |
|-------|-----|---------|-------|-----|---------|-------|
| lr | 0.9474 | 0.3732 | 0.0752 | 0.0880 | 24 | 3 |
| rf | 0.9421 | 0.3012 | 0.0942 | 0.1062 | 24 | 3 |
| xgb | 0.7737 | 0.4047 | 0.1150 | 0.1144 | 24 | 3 |
| lgbm | 0.5421 | 0.5294 | 0.1696 | 0.0729 | 24 | 3 |

## Metric Definitions

- **AUC**: Area Under ROC Curve (higher is better, range [0, 1])
- **LogLoss**: Binary cross-entropy (lower is better)
- **Brier**: Mean squared error of probabilities (lower is better, range [0, 1])
- **ECE**: Expected Calibration Error (lower is better, range [0, 1])
- **Samples**: Number of test samples
- **Races**: Number of test races