import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import Cropper from 'react-easy-crop';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award,
  ChevronRight,
  Code2,
  PieChart,
  Target,
  Edit3,
  Camera,
  X,
  Save,
  BookOpen,
  Info,
  Maximize2,
  ZoomIn,
  Move
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Helper function for cropping
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the target crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // return as a blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}

const ProfilePage = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    education: '',
    profilePicture: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/user/getProfile');
      setProfileData(data);
      setEditForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        bio: data.user.bio || '',
        education: data.user.education || '',
        profilePicture: data.user.profilePicture || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onCropComplete = useCallback((_ , currentCroppedAreaPixels) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      setIsUpdating(true);
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // 1. Get signature
      const { data: sigData } = await axiosClient.get('/user/profilePicSignature');
      
      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', croppedImageBlob);
      formData.append('api_key', sigData.api_key);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      formData.append('public_id', sigData.public_id);

      const response = await fetch(sigData.upload_url, {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await response.json();
      
      if (uploadResult.secure_url) {
        setEditForm(prev => ({ ...prev, profilePicture: uploadResult.secure_url }));
        toast.success('Image cropped and uploaded!');
        setIsCropperOpen(false);
        setImageToCrop(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to process image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const { data } = await axiosClient.put('/user/updateProfile', editForm);
      toast.success('Profile updated successfully!');
      setProfileData(prev => ({ ...prev, user: data.user }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-rose-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Something went wrong'}</p>
          <NavLink to="/" className="btn btn-primary w-full">Go Home</NavLink>
        </div>
      </div>
    );
  }

  const { user, stats, solvedProblems } = profileData;

  const difficultyStats = [
    { label: 'Easy', count: stats.difficultyBreakdown.easy, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    { label: 'Medium', count: stats.difficultyBreakdown.medium, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    { label: 'Hard', count: stats.difficultyBreakdown.hard, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header/Banner Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative">
            {/* Avatar */}
            <div className="relative group/avatar">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 group-hover/avatar:rotate-0 transition-all duration-500 border-4 border-slate-700/50">
                <img 
                  src={user.profilePicture || `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${user.firstName}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-lg border-4 border-slate-900">
                <Shield className="text-white" size={16} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  {user.firstName} {user.lastName || ''}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 self-center">
                  LVL {Math.floor(stats.totalSolved / 5) + 1}
                </span>
              </div>
              
              <p className="text-slate-300 mb-4 max-w-2xl italic">
                "{user.bio || 'Passionate Coder'}"
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Mail size={16} className="text-blue-400" />
                  <span className="text-sm">{user.emailId}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <BookOpen size={16} className="text-purple-400" />
                  <span className="text-sm">{user.education || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-xl border border-slate-600/30">
                  <Calendar size={16} className="text-emerald-400" />
                  <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="btn btn-primary gap-2"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
              <NavLink to="/" className="btn btn-outline border-slate-700 hover:bg-slate-700 text-slate-300">
                Back to Home
              </NavLink>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={() => !isUpdating && setIsEditModalOpen(false)}
            ></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 size={20} className="text-blue-400" />
                  Edit Profile
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {isCropperOpen ? (
                /* Cropper Modal View */
                <div className="p-8 space-y-6">
                  <div className="relative h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
                    <Cropper
                      image={imageToCrop}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <ZoomIn size={20} className="text-slate-400" />
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <Maximize2 size={20} className="text-slate-400" />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                      <Move size={14} />
                      Drag to position, use slider to zoom
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(false)}
                        className="flex-1 btn btn-ghost text-slate-400"
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropSave}
                        className="flex-[2] btn btn-primary gap-2"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <Save size={18} />
                        )}
                        Apply Crop
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Edit Form */
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Profile Pic Upload */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group/edit-pic">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-xl bg-slate-900">
                          <img 
                            src={editForm.profilePicture || `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${editForm.firstName}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/edit-pic:opacity-100 transition-opacity rounded-3xl"
                          disabled={isUpdating}
                        >
                          <Camera size={24} className="mb-1" />
                          <span className="text-[10px] font-bold uppercase">Change</span>
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <p className="text-[10px] text-slate-500 text-center max-w-[120px]">JPG, PNG or GIF. Max 5MB.</p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                          First Name
                        </label>
                        <input 
                          type="text"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                          placeholder="First Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                          Last Name
                        </label>
                        <input 
                          type="text"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                          placeholder="Last Name"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                          Education
                        </label>
                        <input 
                          type="text"
                          value={editForm.education}
                          onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                          placeholder="E.g. Computer Science at Stanford"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                          Bio
                        </label>
                        <textarea 
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-colors h-24 resize-none"
                          placeholder="Tell us about yourself..."
                          maxLength={200}
                        ></textarea>
                        <div className="flex justify-end">
                          <span className="text-[10px] text-slate-500">{editForm.bio.length}/200</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-700 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 btn btn-ghost text-slate-400 hover:bg-slate-700"
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] btn btn-primary gap-2 shadow-blue-500/20"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <Save size={18} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Progress */}
          <div className="lg:col-span-1 space-y-8">
            {/* Main Stats Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <PieChart className="text-blue-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Activity Overview</h2>
              </div>

              <div className="space-y-6">
                {/* Total Solved Circle */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-700/50"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * stats.totalSolved) / 100} // Assuming 100 total for visual
                        className="text-blue-500 transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-4xl font-black text-white">{stats.totalSolved}</span>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Solved</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="space-y-4">
                  {difficultyStats.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-semibold ${item.color}`}>{item.label}</span>
                        <span className="text-white font-mono">{item.count}</span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.bg.replace('/10', '')} transition-all duration-1000`}
                          style={{ width: `${(item.count / (stats.totalSolved || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submissions Stats */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Submissions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSubmissions}</p>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.successRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Solved Problems List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-xl min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle2 className="text-emerald-400" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Solved Problems</h2>
                </div>
                <span className="px-4 py-1 bg-slate-700/50 rounded-full text-slate-400 text-sm border border-slate-600/50">
                  {solvedProblems.length} Items
                </span>
              </div>

              {solvedProblems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mb-4 text-slate-500">
                    <Code2 size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No problems solved yet</h3>
                  <p className="text-slate-500 max-w-sm">Start your journey by solving some interesting coding challenges!</p>
                  <NavLink to="/" className="btn btn-primary mt-6">Browse Problems</NavLink>
                </div>
              ) : (
                <div className="space-y-3">
                  {solvedProblems.map((problem) => (
                    <NavLink
                      key={problem._id}
                      to={`/problem/${problem._id}`}
                      className="flex items-center justify-between p-4 bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600/20 hover:border-blue-500/30 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <Target size={20} className="text-slate-500 group-hover:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors">{problem.title}</h4>
                          <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded uppercase tracking-wider">{problem.tags}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          problem.difficulty === 'easy' ? 'text-emerald-400' :
                          problem.difficulty === 'medium' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <ChevronRight className="text-slate-600 group-hover:text-blue-400 transform group-hover:translateX(2px) transition-all" size={20} />
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-primary {
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          border: none;
          color: white;
          font-weight: 600;
          transition: all 0.3s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
        }
        .btn-primary:disabled {
          background: #475569;
          opacity: 0.7;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
