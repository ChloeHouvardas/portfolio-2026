import type { ReactNode } from 'react'
import ProjectsBody from './ProjectsBody'

export type SectionId = 'about' | 'projects' | 'skills' | 'contact'

export interface Section {
  id: SectionId
  label: string
  title: string
  body: ReactNode
}

export const TAGLINE = 'Hey! Welcome to my little corner of the sky :-)'

const SKILLS = [
  'TypeScript',
  'React',
  'three.js',
  'GLSL',
  'Canvas 2D',
  'CSS',
  'Vite',
  'Playwright',
  'Node.js',
  'pnpm',
]

export const SECTIONS: Section[] = [
  {
    id: 'about',
    label: 'About',
    title: 'About',
    body: (
      <div className="portfolio-bento">
        <section className="portfolio-widget portfolio-widget--wide" aria-label="Introduction">
          <h3 className="portfolio-widget-label">Hello</h3>
          <p className="portfolio-lede">
            I&rsquo;m <strong>Chloe Houvardas</strong> — a developer who likes the corner of the
            web where engineering meets play. This site is my sketchbook of generative scenes:
            everything is drawn by code and tuned to run smoothly on a phone.
          </p>
        </section>

        <section className="portfolio-widget portfolio-widget--tall" aria-label="Work experience">
          <h3 className="portfolio-widget-label">Experience</h3>
          <ul className="portfolio-timeline">
            <li>
              <strong>Software Engineer Intern</strong>
              <span className="portfolio-timeline-company">CIBC</span>
              <span className="portfolio-timeline-when">Sep 2026 – Present</span>
              <span className="portfolio-timeline-desc">AI Applications Team</span>
            </li>
            <li>
              <strong>Software Engineer Intern</strong>
              <span className="portfolio-timeline-company">Chatforce</span>
              <span className="portfolio-timeline-when">May – Jun 2026</span>
              <span className="portfolio-timeline-desc">Agentic harness for game development</span>
            </li>
            <li>
              <strong>Sales and Trading Intern</strong>
              <span className="portfolio-timeline-company">National Bank of Canada</span>
              <span className="portfolio-timeline-when">May – Aug 2025</span>
              <span className="portfolio-timeline-desc">ETFs and Electronic Trading Team</span>
            </li>
            <li>
              <strong>Data Analyst Intern</strong>
              <span className="portfolio-timeline-company">Statistics Canada</span>
              <span className="portfolio-timeline-when">May – Oct 2024</span>
              <span className="portfolio-timeline-desc">Transport Canada Rail Team</span>
            </li>
            <li>
              <strong>Volleyball Coach</strong>
              <span className="portfolio-timeline-company">JAM</span>
              <span className="portfolio-timeline-when">Apr – Sep 2024</span>
              <span className="portfolio-timeline-desc">Volleyball training for adult athletes</span>
            </li>
            <li>
              <strong>Software Engineer Intern</strong>
              <span className="portfolio-timeline-company">Digitera.Interactive</span>
              <span className="portfolio-timeline-when">Jun – Sep 2023</span>
              <span className="portfolio-timeline-desc">Marketplace platform for high school events</span>
            </li>
            <li>
              <strong>Software Engineer Intern</strong>
              <span className="portfolio-timeline-company">Digitera.Interactive</span>
              <span className="portfolio-timeline-when">Feb – Jun 2022</span>
              <span className="portfolio-timeline-desc">Co-op · Remote</span>
            </li>
          </ul>
        </section>

        <section className="portfolio-widget" aria-label="Education">
          <h3 className="portfolio-widget-label">Education</h3>
          <p className="portfolio-widget-headline">Bachelor of Computer Science</p>
          <p className="portfolio-widget-sub">Queen&rsquo;s University · 2023 – 2028</p>
          <p className="portfolio-widget-sub">
            Minor in Statistics · Specialization in Artificial Intelligence
          </p>
          <p className="portfolio-widget-sub">
            Coursework: Algorithms, Artificial Intelligence, Linear Algebra, Data Structures, Calculus, Statistics
          </p>
        </section>

        <section className="portfolio-widget" aria-label="Extracurricular experience">
          <h3 className="portfolio-widget-label">Extracurricular experience</h3>
          <ul className="portfolio-timeline">
            <li>
              <strong>Director of Developers</strong>
              <span className="portfolio-timeline-company">Queen&rsquo;s Technology &amp; Media Association (QTMA)</span>
              <span className="portfolio-timeline-when">Mar 2024 – Present</span>
              <span className="portfolio-timeline-desc">Prev. Co-Chair (2025–2026) · Prev. Developer, Team Nucleus (2024–2025)</span>
            </li>
            <li>
              <strong>Member</strong>
              <span className="portfolio-timeline-company">Rewriting the Code</span>
              <span className="portfolio-timeline-when">Jul 2024 – Present</span>
            </li>
            <li>
              <strong>Technical Consultant</strong>
              <span className="portfolio-timeline-company">Queen&rsquo;s Startup Consulting (QSC)</span>
              <span className="portfolio-timeline-when">Mar 2024 – Mar 2025</span>
            </li>
            <li>
              <strong>Artificial Intelligence Engineer</strong>
              <span className="portfolio-timeline-company">QMIND</span>
              <span className="portfolio-timeline-when">Oct 2023 – Mar 2024</span>
              <span className="portfolio-timeline-desc">Collaborated with a Fortune 500 company to build a prototype secure AI marketing email tool</span>
            </li>
            <li>
              <strong>Orientation Leader</strong>
              <span className="portfolio-timeline-company">Queen&rsquo;s University</span>
              <span className="portfolio-timeline-when">Aug 2024</span>
            </li>
          </ul>
        </section>

        <section className="portfolio-widget" aria-label="Extracurriculars">
          <h3 className="portfolio-widget-label">Beyond class</h3>
          <ul className="portfolio-widget-list">
            <li>Design society — poster nights &amp; crit sessions</li>
            <li>Robotics club — vision subteam</li>
            <li>Hackathons — 6 weekends, 2 wins</li>
            <li>Sunrise running crew</li>
          </ul>
        </section>

        <section className="portfolio-widget" aria-label="Fun facts">
          <h3 className="portfolio-widget-label">Fun facts</h3>
          <ul className="portfolio-widget-list">
            <li>You&rsquo;re currently flying through 8,000 clouds</li>
            <li>Can solve a Rubik&rsquo;s cube in under two minutes</li>
            <li>Firm believer that the best debugging tool is a walk</li>
          </ul>
        </section>
      </div>
    ),
  },
  {
    id: 'projects',
    label: 'Projects',
    title: 'Projects',
    body: <ProjectsBody />,
  },
  {
    id: 'skills',
    label: 'Skills',
    title: 'Skills',
    body: (
      <>
        <p>Tools I reach for, from shader to test suite:</p>
        <ul className="portfolio-skills">
          {SKILLS.map((skill) => (
            <li key={skill} className="portfolio-chip">
              {skill}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Contact',
    body: (
      <>
        <p>Always happy to talk shop, side quests, or clouds.</p>
        <div className="portfolio-contacts">
          <a
            className="portfolio-contact portfolio-contact--primary"
            href="mailto:hello@example.com"
          >
            hello@example.com
          </a>
          <a
            className="portfolio-contact"
            href="https://github.com/ChloeHouvardas"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
          <a
            className="portfolio-contact"
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            LinkedIn
          </a>
        </div>
      </>
    ),
  },
]
