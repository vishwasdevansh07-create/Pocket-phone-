import React, { useState, useEffect, memo } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import { PlayerStats, WeatherType, TimeOfDay } from '../types/game';
import { Enemy } from '../game/entities/Enemies';
import { INITIAL_PLAYER_STATS } from '../game/save/SaveManager';
import { HUD } from './HUD';

interface GameHUDProps {
  engine: GameEngine | null;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenPause: () => void;
  onOpenPlayStore: () => void;
  onTriggerCompanionPulse: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = memo(({
  engine,
  onOpenMap,
  onOpenJournal,
  onOpenPause,
  onOpenPlayStore,
  onTriggerCompanionPulse,
}) => {
  const [stats, setStats] = useState<PlayerStats>(() => engine?.player.stats || { ...INITIAL_PLAYER_STATS });
  const [weather, setWeather] = useState<WeatherType>(() => engine?.worldSystem.weather || 'clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => engine?.worldSystem.timeOfDay || 'dawn');
  const [companionMood, setCompanionMood] = useState<string>(() => engine?.companion.mood || 'calm');
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [activeBoss, setActiveBoss] = useState<Enemy | null>(null);

  useEffect(() => {
    if (!engine) return;

    // Attach listeners to GameEngine to isolate state updates from the root App component
    engine.callbacks.onUpdateStats = (player, companion) => {
      setStats((prev) => {
        if (
          Math.round(prev.health) === Math.round(player.stats.health) &&
          Math.round(prev.stamina) === Math.round(player.stats.stamina) &&
          prev.shiftingShards === player.stats.shiftingShards &&
          prev.bondLevel === player.stats.bondLevel &&
          prev.bondXp === player.stats.bondXp
        ) {
          return prev;
        }
        return { ...player.stats };
      });

      setCompanionMood((prev) => (prev === companion.mood ? prev : companion.mood));

      const ws = engine.worldSystem;
      setWeather((prev) => (prev === ws.weather ? prev : ws.weather));
      setTimeOfDay((prev) => (prev === ws.timeOfDay ? prev : ws.timeOfDay));
    };

    engine.callbacks.onBossEncounter = (boss) => {
      setActiveBoss(boss);
    };

    engine.callbacks.onInteractPrompt = (prompt) => {
      setInteractPrompt((prev) => (prev === prompt ? prev : prompt));
    };
  }, [engine]);

  return (
    <HUD
      stats={stats}
      weather={weather}
      timeOfDay={timeOfDay}
      companionMood={companionMood}
      interactPrompt={interactPrompt}
      activeBoss={activeBoss}
      onOpenMap={onOpenMap}
      onOpenJournal={onOpenJournal}
      onOpenPause={onOpenPause}
      onOpenPlayStore={onOpenPlayStore}
      onTriggerCompanionPulse={onTriggerCompanionPulse}
    />
  );
});

GameHUD.displayName = 'GameHUD';
