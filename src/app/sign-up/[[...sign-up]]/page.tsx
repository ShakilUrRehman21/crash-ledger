import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Create your account</h1>
                    <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>Start tracking incidents in under 2 minutes</p>
                </div>
                <SignUp />
            </div>
        </div>
    );
}
