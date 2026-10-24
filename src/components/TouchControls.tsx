import React, { useRef, useEffect, useCallback, memo } from 'react';
import { 
  Sword, 
  Wind, 
  Sparkles, 
  Hand,
  ArrowUp
} from 'lucide-react';

interface TouchControlsProps {
  onMove: (x: number, isSprinting: boolean) => void;
  onJump: () => void;
  onReleaseGlider: () => void;
  onStartAttack: () => void;
  onReleaseAttack: () => void;
  onDodge: () => void;
  onInteract: () => void;
  onCompanionAbility: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = memo(({
  onMove,
  onJump,
  onReleaseGlider,
  onStartAttack,
  onReleaseAttack,
  onDodge,
  onInteract,
  onCompanionAbility,
}) => {
  // Joystick state using direct DOM refs for 0ms lag & 0 React re-renders
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingJoystick = useRef(false);
  const joystickTouchId = useRef<number | null>(null);

  // Jump hold for gliding
  const isJumping = useRef(false);

  // Direct transform update
  const updateJoystickPos = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 10;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0px)`;
    }

    // Normalize horizontal input
    const normalizedX = dx / maxRadius;
    const isSprinting = Math.abs(normalizedX) > 0.75;
    onMove(normalizedX, isSprinting);
  }, [onMove]);

  // Handle Joystick Touch / Mouse Drag
  const handleJoystickStart = useCallback((clientX: number, clientY: number, touchId: number | null) => {
    isDraggingJoystick.current = true;
    joystickTouchId.current = touchId;
    updateJoystickPos(clientX, clientY);
  }, [updateJoystickPos]);

  const handleJoystickEnd = useCallback(() => {
    isDraggingJoystick.current = false;
    joystickTouchId.current = null;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    }
    onMove(0, false);
  }, [onMove]);

  // Global touch listeners for smooth joystick drag
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingJoystick.current || joystickTouchId.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystickTouchId.current) {
          updateJoystickPos(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDraggingJoystick.current || joystickTouchId.current === null) return;
      let found = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystickTouchId.current) {
          found = true;
          break;
        }
      }
      if (!found) {
        handleJoystickEnd();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [updateJoystickPos, handleJoystickEnd]);

  // Keyboard controls listener (for desktop testing)
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateFromKeys = () => {
      let x = 0;
      if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft')) x -= 1;
      if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight')) x += 1;
      const isShift = activeKeys.has('ShiftLeft') || activeKeys.has('ShiftRight');
      onMove(x, isShift);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      activeKeys.add(e.code);

      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        onJump();
      } else if (e.code === 'KeyJ' || e.code === 'KeyK') {
        onStartAttack();
      } else if (e.code === 'KeyL' || e.code === 'KeyC') {
        onDodge();
      } else if (e.code === 'KeyE' || e.code === 'KeyF') {
        onInteract();
      } else if (e.code === 'KeyQ') {
        onCompanionAbility();
      }
      updateFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        onReleaseGlider();
      } else if (e.code === 'KeyJ' || e.code === 'KeyK') {
        onReleaseAttack();
      }
      updateFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onMove, onJump, onReleaseGlider, onStartAttack, onReleaseAttack, onDodge, onInteract, onCompanionAbility]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none flex justify-between items-end p-4 sm:p-8 pb-6 sm:pb-8">
      {/* Left: Virtual Movement Joystick */}
      <div className="relative pointer-events-auto flex flex-col items-center">
        <div
          ref={joystickBaseRef}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleJoystickStart(touch.clientX, touch.clientY, touch.identifier);
          }}
          onMouseDown={(e) => handleJoystickStart(e.clientX, e.clientY, null)}
          onMouseMove={(e) => isDraggingJoystick.current && updateJoystickPos(e.clientX, e.clientY)}
          onMouseUp={handleJoystickEnd}
          className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-950/60 backdrop-blur-md border-2 border-slate-600/50 shadow-2xl flex items-center justify-center touch-none cursor-pointer"
          style={{ willChange: 'transform' }}
        >
          {/* Outer compass marks */}
          <div className="absolute inset-2 rounded-full border border-slate-700/40 pointer-events-none" />
          <div className="absolute w-2 h-2 rounded-full bg-slate-600/60 top-1.5 pointer-events-none" />
          <div className="absolute w-2 h-2 rounded-full bg-slate-600/60 bottom-1.5 pointer-events-none" />
          <div className="absolute w-2 h-2 rounded-full bg-slate-600/60 left-1.5 pointer-events-none" />
          <div className="absolute w-2 h-2 rounded-full bg-slate-600/60 right-1.5 pointer-events-none" />

          {/* Draggable Knob */}
          <div
            ref={knobRef}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-200/60 shadow-lg flex items-center justify-center pointer-events-none"
            style={{ willChange: 'transform', transform: 'translate3d(0px, 0px, 0px)' }}
          >
            <div className="w-6 h-6 rounded-full bg-amber-200/40" />
          </div>
        </div>
        <span className="text-[10px] text-slate-400/80 font-mono-tech mt-1 tracking-wider uppercase pointer-events-none">
          Move / Sprint
        </span>
      </div>

      {/* Right: Action Buttons Cluster */}
      <div className="relative pointer-events-auto flex items-end gap-3 sm:gap-4">
        {/* Companion Ability & Interact Row */}
        <div className="flex flex-col gap-3">
          {/* Kip Radiant Pulse Ability */}
          <button
            onClick={onCompanionAbility}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 border-2 border-amber-500/70 text-amber-300 shadow-xl backdrop-blur-md flex flex-col items-center justify-center active:scale-90 transition-transform touch-none cursor-pointer"
            title="Kip's Radiant Pulse"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[8px] font-bold text-amber-200 uppercase mt-0.5">Pulse</span>
          </button>

          {/* Interact Button */}
          <button
            onClick={onInteract}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/80 hover:bg-slate-800 border-2 border-cyan-500/70 text-cyan-300 shadow-xl backdrop-blur-md flex flex-col items-center justify-center active:scale-90 transition-transform touch-none cursor-pointer"
            title="Interact / Push / Rest"
          >
            <Hand className="w-5 h-5 text-cyan-400" />
            <span className="text-[8px] font-bold text-cyan-200 uppercase mt-0.5">Action</span>
          </button>
        </div>

        {/* Primary Combat & Agility Cluster */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Dodge Roll (Left) */}
          <button
            onClick={onDodge}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-slate-900/85 hover:bg-slate-800 border-2 border-emerald-500/70 text-emerald-300 shadow-xl backdrop-blur-md flex flex-col items-center justify-center active:scale-90 transition-transform touch-none cursor-pointer"
            title="Dodge Roll"
          >
            <Wind className="w-5 h-5 text-emerald-400" />
            <span className="text-[8px] font-bold text-emerald-200 uppercase">Dodge</span>
          </button>

          {/* Jump / Glide (Top) */}
          <button
            onTouchStart={() => {
              isJumping.current = true;
              onJump();
            }}
            onTouchEnd={() => {
              isJumping.current = false;
              onReleaseGlider();
            }}
            onMouseDown={() => {
              isJumping.current = true;
              onJump();
            }}
            onMouseUp={() => {
              isJumping.current = false;
              onReleaseGlider();
            }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-slate-900/85 hover:bg-slate-800 border-2 border-sky-500/70 text-sky-300 shadow-xl backdrop-blur-md flex flex-col items-center justify-center active:scale-90 transition-transform touch-none cursor-pointer"
            title="Jump / Hold in Air to Glide"
          >
            <ArrowUp className="w-5 h-5 text-sky-400" />
            <span className="text-[8px] font-bold text-sky-200 uppercase">Jump</span>
          </button>

          {/* Attack / Charge Strike (Center/Right Primary Big Button) */}
          <button
            onTouchStart={onStartAttack}
            onTouchEnd={onReleaseAttack}
            onMouseDown={onStartAttack}
            onMouseUp={onReleaseAttack}
            className="absolute right-0 bottom-2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-rose-700 to-amber-500 border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform box-glow-rune touch-none cursor-pointer"
            title="Light Attack (Hold for Charged Strike)"
          >
            <Sword className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow" />
            <span className="text-[9px] font-bold text-amber-100 uppercase tracking-wider">Attack</span>
          </button>
        </div>
      </div>
    </div>
  );
});
TouchControls.displayName = 'TouchControls';
