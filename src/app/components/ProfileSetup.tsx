'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';

const roles = [
  { id: 'software_engineer', label: 'Software Engineer', icon: '👨‍💻' },
  { id: 'data_scientist', label: 'Data Scientist', icon: '📊' },
  { id: 'product_manager', label: 'Product Manager', icon: '📱' },
  { id: 'designer', label: 'Designer', icon: '🎨' },
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'other', label: 'Other', icon: '💼' },
];

export function ProfileSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error('No user found');
      setError('Please sign in to continue');
      return;
    }
    
    if (!username || !selectedRole) {
      console.error('Missing required fields');
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting profile setup for user:', user.id);
      let profileImageUrl = '';

      // Upload profile image if one was selected
      if (profileImage) {
        console.log('Uploading profile image...');
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileImage);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Failed to upload profile image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        profileImageUrl = publicUrl;
        console.log('Image uploaded successfully:', profileImageUrl);
      }

      // Create profile
      console.log('Creating user profile...');
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: user.id,
        p_username: username,
        p_role: selectedRole,
        p_profile_image_url: profileImageUrl
      });

      console.log('Profile creation response:', { profileData, profileError });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      if (!profileData?.success) {
        console.error('Profile creation failed:', profileData?.error);
        throw new Error(profileData?.error || 'Failed to create profile');
      }

      // Create credits
      console.log('Creating user credits...');
      const { data: creditsData, error: creditsError } = await supabase.rpc('create_user_credits', {
        p_user_id: user.id
      });

      console.log('Credits creation response:', { creditsData, creditsError });

      if (creditsError) {
        console.error('Credits creation error:', creditsError);
        throw new Error(`Failed to create credits: ${creditsError.message}`);
      }

      if (!creditsData?.success) {
        console.error('Credits creation failed:', creditsData?.error);
        throw new Error(creditsData?.error || 'Failed to create credits');
      }

      console.log('Profile setup completed successfully');
      // Show welcome screen
      setStep(3);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              {/* Logo and welcome text */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                  <img 
                    src="/logo.png"
                    alt="Seekly Logo" 
                    className="relative w-full h-full object-cover rounded-full ring-2 ring-white/20"
                  />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to Seekly</h1>
                <p className="text-gray-400">Let's set up your profile</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-4">
                      Profile Picture
                    </label>
                    <div className="flex items-center justify-center">
                      <div className="relative group">
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-2 ring-white/20 transition-transform group-hover:scale-105">
                          {imagePreview ? (
                            <Image
                              src={imagePreview}
                              alt="Profile preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg cursor-pointer transition-all shadow-lg">
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Username Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Choose your username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="Enter username"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {username && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => username && setStep(2)}
                    disabled={!username}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">What's your role?</h2>
                <p className="text-gray-400">Help us personalize your experience</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-6 rounded-xl border transition-all ${
                        selectedRole === role.id
                          ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50'
                          : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-3">{role.icon}</div>
                      <div className="text-sm text-white font-medium">{role.label}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedRole || !username || loading}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Setting up your profile...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                  >
                    Back
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-white/20">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl text-white font-bold">{username[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to Seekly, {username}!</h2>
              <p className="text-gray-400 mb-6">Your profile has been created successfully</p>
              <div className="w-16 h-16 mx-auto relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
                <div className="relative w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 