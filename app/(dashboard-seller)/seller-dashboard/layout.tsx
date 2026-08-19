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
      <SidebarProvider data-seller-dashboard className="bg-background text-foreground">
        <SellerSidebar />
        <SidebarInset className="bg-background text-foreground transition-colors">
          <NavTopbar />
            {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
