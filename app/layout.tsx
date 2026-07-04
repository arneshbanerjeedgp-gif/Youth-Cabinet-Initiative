import type {Metadata} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css'; // Global styles

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Youth Cabinet | Student Leadership Initiative',
  description: 'A modern, premium student-led initiative to promote leadership, innovation, and service.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-[#F8FAFC] bg-[#070A13]">
        {children}
      </body>
    </html>
  );
}
