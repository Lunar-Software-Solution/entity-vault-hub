

## Diagnosis: Slow Login

Looking at the network timeline, there's an **83-second gap** between the successful `signInWithPassword` response (11:35:35) and the `check-trusted-device` edge function call (11:36:58). The edge functions themselves are fast (28-30ms boot), so the bottleneck is in the client-side flow between login and the 2FA check.

**Root cause**: The login flow in `Auth.tsx` (lines 502-537) is sequential and vulnerable to React re-render delays:
1. `signInWithPassword` → triggers `onAuthStateChange` → heavy re-render cycle
2. `await checkTrustedDevice()` → edge function call (delayed by re-renders)
3. `await send2FACode()` → another edge function call
4. `await signOut()` → another call

That's 4 sequential async operations, and the auth state change between steps 1 and 2 causes React to re-render the entire auth context tree, potentially blocking the event loop.

---

## Plan

### 1. Create a combined edge function: `login-2fa-check`
- Single edge function that: validates the JWT, checks if device is trusted, and if not, sends the 2FA code
- Returns `{ trusted: true }` or `{ trusted: false, codeSent: true }`
- Eliminates 2 round trips down to 1

### 2. Optimize `Auth.tsx` login flow
- After `signInWithPassword` succeeds, immediately call the combined edge function (1 call instead of 2)
- Store the access token and user info synchronously before any await
- Use the access token from the login response directly (no reliance on auth state)

### 3. Deploy the new edge function
- Add `login-2fa-check` to `supabase/config.toml`
- Deploy via the edge function deployment tool

**Expected result**: Login + 2FA flow completes in ~1-2 seconds instead of 83+ seconds.

