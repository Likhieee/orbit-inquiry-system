import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, UserRoundX } from 'lucide-react';
import Nav from '../components/Nav.jsx';
import Brand from '../components/Brand.jsx';
import KineticText from '../components/KineticText.jsx';
import OrbitScene from '../components/OrbitScene.jsx';
import SpotlightCard from '../components/SpotlightCard.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { CATEGORIES, USER_TYPES, STARTERS } from '../lib/constants.js';

const grid = {
  scholarship: 'md:col-span-2 md:row-span-2',
  admission: 'md:col-span-2',
  concert: 'md:col-span-1',
  general_query: 'md:col-span-1',
};

const WHO = {
  parent: 'Fees, scholarships and admission dates for your child.',
  student: 'Scholarship eligibility, concert registration and how to apply.',
  school: 'Group bookings, partnerships and campus visits.',
};

const STEPS = [
  ['You send the form', 'Pick who you are and what you need. It takes about a minute.'],
  ['The team picks it up', 'Your inquiry lands in one inbox where staff can see it and take it on.'],
  ['You hear back', 'Someone replies to you by email or phone.'],
];

export default function Landing() {
  document.title = 'Orbit | Send an inquiry';
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-signal/25 blur-3xl animate-drift" />
            <div className="absolute right-0 top-10 h-[380px] w-[380px] rounded-full bg-ultra/20 blur-3xl animate-drift [animation-delay:-6s]" />
            <div className="absolute bottom-0 left-1/3 h-[320px] w-[320px] rounded-full bg-aqua/20 blur-3xl animate-drift [animation-delay:-12s]" />
            <div className="dot-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
            <div>
              <h1 className="text-[2.5rem] font-extrabold leading-[1.06] sm:text-6xl">
                <KineticText text="Ask us about admissions, scholarships and concerts." delay={0.1} />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="mt-6 max-w-lg text-lg leading-relaxed text-ink-600"
              >
                Tell us who you are and what you need. The right person gets back to you by email or phone.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Link to="/inquiry" className="btn-primary">Send an inquiry</Link>
                <a href="#topics" className="btn-ghost">See what you can ask</a>
              </motion.div>
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.25, duration: 0.6 }}
                className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium text-ink-600"
              >
                <li className="flex items-center gap-2"><Clock size={17} className="text-signal" aria-hidden="true" /> About a minute to fill</li>
                <li className="flex items-center gap-2"><UserRoundX size={17} className="text-signal" aria-hidden="true" /> No account needed</li>
              </motion.ul>
            </div>
            <OrbitScene className="mt-4 lg:mt-0" />
          </div>
        </section>

        {/* Topics: bento grid. Each card opens the form with that category already chosen */}
        <section id="topics" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Pick a topic and we will start the form for you</h2>
          <motion.div
            className="mt-10 grid gap-4 md:grid-cols-4 md:auto-rows-[minmax(190px,auto)]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          >
            {CATEGORIES.map((c) => (
              <motion.div
                key={c.value}
                className={grid[c.value]}
                variants={{ hidden: { opacity: 0, scale: 0.94, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } } }}
              >
                <SpotlightCard
                  as={Link}
                  to={`/inquiry?category=${c.value}`}
                  className="flex h-full min-h-[190px] rounded-3xl p-6 ring-1 ring-ink/5 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
                  style={{ background: c.bg, color: c.text }}
                  aria-label={`Ask about ${c.label}`}
                >
                  <span className="flex h-full w-full flex-col">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lift" style={{ color: c.text }}>
                      <CategoryIcon category={c.value} size={28} />
                    </span>
                    <span className="mt-5 block font-display text-2xl font-bold text-ink">{c.label}</span>
                    <span className="mt-1.5 block text-base text-ink-600">{c.desc}</span>
                    {c.value === 'scholarship' && (
                      <span className="mt-6 hidden flex-col gap-2 md:flex">
                        {STARTERS.scholarship.map((s) => (
                          <span key={s} className="rounded-xl bg-white/70 px-3.5 py-2.5 text-[15px] text-ink-700">“{s}”</span>
                        ))}
                      </span>
                    )}
                    <span className="mt-auto flex items-center gap-1 pt-6 text-[15px] font-semibold">
                      Ask about this
                      <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </span>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Who writes to us */}
        <section className="border-y border-ink/5 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 lg:py-20">
            {USER_TYPES.map((u) => {
              const Icon = u.icon;
              return (
                <Link key={u.value} to={`/inquiry?type=${u.value}`} className="group block">
                  <motion.span whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.5 } }} className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
                    <Icon size={24} aria-hidden="true" />
                  </motion.span>
                  <h3 className="mt-4 text-xl font-bold">{u.label === 'School' ? 'Schools' : `${u.label}s`}</h3>
                  <p className="mt-1.5 max-w-xs text-base text-ink-600">{WHO[u.value]}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-signal-600">
                    Write in as {u.label === 'School' ? 'a school' : `a ${u.label.toLowerCase()}`}
                    <ChevronRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* What happens next: a real sequence, so the steps are numbered */}
        <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          <h2 className="text-3xl font-bold sm:text-4xl">What happens after you send it</h2>
          <div className="relative mt-12 grid gap-10 md:grid-cols-3">
            <motion.span
              aria-hidden="true"
              className="absolute left-[22px] top-[22px] hidden h-0.5 w-[calc(100%-44px)] origin-left bg-gradient-to-r from-signal to-aqua md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
            {STEPS.map(([title, body], i) => (
              <div key={title} className="relative flex gap-4 md:block">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white">{i + 1}</span>
                <div className="md:mt-5">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-1.5 max-w-xs text-base text-ink-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/inquiry" className="btn-primary mt-14">Send an inquiry</Link>
        </section>
      </main>

      <footer className="border-t border-ink/5 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8">
          <Brand />
          <Link to="/admin/login" className="text-[15px] font-semibold text-ink-600 hover:text-ink">Staff login</Link>
        </div>
      </footer>
    </>
  );
}
