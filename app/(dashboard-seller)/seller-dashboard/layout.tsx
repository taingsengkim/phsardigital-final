import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SellerSidebar } from "@/components/ui/sidebar/nav-sidebar"
import { NavTopbar } from "@/components/ui/sidebar/nav-topbar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SellerDashboardGuard } from "@/components/auth/SellerDashboardGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SellerDashboardGuard>
      <TooltipProvider>
        <SidebarProvider open data-seller-dashboard className="bg-background text-foreground">
          <SellerSidebar />
          <SidebarInset className="bg-background text-foreground transition-colors">
            <NavTopbar />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </SellerDashboardGuard>
  )
}

