/**
 * Parses a fetch Response as JSON without throwing when the server sends HTML
 * (for example an error page or an expired-session redirect).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeJson(res: Response): Promise<any> {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        const message =
            res.status === 401 || res.status === 404 || res.redirected
                ? "Your session has expired. Please sign in again."
                : `Something went wrong on the server (status ${res.status}). Please try again.`;
        return { error: message };
    }
}
