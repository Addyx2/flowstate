export const SESSION_COOKIE = "flowstate_session";
export const APP_NAME = "Flowstate";

/** Demo sign-in details on the login page: on in development, opt-in on a demo deploy. */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 15;
