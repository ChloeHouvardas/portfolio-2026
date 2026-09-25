import type { ReactNode } from 'react'
import ProjectsBody from './ProjectsBody'

export type SectionId = 'about' | 'projects' | 'skills' | 'contact'

export interface Section {
  id: SectionId
  label: string
  title: string
  body: ReactNode
}

export const TAGLINE = 'Building playful, performant things for the web.'

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

        <section className="portfolio-widget" aria-label="Work experience">
          <h3 className="portfolio-widget-label">Experience</h3>
          <ul className="portfolio-timeline">
            <li>
              <span className="portfolio-timeline-when">2025</span>
              <div>
                <strong>Software Engineer Intern</strong>
                <span>SampleCo — shipped web tooling used by 3 teams</span>
              </div>
            </li>
            <li>
              <span className="portfolio-timeline-when">2024</span>
              <div>
                <strong>Web Developer</strong>
                <span>Campus Innovation Lab — built interactive data stories</span>
              </div>
            </li>
            <li>
              <span className="portfolio-timeline-when">2023</span>
              <div>
                <strong>Teaching Assistant</strong>
                <span>Intro to Programming — led weekly labs of 30 students</span>
              </div>
            </li>
          </ul>
        </section>

        <section className="portfolio-widget" aria-label="Education">
          <h3 className="portfolio-widget-label">Education</h3>
          <p className="portfolio-widget-headline">B.S. Computer Science</p>
          <p className="portfolio-widget-sub">Sample University · 2022 – 2026</p>
          <p className="portfolio-widget-sub">
            Coursework: graphics, distributed systems, human-computer interaction
          </p>
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
