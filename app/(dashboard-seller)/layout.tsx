import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SellerSidebar } from "@/components/ui/sidebar/nav-sidebar"
import { NavTopbar } from "@/components/ui/sidebar/nav-topbar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SellerSidebar />
        <SidebarInset>
          <NavTopbar />
          <main className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}