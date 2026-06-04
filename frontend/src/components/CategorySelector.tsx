"use client";

export interface AuditCategory {
    id: string;
    name: string;
    description: string;
    cost: number;
    selected: boolean;
}

export const defaultCategories: AuditCategory[] = [
    { id: "reentrancy", name: "Reentrancy", description: "Checks for external calls that can re-enter before state is updated.", cost: 0.5, selected: true },
    { id: "access", name: "Access Control", description: "Verifies ownership and role-based access restrictions.", cost: 0.5, selected: true },
    { id: "overflow", name: "Integer Overflow", description: "Detects unsafe math operations and unchecked blocks.", cost: 0.5, selected: true },
    { id: "gas", name: "Gas Optimization", description: "Suggests calldata over memory and tight variable packing.", cost: 0.2, selected: true },
    { id: "logic", name: "Business Logic (AI)", description: "Deep LLM analysis of contract intent and logical flaws.", cost: 1.0, selected: false }
];

interface CategorySelectorProps {
    categories: AuditCategory[];
    onChange: (categories: AuditCategory[]) => void;
}

export function CategorySelector({ categories, onChange }: CategorySelectorProps) {
    const baseFee = 1.0; // Base AST Parsing fee required by backend

    const toggleCategory = (id: string) => {
        onChange(categories.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
    };

    const totalCost = baseFee + categories.filter(c => c.selected).reduce((sum, c) => sum + c.cost, 0);

    return (
        <div className="flex flex-col gap-stack-md bg-surface border border-outline-variant rounded-xl p-stack-md">
            <div className="flex justify-between items-center border-b border-outline-variant pb-stack-md">
                <div>
                    <h3 className="text-headline-sm font-bold text-on-surface">Analysis Modules</h3>
                    <p className="text-body-md text-on-surface-variant">Select the vulnerability categories to scan.</p>
                </div>
                <div className="text-right">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Cost</p>
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-headline-sm font-bold text-primary">{totalCost.toFixed(1)}</span>
                        <span className="text-label-md text-primary font-bold">HBAR</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-sm pt-2">
                <div 
                    className="flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-default border-primary/50 bg-primary/5"
                >
                    <div className="mt-0.5 w-4 h-4 rounded-sm border border-primary bg-primary flex items-center justify-center text-background">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-label-md font-bold text-on-surface">AST Parser (Base)</span>
                            <span className="text-label-sm text-primary font-bold">{baseFee.toFixed(1)} HBAR</span>
                        </div>
                        <p className="text-label-sm text-on-surface-variant mt-1 leading-relaxed">
                            Required core engine execution and syntax validation.
                        </p>
                    </div>
                </div>

                {categories.map(cat => (
                    <div 
                        key={cat.id} 
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-start gap-3 p-3 border rounded-lg transition-colors cursor-pointer select-none
                            ${cat.selected 
                                ? 'border-outline-variant bg-surface-container-low hover:bg-surface-container' 
                                : 'border-outline-variant/30 opacity-60 hover:opacity-100 hover:border-outline-variant hover:bg-surface-container-lowest'
                            }
                        `}
                    >
                        <div className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center
                            ${cat.selected ? 'bg-primary border-primary text-background' : 'border-outline-variant'}
                        `}>
                            {cat.selected && <span className="material-symbols-outlined text-[14px]">check</span>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className={`text-label-md font-bold ${cat.selected ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                    {cat.name}
                                </span>
                                <span className="text-label-sm text-primary font-bold">+{cat.cost.toFixed(1)} HBAR</span>
                            </div>
                            <p className="text-label-sm text-on-surface-variant mt-1 leading-relaxed">
                                {cat.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
