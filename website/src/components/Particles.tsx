import { useEffect, useRef } from 'react';

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;

    let W = 0, H = 0;
    let stars: { x: number; y: number; r: number; vx: number; vy: number; a: number }[] = [];

    const rs = () => {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    rs();
    window.addEventListener('resize', rs);

    for(let i=0; i<100; i++) {
        stars.push({
            x: Math.random()*9999,
            y: Math.random()*9999,
            r: Math.random()*1.1 + 0.2,
            vx: (Math.random() - 0.5) * 0.12,
            vy: (Math.random() - 0.5) * 0.12,
            a: Math.random() * 0.35 + 0.05
        });
    }

    let reqId: number;

    const draw = () => {
      cx.clearRect(0,0,W,H);
      stars.forEach(s => {
          s.x += s.vx;
          s.y += s.vy;
          if(s.x < 0) s.x = W;
          if(s.x > W) s.x = 0;
          if(s.y < 0) s.y = H;
          if(s.y > H) s.y = 0;
          cx.beginPath();
          cx.arc(s.x % W, s.y % H, s.r, 0, Math.PI*2);
          cx.fillStyle = `rgba(160,154,255,${s.a})`;
          cx.fill();
      });
      reqId = requestAnimationFrame(draw);
    };

    reqId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', rs);
      cancelAnimationFrame(reqId);
    };
  }, []);

  return <canvas id="bg-canvas" ref={canvasRef}></canvas>;
}
