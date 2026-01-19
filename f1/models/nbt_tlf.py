"""Neural Bradley-Terry with Temporal Latent Factors (NBT-TLF).

PyTorch implementation of a neural ranking model for F1 race predictions using
embeddings and pairwise comparisons.
"""

import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SinusoidalPositionalEncoding(nn.Module):
    """Sinusoidal positional encoding for temporal features."""

    def __init__(self, d_model: int = 16, max_len: int = 1000):
        super().__init__()
        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))
        pe = torch.zeros(max_len, d_model)
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Get positional encoding for race indices.

        Args:
            x: Tensor of race indices [batch_size]

        Returns:
            Positional encodings [batch_size, d_model]
        """
        # Narrow type from Tensor | Module to Tensor for indexing
        pe: torch.Tensor = self.pe  # type: ignore[assignment]
        return pe[x.long()]


class NBTTLFModel(nn.Module):
    """Neural Bradley-Terry with Temporal Latent Factors model."""

    def __init__(
        self,
        n_drivers: int,
        n_constructors: int,
        n_tracks: int,
        embed_dim: int = 32,
        hidden_dim: int = 64,
        temporal_dim: int = 16,
        dropout: float = 0.2,
        numeric_features_dim: int = 0,
    ):
        """Initialize NBT-TLF model.

        Args:
            n_drivers: Number of unique drivers
            n_constructors: Number of unique constructors
            n_tracks: Number of unique tracks
            embed_dim: Embedding dimension for entities
            hidden_dim: Hidden layer dimension
            temporal_dim: Temporal encoding dimension
            dropout: Dropout probability
            numeric_features_dim: Number of numeric delta features
        """
        super().__init__()

        self.n_drivers = n_drivers
        self.n_constructors = n_constructors
        self.n_tracks = n_tracks
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        self.temporal_dim = temporal_dim

        # Embeddings
        self.driver_embedding = nn.Embedding(n_drivers, embed_dim)
        self.constructor_embedding = nn.Embedding(n_constructors, embed_dim)
        self.track_embedding = nn.Embedding(n_tracks, embed_dim)

        # Temporal encoding
        self.temporal_encoding = SinusoidalPositionalEncoding(temporal_dim)

        # Score network
        input_dim = embed_dim * 3 + temporal_dim + numeric_features_dim
        self.score_network = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, 1),
        )

        # Initialize embeddings
        self._init_embeddings()

    def _init_embeddings(self):
        """Initialize embeddings with small random values."""
        nn.init.normal_(self.driver_embedding.weight, mean=0, std=0.1)
        nn.init.normal_(self.constructor_embedding.weight, mean=0, std=0.1)
        nn.init.normal_(self.track_embedding.weight, mean=0, std=0.1)

    def compute_score(
        self,
        driver_idx: torch.Tensor,
        constructor_idx: torch.Tensor,
        track_idx: torch.Tensor,
        race_idx: torch.Tensor,
        numeric_features: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """Compute score for a driver-constructor-track-time combination.

        Args:
            driver_idx: Driver indices [batch_size]
            constructor_idx: Constructor indices [batch_size]
            track_idx: Track indices [batch_size]
            race_idx: Race indices for temporal encoding [batch_size]
            numeric_features: Optional numeric features [batch_size, num_features]

        Returns:
            Scores [batch_size, 1]
        """
        # Get embeddings
        driver_emb = self.driver_embedding(driver_idx)
        constructor_emb = self.constructor_embedding(constructor_idx)
        track_emb = self.track_embedding(track_idx)

        # Get temporal encoding
        temporal_emb = self.temporal_encoding(race_idx)

        # Concatenate all features
        features = [driver_emb, constructor_emb, track_emb, temporal_emb]
        if numeric_features is not None:
            features.append(numeric_features)

        combined = torch.cat(features, dim=1)

        # Compute score
        score: torch.Tensor = self.score_network(combined)
        return score

    def forward(
        self,
        driver_i_idx: torch.Tensor,
        constructor_i_idx: torch.Tensor,
        driver_j_idx: torch.Tensor,
        constructor_j_idx: torch.Tensor,
        track_idx: torch.Tensor,
        race_idx: torch.Tensor,
        numeric_features_i: Optional[torch.Tensor] = None,
        numeric_features_j: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """Forward pass for pairwise comparison.

        Args:
            driver_i_idx: Driver i indices
            constructor_i_idx: Constructor i indices
            driver_j_idx: Driver j indices
            constructor_j_idx: Constructor j indices
            track_idx: Track indices
            race_idx: Race indices
            numeric_features_i: Numeric features for driver i
            numeric_features_j: Numeric features for driver j

        Returns:
            Probability that driver i beats driver j [batch_size, 1]
        """
        # Compute scores for both drivers
        score_i = self.compute_score(
            driver_i_idx, constructor_i_idx, track_idx, race_idx, numeric_features_i
        )
        score_j = self.compute_score(
            driver_j_idx, constructor_j_idx, track_idx, race_idx, numeric_features_j
        )

        # Bradley-Terry probability: P(i beats j) = sigmoid(score_i - score_j)
        logit = score_i - score_j
        prob = torch.sigmoid(logit)

        return prob


class PairwiseDataset(Dataset):
    """Dataset for pairwise comparisons."""

    def __init__(
        self,
        pairwise_df: pd.DataFrame,
        driver_to_idx: dict[str, int],
        constructor_to_idx: dict[str, int],
        track_to_idx: dict[str, int],
        numeric_feature_cols: Optional[list[str]] = None,
    ):
        self.df = pairwise_df.reset_index(drop=True)
        self.driver_to_idx = driver_to_idx
        self.constructor_to_idx = constructor_to_idx
        self.track_to_idx = track_to_idx
        self.numeric_feature_cols = numeric_feature_cols or []

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]

        # Get indices
        driver_i = self.driver_to_idx.get(row["driver_i"], 0)
        driver_j = self.driver_to_idx.get(row["driver_j"], 0)
        constructor_i = self.constructor_to_idx.get(row["team_i"], 0)
        constructor_j = self.constructor_to_idx.get(row["team_j"], 0)
        track = self.track_to_idx.get(row["track_id"], 0)

        # Race index (use round within season as temporal index)
        race_idx = int(row["season"] * 100 + row["round"])

        # Numeric features
        if self.numeric_feature_cols:
            feats_i = torch.tensor(
                [row.get(f"{col}_i", 0.0) for col in self.numeric_feature_cols], dtype=torch.float32
            )
            feats_j = torch.tensor(
                [row.get(f"{col}_j", 0.0) for col in self.numeric_feature_cols], dtype=torch.float32
            )
        else:
            feats_i = None
            feats_j = None

        # Label
        y = torch.tensor(row["y"], dtype=torch.float32)

        return {
            "driver_i": torch.tensor(driver_i, dtype=torch.long),
            "constructor_i": torch.tensor(constructor_i, dtype=torch.long),
            "driver_j": torch.tensor(driver_j, dtype=torch.long),
            "constructor_j": torch.tensor(constructor_j, dtype=torch.long),
            "track": torch.tensor(track, dtype=torch.long),
            "race_idx": torch.tensor(race_idx, dtype=torch.long),
            "features_i": feats_i,
            "features_j": feats_j,
            "y": y,
        }


class NBTTLFTrainer:
    """Trainer for NBT-TLF model."""

    def __init__(
        self, model: NBTTLFModel, lr: float = 0.001, weight_decay: float = 0.01, device: str = "cpu"
    ):
        self.model = model.to(device)
        self.device = device
        self.optimizer = optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
        self.criterion = nn.BCELoss()
        self.history: dict[str, list[float]] = {"train_loss": [], "val_loss": []}

    def train_epoch(self, train_loader: DataLoader) -> float:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0.0

        for batch in train_loader:
            # Move to device
            driver_i = batch["driver_i"].to(self.device)
            constructor_i = batch["constructor_i"].to(self.device)
            driver_j = batch["driver_j"].to(self.device)
            constructor_j = batch["constructor_j"].to(self.device)
            track = batch["track"].to(self.device)
            race_idx = batch["race_idx"].to(self.device)
            y = batch["y"].to(self.device).unsqueeze(1)

            features_i = (
                batch["features_i"].to(self.device) if batch["features_i"] is not None else None
            )
            features_j = (
                batch["features_j"].to(self.device) if batch["features_j"] is not None else None
            )

            # Forward pass
            self.optimizer.zero_grad()
            y_pred = self.model(
                driver_i,
                constructor_i,
                driver_j,
                constructor_j,
                track,
                race_idx,
                features_i,
                features_j,
            )

            # Compute loss
            loss = self.criterion(y_pred, y)

            # Backward pass
            loss.backward()
            self.optimizer.step()

            total_loss += loss.item()

        return total_loss / len(train_loader)

    def evaluate(self, val_loader: DataLoader) -> float:
        """Evaluate on validation set."""
        self.model.eval()
        total_loss = 0.0

        with torch.no_grad():
            for batch in val_loader:
                driver_i = batch["driver_i"].to(self.device)
                constructor_i = batch["constructor_i"].to(self.device)
                driver_j = batch["driver_j"].to(self.device)
                constructor_j = batch["constructor_j"].to(self.device)
                track = batch["track"].to(self.device)
                race_idx = batch["race_idx"].to(self.device)
                y = batch["y"].to(self.device).unsqueeze(1)

                features_i = (
                    batch["features_i"].to(self.device) if batch["features_i"] is not None else None
                )
                features_j = (
                    batch["features_j"].to(self.device) if batch["features_j"] is not None else None
                )

                y_pred = self.model(
                    driver_i,
                    constructor_i,
                    driver_j,
                    constructor_j,
                    track,
                    race_idx,
                    features_i,
                    features_j,
                )

                loss = self.criterion(y_pred, y)
                total_loss += loss.item()

        return total_loss / len(val_loader)

    def fit(
        self,
        train_loader: DataLoader,
        val_loader: Optional[DataLoader] = None,
        epochs: int = 50,
        patience: int = 5,
    ):
        """Train model with early stopping."""
        best_val_loss = float("inf")
        patience_counter = 0

        for epoch in range(epochs):
            train_loss = self.train_epoch(train_loader)
            self.history["train_loss"].append(train_loss)

            if val_loader:
                val_loss = self.evaluate(val_loader)
                self.history["val_loss"].append(val_loss)

                logger.info(
                    f"Epoch {epoch + 1}/{epochs} - Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}"
                )

                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    patience_counter = 0
                else:
                    patience_counter += 1
                    if patience_counter >= patience:
                        logger.info(f"Early stopping at epoch {epoch + 1}")
                        break
            else:
                logger.info(f"Epoch {epoch + 1}/{epochs} - Train Loss: {train_loss:.4f}")

    def save(self, save_dir: Path, config: dict):
        """Save model and config."""
        save_dir.mkdir(parents=True, exist_ok=True)

        # Save model weights
        model_path = save_dir / "model.pt"
        torch.save(self.model.state_dict(), model_path)
        logger.info(f"Model saved to {model_path}")

        # Save config
        config_path = save_dir / "config.json"
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        logger.info(f"Config saved to {config_path}")

    @classmethod
    def load(cls, save_dir: Path, device: str = "cpu"):
        """Load model and config."""
        # Load config
        config_path = save_dir / "config.json"
        with open(config_path) as f:
            config = json.load(f)

        # Create model
        model = NBTTLFModel(
            n_drivers=config["n_drivers"],
            n_constructors=config["n_constructors"],
            n_tracks=config["n_tracks"],
            embed_dim=config.get("embed_dim", 32),
            hidden_dim=config.get("hidden_dim", 64),
            temporal_dim=config.get("temporal_dim", 16),
            dropout=config.get("dropout", 0.2),
            numeric_features_dim=config.get("numeric_features_dim", 0),
        )

        # Load weights
        model_path = save_dir / "model.pt"
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.to(device)

        trainer = cls(model, device=device)
        logger.info(f"Model loaded from {save_dir}")

        return trainer, config


def predict_race(
    model: NBTTLFModel,
    race_df: pd.DataFrame,
    driver_to_idx: dict[str, int],
    constructor_to_idx: dict[str, int],
    track_to_idx: dict[str, int],
    device: str = "cpu",
) -> pd.DataFrame:
    """Predict win and podium probabilities for a race.

    Args:
        model: Trained NBT-TLF model
        race_df: DataFrame with driver features for one race
        driver_to_idx: Driver name to index mapping
        constructor_to_idx: Constructor name to index mapping
        track_to_idx: Track name to index mapping
        device: Device to run on

    Returns:
        DataFrame with predictions
    """
    model.eval()
    predictions = []

    with torch.no_grad():
        for _, row in race_df.iterrows():
            driver_idx = driver_to_idx.get(row["driver_id"], 0)
            constructor_idx = constructor_to_idx.get(row["team"], 0)
            track_idx = track_to_idx.get(row["track_id"], 0)
            race_idx = int(row["season"] * 100 + row["round"])

            # Compute score
            score = model.compute_score(
                torch.tensor([driver_idx], dtype=torch.long).to(device),
                torch.tensor([constructor_idx], dtype=torch.long).to(device),
                torch.tensor([track_idx], dtype=torch.long).to(device),
                torch.tensor([race_idx], dtype=torch.long).to(device),
            )

            predictions.append({"driver_id": row["driver_id"], "score": score.item()})

    pred_df = pd.DataFrame(predictions)

    # Convert scores to probabilities via softmax
    scores = np.asarray(pred_df["score"].values)
    exp_scores = np.exp(scores - scores.max())
    win_probs = exp_scores / exp_scores.sum()
    podium_probs = np.minimum(win_probs * 3, 0.95)  # Heuristic

    pred_df["win_prob"] = win_probs
    pred_df["podium_prob"] = podium_probs

    return pred_df
