import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Freight Intent Broker | Logistics RFQ Platform',
    description: 'Connect Vietnam exporters with global freight forwarders. Get competitive quotes for your sea and air freight shipments.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
