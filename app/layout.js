import "./globals.css";

export const metadata = {
  title: "Conquer BPO Accelerator",
  description: "Run your entire BPO operation from one dashboard — AI proposals, job hunting, CRM, vendor marketplace, and profit tracking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#12151B", color: "#ECEEF2" }}>{children}</body>
    </html>
  );
}
