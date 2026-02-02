import { useState, useEffect } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BraxLogo from "@/components/shared/BraxLogo";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "viewer";
  status: string;
  expires_at: string;
}

// Generate a unique device token for this browser
const getDeviceToken = (): string => {
  const STORAGE_KEY = "trusted_device_token";
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID() + "-" + Date.now();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
};

// Get a simple device name
const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome Browser";
  if (ua.includes("Firefox")) return "Firefox Browser";
  if (ua.includes("Safari")) return "Safari Browser";
  if (ua.includes("Edge")) return "Edge Browser";
  return "Web Browser";
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  
  // Check multiple sources for the invite token
  // 1. Query parameter: ?invite=xxx
  // 2. Hash fragment: #invite=xxx (fallback if Brevo strips query params)
  // 3. Full URL search (in case of redirect issues)
  const getInviteToken = (): string | null => {
    // First try query params
    const queryToken = searchParams.get("invite");
    if (queryToken) return queryToken;
    
    // Check hash fragment as fallback
    const hash = window.location.hash;
    if (hash.includes("invite=")) {
      const match = hash.match(/invite=([^&]+)/);
      if (match) return match[1];
    }
    
    // Check full URL search string directly (handles edge cases)
    const fullSearch = window.location.search;
    if (fullSearch.includes("invite=")) {
      const match = fullSearch.match(/invite=([^&]+)/);
      if (match) return match[1];
    }
    
    return null;
  };
  
  const inviteToken = getInviteToken();
  
  // Only show signup option when there's a valid invitation
  const [isLogin, setIsLogin] = useState(!inviteToken);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState<string | null>(null);
  
  // 2FA state - persisted in sessionStorage to survive auth state changes
  const [needs2FA, setNeeds2FAState] = useState(() => {
    return sessionStorage.getItem("needs2FA") === "true";
  });
  const [pending2FAUser, setPending2FAUserState] = useState<{ id: string; email: string } | null>(() => {
    const stored = sessionStorage.getItem("pending2FAUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [pendingAccessToken, setPendingAccessTokenState] = useState<string | null>(() => {
    return sessionStorage.getItem("pendingAccessToken");
  });
  const [pending2FAPassword, setPending2FAPasswordState] = useState<string | null>(() => {
    return sessionStorage.getItem("pending2FAPassword");
  });
  const [otpCode, setOtpCode] = useState("");
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // Wrapper functions to sync state with sessionStorage
  const setNeeds2FA = (value: boolean) => {
    setNeeds2FAState(value);
    if (value) {
      sessionStorage.setItem("needs2FA", "true");
    } else {
      sessionStorage.removeItem("needs2FA");
    }
  };

  const setPending2FAUser = (user: { id: string; email: string } | null) => {
    setPending2FAUserState(user);
    if (user) {
      sessionStorage.setItem("pending2FAUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("pending2FAUser");
    }
  };

  const setPendingAccessToken = (token: string | null) => {
    setPendingAccessTokenState(token);
    if (token) {
      sessionStorage.setItem("pendingAccessToken", token);
    } else {
      sessionStorage.removeItem("pendingAccessToken");
    }
  };

  const setPending2FAPassword = (pwd: string | null) => {
    setPending2FAPasswordState(pwd);
    if (pwd) {
      sessionStorage.setItem("pending2FAPassword", pwd);
    } else {
      sessionStorage.removeItem("pending2FAPassword");
    }
  };

  // Clear all 2FA session data
  const clear2FAState = () => {
    setNeeds2FAState(false);
    setPending2FAUserState(null);
    setPendingAccessTokenState(null);
    setPending2FAPasswordState(null);
    sessionStorage.removeItem("needs2FA");
    sessionStorage.removeItem("pending2FAUser");
    sessionStorage.removeItem("pendingAccessToken");
    sessionStorage.removeItem("pending2FAPassword");
  };
  
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load invitation details if token is present
  useEffect(() => {
    // Debug: log the current URL and token
    console.log("Auth page loaded with URL:", window.location.href);
    console.log("Invite token:", inviteToken);
    console.log("Auth loading:", authLoading);
    console.log("User:", user);
    
    if (inviteToken) {
      loadInvitation(inviteToken);
    } else {
      // No token, ensure we're not stuck in loading
      setInviteLoading(false);
    }
  }, [inviteToken]);

  const loadInvitation = async (token: string) => {
    setInviteLoading(true);
    setInviteError(null);
    
    console.log("Looking up invitation with token:", token);
    
    try {
      // Use secure RPC function to validate token without exposing table data
      const { data, error } = await supabase
        .rpc("validate_invitation_token", { invite_token: token })
        .single();

      console.log("Invitation lookup result:", { data, error });

      if (error || !data) {
        console.error("Invitation not found:", error);
        setInviteError("Invalid or expired invitation link.");
        return;
      }

      if (data.status !== "pending") {
        setInviteError("This invitation has already been used.");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setInviteError("This invitation has expired.");
        return;
      }

      setInvitation({
        ...data,
        role: data.role as "admin" | "viewer"
      });
      setEmail(data.email);
      setIsLogin(false); // Default to signup for new invitations
    } catch (err) {
      console.error("Error loading invitation:", err);
      setInviteError("Failed to load invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Accept invitation after successful auth
  const acceptInvitation = async (userId: string, userEmail: string) => {
    if (!invitation) return;

    // Verify the authenticated user's email matches the invitation
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Email mismatch",
        description: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`,
      });
      // Sign out the mismatched user
      await signOut();
      return;
    }

    try {
      // Update invitation status
      const { error: inviteError } = await supabase
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
      
      if (inviteError) {
        console.error("Error updating invitation status:", inviteError);
      }

      // Update user role to match invitation
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: invitation.role })
        .eq("user_id", userId);
      
      if (roleError) {
        console.error("Error updating user role:", roleError);
      }

      // Update user profile with invited_at timestamp
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ invited_at: new Date().toISOString() })
        .eq("user_id", userId);
      
      if (profileError) {
        console.error("Error updating user profile:", profileError);
      }

      toast({
        title: "Welcome to Entity Hub!",
        description: `You've joined as ${invitation.role === "admin" ? "an Admin" : "a Viewer"}.`,
      });
    } catch (err) {
      console.error("Error accepting invitation:", err);
    }
  };

  // Handle user authentication after invite acceptance
  useEffect(() => {
    if (user && invitation && user.email) {
      acceptInvitation(user.id, user.email);
    }
  }, [user, invitation]);

  // Complete login after 2FA verification
  const completeLoginAfter2FA = async () => {
    if (!pending2FAUser) return;
    
    // Re-sign in after 2FA verification
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      clear2FAState();
    }
  };

  // Auto-complete login when 2FA is verified
  useEffect(() => {
    if (pending2FAUser && !needs2FA && !user) {
      completeLoginAfter2FA();
    }
  }, [needs2FA, pending2FAUser, user]);

  // Loading state - must come AFTER all hooks
  // Don't show loading if we're in 2FA mode (user just logged out for 2FA)
  if ((authLoading || inviteLoading) && !needs2FA) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users (but not during 2FA flow or while processing login)
  if (user && !needs2FA && !loading) {
    return <Navigate to="/" replace />;
  }

  // Check if device is trusted
  const checkTrustedDevice = async (userId: string): Promise<boolean> => {
    try {
      const deviceToken = getDeviceToken();
      const { data, error } = await supabase.functions.invoke("check-trusted-device", {
        body: { userId, deviceToken },
      });
      
      if (error) {
        console.error("Error checking trusted device:", error);
        return false;
      }
      
      return data?.trusted === true;
    } catch (err) {
      console.error("Error checking trusted device:", err);
      return false;
    }
  };

  // Register device as trusted
  const registerTrustedDevice = async (accessToken: string): Promise<void> => {
    try {
      const deviceToken = getDeviceToken();
      const deviceName = getDeviceName();
      
      const { error } = await supabase.functions.invoke("register-trusted-device", {
        body: { deviceToken, deviceName },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (error) {
        console.error("Error registering trusted device:", error);
      }
    } catch (err) {
      console.error("Error registering trusted device:", err);
    }
  };

  // Send 2FA code
  const send2FACode = async (accessToken: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-2fa-code", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification code sent",
        description: "Check your email for the 6-digit code.",
      });
    } catch (err: unknown) {
      console.error("Error sending 2FA code:", err);
      toast({
        variant: "destructive",
        title: "Failed to send verification code",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };
  
  // Verify 2FA code
  const verify2FACode = async () => {
    if (!pending2FAUser || otpCode.length !== 6) return;
    
    setVerifying2FA(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa-code", {
        body: { userId: pending2FAUser.id, code: otpCode, email: pending2FAUser.email },
      });
      
      if (error || !data?.valid) {
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: "The verification code is incorrect or expired.",
        });
        setOtpCode("");
        return;
      }
      
      // 2FA verified - complete the login by re-authenticating
      // Use stored password from sessionStorage (form state may be lost after signOut)
      const storedPassword = pending2FAPassword || password;
      if (!storedPassword) {
        toast({
          variant: "destructive",
          title: "Session expired",
          description: "Please try logging in again.",
        });
        clear2FAState();
        return;
      }
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: pending2FAUser.email,
        password: storedPassword,
      });
      
      if (loginError) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: loginError.message,
        });
        clear2FAState();
        return;
      }
      
      // Register trusted device if checkbox was checked
      if (rememberDevice && loginData.session?.access_token) {
        await registerTrustedDevice(loginData.session.access_token);
        toast({
          title: "Device remembered",
          description: "You won't need 2FA on this device for 30 days.",
        });
      }
      
      // Clear 2FA state - the auth listener will handle redirect
      clear2FAState();
      setRememberDevice(false);
      toast({
        title: "Verified!",
        description: "You're now logged in.",
      });
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Failed to send reset email",
            description: error.message,
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setIsForgotPassword(false);
        }
      } else if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message,
          });
        } else if (data.user && data.session) {
          // Check if this device is trusted
          const isTrusted = await checkTrustedDevice(data.user.id);
          
          if (isTrusted) {
            // Device is trusted, skip 2FA - user stays logged in
            toast({
              title: "Welcome back!",
              description: "Logged in from a trusted device.",
            });
            // Force navigation to home page
            navigate("/", { replace: true });
            return;
          } else {
            // Set 2FA state BEFORE signing out to prevent race condition
            setPending2FAUser({ id: data.user.id, email: data.user.email || email });
            setPendingAccessToken(data.session.access_token);
            setPending2FAPassword(password); // Store password for re-auth after 2FA
            setNeeds2FA(true);
            // Send 2FA code before signing out
            await send2FACode(data.session.access_token);
            // Sign out to require 2FA verification
            await supabase.auth.signOut();
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: error.message,
          });
        } else if (!invitation) {
          toast({
            title: "Account created!",
            description: "You can now sign in with your credentials.",
          });
          setIsLogin(true);
        }
        // If invitation exists, the useEffect will handle acceptance
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center text-foreground">
              <BraxLogo className="h-8 w-auto" />
            </div>
            <div>
              {needs2FA ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    Verify Your Identity
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Enter the 6-digit code sent to {pending2FAUser?.email}
                  </p>
                </>
              ) : invitation ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    You're Invited!
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Join Entity Hub as {invitation.role === "admin" ? "an Admin" : "a Viewer"}
                  </p>
                </>
              ) : inviteError ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    Invalid Invitation
                  </h1>
                  <p className="text-destructive mt-1">{inviteError}</p>
                </>
              ) : isForgotPassword ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Enter your email to receive a reset link
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Sign in to access your portal
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error state for invalid invitations */}
          {inviteError && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setInviteError(null);
                  navigate("/auth", { replace: true });
                }}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* 2FA Verification Form */}
          {needs2FA && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              {/* Remember this device checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-device"
                  checked={rememberDevice}
                  onCheckedChange={(checked) => setRememberDevice(checked === true)}
                />
                <label
                  htmlFor="remember-device"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember this device for 30 days
                </label>
              </div>
              
              <Button 
                className="w-full h-11" 
                onClick={verify2FACode}
                disabled={otpCode.length !== 6 || verifying2FA}
              >
                {verifying2FA ? "Verifying..." : "Verify Code"}
              </Button>
              
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    // Use stored password from sessionStorage (form state may be lost after signOut)
                    const storedPassword = pending2FAPassword || password;
                    if (!storedPassword || !pending2FAUser) {
                      toast({
                        variant: "destructive",
                        title: "Session expired",
                        description: "Please try logging in again.",
                      });
                      clear2FAState();
                      return;
                    }
                    // Re-authenticate to get fresh token for resending
                    const { data, error } = await supabase.auth.signInWithPassword({
                      email: pending2FAUser.email,
                      password: storedPassword,
                    });
                    if (error) {
                      toast({
                        variant: "destructive",
                        title: "Failed to resend code",
                        description: error.message,
                      });
                      return;
                    }
                    if (data.session?.access_token) {
                      await send2FACode(data.session.access_token);
                      await supabase.auth.signOut();
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Resend code
                </button>
                <br />
                <button
                  type="button"
                  onClick={() => {
                    setNeeds2FA(false);
                    setPending2FAUser(null);
                    setPendingAccessToken(null);
                    setOtpCode("");
                    setRememberDevice(false);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          )}

          {/* Standard Login/Signup Form - show if no invite error and not in 2FA mode */}
          {!inviteError && !needs2FA && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!!invitation}
                  className="h-11"
                />
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && !invitation && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading 
                  ? "Please wait..." 
                  : isForgotPassword
                    ? "Send Reset Link"
                    : invitation 
                      ? (isLogin ? "Sign In & Accept" : "Create Account & Accept")
                      : "Sign In"
                }
              </Button>
            </form>
          )}

          {/* Back to login from forgot password */}
          {!inviteError && !needs2FA && isForgotPassword && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* Toggle - only show for invitations */}
          {!inviteError && !needs2FA && invitation && !isForgotPassword && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to Entity Hub's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
