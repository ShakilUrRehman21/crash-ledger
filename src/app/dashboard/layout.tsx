import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--cl-background)" }}>
            <Sidebar workspaceName="My Workspace" />
            <main style={{ marginLeft: "240px", flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                {children}
            </main>
        </div>
    );
}
