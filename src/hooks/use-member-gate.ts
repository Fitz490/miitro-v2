import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./use-auth";
import type { UserProfile } from "@workspace/api-client-react";

// ── Access-tier predicates ────────────────────────────────────────────────────
// Single source of truth for all driver access rules.
// Import these wherever you need to reason about a driver's access level.

/** DB value "rejected" — shown to the user as "Suspended / Account unavailable" */
export function isSuspended(user: UserProfile): boolean {
  return user.applicationStatus === "rejected";
}

export function isPending(user: UserProfile): boolean {
  return user.applicationStatus === "pending";
}

/** Approved by admin but hasn't completed payment yet */
export function isApprovedUnpaid(user: UserProfile): boolean {
  return user.applicationStatus === "approved" && user.paymentStatus !== "paid";
}

/** The only tier with full member access */
export function isFullyActive(user: UserProfile): boolean {
  return user.applicationStatus === "approved" && user.paymentStatus === "paid";
}

/**
 * Platform access: membership or bundle buyers.
 * Training-only buyers are paid and approved but do NOT have platform access
 * (trip log, goals, live events, membership benefits, dashboard).
 */
export function hasPlatformAccess(user: UserProfile): boolean {
  return (
    user.applicationStatus === "approved" &&
    user.paymentStatus === "paid" &&
    (user.productPurchased === "membership" || user.productPurchased === "bundle")
  );
}

/**
 * Training access: training or bundle buyers.
 * Membership-only buyers are paid and approved but do NOT have training access.
 */
export function hasTrainingAccess(user: UserProfile): boolean {
  return (
    user.paymentStatus === "paid" &&
    (user.productPurchased === "training" || user.productPurchased === "bundle")
  );
}

/**
 * Bundle access: bundle buyers only.
 * The Affiliate Program and any other bundle-exclusive features require this tier.
 */
export function hasBundleAccess(user: UserProfile): boolean {
  return (
    user.applicationStatus === "approved" &&
    user.paymentStatus === "paid" &&
    user.productPurchased === "bundle"
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface MemberGateOptions {
  /**
   * When true (default) the user must be approved AND paid.
   * Pending and suspended users are always blocked regardless of this flag.
   */
  requirePaid?: boolean;
  /**
   * When true, requires productPurchased === "membership" | "bundle".
   * Training-only buyers are redirected to /training.
   */
  requirePlatform?: boolean;
  /**
   * When true, requires productPurchased === "training" | "bundle".
   * Membership-only buyers are redirected to /dashboard.
   */
  requireTraining?: boolean;
  /**
   * When true, requires productPurchased === "bundle".
   * Training-only and membership-only buyers are redirected to /dashboard.
   */
  requireBundle?: boolean;
}

/**
 * Central access gate for all member-only routes.
 *
 * Redirect rules (in priority order):
 *   not authenticated                    → /login
 *   admin user                           → /admin
 *   suspended (DB "rejected")            → /dashboard  (renders SuspendedScreen)
 *   pending                              → /dashboard  (renders PendingScreen)
 *   approved + unpaid                    → /dashboard  (renders ActivateBanner)  [when requirePaid=true]
 *   training-only + requirePlatform=true → /training
 *   membership-only + requireTraining=true → /dashboard
 *
 * Returns { blocked: boolean }.
 * The calling component should render a loading spinner when blocked=true.
 *
 * Usage:
 *   const { blocked } = useMemberGate();                        // requires approved+paid
 *   const { blocked } = useMemberGate({ requirePlatform: true }); // platform pages
 *   const { blocked } = useMemberGate({ requireTraining: true }); // training pages
 *   const { blocked } = useMemberGate({ requireBundle: true });   // bundle-only pages (affiliate, etc.)
 */
export function useMemberGate({
  requirePaid = true,
  requirePlatform = false,
  requireTraining = false,
  requireBundle = false,
}: MemberGateOptions = {}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { setLocation("/login"); return; }
    if (user.role === "admin") { setLocation("/admin"); return; }

    // Suspended or pending: /dashboard shows the appropriate status screen
    if (isSuspended(user) || isPending(user)) {
      setLocation("/dashboard");
      return;
    }

    // Requires paid access: approved but not yet paid → enrollment screen on /dashboard
    if (requirePaid && isApprovedUnpaid(user)) {
      setLocation("/dashboard");
      return;
    }

    // Platform-only page: training-only buyers cannot access platform features
    if (requirePlatform && !hasPlatformAccess(user)) {
      setLocation("/training");
      return;
    }

    // Training-only page: membership-only buyers cannot access training features
    if (requireTraining && !hasTrainingAccess(user)) {
      setLocation("/dashboard");
      return;
    }

    // Bundle-only page: training-only and membership-only buyers are not eligible
    if (requireBundle && !hasBundleAccess(user)) {
      setLocation("/dashboard");
      return;
    }
  }, [isLoading, user, requirePaid, requirePlatform, requireTraining, requireBundle]);

  const blocked =
    isLoading ||
    !user ||
    (!!user && user.role === "admin") ||
    (!!user && (isSuspended(user) || isPending(user))) ||
    (!!user && requirePaid && isApprovedUnpaid(user)) ||
    (!!user && requirePlatform && !hasPlatformAccess(user)) ||
    (!!user && requireTraining && !hasTrainingAccess(user)) ||
    (!!user && requireBundle && !hasBundleAccess(user));

  return { blocked };
}
