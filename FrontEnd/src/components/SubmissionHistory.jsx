import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { 
  Clock, 
  Database, 
  Code2, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  X,
  Copy,
  Check,
  TrendingUp,
  Award
} from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return { 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/30',
          icon: CheckCircle2,
          label: 'Accepted'
        };
      case 'wrong':
        return { 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/10', 
          border: 'border-rose-500/30',
          icon: XCircle,
          label: 'Wrong Answer'
        };
      case 'error':
        return { 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10', 
          border: 'border-amber-500/30',
          icon: AlertTriangle,
          label: 'Error'
        };
      case 'pending':
        return { 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/10', 
          border: 'border-blue-500/30',
          icon: Loader2,
          label: 'Pending'
        };
      default:
        return { 
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/30',
          icon: AlertTriangle,
          label: status
        };
    }
  };

  const formatMemory = (memory) => {
    if (!memory) return 'N/A';
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const copyCode = () => {
    if (selectedSubmission?.code) {
      navigator.clipboard.writeText(selectedSubmission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const acceptedSubmissions = submissions.filter(s => s.status?.toLowerCase() === 'accepted').length;
  const totalSubmissions = submissions.length;
  const successRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 flex items-start gap-3">
        <XCircle className="text-rose-400 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-semibold text-rose-400 mb-1">Error</h3>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Attempts</p>
                <p className="text-2xl font-bold text-white">{totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <CheckCircle2 className="text-emerald-400" size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-white">{acceptedSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <Code2 size={64} className="mx-auto mb-4 opacity-50 text-slate-500" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Submissions Yet</h3>
          <p className="text-slate-500">Your submission history will appear here once you submit a solution</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, index) => {
            const statusConfig = getStatusConfig(sub.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={sub._id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all duration-200 group cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Status and Language */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                        <StatusIcon size={16} className={statusConfig.color} />
                        <span className={`text-sm font-semibold ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <span className="text-sm font-mono text-purple-400">{sub.language}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stats */}
                  <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-slate-300 font-mono">{sub.runtime}s</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Database size={14} className="text-slate-400" />
                      <span className="text-slate-300 font-mono">{formatMemory(sub.memory)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-slate-400" />
                      <span className="text-slate-300 font-mono">{sub.testCasesPassed}/{sub.testCasesTotal}</span>
                    </div>
                  </div>

                  {/* Right: Date and Action */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={14} />
                      <span>{formatDate(sub.createdAt)}</span>
                    </div>

                    <button 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/25"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(sub);
                      }}
                    >
                      <Code2 size={16} />
                      <span className="hidden sm:inline">View Code</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex lg:hidden items-center gap-4 mt-3 pt-3 border-t border-slate-700/50 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    <span className="font-mono">{sub.runtime}s</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Database size={12} />
                    <span className="font-mono">{formatMemory(sub.memory)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <CheckCircle2 size={12} />
                    <span className="font-mono">{sub.testCasesPassed}/{sub.testCasesTotal}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Code2 className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Submission Details</h3>
                    <p className="text-sm text-slate-400">{selectedSubmission.language}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const statusConfig = getStatusConfig(selectedSubmission.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusConfig.bg} ${statusConfig.border} border`}>
                      <StatusIcon size={16} className={statusConfig.color} />
                      <span className={`text-sm font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </span>
                  );
                })()}
                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{selectedSubmission.runtime}s</span>
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600">
                  <Database size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{formatMemory(selectedSubmission.memory)}</span>
                </span>
                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600">
                  <CheckCircle2 size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-300">
                    {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal} Passed
                  </span>
                </span>
              </div>

              {/* Error Message */}
              {selectedSubmission.errorMessage && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-rose-400 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-rose-300">{selectedSubmission.errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Code Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)] custom-scrollbar">
              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all text-sm font-medium text-white"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-6 bg-slate-900/70 border border-slate-700/50 rounded-xl overflow-x-auto text-sm">
                  <code className="text-slate-100 font-mono leading-relaxed">
                    {selectedSubmission.code}
                  </code>
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.9);
        }
      `}</style>
    </div>
  );
};

export default SubmissionHistory;