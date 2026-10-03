"""Error types shared across aolib."""

from __future__ import annotations


class AolibError(Exception):
    """Base error for every aolib failure (decode/encode/validation/usage)."""


class ValidationError(AolibError):
    """A packet that does not satisfy its spec/ JSON Schema."""

    def __init__(self, header: str, detail: str) -> None:
        self.header = header
        self.detail = detail
        super().__init__(f"Validation failed for {header}: {detail}")
