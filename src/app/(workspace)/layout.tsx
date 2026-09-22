import MainLayout from "@/components/layout/MainLayout";
import ProtectedWorkspace from "@/components/auth/ProtectedWorkspace";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ProtectedWorkspace><MainLayout>{children}</MainLayout></ProtectedWorkspace>;
}
