export type UserRole = "visitor" | "admin";

export interface UserRecord {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthUser {
  username: string;
  role: UserRole;
}

const USERS_KEY = "student-gallery-users";
const AUTH_KEY = "student-gallery-auth";

function getStoredUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as UserRecord[]) : [];
}

function saveStoredUsers(users: UserRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function registerUser(username: string, password: string, role: UserRole): { success: boolean; error?: string; user?: AuthUser } {
  if (typeof window === "undefined") {
    return { success: false, error: "Cannot register on the server." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername || !password) {
    return { success: false, error: "Username and password are required." };
  }

  const users = getStoredUsers();
  if (users.some((user) => user.username.toLowerCase() === normalizedUsername)) {
    return { success: false, error: "This username already exists." };
  }

  const newUser: UserRecord = {
    username: normalizedUsername,
    password,
    role,
  };

  users.push(newUser);
  saveStoredUsers(users);

  const authUser: AuthUser = { username: normalizedUsername, role };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}

export function loginUser(username: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
  if (typeof window === "undefined") {
    return { success: false, error: "Cannot sign in on the server." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername || !password) {
    return { success: false, error: "Username and password are required." };
  }

  const users = getStoredUsers();
  const user = users.find(
    (stored) => stored.username.toLowerCase() === normalizedUsername && stored.password === password
  );

  if (!user) {
    return { success: false, error: "Invalid username or password." };
  }

  const authUser: AuthUser = { username: user.username, role: user.role };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
  return { success: true, user: authUser };
}
