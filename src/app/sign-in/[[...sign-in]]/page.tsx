import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/brand/Logo";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#FAF8F5] grid lg:grid-cols-2">
            <div className="hidden lg:flex relative overflow-hidden m-4 rounded-[32px] bg-gradient-to-br from-[#FA5A2A] via-[#FF6A3D] to-[#FF8256] text-white p-12 flex-col justify-between">
                <div className="absolute top-20 right-16 w-32 h-32 rounded-full bg-white/15" />
                <div className="absolute bottom-24 left-10 w-48 h-48 rounded-full bg-[#121826]/10" />
                <div className="relative"><Logo variant="light" size={44} /></div>
                <div className="relative">
                    <h2 className="text-5xl font-extrabold font-heading leading-tight">Stop repeating<br />the same failures.</h2>
                    <p className="mt-4 text-white/90 max-w-sm">Track incidents, enforce root cause analysis, and measure operational risk.</p>
                </div>
            </div>
            <div className="flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-[#111827] font-heading">Welcome back</h1>
                    <p className="text-sm text-neutral-500 mt-1 mb-6">Sign in to your CrashLedger workspace</p>
                    <SignIn appearance={{ variables: { colorPrimary: "#FA5A2A", borderRadius: "0.75rem" } }} />
                </div>
            </div>
        </div>
    );
}
