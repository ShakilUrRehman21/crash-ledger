import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#FAF8F5]">
            <Sidebar />
            <main className="ml-64 flex-1 min-w-0 min-h-screen flex flex-col">
                {children}
            </main>
        </div>
    );
}
