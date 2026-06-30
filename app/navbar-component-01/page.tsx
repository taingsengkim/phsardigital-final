import Navbar from "@/components/shadcn-studio/blocks/navbar-component-01/navbar-component-01";

const navigationData = [
  {
    title: "Home",
    href: "#",
  },
  {
    title: "Products",
    href: "#",
  },
  {
    title: "About Us",
    href: "#",
  },
  {
    title: "Contact Us",
    href: "#",
  },
];

const NavbarPage = () => {
  return (
    <div className="pb-10">
      <Navbar navigationData={navigationData} />
    </div>
  );
};

export default NavbarPage;
