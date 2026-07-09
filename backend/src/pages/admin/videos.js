import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    thumbnail_path: '',
    original_source_url: '',
    file_name: ''
  });

  useEffect(() => {
    // Check if user is logged in via HttpOnly cookie
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          alert("Please login first to access the admin dashboard.");
          router.push('/login');
        } else {
          fetchVideos();
        }
      })
      .catch(err => {
        console.error("Auth check failed:", err);
        router.push('/login');
      });
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos);
      } else {
        console.error(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setVideos([data.video, ...videos]);
        setFormData({ title: '', thumbnail_path: '', original_source_url: '', file_name: '' });
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Error creating video");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setVideos(videos.filter(v => v.id !== id));
      } else {
        alert("Error deleting video");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <Head>
        <title>Admin Dashboard | Media Hoster</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800">Media Hoster Admin</h1>

        {/* Create Video Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-medium mb-6">Add New Video Link</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Video Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="Enter title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Thumbnail Path (R2/Public URL)</label>
                <input required type="url" value={formData.thumbnail_path} onChange={e => setFormData({...formData, thumbnail_path: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="https://pub-xxx.r2.dev/thumb.jpg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Original Source URL (Hidden S3/qu.ax)</label>
                <input required type="url" value={formData.original_source_url} onChange={e => setFormData({...formData, original_source_url: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="https://qu.ax/video.mp4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Download Filename (Optional)</label>
                <input type="text" value={formData.file_name} onChange={e => setFormData({...formData, file_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" placeholder="my_video.mp4" />
              </div>
            </div>
            <button type="submit" className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/30">
              Create Secure Link
            </button>
          </form>
        </div>

        {/* Video List */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8">
          <h2 className="text-2xl font-medium mb-6">Database Entries</h2>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading securely...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-4 font-medium">UUID</th>
                    <th className="py-4 px-4 font-medium">Title</th>
                    <th className="py-4 px-4 font-medium">Source</th>
                    <th className="py-4 px-4 font-medium">Created At</th>
                    <th className="py-4 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(video => (
                    <tr key={video.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs text-blue-600 bg-blue-50 rounded-lg m-2 inline-block px-3 py-1 mt-3">{video.video_uuid}</td>
                      <td className="py-4 px-4 font-medium">{video.title}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[200px]">{video.original_source_url}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{new Date(video.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">
                        <button onClick={() => handleDelete(video.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {videos.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">No videos found. Create your first secure link above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
