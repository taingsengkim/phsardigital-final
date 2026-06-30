import NavbarPage from "../navbar-component-01/page";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarPage />
      <main>{children}</main>
    </>
  );
}
