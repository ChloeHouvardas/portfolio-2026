import type { ReactNode } from 'react'
import EmailButton from './EmailButton'
import ProjectsBody from './ProjectsBody'
import queensCrest from './media/queens-crest.svg'
import koreaUniversitySymbol from './media/korea-university-symbol.svg'

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

const ARTICLES = [
  {
    title: 'Finding success far from home',
    source: 'Queen’s Faculty of Arts and Science',
    href: 'https://www.queensu.ca/artsci/news/finding-success-far-from-home',
  },
  {
    title: 'ICS students win 2024 GenAI Hackathon',
    source: 'UC Irvine ICS',
    href: 'https://ics.uci.edu/2024/07/31/ics-students-win-2024-genai-hackathon/',
  },
  {
    title: 'McKinsey Canada Student Leadership Award winners',
    source: 'McKinsey & Company Canada',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7271848577771966464/',
  },
  {
    title: 'Computing student earns top honours at hackathon',
    source: 'Queen’s Faculty of Arts and Science',
    href: 'https://www.queensu.ca/artsci/news/computing-student-earns-top-honours-at-hackathon',
  },
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
            I&rsquo;m <strong>Chloe Houvardas</strong>, and I turn &ldquo;what if&rdquo; into
            working software. I&rsquo;m a CS + AI student at Queen&rsquo;s, with a soft spot for making things that feel a little magical.
            You can most likely find me on my laptop, birdwatching, or at a hackathon.
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
          <ul className="portfolio-schools">
            <li>
              <img className="portfolio-school-logo" src={queensCrest} alt="" />
              <div>
                <p className="portfolio-widget-headline">Bachelor of Computer Science</p>
                <p className="portfolio-widget-sub">Queen&rsquo;s University · 2023&nbsp;–&nbsp;2028</p>
                <p className="portfolio-widget-sub">
                  Minor in Statistics · Specialization in Artificial Intelligence
                </p>
              </div>
            </li>
            <li>
              <img className="portfolio-school-logo" src={koreaUniversitySymbol} alt="" />
              <div>
                <p className="portfolio-widget-headline">Exchange Semester</p>
                <p className="portfolio-widget-sub">Korea University · Fall 2025</p>
              </div>
            </li>
          </ul>
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

        <section className="portfolio-widget" aria-label="Fun facts">
          <h3 className="portfolio-widget-label">Fun facts!</h3>
          <ul className="portfolio-widget-list portfolio-bullets">
            <li>I am an avid birdwatcher</li>
            <li>I lived in Seoul, South Korea for 5 months</li>
            <li>I love gaming, and one of my favourites is Outer Wilds</li>
            <li>I played competitive volleyball for 8 years</li>
          </ul>
        </section>

        <section className="portfolio-widget" aria-label="Articles I'm in">
          <h3 className="portfolio-widget-label">Articles I&rsquo;m in!</h3>
          <ul className="portfolio-widget-list portfolio-bullets portfolio-articles">
            {ARTICLES.map((article) => (
              <li key={article.href}>
                <a href={article.href} target="_blank" rel="noreferrer noopener">
                  {article.title}
                </a>
                <span className="portfolio-widget-sub">{article.source}</span>
              </li>
            ))}
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
        <p>Always happy to chat!</p>
        <div className="portfolio-contacts">
          <EmailButton />
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
            href="https://www.linkedin.com/in/chloe-houvardas/"
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
