export default function DashboardPage() {
    return (
        <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-gutter">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md border-b border-outline-variant pb-stack-md">
                <div>
                    <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">
                        Vault.sol Findings
                    </h2>
                    <p className="text-on-surface-variant text-body-md mt-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        Scanned 2 hours ago • HCS Topic: 0.0.9109970
                    </p>
                </div>
                <button className="bg-surface border border-outline text-on-surface py-2 px-4 rounded text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Report
                </button>
            </div>

            {/* Top Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-md">
                {/* Risk Score */}
                <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between h-32 relative overflow-hidden group hover:border-outline transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Overall Risk Score
                    </span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-headline-lg text-error">78</span>
                        <span className="text-label-md text-error">/ 100</span>
                    </div>
                </div>

                {/* Critical */}
                <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between h-32 hover:border-outline transition-colors">
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-error"></span> Critical
                    </span>
                    <span className="text-headline-lg text-error">2</span>
                </div>

                {/* High */}
                <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between h-32 hover:border-outline transition-colors">
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span> High
                    </span>
                    <span className="text-headline-lg text-tertiary">5</span>
                </div>

                {/* Medium/Low */}
                <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between h-32 hover:border-outline transition-colors">
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span> Med / Low
                    </span>
                    <span className="text-headline-lg text-secondary">14</span>
                </div>
            </div>

            {/* Findings List */}
            <div className="bg-surface border border-outline-variant flex flex-col">
                <div className="grid grid-cols-12 gap-4 p-stack-md border-b border-outline-variant bg-surface-container-low text-label-sm text-on-surface-variant uppercase">
                    <div className="col-span-2">Severity</div>
                    <div className="col-span-6">Vulnerability Title</div>
                    <div className="col-span-2">Line No.</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Expanded Item (Mock) */}
                <div className="border-b border-outline-variant bg-surface-container-lowest">
                    <div className="grid grid-cols-12 gap-4 p-stack-md items-center">
                        <div className="col-span-2">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-error/15 border border-error/30 text-error text-label-sm uppercase">
                                Critical
                            </span>
                        </div>
                        <div className="col-span-6 text-on-surface text-label-md">
                            Reentrancy in withdrawBalance()
                        </div>
                        <div className="col-span-2 text-on-surface-variant text-label-md">
                            L: 142
                        </div>
                        <div className="col-span-2 text-right">
                            <button className="text-primary hover:text-primary-fixed transition-colors text-label-sm uppercase tracking-wider flex items-center justify-end w-full gap-1">
                                Hide Fix <span className="material-symbols-outlined text-[16px]">expand_less</span>
                            </button>
                        </div>
                    </div>

                    {/* Code Diff Expansion */}
                    <div className="px-stack-md pb-stack-md">
                        <div className="bg-background border border-outline-variant rounded overflow-hidden text-label-md">
                            <div className="flex text-on-surface-variant border-b border-outline-variant bg-surface-container-low px-4 py-2 text-label-sm uppercase">
                                <span className="material-symbols-outlined text-[14px] mr-2">code</span> Vault.sol
                            </div>
                            <div className="flex flex-col">
                                {/* Context */}
                                <div className="flex hover:bg-surface-container-lowest transition-colors group">
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 text-on-surface-variant/50 select-none bg-surface-container-low">141</div>
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 text-on-surface-variant/50 select-none bg-surface-container-low group-hover:bg-surface-container-lowest">141</div>
                                    <div className="pl-4 py-1 text-on-surface-variant"><span className="text-primary">function</span> <span className="text-inverse-primary">withdrawBalance</span>() <span className="text-primary">public</span> {"{"}</div>
                                </div>
                                {/* Removed Line */}
                                <div className="flex bg-error/10 hover:bg-error/20 transition-colors">
                                    <div className="w-12 border-r border-outline-variant border-error/20 text-right pr-2 py-1 text-error/70 select-none bg-error/5">142</div>
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                    <div className="pl-4 py-1 text-error line-through decoration-error/50"><span className="text-error/70">-</span> (bool success, ) = msg.sender.call{"{value: balances[msg.sender]}"}("");</div>
                                </div>
                                {/* Added Lines */}
                                <div className="flex bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                    <div className="w-12 border-r border-outline-variant border-primary/20 text-right pr-2 py-1 text-primary/70 select-none bg-primary/5">142</div>
                                    <div className="pl-4 py-1 text-primary"><span className="text-primary/70">+</span> uint256 amount = balances[msg.sender];</div>
                                </div>
                                <div className="flex bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                    <div className="w-12 border-r border-outline-variant border-primary/20 text-right pr-2 py-1 text-primary/70 select-none bg-primary/5">143</div>
                                    <div className="pl-4 py-1 text-primary"><span className="text-primary/70">+</span> balances[msg.sender] = 0;</div>
                                </div>
                                <div className="flex bg-primary/10 hover:bg-primary/20 transition-colors">
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 select-none"></div>
                                    <div className="w-12 border-r border-outline-variant border-primary/20 text-right pr-2 py-1 text-primary/70 select-none bg-primary/5">144</div>
                                    <div className="pl-4 py-1 text-primary"><span className="text-primary/70">+</span> (bool success, ) = msg.sender.call{"{value: amount}"}("");</div>
                                </div>
                                {/* Context */}
                                <div className="flex hover:bg-surface-container-lowest transition-colors group">
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 text-on-surface-variant/50 select-none bg-surface-container-low">143</div>
                                    <div className="w-12 border-r border-outline-variant text-right pr-2 py-1 text-on-surface-variant/50 select-none bg-surface-container-low group-hover:bg-surface-container-lowest">145</div>
                                    <div className="pl-4 py-1 text-on-surface-variant"><span className="text-secondary">require</span>(success, <span className="text-tertiary">"Transfer failed"</span>);</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Normal Item */}
                <div className="grid grid-cols-12 gap-4 p-stack-md items-center border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                    <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-tertiary/15 border border-tertiary/30 text-tertiary text-label-sm uppercase">
                            High
                        </span>
                    </div>
                    <div className="col-span-6 text-on-surface text-label-md">
                        Unchecked Call Return Value
                    </div>
                    <div className="col-span-2 text-on-surface-variant text-label-md">
                        L: 89
                    </div>
                    <div className="col-span-2 text-right">
                        <button className="text-on-surface-variant group-hover:text-primary transition-colors text-label-sm uppercase tracking-wider flex items-center justify-end w-full gap-1">
                            View Fix <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Normal Item */}
                <div className="grid grid-cols-12 gap-4 p-stack-md items-center hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                    <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-primary/15 border border-primary/30 text-primary text-label-sm uppercase">
                            Low
                        </span>
                    </div>
                    <div className="col-span-6 text-on-surface text-label-md">
                        Gas Optimization: Use calldata
                    </div>
                    <div className="col-span-2 text-on-surface-variant text-label-md">
                        L: 45
                    </div>
                    <div className="col-span-2 text-right">
                        <button className="text-on-surface-variant group-hover:text-primary transition-colors text-label-sm uppercase tracking-wider flex items-center justify-end w-full gap-1">
                            View Fix <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
