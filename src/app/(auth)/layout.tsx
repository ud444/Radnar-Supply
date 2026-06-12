import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 grid place-items-center py-16">{children}</main>
      <Footer />
    </>
  );
}
