import { useState, useEffect } from "react";

const navLinks = [
    { text: "About", href: "#about" },
    { text: "Projects", href: "#projects" },
    { text: "Blog", href: "#blog" },
    { text: "Press", href: "#press" },
    { text: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-primary/90 backdrop-blur-md" : "bg-transparent"
                }`}
        >
            <nav className="wrapper flex items-center justify-between px-5 sm:px-10 py-4 border-l-0 border-r-0 md:border-l md:border-r">
                <a href="#" className="text-white font-medium text-lg">
                    blazperic<span className="text-grey">.com</span>
                </a>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm text-grey hover:text-white transition-colors"
                        >
                            {link.text}
                        </a>
                    ))}
                    <a href="#contact" className="button button--primary">
                        <span>Hire Me</span>
                    </a>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden text-grey hover:text-white p-2"
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {mobileOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                        )}
                    </svg>
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-primary border-t border-nickel">
                    <div className="wrapper border-l-0 border-r-0 flex flex-col px-5 py-4 gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="py-3 px-4 rounded-lg text-grey hover:text-white hover:bg-slate transition-colors"
                            >
                                {link.text}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setMobileOpen(false)}
                            className="button button--primary mt-3 text-center"
                        >
                            <span>Hire Me</span>
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
