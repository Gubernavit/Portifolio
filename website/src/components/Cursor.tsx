import { useEffect } from 'react';

export default function Cursor() {
  useEffect(() => {
    const dot = document.getElementById('cur-dot');
    const ring = document.getElementById('cur-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    
    // Check if the device natively lacks hover (touch screens)
    if (window.matchMedia('(hover: none)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX; 
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    };

    let reqId: number;
    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      reqId = requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', handleMouseMove);
    reqId = requestAnimationFrame(animRing);

    const setupInteractivity = () => {
      // Elements that should trigger the hover animation
      document.querySelectorAll('a, button, .tic-cell, .ext-card, .dl-card, .nav-logo, .project-card').forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    const handleMouseEnter = () => ring.classList.add('hover');
    const handleMouseLeave = () => ring.classList.remove('hover');

    setupInteractivity();
    
    // We observe the DOM for changes to dynamically bind hover effects to freshly mounted React nodes
    const observer = new MutationObserver(() => {
      document.querySelectorAll('a, button, .tic-cell, .ext-card, .dl-card, .nav-logo, .project-card').forEach(el => {
        // Safe binding (avoids duplicates if properly handled, but this is simple enough)
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="cur-dot"></div>
      <div id="cur-ring"></div>
    </>
  );
}
