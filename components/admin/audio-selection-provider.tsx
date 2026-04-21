"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AudioSelectionApi = {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
};

const AudioSelectionContext = createContext<AudioSelectionApi | null>(null);

export function AudioSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const api = useMemo(() => ({ selectedId, setSelectedId }), [selectedId]);
  return (
    <AudioSelectionContext value={api}>{children}</AudioSelectionContext>
  );
}

export function useAudioSelection(): AudioSelectionApi {
  const ctx = useContext(AudioSelectionContext);
  if (!ctx) {
    throw new Error(
      "useAudioSelection must be used inside <AudioSelectionProvider>",
    );
  }
  return ctx;
}
