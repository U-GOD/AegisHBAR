export function TopNav() {
    return (
        <header className="bg-background w-full top-0 border-b border-outline-variant">
            <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-container-max mx-auto">
                <div className="md:hidden text-headline-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        security
                    </span>
                    AegisHBAR
                </div>
                <div className="hidden md:flex gap-gutter h-full items-end pt-2">
                    <a className="text-primary border-b-2 border-primary pb-1 transition-colors duration-200 text-label-md mb-[-1px]" href="#">
                        Audits
                    </a>
                    <a className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200 text-label-md pb-1 mb-[-1px] px-2 rounded-t" href="#">
                        Reports
                    </a>
                    <a className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200 text-label-md pb-1 mb-[-1px] px-2 rounded-t" href="#">
                        Scan
                    </a>
                    <a className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200 text-label-md pb-1 mb-[-1px] px-2 rounded-t" href="#">
                        Documentation
                    </a>
                </div>
                <div className="flex items-center gap-stack-md">
                    <button className="hidden md:flex bg-transparent border border-outline text-on-surface py-1.5 px-4 rounded text-label-md hover:bg-surface-container transition-colors items-center gap-2">
                        Connect Wallet
                    </button>
                    <button className="md:hidden text-on-surface">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
