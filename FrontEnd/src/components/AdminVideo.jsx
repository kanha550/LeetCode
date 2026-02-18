import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { NavLink } from 'react-router';
import { 
  Video, 
  Upload, 
  Trash2, 
  Search, 
  Filter,
  Play,
  AlertTriangle,
  XCircle,
  Loader2,
  Film,
  Target,
  Tag,
  CheckCircle2
} from 'lucide-react';

const AdminVideo = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, problem: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [searchTerm, filterDifficulty, problems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
      setFilteredProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = [...problems];

    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(problem =>
        problem.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    setFilteredProblems(filtered);
  };

  const handleDelete = async () => {
    if (!deleteModal.problem) return;
    
    setDeleting(true);
    try {
      await axiosClient.delete(`/video/delete/${deleteModal.problem._id}`);
      setProblems(problems.filter(problem => problem._id !== deleteModal.problem._id));
      showNotification('success', 'Video deleted successfully!');
      setDeleteModal({ isOpen: false, problem: null });
    } catch (err) {
      showNotification('error', err.response?.data?.error || 'Failed to delete video');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const showNotification = (type, message) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${
      type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
    } text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in flex items-center gap-2`;
    notification.innerHTML = `
      ${type === 'success' 
        ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' 
        : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
      }
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const getDifficultyConfig = (difficulty) => {
    const diff = difficulty?.toLowerCase() || '';
    switch (diff) {
      case 'easy':
        return { 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/30',
          gradient: 'from-emerald-500/20 to-green-500/20'
        };
      case 'medium':
        return { 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30',
          gradient: 'from-amber-500/20 to-orange-500/20'
        };
      case 'hard':
        return { 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/10', 
          border: 'border-rose-500/30',
          gradient: 'from-rose-500/20 to-red-500/20'
        };
      default:
        return { 
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30',
          gradient: 'from-slate-500/20 to-slate-500/20'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center p-4">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="text-rose-400" size={32} />
            <h2 className="text-2xl font-bold text-rose-400">Error</h2>
          </div>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <Film className="text-purple-400" size={24} />
            <span className="text-slate-300 font-medium">Video Management</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Video Solutions
          </h1>
          
          <p className="text-slate-400 text-lg">
            Upload and manage video tutorials for problems
          </p>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Video className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Problems</p>
                <p className="text-2xl font-bold text-white">{problems.length}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="md:col-span-2 relative">            <input
              type="text"
              placeholder="Search by title or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {searchTerm || filterDifficulty !== 'all' ? (
          <div className="mb-4 text-slate-400">
            Showing {filteredProblems.length} of {problems.length} problems
          </div>
        ) : null}

        {/* Problems Grid */}
        {filteredProblems.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-16 text-center">
            <Video size={64} className="mx-auto mb-4 opacity-50 text-slate-500" />
            <p className="text-xl text-slate-400">No problems found</p>
            <p className="text-sm text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem, index) => {
              const diffConfig = getDifficultyConfig(problem.difficulty);
              return (
                <div
                  key={problem._id}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
                >
                  {/* Card Header with Gradient */}
                  <div className={`h-32 bg-gradient-to-br ${diffConfig.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-slate-900/40"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border} backdrop-blur-sm`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Play size={16} />
                        <span className="text-sm font-medium">Problem #{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {problem.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <Tag size={14} className="text-purple-400" />
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {problem.tags}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <NavLink 
                        to={`/admin/upload/${problem._id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25"
                      >
                        <Upload size={16} />
                        Upload
                      </NavLink>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, problem })}
                        className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-medium transition-all border border-rose-500/30 hover:border-rose-500/50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/20 rounded-full">
                  <AlertTriangle className="text-rose-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Video</h3>
                  <p className="text-slate-400 text-sm">This will remove the video solution</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-slate-300 mb-4">
                Are you sure you want to delete the video for this problem?
              </p>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">{deleteModal.problem?.title}</p>
                <div className="flex items-center gap-2 text-sm">
                  {(() => {
                    const diffConfig = getDifficultyConfig(deleteModal.problem?.difficulty);
                    return (
                      <>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                          {deleteModal.problem?.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {deleteModal.problem?.tags}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, problem: null })}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete Video
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminVideo;