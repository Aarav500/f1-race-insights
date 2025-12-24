# F1 Model Backtest Results

**Generated**: 2025-12-24 17:07:24 UTC
**Task**: win
**Min Train Races**: 2

## Metric Comparison

| Model | AUC | LogLoss | Brier | ECE | Samples | Races |
|-------|-----|---------|-------|-----|---------|-------|
| quali_freq | 0.7895 | 2.8902 | 0.0859 | 0.0938 | 24 | 3 |

## Metric Definitions

- **AUC**: Area Under ROC Curve (higher is better, range [0, 1])
- **LogLoss**: Binary cross-entropy (lower is better)
- **Brier**: Mean squared error of probabilities (lower is better, range [0, 1])
- **ECE**: Expected Calibration Error (lower is better, range [0, 1])
- **Samples**: Number of test samples
- **Races**: Number of test races