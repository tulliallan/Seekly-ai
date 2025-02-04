import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { supabase } from '@/lib/supabase/supabase'
import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

export const SocialLoginButtons = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { providerStatus } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading('google');
      
      // Configure popup window settings
      const width = 600;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        resizable=yes,
        scrollbars=yes,
        status=yes
      `;

      // Open popup and start Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open the authorization URL in a popup
        const popup = window.open(data.url, 'Google Login', windowFeatures);
        
        if (popup) {
          // Create loading overlay
          const loadingOverlay = document.createElement('div');
          loadingOverlay.id = 'google-loading-overlay';
          loadingOverlay.innerHTML = `
            <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div class="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center">
                <div class="w-16 h-16 border-4 border-t-blue-500 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 class="text-xl font-semibold text-white mb-2">Connecting to Google</h2>
                <p class="text-gray-300">Please wait while we fetch your data...</p>
              </div>
            </div>
          `;
          document.body.appendChild(loadingOverlay);

          // Check for popup closure or completion
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              document.getElementById('google-loading-overlay')?.remove();
              setIsLoading(null);
            }
          }, 1000);

          // Listen for successful authentication
          window.addEventListener('supabase.auth.callback', () => {
            popup.close();
            document.getElementById('google-loading-overlay')?.remove();
            setIsLoading(null);
          });
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setIsLoading('github');
      
      // Configure popup window settings
      const width = 600;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        resizable=yes,
        scrollbars=yes,
        status=yes
      `;

      // Open popup and start GitHub OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open the authorization URL in a popup
        const popup = window.open(data.url, 'GitHub Login', windowFeatures);
        
        if (popup) {
          // Create loading overlay
          const loadingOverlay = document.createElement('div');
          loadingOverlay.id = 'github-loading-overlay';
          loadingOverlay.innerHTML = `
            <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div class="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center">
                <div class="w-16 h-16 border-4 border-t-blue-500 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 class="text-xl font-semibold text-white mb-2">Connecting to GitHub</h2>
                <p class="text-gray-300">Please wait while we fetch your data...</p>
              </div>
            </div>
          `;
          document.body.appendChild(loadingOverlay);

          // Check for popup closure or completion
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              document.getElementById('github-loading-overlay')?.remove();
              setIsLoading(null);
            }
          }, 1000);

          // Listen for successful authentication
          window.addEventListener('supabase.auth.callback', () => {
            popup.close();
            document.getElementById('github-loading-overlay')?.remove();
            setIsLoading(null);
          });
        }
      }
    } catch (error) {
      console.error('GitHub login error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-500/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-400 bg-gray-950">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading === 'google' || providerStatus.google !== 'operational'}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg border ${
            providerStatus.google === 'operational' 
              ? 'text-gray-300 border-gray-700 hover:bg-white/5'
              : 'text-red-300 border-red-500/30 bg-red-500/10'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`}
        >
          <FcGoogle className="w-5 h-5" />
          <span>
            {isLoading === 'google' ? 'Connecting...' : 
             providerStatus.google !== 'operational' ? 'Unavailable' : 
             'Google'}
          </span>
          {providerStatus.google === 'operational' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          )}
        </button>
        <button 
          onClick={handleGithubLogin}
          disabled={isLoading === 'github' || providerStatus.github !== 'operational'}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg border ${
            providerStatus.github === 'operational' 
              ? 'text-gray-300 border-gray-700 hover:bg-white/5'
              : 'text-red-300 border-red-500/30 bg-red-500/10'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`}
        >
          <FaGithub className="w-5 h-5" />
          <span>
            {isLoading === 'github' ? 'Connecting...' : 
             providerStatus.github !== 'operational' ? 'Unavailable' : 
             'GitHub'}
          </span>
          {providerStatus.github === 'operational' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          )}
        </button>
      </div>

      {(providerStatus.github !== 'operational' || providerStatus.google !== 'operational') && (
        <div className="text-center text-sm text-red-400 mt-2">
          {providerStatus.github !== 'operational' && (
            <p>⚠️ GitHub authentication is currently unavailable</p>
          )}
          {providerStatus.google !== 'operational' && (
            <p>⚠️ Google authentication is currently unavailable</p>
          )}
        </div>
      )}
    </div>
  )
} 