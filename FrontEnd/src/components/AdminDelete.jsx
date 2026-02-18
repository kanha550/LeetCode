import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  Trash2, 
  AlertTriangle, 
  Search, 
  Filter,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Target,
  Tag,
  Layers
} from 'lucide-react';

const AdminDelete = () => {
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

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(problem =>
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
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
      await axiosClient.delete(`/problem/delete/${deleteModal.problem._id}`);
      setProblems(problems.filter(problem => problem._id !== deleteModal.problem._id));
      
      // Success notification
      showNotification('success', 'Problem deleted successfully!');
      setDeleteModal({ isOpen: false, problem: null });
    } catch (err) {
      showNotification('error', 'Failed to delete problem');
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
          dotColor: 'bg-emerald-400'
        };
      case 'medium':
        return { 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30',
          dotColor: 'bg-amber-400'
        };
      case 'hard':
        return { 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/10', 
          border: 'border-rose-500/30',
          dotColor: 'bg-rose-400'
        };
      default:
        return { 
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30',
          dotColor: 'bg-slate-400'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-rose-500/10 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <Shield className="text-rose-400" size={24} />
            <span className="text-slate-300 font-medium">Danger Zone</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-rose-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            Delete Problems
          </h1>
          
          <p className="text-slate-400 text-lg">
            Permanently remove problems from the platform
          </p>
        </div>

        {/* Stats & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Problems</p>
                <p className="text-2xl font-bold text-white">{problems.length}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="md:col-span-2 relative">
      
            <input
              type="text"
              placeholder="Search by title or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all appearance-none cursor-pointer"
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

        {/* Problems Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Target size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No problems found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-900/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 w-16">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tags</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem, index) => {
                    const diffConfig = getDifficultyConfig(problem.difficulty);
                    return (
                      <tr 
                        key={problem._id} 
                        className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-all group"
                      >
                        <td className="px-6 py-4 text-slate-400 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${diffConfig.dotColor}`}></div>
                            <span className="text-slate-100 font-medium">{problem.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-purple-400" />
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                              {problem.tags}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, problem })}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg font-medium transition-all border border-rose-500/30 hover:border-rose-500/50 group-hover:shadow-lg group-hover:shadow-rose-500/25"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
                  <h3 className="text-xl font-bold text-white">Delete Problem</h3>
                  <p className="text-slate-400 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-slate-300 mb-4">
                Are you sure you want to delete this problem?
              </p>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">{deleteModal.problem?.title}</p>
                <div className="flex items-center gap-2 text-sm">
                  {(() => {
                    const diffConfig = getDifficultyConfig(deleteModal.problem?.difficulty);
                    return (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                        {deleteModal.problem?.difficulty}
                      </span>
                    );
                  })()}
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    {deleteModal.problem?.tags}
                  </span>
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
                    Delete Forever
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

export default AdminDelete;