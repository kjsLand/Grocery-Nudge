"use client";

import { useEffect, useRef, useState } from "react";

type GroceryItem = {
  id: string;
  name: string;
  meta?: string;
  checked: boolean;
};

const INITIAL_ITEMS: GroceryItem[] = [
  { id: "1", name: "Paper towels", checked: true },
  { id: "2", name: "Milk (oat, not almond)", checked: false },
  { id: "3", name: "Eggs", checked: false },
  { id: "4", name: "Tomatoes x3", meta: "get the vine ones — Sam", checked: false },
];

export default function Landing() {
  const [items, setItems] = useState<GroceryItem[]>(INITIAL_ITEMS);
  const [toast, setToast] = useState<{ text: string; show: boolean }>({ text: "", show: false });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const listsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const receiptsRef = useRef<HTMLDivElement>(null);
  const somedayRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
  ref.current?.scrollIntoView({ behavior: "smooth" });
};

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)));
  };

  // ambient demo: auto-check "Milk" shortly after load to show live-sync
  useEffect(() => {
    const t = setTimeout(() => {
      setItems((prev) => prev.map((it) => (it.id === "2" ? { ...it, checked: true } : it)));
      setToast({ text: 'Sam checked off "Milk"', show: true });
      const hide = setTimeout(() => setToast((s) => ({ ...s, show: false })), 2600);
      return () => clearTimeout(hide);
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="nudge-root">
      <style>{`
        .nudge-root{
          --paper: #F6F1E4;
          --paper-dark: #EAE0C7;
          --ink: #232C39;
          --ink-soft: #3c4757;
          --pencil: #726f63;
          --red-pen: #C1443C;
          --highlighter: #F5D949;
          --kraft: #B98953;
          --line: rgba(35,44,57,0.14);

          font-family: 'IBM Plex Sans', sans-serif;
          color: var(--ink);
          background: var(--paper);
          background-image:
            radial-gradient(ellipse at top left, rgba(255,255,255,0.5), transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 27px, var(--line) 28px);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        .nudge-root *{ box-sizing: border-box; }
        .nudge-root .eyebrow{
          font-family: 'Special Elite', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.72rem;
          color: var(--red-pen);
        }
        .nudge-root h1, .nudge-root h2, .nudge-root h3, .nudge-root h4{
          font-family: 'Special Elite', monospace;
          line-height: 1.15;
          margin: 0;
          color: var(--ink);
        }
        .nudge-root .script{ font-family: 'Caveat', cursive; font-weight: 600; }
        .nudge-root p{ line-height: 1.6; color: var(--ink-soft); margin: 0; }
        .nudge-root .wrap{ max-width: 1120px; margin: 0 auto; padding: 0 32px; }

        .nudge-root .tear{
          width: 100%; height: 22px; background: var(--paper);
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='22' viewBox='0 0 60 22'%3E%3Cpath d='M0 6 L6 14 L12 3 L18 17 L24 8 L30 20 L36 5 L42 15 L48 2 L54 18 L60 9 L60 22 L0 22 Z' fill='black'/%3E%3C/svg%3E");
          mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='22' viewBox='0 0 60 22'%3E%3Cpath d='M0 6 L6 14 L12 3 L18 17 L24 8 L30 20 L36 5 L42 15 L48 2 L54 18 L60 9 L60 22 L0 22 Z' fill='black'/%3E%3C/svg%3E");
          -webkit-mask-size: 60px 22px; mask-size: 60px 22px; margin-top: -1px;
        }
        .nudge-root .tear.flip{ transform: scaleY(-1); margin-top:0; margin-bottom:-1px; }

        .nudge-root header{
          position: sticky; top:0; z-index: 50;
          background: rgba(246,241,228,0.9);
          backdrop-filter: blur(6px);
          border-bottom: 1px dashed var(--pencil);
        }
        .nudge-root nav.wrap{ display:flex; align-items:center; justify-content:space-between; padding: 18px 32px; }
        .nudge-root .logo{ display:flex; align-items:center; gap:8px; font-family:'Special Elite', monospace; font-size:1.25rem; }
        .nudge-root .logo .dot{ width:10px;height:10px;border-radius:50%; background: var(--red-pen); box-shadow: 0 0 0 3px rgba(193,68,60,0.15); }
        .nudge-root .nav-links{ display:flex; gap:28px; font-size:0.92rem; color:var(--ink-soft); }
        .nudge-root .nav-links button{ background:none; border:none; font:inherit; cursor:pointer; color:var(--ink-soft); border-bottom:1px dashed transparent; padding:0; }
        .nudge-root .nav-links button:hover{ border-color: var(--red-pen); color:var(--ink); }
        .nudge-root .btn{
          font-family:'Special Elite', monospace; background: var(--ink); color: var(--paper);
          border:none; padding: 11px 20px; font-size:0.85rem; letter-spacing:0.03em;
          cursor:pointer; border-radius: 2px; transition: transform .15s ease;
        }
        .nudge-root .btn:hover{ transform: translateY(-2px); }
        .nudge-root .btn.ghost{ background:transparent; color:var(--ink); border:1.5px solid var(--ink); }
        @media (max-width: 720px){ .nudge-root .nav-links{ display:none; } }

        .nudge-root .hero{ padding: 84px 0 60px; display:grid; grid-template-columns: 1.05fr 0.95fr; gap: 48px; align-items:center; }
        @media (max-width: 900px){ .nudge-root .hero{ grid-template-columns: 1fr; padding-top: 56px; } }
        .nudge-root .hero h1{ font-size: clamp(2.1rem, 4vw, 3.4rem); max-width: 12ch; }
        .nudge-root .hero h1 .underline{ position:relative; white-space:nowrap; }
        .nudge-root .hero h1 .underline svg{ position:absolute; left:0; bottom:-6px; width:100%; height:14px; }
        .nudge-root .hero p.sub{ font-size:1.08rem; max-width: 46ch; margin-top:18px; }
        .nudge-root .hero-ctas{ margin-top: 30px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .nudge-root .hero-note{ font-family:'Caveat', cursive; font-size:1.15rem; color: var(--red-pen); transform: rotate(-3deg); display:inline-block; margin-top: 14px; }

        .nudge-root .notepad-stage{ position:relative; }
        .nudge-root .stickynote{
          position:absolute; background: var(--highlighter); padding: 10px 14px;
          font-family:'Caveat', cursive; font-weight:600; font-size:1.05rem;
          box-shadow: 3px 4px 8px rgba(0,0,0,0.18); transform: rotate(-6deg); z-index: 3;
        }
        .nudge-root .stickynote.two{ background:#fff2c4; right: -10px; top: -18px; transform: rotate(5deg); }
        .nudge-root .stickynote.one{ left: -22px; bottom: 34px; transform: rotate(-8deg); }

        .nudge-root .notepad{
          background: #fffdf7; border-radius: 4px;
          box-shadow: 0 1px 0 #fff, 0 18px 40px rgba(35,28,15,0.25), 0 4px 10px rgba(35,28,15,0.15);
          padding: 30px 30px 26px; position: relative; transform: rotate(1.2deg); border: 1px solid #e8dfc6;
        }
        .nudge-root .notepad::before{
          content:""; position:absolute; left:0; right:0; top:0; height:14px;
          background: repeating-linear-gradient(90deg, transparent, transparent 22px, #e3d9b8 22px, #e3d9b8 23px);
          border-bottom: 1px solid #ddd0a6; border-radius: 4px 4px 0 0;
        }
        .nudge-root .notepad-title{ font-family:'Special Elite', monospace; font-size:1.05rem; margin: 14px 0 4px; display:flex; justify-content:space-between; align-items:baseline; }
        .nudge-root .notepad-title span.tag{ font-family:'IBM Plex Sans'; font-size:0.68rem; color:var(--pencil); text-transform:uppercase; letter-spacing:0.06em; }
        .nudge-root .notepad-sub{ font-size:0.78rem; color:var(--pencil); margin-bottom:14px; border-bottom: 1px dashed var(--line); padding-bottom:12px; }

        .nudge-root ul.list{ list-style:none; margin:0; padding:0; }
        .nudge-root ul.list li{ display:flex; align-items:flex-start; gap:12px; padding: 9px 0; border-bottom: 1px dashed var(--line); cursor:pointer; user-select:none; }
        .nudge-root ul.list li:last-child{ border-bottom:none; }
        .nudge-root .box{ flex:none; width:20px;height:20px; border:2px solid var(--ink); border-radius:3px; margin-top:2px; position:relative; background:#fff; }
        .nudge-root .box svg{
          position:absolute; inset:-3px; stroke: var(--red-pen); stroke-width:3; fill:none;
          stroke-linecap:round; stroke-linejoin:round; stroke-dasharray: 30; stroke-dashoffset: 30;
          transition: stroke-dashoffset .35s ease;
        }
        .nudge-root li.checked .box svg{ stroke-dashoffset:0; }
        .nudge-root li.checked .item-name{ color: var(--pencil); text-decoration: line-through; text-decoration-color: var(--red-pen); text-decoration-thickness: 2px; }
        .nudge-root .item-name{ font-size:1rem; }
        .nudge-root .item-meta{ display:block; font-family:'Caveat', cursive; font-size:1rem; color:var(--red-pen); margin-top:1px; }

        .nudge-root .toast{ margin-top:16px; font-family:'Caveat', cursive; font-size:1.1rem; color: var(--ink-soft); opacity:0; transform: translateY(6px); transition: opacity .3s ease, transform .3s ease; }
        .nudge-root .toast.show{ opacity:1; transform:translateY(0); }
        .nudge-root .toast::before{ content:"✎ "; }

        .nudge-root section{ padding: 68px 0; }
        .nudge-root .section-head{ max-width: 620px; margin-bottom: 46px; }
        .nudge-root .section-head h2{ font-size: clamp(1.6rem, 2.6vw, 2.2rem); margin-top:10px; }
        .nudge-root .section-head p{ margin-top:14px; font-size:1.05rem; }

        .nudge-root .feature-grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
        @media (max-width: 900px){ .nudge-root .feature-grid{ grid-template-columns:1fr; } }
        .nudge-root .card{ background: #fffdf7; border: 1px solid #e6dcbf; border-radius: 4px; padding: 26px 24px 24px; box-shadow: 4px 6px 0 rgba(35,44,57,0.05); position:relative; }
        .nudge-root .card::after{ content:""; position:absolute; top:-8px; left:22px; width:44px; height:16px; background: rgba(185,137,83,0.55); transform: rotate(-3deg); }
        .nudge-root .card h3{ font-size:1.05rem; margin-bottom:10px; }
        .nudge-root .card p{ font-size:0.94rem; }

        .nudge-root .split{ display:grid; grid-template-columns: 1fr 1fr; gap:56px; align-items:center; }
        @media (max-width: 900px){ .nudge-root .split{ grid-template-columns:1fr; gap:32px; } }
        .nudge-root .split.reverse{ direction: rtl; }
        .nudge-root .split.reverse > *{ direction: ltr; }

        .nudge-root .rsvp-card{ background:#fffdf7; border:1px solid #e6dcbf; border-radius:4px; padding:22px; box-shadow: 6px 8px 0 rgba(35,44,57,0.06); max-width: 420px; }
        .nudge-root .rsvp-head{ display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--line); padding-bottom:12px; margin-bottom:14px; }
        .nudge-root .rsvp-head h4{ font-family:'Special Elite',monospace; font-size:1rem; margin:0; }
        .nudge-root .pill{ font-size:0.68rem; font-family:'IBM Plex Sans'; text-transform:uppercase; letter-spacing:0.05em; background: var(--highlighter); padding:3px 9px; border-radius:20px; color:var(--ink); }
        .nudge-root .guest-row{ display:flex; justify-content:space-between; align-items:center; padding:8px 0; font-size:0.92rem; }
        .nudge-root .guest-row .avatar{ width:26px;height:26px;border-radius:50%; background:var(--kraft); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:0.72rem; margin-right:8px; font-family:'Special Elite',monospace; }
        .nudge-root .guest-row .bringing{ font-family:'Caveat',cursive; font-size:1.02rem; color:var(--red-pen); }

        .nudge-root .receipt{
          background:#fffef9; width: 260px; margin: 0 auto; padding: 22px 20px 26px;
          font-family:'Special Elite', monospace; font-size:0.82rem;
          box-shadow: 0 14px 30px rgba(35,28,15,0.2); position:relative;
          clip-path: polygon(0% 0%, 100% 0%, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%);
          transform: rotate(-2deg);
        }
        .nudge-root .receipt .row{ display:flex; justify-content:space-between; padding:4px 0; }
        .nudge-root .receipt .row.strike{ text-decoration: line-through; color: var(--pencil); }
        .nudge-root .receipt hr{ border:none; border-top:1px dashed #999; margin:10px 0; }
        .nudge-root .receipt .flag{ margin-top:10px; font-family:'Caveat',cursive; color:var(--red-pen); font-size:1rem; }

        .nudge-root .someday{ background: #fffdf7; border: 1px solid #e6dcbf; border-radius:4px; padding: 30px 34px; max-width: 720px; margin: 0 auto; transform: rotate(-0.6deg); box-shadow: 5px 6px 0 rgba(35,44,57,0.06); }
        .nudge-root .someday h3{ font-size:1.15rem; margin-bottom:16px; }
        .nudge-root .someday ul{ margin:0; padding-left:0; list-style:none; }
        .nudge-root .someday li{ padding: 7px 0 7px 26px; position:relative; font-size:0.98rem; color:var(--ink-soft); border-bottom: 1px dashed var(--line); }
        .nudge-root .someday li:last-child{ border-bottom:none; }
        .nudge-root .someday li::before{ content:"—"; position:absolute; left:0; color:var(--kraft); }

        .nudge-root .cta-band{ text-align:center; padding: 80px 0 60px; }
        .nudge-root .cta-band h2{ font-size: clamp(1.8rem, 3vw, 2.6rem); max-width:16ch; margin:0 auto; }
        .nudge-root .cta-band p{ max-width:46ch; margin:16px auto 30px; font-size:1.05rem; }
        .nudge-root .email-form{ display:flex; justify-content:center; gap:10px; flex-wrap:wrap; }
        .nudge-root .email-form input{ font-family:'IBM Plex Sans'; font-size:0.95rem; padding: 12px 16px; border: 1.5px solid var(--ink); border-radius:2px; width: 280px; background:#fffdf7; }
        .nudge-root .email-form input:focus{ outline: 3px solid var(--highlighter); outline-offset:0; }

        .nudge-root footer{ border-top: 1px dashed var(--pencil); padding: 26px 32px 40px; font-size:0.82rem; color: var(--pencil); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; }

        @media (prefers-reduced-motion: reduce){ .nudge-root *{ transition: none !important; animation: none !important; } }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Caveat:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
      />

      <header>
        <nav className="wrap">
          <div className="logo">
            <span className="dot" /> Nudge
          </div>
          <div className="nav-links">
            <button onClick={() => scrollTo(listsRef)}>Shared lists</button>
            <button onClick={() => scrollTo(eventsRef)}>Events</button>
            <button onClick={() => scrollTo(receiptsRef)}>Receipts</button>
            <button onClick={() => scrollTo(somedayRef)}>Roadmap</button>
          </div>
          <button className="btn" onClick={() => scrollTo(signupRef)}>
            Get early access
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero wrap">
        <div>
          <p className="eyebrow">for families &amp; roommates who share a fridge</p>
          <h1>
            Stop texting
            <br />
            <span className="underline">
              "did you get milk?"
              <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                <path d="M2 8 Q 50 2, 100 8 T 198 6" stroke="#C1443C" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            fifteen times a day.
          </h1>
          <p className="sub">
            Nudge is one grocery list that everyone in the house can see, add to, and check off — live. Snap the
            receipt when you're done and it settles who owes what.
          </p>
          <div className="hero-ctas">
            <button className="btn" onClick={() => scrollTo(signupRef)}>
              Get early access
            </button>
            <button className="btn ghost" onClick={() => scrollTo(eventsRef)}>
              See how potlucks work
            </button>
          </div>
          <p className="hero-note">↳ no more four bags of the same tortilla chips</p>
        </div>

        <div className="notepad-stage">
          <div className="stickynote two">
            taking
            <br />
            the list
            <br />
            to Trader Joe's
          </div>
          <div className="notepad">
            <div className="notepad-title">
              Household List <span className="tag">4 people · live</span>
            </div>
            <div className="notepad-sub">last checked off by Sam, 2 min ago</div>
            <ul className="list">
              {items.map((item) => (
                <li key={item.id} className={item.checked ? "checked" : ""} onClick={() => toggleItem(item.id)}>
                  <span className="box">
                    <svg viewBox="0 0 20 20">
                      <path d="M4 10 L8 14 L16 5" />
                    </svg>
                  </span>
                  <span>
                    <span className="item-name">{item.name}</span>
                    {item.meta && <span className="item-meta">{item.meta}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className={`toast ${toast.show ? "show" : ""}`}>{toast.text}</div>
          </div>
          <div className="stickynote one">
            rent's
            <br />
            due too
            <br />
            lol
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="tear" />
      </div>

      {/* SHARED LISTS */}
      <section ref={listsRef}>
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">one list, everyone's pen</p>
            <h2>Add an item on your phone. It shows up on theirs before you've hit send.</h2>
            <p>
              Every person in a household or apartment shares the same running list. Anyone can add, edit, or check
              something off, and everyone sees it change in real time — no "did you already get this" texts.
            </p>
          </div>
          <div className="feature-grid">
            <div className="card">
              <h3>Lists that update live</h3>
              <p>Add "coffee" from the couch. Your roommate sees it appear while they're already standing in aisle 4.</p>
            </div>
            <div className="card">
              <h3>Save your regulars</h3>
              <p>Turn your usual run into a template — eggs, bread, coffee — so the weekly list starts half full instead of blank.</p>
            </div>
            <div className="card">
              <h3>Notes on any item</h3>
              <p>Leave a note like "vine tomatoes, not the plum ones" right on the item, so nobody guesses wrong at the store.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="tear flip" />
      </div>

      {/* EVENTS */}
      <section ref={eventsRef} style={{ background: "var(--paper-dark)" }}>
        <div className="wrap split">
          <div>
            <p className="eyebrow">potlucks, without the group chat spiral</p>
            <h2>People RSVP. They pick what they're bringing. Nobody shows up with five bags of chips.</h2>
            <p>
              Create an event, share the link, and let guests claim food items themselves. If someone changes their
              mind, the list updates for everyone instantly — you'll never end up with three desserts and no plates
              again.
            </p>
          </div>
          <div className="visual">
            <div className="rsvp-card">
              <div className="rsvp-head">
                <h4>Saturday Cookout</h4>
                <span className="pill">6 going</span>
              </div>
              <div className="guest-row">
                <span>
                  <span className="avatar">MJ</span>Maya
                </span>
                <span className="bringing">bringing plates + cups</span>
              </div>
              <div className="guest-row">
                <span>
                  <span className="avatar">DL</span>Dev
                </span>
                <span className="bringing">bringing burgers</span>
              </div>
              <div className="guest-row">
                <span>
                  <span className="avatar">RK</span>Ren
                </span>
                <span className="bringing">still deciding…</span>
              </div>
              <div className="guest-row">
                <span>
                  <span className="avatar">+2</span>and others
                </span>
                <span className="bringing">2 spots open</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="tear" />
      </div>

      {/* RECEIPTS */}
      <section ref={receiptsRef}>
        <div className="wrap split reverse">
          <div>
            <p className="eyebrow">snap the receipt, skip the math</p>
            <h2>Photograph your receipt. It checks off what you bought and splits the total.</h2>
            <p>
              Back from the store? Upload a photo of the receipt and Nudge ticks off matching items automatically.
              Buy something that wasn't on the list, or skip something that was — everyone gets a quick note about
              it. Then it splits the total for you.
            </p>
          </div>
          <div className="visual">
            <div className="receipt">
              <div className="row">
                <span>MILK OAT</span>
                <span>4.29</span>
              </div>
              <div className="row">
                <span>EGGS DZ</span>
                <span>3.99</span>
              </div>
              <div className="row strike">
                <span>PAPER TWL</span>
                <span>6.49</span>
              </div>
              <div className="row">
                <span>TOMATO x3</span>
                <span>2.85</span>
              </div>
              <hr />
              <div className="row">
                <strong>TOTAL</strong>
                <strong>17.62</strong>
              </div>
              <div className="row">
                <span>split 4 ways</span>
                <span>4.41 ea</span>
              </div>
              <div className="flag">↳ paper towels already had some at home — flagged for the group</div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="tear flip" />
      </div>

      {/* SOMEDAY */}
      <section ref={somedayRef} style={{ background: "var(--paper-dark)" }}>
        <div className="wrap">
          <div className="section-head" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            <p className="eyebrow">also on our list</p>
            <h2>What we're building next</h2>
          </div>
          <div className="someday">
            <h3 className="script" style={{ fontSize: "1.3rem", color: "var(--red-pen)" }}>
              things we haven't crossed off yet:
            </h3>
            <ul>
              <li>Split a restaurant check by exactly what each person ordered</li>
              <li>Automatic tax and tip, so nobody's doing mental math at the table</li>
              <li>A gentle nudge (really, just one) to whoever still owes money</li>
              <li>Scan a barcode to add items without typing</li>
              <li>Pull items straight from your usual grocery store's site</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band" ref={signupRef}>
        <div className="wrap">
          <h2>We're writing v1 right now.</h2>
          <p>
            Nudge is in early development. Leave your email and we'll send you an invite the moment the first
            household lists go live.
          </p>
          <form className="email-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="you@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn" type="submit">
              Join the waitlist
            </button>
          </form>
          <p
            className="script"
            style={{
              color: "var(--red-pen)",
              fontSize: "1.15rem",
              marginTop: "14px",
              opacity: submitted ? 1 : 0,
              transition: "opacity .3s ease",
            }}
          >
            {submitted ? "Got it — you're on the list." : ""}
          </p>
        </div>
      </section>

      <footer className="wrap">
        <span>© 2026 Nudge. Made for people who share a fridge.</span>
        <span>Website · iOS (coming) · pen-and-paper since v1</span>
      </footer>
    </div>
  );
}