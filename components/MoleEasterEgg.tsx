"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Hammer, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, AlertCircle, Play } from 'lucide-react';
import { submitToHubSpot, upsertHubSpotContact } from '../services/hubspotService';

// --- GAME CONSTANTS ---
const TILE_SIZE = 30;
const COLS = 19;
const ROWS = 22;
const CANVAS_WIDTH = COLS * TILE_SIZE; // 570
const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 660
const PLAYER_SPEED = 3; // Divisible by TILE_SIZE ideally, or handled via delta
const GHOST_SPEED = 1.5; 

// Map Key: 1=Wall, 0=Dot, 2=Empty, 3=Power, 4=Gate, 9=House
const MAZE_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,4,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,9,9,9,1,2,2,0,2,2,2,2], // Tunnel row
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface Entity {
  x: number; // Pixel coordinates (center)
  y: number;
  dir: Direction;
  nextDir: Direction; // buffer for cornering
  speed: number;
}

interface Ghost extends Entity {
  id: number;
  type: 'DOC' | 'FOLDER';
  isScared: boolean;
  color: string;
  mode: 'CHASE' | 'SCATTER' | 'HOUSE' | 'EXITING' | 'DEAD';
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export const MoleEasterEgg: React.FC = () => {
  // --- SCROLL & MODAL STATE ---
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showMole, setShowMole] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- GAME STATE ---
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'CRUNCHED' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<{name: string, score: number}[]>([
    { name: "FK", score: 15000 },
    { name: "P.Dev", score: 8500 },
    { name: "HR", score: 4000 }
  ]);
  
  // Form State
  const [initials, setInitials] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  // --- GAME REFS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  
  // Game Objects
  const playerRef = useRef<Entity>({ x: 0, y: 0, dir: 'NONE', nextDir: 'NONE', speed: PLAYER_SPEED });
  const ghostsRef = useRef<Ghost[]>([]);
  const dotsRef = useRef<{col: number, row: number, type: 'DOT' | 'POWER'}[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const hasStartedRef = useRef(false);

  // --- SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (scrollTop + windowHeight >= fullHeight - 10) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isAtBottom) {
      timeout = setTimeout(() => { setShowMole(true); }, 1500);
    } else {
      setShowMole(false);
    }
    return () => clearTimeout(timeout);
  }, [isAtBottom]);

  // --- HELPER FUNCTIONS ---
  const getTile = (x: number, y: number) => {
      const col = Math.floor(x / TILE_SIZE);
      const row = Math.floor(y / TILE_SIZE);
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
          return MAZE_MAP[row][col];
      }
      return 1; // Treat OOB as wall
  };

  const isSolid = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false; // Warp tunnel is not solid
      const cell = MAZE_MAP[row][col];
      return cell === 1 || cell === 4 || cell === 9; // Wall, Gate, House are solid for player
  };

  // --- GAME LOGIC ---

  const initGame = () => {
    setGameState('PLAYING');
    setScore(0);
    scoreRef.current = 0;
    frameCountRef.current = 0;
    hasStartedRef.current = false;
    
    // Reset Player (Find starting position or hardcode)
    // Using row 15, col 9 as start
    playerRef.current = { 
        x: 9 * TILE_SIZE + TILE_SIZE/2, 
        y: 15 * TILE_SIZE + TILE_SIZE/2, 
        dir: 'NONE', 
        nextDir: 'NONE', 
        speed: PLAYER_SPEED 
    };
    
    // Create Ghosts
    ghostsRef.current = [
      { id: 1, x: 9 * TILE_SIZE + TILE_SIZE/2, y: 8 * TILE_SIZE + TILE_SIZE/2, dir: 'LEFT', nextDir: 'LEFT', speed: GHOST_SPEED, type: 'DOC', isScared: false, color: '#ef4444', mode: 'CHASE' }, // Red
      { id: 2, x: 8 * TILE_SIZE + TILE_SIZE/2, y: 10 * TILE_SIZE + TILE_SIZE/2, dir: 'UP', nextDir: 'UP', speed: GHOST_SPEED, type: 'FOLDER', isScared: false, color: '#f97316', mode: 'HOUSE' }, // Orange
      { id: 3, x: 9 * TILE_SIZE + TILE_SIZE/2, y: 10 * TILE_SIZE + TILE_SIZE/2, dir: 'UP', nextDir: 'UP', speed: GHOST_SPEED, type: 'DOC', isScared: false, color: '#ec4899', mode: 'HOUSE' }, // Pink
      { id: 4, x: 10 * TILE_SIZE + TILE_SIZE/2, y: 10 * TILE_SIZE + TILE_SIZE/2, dir: 'UP', nextDir: 'UP', speed: GHOST_SPEED, type: 'FOLDER', isScared: false, color: '#3b82f6', mode: 'HOUSE' }, // Blue
    ];

    // Build Dots
    const newDots = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (MAZE_MAP[r][c] === 0) {
                newDots.push({ col: c, row: r, type: 'DOT' as const });
            }
            if (MAZE_MAP[r][c] === 3) {
                newDots.push({ col: c, row: r, type: 'POWER' as const });
            }
        }
    }
    dotsRef.current = newDots;
    particlesRef.current = [];
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'PLAYING') return;
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowUp': playerRef.current.nextDir = 'UP'; break;
        case 'ArrowDown': playerRef.current.nextDir = 'DOWN'; break;
        case 'ArrowLeft': playerRef.current.nextDir = 'LEFT'; break;
        case 'ArrowRight': playerRef.current.nextDir = 'RIGHT'; break;
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const canMove = (x: number, y: number, dir: Direction) => {
      const row = Math.floor(y / TILE_SIZE);
      const col = Math.floor(x / TILE_SIZE);
      
      let nextRow = row;
      let nextCol = col;
      
      if (dir === 'UP') nextRow--;
      if (dir === 'DOWN') nextRow++;
      if (dir === 'LEFT') nextCol--;
      if (dir === 'RIGHT') nextCol++;
      
      // Tunnel handling
      if (nextCol < 0 || nextCol >= COLS) return true;

      return !isSolid(nextRow, nextCol);
  };

  const moveEntity = (entity: Entity) => {
      // Check if centered on tile to allow turning
      const centeredX = Math.floor(entity.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
      const centeredY = Math.floor(entity.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
      
      const distToCenter = Math.sqrt(Math.pow(entity.x - centeredX, 2) + Math.pow(entity.y - centeredY, 2));
      
      if (distToCenter < entity.speed) {
          // We are at intersection (roughly)
          // Snap to center to ensure clean turns
          // Only snap if we are actually turning or hitting a wall
          
          // Try to turn
          if (entity.nextDir !== 'NONE' && entity.nextDir !== entity.dir) {
             if (canMove(centeredX, centeredY, entity.nextDir)) {
                 entity.x = centeredX;
                 entity.y = centeredY;
                 entity.dir = entity.nextDir;
                 entity.nextDir = 'NONE';
             }
          }
          
          // Check if we can continue in current dir
          if (!canMove(centeredX, centeredY, entity.dir)) {
              entity.x = centeredX;
              entity.y = centeredY;
              entity.dir = 'NONE'; // Stop
          }
      }
      
      // Apply velocity
      if (entity.dir === 'UP') entity.y -= entity.speed;
      if (entity.dir === 'DOWN') entity.y += entity.speed;
      if (entity.dir === 'LEFT') entity.x -= entity.speed;
      if (entity.dir === 'RIGHT') entity.x += entity.speed;
      
      // Tunnel Wrapping
      if (entity.x < -TILE_SIZE/2) entity.x = CANVAS_WIDTH + TILE_SIZE/2;
      if (entity.x > CANVAS_WIDTH + TILE_SIZE/2) entity.x = -TILE_SIZE/2;
  };
  
  const updateGhosts = () => {
      ghostsRef.current.forEach(ghost => {
          // Simple AI: Move randomly but don't reverse unless forced
          const centeredX = Math.floor(ghost.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
          const centeredY = Math.floor(ghost.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
          const distToCenter = Math.sqrt(Math.pow(ghost.x - centeredX, 2) + Math.pow(ghost.y - centeredY, 2));

          // Release logic
          if (ghost.mode === 'HOUSE') {
             if (frameCountRef.current > ghost.id * 180) { // Stagger release
                 ghost.mode = 'EXITING';
                 ghost.x = 9 * TILE_SIZE + TILE_SIZE/2; // Center of house
                 ghost.y = 10 * TILE_SIZE + TILE_SIZE/2;
             }
             return; // Don't move normal yet
          }
          
          if (ghost.mode === 'EXITING') {
             ghost.y -= 1;
             if (ghost.y < 8 * TILE_SIZE + TILE_SIZE/2) {
                 ghost.mode = 'CHASE';
                 ghost.dir = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
             }
             return;
          }

          // AI Movement
          if (distToCenter < ghost.speed) {
              ghost.x = centeredX;
              ghost.y = centeredY;
              
              const possibleDirs: Direction[] = [];
              const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
              const opposites = {'UP':'DOWN', 'DOWN':'UP', 'LEFT':'RIGHT', 'RIGHT':'LEFT'};
              
              dirs.forEach(d => {
                  // Don't reverse direction immediately unless dead/scared logic (simplified here)
                  if (d !== opposites[ghost.dir] && canMove(ghost.x, ghost.y, d)) {
                      possibleDirs.push(d);
                  }
              });
              
              if (possibleDirs.length > 0) {
                  // Rudimentary Targeting
                  // If scared, pick random
                  if (ghost.isScared) {
                      ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                  } else {
                      // Chase Player
                      let bestDir = possibleDirs[0];
                      let minDst = 999999;
                      
                      possibleDirs.forEach(d => {
                          let tx = ghost.x;
                          let ty = ghost.y;
                          if (d==='UP') ty-=TILE_SIZE;
                          if (d==='DOWN') ty+=TILE_SIZE;
                          if (d==='LEFT') tx-=TILE_SIZE;
                          if (d==='RIGHT') tx+=TILE_SIZE;
                          
                          const dst = Math.pow(tx - playerRef.current.x, 2) + Math.pow(ty - playerRef.current.y, 2);
                          if (dst < minDst) {
                              minDst = dst;
                              bestDir = d;
                          }
                      });
                      ghost.dir = bestDir;
                  }
              } else {
                  // Dead end (shouldn't happen in this maze except house)
                  ghost.dir = opposites[ghost.dir] as Direction;
              }
          }
          
          if (ghost.dir === 'UP') ghost.y -= ghost.speed;
          if (ghost.dir === 'DOWN') ghost.y += ghost.speed;
          if (ghost.dir === 'LEFT') ghost.x -= ghost.speed;
          if (ghost.dir === 'RIGHT') ghost.x += ghost.speed;
          
          // Tunnel Wrapping
          if (ghost.x < -TILE_SIZE/2) ghost.x = CANVAS_WIDTH + TILE_SIZE/2;
          if (ghost.x > CANVAS_WIDTH + TILE_SIZE/2) ghost.x = -TILE_SIZE/2;
      });
  };

  const updateGame = () => {
    if (gameState !== 'PLAYING') return;
    
    // Player Move
    moveEntity(playerRef.current);
    
    // Check for start
    if (!hasStartedRef.current && playerRef.current.dir !== 'NONE') {
        hasStartedRef.current = true;
    }
    
    // Update Ghosts only if started
    if (hasStartedRef.current) {
        frameCountRef.current++;
        updateGhosts();
    }

    // Collisions
    const p = playerRef.current;
    
    // Dots
    const pCol = Math.floor(p.x / TILE_SIZE);
    const pRow = Math.floor(p.y / TILE_SIZE);
    
    const dotIndex = dotsRef.current.findIndex(d => d.col === pCol && d.row === pRow);
    if (dotIndex !== -1) {
        const dot = dotsRef.current[dotIndex];
        dotsRef.current.splice(dotIndex, 1);
        scoreRef.current += dot.type === 'POWER' ? 50 : 10;
        setScore(scoreRef.current);
        
        if (dot.type === 'POWER') {
            ghostsRef.current.forEach(g => g.isScared = true);
            setTimeout(() => {
                ghostsRef.current.forEach(g => g.isScared = false);
            }, 8000);
        }
        
        if (dotsRef.current.length === 0) {
            // Win / Reset
            initGame();
        }
    }
    
    // Ghost Collision
    ghostsRef.current.forEach(g => {
        const dx = p.x - g.x;
        const dy = p.y - g.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < TILE_SIZE * 0.8) {
            if (g.isScared) {
                // Eat Ghost
                g.mode = 'HOUSE'; // Send home logic simplified
                g.x = 9 * TILE_SIZE + TILE_SIZE/2;
                g.y = 10 * TILE_SIZE + TILE_SIZE/2;
                g.isScared = false;
                scoreRef.current += 200;
                setScore(scoreRef.current);
            } else {
                // Die
                setGameState('CRUNCHED');
                setTimeout(() => {
                    setGameState('GAMEOVER');
                }, 2000);
            }
        }
    });

    drawGame();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const drawMaze = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = '#1e3a8a'; // Blue walls
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      for(let r=0; r<ROWS; r++) {
          for(let c=0; c<COLS; c++) {
              const cell = MAZE_MAP[r][c];
              const x = c * TILE_SIZE;
              const y = r * TILE_SIZE;
              
              if (cell === 1) {
                  // Simplified wall rendering: Draw box if wall
                  // A proper implementation checks neighbors to draw lines
                  // For now, we draw a hollow rounded rect to simulate the maze look
                  ctx.strokeRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
              }
              
              if (cell === 4) {
                  ctx.strokeStyle = '#f472b6'; // Pink gate
                  ctx.beginPath(); ctx.moveTo(x, y+TILE_SIZE/2); ctx.lineTo(x+TILE_SIZE, y+TILE_SIZE/2); ctx.stroke();
                  ctx.strokeStyle = '#1e3a8a'; // Reset
              }
          }
      }
  };

  const drawGame = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw Maze Walls
      drawMaze(ctx);

      // Dots
      dotsRef.current.forEach(dot => {
          const cx = dot.col * TILE_SIZE + TILE_SIZE/2;
          const cy = dot.row * TILE_SIZE + TILE_SIZE/2;
          
          if (dot.type === 'POWER') {
            ctx.font = "20px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("☕", cx, cy);
          } else {
              ctx.fillStyle = "#fcd34d";
              ctx.beginPath();
              ctx.arc(cx, cy, 3, 0, Math.PI * 2);
              ctx.fill();
          }
      });

      // Player (The Logo)
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x, p.y);
      
      let rotation = 0;
      if (p.dir === 'UP') rotation = -90;
      if (p.dir === 'DOWN') rotation = 90;
      if (p.dir === 'LEFT') rotation = 180;
      
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Draw Logo
      const scale = 0.25;
      ctx.scale(scale, scale);
      ctx.translate(-50, -50);
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 12;
      
      // M shape
      ctx.strokeStyle = "#fbbf24"; // Gold Pacman color
      ctx.beginPath();
      ctx.moveTo(20, 80); ctx.lineTo(40, 20); ctx.lineTo(60, 80);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, 80); ctx.lineTo(60, 20); ctx.lineTo(80, 80);
      ctx.stroke();
      
      ctx.restore();

      // Ghosts
      ghostsRef.current.forEach(g => {
          ctx.font = "24px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let emoji = g.type === 'DOC' ? '📄' : '📁';
          if (g.isScared) emoji = '😱';
          ctx.fillText(emoji, g.x, g.y);
      });

      // READY State
      if (!hasStartedRef.current && gameState === 'PLAYING') {
          ctx.save();
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 5;
          ctx.font = "bold 30px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("READY!", CANVAS_WIDTH/2, 11 * TILE_SIZE + 15);
          ctx.restore();
      }
  };

  useEffect(() => {
      if (gameState === 'PLAYING') {
          requestRef.current = requestAnimationFrame(updateGame);
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [gameState]);

  const syncHubSpotContact = async (contactEmail: string, contactName: string) => {
      const trimmedEmail = contactEmail.trim();
      const trimmedName = contactName.trim();
      if (!trimmedEmail || !trimmedName) return;

      const nameParts = trimmedName.split(/\s+/);
      const firstname = nameParts[0];
      const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const upsertResult = await upsertHubSpotContact({ email: trimmedEmail, firstname, lastname });
      if (!upsertResult) {
        await submitToHubSpot({ email: trimmedEmail, firstname, lastname });
      }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
      e.preventDefault();
      if (!initials || !fullName || !email) return;

      const contactEmail = email;
      const contactName = fullName;
      
      const newScores = [...highScores, { name: initials, score: scoreRef.current }];
      newScores.sort((a,b) => b.score - a.score);
      setHighScores(newScores.slice(0, 5));
      setGameState('IDLE');
      setInitials('');
      setFullName('');
      setEmail('');
      void syncHubSpotContact(contactEmail, contactName);
  };


  return (
    <>
      {/* Mole Trigger - BEAVER AMBASSADOR */}
      <div 
        className={`fixed bottom-0 right-8 transition-transform duration-700 z-40 cursor-pointer hover:scale-105 ${
          showMole && !isModalOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={() => setIsModalOpen(true)}
      >
        <svg width="180" height="140" viewBox="0 0 200 180" fill="none">
          {/* Hole */}
          <ellipse cx="100" cy="180" rx="90" ry="30" fill="#3f2e22" />
          
          {/* Tail */}
          <path d="M20 160 Q 5 140, 20 120 Q 35 140, 45 160" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
          <path d="M20 160 L45 160" stroke="#3E2723" strokeWidth="2" />
          <path d="M25 130 L40 150" stroke="#3E2723" strokeWidth="1" opacity="0.5" />

          {/* Beaver Body */}
          <ellipse cx="100" cy="140" rx="45" ry="40" fill="#795548" />
          <ellipse cx="100" cy="140" rx="30" ry="35" fill="#8D6E63" />
          
          {/* Ears */}
          <circle cx="65" cy="110" r="8" fill="#795548" />
          <circle cx="135" cy="110" r="8" fill="#795548" />
          
          {/* Head area (Hat sits on top) */}
          
          {/* Hard Hat */}
          <path d="M55 110 C55 70, 145 70, 145 110" fill="#FFC107" />
          <rect x="45" y="110" width="110" height="15" rx="5" fill="#FFC107" />
          <rect x="90" y="80" width="20" height="20" rx="5" fill="#FFB300" />
          <circle cx="100" cy="90" r="6" fill="white" className="animate-pulse" />
          
          {/* Face */}
          <circle cx="85" cy="130" r="4" fill="black" /> {/* Eye */}
          <circle cx="115" cy="130" r="4" fill="black" /> {/* Eye */}
          
          <ellipse cx="100" cy="140" rx="10" ry="6" fill="#3E2723" /> {/* Nose */}
          
          {/* Teeth */}
          <rect x="94" y="145" width="6" height="8" fill="white" stroke="#eee" />
          <rect x="100" y="145" width="6" height="8" fill="white" stroke="#eee" />
          
          {/* Thumbs Up Arm */}
          <path d="M140 150 Q 160 130, 170 140 Q 160 160, 140 150" fill="#795548" />
          <circle cx="170" cy="135" r="8" fill="#795548" />
          <path d="M168 125 L168 135" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />

          {/* Sign Post */}
          <rect x="160" y="50" width="8" height="100" fill="#8D6E63" />
          
          {/* Sign Board - Rotated */}
          <g transform="rotate(5 165 50)">
            <rect x="130" y="30" width="70" height="40" rx="4" fill="#f1f5f9" stroke="#334155" strokeWidth="2" />
            {/* Centered Text */}
            <text x="165" y="55" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#ef4444">CLICK ME!</text>
          </g>
        </svg>
      </div>

      {/* Full Screen Underground Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-[#1a120b]">
            {/* Dirt Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20" 
                 style={{ background: 'radial-gradient(circle, transparent 60%, #000000 100%)', boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)' }}></div>
            
            {/* Texture */}
            <div className="absolute inset-0 opacity-20 z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            <div className="relative z-30 w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 text-amber-100/80">
                    <div className="flex items-center gap-3">
                        <Hammer size={24} />
                        <span className="font-hand text-2xl tracking-widest">The Purely Works Underground Lab</span>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="hover:text-white p-2 bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Game Container */}
                <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                    
                    {gameState === 'IDLE' && (
                        <div className="text-center animate-fade-in-up">
                            <div className="mb-12">
                                <button 
                                    onClick={initGame}
                                    className="group relative bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 px-12 rounded-full text-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_50px_rgba(79,70,229,0.8)] transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                                >
                                    <Play className="w-8 h-8 fill-current" />
                                    PLAY NOW
                                </button>
                            </div>
                            
                            <h2 className="text-4xl font-bold text-white mt-4 mb-4">Work Pacman</h2>
                            <p className="text-slate-400 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
                                Play a round of Purely Works Pac-Man while we take care of the hard work.
                            </p>
                            
                            <div className="flex justify-center gap-4 text-slate-500 text-sm">
                                <div className="flex flex-col items-center gap-1"><ArrowUp size={16}/><span className="text-xs">Move</span></div>
                                <div className="flex flex-col items-center gap-1"><div className="flex gap-1"><ArrowLeft size={16}/><ArrowDown size={16}/><ArrowRight size={16}/></div></div>
                            </div>

                            {/* High Scores */}
                            <div className="mt-12 bg-black/30 p-6 rounded-xl backdrop-blur-md border border-white/10 max-w-md mx-auto">
                                <h3 className="text-amber-400 font-bold mb-4 flex items-center justify-center gap-2"><Trophy size={16}/> LEADERBOARD</h3>
                                {highScores.map((hs, i) => (
                                    <div key={i} className="flex justify-between text-sm text-slate-300 mb-2 border-b border-white/5 pb-1 last:border-0">
                                        <span>{i+1}. {hs.name}</span>
                                        <span className="font-mono text-indigo-400">{hs.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CRUNCHED ANIMATION */}
                    {gameState === 'CRUNCHED' && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                             <h1 className="text-8xl md:text-9xl font-black text-red-600 animate-bounce drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" 
                                 style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #fff' }}>
                                CRUNCHED!
                            </h1>
                        </div>
                    )}

                    {gameState === 'PLAYING' && (
                        <div className="relative">
                            <canvas 
                                ref={canvasRef} 
                                width={CANVAS_WIDTH} 
                                height={CANVAS_HEIGHT}
                                className="bg-slate-900/80 rounded-xl shadow-2xl border border-slate-700 max-w-full max-h-[80vh]"
                            />
                            <div className="absolute top-4 left-4 text-white font-mono text-xl font-bold">
                                SCORE: {score}
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-slate-500 text-xs opacity-50">
                                USE ARROW KEYS TO MOVE
                            </div>
                        </div>
                    )}

                    {gameState === 'GAMEOVER' && (
                        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md animate-scale-in relative z-50 w-full">
                            <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                            <p className="text-white text-xl mb-6">FINAL SCORE: <span className="text-indigo-400 font-mono font-bold">{score}</span></p>
                            
                            <form onSubmit={handleSubmitScore} className="space-y-4 text-left">
                                {/* Public Info */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Initials (What everyone sees) <span className="text-red-400">*</span></label>
                                    <input 
                                        value={initials}
                                        onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0,3))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none font-mono text-lg tracking-widest uppercase"
                                        placeholder="ABC"
                                        autoFocus
                                        maxLength={3}
                                    />
                                </div>

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-dashed border-slate-600"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-slate-800 px-2 text-xs text-slate-500 uppercase tracking-widest font-bold">What we will see</span>
                                    </div>
                                </div>

                                {/* Private Info */}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Full Name <span className="text-red-400">*</span></label>
                                    <input 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">Email <span className="text-red-400">*</span></label>
                                     <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-indigo-500 outline-none"
                                        placeholder="jane@company.com"
                                    />
                                </div>
                                
                                <div className="bg-amber-500/10 p-3 rounded border border-amber-500/20 flex items-start gap-2 text-xs text-amber-200">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <span>Score verification requires valid contact details.</span>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={!initials || !fullName || !email}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                                >
                                    SUBMIT SCORE
                                </button>
                                <button type="button" onClick={initGame} className="w-full text-slate-400 hover:text-white text-sm py-2">
                                    Try Again (No Save)
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer - PROMINENT EXIT */}
                <div className="p-6 text-center">
                     <button 
                        onClick={() => setIsModalOpen(false)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-full font-bold tracking-widest uppercase transition-all hover:shadow-lg hover:scale-105"
                     >
                        Return to Surface
                     </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
