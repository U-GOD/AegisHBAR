export function Footer() {
    return (
        <footer className="bg-background w-full py-stack-md px-margin-desktop flex justify-between items-center max-w-container-max mx-auto border-t border-outline-variant mt-auto">
            <div className="text-label-md font-bold text-on-surface flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <span>Secured by Hedera Consensus Service | Topic ID: 0.0.9109970</span>
            </div>
            <div className="flex gap-gutter">
                <a className="text-on-secondary-container hover:text-primary opacity-80 hover:opacity-100 transition-opacity text-label-sm" href="#">
                    Terms
                </a>
                <a className="text-on-secondary-container hover:text-primary opacity-80 hover:opacity-100 transition-opacity text-label-sm" href="#">
                    Privacy
                </a>
                <a className="text-on-secondary-container hover:text-primary opacity-80 hover:opacity-100 transition-opacity text-label-sm" href="#">
                    Status
                </a>
            </div>
        </footer>
    );
}
