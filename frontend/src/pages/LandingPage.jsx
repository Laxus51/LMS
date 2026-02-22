import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Brain,
  Target,
  Users,
  Check,
  ArrowRight,
  MessageCircle,
  BarChart3,
  Calendar,
  Crown,
  Sparkles,
  Shield,
  Award,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const observerRef = useRef(null);

  const handleGetStarted = () => navigate(user ? '/dashboard' : '/register');
  const handleViewPlans = () => navigate(user ? '/pricing' : '/register');

  // Scroll animation observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-animate').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* Inline styles for landing page animations */}
      <style>{`
        .landing-page {
          --azure: #0078D4;
          --azure-dark: #106EBE;
          --azure-darker: #005A9E;
          --navy: #0F1B2D;
          --navy-light: #1B2A4A;
        }

        .scroll-animate {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-animate.delay-1 { transition-delay: 0.1s; }
        .scroll-animate.delay-2 { transition-delay: 0.2s; }
        .scroll-animate.delay-3 { transition-delay: 0.3s; }
        .scroll-animate.delay-4 { transition-delay: 0.4s; }

        .scroll-animate.fade-scale {
          transform: scale(0.95);
        }
        .scroll-animate.fade-scale.animate-in {
          transform: scale(1);
        }

        .scroll-animate.slide-left {
          transform: translateX(-40px);
        }
        .scroll-animate.slide-left.animate-in {
          transform: translateX(0);
        }

        .scroll-animate.slide-right {
          transform: translateX(40px);
        }
        .scroll-animate.slide-right.animate-in {
          transform: translateX(0);
        }

        .hero-section {
          background: linear-gradient(135deg, #0F1B2D 0%, #0078D4 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url('/images/hero-bg.png') center/cover no-repeat;
          opacity: 0.3;
          mix-blend-mode: overlay;
        }

        .hero-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
        }

        .stat-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 20px 28px;
          text-align: center;
          transition: transform 0.3s ease, background 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.12);
        }

        .feature-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 28px;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          border-color: #0078D4;
        }

        .cta-btn-primary {
          background: #0078D4;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          border: none;
          cursor: pointer;
        }
        .cta-btn-primary:hover {
          background: #106EBE;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,120,212,0.35);
        }

        .cta-btn-secondary {
          background: rgba(255,255,255,0.1);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          border: 1px solid rgba(255,255,255,0.25);
          cursor: pointer;
        }
        .cta-btn-secondary:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .pricing-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 32px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }
        .pricing-card.featured {
          border-color: #0078D4;
          box-shadow: 0 0 0 1px #0078D4;
        }

        .section-dark {
          background: linear-gradient(135deg, #0F1B2D 0%, #1B2A4A 100%);
        }

        @media (max-width: 768px) {
          .hero-glow { width: 300px; height: 300px; }
          .landing-nav-buttons { gap: 6px !important; }
          .landing-nav-buttons .nav-signin {
            font-size: 12px !important;
            padding: 6px 8px !important;
          }
          .landing-nav-buttons .nav-cta {
            font-size: 11px !important;
            padding: 6px 12px !important;
          }
          .landing-brand-text {
            font-size: 13px !important;
          }
          .landing-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .stat-card {
            padding: 12px 8px !important;
          }
          .stat-card .stat-value {
            font-size: 16px !important;
          }
          .stat-card .stat-label {
            font-size: 9px !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
          .hero-buttons .cta-btn-primary,
          .hero-buttons .cta-btn-secondary {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }
        @media (max-width: 380px) {
          .landing-nav-buttons .nav-signin {
            display: none !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, background: '#0078D4', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <BookOpen style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <span className="landing-brand-text" style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Microsoft Trainings</span>
            </div>
            <div className="landing-nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="cta-btn-primary nav-cta" style={{ padding: '8px 20px', fontSize: 13 }}>
                  Dashboard
                </button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="nav-signin" style={{
                    background: 'none', border: 'none', color: '#6B7280', fontWeight: 500,
                    fontSize: 14, cursor: 'pointer', padding: '8px 12px'
                  }}>
                    Sign In
                  </button>
                  <button onClick={() => navigate('/register')} className="cta-btn-primary nav-cta" style={{ padding: '8px 20px', fontSize: 13 }}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '80px 0 64px', position: 'relative' }}>
        {/* Glow effects */}
        <div className="hero-glow" style={{ top: -100, right: -100, background: '#0078D4' }} />
        <div className="hero-glow" style={{ bottom: -100, left: -100, background: '#5C2D91' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div className="scroll-animate" style={{ marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 20, padding: '6px 14px', fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500
              }}>
                <Sparkles style={{ width: 14, height: 14 }} /> AI-Powered Learning Platform
              </span>
            </div>

            <h1 className="scroll-animate delay-1" style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff',
              lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em'
            }}>
              Master Microsoft{' '}
              <span style={{ background: 'linear-gradient(135deg, #50B0FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Certifications
              </span>
            </h1>

            <p className="scroll-animate delay-2" style={{
              fontSize: 'clamp(16px, 2vw, 19px)', color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.6, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px'
            }}>
              Personalized study plans, smart quizzes, and real exam simulations
              for <span style={{ color: '#fff', fontWeight: 600 }}>SC-900, AZ-900, AZ-104</span> and more.
            </p>

            <div className="scroll-animate delay-3 hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={handleGetStarted} className="cta-btn-primary">
                Get Started Free <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={handleViewPlans} className="cta-btn-secondary">
                View Plans <Crown style={{ width: 16, height: 16, color: '#FBBF24' }} />
              </button>
            </div>

            {/* Stats */}
            <div className="scroll-animate delay-4 landing-stats-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 520, margin: '0 auto'
            }}>
              {[
                { value: '10,000+', label: 'Students Certified' },
                { value: '95%', label: 'Pass Rate' },
                { value: '4.9/5', label: 'Average Rating' }
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-value" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{s.value}</div>
                  <div className="stat-label" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="scroll-animate" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              Everything You Need to Succeed
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
              Our platform adapts to your learning style and helps you pass certifications faster.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: MessageCircle, title: 'AI Tutor Chat', desc: 'Get instant, personalized help. Ask questions and receive tailored explanations.', tag: 'GPT-4 Powered', color: '#0078D4' },
              { icon: Brain, title: 'Smart Quizzes', desc: 'Practice with realistic exam questions generated from official patterns.', tag: 'Adaptive Learning', color: '#5C2D91' },
              { icon: Calendar, title: 'Study Plans', desc: '7 to 90-day plans that adjust based on your progress and available time.', tag: 'Progress Tracking', color: '#107C10' },
              { icon: Users, title: 'Expert Mentors', desc: 'Book 1-on-1 sessions with certified Microsoft professionals.', tag: 'Premium', color: '#D83B01' }
            ].map((f, i) => (
              <div key={i} className={`scroll-animate delay-${i + 1} feature-card`}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${f.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 12 }}>{f.desc}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: f.color }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="scroll-animate" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              How It Works
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280' }}>Three simple steps to certification success</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: Target, step: '01', title: 'Choose Your Cert', desc: 'Pick from AZ-900, SC-900, AZ-104 and more Microsoft certifications.' },
              { icon: Zap, step: '02', title: 'Learn with AI', desc: 'Get a personalized study plan, smart quizzes, and instant AI tutor support.' },
              { icon: Award, step: '03', title: 'Get Certified', desc: 'Pass your exam with confidence using realistic mock exams and expert guidance.' }
            ].map((s, i) => (
              <div key={i} className={`scroll-animate delay-${i + 1}`} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0078D4, #5C2D91)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', position: 'relative'
                }}>
                  <s.icon style={{ width: 24, height: 24, color: '#fff' }} />
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#fff', border: '2px solid #0078D4', borderRadius: '50%',
                    width: 24, height: 24, fontSize: 10, fontWeight: 800, color: '#0078D4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{s.step}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '80px 0', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="scroll-animate" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              Choose Your Plan
            </h2>
            <p style={{ fontSize: 15, color: '#6B7280' }}>Start free and upgrade when you're ready.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            {/* Free */}
            <div className="scroll-animate delay-1 pricing-card">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Free</h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                $0<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Perfect for getting started</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {['5 quizzes per day', 'Free courses', 'Basic study plans', 'Community support'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                    <Check style={{ width: 16, height: 16, color: '#16A34A', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} style={{
                width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                Get Started Free
              </button>
            </div>

            {/* Premium */}
            <div className="scroll-animate delay-2 pricing-card featured" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -12, left: 24,
                background: '#0078D4', color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '4px 12px', borderRadius: 4
              }}>
                Recommended
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crown style={{ width: 18, height: 18, color: '#D97706' }} /> Premium
              </h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#0078D4', marginBottom: 4 }}>
                $9.99<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 400 }}>/month</span>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Everything you need to excel</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                {['Unlimited quizzes', 'All courses', 'Advanced study plans', 'Mock exams', '1-on-1 mentors', 'Priority AI tutor', 'Analytics'].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                    <Check style={{ width: 16, height: 16, color: '#16A34A', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleViewPlans} className="cta-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}>
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-dark" style={{ padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ top: -200, right: -100, background: '#0078D4' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 className="scroll-animate" style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Ready to Pass Your Certification?
          </h2>
          <p className="scroll-animate delay-1" style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            Join thousands of professionals who've accelerated their careers with our platform.
          </p>
          <div className="scroll-animate delay-2" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <button onClick={handleGetStarted} className="cta-btn-primary" style={{ background: '#fff', color: '#0078D4' }}>
              Start Learning Today <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
          <div className="scroll-animate delay-3" style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check style={{ width: 14, height: 14 }} /> No credit card required</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check style={{ width: 14, height: 14 }} /> Upgrade anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A0F1A', padding: '32px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 24, height: 24, background: '#0078D4', borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen style={{ width: 14, height: 14, color: '#fff' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Microsoft Trainings</span>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280' }}>© 2024 Microsoft Trainings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
