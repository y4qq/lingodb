"use client";

import {
  createContext,
  useContext,
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
  return (
    <AudioSelectionContext value={{ selectedId, setSelectedId }}>
      {children}
    </AudioSelectionContext>
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
