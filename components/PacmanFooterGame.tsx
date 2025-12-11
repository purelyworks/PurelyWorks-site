import React, { useEffect, useRef, useState } from 'react';

interface Pellet {
  x: number;
  eaten: boolean;
}

const BOARD_WIDTH = 320;
const BOARD_HEIGHT = 80;
const PACMAN_SIZE = 18;

export const PacmanFooterGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pellets, setPellets] = useState<Pellet[]>(() =>
    Array.from({ length: 14 }).map((_, index) => ({
      x: 16 + index * 22,
      eaten: false,
    }))
  );
  const [position, setPosition] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(true);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const draw = () => {
      context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

      context.fillStyle = '#fbbf24';
      const angle = mouthOpen ? Math.PI / 4 : Math.PI / 12;
      context.beginPath();
      context.moveTo(position + PACMAN_SIZE, BOARD_HEIGHT / 2);
      context.arc(position + PACMAN_SIZE, BOARD_HEIGHT / 2, PACMAN_SIZE, angle, 2 * Math.PI - angle);
      context.fill();

      context.fillStyle = '#22d3ee';
      pellets.forEach((pellet) => {
        if (pellet.eaten) return;
        context.beginPath();
        context.arc(pellet.x, BOARD_HEIGHT / 2, 4, 0, Math.PI * 2);
        context.fill();
      });
    };

    draw();
  }, [pellets, position, mouthOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMouthOpen((prev) => !prev);
      setPosition((prev) => {
        const next = prev + 6;
        if (next > BOARD_WIDTH) {
          setPellets((prevPellets) => prevPellets.map((pellet) => ({ ...pellet, eaten: false })));
          return -PACMAN_SIZE * 2;
        }

        setPellets((prevPellets) =>
          prevPellets.map((pellet) =>
            pellet.eaten || Math.abs(next + PACMAN_SIZE - pellet.x) < 10
              ? { ...pellet, eaten: true }
              : pellet
          )
        );

        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg">
      <div className="flex flex-col text-slate-300 text-xs leading-relaxed">
        <span className="font-semibold text-white">Footer arcade</span>
        <span>Keep Pacman moving while you explore.</span>
      </div>
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="rounded-xl border border-slate-800 bg-slate-900"
        aria-label="Pacman mini game"
      />
    </div>
  );
};
