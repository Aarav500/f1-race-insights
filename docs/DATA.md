# F1 Data Documentation

## Overview
F1 race data is sourced from the FastF1 API and persisted locally as Parquet files for efficient storage and querying.

## Data Sources
- **FastF1 API**: Official F1 timing data via the FastF1 Python library
- **Seasons**: 2020-2025
- **Data Types**: Race schedules, race results, qualifying results

## Storage Structure

```
data/
├── cache/              # FastF1 cache (gitignored)
│   └── *.pkl          # Cached API responses
└── raw/               # Raw data files (gitignored)
    ├── schedule_YYYY.parquet
    ├── race_results_YYYY_rNN.parquet
    └── qualifying_results_YYYY_rNN.parquet
```

### File Naming Conventions
- `schedule_YYYY.parquet`: Full season schedule for year YYYY
- `race_results_YYYY_rNN.parquet`: Race results for year YYYY, round NN
- `qualifying_results_YYYY_rNN.parquet`: Qualifying results for year YYYY, round NN

## Data Fields

### Schedule Data (`schedule_YYYY.parquet`)
Key fields from FastF1 event schedule:
- `RoundNumber`: Race round number (1-based)
- `Country`: Country name
- `Location`: City/location
- `EventName`: Official event name
- `EventDate`: Race date
- `EventFormat`: Event format (conventional, sprint, etc.)
- `Session1-5`: Session names and times
- `F1ApiSupport`: Whether FastF1 API supports this event

### Race Results (`race_results_YYYY_rNN.parquet`)
Driver-level race results:
- `DriverNumber`: Driver's race number
- `BroadcastName`: Driver's broadcast name
- `Abbreviation`: 3-letter driver code (e.g., VER, HAM)
- `TeamName`: Constructor name
- `TeamColor`: Team color hex code
- `Position`: Finishing position (1-20)
- `ClassifiedPosition`: Official classified position
- `GridPosition`: Starting grid position
- `Q1`/`Q2`/`Q3`: Qualifying lap times
- `Time`: Race time/gap to winner
- `Status`: Finish status (Finished, +N Laps, DNF reason)
- `Points`: Championship points earned
- **Metadata** (added by loader):
  - `year`: Season year
  - `round`: Round number
  - `race_name`: Race name
  - `country`: Country

### Qualifying Results (`qualifying_results_YYYY_rNN.parquet`)
Driver-level qualifying results:
- `DriverNumber`: Driver's race number
- `BroadcastName`: Driver's broadcast name
- `Abbreviation`: 3-letter driver code
- `TeamName`: Constructor name
- `TeamColor`: Team color hex code
- `Position`: Qualifying position (1-20)
- `Q1`: Q1 best lap time
- `Q2`: Q2 best lap time (if reached)
- `Q3`: Q3 best lap time (if reached)
- **Metadata** (added by loader):
  - `year`: Season year
  - `round`: Round number
  - `race_name`: Race name
  - `country`: Country

## Data Ingestion

### Running Ingestion
```bash
# Using Makefile
make ingest

# Or directly
python -m scripts.ingest
```

### Ingestion Process
1. **FastF1 Cache**: Enabled automatically at `data/cache/`
2. **Schedule Loading**: Fetch full season schedule for each year
3. **Race Results**: Iterate through all rounds, load race session data
4. **Qualifying Results**: Iterate through all rounds, load qualifying session data
5. **Persistence**: Save each dataset as Parquet to `data/raw/`

### Error Handling
- Missing races (future races not yet completed) are skipped
- Failed API requests are logged but don't stop ingestion
- Each season is processed independently
- Summary statistics logged at completion

## Data Usage

### Loading Data
```python
import pandas as pd
from pathlib import Path

# Load a season schedule
schedule = pd.read_parquet("data/raw/schedule_2024.parquet")

# Load specific race results
race = pd.read_parquet("data/raw/race_results_2024_r01.parquet")

# Load all race results for a season
raw_dir = Path("data/raw")
all_races = []
for file in raw_dir.glob("race_results_2024_*.parquet"):
    df = pd.read_parquet(file)
    all_races.append(df)
races_2024 = pd.concat(all_races, ignore_index=True)
```

### Example Queries
```python
# Get all race winners
winners = races_2024[races_2024['Position'] == 1]

# Average qualifying position by driver
avg_qual = qualifying.groupby('Abbreviation')['Position'].mean()

# DNF analysis
dnf = races_2024[races_2024['Status'] != 'Finished']
```

## Data Quality Notes
- FastF1 data availability varies by season
- Earlier seasons (2018-2019) may have limited telemetry
- Some sessions may be missing or incomplete
- Future races return None until completed
- Cache reduces API load and improves performance

## References
- FastF1 Documentation: https://docs.fastf1.dev/
- F1 Official: https://www.formula1.com/

## Model Features (Engineered)

### Driver Rolling Features
| Feature | Description | Window |
|---------|-------------|--------|
| `driver_last5_avg_finish` | Average finish position | 5 races |
| `driver_last5_win_rate` | Win rate (0-1) | 5 races |
| `driver_last5_podium_rate` | Podium rate (0-1) | 5 races |

### Constructor Rolling Features
| Feature | Description | Window |
|---------|-------------|--------|
| `team_last5_avg_finish` | Team average finish | 5 races |

### Session Features
| Feature | Description |
|---------|-------------|
| `quali_position` | Qualifying grid position |
| `quali_delta` | Gap to reference position |

### Targets
| Target | Type | Definition |
|--------|------|------------|
| `win` | binary | finish_position == 1 |
| `podium` | binary | finish_position <= 3 |
| `finish_position` | int | Final race position |

### Leakage Prevention
All rolling features are computed using **strictly prior races** to prevent data leakage.
