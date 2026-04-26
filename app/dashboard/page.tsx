'use client';

import React, { useEffect, useState, useRef } from 'react';
import '../dishaai.css';

export default function LakshyaDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Intersection Observers for entrance animations
    const observerOptions = { threshold: 0.1 };
    
    const animateOnScroll = (selector: string, entranceStyles: any, animationStyles: any, delayFactor = 0.1) => {
      const elements = document.querySelectorAll(selector);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            Object.assign(target.style, animationStyles);
          }
        });
      }, observerOptions);

      elements.forEach((el, i) => {
        const target = el as HTMLElement;
        Object.assign(target.style, entranceStyles);
        target.style.transition = `opacity 0.5s ease ${i * delayFactor}s, transform 0.5s ease ${i * delayFactor}s, scale 0.5s ease ${i * delayFactor}s`;
        observer.observe(target);
      });
    };

    // Hero particles logic
    const createParticle = () => {
      if (!particlesRef.current) return;
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const dur = Math.random() * 8 + 6;
      const dx = (Math.random() - 0.5) * 200 + 'px';
      p.style.cssText = `left:${x}%;bottom:-20px;width:${size}px;height:${size}px;--dx:${dx};animation-duration:${dur}s;animation-delay:${Math.random() * 8}s;opacity:${Math.random() * 0.6 + 0.2}`;
      particlesRef.current.appendChild(p);
      setTimeout(() => p.remove(), (dur + 8) * 1000);
    };

    const particleInterval = setInterval(createParticle, 400);
    for (let i = 0; i < 15; i++) createParticle();

    // Initialise animations
    animateOnScroll('.hws', { opacity: '0', transform: 'translateX(-20px)' }, { opacity: '1', transform: 'translateX(0)' }, 0.12);
    animateOnScroll('.bc', { opacity: '0', transform: 'translateY(30px)' }, { opacity: '1', transform: 'translateY(0)' }, 0.08);
    animateOnScroll('.sbi', { opacity: '0', scale: '0.94' }, { opacity: '1', scale: '1' }, 0.1);

    return () => {
      clearInterval(particleInterval);
    };
  }, []);

  if (!mounted) return <div className="disha-theme" style={{ background: '#0a0e1a', minHeight: '100vh' }} />;

  return (
    <div className="disha-theme">
      {/* -- NAV -- */}
      <nav className="nav">
        <div className="nl">
          <div className="nl-ic">
            <svg viewBox="0 0 18 18" fill="none">
              <path d="M9 2v7M9 9l-4 5M9 9l4 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="9" cy="2" r="1.5" fill="#fff" fillOpacity=".7" />
            </svg>
          </div>
          <span className="nl-name">Lakshya<b></b></span>
        </div>
        <ul className="nlinks">
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Courses</a></li>
          <li><a href="#">Jobs</a></li>
          <li><a href="#">Profile</a></li>
        </ul>
        <div className="nr">
          <button className="btn-o">Settings</button>
          <button className="btn-f">Logout</button>
        </div>
      </nav>

      {/* -- DASHBOARD HERO -- */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-grid-bg"></div>
        <div className="hero-particles" ref={particlesRef}></div>

        <div className="hero-content">
          <div className="hl">
            <div className="h-kicker"><span className="hk-line"></span>Welcome back, Learner</div>
            <h1 className="h1">Your Career<br /><em>Dashboard.</em></h1>
            <p className="hdesc">Track your skill progress, build your AI resume, and apply to verified local jobs — all from your personalized command center.</p>
            <div className="hbtns">
              <button className="btn-hero">Resume Builder</button>
              <button className="btn-hero2">Skill Assessment</button>
            </div>
          </div>

          <div className="hr">
            <div className="hw-phone" style={{ maxHeight: '600px', overflow: 'hidden' }}>
              <div className="hwp-top">
                <span className="hwp-logo">Lakshya<b></b></span>
                <span className="hwp-tag">Student View</span>
              </div>
              <div className="hw-widget">
                <div className="hww-l">Overall Readiness</div>
                <div className="hww-val">82%</div>
                <div style={{ height: '5px', background: 'var(--line)', borderRadius: '3px', marginTop: '.65rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '82%', background: 'linear-gradient(90deg,var(--b1),var(--acc))', borderRadius: '3px' }}></div>
                </div>
              </div>
              <div className="hw-widget">
                <div className="hww-l">Top Matches</div>
                {["Data Analyst", "Field Sales", "Customer Support"].map((job, i) => (
                  <div className="job-item" key={i}>
                    <div className="ji-co">{job}</div>
                    <span className="ji-pct">9{2-i}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- STATS -- */}
      <section className="stats-band">
        <div className="sb-inner">
          <div className="sbi">
            <div className="sbi-n">12</div>
            <div className="sbi-l">Courses<br />In Progress</div>
          </div>
          <div className="sbi">
            <div className="sbi-n">86%</div>
            <div className="sbi-l">Interview<br />Score</div>
          </div>
          <div className="sbi">
            <div className="sbi-n">4</div>
            <div className="sbi-l">Job<br />Applications</div>
          </div>
          <div className="sbi">
            <div className="sbi-n">2</div>
            <div className="sbi-l">Digital<br />Credentials</div>
          </div>
        </div>
      </section>

      {/* -- BENTO FEATURES -- */}
      <section className="sec rv">
        <div className="wrap">
          <div className="ey ey-n">Tools for Success</div>
          <h2 className="sh">Unlock your <em>potential.</em></h2>
          <div className="bento">
            <div className="bc bc-bg-b">
              <div className="bc-ey bcey-b">AI Resume</div>
              <div className="bc-h bc-hb">Update Build</div>
              <div className="bc-p bc-pb">Your ATS-optimized profile is ready for download.</div>
              <div className="bc-n">01</div>
            </div>
            <div className="bc bc-bg-t">
              <div className="bc-ey bcey-t">Mock AI</div>
              <div className="bc-h bc-ht">Start Practice</div>
              <div className="bc-p bc-pt">Conduct a simulated interview in your chosen sector.</div>
              <div className="bc-n">02</div>
            </div>
            <div className="bc bc-bg-b2">
              <div className="bc-ey bcey-b">Skills</div>
              <div className="bc-h bc-hb">New Tracks</div>
              <div className="bc-p bc-pb">Explore 5 new courses added today.</div>
              <div className="bc-n">03</div>
            </div>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer className="sec" style={{ background: '#f8faff', padding: '3rem 0' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="nl-name" style={{ marginBottom: '1rem' }}>Lakshya<b></b></div>
          <p className="sp" style={{ margin: '0 auto' }}>© 2026 Lakshya Platform. Elevating the youth of India.</p>
        </div>
      </footer>
    </div>
  );
}
