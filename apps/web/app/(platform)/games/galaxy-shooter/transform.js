const fs = require('fs');

function transformFile(filePath, outputPath, isLoop) {
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace Vue imports
  code = code.replace(/import \{.*\} from 'vue'/g, '');

  // Add Zustand store import
  code = "import { useGameStore } from '../store/useGameStore'\n" + code;
  code = code.replace(/import type \{ GameState \} from '.\/useGameState'/g, '');

  // The refs that need 'state.' prefix and '.value' removed
  const refs = [
    'gameState', 'previousGameState', 'gameMode', 'gamePhase', 'difficulty', 'currentWave',
    'weaponType', 'weaponLevel', 'bgHue', 'boardRotation', 'isRotating', 'activeWidth',
    'activeHeight', 'globalScale', 'isMuted', 'hiddenEventWavesLeft', 'resumingCountdown',
    'resumeInterval', 'notification', 'player', 'score', 'lives', 'bullets', 'enemyBullets',
    'enemies', 'powerUps', 'bosses', 'waveAnnouncement', 'activeDots', 'leaderboard',
    'saves', 'currentSaveId'
  ];
  
  const reactives = ['engine'];
  const others = ['showNotification'];

  // Remove the destructuring block: const { gameState, ... } = state
  code = code.replace(/const\s*\{\s*([\s\S]*?)\s*\}\s*=\s*state/g, (match, inner) => {
    if (inner.includes('gameState') || inner.includes('engine')) {
      return '';
    }
    return match;
  });

  // Inject state getter at the start of the function
  if (isLoop) {
    code = code.replace(/export function useGameLoop\([^)]+\)\s*\{/, 
      "export function useGameLoop(controls: ReturnType<typeof useControls>, actions: any) {\n  const state = useGameStore.getState();"
    );
  } else {
    code = code.replace(/export function useGameActions\([^)]+\)\s*\{/, 
      "export function useGameActions(controls: ReturnType<typeof useControls>) {\n  const state = useGameStore.getState();\n  const setGameState = state.setGameState;"
    );
  }

  // Replace all occurrences of refName.value with state.refName
  refs.forEach(refName => {
    const regexValue = new RegExp('\\b' + refName + '\\b\\.value', 'g');
    code = code.replace(regexValue, 'state.' + refName);
  });
  
  // Replace references without .value (like passing ref to a function or it's a reactive)
  [...refs, ...reactives, ...others].forEach(name => {
    // We only replace standalone variables.
    const regex = new RegExp('(?<!\\.|[a-zA-Z0-9_])\\b(' + name + ')\\b(?![a-zA-Z0-9_]|\\s*:)', 'g');
    code = code.replace(regex, 'state.$1');
  });

  // Fix state.state -> state
  code = code.replace(/state\.state/g, 'state');

  fs.writeFileSync(outputPath, code);
  console.log("Written", outputPath);
}

transformFile('e:/Coding/SomeStuff/riikoncenter/apps/web/app/(platform)/games/chicken-invaders/composables/useGameActions.ts', 'e:/Coding/SomeStuff/riikoncenter/apps/web/app/(platform)/games/chicken-invaders/hooks/useGameActions.ts', false);
transformFile('e:/Coding/SomeStuff/riikoncenter/apps/web/app/(platform)/games/chicken-invaders/composables/useGameLoop.ts', 'e:/Coding/SomeStuff/riikoncenter/apps/web/app/(platform)/games/chicken-invaders/hooks/useGameLoop.ts', true);
