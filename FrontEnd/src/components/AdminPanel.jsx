import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { useState } from 'react';

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

const LANGUAGES = ['C++', 'Java', 'JavaScript'];
const LANG_COLORS = { 'C++': '#00BFFF', 'Java': '#FF6B35', 'JavaScript': '#F7DF1E' };

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: 'array',
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: 'visibleTestCases' });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: 'hiddenTestCases' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosClient.post('/problem/create', data);
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Problem Info', 'Test Cases', 'Code Templates'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;500;600;700;800&display=swap');
        
        .admin-root {
          font-family: 'Syne', sans-serif;
          min-height: 100vh;
          background: #0a0c10;
          background-image: 
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 50%);
        }

        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .glass-card:hover {
          border-color: rgba(99,102,241,0.2);
          transition: border-color 0.3s ease;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          font-family: 'Syne', sans-serif;
        }
        .field-input::placeholder { color: rgba(148,163,184,0.4); }
        .field-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field-input.error { border-color: rgba(239,68,68,0.5); }

        .field-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 12px 14px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          resize: vertical;
          transition: all 0.2s;
          font-family: 'Syne', sans-serif;
          line-height: 1.6;
          min-height: 120px;
        }
        .field-textarea::placeholder { color: rgba(148,163,184,0.4); }
        .field-textarea:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .code-textarea {
          width: 100%;
          background: transparent;
          border: none;
          color: #a9b1d6;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          outline: none;
          resize: none;
          padding: 0;
          min-height: 160px;
        }

        .field-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
          appearance: none;
          font-family: 'Syne', sans-serif;
        }
        .field-select:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field-select option { background: #1e1e2e; }

        .label-text {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: rgba(148,163,184,0.8);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }

        .btn-primary-main {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .btn-primary-main:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.45);
        }
        .btn-primary-main:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-ghost-sm {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #94a3b8;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-ghost-sm:hover {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .btn-danger-sm {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          color: #f87171;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          padding: 5px 10px;
        }
        .btn-danger-sm:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.4);
        }

        .test-case-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
          position: relative;
        }

        .step-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s;
          border: 1px solid transparent;
        }
        .step-pill.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
        }
        .step-pill.inactive {
          color: rgba(100,116,139,0.7);
        }
        .step-pill.inactive:hover {
          color: #94a3b8;
          background: rgba(255,255,255,0.03);
        }

        .step-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700;
        }
        .step-dot.active { background: #6366f1; color: white; }
        .step-dot.inactive { background: rgba(255,255,255,0.08); color: rgba(148,163,184,0.6); }

        .lang-tab {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          color: rgba(100,116,139,0.8);
          letter-spacing: 0.02em;
        }
        .lang-tab.active {
          border-bottom-color: var(--lang-color, #6366f1);
          color: var(--lang-color, #a5b4fc);
        }
        .lang-tab:hover:not(.active) { color: #94a3b8; }

        .code-block-wrap {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: hidden;
        }
        .code-block-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .code-block-content { padding: 16px; }
        .code-dot { width: 10px; height: 10px; border-radius: 50%; }

        .difficulty-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          font-size: 11px; font-weight: 700;
        }
        .diff-easy { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .diff-medium { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
        .diff-hard { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '';
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid rgba(148,163,184,0.5);
          pointer-events: none;
        }

        .visible-badge {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8;
          border-radius: 100px;
          padding: 2px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .hidden-badge {
          background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.25);
          color: #c084fc;
          border-radius: 100px;
          padding: 2px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease both; }

        .nav-bar {
          background: rgba(10,12,16,0.8);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 100;
        }

        .submit-btn {
          padding: 14px 40px;
          font-size: 15px;
          letter-spacing: 0.05em;
        }

        .progress-bar {
          height: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 100px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 100px;
          transition: width 0.5s ease;
        }
      `}</style>

      <div className="admin-root">
        {/* Top Nav */}
        <nav className="nav-bar px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }} className="text-white">
                CodingAdda
              </span>
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }} className="text-slate-400">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            {steps.map((step, i) => (
              <button key={i} className={`step-pill ${activeStep === i ? 'active' : 'inactive'}`} onClick={() => setActiveStep(i)} type="button">
                <span className={`step-dot ${activeStep === i ? 'active' : 'inactive'}`}>{i + 1}</span>
                {step}
              </button>
            ))}
          </div>
        </nav>

        {/* Progress */}
        <div className="progress-bar" style={{ borderRadius: 0 }}>
          <div className="progress-fill" style={{ width: `${((activeStep + 1) / 3) * 100}%` }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10 fade-up">
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: 'white', lineHeight: 1.1, marginBottom: 8 }}>
              Create New Problem
            </div>
            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 14 }}>
              Fill in the details below to add a new challenge to the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ─── STEP 1: Basic Info ─── */}
            {activeStep === 0 && (
              <div className="space-y-5 fade-up">
                <div className="glass-card p-7">
                  <SectionHeader
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Problem Details"
                    subtitle="Basic information visible to solvers"
                  />

                  <div className="space-y-5">
                    <div>
                      <label className="label-text">Problem Title</label>
                      <input {...register('title')} placeholder="e.g. Two Sum, Binary Search..." className={`field-input ${errors.title ? 'error' : ''}`} />
                      <ErrorMsg message={errors.title?.message} />
                    </div>

                    <div>
                      <label className="label-text">Description</label>
                      <textarea {...register('description')} placeholder="Describe the problem in detail. Include constraints, examples, and edge cases..." className={`field-textarea ${errors.description ? 'error' : ''}`} rows={6} />
                      <ErrorMsg message={errors.description?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="label-text">Difficulty Level</label>
                        <div className="select-wrap">
                          <select {...register('difficulty')} className="field-select">
                            <option value="easy">🟢 Easy</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="hard">🔴 Hard</option>
                          </select>
                        </div>
                        <ErrorMsg message={errors.difficulty?.message} />
                      </div>

                      <div>
                        <label className="label-text">Topic Tag</label>
                        <div className="select-wrap">
                          <select {...register('tags')} className="field-select">
                            <option value="array">📦 Array</option>
                            <option value="linkedList">🔗 Linked List</option>
                            <option value="graph">🕸️ Graph</option>
                            <option value="dp">🧠 Dynamic Programming</option>
                          </select>
                        </div>
                        <ErrorMsg message={errors.tags?.message} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" className="btn-primary-main submit-btn" style={{ padding: '12px 32px', fontSize: 14 }} onClick={() => setActiveStep(1)}>
                    Next: Test Cases →
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Test Cases ─── */}
            {activeStep === 1 && (
              <div className="space-y-5 fade-up">
                {/* Visible Test Cases */}
                <div className="glass-card p-7">
                  <SectionHeader
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    title="Visible Test Cases"
                    subtitle="Shown to users as examples"
                  />

                  <div className="space-y-4">
                    {visibleFields.map((field, index) => (
                      <div key={field.id} className="test-case-card">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="visible-badge">Example {index + 1}</span>
                          </div>
                          <button type="button" onClick={() => removeVisible(index)} className="btn-danger-sm">
                            ✕ Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="label-text">Input</label>
                            <input {...register(`visibleTestCases.${index}.input`)} placeholder="[2,7,11,15], 9" className="field-input" />
                            <ErrorMsg message={errors.visibleTestCases?.[index]?.input?.message} />
                          </div>
                          <div>
                            <label className="label-text">Expected Output</label>
                            <input {...register(`visibleTestCases.${index}.output`)} placeholder="[0,1]" className="field-input" />
                            <ErrorMsg message={errors.visibleTestCases?.[index]?.output?.message} />
                          </div>
                        </div>

                        <div>
                          <label className="label-text">Explanation</label>
                          <textarea {...register(`visibleTestCases.${index}.explanation`)} placeholder="Explain why this is the correct output..." className="field-textarea" rows={3} style={{ minHeight: 70 }} />
                          <ErrorMsg message={errors.visibleTestCases?.[index]?.explanation?.message} />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                      className="btn-ghost-sm w-full justify-center py-3"
                      style={{ width: '100%', borderStyle: 'dashed' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Visible Test Case
                    </button>
                    {errors.visibleTestCases?.message && <ErrorMsg message={errors.visibleTestCases.message} />}
                  </div>
                </div>

                {/* Hidden Test Cases */}
                <div className="glass-card p-7">
                  <SectionHeader
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                    title="Hidden Test Cases"
                    subtitle="Used for grading — not visible to users"
                  />

                  <div className="space-y-4">
                    {hiddenFields.map((field, index) => (
                      <div key={field.id} className="test-case-card">
                        <div className="flex items-center justify-between mb-4">
                          <span className="hidden-badge">Hidden {index + 1}</span>
                          <button type="button" onClick={() => removeHidden(index)} className="btn-danger-sm">
                            ✕ Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="label-text">Input</label>
                            <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Test input..." className="field-input" />
                            <ErrorMsg message={errors.hiddenTestCases?.[index]?.input?.message} />
                          </div>
                          <div>
                            <label className="label-text">Expected Output</label>
                            <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Expected output..." className="field-input" />
                            <ErrorMsg message={errors.hiddenTestCases?.[index]?.output?.message} />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => appendHidden({ input: '', output: '' })}
                      className="btn-ghost-sm w-full justify-center py-3"
                      style={{ width: '100%', borderStyle: 'dashed' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Hidden Test Case
                    </button>
                    {errors.hiddenTestCases?.message && <ErrorMsg message={errors.hiddenTestCases.message} />}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button type="button" className="btn-ghost-sm" style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => setActiveStep(0)}>
                    ← Back
                  </button>
                  <button type="button" className="btn-primary-main" style={{ padding: '12px 32px', fontSize: 14 }} onClick={() => setActiveStep(2)}>
                    Next: Code Templates →
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Code Templates ─── */}
            {activeStep === 2 && (
              <div className="space-y-5 fade-up">
                {/* Language tabs */}
                <div className="glass-card overflow-hidden">
                  {/* Tab header */}
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 24px', background: 'rgba(0,0,0,0.2)' }}>
                    {LANGUAGES.map((lang, i) => (
                      <button
                        key={lang}
                        type="button"
                        className={`lang-tab ${activeLangTab === i ? 'active' : ''}`}
                        style={{ '--lang-color': LANG_COLORS[lang] }}
                        onClick={() => setActiveLangTab(i)}
                      >
                        {lang}
                      </button>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                      <div className="code-dot" style={{ background: '#ff5f56' }} />
                      <div className="code-dot" style={{ background: '#febc2e' }} />
                      <div className="code-dot" style={{ background: '#27c93f' }} />
                    </div>
                  </div>

                  <div className="p-7">
                    {LANGUAGES.map((lang, i) => (
                      <div key={lang} style={{ display: activeLangTab === i ? 'block' : 'none' }} className="space-y-5">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: LANG_COLORS[lang], textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lang}</span>
                            <span className="label-text" style={{ marginBottom: 0, color: 'rgba(100,116,139,0.6)' }}>— Starter Template</span>
                          </div>
                          <div className="code-block-wrap">
                            <div className="code-block-header">
                              <div className="code-dot" style={{ background: '#ff5f56' }} />
                              <div className="code-dot" style={{ background: '#febc2e' }} />
                              <div className="code-dot" style={{ background: '#27c93f' }} />
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(148,163,184,0.4)', marginLeft: 8 }}>
                                starter.{lang === 'C++' ? 'cpp' : lang === 'Java' ? 'java' : 'js'}
                              </span>
                            </div>
                            <div className="code-block-content">
                              <textarea {...register(`startCode.${i}.initialCode`)} className="code-textarea" placeholder={`// Write the initial ${lang} function skeleton here...`} rows={8} />
                            </div>
                          </div>
                          <ErrorMsg message={errors.startCode?.[i]?.initialCode?.message} />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: LANG_COLORS[lang], textTransform: 'uppercase', letterSpacing: '0.1em' }}>{lang}</span>
                            <span className="label-text" style={{ marginBottom: 0, color: 'rgba(100,116,139,0.6)' }}>— Reference Solution</span>
                          </div>
                          <div className="code-block-wrap">
                            <div className="code-block-header">
                              <div className="code-dot" style={{ background: '#ff5f56' }} />
                              <div className="code-dot" style={{ background: '#febc2e' }} />
                              <div className="code-dot" style={{ background: '#27c93f' }} />
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(148,163,184,0.4)', marginLeft: 8 }}>
                                solution.{lang === 'C++' ? 'cpp' : lang === 'Java' ? 'java' : 'js'}
                              </span>
                            </div>
                            <div className="code-block-content">
                              <textarea {...register(`referenceSolution.${i}.completeCode`)} className="code-textarea" placeholder={`// Write the complete ${lang} reference solution here...`} rows={10} />
                            </div>
                          </div>
                          <ErrorMsg message={errors.referenceSolution?.[i]?.completeCode?.message} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit area */}
                <div className="glass-card p-6 flex items-center justify-between">
                  <button type="button" className="btn-ghost-sm" style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => setActiveStep(1)}>
                    ← Back
                  </button>

                  <div className="flex items-center gap-4">
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>
                      All fields must be valid before submitting
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary-main submit-btn"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Publishing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Publish Problem
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminPanel;