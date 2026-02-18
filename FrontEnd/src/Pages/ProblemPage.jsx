import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { 
  Play, 
  Send, 
  Code2, 
  BookOpen, 
  FileText, 
  History, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database,
  Zap,
  Trophy,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const decodeBase64 = (value) => {
  try {
    if (!value) return '';
    return atob(value);
  } catch (e) {
    return value;
  }
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let {problemId} = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });
      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });
      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'medium':
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      case 'hard':
        return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    }
  };

  const leftTabs = [
    { id: 'description', label: 'Description', icon: BookOpen },
    { id: 'editorial', label: 'Editorial', icon: FileText },
    { id: 'solutions', label: 'Solutions', icon: Code2 },
    { id: 'submissions', label: 'Submissions', icon: History },
    { id: 'chatAI', label: 'AI Helper', icon: MessageSquare }
  ];

  const rightTabs = [
    { id: 'code', label: 'Code', icon: Code2 },
    { id: 'testcase', label: 'Test Cases', icon: Target },
    { id: 'result', label: 'Result', icon: Trophy }
  ];

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-900 text-slate-100">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-slate-700/50">
        {/* Left Tabs */}
        <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-2">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative group ${
                  activeLeftTab === tab.id
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveLeftTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {activeLeftTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div className="p-6">
                  {/* Problem Header */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <h1 className="text-3xl font-bold text-slate-100 flex-1">{problem.title}</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {(() => {
                        const diffConfig = getDifficultyConfig(problem.difficulty);
                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                          </span>
                        );
                      })()}
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        {problem.tags}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert max-w-none mb-8">
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {problem.description}
                    </div>
                  </div>

                  {/* Examples */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-yellow-400" />
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 hover:border-slate-600/50 transition-all duration-200">
                          <h4 className="font-semibold mb-3 text-blue-400">Example {index + 1}</h4>
                          <div className="space-y-2 text-sm font-mono">
                            <div className="flex items-start">
                              <span className="text-slate-500 w-24">Input:</span>
                              <span className="text-emerald-400">{example.input}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="text-slate-500 w-24">Output:</span>
                              <span className="text-cyan-400">{example.output}</span>
                            </div>
                            {example.explanation && (
                              <div className="flex items-start mt-2 pt-2 border-t border-slate-700/50">
                                <span className="text-slate-500 w-24">Explain:</span>
                                <span className="text-slate-400">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FileText size={24} className="text-blue-400" />
                    Editorial
                  </h2>
                  <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Code2 size={24} className="text-blue-400" />
                    Reference Solutions
                  </h2>
                  <div className="space-y-4">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 px-4 py-3 border-b border-slate-700/50">
                          <h3 className="font-semibold text-blue-400">{problem?.title} - {solution?.language}</h3>
                        </div>
                        <div className="p-4">
                          <pre className="bg-slate-900/50 p-4 rounded text-sm overflow-x-auto custom-scrollbar">
                            <code className="text-slate-300">{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-12 text-slate-500">
                        <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Solutions will be available after you solve the problem.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <History size={24} className="text-blue-400" />
                    My Submissions
                  </h2>
                  <SubmissionHistory problemId={problemId} />
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare size={24} className="text-blue-400" />
                    AI Assistant
                  </h2>
                  <ChatAi problem={problem} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="flex items-center bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-2">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative ${
                  activeRightTab === tab.id
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setActiveRightTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {activeRightTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 bg-slate-800/30 border-b border-slate-700/50">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === lang
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50 flex justify-between items-center">
                <button 
                  className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  <ChevronRight size={16} />
                  Console
                </button>
                <div className="flex gap-3">
                  <button
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Run Code
                      </>
                    )}
                  </button>
                  <button
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-400" />
                Test Results
              </h3>
              {runResult ? (
                <div className={`p-6 rounded-lg border-2 ${
                  runResult.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {runResult.success ? (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                        <h4 className="text-xl font-bold text-emerald-400">All Test Cases Passed!</h4>
                      </div>
                      
                      <div className="flex gap-6 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          <span className="text-slate-300">Runtime: {runResult.runtime} sec</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database size={16} className="text-slate-400" />
                          <span className="text-slate-300">Memory: {runResult.memory} KB</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-300">Test Case {i + 1}</span>
                              <CheckCircle2 size={16} className="text-emerald-400" />
                            </div>
                            <div className="space-y-1 text-xs font-mono text-slate-400">
                              <div><span className="text-slate-500">Input:</span> {decodeBase64(tc.stdin)}</div>
                              <div><span className="text-slate-500">Expected:</span> {decodeBase64(tc.expected_output)}</div>
                              <div><span className="text-slate-500">Output:</span> {decodeBase64(tc.stdout)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <XCircle size={24} className="text-rose-400" />
                        <h4 className="text-xl font-bold text-rose-400">Test Failed</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-300">Test Case {i + 1}</span>
                              {tc.status_id === 3 ? (
                                <CheckCircle2 size={16} className="text-emerald-400" />
                              ) : (
                                <XCircle size={16} className="text-rose-400" />
                              )}
                            </div>
                            <div className="space-y-1 text-xs font-mono text-slate-400">
                              <div><span className="text-slate-500">Input:</span> {decodeBase64(tc.stdin)}</div>
                              <div><span className="text-slate-500">Expected:</span> {decodeBase64(tc.expected_output)}</div>
                              <div><span className="text-slate-500">Output:</span> {decodeBase64(tc.stdout)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Zap size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Click "Run Code" to test your solution</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-slate-900">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-blue-400" />
                Submission Result
              </h3>
              {submitResult ? (
                <div className={`p-6 rounded-lg border-2 ${
                  submitResult.accepted 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {submitResult.accepted ? (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-500/20 rounded-full">
                          <Trophy size={32} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-emerald-400">Accepted!</h4>
                          <p className="text-slate-400 text-sm">Congratulations on solving this problem</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                          <div className="text-slate-400 text-sm mb-1">Test Cases</div>
                          <div className="text-2xl font-bold text-emerald-400">
                            {submitResult.passedTestCases}/{submitResult.totalTestCases}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                          <div className="text-slate-400 text-sm mb-1">Runtime</div>
                          <div className="text-2xl font-bold text-blue-400">
                            {submitResult.runtime} sec
                          </div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 col-span-2">
                          <div className="text-slate-400 text-sm mb-1">Memory</div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {submitResult.memory} KB
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-rose-500/20 rounded-full">
                          <XCircle size={32} className="text-rose-400" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold text-rose-400">{submitResult.error}</h4>
                          <p className="text-slate-400 text-sm">Keep trying, you'll get it!</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                        <div className="text-slate-400 text-sm mb-1">Test Cases Passed</div>
                        <div className="text-2xl font-bold text-rose-400">
                          {submitResult.passedTestCases}/{submitResult.totalTestCases}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <Send size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Click "Submit" to evaluate your solution</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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

export default ProblemPage;