"""Backtesting script for comparing all F1 prediction models.

Runs walk-forward backtest across all models and generates comparison reports.
"""

import argparse
import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd

from f1.evaluation.backtest import WalkForwardBacktest, aggregate_results, create_model_trainer
from f1.evaluation.metrics import summarize_metrics

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def load_features(data_path: Path) -> pd.DataFrame:
    """Load feature data for backtesting.

    Args:
        data_path: Path to features parquet file

    Returns:
        DataFrame with features
    """
    logger.info(f"Loading features from {data_path}")
    features = pd.read_parquet(data_path)

    # Ensure race_date exists (use season + round as proxy if needed)
    if "race_date" not in features.columns:
        if "season" in features.columns and "round" in features.columns:
            logger.warning("race_date not found, using season*1000 + round as proxy")
            features["race_date"] = features["season"] * 1000 + features["round"]
        else:
            raise ValueError("No race_date column and cannot create proxy")

    logger.info(f"Loaded {len(features)} samples across {features['race_id'].nunique()} races")
    return features


def run_model_backtest(
    model_name: str, features: pd.DataFrame, task: str, min_train_races: int
) -> dict:
    """Run backtest for a single model.

    Args:
        model_name: Name of model to test
        features: Feature dataset
        task: Prediction task
        min_train_races: Minimum training races

    Returns:
        Backtest results dictionary
    """
    logger.info(f"Running backtest for {model_name} ({task})...")

    try:
        trainer = create_model_trainer(model_name)
        backtester = WalkForwardBacktest(min_train_races=min_train_races)
        results = backtester.run(features, trainer, task=task)

        logger.info(f"{model_name} complete: {summarize_metrics(results['metrics'])}")
        return results

    except Exception as e:
        logger.error(f"Backtest failed for {model_name}: {e}")
        return {"n_test_samples": 0, "n_test_races": 0, "metrics": {}, "error": str(e)}


def generate_json_report(results: dict[str, dict], output_path: Path, config: dict):
    """Generate JSON report with all results.

    Args:
        results: Dict of model_name -> backtest results
        output_path: Path to save JSON report
        config: Configuration used for backtest
    """
    report = {"run_timestamp": datetime.utcnow().isoformat(), "config": config, "results": {}}

    for model_name, model_results in results.items():
        report["results"][model_name] = {
            "n_test_samples": model_results.get("n_test_samples", 0),
            "n_test_races": model_results.get("n_test_races", 0),
            "metrics": model_results.get("metrics", {}),
            "error": model_results.get("error"),
        }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    logger.info(f"JSON report saved to {output_path}")


def generate_markdown_report(results: dict[str, dict], output_path: Path, config: dict):
    """Generate Markdown report with metric comparison table.

    Args:
        results: Dict of model_name -> backtest results
        output_path: Path to save Markdown report
        config: Configuration used for backtest
    """
    lines = [
        "# F1 Model Backtest Results",
        "",
        f"**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC",
        f"**Task**: {config['task']}",
        f"**Min Train Races**: {config['min_train_races']}",
        "",
        "## Metric Comparison",
        "",
    ]

    # Create comparison table
    df = aggregate_results(results)

    if not df.empty:
        # Sort by AUC if available, otherwise by model name
        if "auc" in df.columns:
            df = df.sort_values("auc", ascending=False)
        else:
            df = df.sort_values("model")

        # Format table
        lines.append("| Model | AUC | LogLoss | Brier | ECE | Samples | Races |")
        lines.append("|-------|-----|---------|-------|-----|---------|-------|")

        for _, row in df.iterrows():
            model = row["model"]
            auc = f"{row.get('auc', 0):.4f}" if "auc" in row else "N/A"
            logloss = f"{row.get('logloss', 0):.4f}" if "logloss" in row else "N/A"
            brier = f"{row.get('brier', 0):.4f}" if "brier" in row else "N/A"
            ece = f"{row.get('ece', 0):.4f}" if "ece" in row else "N/A"
            samples = int(row.get("n_samples", 0))
            races = int(row.get("n_races", 0))

            lines.append(f"| {model} | {auc} | {logloss} | {brier} | {ece} | {samples} | {races} |")

        lines.append("")
        lines.append("## Metric Definitions")
        lines.append("")
        lines.append("- **AUC**: Area Under ROC Curve (higher is better, range [0, 1])")
        lines.append("- **LogLoss**: Binary cross-entropy (lower is better)")
        lines.append(
            "- **Brier**: Mean squared error of probabilities (lower is better, range [0, 1])"
        )
        lines.append("- **ECE**: Expected Calibration Error (lower is better, range [0, 1])")
        lines.append("- **Samples**: Number of test samples")
        lines.append("- **Races**: Number of test races")
    else:
        lines.append("_No results available_")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        f.write("\n".join(lines))

    logger.info(f"Markdown report saved to {output_path}")


def main():
    """Main backtesting pipeline."""
    parser = argparse.ArgumentParser(description="Run walk-forward backtest on F1 models")
    parser.add_argument(
        "--data",
        type=Path,
        default=Path("data/features/features.parquet"),
        help="Path to features parquet file",
    )
    parser.add_argument(
        "--models",
        type=str,
        default="all",
        help='Comma-separated model names or "all" (default: all)',
    )
    parser.add_argument(
        "--task",
        type=str,
        default="win",
        choices=["win", "podium", "finish"],
        help="Prediction task (default: win)",
    )
    parser.add_argument(
        "--min-train-races",
        type=int,
        default=10,
        help="Minimum number of training races (default: 10)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("reports"),
        help="Output directory for reports (default: reports)",
    )

    args = parser.parse_args()

    # Load features
    features = load_features(args.data)

    # Determine which models to run
    all_models = ["quali_freq", "elo", "xgb", "lgbm", "cat", "lr", "rf"]

    if args.models == "all":
        models_to_run = all_models
    else:
        models_to_run = [m.strip() for m in args.models.split(",")]
        invalid = set(models_to_run) - set(all_models)
        if invalid:
            logger.warning(f"Unknown models will be skipped: {invalid}")
            models_to_run = [m for m in models_to_run if m in all_models]

    logger.info(f"Running backtest for models: {models_to_run}")

    # Run backtests
    results = {}
    for model_name in models_to_run:
        results[model_name] = run_model_backtest(
            model_name, features, args.task, args.min_train_races
        )

    # Generate reports
    config = {
        "data_path": str(args.data),
        "task": args.task,
        "min_train_races": args.min_train_races,
        "models": models_to_run,
    }

    json_path = args.output / "backtest.json"
    md_path = args.output / "backtest.md"

    generate_json_report(results, json_path, config)
    generate_markdown_report(results, md_path, config)

    logger.info("Backtesting complete!")
    logger.info(f"Reports saved to {args.output}/")

    # Print summary
    print("\n" + "=" * 60)
    print("BACKTEST SUMMARY")
    print("=" * 60)
    df = aggregate_results(results)
    if not df.empty and "auc" in df.columns:
        df_sorted = df.sort_values("auc", ascending=False)
        print("\nTop Models by AUC:")
        for _idx, row in df_sorted.head(3).iterrows():
            print(f"  {row['model']:12s}: {row['auc']:.4f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
