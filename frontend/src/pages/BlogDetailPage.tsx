import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, Tag, Share2, Sparkles, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';
import { api } from '../api/client';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        if (slug) {
          const post = await api.getBlogBySlug(slug);
          setBlog(post || null);
        }
        const allBlogs = await api.getBlogs();
        setRecentBlogs(allBlogs.filter((b) => b.slug !== slug).slice(0, 3));
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#18833B]" />
        <p className="mt-3 text-xs text-stone-500">Retrieving Ayurvedic wisdom...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Article Not Found</span>
        <h1 className="text-3xl font-black text-stone-900 font-serif">Journal Entry Missing</h1>
        <p className="text-sm text-stone-500">
          The Ayurvedic health article you are seeking is either relocated or no longer active.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#18833B] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#12632F] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Wellness Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-400">
        <Link to="/" className="hover:text-[#18833B] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/blog" className="hover:text-[#18833B] transition-colors">Wellness Journal</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-700 truncate max-w-xs">{blog.title}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#18833B]/10 text-[#18833B] font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{blog.category}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#26352A] font-serif leading-[1.18]">
          {blog.title}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed">
          {blog.excerpt}
        </p>

        {/* Metadata bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-b border-stone-200 py-3 text-xs text-stone-500">
          <span className="flex items-center gap-1.5 font-medium text-stone-700">
            <User className="w-4 h-4 text-[#18833B]" /> {blog.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-stone-400" /> {blog.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-stone-400" /> {blog.read_time}
          </span>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="aspect-16/9 rounded-3xl overflow-hidden bg-stone-100 shadow-md">
        <img
          src={blog.featured_image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Rich Content */}
      <div
        className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-[#26352A] prose-p:text-stone-700 prose-p:leading-relaxed prose-p:text-sm sm:prose-p:text-base prose-strong:text-[#18833B] prose-a:text-[#18833B] prose-a:underline"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Tags & Share */}
      <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Tags:
          </span>
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#FAF9F2] border border-stone-200 text-stone-600 px-3 py-1 rounded-full font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: blog.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Article link copied to clipboard!');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-[#18833B] hover:text-white text-stone-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share Article
        </button>
      </div>

      {/* Related Articles */}
      {recentBlogs.length > 0 && (
        <section className="pt-12 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-serif text-[#26352A]">More From the Journal</h3>
            <Link to="/blog" className="text-xs font-bold text-[#18833B] hover:underline">
              View All Articles →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentBlogs.map((b) => (
              <Link
                key={b.id}
                to={`/blog/${b.slug}`}
                className="group bg-white rounded-2xl border border-stone-200/80 p-4 hover:shadow-md hover:border-[#18833B] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-16/10 rounded-xl overflow-hidden bg-stone-100">
                    <img
                      src={b.featured_image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#18833B] bg-[#18833B]/10 px-2 py-0.5 rounded-full inline-block">
                    {b.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#26352A] group-hover:text-[#18833B] line-clamp-2 transition-colors">
                    {b.title}
                  </h4>
                </div>
                <span className="text-[11px] text-stone-400 mt-3 block">{b.date}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back button */}
      <div className="pt-8 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#18833B] hover:text-[#12632F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wellness Journal
        </Link>
      </div>
    </article>
  );
};
