import type { ReactNode } from 'react'

/**
 * Panel
 * -----------------------------------------------------------------
 * Owns the outer "torn notebook page" shape used by the auth screens
 * (login today, register next) — the paper card, the red margin
 * rule, the ruled-line background, and the eyebrow/title/subtitle
 * block. The page itself (LoginPage, RegisterPage, ...) is only
 * responsible for what goes *inside*: the form fields, the error
 * copy, and any links below the form.
 *
 * Usage:
 *   <Panel eyebrow="— testing notebook —" title="Sign in" subtitle="Pick up where you left off.">
 *     <form>...</form>
 *   </Panel>
 */

export interface PanelProps {
  /** Small uppercase label above the title, e.g. "— testing notebook —" */
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
}

export default function Panel({ eyebrow, title, subtitle, children }: PanelProps) {
  return (
    <div className="wrap">
      <div className="page">
        <div className="margin-rule" />
        <div className="content">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="title">{title}</h1>
          {subtitle && <p className="sub">{subtitle}</p>}

          {children}
        </div>
      </div>

      <style jsx>{`
        .wrap {
          --paper: #ede6d3;
          --paper-shadow: #dcd3b8;
          --ink: #22283b;
          --graphite: #6b6458;
          --wax-red: #b33a3a;
          --rule-blue: #a9bbd1;

          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 2rem;
          background: var(--paper-shadow);
          background-image: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 60%);
        }

        .page {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--paper);
          box-shadow: 0 18px 40px rgba(34, 40, 59, 0.18), 0 2px 0 rgba(34, 40, 59, 0.05);
          clip-path: polygon(
            0% 4px, 5% 0px, 11% 5px, 17% 1px, 23% 6px, 29% 0px, 35% 4px,
            41% 1px, 47% 5px, 53% 0px, 59% 6px, 65% 1px, 71% 5px,
            77% 0px, 83% 6px, 89% 1px, 95% 5px, 100% 0px,
            100% 100%, 0% 100%
          );
        }

        .margin-rule {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 44px;
          width: 1px;
          background: var(--wax-red);
          opacity: 0.55;
        }

        .content {
          padding: 48px 40px 40px 68px;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 35px,
            var(--rule-blue) 36px
          );
          background-position: 0 96px;
        }

        .eyebrow {
          font-family: 'Special Elite', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--graphite);
          margin: 0 0 4px;
        }

        .title {
          font-family: 'Special Elite', monospace;
          font-weight: 700;
          font-size: 52px;
          line-height: 1;
          color: var(--ink);
          margin: 0 0 6px;
          transform: rotate(-1deg);
        }

        .sub {
          font-family: var(--font-serif);
          font-size: 15px;
          color: var(--graphite);
          margin: 0 0 28px;
        }

        @media (max-width: 420px) {
          .content {
            padding: 40px 24px 32px 48px;
          }
          .margin-rule {
            left: 28px;
          }
          .title {
            font-size: 42px;
          }
        }
      `}</style>
    </div>
  )
}