"""Enhanced feature engineering for F1 race predictions.

This module extends the base features with:
- Extended data collection (2016-2025)
- 20+ new features for improved predictions
- Better NaN handling for new drivers
- Track-specific and interaction features
"""

import logging

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ============ TRACK METADATA ============
TRACK_METADATA = {
    # Street circuits
    'Monaco': {'type': 'street', 'power': 0.3, 'downforce': 'high', 'sc_prob': 0.60, 'overtaking': 0.15},
    'Singapore': {'type': 'street', 'power': 0.4, 'downforce': 'high', 'sc_prob': 0.65, 'overtaking': 0.25},
    'Baku': {'type': 'street', 'power': 0.7, 'downforce': 'medium', 'sc_prob': 0.50, 'overtaking': 0.45},
    'Jeddah': {'type': 'street', 'power': 0.6, 'downforce': 'low', 'sc_prob': 0.55, 'overtaking': 0.35},
    'Las Vegas': {'type': 'street', 'power': 0.6, 'downforce': 'low', 'sc_prob': 0.35, 'overtaking': 0.40},
    'Miami': {'type': 'street', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.40, 'overtaking': 0.35},
    'Melbourne': {'type': 'street', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.45, 'overtaking': 0.30},

    # Power circuits
    'Monza': {'type': 'permanent', 'power': 0.9, 'downforce': 'low', 'sc_prob': 0.30, 'overtaking': 0.55},
    'Spa': {'type': 'permanent', 'power': 0.7, 'downforce': 'medium', 'sc_prob': 0.45, 'overtaking': 0.50},

    # High downforce circuits
    'Budapest': {'type': 'permanent', 'power': 0.3, 'downforce': 'high', 'sc_prob': 0.25, 'overtaking': 0.20},
    'Barcelona': {'type': 'permanent', 'power': 0.5, 'downforce': 'high', 'sc_prob': 0.25, 'overtaking': 0.30},
    'Suzuka': {'type': 'permanent', 'power': 0.5, 'downforce': 'high', 'sc_prob': 0.40, 'overtaking': 0.25},

    # Balanced circuits
    'Silverstone': {'type': 'permanent', 'power': 0.6, 'downforce': 'medium', 'sc_prob': 0.40, 'overtaking': 0.40},
    'Bahrain': {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.35, 'overtaking': 0.45},
    'Abu Dhabi': {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.30, 'overtaking': 0.40},
    'COTA': {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.35, 'overtaking': 0.40},
    'Mexico City': {'type': 'permanent', 'power': 0.4, 'downforce': 'low', 'sc_prob': 0.40, 'overtaking': 0.45},
    'Interlagos': {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.55, 'overtaking': 0.50},
    'Spielberg': {'type': 'permanent', 'power': 0.6, 'downforce': 'medium', 'sc_prob': 0.35, 'overtaking': 0.45},
    'Zandvoort': {'type': 'permanent', 'power': 0.4, 'downforce': 'high', 'sc_prob': 0.30, 'overtaking': 0.20},
    'Imola': {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.35, 'overtaking': 0.25},
    'Shanghai': {'type': 'permanent', 'power': 0.6, 'downforce': 'medium', 'sc_prob': 0.30, 'overtaking': 0.40},
    'Lusail': {'type': 'permanent', 'power': 0.5, 'downforce': 'high', 'sc_prob': 0.20, 'overtaking': 0.35},
    'Montreal': {'type': 'street', 'power': 0.6, 'downforce': 'low', 'sc_prob': 0.55, 'overtaking': 0.45},
}

# ============ DRIVER WET WEATHER SKILLS (historical data) ============
DRIVER_WET_SKILLS = {
    'HAM': 0.95, 'VER': 0.92, 'ALO': 0.88, 'VET': 0.85, 'RIC': 0.82,
    'NOR': 0.80, 'LEC': 0.78, 'RUS': 0.80, 'SAI': 0.75, 'PER': 0.75,
    'PIA': 0.75, 'STR': 0.70, 'GAS': 0.72, 'OCO': 0.70, 'HUL': 0.72,
    'TSU': 0.68, 'ALB': 0.72, 'BOT': 0.75, 'ZHO': 0.65, 'MAG': 0.70,
}

# ============ DRIVER BIRTH YEARS (for age calculation) ============
DRIVER_BIRTH_YEARS = {
    'HAM': 1985, 'VER': 1997, 'ALO': 1981, 'LEC': 1997, 'SAI': 1994,
    'NOR': 1999, 'RUS': 1998, 'PER': 1990, 'STR': 1998, 'PIA': 2001,
    'GAS': 1996, 'OCO': 1996, 'ALB': 1996, 'TSU': 2000, 'HUL': 1987,
    'MAG': 1992, 'BOT': 1989, 'ZHO': 1999, 'RIC': 1989, 'VET': 1987,
    'RAI': 1979, 'GIO': 1993, 'LAT': 1995, 'MSC': 1999, 'MAZ': 1999,
}

# ============ TEAM BUDGET TIERS ============
TEAM_BUDGET_TIERS = {
    'Red Bull Racing': 'top', 'Mercedes': 'top', 'Ferrari': 'top',
    'McLaren': 'top', 'Aston Martin': 'mid', 'Alpine': 'mid',
    'Williams': 'mid', 'Haas F1 Team': 'back', 'Sauber': 'back',
    'RB': 'back', 'AlphaTauri': 'back', 'Alfa Romeo': 'back',
}


def compute_grid_penalty_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate grid penalty based on starting position vs qualifying position.

    Args:
        df: DataFrame with quali_position and grid_position columns

    Returns:
        DataFrame with grid penalty features
    """
    result = df.copy()

    # Grid penalty = starting position - qualifying position (positive = penalty applied)
    if 'grid_position' in result.columns:
        result['grid_penalty'] = result['grid_position'] - result['quali_position']
        result['has_grid_penalty'] = (result['grid_penalty'] > 0).astype(int)
    else:
        # Assume no penalty if grid position unknown
        result['grid_penalty'] = 0
        result['has_grid_penalty'] = 0

    return result


def compute_championship_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate championship-related features.

    Args:
        df: DataFrame sorted by season and round

    Returns:
        DataFrame with championship standing features
    """
    result = df.copy()

    # Sort to ensure temporal ordering
    result = result.sort_values(['season', 'round'])

    # Calculate cumulative points within each season for each driver
    result['cumulative_points'] = result.groupby(['season', 'driver_id'])['points_earned'].cumsum().shift(1)
    result['cumulative_points'] = result['cumulative_points'].fillna(0)

    # Calculate championship position based on cumulative points
    result['wdc_position'] = result.groupby(['season', 'round'])['cumulative_points'].rank(ascending=False, method='min')

    # Points gap to leader
    season_round_max = result.groupby(['season', 'round'])['cumulative_points'].transform('max')
    result['points_gap_to_leader'] = season_round_max - result['cumulative_points']

    return result


def compute_teammate_features(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Calculate head-to-head teammate comparison features.

    Args:
        df: DataFrame with driver and team info
        window: Rolling window size

    Returns:
        DataFrame with teammate comparison features
    """
    result = df.copy()
    result = result.sort_values(['season', 'round'])

    teammate_features = []

    for (_team, _season), team_data in df.groupby(['team', 'season']):
        drivers = team_data['driver_id'].unique()

        if len(drivers) < 2:
            continue

        for driver in drivers:
            driver_races = team_data[team_data['driver_id'] == driver].sort_values('round')
            other_driver = [d for d in drivers if d != driver]

            if not other_driver:
                continue

            other_driver = other_driver[0]
            teammate_races = team_data[team_data['driver_id'] == other_driver].sort_values('round')

            for _idx, row in driver_races.iterrows():
                current_round = row['round']

                # Get prior races for both drivers
                prior_driver = driver_races[driver_races['round'] < current_round].tail(window)
                prior_teammate = teammate_races[teammate_races['round'] < current_round]

                if len(prior_driver) > 0 and len(prior_teammate) > 0:
                    # Merge on round to compare head-to-head
                    merged = prior_driver.merge(prior_teammate, on='round', suffixes=('_driver', '_teammate'))

                    if len(merged) > 0:
                        # Win rate against teammate
                        wins = (merged['finish_position_driver'] < merged['finish_position_teammate']).mean()
                        teammate_features.append({
                            'race_id': row['race_id'],
                            'driver_id': driver,
                            'teammate_win_rate': wins,
                            'teammate_h2h_count': len(merged),
                        })

    if teammate_features:
        teammate_df = pd.DataFrame(teammate_features)
        result = result.merge(teammate_df, on=['race_id', 'driver_id'], how='left')
    else:
        result['teammate_win_rate'] = np.nan
        result['teammate_h2h_count'] = 0

    return result


def compute_experience_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate driver experience features.

    Args:
        df: DataFrame sorted by season and round

    Returns:
        DataFrame with experience features
    """
    result = df.copy()
    result = result.sort_values(['season', 'round'])

    # Career races count (cumulative)
    result['career_races'] = result.groupby('driver_id').cumcount()

    # Driver age at race (approximate)
    result['driver_age'] = result.apply(
        lambda row: row['season'] - DRIVER_BIRTH_YEARS.get(row['driver_id'], row['season'] - 25),
        axis=1
    )

    # Is rookie (< 20 career races)
    result['is_rookie'] = (result['career_races'] < 20).astype(int)

    return result


def compute_development_trajectory(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """Calculate team development trajectory (improving/declining).

    Args:
        df: DataFrame with team performance
        window: Window size

    Returns:
        DataFrame with trajectory features
    """
    result = df.copy()
    result = result.sort_values(['season', 'round'])

    # Team points per race (rolling)
    team_points = result.groupby(['team']).apply(
        lambda x: x['points_earned'].rolling(window, min_periods=1).mean()
    ).reset_index(level=0, drop=True)

    result['team_rolling_points'] = team_points

    # Calculate trajectory (change in rolling points)
    result['team_trajectory'] = result.groupby('team')['team_rolling_points'].diff()

    return result


def compute_track_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add track-specific metadata features.

    Args:
        df: DataFrame with track/country info

    Returns:
        DataFrame with track features
    """
    result = df.copy()

    # Map track metadata
    def get_track_feature(row, feature):
        country = row.get('country', '')
        track_name = row.get('track_name', row.get('race_name', ''))

        # Try to match by country or track name
        for track_key, metadata in TRACK_METADATA.items():
            if track_key.lower() in str(country).lower() or track_key.lower() in str(track_name).lower():
                return metadata.get(feature, np.nan)

        # Default values
        defaults = {'type': 'permanent', 'power': 0.5, 'downforce': 'medium', 'sc_prob': 0.35, 'overtaking': 0.35}
        return defaults.get(feature, np.nan)

    result['is_street_circuit'] = result.apply(lambda r: 1 if get_track_feature(r, 'type') == 'street' else 0, axis=1)
    result['track_power_sensitivity'] = result.apply(lambda r: get_track_feature(r, 'power'), axis=1)
    result['track_sc_probability'] = result.apply(lambda r: get_track_feature(r, 'sc_prob'), axis=1)
    result['track_overtaking_difficulty'] = result.apply(lambda r: 1 - get_track_feature(r, 'overtaking'), axis=1)

    # Encode downforce level
    downforce_map = {'low': 0, 'medium': 0.5, 'high': 1}
    result['track_downforce_level'] = result.apply(
        lambda r: downforce_map.get(get_track_feature(r, 'downforce'), 0.5), axis=1
    )

    return result


def compute_team_tier_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add team budget tier features.

    Args:
        df: DataFrame with team info

    Returns:
        DataFrame with team tier features
    """
    result = df.copy()

    tier_map = {'top': 3, 'mid': 2, 'back': 1}

    def get_team_tier(team):
        for team_name, tier in TEAM_BUDGET_TIERS.items():
            if team_name.lower() in str(team).lower():
                return tier_map.get(tier, 2)
        return 2  # Default to mid tier

    result['team_budget_tier'] = result['team'].apply(get_team_tier)

    return result


def compute_wet_skill_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add driver wet weather skill features.

    Args:
        df: DataFrame with driver info

    Returns:
        DataFrame with wet skill features
    """
    result = df.copy()

    result['driver_wet_skill'] = result['driver_id'].map(DRIVER_WET_SKILLS).fillna(0.70)

    return result


def compute_interaction_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate interaction features (combinations of other features).

    Args:
        df: DataFrame with base features

    Returns:
        DataFrame with interaction features
    """
    result = df.copy()

    # Quali position × track history
    if 'quali_position' in result.columns and 'driver_track_avg_finish' in result.columns:
        result['quali_track_interaction'] = result['quali_position'] * result['driver_track_avg_finish'].fillna(10)

    # Team form × driver form
    if 'constructor_rolling_avg_finish' in result.columns and 'driver_rolling_avg_finish' in result.columns:
        result['team_driver_form_interaction'] = (
            result['constructor_rolling_avg_finish'].fillna(10) *
            result['driver_rolling_avg_finish'].fillna(10)
        )

    # Wet skill × track SC probability (proxy for weather chaotic races)
    if 'driver_wet_skill' in result.columns and 'track_sc_probability' in result.columns:
        result['wet_chaos_interaction'] = result['driver_wet_skill'] * result['track_sc_probability']

    return result


def impute_missing_values(df: pd.DataFrame, strategy: str = 'median') -> pd.DataFrame:
    """Handle missing values with intelligent imputation.

    Args:
        df: DataFrame with potential NaN values
        strategy: 'median', 'mean', or 'conservative'

    Returns:
        DataFrame with imputed values
    """
    result = df.copy()

    # Define imputation strategies for different feature types
    imputation_rules = {
        # Rolling features - use conservative estimates for new drivers
        'driver_rolling_avg_finish': 12.0,  # Mid-pack assumption
        'driver_rolling_avg_points': 2.0,   # Few points for new driver
        'driver_rolling_dnf_rate': 0.15,    # Moderate DNF risk
        'constructor_rolling_avg_finish': 10.0,
        'constructor_rolling_avg_points': 5.0,
        'constructor_rolling_dnf_rate': 0.12,

        # Track history - assume no advantage
        'driver_track_avg_finish': 10.0,
        'driver_track_best_finish': 10.0,
        'driver_track_win_rate': 0.0,
        'driver_track_podium_rate': 0.0,
        'driver_track_dnf_rate': 0.10,
        'driver_track_visits': 0,

        # Championship features
        'wdc_position': 15.0,
        'points_gap_to_leader': 100.0,
        'cumulative_points': 0.0,

        # Teammate features
        'teammate_win_rate': 0.5,  # Neutral assumption

        # Experience features are calculated, should not have NaN

        # Delta features
        'quali_delta_to_pole': 2.0,  # ~2 seconds off pole as default
        'quali_delta_to_teammate': 0.3,  # Slightly behind teammate
    }

    for col, default_value in imputation_rules.items():
        if col in result.columns:
            result[col] = result[col].fillna(default_value)

    # For any remaining numeric columns, use median
    numeric_cols = result.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if result[col].isna().any():
            if strategy == 'median':
                result[col] = result[col].fillna(result[col].median())
            elif strategy == 'mean':
                result[col] = result[col].fillna(result[col].mean())
            else:
                result[col] = result[col].fillna(0)

    return result


def build_enhanced_feature_table(
    race_results: pd.DataFrame,
    qual_results: pd.DataFrame,
    rolling_window: int = 5,
    impute_strategy: str = 'median'
) -> pd.DataFrame:
    """Build enhanced feature table with all new features.

    This is the main entry point for feature engineering.

    Args:
        race_results: Raw race results
        qual_results: Raw qualifying results
        rolling_window: Window size for rolling features
        impute_strategy: Strategy for handling NaN values

    Returns:
        Complete feature DataFrame
    """
    # Import base feature building function
    from f1.data.features import build_feature_table

    logger.info("Building base feature table...")
    features = build_feature_table(race_results, qual_results, rolling_window)

    # Need to merge back race outcome data for new feature calculations
    race_df = race_results.copy()
    race_df['race_id'] = race_df['year'].astype(str) + '_' + race_df['round'].astype(str).str.zfill(2)
    race_df.rename(columns={'Abbreviation': 'driver_id', 'Points': 'points_earned'}, inplace=True)

    # Merge points earned for championship calculations
    if 'points_earned' not in features.columns:
        points_data = race_df[['race_id', 'driver_id', 'points_earned']].drop_duplicates()
        features = features.merge(points_data, on=['race_id', 'driver_id'], how='left')
        features['points_earned'] = features['points_earned'].fillna(0)

    logger.info("Adding championship features...")
    features = compute_championship_features(features)

    logger.info("Adding experience features...")
    features = compute_experience_features(features)

    logger.info("Adding track metadata features...")
    features = compute_track_features(features)

    logger.info("Adding team tier features...")
    features = compute_team_tier_features(features)

    logger.info("Adding wet skill features...")
    features = compute_wet_skill_features(features)

    logger.info("Adding grid penalty features...")
    features = compute_grid_penalty_features(features)

    logger.info("Adding team development trajectory...")
    features = compute_development_trajectory(features, rolling_window)

    logger.info("Adding interaction features...")
    features = compute_interaction_features(features)

    logger.info("Imputing missing values...")
    features = impute_missing_values(features, impute_strategy)

    # Log feature summary
    logger.info(f"Enhanced feature table: {len(features)} rows, {len(features.columns)} columns")
    logger.info(f"Features: {list(features.columns)}")

    return features


# ============ HYPERPARAMETER OPTIMIZATION ============

def get_optimized_hyperparameters(model_name: str, task: str) -> dict:
    """Get optimized hyperparameters for each model.

    These are tuned to balance underfitting vs overfitting.

    Args:
        model_name: One of 'xgb', 'lgbm', 'cat', 'lr', 'rf'
        task: One of 'win', 'podium', 'expected_finish'

    Returns:
        Dictionary of hyperparameters
    """

    # Optimized based on typical F1 dataset size (3000-5000 samples)
    hyperparams = {
        'xgb': {
            'win': {
                'n_estimators': 300,
                'max_depth': 5,  # Increased from 4 for more complex patterns
                'learning_rate': 0.03,  # Lower for more trees
                'min_child_weight': 3,
                'subsample': 0.85,
                'colsample_bytree': 0.85,
                'reg_alpha': 0.05,
                'reg_lambda': 0.5,
                'scale_pos_weight': 19,
                'eval_metric': 'logloss',
            },
            'podium': {
                'n_estimators': 300,
                'max_depth': 6,  # Podium is less imbalanced
                'learning_rate': 0.03,
                'min_child_weight': 2,
                'subsample': 0.85,
                'colsample_bytree': 0.85,
                'reg_alpha': 0.05,
                'reg_lambda': 0.5,
                'scale_pos_weight': 6,  # ~3 podiums per 20 drivers
                'eval_metric': 'logloss',
            },
            'expected_finish': {
                'n_estimators': 300,
                'max_depth': 6,
                'learning_rate': 0.03,
                'min_child_weight': 2,
                'subsample': 0.85,
                'colsample_bytree': 0.85,
                'reg_alpha': 0.1,
                'reg_lambda': 1.0,
            },
        },
        'lgbm': {
            'win': {
                'n_estimators': 350,
                'max_depth': 5,
                'num_leaves': 20,  # 2^5 - margin
                'learning_rate': 0.025,
                'min_data_in_leaf': 15,
                'feature_fraction': 0.85,
                'bagging_fraction': 0.85,
                'bagging_freq': 2,
                'reg_alpha': 0.05,
                'reg_lambda': 0.5,
                'class_weight': 'balanced',
            },
            'podium': {
                'n_estimators': 350,
                'max_depth': 6,
                'num_leaves': 30,
                'learning_rate': 0.025,
                'min_data_in_leaf': 10,
                'feature_fraction': 0.85,
                'bagging_fraction': 0.85,
                'bagging_freq': 2,
                'reg_alpha': 0.05,
                'reg_lambda': 0.5,
                'class_weight': 'balanced',
            },
            'expected_finish': {
                'n_estimators': 350,
                'max_depth': 6,
                'num_leaves': 30,
                'learning_rate': 0.025,
                'min_data_in_leaf': 10,
                'feature_fraction': 0.85,
                'bagging_fraction': 0.85,
                'bagging_freq': 2,
                'reg_alpha': 0.1,
                'reg_lambda': 1.0,
            },
        },
        'cat': {
            'win': {
                'iterations': 400,
                'depth': 5,
                'learning_rate': 0.025,
                'l2_leaf_reg': 2.0,
                'border_count': 64,
                'auto_class_weights': 'Balanced',
            },
            'podium': {
                'iterations': 400,
                'depth': 6,
                'learning_rate': 0.025,
                'l2_leaf_reg': 2.0,
                'border_count': 64,
                'auto_class_weights': 'Balanced',
            },
            'expected_finish': {
                'iterations': 400,
                'depth': 6,
                'learning_rate': 0.025,
                'l2_leaf_reg': 3.0,
                'border_count': 64,
            },
        },
        'rf': {
            'win': {
                'n_estimators': 300,
                'max_depth': 12,  # RF can handle deeper trees
                'min_samples_split': 8,
                'min_samples_leaf': 4,
                'max_features': 'sqrt',
                'class_weight': 'balanced',
            },
            'podium': {
                'n_estimators': 300,
                'max_depth': 14,
                'min_samples_split': 6,
                'min_samples_leaf': 3,
                'max_features': 'sqrt',
                'class_weight': 'balanced',
            },
            'expected_finish': {
                'n_estimators': 300,
                'max_depth': 14,
                'min_samples_split': 6,
                'min_samples_leaf': 3,
                'max_features': 0.7,
            },
        },
        'lr': {
            'win': {
                'C': 0.3,  # Stronger regularization
                'max_iter': 2000,
                'class_weight': 'balanced',
                'solver': 'lbfgs',
            },
            'podium': {
                'C': 0.5,
                'max_iter': 2000,
                'class_weight': 'balanced',
                'solver': 'lbfgs',
            },
            'expected_finish': {
                'alpha': 1.5,  # For Ridge regression
            },
        },
    }

    return hyperparams.get(model_name, {}).get(task, {})


# ============ DATA EXTENSION ============

def get_extended_years() -> list:
    """Get list of years to collect data for (extended from 2016).

    Returns:
        List of years from 2016 to current
    """
    return list(range(2016, 2026))  # 2016-2025 = 10 years of data
