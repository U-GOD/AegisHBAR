export function Sidebar() {
    return (
        <nav className="bg-surface-container-low h-full w-64 border-r border-outline-variant fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col">
            <div className="p-margin-desktop border-b border-outline-variant">
                <div className="flex items-center gap-stack-sm mb-stack-md">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        security
                    </span>
                    <div>
                        <h1 className="text-headline-sm text-primary">AegisHBAR</h1>
                        <p className="text-label-sm text-on-surface-variant uppercase mt-1">Enterprise Auditor</p>
                    </div>
                </div>
                <button className="w-full bg-primary text-on-primary py-2 px-4 rounded text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Audit
                </button>
            </div>
            <div className="flex-1 py-stack-md flex flex-col gap-unit">
                <a className="px-margin-desktop py-3 flex items-center gap-stack-sm bg-surface-container-highest text-primary transition-transform duration-150 text-label-md" href="#">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        dashboard
                    </span>
                    Dashboard
                </a>
                <a className="px-margin-desktop py-3 flex items-center gap-stack-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-transform duration-150 text-label-md" href="#">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    Audit History
                </a>
                <a className="px-margin-desktop py-3 flex items-center gap-stack-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-transform duration-150 text-label-md" href="#">
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                    Network Stats
                </a>
                <a className="px-margin-desktop py-3 flex items-center gap-stack-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-transform duration-150 text-label-md" href="#">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Settings
                </a>
            </div>
            <div className="p-margin-desktop border-t border-outline-variant mt-auto">
                <div className="flex items-center gap-stack-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center border border-outline-variant">
                        <span className="material-symbols-outlined text-on-surface text-[16px]">person</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-label-md text-on-surface">User Profile</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
