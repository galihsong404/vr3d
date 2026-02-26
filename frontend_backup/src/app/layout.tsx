import './globals.css';
import { ReactNode } from 'react';
import Web3ModalProvider from './Web3ModalProvider';

export const metadata = {
    title: 'Cash Cow Valley',
    description: 'Moo-ve into the future of Web3 Farming',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Web3ModalProvider>
                    {children}
                </Web3ModalProvider>
            </body>
        </html>
    );
}
