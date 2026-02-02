"""Persistent cache for analysis results using diskcache."""

from __future__ import annotations

import logging
from pathlib import Path

import diskcache

from .models import CollectionAnalysisState, Trace

logger = logging.getLogger(__name__)

STATE_PREFIX = "state:"
TRACES_PREFIX = "traces:"


class AnalysisCache:
  """Typed wrapper around diskcache for persisting analysis results."""

  def __init__(self, directory: str | Path) -> None:
    self._cache = diskcache.Cache(str(directory))

  def close(self) -> None:
    self._cache.close()

  def save_state(self, collection_id: str, state: CollectionAnalysisState) -> None:
    """Persist analysis state (without traces to save space)."""
    data = state.model_dump(mode="json", exclude={"traces"})
    self._cache[STATE_PREFIX + collection_id] = data

  def save_traces(self, collection_id: str, traces: list[Trace]) -> None:
    """Persist raw trace data for detail/summary views."""
    data = [t.model_dump(mode="json") for t in traces]
    self._cache[TRACES_PREFIX + collection_id] = data

  def load_state(self, collection_id: str) -> CollectionAnalysisState | None:
    """Load a single collection's analysis state from disk."""
    data = self._cache.get(STATE_PREFIX + collection_id)
    if data is None:
      return None
    return CollectionAnalysisState.model_validate(data)

  def load_traces(self, collection_id: str) -> list[Trace]:
    """Load raw traces for a collection from disk."""
    data = self._cache.get(TRACES_PREFIX + collection_id)
    if data is None:
      return []
    return [Trace.model_validate(t) for t in data]

  def load_all_states(self) -> dict[str, CollectionAnalysisState]:
    """Load all persisted analysis states (for startup restore)."""
    states: dict[str, CollectionAnalysisState] = {}
    for key in self._cache:
      if isinstance(key, str) and key.startswith(STATE_PREFIX):
        collection_id = key[len(STATE_PREFIX) :]
        state = self.load_state(collection_id)
        if state and state.status in ("completed", "failed"):
          states[collection_id] = state
    return states

  def delete_collection(self, collection_id: str) -> None:
    """Remove all cached data for a collection."""
    self._cache.pop(STATE_PREFIX + collection_id, None)
    self._cache.pop(TRACES_PREFIX + collection_id, None)
