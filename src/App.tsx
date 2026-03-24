import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 120;

const TRACKS = [
  {
    id: 1,
    title: "ERR_0x001",
    artist: "SYS.AUDIO.1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "MEM_LEAK",
    artist: "SYS.AUDIO.2",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "NULL_POINTER",
    artist: "SYS.AUDIO.3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

// --- Types ---
type Point = { x: number; y: number };

// --- Helper Functions ---
const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { x: head.x + direction.x, y: head.y + direction.y };

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 16);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOver) {
        if (!gameStarted) setGameStarted(true);
        else setIsPaused(p => !p);
        return;
      }

      if (!gameStarted || isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, isPaused, gameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, Math.max(50, INITIAL_SPEED - Math.floor(score / 2)));
    return () => clearInterval(interval);
  }, [moveSnake, score]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="min-h-screen bg-black text-cyan-400 font-mono flex flex-col items-center justify-center p-4 relative static-noise scanlines tear">
      
      <div className="z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        
        {/* Left Column: Game */}
        <div className="flex flex-col items-center space-y-4">
          
          {/* Header / Score */}
          <div className="w-full flex justify-between items-end px-2 border-b-4 border-fuchsia-500 pb-2">
            <div>
              <h1 className="text-5xl font-bold glitch" data-text="ENTITY_SNAKE.EXE">
                ENTITY_SNAKE.EXE
              </h1>
              <p className="text-fuchsia-500 text-lg mt-1">SYS.VER.9.9.9 // UNAUTHORIZED_ACCESS</p>
            </div>
            <div className="flex gap-8 text-right">
              <div className="flex flex-col items-end">
                <span className="text-sm text-fuchsia-500">DATA_COLLECTED</span>
                <span className="text-3xl font-bold text-cyan-400">0x{score.toString(16).toUpperCase().padStart(4, '0')}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-fuchsia-500">MAX_CAPACITY</span>
                <span className="text-3xl font-bold text-cyan-400">0x{highScore.toString(16).toUpperCase().padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="relative p-2 bg-black border-4 border-cyan-400 shadow-[8px_8px_0px_#f0f]">
            <div 
              className="bg-black relative"
              style={{
                width: `${GRID_SIZE * 20}px`,
                height: `${GRID_SIZE * 20}px`,
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-20" 
                   style={{
                     backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)',
                     backgroundSize: '20px 20px'
                   }} 
              />

              {/* Food */}
              <div
                className="absolute bg-fuchsia-500 blink"
                style={{
                  left: `${food.x * 20}px`,
                  top: `${food.y * 20}px`,
                  width: '20px',
                  height: '20px',
                }}
              />

              {/* Snake */}
              {snake.map((segment, index) => {
                const isHead = index === 0;
                return (
                  <div
                    key={`${segment.x}-${segment.y}-${index}`}
                    className={`absolute ${isHead ? 'bg-cyan-300 z-10' : 'bg-cyan-500'}`}
                    style={{
                      left: `${segment.x * 20}px`,
                      top: `${segment.y * 20}px`,
                      width: '20px',
                      height: '20px',
                      border: '1px solid #000'
                    }}
                  />
                );
              })}

              {/* Overlays */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-2 border-fuchsia-500 m-4">
                  <p className="text-fuchsia-500 text-2xl mb-6 blink">AWAITING_INPUT...</p>
                  <button 
                    onClick={() => setGameStarted(true)}
                    className="px-6 py-2 bg-cyan-500 text-black font-bold text-xl hover:bg-fuchsia-500 transition-colors cursor-pointer"
                  >
                    [ INITIALIZE ]
                  </button>
                  <p className="mt-6 text-cyan-400 text-lg">INPUT: [W][A][S][D] OR ARROWS</p>
                </div>
              )}

              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
                  <span className="text-4xl font-bold text-fuchsia-500 glitch" data-text="PROCESS_SUSPENDED">PROCESS_SUSPENDED</span>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 bg-fuchsia-900/90 flex flex-col items-center justify-center z-20 border-4 border-cyan-400 m-2">
                  <span className="text-5xl font-bold text-cyan-400 glitch mb-4" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</span>
                  <span className="text-2xl text-white mb-8">FINAL_DUMP: 0x{score.toString(16).toUpperCase().padStart(4, '0')}</span>
                  <button 
                    onClick={resetGame}
                    className="px-6 py-2 bg-cyan-400 text-black font-bold text-xl hover:bg-white transition-colors cursor-pointer"
                  >
                    [ REBOOT_SEQUENCE ]
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Music Player */}
        <div className="flex flex-col space-y-8 pt-16">
          <div className="bg-black border-4 border-fuchsia-500 p-6 shadow-[8px_8px_0px_#0ff] relative">
            
            <div className="flex items-center justify-between mb-6 border-b-2 border-cyan-400 pb-2">
              <span className="text-lg text-cyan-400">AUDIO_STREAM_ACTIVE</span>
              <button onClick={() => setIsMuted(!isMuted)} className="text-fuchsia-500 hover:text-white cursor-pointer text-xl">
                {isMuted ? '[ MUTE: ON ]' : '[ MUTE: OFF ]'}
              </button>
            </div>

            {/* Track Info */}
            <div className="mb-8 text-center border-2 border-dashed border-cyan-500 p-4">
              <div className="text-4xl mb-2 text-fuchsia-500">
                {isPlaying ? (
                  <span className="blink">♪ ♫ ♪</span>
                ) : (
                  <span>- - -</span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 truncate">{TRACKS[currentTrackIndex].title}</h3>
              <p className="text-lg text-fuchsia-500 mt-2">{TRACKS[currentTrackIndex].artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={prevTrack}
                className="px-4 py-2 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black cursor-pointer text-xl"
              >
                {'<<'}
              </button>
              
              <button 
                onClick={togglePlay}
                className="px-6 py-2 bg-fuchsia-500 text-black font-bold hover:bg-white cursor-pointer text-xl"
              >
                {isPlaying ? '[ PAUSE ]' : '[ PLAY ]'}
              </button>

              <button 
                onClick={nextTrack}
                className="px-4 py-2 bg-black border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black cursor-pointer text-xl"
              >
                {'>>'}
              </button>
            </div>

            {/* Audio Element */}
            <audio 
              ref={audioRef}
              src={TRACKS[currentTrackIndex].url}
              onEnded={nextTrack}
              loop={false}
            />
          </div>

          {/* Track List */}
          <div className="bg-black border-4 border-cyan-400 p-4 shadow-[8px_8px_0px_#f0f]">
            <h4 className="text-xl text-fuchsia-500 mb-4 border-b-2 border-fuchsia-500 pb-2">AUDIO_INDEX</h4>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full flex items-center justify-between p-2 text-left cursor-pointer border-2 ${
                    currentTrackIndex === idx 
                      ? 'bg-cyan-900/50 border-cyan-400 text-cyan-400' 
                      : 'bg-black border-transparent text-gray-500 hover:border-fuchsia-500 hover:text-fuchsia-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg">[{idx + 1}]</span>
                    <div>
                      <p className="text-xl">{track.title}</p>
                      <p className="text-sm opacity-70">{track.artist}</p>
                    </div>
                  </div>
                  {currentTrackIndex === idx && isPlaying && (
                    <span className="text-fuchsia-500 blink">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
