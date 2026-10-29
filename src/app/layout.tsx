import "@/app/globals.css";
 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      translate="no"
      className="overflow-hidden"
    >
      <head />

      <body
        className="bg-white text-[#2b2b2b]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}