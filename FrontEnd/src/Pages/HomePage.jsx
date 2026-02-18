import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { 
  Code2, 
  Trophy, 
  Target, 
  TrendingUp, 
  Search, 
  Filter,
  CheckCircle2,
  Circle,
  Tag,
  ChevronRight,
  User,
  LogOut,
  Shield,
  Zap,
  Award,
  Sparkles,
  X
} from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
    search: ''
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
      (filters.status === 'solved' && solvedProblems.some(sp => sp._id === problem._id));
    const searchMatch = filters.search === '' || 
      problem.title.toLowerCase().includes(filters.search.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const stats = {
    total: problems.length,
    solved: solvedProblems.length,
    easy: problems.filter(p => p.difficulty === 'easy').length,
    medium: problems.filter(p => p.difficulty === 'medium').length,
    hard: problems.filter(p => p.difficulty === 'hard').length,
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'medium':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'hard':
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
      default:
        return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <Code2 className="text-white" size={28} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CodingAdda
              </span>
            </NavLink>

            {/* Center Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <Trophy className="text-yellow-400" size={20} />
                <div className="text-sm">
                  <span className="text-slate-400">Solved: </span>
                  <span className="font-bold text-white">{stats.solved}</span>
                  <span className="text-slate-500">/{stats.total}</span>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user?.firstName?.charAt(0).toUpperCase()}
                </div>
              </div>
              <ul className="mt-3 p-2 shadow-2xl menu dropdown-content bg-slate-800 border border-slate-700 rounded-xl w-64">
                <li className="px-4 py-2 border-b border-slate-700">
                  <div className="flex items-center gap-3 hover:bg-transparent cursor-default">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user?.firstName}</p>
                      <p className="text-xs text-slate-400">{user?.emailId}</p>
                    </div>
                  </div>
                </li>
                <li>
                  <a className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700">
                    <User size={16} />
                    Profile
                  </a>
                </li>
                {user?.role === "admin" && (
                  <li>
                    <NavLink to="/admin" className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700">
                      <Shield size={16} />
                      Admin Panel
                    </NavLink>
                  </li>
                )}
                <li className="border-t border-slate-700 mt-2 pt-2">
                  <button onClick={handleLogout} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 pb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Master Your Coding Skills
          </h1>
          <p className="text-slate-400 text-lg">
            Solve problems, track progress, and become a better developer
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy className="text-blue-400" size={24} />
              </div>
              <Sparkles className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Total Solved</h3>
            <p className="text-3xl font-bold text-white mb-1">{stats.solved}</p>
            <p className="text-slate-500 text-sm">of {stats.total} problems</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Target className="text-emerald-400" size={24} />
              </div>
              <div className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">Easy</div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Easy Problems</h3>
            <p className="text-3xl font-bold text-white">{stats.easy}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-amber-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="text-amber-400" size={24} />
              </div>
              <div className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">Medium</div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Medium Problems</h3>
            <p className="text-3xl font-bold text-white">{stats.medium}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-rose-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl group-hover:scale-110 transition-transform">
                <Award className="text-rose-400" size={24} />
              </div>
              <div className="text-xs px-2 py-1 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">Hard</div>
            </div>
            <h3 className="text-slate-400 text-sm mb-1">Hard Problems</h3>
            <p className="text-3xl font-bold text-white">{stats.hard}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Filter className="text-purple-400" size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Filter Problems</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Status */}
            <select
              className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="solved">Solved Only</option>
            </select>

            {/* Difficulty */}
            <select
              className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tag */}
            <select
              className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">All Topics</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">Dynamic Programming</option>
            </select>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.status !== 'all' || filters.difficulty !== 'all' || filters.tag !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center pt-4 border-t border-slate-700/50">
              <span className="text-sm text-slate-400">Active filters:</span>
              {filters.search && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30 text-sm">
                  <span>"{filters.search}"</span>
                  <button onClick={() => setFilters({...filters, search: ''})}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.status !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 text-sm">
                  <span>{filters.status}</span>
                  <button onClick={() => setFilters({...filters, status: 'all'})}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.difficulty !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 text-sm">
                  <span>{filters.difficulty}</span>
                  <button onClick={() => setFilters({...filters, difficulty: 'all'})}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {filters.tag !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 text-sm">
                  <span>{filters.tag}</span>
                  <button onClick={() => setFilters({...filters, tag: 'all'})}>
                    <X size={14} />
                  </button>
                </div>
              )}
              <button
                className="text-sm text-slate-400 hover:text-white transition-colors underline"
                onClick={() => setFilters({ difficulty: 'all', tag: 'all', status: 'all', search: '' })}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-slate-400">
          Showing <span className="font-semibold text-white">{filteredProblems.length}</span> of {problems.length} problems
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-16 text-center">
              <Target size={64} className="mx-auto mb-4 opacity-50 text-slate-500" />
              <h3 className="text-2xl font-bold text-slate-300 mb-2">No problems found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredProblems.map((problem, index) => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              const diffConfig = getDifficultyConfig(problem.difficulty);
              
              return (
                <div
                  key={problem._id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/10"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Status & Title */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isSolved ? 'bg-emerald-500/20 border-2 border-emerald-500/50' : 'bg-slate-700/50 border-2 border-slate-600'
                      }`}>
                        {isSolved ? (
                          <CheckCircle2 className="text-emerald-400" size={18} />
                        ) : (
                          <Circle className="text-slate-500" size={18} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="text-lg font-semibold text-slate-100 hover:text-blue-400 transition-colors block truncate"
                        >
                          {problem.title}
                        </NavLink>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                            <Tag size={12} />
                            {problem.tags}
                          </span>
                          {isSolved && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 size={12} />
                              Solved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 flex-shrink-0"
                    >
                      <span>{isSolved ? 'Solve Again' : 'Solve'}</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </NavLink>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Homepage;