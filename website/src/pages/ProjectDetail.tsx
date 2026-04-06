import { useState, useEffect } from 'react';

type Player = 'X' | 'O' | '';

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState<'browser' | 'download'>('browser');

  // Tic-Tac-Toe State
  const [board, setBoard] = useState<Player[]>(Array(9).fill(''));
  const [gameState, setGameState] = useState<'playing' | 'x-win' | 'o-win' | 'draw'>('playing');
  const [scores, setScores] = useState({ x: 0, o: 0, d: 0 });

  useEffect(() => {
    // Scroll reveal observer
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const WIN_COMBOS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const checkWinner = (b: Player[]) => {
    for (let combo of WIN_COMBOS) {
      if (b[combo[0]] && b[combo[0]] === b[combo[1]] && b[combo[0]] === b[combo[2]]) {
        return { winner: b[combo[0]], combo };
      }
    }
    if (!b.includes('')) return { winner: 'draw', combo: null };
    return null;
  };

  const minimax = (newBoard: Player[], player: Player, depth: number): number => {
    let result = checkWinner(newBoard);
    if (result) {
      if (result.winner === 'O') return 10 - depth;
      if (result.winner === 'X') return depth - 10;
      return 0;
    }

    let moves = [];
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === '') {
        newBoard[i] = player;
        moves.push({ index: i, score: minimax(newBoard, player === 'O' ? 'X' : 'O', depth + 1) });
        newBoard[i] = '';
      }
    }

    if (player === 'O') {
      let best = -9999;
      for (let m of moves) {
        if (m.score > best) best = m.score;
      }
      return best;
    } else {
      let best = 9999;
      for (let m of moves) {
        if (m.score < best) best = m.score;
      }
      return best;
    }
  };

  const aiMoveObj = (b: Player[]) => {
    let bestScore = -9999;
    let move = -1;
    // adding a touch of randomness to the first move for variety
    const emptyCount = b.filter(c => c === '').length;
    if (emptyCount === 9) return Math.floor(Math.random() * 9);
    if (emptyCount === 8 && b[4] === '') return 4;
    
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') {
        b[i] = 'O';
        let score = minimax(b, 'X', 0);
        b[i] = '';
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] !== '' || gameState !== 'playing') return;

    // Player X Move
    const newBoard = [...board];
    newBoard[idx] = 'X';
    setBoard(newBoard);

    let result = checkWinner(newBoard);
    if (result) {
      if (result.winner === 'X') { setGameState('x-win'); setScores(s => ({ ...s, x: s.x + 1 })); }
      else if (result.winner === 'draw') { setGameState('draw'); setScores(s => ({ ...s, d: s.d + 1 })); }
      return;
    }

    // AI Move
    setTimeout(() => {
      const idxAI = aiMoveObj([...newBoard]);
      if (idxAI !== -1) {
        const afterAIBoard = [...newBoard];
        afterAIBoard[idxAI] = 'O';
        setBoard(afterAIBoard);
        
        let res2 = checkWinner(afterAIBoard);
        if (res2) {
          if (res2.winner === 'O') { setGameState('o-win'); setScores(s => ({ ...s, o: s.o + 1 })); }
          else if (res2.winner === 'draw') { setGameState('draw'); setScores(s => ({ ...s, d: s.d + 1 })); }
        }
      }
    }, 300);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setGameState('playing');
  };

  const getCellClass = (idx: number) => {
    let cls = "tic-cell";
    if (board[idx] !== '') cls += " taken " + (board[idx] === 'X' ? 'x-mark' : 'o-mark');
    
    if (gameState !== 'playing' && gameState !== 'draw') {
      const res = checkWinner(board);
      if (res && res.combo && res.combo.includes(idx)) cls += " win-cell";
    }
    return cls;
  };

  return (
    <>
      <section className="game-hero">
        <svg className="game-logo" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M69.28 12.55C69.99 12.61 70.71 12.67 71.42 12.71L71.98 12.74 73.1 12.81C74.05 12.87 74.91 12.98 75.83 13.23 76.09 13.29 76.35 13.34 76.61 13.39 83.5 14.77 90.34 17.19 95.94 21.56L96.31 21.84 96.68 22.22C97.44 22.54 97.87 22.28 98.61 21.99L99.14 21.77 100.18 21.36 100.69 21.15C101.38 20.89 102.07 20.69 102.78 20.49L103.29 20.06 103.71 20.09C104.47 20.08 105.18 19.88 105.92 19.7 107.07 19.42 108.18 19.2 109.38 19.17L109.38 18.88C114.33 18.66 114.33 18.66 116.6 18.78L116.91 18.8C117.44 18.83 117.68 18.87 118.13 19.17L118.88 19.42C120.42 19.97 121.57 20.91 122.44 22.29 123.85 25.34 123.2 28.7 122.1 31.73 121.65 32.94 121.11 34.09 120.51 35.22L120.1 36.02C118.88 38.39 117.41 40.63 115.91 42.83L115.67 43.18C115.34 43.65 115.01 44.12 114.66 44.57L114.37 44.95C114.28 45.05 114.21 45.15 114.12 45.25 113.7 46.25 114.36 47.72 114.62 48.71 117.35 59.44 116.23 70.93 111.45 80.92L111.31 81.23C109.39 85.31 106.78 89.03 103.72 92.33L102.84 93.39C102.18 94.11 102.18 94.11 101.66 94.28L101.66 94.58C101.47 94.77 101.47 94.77 101.19 95 101.08 95.1 100.98 95.19 100.86 95.28L100.47 95.62 100.01 96.02C98.999 96.91 97.97 97.73 96.88 98.5 96.45 98.81 96.16 99.04 95.87 99.48L95.57 99.48C95.2 99.71 94.83 99.95 94.47 100.19 91.07 102.41 87.42 104.3 83.55 105.56L83.12 105.7C74.76 108.38 66.25 108.57 57.72 106.6L57.38 106.53C51.98 105.34 46.87 102.59 42.4 99.41L42.05 99.17 41.29 98.47C40.85 98.02 40.46 97.69 39.91 97.4 39.06 97.41 38.35 97.69 37.58 97.99L36.93 98.22 35.95 98.56 32.89 99.42L32.43 99.53C31.79 99.68 31.22 99.79 30.55 99.77L30.41 100.07C30.12 100.12 30.12 100.12 29.75 100.15L28.15 100.33C23.6 101 18.09 101.3 14.16 98.44L13.78 98.14 13.45 97.88C12.47 97.02 11.62 95.54 11.34 94.26L11.26 93.98 10.96 93.84 11.04 93.54C11.11 93.11 11.11 92.71 11.09 92.27 10.98 88.81 12.31 85.56 13.93 82.55L14.19 82.06C16.25 78.3 19 74.89 21.81 71.66L22.54 70.68C22.44 70.26 22.33 69.84 22.21 69.43 20.06 61.57 20.99 52.92 23.55 45.27L23.68 44.89 23.79 44.55C23.89 44.24 23.89 44.24 23.88 43.81L24.17 43.81 24.25 43.57C26.07 37.98 29.4 33.11 33.15 28.65L33.59 28.1 34.12 27.48 34.41 27.48 34.41 27.19 34.71 27.19 34.82 26.93C35.42 25.85 36.6 25.01 37.53 24.22L37.91 23.89C41.24 21.05 47.82 15.61 52.38 15.61L52.52 15.31C52.81 15.21 52.81 15.21 53.2 15.12 53.87 14.95 54.53 14.74 55.19 14.52 59.11 13.27 63.23 12.76 67.34 12.66L68.02 12.56 69.28 12.55ZM102.13 24.31L101.78 24.4C101.21 24.55 100.86 24.67 100.47 25.11L100.89 25.46 101.42 25.91 101.7 26.14C102.38 26.71 102.38 26.71 102.55 27.04L102.84 27.04 102.96 27.3C103.15 27.66 103.36 27.86 103.65 28.13 106.04 30.49 107.87 33.54 109.51 36.44L109.78 36.89C110.34 37.93 110.34 37.93 110.14 38.61 109.91 39.04 109.66 39.42 109.38 39.8L109.18 40.08C109.02 40.31 108.85 40.53 108.67 40.75L108.28 41.24 108.09 41.49C107.83 41.81 107.58 42.14 107.33 42.47 105.65 44.67 103.87 46.79 101.97 48.8L101.51 49.6 101.21 49.6C101 49.81 101 49.81 100.78 50.08 100.11 50.87 99.38 51.6 98.65 52.33L97.95 53.03 97.5 53.48 97.09 53.89C96.76 54.2 96.76 54.2 96.46 54.35L96.46 54.65C96.37 54.69 96.29 54.73 96.2 54.77 95.86 54.95 95.62 55.15 95.34 55.42L94.75 55.98 94.14 56.58C93.55 57.02 93.55 57.02 93.2 57.32 92.69 57.29 92.25 57.2 91.76 57.06 90.05 56.57 88.41 56.65 86.81 57.47 85.41 58.34 84.44 59.58 83.99 61.18 83.88 61.75 83.84 62.19 83.92 62.77 84.11 64.25 84.11 64.25 83.64 64.86 83.05 65.43 82.37 65.87 81.68 66.3L80.68 66.95C78.57 68.38 76.32 69.58 74.03 70.69L73.23 71.09C68.09 73.58 61.95 75.62 56.27 73.97 54.74 73.44 53.57 72.39 52.82 70.98 51.77 68.75 51.92 66.6 52.72 64.32 54.31 60.03 57.74 56 61.28 53.16L61.71 52.82C65.59 49.72 69.72 46.99 74.2 44.84L75.09 44.41C77.48 43.24 79.97 42.37 82.48 41.53L82.77 41.43C83.77 41.1 84.75 40.78 85.77 40.55L86.07 40.47C87.8 40.05 89.59 39.88 91.36 39.75L91.79 39.72 92.17 39.69 92.6 39.51 92.6 39.8 92.85 39.85C94.97 40.23 96.78 40.65 98.54 41.96L99.13 42.33C98.68 40.66 97.78 39.79 96.31 38.91 91.62 36.64 85.93 37.23 80.98 38.24L79.79 38.47C69.66 40.49 59.84 45.11 51.03 50.38L50.17 50.89C46.87 52.84 43.67 54.97 40.65 57.32L39.97 57.84C37.53 59.73 35.15 61.68 32.88 63.78L31.82 64.72C31.39 65.09 31.05 65.48 30.7 65.93L29.51 67.11C28.63 67.98 27.79 68.86 27.02 69.83L25.99 71.05C22.01 75.85 17.09 82.78 17.64 89.38 17.82 90.7 18.12 91.9 18.98 92.95L19.27 92.95 19.38 93.21C20.07 94.4 21.77 94.82 23.01 95.18 24.28 95.49 25.52 95.51 26.82 95.52L27.13 95.52C30.07 95.52 32.91 95.02 35.75 94.28 35.89 94.03 35.89 94.03 35.9 93.69 35.66 93.4 35.43 93.16 35.16 92.91L34.47 92.24C34.04 91.82 33.63 91.34 33.23 90.87L32.9 90.49C31.18 88.48 29.7 86.31 28.35 84.03L27.9 83.3C27.27 82.28 26.76 81.2 26.25 80.11L26.02 79.64 25.81 79.19 25.62 78.78C25.49 78.33 25.51 78.1 25.66 77.66 25.82 77.38 25.82 77.38 26.03 77.11L26.26 76.81 26.51 76.49 26.77 76.15C27.65 75.04 28.57 73.96 29.52 72.91L29.72 72.68C30.78 71.48 31.91 70.35 33.04 69.21L33.26 68.99C34.12 68.13 34.98 67.3 35.9 66.52L36.39 66.1C38.11 64.61 39.88 63.16 41.69 61.77L42.4 61.22C43.15 60.64 43.9 60.09 44.68 59.56L47.26 57.76C50.19 55.68 53.23 53.84 56.38 52.13 55.71 52.92 55 53.67 54.24 54.4L53.71 54.94 53.41 55.24 53.41 55.54C53.61 55.82 51.82 56.9 51.82 56.9 50.43 58.9 49.41 61.03 49.41 61.03 47.46 64.64 46.86 68.49 47.88 71.95 48.92 74.82 50.92 76.91 53.64 78.25 54.66 78.73 55.73 79.03 56.83 79.29L57.29 79.4C60.77 80.08 64.43 79.48 67.81 78.55L67.81 78.25 68.07 78.34C68.47 78.41 68.67 78.35 69.05 78.21L69.42 78.08 69.82 77.93 70.22 77.79C71.73 77.24 73.19 76.61 74.64 75.93L75.01 75.76 75.36 75.59 75.68 75.44C76 75.27 76.28 75.06 76.57 74.84 76.92 74.66 77.27 74.49 77.62 74.33 79.07 73.62 80.42 72.76 81.77 71.87L82.09 71.66C83.41 70.78 84.67 69.84 85.91 68.83L86.15 68.63C86.33 68.48 86.51 68.33 86.68 68.17 86.96 68 86.96 68 87.31 68.04L87.7 68.16C89.56 68.67 91.13 68.78 92.92 67.95 94.32 67.15 95.15 66.09 95.72 64.59 95.87 64.03 95.89 63.49 95.89 62.91L95.88 62.39C95.87 62.01 95.83 61.69 95.75 61.33L95.72 60.88C96.31 60.23 96.99 59.66 97.65 59.08L98.24 58.51 98.24 58.21 98.5 58.1C98.9 57.88 99.18 57.61 99.51 57.28L99.89 56.89 100.29 56.49C100.42 56.36 100.55 56.22 100.69 56.09 101.36 55.42 102.01 54.73 102.63 54.01 102.84 53.76 102.84 53.76 103.09 53.52 103.32 53.32 103.32 53.32 103.29 53.02L103.59 53.02C103.8 52.78 103.99 52.54 104.19 52.29 104.64 51.73 105.09 51.19 105.57 50.67 106.4 49.76 107.14 48.79 107.89 47.82L108.14 47.5 108.91 46.49 109.15 46.18C109.38 45.89 109.6 45.59 109.82 45.3L110.04 45.01C110.46 44.47 110.46 44.47 110.56 43.81L111.01 43.66C111.22 43.41 111.22 43.41 111.42 43.1L111.65 42.74 111.9 42.35 112.16 41.94C113 40.61 113.8 39.25 114.57 37.88L114.74 37.58C116.55 34.39 118.16 30.44 117.24 26.74L116.8 26.74 116.8 26.44 117.09 26.44C116.78 25.31 116.06 24.46 115.08 23.82 111.17 21.8 106.13 23.3 102.13 24.31Z" fill="#5A4FCF"/>
        </svg>

        <p className="game-tag">Projeto Alpha</p>
        <h1 className="game-title">Cosmic Journey</h1>
        <p className="game-subtitle">
          Um shooter top-down procedural que venho codando na Unity desde o fim do ano passado. <br />
          Para esta versão web (mock), implementei um minijogo que reflete minha paixão por IA e algoritmos.
        </p>

        <div className="badge-row">
          <span className="badge">Godot Engine (Nova versão)</span>
          <span className="badge green">C#</span>
          <span className="badge yellow">Aseprite / Pixel Art</span>
        </div>

        <div className="scroll-hint">
          <span>experimente</span>
          <span>↓</span>
        </div>
      </section>

      <section id="play">
        <div className="container">
          <div className="play-tabs">
            <button className={`play-tab ${activeTab === 'browser' ? 'active' : ''}`} onClick={() => setActiveTab('browser')}>Navegador</button>
            <button className={`play-tab ${activeTab === 'download' ? 'active' : ''}`} onClick={() => setActiveTab('download')}>Baixar</button>
          </div>

          <div className={`play-panel ${activeTab === 'browser' ? 'active' : ''}`}>
            <div className="browser-frame reveal">
              <div className="browser-bar">
                <div className="browser-dot" style={{ background: '#ff5f56' }}></div>
                <div className="browser-dot" style={{ background: '#ffbd2e' }}></div>
                <div className="browser-dot" style={{ background: '#27c93f' }}></div>
                <div className="browser-url">play.cosmicstudios.dev/minijogo</div>
              </div>
              <div className="browser-content">
                <div className="tic-tac-wrapper">
                  <div className="tic-header">
                    <h3>Minimax Tic-Tac-Toe</h3>
                    <p>Você é o X. A IA (O) nunca perde.</p>
                  </div>
                  <div className={`tic-info ${gameState === 'draw' ? 'draw' : ''} ${gameState === 'x-win' || gameState === 'o-win' ? 'win' : ''}`}>
                    {gameState === 'playing' ? "Sua vez" : 
                     gameState === 'x-win' ? "Como você venceu? Impossível!" :
                     gameState === 'o-win' ? "A IA venceu!" :
                     "Deu Velha!"}
                  </div>

                  <div className="tic-board">
                    {board.map((cell, idx) => (
                      <div key={idx} className={getCellClass(idx)} onClick={() => handleCellClick(idx)}>
                        {cell}
                      </div>
                    ))}
                  </div>

                  <div className="tic-score">
                    <div className="tic-score-item"><span className="tic-score-lbl">Você (X)</span><span className="tic-score-val x">{scores.x}</span></div>
                    <div className="tic-score-item"><span className="tic-score-lbl">IA (O)</span><span className="tic-score-val o">{scores.o}</span></div>
                    <div className="tic-score-item"><span className="tic-score-lbl">Empates</span><span className="tic-score-val d">{scores.d}</span></div>
                  </div>

                  {gameState !== 'playing' && (
                    <button className="tic-btn" onClick={resetGame}>Tentar Novamente</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`play-panel ${activeTab === 'download' ? 'active' : ''}`}>
            <div className="download-grid">
              <div className="dl-card reveal">
                <div className="dl-icon">❖</div>
                <div>
                  <div className="dl-name">Cosmic Journey p/ Windows</div>
                  <div className="dl-meta">v0.1.4-alpha · 45MB</div>
                </div>
                <a href="#" className="dl-btn" onClick={(e) => { e.preventDefault(); alert('Em breve!'); }}>Baixar Instalador</a>
              </div>
              <div className="dl-card reveal" style={{ transitionDelay: '.1s' }}>
                <div className="dl-icon">📱</div>
                <div>
                  <div className="dl-name">Cosmic Journey Mobile</div>
                  <div className="dl-meta">Android APK · 32MB</div>
                </div>
                <a href="#" className="dl-btn out" onClick={(e) => { e.preventDefault(); alert('Em breve!'); }}>Baixar APK</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="details" style={{ padding: '40px 0 120px' }}>
        <div className="container">
          <div className="game-about-grid">
            <div className="game-desc reveal">
              <div className="sec-label">Sobre o jogo</div>
              <h2 className="sec-title" style={{ marginBottom: '24px', fontSize: '32px' }}>Desenvolvendo o <span className="accent">Cosmic Journey</span></h2>
              
              <p>O <strong>Cosmic Journey</strong> é meu projeto atual de aprendizado contínuo. Ele nasceu das minhas aulas no SENAI, onde decidi que queria fazer não apenas um jogo de plataforma genérico, mas algo com tiros, exploração procedural e armas malucas.</p>
              
              <p>Comecei o desenvolvimento nativo na <strong>Unity com C#</strong>, criando minha própria física de projéteis e um sistema rudimentar de geração de mapas. Toda a arte foi desenhada por mim no Aseprite, aprendendo teoria de cores e animação 2D na prática.</p>
            </div>

            <div className="game-info slide-left reveal" style={{ transitionDelay: '.2s' }}>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-key">Gênero</span>
                  <span className="info-val">Ação / Shooter Top-Down</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Status</span>
                  <span className="info-val">Em desenvolvimento (Alpha)</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Plataformas</span>
                  <span className="info-val">Windows, WebGL, Android</span>
                </div>
                <div className="info-item">
                  <span className="info-key">Dev / Arte</span>
                  <span className="info-val">Thalisson Rocha</span>
                </div>
              </div>

              <div className="tech-pills">
                <span className="tech-pill">Unity</span>
                <span className="tech-pill">Godot</span>
                <span className="tech-pill">C#</span>
                <span className="tech-pill">Aseprite</span>
                <span className="tech-pill">ProcGen</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
