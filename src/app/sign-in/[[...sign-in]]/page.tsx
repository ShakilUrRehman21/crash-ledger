import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Welcome back</h1>
                    <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>Sign in to your CrashLedger workspace</p>
                </div>
                <SignIn />
            </div>
        </div>
    );
}
