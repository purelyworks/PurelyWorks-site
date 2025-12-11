import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, NotebookPen, Share2 } from 'lucide-react';
import { CmsPost, fetchPublishedPosts } from '../services/payloadClient';

const fallbackPosts: CmsPost[] = [
  {
    id: 'placeholder-1',
    title: 'How we keep pixel-perfect delivery with flexible squads',
    slug: 'pixel-perfect-flexible-squads',
    publishedAt: '2025-01-01T00:00:00.000Z',
    category: 'Process',
    summary:
      'A behind-the-scenes look at how our pods switch gears between proposals, recruiting, and delivery without losing momentum.',
  },
  {
    id: 'placeholder-2',
    title: 'Designing AI-powered recruiting workflows that feel human',
    slug: 'ai-powered-recruiting-workflows',
    publishedAt: '2024-12-01T00:00:00.000Z',
    category: 'AI Recruiting',
    summary:
      'We pair custom tooling with seasoned talent partners to keep every candidate touchpoint empathetic and transparent.',
  },
  {
    id: 'placeholder-3',
    title: 'Composable proposals: turning intent into launch-ready roadmaps',
    slug: 'composable-proposals-roadmaps',
    publishedAt: '2024-11-01T00:00:00.000Z',
    category: 'Product Strategy',
    summary:
      'Why our proposal sprints combine discovery, prototyping, and engineering spikes so you can commit with confidence.',
  },
];

const formatDate = (value?: string) => {
  if (!value) return 'Unscheduled';
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(value));
};

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<CmsPost[]>(fallbackPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublishedPosts()
      .then((remotePosts) => {
        if (remotePosts.length) setPosts(remotePosts);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="pt-28 pb-24 bg-white text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-3">Insights</p>
            <h1 className="text-4xl md:text-5xl font-bold">Purely Works Blog</h1>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl">
              Stories, playbooks, and release notes from the teams building Purely Flex, Focused Development, Recruiting, and
              Proposals.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
            <NotebookPen size={18} />
            Updated weekly
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Could not reach the Payload API. Showing placeholder stories until the CMS is online.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:-translate-y-1 duration-300"
            >
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-3">
                <span>{post.category || 'Insights'}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 normal-case tracking-normal font-medium">{formatDate(post.publishedAt)}</span>
              </div>
              <h2 className="text-2xl font-semibold mb-3 leading-tight group-hover:text-slate-900">{post.title}</h2>
              <p className="text-slate-600 leading-relaxed mb-6">{post.summary}</p>
              <div className="flex items-center justify-between text-sm text-indigo-600 font-semibold">
                <Link to={`/blog/${post.slug}`} className="flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read story <ArrowUpRight size={16} />
                </Link>
                <button
                  type="button"
                  aria-label="Share story"
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  onClick={() => navigator?.share?.({ url: `/blog/${post.slug}`, title: post.title })}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
