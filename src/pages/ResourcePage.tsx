import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/Toast';

interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  exam: string;
  year: string;
  subject: string;
  source_state: 'Official' | 'Verified' | 'Community' | 'AI Generated';
  thumbnail_url: string;
  file_url: string;
}

export default function ResourcePage() {
  const { slug } = useParams<{ slug: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Resource[]>([]);

  useEffect(() => {
    async function fetchResource() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();

        if (error) throw error;
        setResource(data);

        if (data) {
          // Fetch related
          const { data: relatedData } = await supabase
            .from('resources')
            .select('*')
            .eq('exam', data.exam)
            .eq('subject', data.subject)
            .neq('id', data.id)
            .limit(4);
          
          if (relatedData) setRelated(relatedData);
        }
      } catch (err) {
        console.error('Error fetching resource:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchResource();
    }
  }, [slug]);

  const handleDownload = async () => {
    if (!resource) return;
    try {
      // Logic to increment download count
      await supabase.rpc('increment_download_count', { row_id: resource.id });
      await supabase.from('resource_downloads').insert({ resource_id: resource.id });
      window.open(resource.file_url, '_blank');
    } catch (e) {
      console.error(e);
      window.open(resource.file_url, '_blank'); // fallback open
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#062B3D] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-[#062B3D] flex flex-col items-center justify-center text-white p-4">
        <Helmet>
          <title>Resource Not Found | Study Hub</title>
        </Helmet>
        <h1 className="text-3xl font-bold mb-4">Resource not found</h1>
        <p className="text-gray-400 mb-8">The resource you are looking for does not exist or has been removed.</p>
        <Link to="/studio" className="px-6 py-3 bg-[#5CE1E6] text-[#062B3D] font-bold rounded-xl hover:bg-opacity-90 transition-colors">
          View all resources in Studio
        </Link>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": resource.title,
    "description": resource.description || `${resource.exam} ${resource.year} ${resource.subject} resource`,
    "educationalLevel": resource.exam,
    "url": `https://studyhub.app/resource/${resource.slug}`
  };

  const badgeColor = {
    'Official': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Verified': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Community': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'AI Generated': 'bg-[#5CE1E6]/20 text-[#5CE1E6] border-[#5CE1E6]/30',
  }[resource.source_state] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <div className="min-h-screen bg-[#062B3D] text-white pt-24 pb-12 px-4 md:px-8">
      <Helmet>
        <title>{`${resource.title} | Study Hub`}</title>
        <meta name="description" content={resource.description || `${resource.exam} ${resource.year} ${resource.subject} resource`} />
        <link rel="canonical" href={`https://studyhub.app/resource/${resource.slug}`} />
        <meta property="og:title" content={`${resource.title} | Study Hub`} />
        <meta property="og:description" content={resource.description || `${resource.exam} ${resource.year} ${resource.subject} resource`} />
        <meta property="og:image" content={resource.thumbnail_url || 'https://studyhub.app/images/og-default.png'} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-400 mb-8 gap-2">
          <Link to="/studio" className="hover:text-white transition-colors">Studio</Link>
          <span>&rsaquo;</span>
          <span className="text-gray-300">{resource.exam}</span>
          <span>&rsaquo;</span>
          <span className="text-[#5CE1E6] truncate max-w-[200px] md:max-w-none">{resource.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative flex items-center justify-center">
              {resource.thumbnail_url ? (
                <img src={resource.thumbnail_url} alt={resource.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#062B3D] to-[#1a4b66] flex items-center justify-center">
                  <span className="text-5xl font-bold opacity-10">{resource.subject}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">{resource.exam}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">{resource.year}</span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">{resource.subject}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
                  {resource.source_state}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{resource.title}</h1>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {resource.description || 'No description available for this resource.'}
              </p>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <a 
                  href={resource.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#5CE1E6] text-[#062B3D] rounded-xl font-bold text-center hover:bg-opacity-90 transition-colors"
                >
                  View PDF
                </a>
                <button 
                  onClick={handleDownload}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                >
                  Download
                </button>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button className="py-2.5 border border-white/10 hover:bg-white/5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    Save
                  </button>
                  <button onClick={handleShare} className="py-2.5 border border-white/10 hover:bg-white/5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    Share
                  </button>
                </div>
                <Link 
                  to="/study-ai" 
                  className="w-full py-3 mt-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl font-medium text-center hover:bg-purple-500/30 transition-colors"
                >
                  Ask StudyMate AI
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related Resources */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(item => (
                <Link key={item.id} to={`/resource/${item.slug}`} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#5CE1E6]/50 transition-colors group">
                  <div className="aspect-video bg-black/20 flex items-center justify-center p-4">
                    <span className="font-bold text-gray-400 group-hover:text-[#5CE1E6] transition-colors">{item.subject}</span>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#5CE1E6] mb-1">{item.exam} {item.year}</div>
                    <h4 className="font-medium truncate">{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link to="/studio" className="text-gray-400 hover:text-[#5CE1E6] transition-colors">
            &larr; Back to Studio
          </Link>
        </div>
      </div>
    </div>
  );
}
