import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Code2, 
  FileText, 
  Target, 
  Eye, 
  EyeOff, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function UpdateProblem() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema)
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
      showNotification('error', 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProblem = async (problem) => {
    try {
      const { data } = await axiosClient.get(`/problem/problemById/${problem._id}`);
      setSelectedProblem(data);
      
      // Reset form with problem data
      reset({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        tags: data.tags,
        visibleTestCases: data.visibleTestCases,
        hiddenTestCases: data.hiddenTestCases,
        startCode: data.startCode,
        referenceSolution: data.referenceSolution
      });
      
      setActiveSection('basic');
    } catch (error) {
      console.error('Error fetching problem details:', error);
      showNotification('error', 'Failed to load problem details');
    }
  };

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      await axiosClient.put(`/problem/update/${selectedProblem._id}`, data);
      showNotification('success', 'Problem updated successfully!');
      setTimeout(() => {
        setSelectedProblem(null);
        fetchProblems();
      }, 1500);
    } catch (error) {
      console.error('Error updating problem:', error);
      showNotification('error', error.response?.data?.message || 'Failed to update problem');
    } finally {
      setUpdating(false);
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

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'testcases', label: 'Test Cases', icon: Target },
    { id: 'code', label: 'Code Templates', icon: Code2 }
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-0 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl bottom-0 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <Edit className="text-blue-400" size={24} />
            <span className="text-slate-300 font-medium">Problem Management</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Update Problem
          </h1>
          
          <p className="text-slate-400 text-lg">
            Select and modify existing problems on CodingAdda
          </p>
        </div>

        {!selectedProblem ? (
          // Problem Selection View
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
                />
              </div>
              {searchTerm && (
                <p className="mt-3 text-slate-400 text-sm">
                  Found {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Problems Grid */}
            {filteredProblems.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-16 text-center">
                <Target size={64} className="mx-auto mb-4 opacity-50 text-slate-500" />
                <h3 className="text-2xl font-bold text-slate-300 mb-2">No problems found</h3>
                <p className="text-slate-500">Try adjusting your search query</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProblems.map((problem) => {
                  const diffConfig = getDifficultyConfig(problem.difficulty);
                  return (
                    <div
                      key={problem._id}
                      onClick={() => handleSelectProblem(problem)}
                      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/10"
                    >
                      <h3 className="text-lg font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {problem.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffConfig.bg} ${diffConfig.color} border ${diffConfig.border}`}>
                          {problem.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {problem.tags}
                        </span>
                      </div>

                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                        <Edit size={16} />
                        Select to Edit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Problem Edit Form
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setSelectedProblem(null)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <ArrowLeft size={18} />
              Back to Problems
            </button>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-4">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              {activeSection === 'basic' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100">Basic Information</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-slate-300 font-medium flex items-center gap-2">
                          <Sparkles size={16} className="text-yellow-400" />
                          Problem Title
                        </span>
                      </label>
                      <input
                        {...register('title')}
                        placeholder="e.g., Two Sum"
                        className={`input w-full bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors.title ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.title && (
                        <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.title.message}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-slate-300 font-medium">Description</span>
                      </label>
                      <textarea
                        {...register('description')}
                        placeholder="Write a detailed problem description..."
                        className={`textarea w-full h-40 bg-slate-900/50 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          errors.description ? 'border-red-500' : ''
                        }`}
                      />
                      {errors.description && (
                        <span className="text-red-400 text-sm mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.description.message}
                        </span>
                      )}
                    </div>

                    {/* Difficulty and Tag */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-slate-300 font-medium">Difficulty Level</span>
                        </label>
                        <select
                          {...register('difficulty')}
                          className={`select w-full bg-slate-900/50 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            errors.difficulty ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="">Select difficulty</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-slate-300 font-medium">Category Tag</span>
                        </label>
                        <select
                          {...register('tags')}
                          className={`select w-full bg-slate-900/50 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                            errors.tags ? 'border-red-500' : ''
                          }`}
                        >
                          <option value="">Select tag</option>
                          <option value="array">Array</option>
                          <option value="linkedList">Linked List</option>
                          <option value="graph">Graph</option>
                          <option value="dp">Dynamic Programming</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={() => setActiveSection('testcases')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                      Next: Test Cases →
                    </button>
                  </div>
                </div>
              )}

              {/* Test Cases Section */}
              {activeSection === 'testcases' && (
                <div className="space-y-6">
                  {/* Visible Test Cases */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                          <Eye className="text-emerald-400" size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-100">Visible Test Cases</h2>
                          <p className="text-slate-400 text-sm">These will be shown to users as examples</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/25"
                      >
                        <Plus size={18} />
                        Add Case
                      </button>
                    </div>

                    <div className="space-y-4">
                      {visibleFields.map((field, index) => (
                        <div key={field.id} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-emerald-400">Example {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeVisible(index)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-all"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <input
                              {...register(`visibleTestCases.${index}.input`)}
                              placeholder="Input (e.g., nums = [2,7,11,15], target = 9)"
                              className="input w-full bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            
                            <input
                              {...register(`visibleTestCases.${index}.output`)}
                              placeholder="Output (e.g., [0,1])"
                              className="input w-full bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            
                            <textarea
                              {...register(`visibleTestCases.${index}.explanation`)}
                              placeholder="Explanation of the test case..."
                              className="textarea w-full h-20 bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>
                      ))}
                      
                      {visibleFields.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                          <Eye size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No visible test cases yet. Add your first example!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hidden Test Cases */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <EyeOff className="text-purple-400" size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-100">Hidden Test Cases</h2>
                          <p className="text-slate-400 text-sm">Used for validation when users submit</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => appendHidden({ input: '', output: '' })}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/25"
                      >
                        <Plus size={18} />
                        Add Case
                      </button>
                    </div>

                    <div className="space-y-4">
                      {hiddenFields.map((field, index) => (
                        <div key={field.id} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-purple-400">Hidden Case {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeHidden(index)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-all"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <input
                              {...register(`hiddenTestCases.${index}.input`)}
                              placeholder="Input"
                              className="input w-full bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            
                            <input
                              {...register(`hiddenTestCases.${index}.output`)}
                              placeholder="Expected Output"
                              className="input w-full bg-slate-800/50 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>
                      ))}
                      
                      {hiddenFields.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                          <EyeOff size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No hidden test cases yet. Add validation cases!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveSection('basic')}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('code')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                      Next: Code Templates →
                    </button>
                  </div>
                </div>
              )}

              {/* Code Templates Section */}
              {activeSection === 'code' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Code2 className="text-cyan-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">Code Templates</h2>
                      <p className="text-slate-400 text-sm">Provide starter code and reference solutions for each language</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {[
                      { index: 0, lang: 'C++', color: 'blue', icon: '{ }' },
                      { index: 1, lang: 'Java', color: 'orange', icon: 'class' },
                      { index: 2, lang: 'JavaScript', color: 'yellow', icon: 'fn()' }
                    ].map(({ index, lang, color, icon }) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`px-3 py-1 bg-${color}-500/20 border border-${color}-500/30 rounded-lg`}>
                            <span className={`text-${color}-400 font-mono font-semibold`}>{icon}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-100">{lang}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Initial Code */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-slate-300 font-medium">Starter Template</span>
                              <span className="label-text-alt text-slate-500">What users see initially</span>
                            </label>
                            <textarea
                              {...register(`startCode.${index}.initialCode`)}
                              placeholder={`// Write ${lang} starter code here...`}
                              className="textarea w-full h-48 bg-slate-900/70 border-slate-600 text-slate-100 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-slate-600"
                            />
                          </div>

                          {/* Reference Solution */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text text-slate-300 font-medium">Reference Solution</span>
                              <span className="label-text-alt text-slate-500">Complete working solution</span>
                            </label>
                            <textarea
                              {...register(`referenceSolution.${index}.completeCode`)}
                              placeholder={`// Write ${lang} solution here...`}
                              className="textarea w-full h-48 bg-slate-900/70 border-slate-600 text-emerald-100 font-mono text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder-slate-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setActiveSection('testcases')}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          Update Problem
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

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
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default UpdateProblem;