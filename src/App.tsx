import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { GameEngine } from './game/engine/GameEngine';
import { SaveManager, INITIAL_PLAYER_STATS } from './game/save/SaveManager';
import { SaveData } from './types/game';
import { soundEngine } from './game/audio/AudioEngine';

// Components
import { MainMenu } from './components/MainMenu';
import { PrologueCinematic } from './components/PrologueCinematic';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { MapModal } from './components/MapModal';
import { JournalModal } from './components/JournalModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { PlayStoreModal } from './components/PlayStoreModal';
import { DiscoveryNotification, AlertData } from './components/DiscoveryNotification';

export default function App() {
  const [screen, setScreen] = useState<'main_menu' | 'prologue' | 'playing'>('main_menu');
  const [activeModal, setActiveModal] = useState<'map' | 'journal' | 'pause' | 'settings' | 'playstore' | null>(null);
  const [currentAlert, setCurrentAlert] = useState<AlertData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const activeSlot = SaveManager.getActiveSlot();
  const existingSave = SaveManager.getSave(activeSlot);

  // Initialize Game Engine when switching to 'playing'
  const startEngine = useCallback((save?: SaveData) => {
    if (!canvasRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new GameEngine(
      canvasRef.current,
      {
        onUpdateStats: () => {}, // Handled by GameHUD
        onAlert: (alert) => {
          setCurrentAlert(alert);
        },
        onBossEncounter: () => {}, // Handled by GameHUD
        onInteractPrompt: () => {} // Handled by GameHUD
      },
      save
    );

    engineRef.current = engine;
    engine.start();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  // Handle flow transitions
  const handleContinue = useCallback(() => {
    soundEngine.init();
    soundEngine.resume();
    setScreen('playing');
    setTimeout(() => {
      startEngine(existingSave || undefined);
    }, 50);
  }, [existingSave, startEngine]);

  const handleNewGame = useCallback(() => {
    soundEngine.init();
    soundEngine.resume();
    const save = SaveManager.createDefaultSave(activeSlot);
    SaveManager.saveGame(save);
    setScreen('prologue');
  }, [activeSlot]);

  const handlePrologueComplete = useCallback(() => {
    setScreen('playing');
    setTimeout(() => {
      startEngine();
      setCurrentAlert({
        title: 'Exploration Begins',
        subtitle: 'Use the left virtual joystick to move. Scarf glides on air!',
        icon: 'map-pin'
      });
    }, 50);
  }, [startEngine]);

  // Touch control hooks (memoized with stable references)
  const handleMove = useCallback((x: number, isSprinting: boolean) => {
    if (engineRef.current) {
      engineRef.current.inputX = x;
      engineRef.current.isSprinting = isSprinting;
    }
  }, []);

  const handleJump = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.jump();
    }
  }, []);

  const handleReleaseGlider = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.releaseGlider();
    }
  }, []);

  const handleStartAttack = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.startAttack();
    }
  }, []);

  const handleReleaseAttack = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.releaseAttack();
    }
  }, []);

  const handleDodge = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.player.dodge();
    }
  }, []);

  const handleInteract = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.interact();
    }
  }, []);

  const handleCompanionAbility = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.companion.triggerPulse();
    }
  }, []);

  // Modal open handlers
  const handleOpenMap = useCallback(() => {
    setActiveModal('map');
  }, []);

  const handleOpenJournal = useCallback(() => {
    setActiveModal('journal');
  }, []);

  const handleOpenPause = useCallback(() => {
    setActiveModal('pause');
  }, []);

  const handleOpenPlayStore = useCallback(() => {
    setActiveModal('playstore');
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070b12] text-slate-100 select-none">
      <Analytics />
      {/* Canvas Viewport (Always present for smooth hardware rendering) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block z-0 ${
          screen === 'playing' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Hardware-Accelerated CSS Vignette (Zero Canvas 2D CPU cost) */}
      {screen === 'playing' && (
        <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(4,7,13,0.45)_100%)]" />
      )}

      {/* 1. Main Menu Screen */}
      {screen === 'main_menu' && (
        <MainMenu
          onContinue={handleContinue}
          onNewGame={handleNewGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenPlayStore={handleOpenPlayStore}
          hasExistingSave={Boolean(existingSave)}
        />
      )}

      {/* 2. Prologue First 60 Seconds Cinematic */}
      {screen === 'prologue' && (
        <PrologueCinematic onComplete={handlePrologueComplete} />
      )}

      {/* 3. In-Game HUD & Controls */}
      {screen === 'playing' && (
        <>
          <GameHUD
            engine={engineRef.current}
            onOpenMap={handleOpenMap}
            onOpenJournal={handleOpenJournal}
            onOpenPause={handleOpenPause}
            onOpenPlayStore={handleOpenPlayStore}
            onTriggerCompanionPulse={handleCompanionAbility}
          />

          <TouchControls
            onMove={handleMove}
            onJump={handleJump}
            onReleaseGlider={handleReleaseGlider}
            onStartAttack={handleStartAttack}
            onReleaseAttack={handleReleaseAttack}
            onDodge={handleDodge}
            onInteract={handleInteract}
            onCompanionAbility={handleCompanionAbility}
          />
        </>
      )}

      {/* Discovery & World Shift Notification Toast */}
      <DiscoveryNotification
        alert={currentAlert}
        onDismiss={() => setCurrentAlert(null)}
      />

      {/* Modals */}
      {activeModal === 'map' && engineRef.current && (
        <MapModal
          landmarks={engineRef.current.landmarks}
          playerPos={engineRef.current.player.pos}
          worldShiftCounter={engineRef.current.worldSystem.totalWorldShifts}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'journal' && engineRef.current && (
        <JournalModal
          collectibles={engineRef.current.collectibles}
          puzzles={engineRef.current.puzzles}
          observations={engineRef.current.worldSystem.worldObservations}
          playerStats={engineRef.current.player.stats}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'pause' && (
        <PauseModal
          onResume={() => setActiveModal(null)}
          onSaveGame={() => {
            if (engineRef.current) {
              engineRef.current.saveCurrentGame();
              setCurrentAlert({
                title: 'Progress Saved',
                subtitle: 'Your survey data was written to slot storage.',
                icon: 'flame'
              });
            }
            setActiveModal(null);
          }}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenPlayStore={handleOpenPlayStore}
          onRestartCheckpoint={() => {
            setActiveModal(null);
            const slot = SaveManager.getActiveSlot();
            const save = SaveManager.getSave(slot);
            startEngine(save || undefined);
          }}
          onExitToMenu={() => {
            setActiveModal(null);
            if (engineRef.current) {
              engineRef.current.stop();
            }
            setScreen('main_menu');
          }}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onSaveSlotSelected={(slot) => {
            const save = SaveManager.getSave(slot);
            if (screen === 'playing') {
              startEngine(save || undefined);
            }
          }}
        />
      )}

      {/* Google Play Store & Games Hub Modal */}
      {activeModal === 'playstore' && (
        <PlayStoreModal
          currentSave={existingSave}
          onSaveUpdated={(updated) => {
            SaveManager.saveGame(updated);
            if (engineRef.current) {
              engineRef.current.player.stats.shiftingShards = updated.playerStats.shiftingShards;
              engineRef.current.updateEquippedCosmetics(updated.equippedCosmetics);
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
