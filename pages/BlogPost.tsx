import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';
import { CmsPost, fetchPostBySlug } from '../services/payloadClient';

const formatDateTime = (value?: string) => {
  if (!value) return 'Unscheduled';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
};

const RichContent: React.FC<{ content?: any }> = ({ content }) => {
  if (!content) return null;
  if (typeof content === 'string') {
    return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  if (Array.isArray(content)) {
    return (
      <div className="prose prose-slate max-w-none space-y-6">
        {content.map((block: any, index: number) => {
          if (block?.type === 'paragraph') {
            const text = block.children?.map((child: any) => child.text).join(' ');
            return <p key={index}>{text}</p>;
          }
          if (block?.type === 'heading') {
            const text = block.children?.map((child: any) => child.text).join(' ');
            const level = Math.min(block.level || 2, 4);
            const Tag = `h${level}` as keyof JSX.IntrinsicElements;
            return (
              <Tag key={index} className="font-semibold text-slate-900">
                {text}
              </Tag>
            );
          }
          return null;
        })}
      </div>
    );
  }
  return null;
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<CmsPost | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!slug) return;
    setStatus('loading');
    fetchPostBySlug(slug)
      .then((result) => {
        setPost(result);
        setStatus(result ? 'ready' : 'error');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  const heroUrl = useMemo(() => post?.heroImage?.url, [post]);

  if (status === 'loading') {
    return (
      <div className="pt-32 pb-24 bg-white text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 text-slate-500">
          <Loader2 className="animate-spin" size={20} /> Loading story...
        </div>
      </div>
    );
  }

  if (status === 'error' || !post) {
    return (
      <div className="pt-32 pb-24 bg-white text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold">
            <ArrowLeft size={16} /> Back to blog
          </Link>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            We couldn’t load that post. If you just published it in Payload, refresh to try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold">
            <ArrowLeft size={16} /> Back to blog
          </Link>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{post.category || 'Insights'}</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">{post.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <CalendarDays size={16} /> {formatDateTime(post.publishedAt)}
            </div>
          </div>
        </div>

        {heroUrl ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <img src={heroUrl} alt={post.heroImage?.alt || post.title} className="w-full object-cover" />
          </div>
        ) : null}

        <RichContent content={post.content} />
      </div>
    </div>
  );
};
