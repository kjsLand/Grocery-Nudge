"use client";

import React, { useState } from "react";
import { Users, Mail, ScanLine } from "lucide-react";

/**
 * Nudge nav bar — pen-and-paper theme.
 *
 * Design tokens
 *  paper:      #EFE9D8  (aged index-card cream)
 *  ink-navy:   #2A3B55  (ballpoint pen — primary text/icons)
 *  ink-red:    #A63D40  (marginalia red — the one accent, used only for the active mark)
 *  graphite:   #8B8378  (pencil grey — secondary text, hairlines)
 *  highlight:  #E8C86E  (muted highlighter — hover wash)
 *  shadow-tan: #D8CFB0  (deckled edge / drop shadow)
 *
 * Fonts: "Caveat" (bold) for the wordmark, "Patrick Hand" for nav labels.
 *
 * Note: this version uses plain CSS (scoped via the <style> block below) rather
 * than Tailwind's arbitrary-value syntax (e.g. bg-[#EFE9D8]) — this preview
 * environment only ships Tailwind's core precompiled classes, so bracketed
 * arbitrary values silently no-op and break layout. Swap in your own Tailwind
 * config / real class names once this is inside your app, if you'd rather.
 *
 * Swap the <a> tags for next/link's <Link> when dropping this into the app.
 */

const PAGES = [
  { id: "groups", label: "Groups", href: "/groups", icon: Users },
  { id: "invites", label: "Invites", href: "/invites", icon: Mail },
  { id: "resteraunt", label: "Resteraunt Splitter", href: "/splitter", icon: ScanLine },
];

export default function NudgeNavBar() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Patrick+Hand&display=swap');

        .nudge-nav {
          position: relative;
          width: 100%;
          background: #E4DEC9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          box-sizing: border-box;
          box-shadow: 0 6px 0 #D8CFB0, 0 8px 14px rgba(42,59,85,0.15);
          transform: rotate(-0.4deg);
          clip-path: polygon(
            0% 2%, 3% 0%, 8% 1.5%, 14% 0%, 20% 1.2%, 26% 0%, 32% 1.5%,
            38% 0%, 44% 1%, 50% 0%, 56% 1.4%, 62% 0%, 68% 1%, 74% 0%,
            80% 1.5%, 86% 0%, 92% 1%, 97% 0%, 100% 2%, 100% 100%, 0% 100%
          );
        }

        .nudge-wordmark {
          font-family: 'Caveat', cursive;
          color: #2A3B55;
          font-size: 34px;
          line-height: 1;
          text-decoration: none;
          display: inline-flex;
          flex-direction: column;
          transform: rotate(-1deg);
        }

        .nudge-wordmark svg {
          margin-top: 2px;
          margin-left: 4px;
          opacity: 0.7;
        }

        .nudge-list {
          list-style: none;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          padding: 0;
        }

        .nudge-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 3px;
          font-family: 'Patrick Hand', cursive;
          font-size: 17px;
          color: #2A3B55;
          text-decoration: none;
          background: transparent;
          transition: background-color 0.2s ease;
          white-space: nowrap;
        }

        .nudge-tab svg.icon {
          opacity: 0.8;
          flex-shrink: 0;
        }

        .nudge-label-wrap {
          position: relative;
          display: inline-block;
        }

        .nudge-squiggle {
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 10px;
          pointer-events: none;
        }

        .nudge-squiggle path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 0.35s ease;
        }

        .nudge-tab:hover .nudge-squiggle path {
          stroke-dashoffset: 0;
        }

        .nudge-circle {
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          width: calc(100% + 16px);
          height: calc(100% + 16px);
          pointer-events: none;
        }

        .nudge-circle path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          transition: stroke-dashoffset 0.5s ease;
        }

        .nudge-tab.is-active .nudge-circle path {
          stroke-dashoffset: 0;
        }

        @media (max-width: 480px) {
          .nudge-nav { padding: 14px 16px; }
          .nudge-wordmark { font-size: 28px; }
          .nudge-tab { font-size: 14px; padding: 6px 8px; gap: 4px; }
          .nudge-list { gap: 2px; }
        }
      `}</style>

      <nav className="nudge-nav">
        <a href="/" className="nudge-wordmark">
          Nudge
          <svg width="70" height="10" viewBox="0 0 70 10">
            <path
              d="M2,5 C15,1 25,8 35,4 C45,0 55,7 68,3"
              fill="none"
              stroke="#A63D40"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </a>

        <ul className="nudge-list">
          {PAGES.map((page) => {
            const Icon = page.icon;
            const isActive = active === page.id;
            return (
              <li key={page.id}>
                <a
                  href={page.href}
                  onClick={(e) => {
                    e.preventDefault();
                    // setActive(page.id);
                  }}
                //   onMouseEnter={() => setHovered(page.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`nudge-tab${isActive ? " is-active" : ""}`}
                  style={{
                    backgroundColor:
                      hovered === page.id && !isActive
                        ? "rgba(232,200,110,0.35)"
                        : "transparent",
                  }}
                >
                  <Icon size={16} strokeWidth={2} className="icon" />
                  <span className="nudge-label-wrap">
                    {page.label}
                    {!isActive && (
                      <svg
                        viewBox="0 0 100 12"
                        preserveAspectRatio="none"
                        className="nudge-squiggle"
                      >
                        <path
                          d="M1,6 C15,1 30,11 45,5 C60,-1 75,10 99,4"
                          fill="none"
                          stroke="#8B8378"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          pathLength="1"
                        />
                      </svg>
                    )}
                  </span>

                  {isActive && (
                    <svg viewBox="0 0 130 46" className="nudge-circle">
                      <path
                        d="M20,8 C5,10 3,22 6,32 C9,41 25,44 45,43 C70,42 100,42 115,35 C127,29 126,14 112,8 C95,1 60,3 40,4 C28,4.5 12,6 8,14"
                        fill="none"
                        stroke="#A63D40"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        pathLength="1"
                      />
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}