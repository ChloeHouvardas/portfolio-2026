import { useState } from 'react'
import ensembleStage from './media/ensemble-stage.jpg'
import ensembleConsole from './media/ensemble-console.jpg'
import ensembleWand from './media/ensemble-wand.jpg'
import paperCutsCover from './media/paper-cuts-cover.jpg'
import paperCutsModes from './media/paper-cuts-modes.jpg'
import paperCutsPlay from './media/paper-cuts-play.jpg'
import auctopusArtifacts from './media/auctopus-artifacts.jpg'
import auctopusPipeline from './media/auctopus-pipeline.jpg'
import auctopusMascot from './media/auctopus-mascot.jpg'
import prismHero from './media/prism-hero.jpg'
import prismCover from './media/prism-cover.jpg'
import prismExtension from './media/prism-extension.jpg'
import orcaEditor from './media/orca-editor.jpg'
import orcaCover from './media/orca-cover.jpg'
import orcaPipeline from './media/orca-pipeline.jpg'
import ghostwriterLanding from './media/ghostwriter-landing.jpg'
import ghostwriterEditor from './media/ghostwriter-editor.jpg'
import ghostwriterNotes from './media/ghostwriter-notes.jpg'
import arborrouteDashboard from './media/arborroute-dashboard.jpg'
import arborrouteLibrary from './media/arborroute-library.jpg'
import arborrouteStory from './media/arborroute-story.jpg'
import nucleusApp from './media/nucleus-app.jpg'
import nucleusTeam from './media/nucleus-team.jpg'
import nucleusDevs from './media/nucleus-devs.jpg'
import nucleusCards from './media/nucleus-cards.jpg'
import policyRoyaleApp from './media/policy-royale-app.jpg'
import policyRoyalePitch from './media/policy-royale-pitch.jpg'
import policyRoyaleStage from './media/policy-royale-stage.jpg'
import policyRoyaleAwards from './media/policy-royale-awards.jpg'
import policyRoyaleVenue from './media/policy-royale-venue.jpg'
import cleanRoomPoster from './media/clean-room-poster.jpg'
import cleanRoomFramework from './media/clean-room-framework.jpg'
import cleanRoomGenai from './media/clean-room-genai.jpg'
import biasBuddyCover from './media/bias-buddy-cover.jpg'

/** A gallery slide: 'image' is a still, 'video' a local mp4/webm, and
 *  'embed' a Vimeo or YouTube demo (mounted only while the card is open). */
type MediaItem =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; src: string }
  | { type: 'embed'; provider: 'vimeo' | 'youtube'; id: string }

interface Project {
  id: string
  name: string
  blurb: string
  detail: string
  hackathon: string
  /** Prizes exactly as Devpost lists them. Non-empty means the card wears
   *  the Winner ribbon. */
  awards: string[]
  tech: string
  /** Devpost page, or the public posts and articles that tell the story. */
  links: { label: string; href: string }[]
  github?: string
  media: MediaItem[]
}

/** Mirrors https://devpost.com/ToastDuck, newest first, plus wins that live
 *  outside Devpost: Nucleus (QTMA product team), Policy Royale (Fintech80
 *  Chengdu) and DataGuardians (Trustworthy AI Lab x GES). Winners are
 *  listed first at render time; see PROJECTS below. */
const ALL_PROJECTS: Project[] = [
  {
    id: 'ensemble',
    name: 'Ensemble',
    blurb: 'Conduct a room full of phones like an orchestra',
    detail:
      'Every audience phone becomes an instrument. A webcam reads one hand (open palm plays, fist pauses, pinch-drag rides tempo) while a physical wand answers the other: raise it and harmony blooms, swing it and chords break into arpeggios. An asyncio server schedules notes a few hundred milliseconds ahead on a shared clock, so dozens of independent phones stay in time, and each conductor cue is answered at the next bar by an AI-composed part.',
    hackathon: 'Hack the 6ix 2026',
    awards: [],
    tech: 'Python asyncio · WebSockets · Web Audio API · Arduino IMU · Gemini · Qwen',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/ensemble-jbgqrd' }],
    github: 'https://github.com/Jeremyliu-621/Phoneharmonic',
    media: [
      { type: 'image', src: ensembleStage, alt: 'A pixel-art orchestra with a laptop and phones playing together' },
      { type: 'embed', provider: 'vimeo', id: '1211164401' },
      { type: 'image', src: ensembleConsole, alt: 'The Ensemble conductor console with tracks, gestures and a webcam feed' },
      { type: 'image', src: ensembleWand, alt: 'The wand controller in use' },
    ],
  },
  {
    id: 'paper-cuts',
    name: 'Paper Cuts',
    blurb: 'Draw a doodle, watch it become a playable game piece',
    detail:
      'A creation-first game platform: sketch on an iPad or browser canvas, and a multi-tier perception stack (a custom CNN fast path, an open-vocabulary vision-language model, and retrieval over a Redis vector memory of every doodle drawn) names it. The sketch is re-synthesized into a clean sprite, a neuro-symbolic composer gives it mechanics, and it drops straight into a live arena where phones become gamepads via QR codes.',
    hackathon: 'UC Berkeley AI Hackathon 2026',
    awards: ["Grand Prize · Ddoski's Playground Track", 'Finalist', 'Best UI/UX'],
    tech: 'Vanilla JS · HTML5 Canvas · React · FastAPI · PyTorch · Stable Diffusion · Redis vector search · AWS Trainium',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/paper-cuts' }],
    github: 'https://github.com/Jeremyliu-621/paper-cuts',
    media: [
      { type: 'image', src: paperCutsCover, alt: 'Paper Cuts title art: a hand-drawn arena framed by crayons and pencils' },
      { type: 'embed', provider: 'vimeo', id: '1203255539' },
      { type: 'image', src: paperCutsModes, alt: 'The mode and arena picker, drawn in a sketchbook style' },
      { type: 'image', src: paperCutsPlay, alt: 'A match in progress between two doodled fighters' },
    ],
  },
  {
    id: 'auctopus',
    name: 'Auctopus',
    blurb: 'One pipeline from product idea to 3D prototype and feedback',
    detail:
      'Drop in a company name and some supporting documents and Auctopus runs the whole validation loop: Gemini researches the brand and maps the concept, Meshy turns it into an interactive GLB model, Veo generates a product video, five AI personas backed by Neo4j debate it live, and Cloudinary delivers a USDZ for Apple AR Quick Look. The stages run as one async chain in a Next.js route handler, streaming progress to the UI over Server-Sent Events.',
    hackathon: 'SOON Hackathon',
    awards: ['Cloudinary Track Winner', 'Polarity Track Winner'],
    tech: 'Next.js · Gemini · Cloudinary · Composio · Neo4j · Docker',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/auctopus' }],
    github: 'https://github.com/Jeremyliu-621/soon',
    media: [
      { type: 'image', src: auctopusArtifacts, alt: 'Auctopus output: a 3D model, AR Quick Look, reveal video and audience reaction' },
      { type: 'embed', provider: 'vimeo', id: '1190914114' },
      { type: 'image', src: auctopusPipeline, alt: 'The Auctopus pipeline streaming stage results' },
      { type: 'image', src: auctopusMascot, alt: 'A blocky mascot with a tiny octopus on its head' },
    ],
  },
  {
    id: 'prism',
    name: 'Prism',
    blurb: 'A Chrome extension that shows the full spectrum of the truth',
    detail:
      'Prism runs while you scroll social media and, instead of a binary true/false, labels which of eight kinds of misinformation a post might be (fabricated content, false context, satire, astroturfing and more). Claude reasons over the claims, Brave Search surfaces credible sources, and Google Vision traces where an image came from. I built the React extension UI and the FastAPI analysis backend with one teammate.',
    hackathon: 'HackHer 2026',
    awards: ['First Place'],
    tech: 'Chrome extension · React · FastAPI · Claude · Brave Search API · Google Vision API',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/prism-5j2tda' }],
    github: 'https://github.com/ChloeHouvardas/prism',
    media: [
      { type: 'image', src: prismHero, alt: 'Prism wordmark with a chrome cone and blue glass shape' },
      { type: 'embed', provider: 'vimeo', id: '1169279155' },
      { type: 'image', src: prismCover, alt: 'Prism cover art on a lime highlight' },
      { type: 'image', src: prismExtension, alt: 'The Prism extension flagging a post' },
    ],
  },
  {
    id: 'orca',
    name: 'Orca',
    blurb: 'Hum it, say it, and the composer agent builds the track',
    detail:
      'Record one take where you hum a melody and talk over it ("make this a piano, add a guitar backtrack"). A custom ML model segments speech from humming, singing and beatboxing; ElevenLabs transcribes the instructions; a quantizing audio-to-MIDI pipeline cleans up the notes; and a Gemini-driven agent picks the right editor tools to assemble the score you meant.',
    hackathon: 'QHacks 2026',
    awards: ['First Place'],
    tech: 'Next.js · FastAPI · Python · Gemini · ElevenLabs · Hugging Face · MCP',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/orca-4po0nm' }],
    github: 'https://github.com/Beebdoles/qhacks-2026',
    media: [
      { type: 'image', src: orcaEditor, alt: 'The Orca MIDI editor with a melody and drum track' },
      { type: 'embed', provider: 'vimeo', id: '1162996077' },
      { type: 'image', src: orcaCover, alt: 'A lavender orca with a music note on black' },
      { type: 'image', src: orcaPipeline, alt: 'Behind the scenes of the Orca audio pipeline' },
    ],
  },
  {
    id: 'ghostwriter',
    name: 'GhostWriter',
    blurb: 'Turn handwritten chaos into digital order',
    detail:
      'Photograph messy lecture notes on your phone and GhostWriter hands back a clean, editable document with LaTeX support. I built the Gemini calls that turn images into Markdown and LaTeX (equations included), wired them into a Notion-style BlockNote editor, and designed the mobile capture flow that beams photos to the desktop over Socket.IO and QR codes.',
    hackathon: 'ConUHacks X',
    awards: [],
    tech: 'React · Flask · Gemini · BlockNote · Cloudflare · Socket.IO',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/ghostwriter-dwsn7l' }],
    github: 'https://github.com/ChloeHouvardas/GhostWriter',
    media: [
      { type: 'image', src: ghostwriterLanding, alt: 'GhostWriter landing page with an upload area for handwritten notes' },
      { type: 'embed', provider: 'vimeo', id: '1158057020' },
      { type: 'image', src: ghostwriterEditor, alt: 'Converted notes inside the block editor' },
      { type: 'image', src: ghostwriterNotes, alt: 'Handwritten notes next to their typed version' },
    ],
  },
  {
    id: 'nucleus',
    name: 'Nucleus',
    blurb: 'The all-in-one student planner used by 100+ Queen\'s students',
    detail:
      'Upload a course syllabus and Nucleus reads the assignments, weights and due dates out of it with an LLM, breaks them into AI-generated subtasks, and lines them up with your D2L courses in one dashboard. Built over a full year with the Queen\'s Technology & Media Association product team, from ideation to a public launch, and used by over 100 Queen\'s students. I contributed as a software developer across the React front end and the Spring Boot API.',
    hackathon: 'QTMA Product Teams 2024–25',
    awards: ['McKinsey Demo Day Winner'],
    tech: 'React · Tailwind · Spring Boot · Java · MongoDB · OpenAI · Google OAuth',
    links: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/feed/update/urn:li:activity:7309722856366460929/',
      },
    ],
    github: 'https://github.com/kayne-lee/team-MC',
    media: [
      { type: 'image', src: nucleusApp, alt: 'Nucleus on a laptop: a course page with quizzes, assignments and a grade calculator' },
      { type: 'image', src: nucleusCards, alt: 'A Nucleus day card listing tasks grouped by course' },
      { type: 'image', src: nucleusTeam, alt: 'The Nucleus team in front of a green wall at the McKinsey Toronto office' },
      { type: 'image', src: nucleusDevs, alt: 'Four Nucleus developers making W signs' },
    ],
  },
  {
    id: 'arborroute',
    name: 'ArborRoute',
    blurb: 'A Fitbit and Strava for tree planters',
    detail:
      'A hardware-software pair for reforestation crews: an Arduino with an accelerometer and buzzer warns planters before they double-plant inside the six-foot spacing, and a full-stack web app grows a "forest library" of each shift. Our first hardware hack, built from proximity tracking up to data visualization.',
    hackathon: 'QHacks 2025',
    awards: [],
    tech: 'Arduino · C++ · React · TypeScript · Flask · Python · OpenAI',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/arborroute' }],
    github: 'https://github.com/ChloeHouvardas/planter-pal',
    media: [
      { type: 'image', src: arborrouteDashboard, alt: 'ArborRoute dashboard with a live acceleration axis and a low-poly tree' },
      { type: 'embed', provider: 'youtube', id: 'fCD0U-s0Ruw' },
      { type: 'image', src: arborrouteLibrary, alt: 'The forest library of planted trees' },
      { type: 'image', src: arborrouteStory, alt: 'The story tree view' },
    ],
  },
  {
    id: 'policy-royale',
    name: 'Policy Royale',
    blurb: 'An AI underwriter and dynamic policy tool for autonomous-vehicle insurance',
    detail:
      'Built in 80 hours at the Fintech80 hackathon in Chengdu, where our team, the Data Queens, was the only Canadian entry among eight invited universities from the United States, Switzerland, Singapore, Hong Kong and mainland China. Policy Royale drafts personalised insurance policies for autonomous vehicles from a driver profile, vehicle specs and accident history: a retrieval-augmented pipeline over Azure OpenAI and LangChain generates the policy, scores the vehicle\'s safety features, and reprices the premium live as driving behaviour like speed and aggression changes. The Vue front end works on phone and desktop. After pitching to more than twenty government and industry judges we took the first-place Trailblazer prize.',
    hackathon: 'Fintech80 Chengdu Hackathon 2024',
    awards: ['First Place · Trailblazer Prize'],
    tech: 'Vue.js · Flask · Python · Azure OpenAI · LangChain · RAG · vector embeddings',
    links: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/posts/chloe-houvardas_no-way-that-just-happened-we-just-won-a-activity-7260454922960171008-9nxv',
      },
      { label: 'Live demo', href: 'https://jazzy-madeleine-4ecbee.netlify.app/' },
      { label: 'Backend', href: 'https://github.com/ChloeHouvardas/chengdu80-backend' },
    ],
    github: 'https://github.com/ChloeHouvardas/fintech-80',
    media: [
      { type: 'image', src: policyRoyaleApp, alt: 'Policy Royale on the presentation screen next to a countdown timer' },
      { type: 'image', src: policyRoyalePitch, alt: 'Chloe pitching Policy Royale to the judges' },
      { type: 'image', src: policyRoyaleStage, alt: 'Team Queen\'s University of Canada celebrating on the Fintech80 stage' },
      { type: 'image', src: policyRoyaleAwards, alt: 'The Data Queens receiving first-place awards and medals' },
      { type: 'image', src: policyRoyaleVenue, alt: 'The Fintech80 Chengdu 2024 competitor wall' },
    ],
  },
  {
    id: 'clean-room',
    name: 'DataGuardians',
    blurb: 'A confidential data clean room on Intel TDX with TPM attestation',
    detail:
      'First place at the 2024 GenAI Hackathon, a month-long online event run by UCLA\'s Trustworthy AI Lab and the Global Entrepreneurship Society. An advertiser and a publisher each hold confidential data, so we built a clean room on an Azure Confidential VM where nothing is decrypted until the enclave proves itself: TPM endorsement and attestation keys, hashes of every script and dataset extended into platform configuration registers, and a remote key server that verifies the quote before releasing the wrapper key. Inside it we trained a click-through-rate model and a generative adversarial network that emits a synthetic replica dataset safe to use outside the room.',
    hackathon: '2024 GenAI Hackathon · Trustworthy AI Lab x GES at UCLA',
    awards: ['First Place'],
    tech: 'Intel TDX · TPM 2.0 attestation · Azure Confidential VMs · tpm2-tools · Python · GAN · AES',
    links: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/posts/chloe-houvardas_after-a-month-of-planning-analyzing-coding-activity-7214088163940560897-whiQ',
      },
      {
        label: 'UCI article',
        href: 'https://ics.uci.edu/2024/07/31/ics-students-win-2024-genai-hackathon/',
      },
    ],
    github: 'https://github.com/ChloeHouvardas/CC-TPM-Attestation',
    media: [
      { type: 'image', src: cleanRoomPoster, alt: 'Trustworthy AI Lab x GES at UCLA hackathon poster' },
      { type: 'image', src: cleanRoomFramework, alt: 'Diagram of the clean room: evidence gathered in the VM guest TEE, then a quote verified by a key server before the model and data are decrypted' },
      { type: 'image', src: cleanRoomGenai, alt: 'UC Irvine article banner for the 2024 GenAI Hackathon win' },
    ],
  },
  {
    id: 'bias-buddy',
    name: 'Bias Buddy',
    blurb: 'Your best buddy for finding the bias in your data and models',
    detail:
      'Upload a CSV and Bias Buddy trains a random-forest model on it, then uses SHAP values to surface which features (gender, education level and the like) are driving predictions such as salary or loan approval. A Llama 2 assistant explains what kind of bias that suggests and how to fix it. I built the model training and SHAP analysis on the backend.',
    hackathon: 'QHacks 2024',
    awards: [],
    tech: 'Python · Flask · scikit-learn random forest · SHAP · pandas · Llama 2',
    links: [{ label: 'Devpost', href: 'https://devpost.com/software/bias-buddy-qhcrvl' }],
    media: [{ type: 'image', src: biasBuddyCover, alt: "Bias Buddy's Devpost cover: a tabby cat on a festive tablecloth" }],
  },
]

/** Winners first, then the rest — each group keeps its newest-first order. */
const PROJECTS: Project[] = [
  ...ALL_PROJECTS.filter((p) => p.awards.length > 0),
  ...ALL_PROJECTS.filter((p) => p.awards.length === 0),
]

const EMBED_SRC = {
  vimeo: (id: string) => `https://player.vimeo.com/video/${id}?dnt=1`,
  youtube: (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
}

function WinnerRibbon() {
  return (
    <span className="portfolio-project-winner">
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M5.2 9.6 4 15l4-2 4 2-1.2-5.4" fill="currentColor" opacity="0.55" />
        <circle cx="8" cy="6" r="4.6" fill="currentColor" />
        <path
          d="m8 3.6.85 1.75 1.9.28-1.38 1.35.33 1.9L8 7.98l-1.7.9.33-1.9-1.38-1.35 1.9-.28z"
          fill="#fff"
        />
      </svg>
      Winner
    </span>
  )
}

export default function ProjectsBody() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <ul className="portfolio-projects">
      {PROJECTS.map((p) => {
        const isOpen = openId === p.id
        const won = p.awards.length > 0
        return (
          <li
            key={p.id}
            className={
              [
                'portfolio-project',
                isOpen && 'portfolio-project--open',
                won && 'portfolio-project--winner',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            <button
              type="button"
              className="portfolio-project-toggle"
              aria-expanded={isOpen}
              aria-controls={`portfolio-project-${p.id}`}
              onClick={() => setOpenId(isOpen ? null : p.id)}
            >
              <span>
                <span className="portfolio-project-name">
                  {p.name}
                  {won && <WinnerRibbon />}
                </span>
                <span className="portfolio-project-blurb">{p.blurb}</span>
              </span>
              <span className="portfolio-project-chevron" aria-hidden="true">
                ›
              </span>
            </button>
            <div className="portfolio-project-details" id={`portfolio-project-${p.id}`}>
              <div className="portfolio-project-details-inner">
                <div className="portfolio-project-details-content">
                  <div
                    className="portfolio-project-gallery"
                    role="group"
                    aria-label={`${p.name} gallery`}
                  >
                    {p.media.map((m) => {
                      if (m.type === 'embed') {
                        // Mounted only while expanded so collapsed cards
                        // don't load third-party players in the background.
                        return isOpen ? (
                          <iframe
                            key={m.id}
                            className="portfolio-project-slide portfolio-project-slide--embed"
                            src={EMBED_SRC[m.provider](m.id)}
                            title={`${p.name} demo video`}
                            loading="lazy"
                            allow="fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : null
                      }
                      if (m.type === 'video') {
                        return (
                          <video
                            key={m.src}
                            className="portfolio-project-slide"
                            src={m.src}
                            controls
                            playsInline
                            preload="metadata"
                          />
                        )
                      }
                      return (
                        <img
                          key={m.src}
                          className="portfolio-project-slide"
                          src={m.src}
                          alt={m.alt}
                          loading="lazy"
                        />
                      )
                    })}
                  </div>
                  <p className="portfolio-project-event">
                    <span className="portfolio-project-hackathon">{p.hackathon}</span>
                    {p.awards.map((award) => (
                      <span key={award} className="portfolio-project-award">
                        {award}
                      </span>
                    ))}
                  </p>
                  <p>{p.detail}</p>
                  <p className="portfolio-project-tech">{p.tech}</p>
                  <p className="portfolio-project-links">
                    {p.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    ))}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
