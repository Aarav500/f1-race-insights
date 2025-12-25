"""S3 storage interface for model artifacts and reports.

Provides cloud storage capabilities for production deployments.
Safely no-ops if not configured (no AWS credentials required by default).
"""

import logging
import os
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class S3Storage:
    """S3 storage interface for model artifacts and reports.

    Disabled by default. Enable via environment variables:
    - S3_BUCKET: S3 bucket name
    - S3_PREFIX: Optional prefix for keys (e.g., 'f1-models/')
    - AWS_REGION: AWS region (default: us-east-1)
    """

    def __init__(
        self,
        bucket: Optional[str] = None,
        prefix: Optional[str] = None,
        region: Optional[str] = None,
    ):
        """Initialize S3 storage.

        Args:
            bucket: S3 bucket name (env: S3_BUCKET)
            prefix: S3 key prefix (env: S3_PREFIX)
            region: AWS region (env: AWS_REGION)
        """
        self.bucket = bucket or os.getenv("S3_BUCKET")
        self.prefix = prefix or os.getenv("S3_PREFIX", "")
        self.region = region or os.getenv("AWS_REGION", "us-east-1")

        self.enabled = bool(self.bucket)
        self._client = None

        if self.enabled:
            logger.info(f"S3 storage enabled: s3://{self.bucket}/{self.prefix}")
        else:
            logger.info("S3 storage disabled (no S3_BUCKET configured)")

    @property
    def client(self):
        """Lazy-load boto3 S3 client."""
        if not self.enabled:
            return None

        if self._client is None:
            try:
                import boto3

                self._client = boto3.client("s3", region_name=self.region)
                logger.info("S3 client initialized")
            except ImportError:
                logger.warning("boto3 not installed. S3 storage disabled.")
                self.enabled = False
            except Exception as e:
                logger.warning(f"Failed to initialize S3 client: {e}")
                self.enabled = False

        return self._client

    def _make_key(self, path: str) -> str:
        """Create S3 key from path.

        Args:
            path: Local file path or key

        Returns:
            S3 key with prefix
        """
        # Remove leading slash if present
        path = path.lstrip("/")

        if self.prefix:
            return f"{self.prefix.rstrip('/')}/{path}"
        return path

    def upload_file(self, local_path: Path, s3_key: Optional[str] = None, **kwargs) -> bool:
        """Upload file to S3.

        Args:
            local_path: Local file to upload
            s3_key: S3 key (if None, uses local filename)
            **kwargs: Additional boto3 upload_file arguments

        Returns:
            True if uploaded, False otherwise
        """
        if not self.enabled:
            logger.debug(f"S3 disabled, skipping upload: {local_path}")
            return False

        local_path = Path(local_path)
        if not local_path.exists():
            logger.error(f"Local file not found: {local_path}")
            return False

        # Default key
        if s3_key is None:
            s3_key = local_path.name

        s3_key = self._make_key(s3_key)

        try:
            self.client.upload_file(str(local_path), self.bucket, s3_key, **kwargs)
            logger.info(f"Uploaded: s3://{self.bucket}/{s3_key}")
            return True

        except Exception as e:
            logger.error(f"Failed to upload {local_path}: {e}")
            return False

    def download_file(self, s3_key: str, local_path: Path, **kwargs) -> bool:
        """Download file from S3.

        Args:
            s3_key: S3 key to download
            local_path: Local destination path
            **kwargs: Additional boto3 download_file arguments

        Returns:
            True if downloaded, False otherwise
        """
        if not self.enabled:
            logger.debug(f"S3 disabled, skipping download: {s3_key}")
            return False

        s3_key = self._make_key(s3_key)
        local_path = Path(local_path)

        # Create parent directory
        local_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            self.client.download_file(self.bucket, s3_key, str(local_path), **kwargs)
            logger.info(f"Downloaded: s3://{self.bucket}/{s3_key} -> {local_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to download {s3_key}: {e}")
            return False

    def upload_model_artifact(
        self, model_path: Path, model_name: str, version: Optional[str] = None
    ) -> bool:
        """Upload model artifact to S3.

        Args:
            model_path: Local model file
            model_name: Model name (e.g., 'xgb', 'nbt_tlf')
            version: Optional version (default: 'latest')

        Returns:
            True if uploaded, False otherwise
        """
        version = version or "latest"
        s3_key = f"models/{model_name}/{version}/{model_path.name}"

        return self.upload_file(model_path, s3_key)

    def download_model_artifact(
        self,
        model_name: str,
        local_dir: Path,
        version: Optional[str] = None,
        filename: Optional[str] = None,
    ) -> bool:
        """Download model artifact from S3.

        Args:
            model_name: Model name
            local_dir: Local directory to save model
            version: Model version (default: 'latest')
            filename: Model filename (default: '{model_name}.joblib')

        Returns:
            True if downloaded, False otherwise
        """
        version = version or "latest"
        filename = filename or f"{model_name}.joblib"

        s3_key = f"models/{model_name}/{version}/{filename}"
        local_path = local_dir / filename

        return self.download_file(s3_key, local_path)

    def upload_report(self, report_path: Path, report_type: str = "backtest") -> bool:
        """Upload report to S3.

        Args:
            report_path: Local report file
            report_type: Report type (e.g., 'backtest', 'evaluation')

        Returns:
            True if uploaded, False otherwise
        """
        from datetime import datetime

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        s3_key = f"reports/{report_type}/{timestamp}_{report_path.name}"

        return self.upload_file(report_path, s3_key)

    def list_models(self, model_name: Optional[str] = None) -> list[str]:
        """List available models in S3.

        Args:
            model_name: Filter by model name (optional)

        Returns:
            List of S3 keys for models
        """
        if not self.enabled:
            return []

        prefix = self._make_key("models/")
        if model_name:
            prefix = f"{prefix}{model_name}/"

        try:
            response = self.client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)

            if "Contents" not in response:
                return []

            return [obj["Key"] for obj in response["Contents"]]

        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []


# Singleton instance
_storage = None


def get_storage() -> S3Storage:
    """Get singleton S3Storage instance.

    Returns:
        S3Storage instance
    """
    global _storage
    if _storage is None:
        _storage = S3Storage()
    return _storage
