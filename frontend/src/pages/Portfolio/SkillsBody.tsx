import { useState, type CSSProperties } from 'react'
import { GLYPHS, type Glyph } from './skillGlyphs'

/** A skill's icon: a Simple Icons brand glyph, or a monogram for brands the
 *  icon set doesn't carry (AWS and friends), or a drawn database glyph. */
type Icon = Glyph | { monogram: string; color: string } | 'database'

interface Skill {
  name: string
  icon: Icon
}

interface SkillGroup {
  label: string
  skills: Skill[]
}

/** Technical Skills, exactly as the resume groups them. */
const GROUPS: SkillGroup[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Python', icon: GLYPHS.python },
      { name: 'PHP', icon: GLYPHS.php },
      { name: 'Java', icon: GLYPHS.openjdk },
      { name: 'TypeScript', icon: GLYPHS.typescript },
      { name: 'JavaScript', icon: GLYPHS.javascript },
      { name: 'C++', icon: GLYPHS.cplusplus },
      { name: 'SQL', icon: 'database' },
    ],
  },
  {
    label: 'Frameworks & AI/ML',
    skills: [
      { name: 'FastAPI', icon: GLYPHS.fastapi },
      { name: 'Spring Boot', icon: GLYPHS.springboot },
      { name: 'Laravel', icon: GLYPHS.laravel },
      { name: 'React', icon: GLYPHS.react },
      { name: 'Next.js', icon: GLYPHS.nextdotjs },
      { name: 'PyTorch', icon: GLYPHS.pytorch },
      { name: 'XGBoost', icon: { monogram: 'XGB', color: '#1A7FC1' } },
      { name: 'LangChain', icon: GLYPHS.langchain },
      { name: 'Gemini API', icon: GLYPHS.googlegemini },
    ],
  },
  {
    label: 'Cloud, Data & Tools',
    skills: [
      { name: 'AWS', icon: { monogram: 'aws', color: '#232F3E' } },
      { name: 'S3', icon: { monogram: 'S3', color: '#3F8624' } },
      { name: 'DynamoDB', icon: { monogram: 'DDB', color: '#3B48CC' } },
      { name: 'Redis', icon: GLYPHS.redis },
      { name: 'PostgreSQL', icon: GLYPHS.postgresql },
      { name: 'Vercel', icon: GLYPHS.vercel },
      { name: 'Docker', icon: GLYPHS.docker },
      { name: 'Terraform', icon: GLYPHS.terraform },
      { name: 'GitHub Actions', icon: GLYPHS.githubactions },
      { name: 'Jest', icon: GLYPHS.jest },
      { name: 'Playwright', icon: { monogram: 'PW', color: '#2EAD33' } },
    ],
  },
]

const ALL = GROUPS.flatMap((g) => g.skills)
/** Two marquee rows drifting in opposite directions. */
const ROWS = [ALL.slice(0, 14), ALL.slice(14)]

function SkillIcon({ icon }: { icon: Icon }) {
  if (icon === 'database') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#4479A1" strokeWidth="1.9">
        <ellipse cx="12" cy="5.5" rx="7.5" ry="2.9" />
        <path d="M4.5 5.5v13c0 1.6 3.4 2.9 7.5 2.9s7.5-1.3 7.5-2.9v-13" />
        <path d="M4.5 12c0 1.6 3.4 2.9 7.5 2.9s7.5-1.3 7.5-2.9" />
      </svg>
    )
  }
  if ('monogram' in icon) {
    const aws = icon.monogram === 'aws'
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <text
          x="12"
          y={aws ? 13 : 16}
          textAnchor="middle"
          fill={icon.color}
          fontSize={icon.monogram.length > 2 ? 9 : 11}
          fontWeight="700"
          letterSpacing="-0.3"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"
        >
          {icon.monogram}
        </text>
        {aws && (
          /* The AWS smile-arrow, drawn in its orange. */
          <path
            d="M5.5 16.2c3.8 2.4 9.2 2.4 12.6 0M16 15.2l2.3.9-.6 2.3"
            fill="none"
            stroke="#FF9900"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={icon.color}>
      <path d={icon.path} />
    </svg>
  )
}

export default function SkillsBody() {
  const [paused, setPaused] = useState(false)
  let order = 0

  return (
    <>
      <div className="portfolio-skills-intro">
        <p>Tools I reach for, from model to deploy:</p>
        <button
          type="button"
          className="portfolio-marquee-toggle"
          aria-pressed={paused}
          aria-label={paused ? 'Play logo ticker' : 'Pause logo ticker'}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3.5" y="2.75" width="3" height="10.5" rx="1" />
              <rect x="9.5" y="2.75" width="3" height="10.5" rx="1" />
            </svg>
          )}
        </button>
      </div>

      {/* Decorative ticker; the grids below carry the same content. */}
      <div className="portfolio-marquee" data-paused={paused} aria-hidden="true">
        {ROWS.map((row, r) => (
          <div key={r} className={`portfolio-marquee-track${r === 1 ? ' portfolio-marquee-track--reverse' : ''}`}>
            {[...row, ...row].map((skill, i) => (
              <span key={i} className="portfolio-marquee-chip">
                <SkillIcon icon={skill.icon} />
                {skill.name}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="portfolio-skill-groups">
        {GROUPS.map((group) => (
          <section key={group.label} className="portfolio-widget" aria-label={group.label}>
            <h3 className="portfolio-widget-label">{group.label}</h3>
            <ul className="portfolio-skill-grid">
              {group.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="portfolio-skill"
                  style={{ '--i': order++ } as CSSProperties}
                >
                  <span className="portfolio-skill-icon">
                    <SkillIcon icon={skill.icon} />
                  </span>
                  <span className="portfolio-skill-name">{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
