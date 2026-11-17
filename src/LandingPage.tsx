import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  Code2,
  Compass,
  FolderGit2,
  Layers,
  PenTool,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { calculateSkillMatch } from '../../services/matchingService';

export const LandingPage: React.FC = () => {
  const { projects, users, categories, reviews } = useApp();
  const { currentUser } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'Published').length;
    const studentCount = users.filter((u) => u.role === 'student').length;
    const clientCount = users.filter((u) => u.role === 'client').length;
    const completedCount = projects.filter((p) => p.status === 'Completed').length;
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';
    return { activeProjects, studentCount, clientCount, completedCount, avgRating };
  }, [projects, users, reviews]);

  const featuredProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'Published')
      .slice(0, 4);
  }, [projects]);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const studentSkillNames = useMemo(() => {
    if (currentUser?.role !== 'student') return [];
    return (currentUser.studentProfile?.skills || []).map((s) => s.name);
  }, [currentUser]);

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-blue-700 tracking-wide">
                Your Skills. Your Opportunities.
              </p>
              <h1
                className="mt-3 font-bold text-slate-900 tracking-tight leading-[1.1] max-w-xl"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Turn Your Skills Into Real Opportunities.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Discover meaningful projects, showcase your talent, and connect with businesses
                looking for the next generation of digital creators.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Explore Projects
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register?role=student"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  Join as a Student
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                {!heroImgError ? (
                  <img
                    src="/src/assets/images/hero_campus_studio_1794886462520.jpg"
                    alt="University students and engineers collaborating in a modern daylight studio"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover min-h-[280px] lg:max-h-[430px]"
                  />
                ) : (
                  <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-slate-100">
                    <Compass className="w-10 h-10 text-blue-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-800">
                      SkillBridge Collaborative Studio
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Platform Statistics Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {stats.activeProjects}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-600">
                Active Published Projects
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {stats.studentCount}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-600">
                Registered University Creators
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {stats.clientCount}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-600">
                Partner Startups & SMBs
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
                {stats.avgRating} / 5.0
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-600">
                Verified Collaboration Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Dashboard Preview Section */}
      <section className="py-14 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built for Transparent Project Matching
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Every student skill profile and client brief runs through a deterministic matching
              calculator—showing exact skill overlap before a proposal is ever written.
            </p>
          </div>

          <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-semibold font-display">
                Skill Compatibility Workspace Preview
              </div>
              <div className="text-xs text-slate-300 font-mono tabular-nums">
                Formula: (Matching Required Skills / Total Required Skills) × 100
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              <div className="lg:col-span-5 p-6 space-y-4">
                <div className="text-xs font-semibold text-slate-500">Sample Student Profile</div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Maya Lin</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pacific Tech University · Computer Science & Engineering
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-medium text-slate-700">Verified Skills</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    React · TypeScript · JavaScript · Node.js · Tailwind CSS · HTML · CSS
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to="/students/stu-1"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Inspect Maya’s Public Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 p-6 space-y-4">
                <div className="text-xs font-semibold text-slate-500">
                  Live Project Compatibility Breakdown
                </div>
                <div className="divide-y divide-slate-100">
                  {featuredProjects.slice(0, 3).map((proj) => {
                    const demoMatch = calculateSkillMatch(
                      ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Tailwind CSS', 'HTML', 'CSS'],
                      proj.requiredSkills
                    );
                    return (
                      <div
                        key={proj.id}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <Link
                            to={`/projects/${proj.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-blue-700 truncate block"
                          >
                            {proj.title}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Requires: {proj.requiredSkills.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-700 font-mono tabular-nums">
                              {demoMatch.matchPercentage}% Match
                            </span>
                            <div className="text-[11px] text-slate-500 tabular-nums">
                              {demoMatch.matchingSkills.length} of {demoMatch.totalRequired} skills
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Categories */}
      <section className="py-14 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Categories
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Browse active opportunities across eight specialized university talent tracks.
              </p>
            </div>
            <Link
              to="/explore"
              className="text-sm font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap"
            >
              View all projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = projects.filter(
                (p) => p.category === cat.name && p.status === 'Published'
              ).length;
              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-600 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {count}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-4 text-xs font-medium text-blue-700 inline-flex items-center gap-1">
                    Explore track
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Featured Projects */}
      <section className="py-14 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Active Projects
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Real project briefs published by startups, local businesses, and campus organizations.
              </p>
            </div>
            <Link
              to="/explore"
              className="text-sm font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap"
            >
              Browse marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                client={userMap.get(project.clientId)}
                match={
                  currentUser?.role === 'student'
                    ? calculateSkillMatch(studentSkillNames, project.requiredSkills)
                    : undefined
                }
                showApplyButton={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. How SkillBridge Works */}
      <section className="py-14 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How SkillBridge Works
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              A structured four-step workflow designed for university schedules and client clarity.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01.',
                title: 'Build Your Skill Profile',
                desc: 'List technical and creative skills with proficiency tiers and upload real portfolio projects.',
                icon: Award,
              },
              {
                num: '02.',
                title: 'Match With Relevant Work',
                desc: 'Our skill-matching engine scores every project brief against your profile automatically.',
                icon: Sparkles,
              },
              {
                num: '03.',
                title: 'Submit Focused Proposals',
                desc: 'Apply with relevant experience, proposed pricing, and estimated completion timelines.',
                icon: Briefcase,
              },
              {
                num: '04.',
                title: 'Deliver & Earn Reviews',
                desc: 'Track status milestones from shortlisted to completed and build two-way verified ratings.',
                icon: CheckCircle2,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-blue-700">
                      {step.num}
                    </span>
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Why Choose SkillBridge (Asymmetric Grid) */}
      <section className="py-14 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why Students & Businesses Choose SkillBridge
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Bidirectional Skill Matching for Both Sides
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed max-w-xl">
                  Students immediately see which required skills they possess and what gaps remain,
                  while clients publishing a new brief receive an instant ranked roster of matching
                  university candidates.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                    100%
                  </span>
                  <p className="text-slate-500 mt-0.5">Transparent skill formula</p>
                </div>
                <div>
                  <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                    6 Stages
                  </span>
                  <p className="text-slate-500 mt-0.5">Tracked application timeline</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FolderGit2 className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Integrated Student Portfolios
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Showcase live URLs, GitHub repositories, and visual project snapshots directly
                  alongside every application.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-semibold text-slate-900">
                    Two-Way Verified Reviews
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Both students and clients rate completed engagements on a 5-star scale to build
                  lasting campus and business trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 & 9. Student Success Stories & Testimonials */}
      <section className="py-14 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Student Success Stories */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Student Success Stories
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Real outcomes delivered by student creators across software, design, and analytics.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  img: '/src/assets/images/portfolio_ecommerce_1794886462032.jpg',
                  student: 'Maya Lin · Pacific Tech University',
                  title: 'Artisan Storefront Modernization',
                  metric: 'Delivered in 14 days · 5.0 Client Rating',
                  summary:
                    'Transformed a local retailer catalog into a fast React & Tailwind web application with category filtering.',
                  link: '/students/stu-1',
                },
                {
                  img: '/src/assets/images/portfolio_analytics_1794886462482.jpg',
                  student: 'Noah Takahashi · Pacific Tech University',
                  title: '12-Month Retail Basket Cohort Study',
                  metric: '80,000+ Rows Processed · Accepted Sprint',
                  summary:
                    'Built automated Python & SQL reports uncovering seasonal demand peaks for Northstar Commerce.',
                  link: '/students/stu-4',
                },
                {
                  img: '/src/assets/images/portfolio_mobile_ui_1794886463533.jpg',
                  student: 'Sofia Patel · Westcoast School of Design',
                  title: 'Warehouse Companion Mobile Design System',
                  metric: '32 Reusable Figma Components',
                  summary:
                    'Designed accessible mobile scanning workflows and light/dark UI tokens for MetricFlow Labs.',
                  link: '/students/stu-3',
                },
              ].map((story) => (
                <Link
                  key={story.title}
                  to={story.link}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors flex flex-col"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={story.img}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{story.student}</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {story.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {story.summary}
                      </p>
                    </div>
                    <p className="mt-4 pt-3 border-t border-slate-100 text-xs font-mono font-medium text-blue-700 tabular-nums">
                      {story.metric}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Attributable Testimonials */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">What Clients & Students Say</h3>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote:
                    'Before SkillBridge, finding vetted frontend help within a small retail budget took weeks. Our skill match list surfaced three qualified seniors in five minutes, and our new artisan site launched in two weeks.',
                  author: 'David Thorne',
                  role: 'Founder, Northstar Commerce',
                },
                {
                  quote:
                    'Campus coursework gave me theory, but shipping real React deliverables for local businesses built my portfolio and led directly to summer engineering interviews.',
                  author: 'Maya Lin',
                  role: 'B.S. Computer Science, Pacific Tech University',
                },
                {
                  quote:
                    'Tracking shortlisted candidates and updating application statuses in one place saved our symposium team hours of back-and-forth email threads.',
                  author: 'Rachel Kim',
                  role: 'Program Director, CampusPulse Events',
                },
              ].map((t) => (
                <blockquote
                  key={t.author}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <p className="text-sm text-slate-700 leading-relaxed">“{t.quote}”</p>
                  <footer className="mt-5 pt-4 border-t border-slate-200/70">
                    <div className="text-sm font-semibold text-slate-900">{t.author}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.role}</div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10 & 11. Dual Registration CTAs (Client + Student) */}
      <section className="py-14 lg:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300">
                <TrendingUp className="w-4 h-4" />
                For Startups & Small Businesses
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Need Skilled Help for Your Next Digital Project?
              </h2>
              <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                Publish a project brief with required skills and budget, review ranked student
                matches immediately, and manage applicants cleanly.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/register?role=client"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors"
              >
                Register as a Client
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-blue-700 border border-blue-600 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-100">
                <PenTool className="w-4 h-4" />
                For University Students
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">
                Ready to Apply Your Classroom Skills?
              </h2>
              <p className="mt-2.5 text-sm text-blue-100 leading-relaxed">
                Create your verified skill profile, upload portfolio case studies, and receive
                personalized project recommendations matched to your strengths.
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/register?role=student"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-900 bg-white hover:bg-blue-50 rounded-lg transition-colors"
              >
                Join as a Student
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
