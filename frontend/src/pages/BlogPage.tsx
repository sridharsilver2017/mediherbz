import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { BlogPost } from '../types';
import { api } from '../api/client';

export const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    api.getBlogs().then(setBlogs);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Ayurvedic Journal</span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#26352A] font-serif">
          Insights on Holistic Health, Herbs &amp; Radiance
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Educational articles, classical ingredient spotlights, and daily wellness rituals curated by Ayurvedic doctors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="bg-[#18833B]/10 text-[#18833B] font-bold px-2.5 py-0.5 rounded-full">
                    {blog.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {blog.read_time}
                  </span>
                </div>
                <Link to={`/blog/${blog.slug}`}>
                  <h2 className="font-bold text-lg text-[#26352A] hover:text-[#18833B] transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h2>
                </Link>
                <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-stone-100 mt-4 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5 italic">
                <User className="w-3.5 h-3.5 text-stone-400" /> {blog.author}
              </span>
              <span className="font-semibold text-[#18833B]">{blog.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

