const TOKEN_KEY = "nl2sql_token";

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return typeof window !== "undefined"
        ? localStorage.getItem(TOKEN_KEY)
        : null;
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
    return !!getToken();
}
