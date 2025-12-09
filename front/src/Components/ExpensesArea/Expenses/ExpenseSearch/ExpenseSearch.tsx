import { useState } from "react";
import "./ExpenseSearch.css";
import { useSelector } from "react-redux";
import { UserCategoriesState, BudgetsState } from "../../../../Redux/FinanceContext";
import Select from "react-select";

interface ExpenseSearchProps {
    onSearchChange: (searchTerm: string) => void;
    onCategoryFilter: (categoryId: number | null) => void;
    onBudgetFilter: (budgetId: number | null) => void;
    onAmountFilter: (min: string, max: string) => void;
    onTimeFilter: (months: number | null) => void;
    onClearFilters: () => void;
    resultCount: number;
    totalCount: number;
}

const ExpenseSearch: React.FC<ExpenseSearchProps> = ({
    onSearchChange,
    onCategoryFilter,
    onBudgetFilter,
    onAmountFilter,
    onTimeFilter,
    onClearFilters,
    resultCount,
    totalCount,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedTimeFilter, setSelectedTimeFilter] = useState<number | null>(null);

    const categories = useSelector((state: UserCategoriesState) => state.userCategories.categories);
    const budgets = useSelector((state: BudgetsState) => state.budgets.budgets);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onSearchChange(value);
    };

    const handleCategoryChange = (selected: any) => {
        setSelectedCategory(selected);
        onCategoryFilter(selected ? selected.value : null);
    };

    const handleBudgetChange = (selected: any) => {
        setSelectedBudget(selected);
        onBudgetFilter(selected ? selected.value : null);
    };

    const handleAmountChange = (min: string, max: string) => {
        setMinAmount(min);
        setMaxAmount(max);
        onAmountFilter(min, max);
    };

    const handleTimeFilterChange = (months: number | null) => {
        setSelectedTimeFilter(months);
        onTimeFilter(months);
    };

    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedCategory(null);
        setSelectedBudget(null);
        setMinAmount("");
        setMaxAmount("");
        setSelectedTimeFilter(null);
        onClearFilters();
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedBudget || minAmount || maxAmount || selectedTimeFilter !== null;

    const categoryOptions = [
        { value: 0, label: "הוספת קטגוריה" },
        ...categories
            .map((category) => ({
                value: category.id,
                label: category.category_name,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'he'))
    ];

    const budgetOptions = [
        ...budgets.map((budget) => ({
            value: budget.id,
            label: budget.name,
            remaining: Math.floor(Number(budget.remaining_amount)),
            total: Math.floor(Number(budget.amount)),
            isAddOption: false
        }))
    ];

    return (
        <div className="expense-search-container">
            {/* Collapse/Expand Toggle Button */}
            <button
                className="search-toggle-btn"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <i className="fas fa-search toggle-search-icon"></i>
                <span className="toggle-text">
                    {isExpanded ? "כווץ חיפוש" : "חפש הוצאות"}
                </span>
                <span className="toggle-icon">{isExpanded ? "▲" : "▼"}</span>
                {!isExpanded && resultCount < totalCount && (
                    <span className="filter-badge">{resultCount}/{totalCount}</span>
                )}
            </button>

            <div className={`search-content ${isExpanded ? 'expanded' : ''}`}>
                <div className="search-bar-row">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="חפש לפי תיאור, סכום או תאריך..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        {searchTerm && (
                            <i
                                className="fas fa-times clear-search-icon"
                                onClick={() => handleSearchChange("")}
                            ></i>
                        )}
                    </div>
                    <button
                        className="advanced-filter-btn"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <i className={`fas fa-filter ${showAdvanced ? 'active' : ''}`}></i>
                        {showAdvanced ? 'הסתר מסננים' : 'מסננים מתקדמים'}
                    </button>
                </div>

                {showAdvanced ? (
                    <div className="advanced-filters">
                        {/* Time Filter Buttons */}
                        <div className="time-filter-section">
                            <label>תקופת זמן</label>
                            <div className="time-filter-buttons">
                                <button
                                    className={`time-filter-btn ${selectedTimeFilter === 3 ? 'active' : ''}`}
                                    onClick={() => handleTimeFilterChange(3)}
                                >
                                    3 חודשים אחרונים
                                </button>
                                <button
                                    className={`time-filter-btn ${selectedTimeFilter === 6 ? 'active' : ''}`}
                                    onClick={() => handleTimeFilterChange(6)}
                                >
                                    6 חודשים אחרונים
                                </button>
                                <button
                                    className={`time-filter-btn ${selectedTimeFilter === 12 ? 'active' : ''}`}
                                    onClick={() => handleTimeFilterChange(12)}
                                >
                                    שנה אחרונה
                                </button>
                                <button
                                    className={`time-filter-btn ${selectedTimeFilter === 0 ? 'active' : ''}`}
                                    onClick={() => handleTimeFilterChange(0)}
                                >
                                    כל הזמנים
                                </button>
                            </div>
                        </div>                        <div className="filter-row">
                            <div className="filter-group">
                                <label>קטגוריה</label>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    options={categoryOptions}
                                    placeholder="קטגוריה..."
                                    isSearchable
                                    isClearable
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: "12px",
                                            borderColor: "#a8c5ff",
                                            boxShadow: "none",
                                            "&:hover": { borderColor: "#7ea0f7" },
                                            textAlign: "center",
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? "#e9f1ff" : "white",
                                            color: "#333",
                                        }),
                                    }}
                                />
                            </div>

                            <div className="filter-group">
                                <label>תקציב</label>
                                <Select
                                    value={selectedBudget}
                                    onChange={handleBudgetChange}
                                    options={budgetOptions}
                                    placeholder="תקציב..."
                                    isSearchable
                                    isClearable
                                    formatOptionLabel={(option: any) => (
                                        <div style={{ textAlign: 'center' }}>
                                            <div>{option.label}</div>
                                            {!option.isAddOption && option.remaining !== undefined && (
                                                <div style={{ fontSize: '14px', color: option.remaining < 0 ? '#dc3545' : '#007bff', marginTop: '2px' }}>
                                                    {option.total.toLocaleString()} / {option.remaining < 0 ? Math.abs(option.remaining).toLocaleString() + '-' : option.remaining.toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: "12px",
                                            borderColor: "#a8c5ff",
                                            boxShadow: "none",
                                            "&:hover": { borderColor: "#7ea0f7" },
                                            textAlign: "center",
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? "#e9f1ff" : "white",
                                            color: "#333",
                                        }),
                                    }}
                                />
                            </div>

                            <div className="filter-group amount-range">
                                <label>טווח סכום (₪)</label>
                                <div className="amount-inputs">
                                    <input
                                        type="number"
                                        placeholder="מינימום"
                                        value={minAmount}
                                        onChange={(e) => handleAmountChange(e.target.value, maxAmount)}
                                        className="amount-input"
                                    />
                                    <span className="range-separator">-</span>
                                    <input
                                        type="number"
                                        placeholder="מקסימום"
                                        value={maxAmount}
                                        onChange={(e) => handleAmountChange(minAmount, e.target.value)}
                                        className="amount-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
                {hasActiveFilters && (
                    <div className="search-results-bar">
                        <span className="results-count">

                            <>
                                מציג <strong>{resultCount}</strong> מתוך <strong>{totalCount}</strong> הוצאות
                            </>

                        </span>

                        <button className="clear-filters-btn" onClick={handleClearAll}>
                            <i className="fas fa-times-circle"></i>
                            נקה מסננים
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseSearch;
