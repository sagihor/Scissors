import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    /* THEME: page chrome */
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}