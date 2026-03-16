import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import ScrollToTop from '../components/layout/ScrollToTop';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </div>
    );
}

