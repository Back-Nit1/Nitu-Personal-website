import type { AtlasNode } from './types.ts'

export const structure: AtlasNode[] = [
  {
    id: 'root',
    slug: '',
    kind: 'root',
    title: 'nitu',
    eyebrow: 'CS and neuroscience at Rutgers',
  },

  {
    id: 'story',
    kind: 'section',
    title: 'My story',
    parent: 'root',
    eyebrow: 'How I got here',
    lead: 'I build software: full stack products, applied ML, and agents.',
    body: [
      'I started out premed and moved into engineering after building my first startup, with night shifts at Penn Medicine and shadowing at RWJ along the way. I’m studying computer science alongside cell biology and neuroscience. Patient care and lab work are part of how I got here, and they still shape what I choose to build.',
    ],
  },
  {
    id: 'experience',
    kind: 'section',
    title: 'Experience',
    parent: 'root',
    eyebrow: 'Where I’ve worked',
    lead: 'Software engineering, applied AI, and product work.',
    body: [
      'Most of it is engineering: a production mobile client, an AI game design prototype, clinical note extraction, and two companies I helped start.',
    ],
  },
  {
    id: 'projects',
    kind: 'section',
    title: 'Projects',
    parent: 'root',
    eyebrow: 'What I’ve built',
    lead: 'Seventeen builds. Some shipped, some are still experiments.',
    body: [
      'They’re grouped by the question each one is chasing. Each entry says what it actually is: a simulation, a prototype, a shipped product, or an idea still on the bench.',
    ],
  },
  {
    id: 'research',
    kind: 'section',
    title: 'Research',
    parent: 'root',
    eyebrow: 'What I’m curious about',
    lead: 'How brains work, how machines learn to act, and how to trust what an agent tells you.',
    body: [
      'My research background is in neuroscience. My current questions are about learning systems and the checks that make them dependable.',
    ],
  },
  {
    id: 'offduty',
    slug: 'off-duty',
    kind: 'section',
    title: 'Off duty',
    parent: 'root',
    eyebrow: 'Away from work',
    lead: 'Books, volleyball, games, invented worlds, and an unreasonable fondness for Greek names.',
    body: ['These feed the work more than I expected them to.'],
  },
  {
    id: 'connect',
    kind: 'section',
    title: 'Connect',
    parent: 'root',
    eyebrow: 'Say hello',
    lead: 'I like working with people who are building around a problem they’ve actually felt.',
    body: [
      'I’m most useful where software meets healthcare, learning, or machine learning: early products, research tooling, simulation environments, and agents that have to prove what they did.',
      'I’m based in the New Jersey and New York City area, studying at Rutgers New Brunswick.',
    ],
  },

  {
    id: 'autonomy',
    kind: 'group',
    title: 'Autonomy & RL',
    parent: 'projects',
    eyebrow: 'Project group',
    lead: 'Simulated worlds where many agents learn to move without colliding, with each other or with the rules.',
  },
  {
    id: 'agents',
    kind: 'group',
    title: 'Agents & reliability',
    parent: 'projects',
    eyebrow: 'Project group',
    lead: 'Agents and automations built around one question: how do you know it did the right thing?',
  },
  {
    id: 'health',
    kind: 'group',
    title: 'Health & biology',
    parent: 'projects',
    eyebrow: 'Project group',
    lead: 'Tools for researchers and for the paperwork that stands between a patient and care.',
  },
  {
    id: 'products',
    kind: 'group',
    title: 'Games & products',
    parent: 'projects',
    eyebrow: 'Project group',
    lead: 'Things made for people to use, and ideally enjoy using.',
  },
  {
    id: 'workbench',
    kind: 'group',
    title: 'The workbench',
    parent: 'projects',
    eyebrow: 'Project group',
    lead: 'Smaller experiments, assessments, and concepts. Not flagship work, but part of how I learn.',
  },
]
