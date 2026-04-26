'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import './dishaai.css';

export default function LakshyaLandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    animateOnScroll('.oc-card', { opacity: '0', transform: 'translateY(20px)' }, { opacity: '1', transform: 'translateY(0)' }, 0.05);
    animateOnScroll('.rv', { opacity: '0', transform: 'translateY(30px)' }, { opacity: '1', transform: 'translateY(0)' }, 0.1);

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
        <ul className="nlinks" style={{ display: window.innerWidth < 768 ? (mobileMenuOpen ? 'flex' : 'none') : 'flex' }}>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Platform</a></li>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Skill Tracks</a></li>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>For Organisations</a></li>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>For Learners</a></li>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Impact</a></li>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>About</a></li>
        </ul>
        <div className="nr" style={{ display: window.innerWidth < 768 && mobileMenuOpen ? 'none' : 'flex' }}>
          <button className="btn-o">Sign in</button>
          <button className="btn-f">See Tutorial</button>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: window.innerWidth < 768 ? 'flex' : 'none', background: 'none', border: 'none', color: '#0a0e1a', cursor: 'pointer', fontSize: '1.5rem', padding: 0 }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* -- HERO -- */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-grid-bg"></div>
        <div className="hero-particles" ref={particlesRef}></div>

        <div className="hero-content">
          <div className="hl">
            <div className="h-kicker"><span className="hk-line"></span>AI-powered skill development</div>
            <h1 className="h1">Train youth.<br /><em>Build careers.</em><span style={{ color: '#fff' }}>Create livelihoods.</span></h1>
            <p className="hdesc">Lakshya is a <b>full-stack career readiness platform</b> that takes a learner from skill
              training to job placement — with AI-powered assessments, resume building, ai driven interviews, and real-time
              job matching, all in one place.</p>
            <div className="hbtns">
              <button className="btn-hero">Get started free</button>
              <button className="btn-hero2">See how it works →</button>
            </div>
            <div className="h-stats">
              <div className="hs">
                <div className="hs-n">50K+</div>
                <div className="hs-l">Learners trained<br />on the platform</div>
              </div>
              <div className="hs">
                <div className="hs-n">78%</div>
                <div className="hs-l">Placed within<br />60 days</div>
              </div>
              <div className="hs">
                <div className="hs-n">125+</div>
                <div className="hs-l">Hiring partners<br />on network</div>
              </div>
            </div>
          </div>

          <div className="hr">
            <div className="ai-dashboard">
              <div className="dash-header">
                <span className="dash-logo">Lakshya-The AI Partner<b></b></span>
              </div>
              <div className="dash-video">
                <video autoPlay muted loop playsInline>
                  <source src="video/VN20260424_233725.mp4" type="video/mp4" />
                </video>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.75rem 0 0', borderTop: '1px solid rgba(100,150,255,.1)', marginTop: '.5rem' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* -- TICKER -- */}
      <div className="ticker">
        <div className="tick-track">
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              <span className="ti"><span className="ti-sq"></span>Skill Development</span>
              <span className="ti"><span className="ti-sq"></span>Career Growth</span>
              <span className="ti"><span className="ti-sq"></span>Job Readiness</span>
              <span className="ti"><span className="ti-sq"></span>Livelihood Opportunities</span>
              <span className="ti"><span className="ti-sq"></span>Youth Empowerment</span>
              <span className="ti"><span className="ti-sq"></span>Digital Skills</span>
              <span className="ti"><span className="ti-sq"></span>Placement Opportunities</span>
              <span className="ti"><span className="ti-sq"></span>Workforce Development</span>
              <span className="ti"><span className="ti-sq"></span>Employability Enhancement</span>
              <span className="ti"><span className="ti-sq"></span>Income Generation</span>
              <span className="ti"><span className="ti-sq"></span>Capacity Building</span>
              <span className="ti"><span className="ti-sq"></span>Economic Empowerment</span>
              <span className="ti"><span className="ti-sq"></span>Self Reliance</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* -- AI STRIP -- */}
      <div className="ai-strip">
        <div className="ai-strip-inner">
          {[
            { 
              title: "AI Resume Builder", 
              desc: "ATS-optimised resume generated in under 3 minutes from your profile", 
              icon: <path d="M7 10h6M10 7v6" />, 
              dots: ["b", "t", "g"] 
            },
            { 
              title: "Ai - Driven Interviews", 
              desc: "Voice AI conducts practice rounds with real-time feedback and scoring", 
              icon: <g><circle cx="10" cy="8" r="3" /><path d="M5 15c0-2 2-3 5-3s5 1 5 3" /></g>, 
              dots: ["b", "l", "t"] 
            },
            { 
              title: "Job Matching", 
              desc: "AI surfaces nearby openings ranked by skill compatibility score", 
              icon: <path d="M4 14l4-4 4 4 4-10" />, 
              dots: ["b", "l", "l"] 
            },
            { 
              title: "Ai-recommended courses", 
              desc: "Discover courses that match your skills and interests", 
              icon: <path d="M10 4l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" />, 
              dots: ["l", "l", "t"] 
            }
          ].map((item, idx) => (
            <div className="ai-card" key={idx}>
              <div className="ai-card-icon">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="4" fill="rgba(255,255,255,0.8)" />
                  {React.cloneElement(item.icon as React.ReactElement, { stroke: "#3b82f6", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })}
                </svg>
              </div>
              <div className="ai-card-title">{item.title}</div>
              <div className="ai-card-desc">{item.desc}</div>
              <div className="ai-dots">
                {item.dots.map((d, i) => <span key={i} className={`ai-dot ai-dot-${d}`}></span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- ILLUSTRATION BAND -- */}
      <div className="illus-band">
        <div className="illus-band-inner">
          {[
            { img: "image/img-1.jpg", title: "AI-Guided Learning", desc: "Personalized skill tracks powered by intelligent mentoring. Learn faster with smart AI guidance." },
            { img: "image/img-2.png", title: "Job Placement", desc: "AI-matched to verified openings near you. Get shortlisted faster based on your profile." },
            { img: "image/img-3.jpg", title: "AI Interviews", desc: "Practice real interview scenarios with AI-driven feedback. Improve confidence, answers, and communication skills instantly." }
          ].map((item, idx) => (
            <div className="illus-item" key={idx}>
              <img src={item.img} alt={item.title} />
              <div className="illus-caption">
                <strong>{item.title}</strong>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- WHO IS IT FOR -- */}
      <section className="sec rv">
        <div className="wrap">
          <h2 className="sh" style={{ marginBottom: '2.5rem' }}>Built for every person <em>on the path.</em></h2>
          <div className="for-grid">
            <div className="fg">
              <div className="fg-icon fgi-b">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--b1)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
                </svg>
              </div>
              <span className="fg-tag fgt-b">For Learners</span>
              <div className="fg-h">Build your future.</div>
              <p className="fg-p">The all-in-one platform to learn, track progress, and get hired.</p>
              <div className="fg-list">
                <div className="fgl">Create a digital profile in minutes.</div>
                <div className="fgl">Access high-quality local skill tracks.</div>
                <div className="fgl">Get match-ranked for nearby jobs.</div>
              </div>
            </div>

            <div className="fg">
              <div className="fg-icon fgi-t">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00897b" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <span className="fg-tag fgt-t">For Organisations</span>
              <div className="fg-h">Scale your impact.</div>
              <p className="fg-p">Comprehensive tools to manage vocational programs and tracking.</p>
              <div className="fg-list">
                <div className="fgl">Monitor learner progress in real-time.</div>
                <div className="fgl">Automate assessments and certification.</div>
                <div className="fgl">Access data-driven placement insights.</div>
              </div>
            </div>

            <div className="fg">
              <div className="fg-icon fgi-i">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 21h18M3 7v14M21 7v14M9 21V11M15 21V11M3 7l9-4 9 4" />
                </svg>
              </div>
              <span className="fg-tag fgt-i">For Employers</span>
              <div className="fg-h">Hire with confidence.</div>
              <p className="fg-p">Find pre-vetted, work-ready talent matched to your specific needs.</p>
              <div className="fg-list">
                <div className="fgl">Direct access to skilled graduates.</div>
                <div className="fgl">Verify credentials instantly.</div>
                <div className="fgl">Streamline your entry-level hiring.</div>
              </div>
            </div>

            <div className="fg">
              <div className="fg-icon fgi-s">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                </svg>
              </div>
              <span className="fg-tag fgt-s">Features & AI</span>
              <div className="fg-h">Smart AI tools.</div>
              <p className="fg-p">Intelligent career tools designed for the modern Indian workforce.</p>
              <div className="fg-list">
                <div className="fgl">Voice-enabled AI Interviewer.</div>
                <div className="fgl">Intelligent Resume Builder.</div>
                <div className="fgl">Career roadmap generation.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS -- */}
      <section className="sec rv" style={{ background: 'var(--s)' }}>
        <div className="wrap">
          <div className="ey ey-n">How it works</div>
          <h2 className="sh">The complete journey, <em>end to end.</em></h2>
          <div className="hw-layout">
            <div className="hwl">
              <p className="sp" style={{ marginBottom: '2rem' }}> Lakshya covers the entire lifecycle — from the moment a learner walks in to the day they receive their first salary.</p>
              <div className="hw-steps">
                {[
                  { n: 1, t: "Register&amp;onboard", d: "Learners create a profile through voice or text in Hindi, English, or regional languages. AI captures background, goals, and preferences." },
                  { n: 2, t: "Choose a skill track", d: "AI recommends the most relevant course based on the learner's profile and local job market demand." },
                  { n: 3, t: "Train, assess, and grow", d: "Complete structured learning modules with AI-driven assessments. Weekly progress is tracked." },
                  { n: 4, t: "Get certified", d: "On completion, learners receive a verifiable digital credential. AI instantly generates an ATS-optimised resume." },
                  { n: 5, t: "Match to a job&amp;get placed", d: "The AI jobs engine surfaces nearby openings. Employers review profiles and schedule interviews." }
                ].map((step) => (
                  <div className="hws" key={step.n}>
                    <div className={`hwsn hwsn-${step.n}`}>{step.n}</div>
                    <div>
                      <div className="hws-title">{step.t}</div>
                      <div className="hws-desc">{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hwr">
              <div className="hw-phone">
                <div className="hwp-top">
                  <span className="hwp-logo">Lakshya<b></b></span>
                  <span className="hwp-tag">Student Dashboard</span>
                </div>
                <div className="hw-widget">
                  <div className="hww-l">Profile completion</div>
                  <div className="hww-val">78<span style={{ fontSize: '.8rem', color: 'var(--ink3)' }}>%</span></div>
                  <div className="hww-sub">Add work experience to reach 90%</div>
                  <div style={{ height: '5px', background: 'var(--line)', borderRadius: '3px', marginTop: '.65rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg,var(--b1),var(--acc))', borderRadius: '3px' }}></div>
                  </div>
                </div>
                <div className="hw-widget">
                  <div className="hww-l">Skill progress</div>
                  <div className="bar-row"><span className="br-name">Digital literacy</span>
                    <div className="br-track"><div className="br-fill" style={{ width: '88%' }}></div></div><span className="br-pct">88%</span>
                  </div>
                  <div className="bar-row"><span className="br-name">Communication</span>
                    <div className="br-track"><div className="br-fill" style={{ width: '72%' }}></div></div><span className="br-pct">72%</span>
                  </div>
                  <div className="bar-row"><span className="br-name">Interview skills</span>
                    <div className="br-track"><div className="br-fill" style={{ width: '65%' }}></div></div><span className="br-pct">65%</span>
                  </div>
                </div>
                <div className="hw-widget">
                  {["Urban Company", "Zomato", "Tata Projects"].map((co, i) => (
                    <div className="job-item" key={i}>
                      <div><div className="ji-co">{co}</div><div className="ji-role">Sector Partner</div></div>
                      <span className="ji-pct">9{4-i}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* -- THE LEARNING JOURNEY -- */}
      <section className="journey-sec rv">
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
            <div className="ey" style={{ color: 'var(--b1)', marginBottom: 0 }}>THE LEARNING JOURNEY</div>
            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }}></div>
          </div>
          
          <div className="journey-wrap">
            {[
              { t: "Register & Onboard", d: "Voice or text, any language", ic: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Person with waving arm */}
                  <circle cx="30" cy="22" r="8" fill="var(--b1)" opacity="0.4" />
                  <path d="M22 45 c0 -8 16 -8 16 0" stroke="var(--b1)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                  <path d="M38 22 l6 -6" stroke="var(--b1)" strokeWidth="3" strokeLinecap="round" />
                  {/* Form icon overlay */}
                  <rect x="12" y="32" width="16" height="12" rx="2" fill="white" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M15 35 h10M15 38 h6" stroke="var(--b1)" strokeWidth="1.2" />
                </svg>
              )},
              { t: "AI Skill Training", d: "Personalised learning tracks", ic: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Open Book */}
                  <path d="M30 42 v-22" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M30 42 c-8-1-14-1-16 0 v-22 c2-1 8-1 16 0 c8-1 14-1 16 0 v22 c-2-1-8-1-16 0" fill="var(--b1)" opacity="0.1" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M18 24 h8M18 28 h6M34 24 h8M34 28 h6" stroke="var(--b1)" strokeWidth="1" opacity="0.5" />
                  {/* Star */}
                  <path d="M48 18 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5-3 l-3-1.5 l3-1.5 z" fill="var(--b1)" />
                </svg>
              )},
              { t: "Mock Interviews", d: "AI voice feedback & scoring", ic: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Microphone */}
                  <rect x="25" cy="18" width="10" height="15" rx="5" fill="#00897b" opacity="0.2" stroke="#00897b" strokeWidth="2" />
                  <path d="M20 28 a10 10 0 0 0 20 0" stroke="#00897b" strokeWidth="2" strokeLinecap="round" />
                  <path d="M30 38 v4M25 42 h10" stroke="#00897b" strokeWidth="2" strokeLinecap="round" />
                  {/* Score Badge */}
                  <rect x="38" y="12" width="20" height="11" rx="3" fill="#00897b" />
                  <text x="48" y="20" textAnchor="middle" fill="white" fontSize="5" fontWeight="800">86/100</text>
                  <text x="48" y="25" textAnchor="middle" fill="#00897b" fontSize="4" fontWeight="600">Interview</text>
                </svg>
              )},
              { t: "Get Certified", d: "Verifiable digital credential", ic: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Certificate Card */}
                  <rect x="15" y="18" width="30" height="20" rx="3" fill="var(--b1)" opacity="0.1" stroke="var(--b1)" strokeWidth="1.2" />
                  <text x="30" y="26" textAnchor="middle" fill="var(--b1)" fontSize="4" fontWeight="800">Certificate</text>
                  <text x="30" y="32" textAnchor="middle" fill="var(--ink3)" fontSize="2.5">Digital Skills - 2025</text>
                  {/* Seal */}
                  <circle cx="30" cy="38" r="6" fill="white" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M27 38 l2 2 l4-4" stroke="var(--b1)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )},
              { t: "Get Placed", d: "Matched & hired locally", ic: (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  {/* Trophy */}
                  <path d="M22 20 h16 v12 a8 8 0 0 1 -16 0 z" fill="var(--b1)" opacity="0.1" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M22 24 h-4 v4 a4 4 0 0 0 4 0 zM38 24 h4 v4 a4 4 0 0 1 -4 0 z" stroke="var(--b1)" strokeWidth="1.5" />
                  <path d="M30 32 v6M24 38 h12" stroke="var(--b1)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M30 23 l1 2 l2 1 l-2 1 l-1 2 l-1-2 l-2-1 l2-1 z" fill="var(--b1)" />
                  {/* Placed Badge */}
                  <rect x="42" y="10" width="16" height="11" rx="3" fill="white" stroke="var(--b1)" strokeWidth="0.5" />
                  <text x="50" y="16" textAnchor="middle" fill="var(--b1)" fontSize="4" fontWeight="800">Placed!</text>
                  <text x="50" y="20" textAnchor="middle" fill="var(--ink3)" fontSize="2.5">Voisys - Pune</text>
                </svg>
              )}
            ].map((step, i) => (
              <div className="j-item" key={i}>
                <div className="j-icon-w">
                  {step.ic}
                </div>
                <div className="j-title">{step.t}</div>
                <div className="j-desc">{step.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- PLATFORM FEATURES (BENTO) -- */}
      <section className="sec rv">
        <div className="wrap">
          <div className="ey ey-n">Platform features</div>
          <h2 className="sh">Everything in one place. <span style={{ color: 'var(--b2)' }}>Nothing missing.</span></h2>
          <div className="bento">
            {/* -- 01: AI RESUME BUILDER -- */}
            <div className="bc bc-bg-b bc-span-4">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem' }}>
                <div>
                  <div className="bc-ey bcey-b">AI RESUME BUILDER</div>
                  <div className="bc-h bc-hb">A professional, ATS-ready resume<br />generated in under 3 minutes.</div>
                  <p className="bc-p bc-pb">No writing experience needed. Lakshya reads the learner's profile and generates a keyword-optimised resume tailored to their target industry — across 20+ job categories from trades to technology.</p>
                </div>
                <div className="bc-illus">
                  <svg viewBox="0 0 110 140" fill="none" style={{ width: '90px' }}>
                    <rect x="5" y="5" width="100" height="130" rx="6" fill="white" stroke="#c8d8ff" strokeWidth="1.2" />
                    <rect x="5" y="5" width="100" height="22" rx="6" fill="#c8d8ff" />
                    <circle cx="25" cy="16" r="8" fill="#0070f3" opacity=".5" />
                    <rect x="14" y="42" width="82" height="1.5" rx=".5" fill="#dde3f5" />
                    <rect x="14" y="46" width="70" height="1.5" rx=".5" fill="#dde3f5" />
                    <text x="55" y="128" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="6.5" fontWeight="600" fill="#0070f3">Score: 86/100</text>
                  </svg>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.4rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                {["Electrician", "Data Entry", "Customer Support", "Field Sales", "IT Support", "Logistics"].map((t, i) => (
                  <span key={i} className="ji-pct" style={{ fontSize: '0.62rem', padding: '0.2rem 0.6rem' }}>{t}</span>
                ))}
              </div>
              <div className="bc-n">01</div>
            </div>

            {/* -- 02: MOCK INTERVIEW AI -- */}
            <div className="bc bc-bg-t bc-span-2">
              <div className="bc-ey bcey-t">MOCK INTERVIEW AI</div>
              <div className="bc-h bc-ht">Practise until you<br />are truly ready.</div>
              <p className="bc-p bc-pt" style={{ fontSize: '0.74rem' }}>AI conducts full voice-based mock interviews with sector-specific question banks. Learners receive instant scoring on clarity, content, confidence, and communication — in Hindi or English.</p>
              <div className="bc-n">02</div>
            </div>

            {/* -- 03: SKILL TRACKS -- */}
            <div className="bc bc-bg-b2 bc-span-3">
              <div className="bc-ey bcey-b">SKILL TRACKS</div>
              <div className="bc-h bc-hb">20+ courses, built<br />for real jobs.</div>
              <p className="bc-p bc-pb">Structured learning paths aligned with NSQF levels and industry requirements — from entry-level trades and IT support to customer success and field sales roles.</p>
              <div className="bc-n">03</div>
            </div>

            {/* -- 04: DIGITAL CREDENTIALS -- */}
            <div className="bc bc-bg-b bc-span-3">
              <div className="bc-ey bcey-b">DIGITAL CREDENTIALS</div>
              <div className="bc-h bc-hb">Verifiable certificates<br />employers trust.</div>
              <p className="bc-p bc-pb">On course completion, learners receive tamper-proof digital credentials they can share with employers directly from their Lakshya profile — or download as PDF.</p>
              <div className="bc-n">04</div>
            </div>

            {/* -- 05: FOUNDATION & CSR DASHBOARD -- */}
            <div className="bc bc-bg-dk bc-span-4">
              <div className="bc-ey bcey-w">FOUNDATION &amp; CSR DASHBOARD</div>
              <div className="bc-h bc-hw">Full visibility into your program.<br /><em style={{ fontStyle: 'normal', opacity: 0.8 }}>Every cohort. Every learner. Every outcome.</em></div>
              <p className="bc-p bc-pw">Program managers and CSR funders get a real-time dashboard showing enrollments, course completions, assessment scores, placements, and salary outcomes. Auto-generated impact reports make every investment accountable.</p>
              <div style={{ display: 'flex', gap: '.4rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
                {["Live analytics", "Cohort tracking", "Placement reports", "Income uplift data", "CSR compliance export"].map((t, i) => (
                  <span key={i} className="ji-pct" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '0.62rem' }}>{t}</span>
                ))}
              </div>
              <div className="bc-n bc-n-w" style={{ opacity: 0.1 }}>05</div>
            </div>

            {/* -- 06: COMMUNICATION AI -- */}
            <div className="bc bc-outline-b bc-span-2">
              <div className="bc-ey" style={{ color: 'var(--ink3)' }}>COMMUNICATION AI</div>
              <div className="bc-h" style={{ color: 'var(--ink)' }}>Sound as good as<br />you are on paper.</div>
              <p className="bc-p" style={{ color: 'var(--ink3)' }}>Pronunciation, fluency, grammar, and confidence scoring. Especially valuable for first-generation English speakers entering formal employment.</p>
              <div className="bc-n">06</div>
            </div>
            <div className="bc bc-bg-l bc-span-2">
              <div className="bc-ey bcey-b">LOCAL JOBS ENGINE</div>
              <div className="bc-h bc-hb">Jobs matched to<br />where you are.</div>
              <p className="bc-p bc-pb">AI surfaces nearby openings ranked by skill compatibility, with salary data and one-click apply. Employers can browse verified profiles and shortlist directly.</p>
              <div className="bc-n">07</div>
            </div>

            <div className="bc bc-bg-g bc-span-4">
              <div className="bc-ey" style={{ color: '#00897b' }}>CAREER ROADMAP</div>
              <div className="bc-h" style={{ color: '#00695c' }}>A week-by-week plan<br />to the goal.</div>
              <p className="bc-p" style={{ color: '#00796b' }}>Skill gap analysis and personalised weekly learning plans that take the learner from where they are to where they want to be — in a clear, achievable sequence.</p>
              <div className="bc-n">08</div>
            </div>
          </div>
        </div>
      </section>

      {/* -- STATS BAND -- */}
      <section className="stats-band rv">
        <div className="sb-inner">
          <div className="sbi">
            <div className="sbi-circle" style={{ background: '#bfdbfe' }}></div>
            <div className="sbi-n">50,000+</div>
            <div className="sbi-l">Learners trained<br />on the platform</div>
          </div>
          <div className="sbi">
            <div className="sbi-circle" style={{ background: '#bae6fd' }}></div>
            <div className="sbi-n">78%</div>
            <div className="sbi-l">Placed within<br />60 days of certification</div>
          </div>
          <div className="sbi">
            <div className="sbi-circle" style={{ background: '#bbf7d0' }}></div>
            <div className="sbi-n">₹6.2L</div>
            <div className="sbi-l">Average annual income<br />of placed learners</div>
          </div>
          <div className="sbi">
            <div className="sbi-circle" style={{ background: '#fed7aa' }}></div>
            <div className="sbi-n">125+</div>
            <div className="sbi-l">Employer partners<br />actively hiring</div>
          </div>
        </div>
      </section>

      {/* -- OUTCOMES -- */}
      <section className="sec rv">
        <div className="wrap">
          <div className="ey ey-n">Outcomes</div>
          <h2 className="sh" style={{ marginBottom: '3.5rem' }}>What changes when <span style={{ color: 'var(--b2)' }}>skills meet opportunity.</span></h2>
          
          <div className="out-split">
            <div className="out-l">
              {[
                { 
                  t: "Employment generation at scale", 
                  d: "Organisations using Disha report 78% of their graduates placed within 60 days — compared to 34% through traditional methods alone.",
                  bg: "#eff6ff", ic: (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 14 l4-4 3 3 5-5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )
                },
                { 
                  t: "First-generation earners", 
                  d: "68% of learners placed through Disha are the first formally employed person in their family — creating lasting economic change at the household level.",
                  bg: "#f0fdf4", ic: (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="7" r="3" fill="#10b981" opacity="0.4" />
                      <path d="M4 16 c0-3 3-3 6-3 s6 0 6 3" stroke="#10b981" strokeWidth="2" />
                    </svg>
                  )
                },
                { 
                  t: "Income uplift of 3.2×", 
                  d: "Learners placed through the platform earn on average 3.2× more than their pre-training income — a direct measure of economic empowerment.",
                  bg: "#fff7ed", ic: (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="5" y="7" width="10" height="8" rx="2" fill="#f97316" opacity="0.3" stroke="#f97316" strokeWidth="1.5" />
                      <circle cx="10" cy="11" r="1.5" fill="#f97316" />
                    </svg>
                  )
                },
                { 
                  t: "Measurable ROI for funders", 
                  d: "Every CSR rupee invested is tracked to a tangible outcome. Disha's impact dashboards give funders placement rates and income data automatically.",
                  bg: "#f5f3ff", ic: (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 15 h12M4 12 h12M4 9 h12" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" />
                      <path d="M6 15 v-8M10 15 v-5M14 15 v-7" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )
                }
              ].map((item, i) => (
                <div className="oc-card" key={i}>
                  <div className="oc-ic" style={{ background: item.bg }}>{item.ic}</div>
                  <div>
                    <div className="oc-title">{item.t}</div>
                    <div className="oc-desc">{item.d}</div>
                  </div>
                </div>
              ))}

              <div className="uplift-box rv">
                <div className="uplift-label" style={{ color: 'var(--b1)', opacity: 0.8 }}>INCOME UPLIFT JOURNEY</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', position: 'relative' }}>
                  
                  {/* -- BEFORE -- */}
                  <div style={{ textAlign: 'center', width: '80px' }} className="up-pop up-stagger-1">
                    <div style={{ fontSize: '.75rem', color: 'var(--ink3)', marginBottom: '1rem', fontWeight: 600 }}>Before</div>
                    <div style={{ position: 'relative', height: '40px', width: '40px', margin: '0 auto' }}>
                      <svg viewBox="0 0 40 40" style={{ width: '40px' }}>
                        <circle cx="20" cy="20" r="20" fill="#f1f5f9" />
                        <path d="M0 20 a20 20 0 0 1 40 0" fill="#475569" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '.9rem', fontWeight: 800, marginTop: '1rem', color: 'var(--ink)' }}>₹8K</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--ink3)' }}>per month</div>
                  </div>

                  {/* -- STATIC ARROW -- */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <svg width="30" height="12" viewBox="0 0 30 12" fill="none">
                      <path d="M0 6 h20" stroke="var(--b1)" strokeWidth="2" />
                      <path d="M15 1 l5 5 -5 5" stroke="var(--b1)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* -- AFTER -- */}
                  <div style={{ textAlign: 'center', width: '100px' }} className="up-pop up-stagger-2">
                    <div style={{ fontSize: '.75rem', color: 'var(--b1)', marginBottom: '1rem', fontWeight: 700 }}>After Disha</div>
                    <div style={{ position: 'relative', height: '40px', width: '40px', margin: '0 auto' }}>
                      <svg viewBox="0 0 40 40" style={{ width: '40px' }}>
                        <circle cx="20" cy="20" r="20" fill="#dbeafe" />
                        <path d="M0 20 a20 20 0 0 1 40 0" fill="var(--b1)" />
                        <path className="up-sparkle" d="M20 5 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5-3.5 -3.5-1.5 3.5-1.5 z" fill="white" />
                      </svg>
                    </div>
                    <div style={{ background: '#dbeafe', borderRadius: '6px', padding: '.5rem', marginTop: '1rem', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--b1)' }}>₹26K</div>
                      <div style={{ fontSize: '.55rem', color: 'var(--b1)', fontWeight: 600 }}>per month</div>
                    </div>
                  </div>

                  {/* -- GROWTH ARROW -- */}
                  <div style={{ position: 'absolute', top: '-10px', right: '110px' }}>
                    <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
                      <path className="up-arrow-path" d="M5 50 Q20 30 35 10" stroke="var(--b1)" strokeWidth="1.5" strokeDasharray="4 3" />
                      <path d="M30 15 l5-5 -2 7" stroke="var(--b1)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* -- RESULT -- */}
                  <div style={{ textAlign: 'center' }} className="up-pop up-stagger-3">
                    <div style={{ fontSize: '.75rem', color: '#10b981', marginBottom: '1rem', fontWeight: 700 }}>Growth</div>
                    <div style={{ border: '1.5px solid #dbeafe', borderRadius: '12px', padding: '1.2rem 1.5rem', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--b1)', lineHeight: 1 }}>3.2×</div>
                      <div style={{ fontSize: '.65rem', color: '#10b981', fontWeight: 800, marginTop: '4px' }}>income uplift</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="out-r">
              {[
                { 
                  tag: "Placed · Electrician · Bhubaneswar", 
                  q: "\"I was doing small local work before. After training, I got a stable electrician job. Now I earn regularly and support my family.\"", 
                  n: "Rakesh Kumar · Batch 2024" 
                },
                { 
                  tag: "Placed · Delivery Partner · Cuttack", 
                  q: "\"The training helped me get selected quickly. Now I earn daily and manage my expenses independently.\"", 
                  n: "Amit Das · Batch 2023" 
                },
                { 
                  tag: "Placed · Driver · Bhubaneswar", 
                  q: "\"Earlier I had no proper job. Now I have a stable driver job and my income is consistent every month.\"", 
                  n: "Sanjay Nayak · Batch 2024" 
                },
                { 
                  tag: "Placed · Construction Worker · Ranchi", 
                  q: "\"I now work on bigger construction sites and earn better wages than before.\"", 
                  n: "Rahul Singh · Batch 2023" 
                }
              ].map((tm, i) => (
                <div className="tm-card" key={i}>
                  <span className="tm-tag">{tm.tag}</span>
                  <p className="tm-quote">{tm.q}</p>
                  <div className="tm-meta">{tm.n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* -- WORD CLOUD -- */}
      <section className="cloud-sec rv">
        <div className="cloud-inner">
          <h2 className="cloud-h">Every word is a <em>commitment to the learner.</em></h2>
          <p className="cloud-sub">Our core values drive every line of code we write.</p>
          <div className="cloud">
            {["Dignity", "Opportunity", "Independence", "Growth", "Future", "Skills", "Vocation", "Livelihood", "Aspiration", "Scale", "Impact", "Equality", "Accessibility", "Youth", "Potential", "Success"].map((word, i) => (
              <span key={i} className={`cw cw-${['lg', 'md', 'sm'][i % 3]} cw-${['b', 't', 'i', 'g'][i % 4]}`}>{word}</span>
            ))}
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS -- */}
      <section className="sec rv" style={{ background: '#fff' }}>
        <div className="wrap">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="ey ey-n" style={{ justifyContent: 'center', fontSize: '0.65rem' }}>The Human Story</div>
            <h2 className="sh" style={{ textAlign: 'center', marginBottom: '.5rem' }}>Real people. <span style={{ color: 'var(--b2)' }}>Real change.</span></h2>
            <p style={{ fontSize: '.86rem', color: 'var(--ink3)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.75' }}>
              Every learner on Lakshya is someone's first hope for a better income — a first-generation earner, a family's turning point.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {[
              { 
                name: "Sohan", 
                role: "Data Entry", 
                loc: "Bhubaneswar", 
                tag: "1st Job", 
                pay: "₹18K/mo", 
                bg: "#f0f4ff", 
                badge: "Offer Letter", 
                badgeCol: "#0052cc" 
              },
              { 
                name: "Priya", 
                role: "Construction worker", 
                loc: "Ranchi", 
                tag: "Cleared!", 
                pay: "3rd attempt", 
                bg: "#e0f7f4", 
                badge: "Cleared!", 
                badgeCol: "#00897b" 
              },
              { 
                name: "Ravi", 
                role: "Plumber", 
                loc: "Cuttack", 
                tag: "Rapido driver", 
                pay: "", 
                bg: "#f0f4ff", 
                badge: "Worker", 
                badgeCol: "#0052cc" 
              },
              { 
                name: "Rupa", 
                role: "Worker", 
                loc: "Cuttack", 
                tag: "Hired!", 
                pay: "", 
                bg: "#f0f4ff", 
                badge: "Hire Now", 
                badgeCol: "#0052cc" 
              }
            ].map((p, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <svg viewBox="0 0 140 160" fill="none" style={{ width: '100%', maxWidth: '140px', margin: '0 auto', display: 'block' }}>
                  <circle cx="70" cy="75" r="55" fill={p.bg} />
                  <circle cx="70" cy="52" r="20" fill="rgba(0,0,0,0.05)" />
                  <path d="M50 51 q20-18 40 0" fill="rgba(0,0,0,0.2)" />
                  <circle cx="63" cy="48" r="2.5" fill={p.badgeCol} fillOpacity=".6" />
                  <circle cx="77" cy="48" r="2.5" fill={p.badgeCol} fillOpacity=".6" />
                  <path d="M65 60 q5 3 10 0" stroke={p.badgeCol} strokeWidth="1.3" fill="none" strokeLinecap="round" />
                  <rect x="52" y="74" width="36" height="30" rx="5" fill="rgba(60, 110, 255, 0.2)" />
                  <g style={{ animation: `float-n ${4 + i % 2}s ease-in-out ${i * 0.2}s infinite` }}>
                    <rect x="90" y="32" width="42" height="28" rx="5" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
                    <text x="111" y="44" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="6" fontWeight="700" fill={p.badgeCol}>{p.badge}</text>
                    <text x="111" y="52" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5" fill="var(--ink3)">{p.loc}</text>
                  </g>
                  <rect x="25" y="125" width="90" height="22" rx="6" fill={p.badgeCol} fillOpacity="0.1" />
                  <text x="70" y="134" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="6.5" fontWeight="700" fill={p.badgeCol}>{p.name} · {p.tag}</text>
                  <text x="70" y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5.5" fill="var(--ink3)">{p.role} · {p.pay || p.loc}</text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <section className="cta">
        <div className="cta-inner">
          <div className="ey ey-w" style={{ justifyContent: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>Start Today</div>
          <h2 className="cta-h">Give every learner a direction forward.</h2>
          <p className="cta-p">
            Whether you are a learner looking for your first job, a foundation running a skill development program, or an employer looking for work-ready talent — Lakshya is built for you.
          </p>
          <div className="cta-btns">
            <button className="btn-cta">Get started free</button>
            <button className="btn-cta2">Request a demo →</button>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer className="sec" style={{ background: '#fff' }}>
        <div className="wrap">
          <div className="ft">
            <div>
              <div className="fl">Lakshya<b></b></div>
              <p className="ft-tag">AI-powered skill development for learners, organisations, and employers.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="ji-pct" style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: '500' }}>Skill Development</span>
                <span className="ji-pct" style={{ background: '#ecfdf5', color: '#10b981', fontWeight: '500' }}>Placement Ready</span>
                <span className="ji-pct" style={{ background: '#eff6ff', color: '#3b82f6', fontWeight: '500' }}>Youth Empowerment</span>
              </div>
            </div>
            <div>
              <div className="fch">Platform</div>
              <ul className="fcl">
                <li><a href="#">Resume builder</a></li>
                <li><a href="#">Interview prep</a></li>
                <li><a href="#">Skill tracks</a></li>
                <li><a href="#">Job matching</a></li>
                <li><a href="#">Digital credentials</a></li>
                <li><a href="#">Career roadmap</a></li>
              </ul>
            </div>
            <div>
              <div className="fch">Organisations</div>
              <ul className="fcl">
                <li><a href="#">For NGOs & foundations</a></li>
                <li><a href="#">For recruiters</a></li>
                <li><a href="#">Impact dashboard</a></li>
              </ul>
            </div>
            <div>
              <div className="fch">Company</div>
              <ul className="fcl">
                <li><a href="#">About Lakshya</a></li>
                <li><a href="#">Our approach</a></li>
                <li><a href="#">Blog & resources</a></li>
                <li><a href="#">Contact us</a></li>
                <li><a href="#">Privacy policy</a></li>
                <li><a href="#">Terms of use</a></li>
              </ul>
            </div>
          </div>
          <div className="fb">
            <div className="fb-c">© 2025 Lakshya · AI-powered skill development and career readiness platform</div>
            <div className="fb-s">
              <a href="#">LinkedIn</a>
              <a href="#">Twitter</a>
              <a href="#">YouTube</a>
              <a href="#">Email</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
