import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ActivityStatus() {
  const [discordData, setDiscordData] = useState<any>(null);

  useEffect(() => {
    // Reveal Observer locally for this component
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // Lanyard WS for Discord & Spotify
    const userId = "1300515255226466545";
    const socket = new WebSocket('wss://api.lanyard.rest/socket');
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
        setDiscordData(msg.d);
      }
    };

    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      socket.close();
      obs.disconnect();
    };
  }, []);

  // Compute status formatting
  let discordStatusClass = "status-dot off";
  let dsMain = "Offline";
  let dsSub = "Indisponível";

  if (discordData) {
    if (discordData.discord_status === 'online') discordStatusClass = "status-dot";
    else if (discordData.discord_status === 'idle') discordStatusClass = "status-dot idle";
    else if (discordData.discord_status === 'dnd') discordStatusClass = "status-dot dnd";

    const activities = discordData.activities.filter((a: any) => a.type === 0); // Playing
    const playing = activities.length > 0 ? activities[0] : null;

    if (playing) {
      dsMain = playing.name;
      dsSub = playing.details || playing.state || "Em jogo";
    } else {
      dsMain = "Disponível";
      dsSub = "Nenhum jogo aberto";
    }
  }

  const spotify = discordData?.spotify;

  return (
    <div className="status-grid">
      {/* Discord Status */}
      <div className="status-card reveal" id="discord-card">
        <div className="status-icon">🎮</div>
        <div className="status-body">
          <div className="status-source">Discord · Thalisson_rr</div>
          <div className="status-main" id="discord-status">{discordData ? dsMain : "Carregando..."}</div>
          <div className="status-sub" id="discord-activity">{discordData ? dsSub : "aguardando dados"}</div>
        </div>
        <div className={discordStatusClass} id="discord-dot"></div>
      </div>

      {/* Music Status */}
      <div className="status-card reveal" style={{ transitionDelay: '.1s' }} id="music-card">
        <div className="status-icon">🎵</div>
        <div className="status-body">
          <div className="status-source">{spotify ? "Spotify · Ouvindo Agora" : "Música"}</div>
          <div className="status-main" id="music-track">{spotify ? spotify.song : "Nada no momento"}</div>
          <div className="status-sub" id="music-artist">{spotify ? `de ${spotify.artist}` : "-"}</div>
        </div>
        {spotify && (
          <div className="music-bar" id="music-bar">
            <span></span><span></span><span></span><span></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  
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

  return (
    <>
      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-glow"></div>

        <svg className="hero-logo-mark" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M69.28 12.55C69.99 12.61 70.71 12.67 71.42 12.71L71.98 12.74 73.1 12.81C74.05 12.87 74.91 12.98 75.83 13.23 76.09 13.29 76.35 13.34 76.61 13.39 83.5 14.77 90.34 17.19 95.94 21.56L96.31 21.84 96.68 22.22C97.44 22.54 97.87 22.28 98.61 21.99L99.14 21.77 100.18 21.36 100.69 21.15C101.38 20.89 102.07 20.69 102.78 20.49L103.29 20.06 103.71 20.09C104.47 20.08 105.18 19.88 105.92 19.7 107.07 19.42 108.18 19.2 109.38 19.17L109.38 18.88C114.33 18.66 114.33 18.66 116.6 18.78L116.91 18.8C117.44 18.83 117.68 18.87 118.13 19.17L118.88 19.42C120.42 19.97 121.57 20.91 122.44 22.29 123.85 25.34 123.2 28.7 122.1 31.73 121.65 32.94 121.11 34.09 120.51 35.22L120.1 36.02C118.88 38.39 117.41 40.63 115.91 42.83L115.67 43.18C115.34 43.65 115.01 44.12 114.66 44.57L114.37 44.95C114.28 45.05 114.21 45.15 114.12 45.25 113.7 46.25 114.36 47.72 114.62 48.71 117.35 59.44 116.23 70.93 111.45 80.92L111.31 81.23C109.39 85.31 106.78 89.03 103.72 92.33L102.84 93.39C102.18 94.11 102.18 94.11 101.66 94.28L101.66 94.58C101.47 94.77 101.47 94.77 101.19 95 101.08 95.1 100.98 95.19 100.86 95.28L100.47 95.62 100.01 96.02C98.999 96.91 97.97 97.73 96.88 98.5 96.45 98.81 96.16 99.04 95.87 99.48L95.57 99.48C95.2 99.71 94.83 99.95 94.47 100.19 91.07 102.41 87.42 104.3 83.55 105.56L83.12 105.7C74.76 108.38 66.25 108.57 57.72 106.6L57.38 106.53C51.98 105.34 46.87 102.59 42.4 99.41L42.05 99.17 41.29 98.47C40.85 98.02 40.46 97.69 39.91 97.4 39.06 97.41 38.35 97.69 37.58 97.99L36.93 98.22 35.95 98.56 32.89 99.42L32.43 99.53C31.79 99.68 31.22 99.79 30.55 99.77L30.41 100.07C30.12 100.12 30.12 100.12 29.75 100.15L28.15 100.33C23.6 101 18.09 101.3 14.16 98.44L13.78 98.14 13.45 97.88C12.47 97.02 11.62 95.54 11.34 94.26L11.26 93.98 10.96 93.84 11.04 93.54C11.11 93.11 11.11 92.71 11.09 92.27 10.98 88.81 12.31 85.56 13.93 82.55L14.19 82.06C16.25 78.3 19 74.89 21.81 71.66L22.54 70.68C22.44 70.26 22.33 69.84 22.21 69.43 20.06 61.57 20.99 52.92 23.55 45.27L23.68 44.89 23.79 44.55C23.89 44.24 23.89 44.24 23.88 43.81L24.17 43.81 24.25 43.57C26.07 37.98 29.4 33.11 33.15 28.65L33.59 28.1 34.12 27.48 34.41 27.48 34.41 27.19 34.71 27.19 34.82 26.93C35.42 25.85 36.6 25.01 37.53 24.22L37.91 23.89C41.24 21.05 47.82 15.61 52.38 15.61L52.52 15.31C52.81 15.21 52.81 15.21 53.2 15.12 53.87 14.95 54.53 14.74 55.19 14.52 59.11 13.27 63.23 12.76 67.34 12.66L68.02 12.56 69.28 12.55Z" fill="#5A4FCF"/>
        </svg>

        <p className="hero-eyebrow">Cosmic Studios · Thalisson Rodrigues Rocha</p>

        <h1 className="hero-title">
          Game Dev.<br />
          <span className="line2">IoT. Web.</span>
        </h1>

        <p className="hero-sub">
          Do firmware à interface. Do jogo ao dashboard.<br />
          <b>Generalista</b> de verdade — do hardware ao pixel.
        </p>

        <div className="hero-btns">
          <a className="btn btn-primary" href="#projects">Ver Projetos</a>
          <a className="btn btn-outline" href="#about">Sobre mim</a>
        </div>

        <div className="hero-scroll">
          <span>scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      <hr className="hr-fade" />

      {/* ABOUT */}
      <section id="about">
        <div className="container">
          <div className="sec-header reveal">
            <p className="sec-label">Sobre</p>
            <h2 className="sec-title">Quem é o <span className="accent">Thalisson</span>?</h2>
          </div>

          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                Tenho <span className="hi">17 anos</span>, sou de <strong>Uberlândia, MG</strong> e desde os 13 construo coisas com o que tiver em mãos — literalmente. Durante a pandemia montei um <strong>sistema RF caseiro</strong> com peças de impressora e brinquedos pra controlar luz e trava de porta.
              </p>
              <p>
                Hoje estudo <strong>Engenharia da Computação</strong> na Anhanguera/Pitágoras e tenho o técnico em <strong>Desenvolvimento de Jogos Digitais</strong> pelo SENAI concluído. Minha filosofia é simples: <span className="hi">sei um pouco de tudo e domino o que importa no momento.</span>
              </p>
              <p>
                Minhas áreas de foco são <strong>Game Dev</strong> (Unity, Godot), <strong>IoT e Sistemas Embarcados</strong> (ESP32, C++, MQTT), <strong>Web Frontend</strong> e <strong>Eletrônica Avançada</strong>.
              </p>
              <code className="about-quip">if(funcionando)&#123; NaoMecher(); &#125;</code>

              <div className="skill-list" style={{ marginTop: '28px' }}>
                <span className="skill-tag core">C++</span>
                <span className="skill-tag core">C#</span>
                <span className="skill-tag core">Unity</span>
                <span className="skill-tag core">Godot</span>
                <span className="skill-tag core">ESP32</span>
                <span className="skill-tag core">MQTT</span>
                <span className="skill-tag">JavaScript</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">Lua</span>
                <span className="skill-tag">Firebase</span>
                <span className="skill-tag">Blender</span>
                <span className="skill-tag">Git</span>
                <span className="skill-tag">HTML5/CSS3</span>
                <span className="skill-tag">Inkscape</span>
                <span className="skill-tag">Krita</span>
              </div>
            </div>

            <div className="about-stats reveal" style={{ transitionDelay: '.15s' }}>
              <div className="stat-card">
                <span className="stat-num">4+</span>
                <span className="stat-label">anos construindo projetos reais</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">2</span>
                <span className="stat-label">formações concluída / cursando</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">∞</span>
                <span className="stat-label">projetos começados às 2h da manhã</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">1</span>
                <span className="stat-label">jogo publicado em alpha</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="hr-fade" />

      {/* STATUS */}
      <section id="status">
        <div className="container" style={{ paddingTop: '80px' }}>
          <div className="sec-header reveal">
            <p className="sec-label">Ao Vivo</p>
            <h2 className="sec-title">O que estou <span className="accent">fazendo agora</span></h2>
          </div>

          <ActivityStatus />
        </div>
      </section>

      <hr className="hr-fade" style={{ marginTop: '80px' }} />

      {/* PROJECTS */}
      <section id="projects" style={{ paddingTop: '80px' }}>
        <div className="container">
          <div className="sec-header reveal">
            <p className="sec-label">Portfólio</p>
            <h2 className="sec-title">Projetos <span className="accent">em destaque</span></h2>
            <p className="sec-desc">Clique num projeto para ver mais detalhes, baixar ou jogar.</p>
          </div>

          <div className="projects-grid">
            {/* COSMIC JOURNEY */}
            <Link className="project-card reveal" to="/project/cosmic-journey">
              <div className="project-thumb">
                <div className="project-thumb-bg" style={{ background: 'radial-gradient(ellipse at center, #5A4FCF44 0%, #08070a 70%)' }}></div>
                <div className="project-thumb-inner">
                  <div className="project-icon">
                    <svg width="80" height="80" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M69.28 12.55C69.99 12.61 70.71 12.67 71.42 12.71L71.98 12.74 73.1 12.81C74.05 12.87 74.91 12.98 75.83 13.23 76.09 13.29 76.35 13.34 76.61 13.39 83.5 14.77 90.34 17.19 95.94 21.56L96.31 21.84 96.68 22.22C97.44 22.54 97.87 22.28 98.61 21.99L99.14 21.77 100.18 21.36 100.69 21.15C101.38 20.89 102.07 20.69 102.78 20.49L103.29 20.06 103.71 20.09C104.47 20.08 105.18 19.88 105.92 19.7 107.07 19.42 108.18 19.2 109.38 19.17L109.38 18.88C114.33 18.66 114.33 18.66 116.6 18.78L116.91 18.8C117.44 18.83 117.68 18.87 118.13 19.17L118.88 19.42C120.42 19.97 121.57 20.91 122.44 22.29 123.85 25.34 123.2 28.7 122.1 31.73 121.65 32.94 121.11 34.09 120.51 35.22L120.1 36.02C118.88 38.39 117.41 40.63 115.91 42.83L115.67 43.18C115.34 43.65 115.01 44.12 114.66 44.57L114.37 44.95C114.28 45.05 114.21 45.15 114.12 45.25 113.7 46.25 114.36 47.72 114.62 48.71 117.35 59.44 116.23 70.93 111.45 80.92L111.31 81.23C109.39 85.31 106.78 89.03 103.72 92.33L102.84 93.39C102.18 94.11 102.18 94.11 101.66 94.28L101.66 94.58C101.47 94.77 101.47 94.77 101.19 95 101.08 95.1 100.98 95.19 100.86 95.28L100.47 95.62 100.01 96.02C98.999 96.91 97.97 97.73 96.88 98.5 96.45 98.81 96.16 99.04 95.87 99.48L95.57 99.48C95.2 99.71 94.83 99.95 94.47 100.19 91.07 102.41 87.42 104.3 83.55 105.56L83.12 105.7C74.76 108.38 66.25 108.57 57.72 106.6L57.38 106.53C51.98 105.34 46.87 102.59 42.4 99.41L42.05 99.17 41.29 98.47C40.85 98.02 40.46 97.69 39.91 97.4 39.06 97.41 38.35 97.69 37.58 97.99L36.93 98.22 35.95 98.56 32.89 99.42L32.43 99.53C31.79 99.68 31.22 99.79 30.55 99.77L30.41 100.07C30.12 100.12 30.12 100.12 29.75 100.15L28.15 100.33C23.6 101 18.09 101.3 14.16 98.44L13.78 98.14 13.45 97.88C12.47 97.02 11.62 95.54 11.34 94.26L11.26 93.98 10.96 93.84 11.04 93.54C11.11 93.11 11.11 92.71 11.09 92.27 10.98 88.81 12.31 85.56 13.93 82.55L14.19 82.06C16.25 78.3 19 74.89 21.81 71.66L22.54 70.68C22.44 70.26 22.33 69.84 22.21 69.43 20.06 61.57 20.99 52.92 23.55 45.27L23.68 44.89 23.79 44.55C23.89 44.24 23.89 44.24 23.88 43.81L24.17 43.81 24.25 43.57C26.07 37.98 29.4 33.11 33.15 28.65L33.59 28.1 34.12 27.48 34.41 27.48 34.41 27.19 34.71 27.19 34.82 26.93C35.42 25.85 36.6 25.01 37.53 24.22L37.91 23.89C41.24 21.05 47.82 15.61 52.38 15.61L52.52 15.31C52.81 15.21 52.81 15.21 53.2 15.12 53.87 14.95 54.53 14.74 55.19 14.52 59.11 13.27 63.23 12.76 67.34 12.66L68.02 12.56 69.28 12.55Z" fill="#5A4FCF" />
                    </svg>
                  </div>
                </div>
                <div className="project-tag-row">
                  <span className="project-tag active">Alpha Pública</span>
                  <span className="project-tag">Unity</span>
                </div>
              </div>
              <div className="project-body">
                <h3 className="project-title">Cosmic Journey</h3>
                <p className="project-desc">Jogo top-down pixel art de ação em desenvolvimento ativo. Alpha disponível para jogar no navegador ou baixar. Arte, código e design 100% autorais.</p>
                <div className="project-footer">
                  <div className="project-stack">
                    <span className="stack-dot" style={{ background: '#5A4FCF' }} title="Unity/C#"></span>
                    <span className="stack-dot" style={{ background: '#3DDC84' }} title="Godot"></span>
                    <span className="stack-dot" style={{ background: '#ff6b6b' }} title="Arte autoral"></span>
                  </div>
                  <span className="project-cta">Ver projeto →</span>
                </div>
              </div>
            </Link>

            {/* GUBER-LAB */}
            <a className="project-card reveal" href="#" style={{ transitionDelay: '.1s' }} onClick={(e) => { e.preventDefault(); alert('Em breve!'); }}>
              <div className="project-thumb">
                <div className="project-thumb-bg" style={{ background: 'radial-gradient(ellipse at center, #E7352C44 0%, #08070a 70%)' }}></div>
                <div className="project-thumb-inner" style={{ fontSize: '64px' }}>🔌</div>
                <div className="project-tag-row">
                  <span className="project-tag active">Live</span>
                  <span className="project-tag">IoT</span>
                </div>
              </div>
              <div className="project-body">
                <h3 className="project-title">GUBER-LAB</h3>
                <p className="project-desc">Dashboard IoT com controle de 8 relés via ESP32, MQTT/HiveMQ, Firebase Auth e automações agendadas. End-to-end do firmware ao front-end.</p>
                <div className="project-footer">
                  <div className="project-stack">
                    <span className="stack-dot" style={{ background: '#E7352C' }} title="ESP32/C++"></span>
                    <span className="stack-dot" style={{ background: '#FFCA28' }} title="Firebase"></span>
                    <span className="stack-dot" style={{ background: '#660066' }} title="MQTT"></span>
                    <span className="stack-dot" style={{ background: '#f7df1e' }} title="JavaScript"></span>
                  </div>
                  <span className="project-cta">Em breve →</span>
                </div>
              </div>
            </a>

            {/* Sistema RF */}
            <a className="project-card reveal" href="#" style={{ transitionDelay: '.2s' }} onClick={(e) => { e.preventDefault(); alert('Em breve!'); }}>
              <div className="project-thumb">
                <div className="project-thumb-bg" style={{ background: 'radial-gradient(ellipse at center, #fbbf2444 0%, #08070a 70%)' }}></div>
                <div className="project-thumb-inner" style={{ fontSize: '64px' }}>📡</div>
                <div className="project-tag-row">
                  <span className="project-tag">Hardware</span>
                  <span className="project-tag">2020</span>
                </div>
              </div>
              <div className="project-body">
                <h3 className="project-title">Sistema RF Caseiro</h3>
                <p className="project-desc">Construído com 13 anos durante a pandemia com peças recicladas. Transmitia sinais para controlar luz e trava de porta à distância — zero kit pronto.</p>
                <div className="project-footer">
                  <div className="project-stack">
                    <span className="stack-dot" style={{ background: '#fbbf24' }} title="Eletrônica"></span>
                    <span className="stack-dot" style={{ background: '#9d98b8' }} title="Hardware"></span>
                  </div>
                  <span className="project-cta">Em breve →</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="container">
          <div className="sec-header reveal">
            <p className="sec-label">Contato</p>
            <h2 className="sec-title">Vamos bater <span className="accent">um papo</span></h2>
          </div>

          <div className="contact-grid">
            <div className="contact-text reveal">
              <p>
                Seja para falar sobre Game Dev, tirar uma dúvida de IoT, discutir um projeto de Hardware ou avaliar oportunidades de trabalho. Costumo responder mais rápido pelo Discord!
              </p>
              <p>
                Email direto: <br />
                <a href="mailto:thalissonrodriguesrocha08@gmail.com">thalissonrodriguesrocha08@gmail.com</a>
              </p>
            </div>

            <div className="socials-list reveal" style={{ transitionDelay: '.15s' }}>
              <a className="social-link" href="https://github.com/gubernavit" target="_blank" rel="noreferrer">
                <span className="s-icon">🐙</span>
                <div>
                  <span className="s-name">GitHub</span>
                  <span className="s-handle">@gubernavit</span>
                </div>
                <span className="s-arrow">→</span>
              </a>
              <a className="social-link" href="https://www.instagram.com/thalisson_rr" target="_blank" rel="noreferrer">
                <span className="s-icon">📸</span>
                <div>
                  <span className="s-name">Instagram</span>
                  <span className="s-handle">@thalisson_rr</span>
                </div>
                <span className="s-arrow">→</span>
              </a>
              <a className="social-link" href="https://discord.com/users/1300515255226466545" target="_blank" rel="noreferrer">
                <span className="s-icon">🎮</span>
                <div>
                  <span className="s-name">Discord</span>
                  <span className="s-handle">Thalisson_rr</span>
                </div>
                <span className="s-arrow">→</span>
              </a>
              <a className="social-link" href="https://gubernavit.itch.io" target="_blank" rel="noreferrer">
                <span className="s-icon">👾</span>
                <div>
                  <span className="s-name">itch.io</span>
                  <span className="s-handle">gubernavit.itch.io</span>
                </div>
                <span className="s-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
