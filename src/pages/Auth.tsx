import { useState, useEffect } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import braxLogo from "@/assets/braxtech-logo.png";

interface Invitation {
  id: string;
  email: string;
  role: "admin" | "viewer";
  status: string;
  expires_at: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  
  // Check multiple sources for the invite token
  // 1. Query parameter: ?invite=xxx
  // 2. Hash fragment: #invite=xxx (fallback if Brevo strips query params)
  const getInviteToken = () => {
    const queryToken = searchParams.get("invite");
    if (queryToken) return queryToken;
    
    // Check hash fragment as fallback
    const hash = window.location.hash;
    if (hash.includes("invite=")) {
      const match = hash.match(/invite=([^&]+)/);
      return match ? match[1] : null;
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
  
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load invitation details if token is present
  useEffect(() => {
    // Debug: log the current URL and token
    console.log("Auth page loaded with URL:", window.location.href);
    console.log("Invite token from searchParams:", inviteToken);
    
    if (inviteToken) {
      loadInvitation(inviteToken);
    }
  }, [inviteToken]);

  const loadInvitation = async (token: string) => {
    setInviteLoading(true);
    setInviteError(null);
    
    console.log("Looking up invitation with token:", token);
    
    try {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("id, email, role, status, expires_at")
        .eq("token", token)
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

      setInvitation(data);
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
      await supabase
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      // Update user role to match invitation
      await supabase
        .from("user_roles")
        .update({ role: invitation.role })
        .eq("user_id", userId);

      // Update user profile with invited_at timestamp
      await supabase
        .from("user_profiles")
        .update({ invited_at: new Date().toISOString() })
        .eq("user_id", userId);

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

  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user && !invitation) {
    return <Navigate to="/" replace />;
  }

  if (user && invitation) {
    // User just accepted invitation, redirect after a moment
    return <Navigate to="/" replace />;
  }

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
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message,
          });
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
            <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
              <img src={braxLogo} alt="Entity Hub" className="w-12 h-12 object-contain" />
            </div>
            <div>
              {invitation ? (
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

          {/* Form - show if no invite error */}
          {!inviteError && (
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
          {!inviteError && isForgotPassword && (
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
          {!inviteError && invitation && !isForgotPassword && (
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
