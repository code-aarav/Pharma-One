// --- Data ---
const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'inventory', name: 'Inventory', icon: 'pill' },
    { id: 'catalogue', name: 'Product Catalogue', icon: 'book-open' },
    { id: 'sales', name: 'Sales', icon: 'shopping-cart' },
    { id: 'transactions', name: 'Transactions', icon: 'receipt' },
    { id: 'staff', name: 'Team Management', icon: 'briefcase' },
    { id: 'profile', name: 'Profile', icon: 'user' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
    { id: 'customers', name: 'Customers', icon: 'users' },
    { id: 'expenses', name: 'Expenses', icon: 'wallet' },
];

// --- Default Data (Used if LocalStorage is empty) ---
const defaultInventory = [
];

const defaultStaff = [
    { id: 1, name: 'Admin', role: 'Manager', username: 'admin', password: 'password' },
];

// --- Global State ---
let inventoryData = [];
let staffData = [];
let salesData = []; // Stores completed bills
let attendanceData = [];
let leaveData = [];
let shiftData = [];
let payrollData = [];
let defectiveData = [];
let supplierCredits = [];
let customersData = []; // To track customer profiles
let expensesData = []; // To track shop expenses
let currentInventoryTab = 'stock'; // stock, defects, credits
let currentStaffTab = 'overview'; // overview, attendance, leaves, shifts, payroll
let cart = []; // Current POS cart
let pharmacySettings = {
    license: '',
    pharmacyName: 'PharmaOne',
    address: ''
};
let salesChartInstance = null; // Chart instance
let currentUser = null; // Stores currently logged in user
let uploadedPrescription = null; // Stores Base64 of uploaded prescription

// --- Multi-Language Support ---
let currentLanguage = localStorage.getItem('pharma_lang') || 'en';
const translations = {
    en: {
        dashboard: 'Dashboard', inventory: 'Inventory', catalog: 'Product Catalogue', sales: 'Sales',
        transactions: 'Transactions', team: 'Team Management', profile: 'Profile', settings: 'Settings',
        customers: 'Customers', expenses: 'Expenses', logout: 'Logout',
        total_sales: 'Total Sales', total_orders: 'Total Orders', total_customers: 'Total Customers',
        out_of_stock: 'Out of Stock', welcome: 'Welcome Back', search: 'Search...',
        add_medicine: 'Add Medicine', export: 'Export'
    },
    ar: {
        dashboard: 'لوحة القيادة', inventory: 'المخزون', catalog: 'كتالوج المنتجات', sales: 'المبيعات',
        transactions: 'المعاملات', team: 'إدارة الفريق', profile: 'الملف الشخصي', settings: 'الإعدادات',
        customers: 'العملاء', expenses: 'المصاريف', logout: 'تسجيل الخروج',
        total_sales: 'إجمالي المبيعات', total_orders: 'إجمالي الطلبات', total_customers: 'إجمالي العملاء',
        out_of_stock: 'نفذ من المخزون', welcome: 'مرحباً بعودتك', search: 'بحث...',
        add_medicine: 'إضافة دواء', export: 'تصدير'
    },
    es: {
        dashboard: 'Panel', inventory: 'Inventario', catalog: 'Catálogo', sales: 'Ventas',
        transactions: 'Transacciones', team: 'Equipo', profile: 'Perfil', settings: 'Ajustes',
        customers: 'Clientes', expenses: 'Gastos', logout: 'Cerrar sesión',
        total_sales: 'Ventas Totales', total_orders: 'Pedidos Totales', total_customers: 'Clientes Totales',
        out_of_stock: 'Sin Stock', welcome: 'Bienvenido', search: 'Buscar...',
        add_medicine: 'Agregar Medicina', export: 'Exportar'
    },
    fr: {
        dashboard: 'Tableau', inventory: 'Inventaire', catalog: 'Catalogue', sales: 'Ventes',
        transactions: 'Transactions', team: 'Équipe', profile: 'Profil', settings: 'Paramètres',
        customers: 'Clients', expenses: 'Dépenses', logout: 'Déconnexion',
        total_sales: 'Ventes Totales', total_orders: 'Total Commandes', total_customers: 'Total Clients',
        out_of_stock: 'Rupture de Stock', welcome: 'Bienvenue', search: 'Chercher...',
        add_medicine: 'Ajouter Médicament', export: 'Exporter'
    },
    hi: {
        dashboard: 'डैशबोर्ड', inventory: 'इन्वेंटरी', catalog: 'कैटलॉग', sales: 'बिक्री',
        transactions: 'लेनदेन', team: 'टीम प्रबंधन', profile: 'प्रोफ़ाइल', settings: 'सेटिंग्स',
        customers: 'ग्राहक', expenses: 'खर्चे', logout: 'लॉगआउट',
        total_sales: 'कुल बिक्री', total_orders: 'कुल ऑर्डर', total_customers: 'कुल ग्राहक',
        out_of_stock: 'स्टॉक खत्म', welcome: 'स्वागत है', search: 'खोजें...',
        add_medicine: 'दवा जोड़ें', export: 'निर्यात'
    },
    zh: {
        dashboard: '仪表板', inventory: '库存', catalog: '产品目录', sales: '销售',
        transactions: '交易', team: '团队管理', profile: '个人资料', settings: '设置',
        customers: '客户', expenses: '支出', logout: '退出',
        total_sales: '总销售额', total_orders: '总订单', total_customers: '总客户数',
        out_of_stock: '缺货', welcome: '欢迎回来', search: '搜索...',
        add_medicine: '添加药品', export: '导出'
    }
};

function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('pharma_lang', lang);
    applyTranslations();
}

function applyTranslations() {
    // Update Menu Items names based on translation keys
    menuItems[0].name = t('dashboard');
    menuItems[1].name = t('inventory');
    menuItems[2].name = t('catalog');
    menuItems[3].name = t('sales');
    menuItems[4].name = t('transactions');
    menuItems[5].name = t('team');
    menuItems[6].name = t('profile');
    menuItems[7].name = t('settings');
    menuItems[8].name = t('customers');
    menuItems[9].name = t('expenses');

    renderSidebar();
    renderStats();
    document.getElementById('language-selector').value = currentLanguage;

    // Set Page Direction for Arabic
    if (currentLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }

    // Refresh current view title
    const activeItem = menuItems.find(m => m.id === currentView);
    if (activeItem) {
        document.getElementById('page-title').textContent = activeItem.name;
    }
}

let currentView = 'dashboard';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    checkAuth();
    renderLoginHints();
    injectLoginThemeToggle();
    await loadData();
    injectInventoryUI(); // Inject Add Medicine button
    injectImageInputToForm(); // Inject Image Input field
    injectStaffView(); // Inject Staff View
    injectStaffModal(); // Inject Staff Modal
    injectTransactionsView(); // Inject Transactions View
    injectSalesView(); // Inject Sales View
    injectCustomersView(); // Inject Customers View
    injectExpensesView(); // Inject Expenses View
    injectInvoiceModal(); // Inject Invoice Modal

    injectLeaveModal(); // Inject Leave Modal
    renderSidebar();
    renderStats();
    renderDashboardTable();
    renderSalesChart();
    renderInventoryTable(); // renderStaffTable is now part of switchView
    renderSettingsForm();
    renderSalesInterface();
    applyTranslations();
    lucide.createIcons();
    setupEventListeners();


});

// --- Theme Logic ---
function initTheme() {
    const isDark = localStorage.getItem('pharma_theme') === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem('pharma_theme', isDark ? 'dark' : 'light');
}

// --- Backend API & Data Service ---
const API_CONFIG = {
    // If you run: npx json-server --watch db.json --port 3000
    baseUrl: 'http://localhost:3000',
    useBackend: false // Set this to true to use the local db.json file via json-server
};

const DataService = {
    async login(username, password) {
        if (API_CONFIG.useBackend) {
            try {
                const res = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (!res.ok) throw new Error('Login failed');
                return await res.json();
            } catch (error) {
                console.error("API Login Error:", error);
                return { success: false, message: "Server connection failed" };
            }
        } else if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('staff')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            if (data) return { success: true, user: data };
            return { success: false, message: "Cloud login failed" };
        } else {
            // Local Mock Logic
            // RESCUE BACKDOOR
            if (username === 'rescue' && password === '123') {
                return { success: true, user: { id: 999, name: 'Rescue Admin', role: 'Manager' } };
            }
            const user = staffData.find(u => u.username === username && u.password === password);
            if (user) return { success: true, user };
            return { success: false, message: "Invalid credentials" };
        }
    },

    async saveData(key, data) {
        if (API_CONFIG.useBackend) {
            try {
                await fetch(`${API_CONFIG.baseUrl}/${key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (error) {
                console.error(`API Save Error (${key}):`, error);
            }
        } else {
            localStorage.setItem(`pharma_${key}`, JSON.stringify(data));
        }
    },

    async loadData(key) {
        if (API_CONFIG.useBackend) {
            try {
                const res = await fetch(`${API_CONFIG.baseUrl}/${key}`);
                return await res.json();
            } catch (error) {
                console.error(`API Load Error (${key}):`, error);
                return null;
            }
        } else {
            const data = localStorage.getItem(`pharma_${key}`);
            try {
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error(`Error parsing local data for ${key}:`, error);
                return null;
            }
        }
    }
};

// --- Cloud Connectivity (Simple JSON Storage) ---
let cloudStorageUrl = null;
let cloudStorageKey = null;

const CloudService = {
    async connect(url, key) {
        try {
            // Normalize URL (ensure no trailing slash)
            url = url.replace(/\/$/, "");
            cloudStorageUrl = url;
            cloudStorageKey = key;

            // Test connection by fetching data
            const res = await fetch(url, {
                method: 'GET',
                headers: key ? { 'X-Master-Key': key, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error(`Connection failed: ${res.status} ${res.statusText}`);

            localStorage.setItem('pharma_cloud_url', url);
            localStorage.setItem('pharma_cloud_key', key || '');
            return { success: true };
        } catch (e) {
            console.error("Cloud Connection Error:", e);
            return { success: false, message: e.message };
        }
    },

    async syncLocalToCloud() {
        if (!cloudStorageUrl) return;

        const allData = {
            inventory: inventoryData,
            staff: staffData,
            sales: salesData,
            customers: customersData,
            expenses: expensesData,
            payroll: payrollData,
            attendance: attendanceData,
            leaves: leaveData,
            shifts: shiftData,
            settings: pharmacySettings,
            credits: supplierCredits,
            defectives: defectiveData
        };

        try {
            await fetch(cloudStorageUrl, {
                method: 'PUT', // Most JSON stores use PUT to overwrite bucket
                headers: {
                    'Content-Type': 'application/json',
                    ...(cloudStorageKey ? { 'X-Master-Key': cloudStorageKey } : {})
                },
                body: JSON.stringify(allData)
            });
            console.log("Local data synced to Cloud JSON.");
        } catch (e) {
            console.error("Cloud Sync Error:", e);
        }
    },

    async pullCloudToLocal() {
        if (!cloudStorageUrl) return;
        console.log("Fetching data from JSON Cloud...");

        try {
            const res = await fetch(cloudStorageUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(cloudStorageKey ? { 'X-Master-Key': cloudStorageKey } : {})
                }
            });

            if (!res.ok) throw new Error("Failed to fetch cloud data");

            let data = await res.json();

            // Handle different API wrappers (e.g. JSONBin wraps in 'record')
            if (data.record) data = data.record;

            if (data.inventory) inventoryData = data.inventory || [];
            if (data.staff) staffData = data.staff || [];
            if (data.sales) salesData = data.sales || [];
            if (data.customers) customersData = data.customers || [];
            if (data.expenses) expensesData = data.expenses || [];
            if (data.payroll) payrollData = data.payroll || [];
            if (data.attendance) attendanceData = data.attendance || [];
            if (data.leaves) leaveData = data.leaves || [];
            if (data.shifts) shiftData = data.shifts || [];
            if (data.settings) pharmacySettings = data.settings || {};
            if (data.credits) supplierCredits = data.credits || [];
            if (data.defectives) defectiveData = data.defectives || [];

            saveData(false); // Save to local storage without re-triggering cloud sync loop
            renderSidebar();
            renderDashboard();
            showNotification("Data successfully synced from Cloud!");
        } catch (e) {
            console.error("Pull Error:", e);
            showNotification("Failed to pull latest data from cloud.");
        }
    },

    initRealtime() {
        // Polling Strategy for simple JSON file
        // REDUCED FREQUENCY to save API requests (every 5 minutes)
        // 10,000 req/day is roughly 1 req every 8 seconds, but purely mostly used for saves.
        // 5 mins = 288 requests/day per device for reads. Safe.
        setInterval(() => {
            if (cloudStorageUrl && !document.hidden) { // Only poll if tab is active
                console.log("Auto-polling cloud data...");
                CloudService.pullCloudToLocal();
            }
        }, 300000);
    }
};

function showNotification(msg) {
    const notify = document.createElement('div');
    notify.className = "fixed bottom-5 right-5 bg-blue-600 text-white p-4 rounded-xl shadow-2xl z-[1000] animate-bounce flex items-center gap-3";
    notify.innerHTML = `<i data-lucide="bell" class="h-5 w-5"></i> <span>${msg}</span>`;
    document.body.appendChild(notify);
    lucide.createIcons();
    setTimeout(() => notify.remove(), 5000);
}

// --- Auth Logic ---
function checkAuth() {
    const isLoggedIn = localStorage.getItem('pharma_auth') === 'true';
    if (isLoggedIn) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
    } else {
        const userStr = localStorage.getItem('pharma_user');
        if (userStr) currentUser = JSON.parse(userStr);

        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard-container').classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    const result = await DataService.login(user, pass);

    if (result.success) {
        localStorage.setItem('pharma_auth', 'true');
        localStorage.setItem('pharma_user', JSON.stringify(result.user));
        currentUser = result.user;
        checkAuth();
        renderSidebar(); // Re-render sidebar based on role
    } else {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('login-error').textContent = result.message || "Invalid credentials";
    }
}

function handleLogout() {
    localStorage.removeItem('pharma_auth');
    localStorage.removeItem('pharma_user');
    currentUser = null;
    checkAuth();
}

function renderLoginHints() {
    const container = document.querySelector('#login-screen form');
    if (!container) return;

    const hintDiv = document.createElement('div');
    hintDiv.className = "mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200";
    hintDiv.innerHTML = `
        <p class="font-bold mb-1">Default Credentials:</p>
        <ul class="list-disc pl-4 space-y-1">
            <li>Username: <b>admin</b> / Password: <b>123</b></li>
        </ul>
    `;
    container.appendChild(hintDiv);
}

function injectLoginThemeToggle() {
    const loginScreen = document.getElementById('login-screen');
    if (!loginScreen || document.getElementById('login-theme-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'login-theme-toggle';
    btn.type = 'button';
    btn.className = 'absolute top-6 right-6 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-50';
    btn.innerHTML = `
        <span class="dark:hidden"><i data-lucide="moon" class="h-5 w-5"></i></span>
        <span class="hidden dark:block"><i data-lucide="sun" class="h-5 w-5"></i></span>
    `;

    btn.onclick = toggleTheme;
    loginScreen.appendChild(btn);
}

// --- Persistence Functions ---
async function loadData() {
    // Load Staff first so login works
    const storedStaff = await DataService.loadData('staff');
    if (storedStaff && storedStaff.length > 0) {
        staffData = storedStaff;
    } else {
        staffData = defaultStaff;
    }

    const storedInv = await DataService.loadData('inventory');
    const storedSales = await DataService.loadData('sales');
    const storedSettings = await DataService.loadData('settings');
    const storedAttendance = await DataService.loadData('attendance');
    const storedLeaves = await DataService.loadData('leaves_v2'); // Changed key to clear old data
    const storedShifts = await DataService.loadData('shifts');
    const storedPayroll = await DataService.loadData('payroll');
    const storedDefectives = await DataService.loadData('defectives');
    const storedCredits = await DataService.loadData('credits');
    const storedCustomers = await DataService.loadData('customers');
    const storedExpenses = await DataService.loadData('expenses');

    if (storedInv) {
        inventoryData = storedInv;
        // Fix: Rename Hydrochlorothiazide to HCTZ if loaded from old data
        const hctz = inventoryData.find(i => i.id === 24);
        if (hctz && hctz.name === 'Hydrochlorothiazide 25mg') {
            hctz.name = 'HCTZ';
        }
    } else {
        inventoryData = defaultInventory;
    }

    // Fix: Use stored sales if available, otherwise initialize with requested totals
    if (storedSales && storedSales.length > 0) {
        salesData = storedSales;
    } else {
        salesData = [];
    }

    if (storedSettings) {
        pharmacySettings = storedSettings;
    }

    if (storedAttendance) attendanceData = storedAttendance;
    if (storedLeaves) leaveData = storedLeaves;
    if (storedShifts) shiftData = storedShifts;
    if (storedPayroll) payrollData = storedPayroll;
    if (storedCredits) supplierCredits = storedCredits;
    if (storedCustomers) customersData = storedCustomers;
    if (storedExpenses) expensesData = storedExpenses;
}

async function saveData(triggerCloud = true) {
    await DataService.saveData('inventory', inventoryData);
    await DataService.saveData('staff', staffData);
    await DataService.saveData('sales', salesData);
    await DataService.saveData('settings', pharmacySettings);
    await DataService.saveData('attendance', attendanceData);
    await DataService.saveData('leaves_v2', leaveData);
    await DataService.saveData('shifts', shiftData);
    await DataService.saveData('payroll', payrollData);
    await DataService.saveData('defectives', defectiveData);
    await DataService.saveData('credits', supplierCredits);
    await DataService.saveData('customers', customersData);
    await DataService.saveData('expenses', expensesData);

    // Re-render dependent views
    renderStats();
    renderDashboardTable();
    renderSalesChart();
    renderInventoryTable();

    // Sync to Cloud
    if (triggerCloud && supabaseClient) {
        CloudService.syncLocalToCloud();
    }

    if (currentView === 'staff') renderStaffDashboard();
    if (currentView === 'transactions') renderTransactions();
    renderSettingsForm();
    renderSalesInterface();
}

// --- Render Functions ---

function injectInventoryUI() {
    const view = document.getElementById('view-inventory');
    if (!view) return;

    // Overwrite content for tabbed layout
    view.innerHTML = `
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Inventory Management</h2>
                <div class="flex gap-2">
                    <button onclick="exportData()" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border rounded-lg hover:bg-slate-50 flex items-center gap-2">
                        <i data-lucide="download" class="h-4 w-4"></i> Export
                    </button>
                    <button id="btn-add-item" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        <i data-lucide="plus" class="h-4 w-4"></i> Add Medicine
                    </button>
                </div>
            </div>

            <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto gap-6" id="inventory-tabs">
                <button onclick="switchInventoryTab('stock')" class="inventory-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors" data-tab="stock">Stock Inventory</button>
                <button onclick="switchInventoryTab('defects')" class="inventory-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors" data-tab="defects">Returns & Defects</button>
                <button onclick="switchInventoryTab('credits')" class="inventory-tab whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors" data-tab="credits">Supplier Credits</button>
            </div>

            <div id="inventory-stock-content" class="inventory-tab-content space-y-6">
                <!-- Stock Table stays here -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div class="relative w-full md:w-64">
                            <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                            <input type="text" id="inventory-search" placeholder="Search stock..." 
                                class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm text-slate-600">
                            <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300 font-semibold">
                                <tr class="text-left">
                                    <th class="px-2 py-3">Medicine Name</th>
                                    <th class="px-2 py-3 hidden md:table-cell">Category</th>
                                    <th class="px-2 py-3 hidden md:table-cell">Label</th>
                                    <th class="px-2 py-3 hidden lg:table-cell">Rx</th>
                                    <th class="px-2 py-3 hidden xl:table-cell">Shelf</th>
                                    <th class="px-2 py-3 hidden lg:table-cell">Exp Date</th>
                                    <th class="px-2 py-3">Stock</th>
                                    <th class="px-2 py-3">Price</th>
                                    <th class="px-2 py-3 hidden md:table-cell text-center">GST %</th>
                                    <th class="px-2 py-3 hidden lg:table-cell text-center">Margin %</th>
                                    <th class="px-2 py-3">Status</th>
                                    <th class="px-2 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200 dark:divide-slate-700 dark:text-slate-300" id="inventory-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="inventory-defects-content" class="inventory-tab-content hidden space-y-6"></div>
            <div id="inventory-credits-content" class="inventory-tab-content hidden space-y-6"></div>
        </div>
    `;
    updateInventoryTabsUI();
}

function injectStaffView() {
    if (document.getElementById('view-staff')) return;

    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-staff';
    div.className = 'hidden space-y-6';
    div.innerHTML = `
        <div class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto gap-6" id="staff-tabs"></div>
        <div id="staff-overview-content" class="hidden space-y-6"></div>
        <div id="staff-attendance-content" class="hidden space-y-6"></div>
        <div id="staff-leaves-content" class="hidden space-y-6"></div>
        <div id="staff-shifts-content" class="hidden space-y-6"></div>
        <div id="staff-payroll-content" class="hidden space-y-6"></div>
    `;
    dashboard.parentElement.appendChild(div);
}

function injectSalesView() {
    if (document.getElementById('view-sales')) return;

    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-sales';
    div.className = 'hidden h-auto md:h-[calc(100vh-80px)] flex flex-col md:flex-row gap-4';
    div.innerHTML = `
        <div class="flex-1 flex flex-col gap-4 h-auto md:h-full overflow-hidden">
            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <div class="flex gap-4">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                        <input type="text" id="pos-search" placeholder="Search medicine..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <i data-lucide="calendar" class="h-4 w-4"></i>
                        <span id="bill-date">${new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div class="h-[400px] md:flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto p-4">
                <div id="pos-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
            </div>
        </div>
        <div class="w-full md:w-96 flex flex-col gap-4 h-auto md:h-full shrink-0">
            <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-auto md:h-full overflow-hidden">
                <div class="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2"><i data-lucide="shopping-cart" class="h-5 w-5 text-blue-600"></i> Current Bill</h3>
                    <span id="cart-total-badge" class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">0 Items</span>
                </div>
                <div class="flex-1 overflow-y-auto p-4 space-y-3" id="cart-items"></div>
                <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
                    <div>
                        <label class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 cursor-pointer hover:text-blue-600">
                            <i data-lucide="paperclip" class="h-3 w-3"></i> Attach Prescription (Optional)
                            <input type="file" id="prescription-upload" accept="image/*" class="hidden">
                        </label>
                        <div id="prescription-preview" class="hidden flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                            <img id="prescription-img-preview" class="h-8 w-8 rounded object-cover">
                            <span id="prescription-filename" class="text-xs text-blue-700 dark:text-blue-300 truncate flex-1"></span>
                            <button onclick="removePrescription()" class="text-red-500 hover:text-red-700"><i data-lucide="x" class="h-3 w-3"></i></button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <input type="text" id="customer-name" placeholder="Customer Name" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <input type="tel" id="customer-phone" placeholder="Phone Number" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <select id="payment-method" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Credit (Khaata)">Credit (Khaata)</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center pt-2"><span class="text-slate-500 dark:text-slate-400">Total Amount</span><span id="cart-total" class="text-2xl font-bold text-slate-800 dark:text-white">₹0.00</span></div>
                    <button id="btn-checkout" onclick="processCheckout(event)" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"><i data-lucide="check-circle" class="h-5 w-5"></i> Complete Sale</button>
                </div>
            </div>
        </div>
    `;
    dashboard.parentElement.appendChild(div);
}



function injectStaffModal() {
    if (document.getElementById('staff-modal-overlay')) return;

    const div = document.createElement('div');
    div.id = 'staff-modal-overlay';
    div.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4 transition-opacity opacity-0';
    div.innerHTML = `
        <div id="staff-modal-content" class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform scale-95 opacity-0 transition-all duration-200 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 id="staff-modal-title" class="text-lg font-bold text-slate-800 dark:text-white">Add Staff Member</h3>
                <button type="button" id="btn-close-staff-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <form id="add-staff-form" class="p-6 space-y-4">
                <input type="hidden" name="id">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input type="text" name="name" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select name="role" class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Manager">Manager</option>
                        <option value="Cashier">Cashier</option>
                    </select>
                </div>
                <div class="pt-4 flex gap-3">
                    <button type="button" id="btn-cancel-staff-modal" class="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save Staff</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(div);
}

function injectTransactionsView() {
    if (document.getElementById('view-transactions')) return;
    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-transactions';
    div.className = 'hidden space-y-6';
    div.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Transaction History</h2>
            <div class="relative w-full sm:w-64">
                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                <input type="text" id="transaction-search" placeholder="Search invoice or customer..." 
                    class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                        <tr>
                            <th class="px-6 py-3 whitespace-nowrap">Date & Time</th>
                            <th class="px-6 py-3 whitespace-nowrap">Invoice #</th>
                            <th class="px-6 py-3 min-w-[150px]">Customer</th>
                            <th class="px-6 py-3 min-w-[200px]">Items</th>
                            <th class="px-6 py-3 whitespace-nowrap">Payment</th>
                            <th class="px-6 py-3 whitespace-nowrap">Total</th>

                            <th class="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="transactions-table-body" class="divide-y divide-slate-200 dark:divide-slate-700"></tbody>
                </table>
            </div>
        </div>
    `;
    dashboard.parentElement.appendChild(div);

    // Add search listener
    const searchInput = document.getElementById('transaction-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderTransactions(e.target.value);
        });
    }
}

function injectCustomersView() {
    if (document.getElementById('view-customers')) return;
    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-customers';
    div.className = 'hidden space-y-6';
    div.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Customer Directory</h2>
            <div class="flex items-center gap-3 w-full sm:w-auto">
                <button onclick="openAddCustomerModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all shrink-0">
                    <i data-lucide="user-plus" class="h-4 w-4"></i> Add Customer
                </button>
                <div class="relative w-full sm:w-64">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                    <input type="text" id="customer-search" placeholder="Search by name or phone..." 
                        class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                        <tr>
                            <th class="px-6 py-3">Customer Name</th>
                            <th class="px-6 py-3 text-center">Remaining Balance (Khaata)</th>
                            <th class="px-6 py-3">Phone</th>
                            <th class="px-6 py-3">Last Visit</th>
                            <th class="px-6 py-3">Total Spent</th>
                            <th class="px-6 py-3">Visits</th>
                            <th class="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body" class="divide-y divide-slate-200 dark:divide-slate-700"></tbody>
                </table>
            </div>
        </div>
    `;
    dashboard.parentElement.appendChild(div);
    injectCustomerModal();

    document.getElementById('customer-search').addEventListener('input', (e) => {
        renderCustomers(e.target.value);
    });
}

function renderCustomers(searchTerm = '') {
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;

    let filtered = [...customersData].sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(term) ||
            (c.phone && c.phone.includes(term))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400">No customers found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(c => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${c.name}</td>
            <td class="px-6 py-4 text-center">
                <div class="flex flex-col items-center">
                    <span class="font-bold ${(c.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}">₹${(c.balance || 0).toFixed(2)}</span>
                    ${(c.balance || 0) > 0 ? `<button onclick="settleBalance('${c.id}')" class="text-[10px] text-blue-600 hover:underline">Pay Now</button>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 font-mono text-xs">${c.phone || '-'}</td>
            <td class="px-6 py-4 text-xs">${new Date(c.lastVisit).toLocaleDateString()}</td>
            <td class="px-6 py-4 font-bold text-blue-600">₹${c.totalSpent.toFixed(2)}</td>
            <td class="px-6 py-4">
                <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold">${c.visits} Visits</span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteCustomer('${c.id}')" class="text-slate-400 hover:text-red-600 transition-colors">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function deleteCustomer(id) {
    if (confirm("Are you sure you want to remove this customer record?")) {
        customersData = customersData.filter(c => c.id !== id);
        saveData();
        renderCustomers();
    }
}

function injectCustomerModal() {
    if (document.getElementById('customer-modal-overlay')) return;
    const modal = document.createElement('div');
    modal.id = 'customer-modal-overlay';
    modal.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] hidden flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Add New Customer</h3>
                <button onclick="toggleCustomerModal(false)" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="h-6 w-6"></i></button>
            </div>
            <form id="add-customer-form" onsubmit="handleAddCustomer(event)" class="p-6 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input type="text" name="name" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input type="tel" name="phone" required class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Balance (Khaata)</label>
                    <input type="number" name="balance" value="0" step="0.01" class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="toggleCustomerModal(false)" class="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Create Profile</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

function openAddCustomerModal() {
    toggleCustomerModal(true);
}

function toggleCustomerModal(show) {
    const el = document.getElementById('customer-modal-overlay');
    if (el) {
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    }
}

function handleAddCustomer(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const phone = fd.get('phone');
    const balance = parseFloat(fd.get('balance')) || 0;

    const newCust = {
        id: 'CUST-' + Date.now(),
        name,
        phone,
        visits: 0,
        totalSpent: 0,
        balance,
        lastVisit: new Date().toISOString()
    };

    customersData.push(newCust);
    saveData();
    renderCustomers();
    toggleCustomerModal(false);
    e.target.reset();
    showNotification(`Profile created for ${name}`);
}

function injectExpensesView() {
    if (document.getElementById('view-expenses')) return;
    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-expenses';
    div.className = 'hidden space-y-6';
    div.innerHTML = `
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Shop Expenses</h2>
            <button onclick="toggleExpenseModal(true)" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all">
                <i data-lucide="plus" class="h-4 w-4"></i> Add Expense
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p class="text-sm text-slate-500">Total Expenses (Monthly)</p>
                <p id="total-monthly-expenses" class="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹0.00</p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p class="text-sm text-slate-500">Most Expensive Category</p>
                <p id="top-expense-cat" class="text-2xl font-bold text-slate-900 dark:text-white mt-1">-</p>
            </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                    <tr>
                        <th class="px-6 py-3">Date</th>
                        <th class="px-6 py-3">Title</th>
                        <th class="px-6 py-3">Category</th>
                        <th class="px-6 py-3">Amount</th>
                        <th class="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="expenses-table-body" class="divide-y divide-slate-200 dark:divide-slate-700"></tbody>
            </table>
        </div>

        <!-- Add Expense Modal -->
        <div id="expense-modal-overlay" class="fixed inset-0 bg-black/50 z-[100] hidden flex items-center justify-center p-4 backdrop-blur-sm">
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border dark:border-slate-700">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Record New Expense</h3>
                <form onsubmit="handleAddExpense(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Expense Title</label>
                        <input type="text" name="title" required placeholder="e.g. Electricity Bill" class="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Category</label>
                        <select name="category" class="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                            <option value="Bills & Utilities">Bills & Utilities</option>
                            <option value="Rent">Rent</option>
                            <option value="Salary">Salary</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Tea & Snacks">Tea & Snacks</option>
                            <option value="Transport">Transport</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Amount (₹)</label>
                        <input type="number" step="0.01" name="amount" required class="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" onclick="toggleExpenseModal(false)" class="flex-1 py-2 text-slate-500 font-bold">Cancel</button>
                        <button type="submit" class="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    dashboard.parentElement.appendChild(div);
}

function toggleExpenseModal(show) {
    const el = document.getElementById('expense-modal-overlay');
    if (el) el.classList.toggle('hidden', !show);
}

function handleAddExpense(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const exp = {
        id: Date.now(),
        title: fd.get('title'),
        category: fd.get('category'),
        amount: parseFloat(fd.get('amount')),
        date: new Date().toISOString()
    };
    expensesData.push(exp);
    saveData();
    renderExpenses();
    toggleExpenseModal(false);
    e.target.reset();
}

function renderExpenses() {
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;

    const currentMonth = new Date().getMonth();
    const monthlyTotal = expensesData
        .filter(ex => new Date(ex.date).getMonth() === currentMonth)
        .reduce((sum, ex) => sum + ex.amount, 0);

    document.getElementById('total-monthly-expenses').textContent = `₹${monthlyTotal.toFixed(2)}`;

    tbody.innerHTML = [...expensesData].reverse().map(ex => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <td class="px-6 py-4 text-xs text-slate-500">${new Date(ex.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">${ex.title}</td>
            <td class="px-6 py-4"><span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold">${ex.category}</span></td>
            <td class="px-6 py-4 font-bold text-red-600">₹${ex.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteExpense(${ex.id})" class="text-slate-400 hover:text-red-700 p-1"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function deleteExpense(id) {
    if (confirm("Delete this expense record?")) {
        expensesData = expensesData.filter(ex => ex.id !== id);
        saveData();
        renderExpenses();
    }
}

function settleBalance(customerId) {
    const customer = customersData.find(c => c.id === customerId);
    if (!customer) return;

    const amount = parseFloat(prompt(`Customer: ${customer.name}\nCurrent Balance: ₹${customer.balance || 0}\n\nEnter amount paid by customer:`, customer.balance));
    if (isNaN(amount) || amount <= 0) return;

    if (amount > (customer.balance || 0)) {
        alert("Amount exceeds balance!");
        return;
    }

    customer.balance = (customer.balance || 0) - amount;

    // Add to income/sales as a credit payment
    const paymentRecord = {
        id: Date.now(),
        items: [{ name: 'Khaata Payment', price: amount, qty: 1 }],
        total: amount,
        customerName: customer.name,
        paymentMethod: 'Khaata Settlement',
        timestamp: new Date().toISOString()
    };
    salesData.push(paymentRecord);

    saveData();
    renderCustomers();
    showNotification(`Payment of ₹${amount} received!`);
}

function deleteSale(id) {
    if (!confirm("Are you sure you want to delete this sale record? This action cannot be undone.")) return;

    const saleIndex = salesData.findIndex(s => s.id === id);
    if (saleIndex === -1) return;

    const sale = salesData[saleIndex];

    // Restore stock for items in the deleted sale
    sale.items.forEach(item => {
        const invItem = inventoryData.find(i => i.id === item.id);
        if (invItem) {
            invItem.stock += item.qty;
            // Optionally update status if stock goes above low threshold
            if (invItem.stock > 10) invItem.status = 'In Stock';
        }
    });

    salesData.splice(saleIndex, 1); // Remove the sale
    saveData();
    renderTransactions();
    showNotification("Sale deleted successfully.");
}

function returnSale(id) {
    if (!confirm("Are you sure you want to return this sale? Items will be added back to stock and revenue will be deducted.")) return;

    const sale = salesData.find(s => s.id === id);
    if (!sale) return;

    // 1. Restore Stock
    sale.items.forEach(item => {
        const invItem = inventoryData.find(i => i.id === item.id);
        if (invItem) {
            invItem.stock += item.qty;
            if (invItem.stock > 10) invItem.status = 'In Stock';
        }
    });

    // 2. Mark as Returned
    sale.status = 'Returned';

    // 3. Deduct from customer balance if it was a credit sale
    if (sale.paymentMethod === 'Credit (Khaata)') {
        const customer = customersData.find(c => c.name === sale.customerName);
        if (customer) {
            customer.balance = Math.max(0, (customer.balance || 0) - sale.total);
        }
    }

    saveData();
    renderTransactions();
    showNotification("Sale returned. Stock restored!");
}

function injectInvoiceModal() {
    if (document.getElementById('invoice-modal-overlay')) return;

    const div = document.createElement('div');
    div.id = 'invoice-modal-overlay';
    div.className = 'fixed inset-0 bg-slate-900/75 backdrop-blur-sm hidden z-[60] flex items-center justify-center p-4 opacity-0 transition-opacity duration-200';
    div.innerHTML = `
        <div id="invoice-modal-content" class="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md transform scale-95 transition-all duration-200 flex flex-col max-h-[90vh]">
            <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="font-bold text-slate-800 dark:text-white">Invoice Created</h3>
                <button onclick="closeInvoiceModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <div id="invoice-preview-area" class="p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 font-mono text-sm text-slate-800 dark:text-slate-300">
                <!-- Invoice HTML goes here -->
            </div>
            <div class="p-4 border-t border-slate-100 dark:border-slate-700 flex gap-3 bg-white dark:bg-slate-800 rounded-b-lg">
                <button onclick="closeInvoiceModal()" class="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">Close</button>
                <button id="btn-print-invoice-modal" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <i data-lucide="printer" class="h-4 w-4"></i> Print
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function closeInvoiceModal() {
    const overlay = document.getElementById('invoice-modal-overlay');
    const content = document.getElementById('invoice-modal-content');
    if (!overlay || !content) return;

    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 200);
}



function injectLeaveModal() {
    if (document.getElementById('leave-modal-overlay')) return;

    const div = document.createElement('div');
    div.id = 'leave-modal-overlay';
    div.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4 transition-opacity opacity-0';
    div.innerHTML = `
        <div id="leave-modal-content" class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform scale-95 opacity-0 transition-all duration-200">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-lg font-bold text-slate-800 dark:text-white">Request Leave</h3>
                <button type="button" id="btn-close-leave-modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <i data-lucide="x" class="h-5 w-5"></i>
                </button>
            </div>
            <form id="request-leave-form" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Member</label>
                    <select name="staffId" id="leave-staff-select" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <!-- Options populated dynamically -->
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                    <select name="type" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Casual">Casual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Vacation">Vacation</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Unpaid">Unpaid Leave</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Days</label>
                    <input type="number" name="days" min="1" value="1" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                    <input type="text" name="reason" placeholder="Brief reason..." required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div class="pt-4 flex gap-3">
                    <button type="button" id="btn-cancel-leave-modal" class="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Submit Request</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(div);
}

function toggleCartDetails() {
    const container = document.getElementById('cart-items-container');
    const icon = document.getElementById('cart-toggle-icon');
    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        container.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

function renderSidebar() {
    const navContainer = document.getElementById('sidebar-nav');
    navContainer.innerHTML = '';

    menuItems.forEach(item => {
        // Role Based Access Control
        if (currentUser && currentUser.role !== 'Manager') {
            if (item.id === 'staff' || item.id === 'settings') return;
        }

        const isActive = item.id === currentView;
        const activeClass = isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white';

        // Add Badge for Inventory
        let badgeHtml = '';
        if (item.id === 'inventory') {
            const alerts = inventoryData.filter(i => i.stock < 10 || isExpiringSoon(i.expDate)).length;
            if (alerts > 0) {
                badgeHtml = `<span class="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">${alerts}</span>`;
            }
        }

        const button = document.createElement('button');
        button.className = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeClass}`;
        button.innerHTML = `<i data-lucide="${item.icon}" class="h-5 w-5"></i> ${item.name} ${badgeHtml}`;

        button.onclick = () => switchView(item.id, item.name);

        navContainer.appendChild(button);
    });

    // Link to Website
    const webLink = document.createElement('a');
    webLink.href = 'website.html';
    webLink.className = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white mt-2 border-t border-slate-100 dark:border-slate-700 pt-3';
    webLink.innerHTML = `<i data-lucide="globe" class="h-5 w-5"></i> View Website`;
    navContainer.appendChild(webLink);

    lucide.createIcons();
}

function renderStats() {
    // Calculate Stats
    const now = new Date();
    const today = now.toDateString();

    // Previous day setup
    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Previous month setup
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(now.getMonth() - 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();

    let todaySales = 0;
    let monthSales = 0;
    let prevMonthSales = 0;
    let todayOrders = 0;
    let yesterdayOrders = 0;
    let totalRevenue = 0;
    let totalProfit = 0;

    salesData.forEach(sale => {
        const saleDate = new Date(sale.timestamp);
        const saleDateString = saleDate.toDateString();

        totalRevenue += sale.total;
        totalProfit += (sale.profit || 0);

        // Daily Checks
        if (saleDateString === today) {
            todaySales += sale.total;
            todayOrders++;
        }
        if (saleDateString === yesterday) {
            yesterdayOrders++;
        }

        // Monthly Checks
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            monthSales += sale.total;
        }
        if (saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevMonthYear) {
            prevMonthSales += sale.total;
        }
    });

    const lowStockCount = inventoryData.filter(i => i.stock < 10).length;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;

    // Sales Growth Logic
    let salesGrowth = 0;
    let salesChangeText = "No data from last month";
    if (prevMonthSales > 0) {
        salesGrowth = ((monthSales - prevMonthSales) / prevMonthSales) * 100;
        salesChangeText = `${salesGrowth > 0 ? '+' : ''}${salesGrowth.toFixed(1)}% from last month`;
    } else if (monthSales > 0) {
        salesChangeText = "100% (No prior sales)";
    }

    // Orders Change Logic
    let orderChangeText = `${todayOrders} new today`;
    if (yesterdayOrders > 0) {
        const diff = todayOrders - yesterdayOrders;
        orderChangeText = `${diff > 0 ? '+' : ''}${diff} vs yesterday`;
    }

    const statsData = [
        { title: t('total_sales'), value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: 'dollar-sign', color: 'text-green-600', bg: 'bg-green-100', change: salesChangeText },
        { title: 'Net Profit', value: `₹${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: 'trending-up', color: 'text-emerald-600', bg: 'bg-emerald-100', change: `${margin}% Margin` },
        { title: t('total_orders'), value: salesData.length.toLocaleString(), icon: 'shopping-bag', color: 'text-blue-600', bg: 'bg-blue-100', change: orderChangeText },
        { title: t('out_of_stock'), value: lowStockCount.toString(), icon: 'alert-triangle', color: 'text-orange-600', bg: 'bg-orange-100', change: 'Check inventory alerts', action: true },
    ];

    const container = document.getElementById('stats-container');
    container.innerHTML = statsData.map(stat => `
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">${stat.title}</p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">${stat.value}</p>
                </div>
                <div class="rounded-full p-2 ${stat.bg}">
                    <i data-lucide="${stat.icon}" class="h-5 w-5 ${stat.color}"></i>
                </div>
            </div>
            <div class="flex justify-between items-center mt-4">
                <p class="text-xs text-slate-500 dark:text-slate-400">${stat.change}</p>
                ${stat.action ? `<button onclick="switchView('inventory', 'Inventory')" class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200">View All</button>` : ''}
            </div>
        </div>
    `).join('');

    renderStoreHealth();
    lucide.createIcons();
}

function renderStoreHealth() {
    const container = document.getElementById('store-health-container');
    if (!container) return;

    const expiringSoon = inventoryData.filter(i => isExpiringSoon(i.expDate)).slice(0, 3);
    const lowStock = inventoryData.filter(i => i.stock > 0 && i.stock < 10).sort((a, b) => a.stock - b.stock).slice(0, 3);
    const outOfStock = inventoryData.filter(i => i.stock <= 0).slice(0, 3);

    container.innerHTML = `
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i data-lucide="alert-circle" class="h-5 w-5 text-red-500"></i> Expiry Alerts
            </h3>
            <div class="space-y-3">
                ${expiringSoon.length > 0 ? expiringSoon.map(i => `
                    <div class="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800">
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-white">${i.name}</p>
                            <p class="text-[10px] text-red-600">Expires: ${i.expDate}</p>
                        </div>
                        <span class="text-xs font-bold text-slate-400">Shelf: ${i.shelf}</span>
                    </div>
                `).join('') : '<p class="text-xs text-slate-400 italic">No products expiring soon.</p>'}
            </div>
        </div>
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i data-lucide="package" class="h-5 w-5 text-orange-500"></i> Stock Alerts
            </h3>
            <div class="space-y-3">
                ${[...lowStock, ...outOfStock].slice(0, 3).length > 0 ? [...lowStock, ...outOfStock].slice(0, 3).map(i => `
                    <div class="flex items-center justify-between p-2 rounded ${i.stock <= 0 ? 'bg-slate-100 dark:bg-slate-700' : 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800'}">
                        <div>
                            <p class="text-sm font-bold text-slate-800 dark:text-white">${i.name}</p>
                            <p class="text-[10px] ${i.stock <= 0 ? 'text-slate-500' : 'text-orange-600'}">${i.stock <= 0 ? 'OUT OF STOCK' : i.stock + ' units left'}</p>
                        </div>
                        <button onclick="switchView('inventory', 'Inventory')" class="text-[10px] bg-blue-600 text-white px-2 py-1 rounded">Restock</button>
                    </div>
                `).join('') : '<p class="text-xs text-slate-400 italic">All stock levels healthy.</p>'}
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderSalesChart() {
    const ctx = document.getElementById('sales-chart');
    if (!ctx) return;

    // Prepare data: Last 7 days
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();

        // Label: "Mon 12"
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));

        // Sum sales for this day
        const dailyTotal = salesData
            .filter(s => new Date(s.timestamp).toDateString() === dateStr)
            .reduce((sum, s) => sum + s.total, 0);
        data.push(dailyTotal);
    }

    // Destroy previous chart if exists to avoid overlap
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Sales (₹)',
                data: data,
                borderColor: 'rgb(37, 99, 235)', // Blue-600
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: 'rgb(37, 99, 235)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return 'Sales: ₹' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderDashboardTable() {
    const tbody = document.getElementById('orders-table-body');

    // Get last 5 sales
    const recentSales = [...salesData].reverse().slice(0, 5);

    if (recentSales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-slate-400">No recent orders</td></tr>`;
        return;
    }

    tbody.innerHTML = recentSales.map(sale => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">#INV-${sale.id}</td>
            <td class="px-6 py-4">${sale.items.length} Items</td>
            <td class="px-6 py-4">${sale.customerName || 'Walk-in Customer'}</td>
            <td class="px-6 py-4 font-medium">₹${sale.total.toFixed(2)} <span class="text-xs text-slate-400 dark:text-slate-500 block">${sale.paymentMethod || 'Cash'}</span></td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sale.status === 'Returned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                    ${sale.status || 'Paid'}
                </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                ${!sale.status || sale.status !== 'Returned' ? `
                    <button onclick="returnSale(${sale.id})" title="Return Items" class="text-orange-400 hover:text-orange-600 transition-colors p-1">
                        <i data-lucide="rotate-ccw" class="h-4 w-4"></i>
                    </button>
                ` : ''}
                <button class="text-slate-400 hover:text-blue-600 transition-colors p-1" onclick="printInvoiceById(${sale.id})">
                    <i data-lucide="printer" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderInventoryTable() {
    if (currentInventoryTab !== 'stock') return;

    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('inventory-empty');
    if (!tbody) return;

    if (inventoryData.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const getStockColor = (status) => {
        if (status === 'In Stock') return 'bg-green-100 text-green-700';
        if (status === 'Low Stock') return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-700';
    };

    const getLabelColor = (label) => {
        if (label === 'Adult') return 'bg-blue-100 text-blue-700';
        if (label === 'Child') return 'bg-pink-100 text-pink-700';
        if (label === 'Infant') return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    tbody.innerHTML = inventoryData.map(item => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 text-xs">
            <td class="px-2 py-2">
                <div class="font-medium text-slate-900 dark:text-white">${item.name}</div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">${item.description || ''}</div>
            </td>
            <td class="px-2 py-2 hidden md:table-cell">
                <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-100 border border-slate-200 dark:border-slate-500 uppercase tracking-tighter">
                    ${item.category || 'Medicine'}
                </span>
            </td>
            <td class="px-2 py-2 hidden md:table-cell">
                <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${getLabelColor(item.label)}">
                    ${item.label}
                </span>
            </td>
            <td class="px-2 py-2 hidden lg:table-cell">
                ${item.rx ? '<span class="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-bold">Rx</span>' : '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">OTC</span>'}
            </td>
            <td class="px-2 py-2 text-slate-500 dark:text-slate-400 font-mono hidden xl:table-cell">${item.shelf}</td>
            <td class="px-2 py-2 text-slate-500 dark:text-slate-400 hidden lg:table-cell">${item.expDate || '-'}</td>
            <td class="px-2 py-2 font-medium">${item.stock}</td>
            <td class="px-2 py-2 font-bold whitespace-nowrap">₹${item.price.toFixed(2)}</td>
            <td class="px-2 py-2 text-center text-[10px] font-mono whitespace-nowrap hidden md:table-cell">
                <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">${item.tax || 0}%</span>
            </td>
            <td class="px-2 py-2 text-center text-[10px] font-bold whitespace-nowrap hidden lg:table-cell">
                ${(() => {
            const cost = item.costPrice || 0;
            if (cost <= 0) return '<span class="text-slate-400">-</span>';
            const margin = ((item.price - cost) / item.price * 100);
            const color = margin > 20 ? 'text-green-600' : (margin > 10 ? 'text-blue-600' : 'text-orange-600');
            return `<span class="${color}">${margin.toFixed(1)}%</span>`;
        })()}
            </td>
            <td class="px-2 py-2">
                <span class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getStockColor(item.status)}">
                    ${item.status}
                </span>
            </td>
            <td class="px-2 py-2 text-right flex items-center justify-end gap-1">
                <button title="Mark as Defective" class="text-slate-400 hover:text-orange-500 p-1" onclick="markAsDefective(${item.id})">
                    <i data-lucide="alert-circle" class="h-4 w-4"></i>
                </button>
                <button class="text-slate-400 hover:text-blue-600 p-1" onclick="editInventoryItem(${item.id})">
                    <i data-lucide="pencil" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    inventoryData.forEach((item, idx) => {
        if (isExpiringSoon(item.expDate)) {
            const rows = tbody.querySelectorAll('tr');
            if (rows[idx]) rows[idx].classList.add('bg-red-50/50', 'dark:bg-red-900/10');
        }
    });

    lucide.createIcons();
}

function renderTransactions(searchTerm = '') {
    const tbody = document.getElementById('transactions-table-body');
    if (!tbody) return;

    let filtered = [...salesData].reverse();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(s =>
            s.id.toString().includes(term) ||
            (s.customerName && s.customerName.toLowerCase().includes(term))
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400">No transactions found</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(sale => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <td class="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                ${new Date(sale.timestamp).toLocaleDateString()} 
                <span class="text-xs ml-1 text-slate-400">${new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </td>
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">#INV-${sale.id}</td>
            <td class="px-6 py-4 text-slate-700 dark:text-slate-300">${sale.customerName || 'Walk-in'}</td>
            <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                    ${sale.items.map(i => `<div class="text-xs text-slate-600 dark:text-slate-400 flex justify-between gap-4"><span class="break-words">${i.name}</span> <span class="font-mono shrink-0">x${i.qty}</span></div>`).join('')}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${sale.paymentMethod}</td>
            <td class="px-6 py-4 font-bold text-slate-800 dark:text-white whitespace-nowrap">₹${sale.total.toFixed(2)}</td>

            <td class="px-6 py-4 text-right whitespace-nowrap">
                <button onclick="printInvoice(${JSON.stringify(sale).replace(/"/g, '&quot;')})" class="text-blue-600 hover:text-blue-800 mr-3" title="Print Invoice">
                    <i data-lucide="printer" class="h-4 w-4"></i>
                </button>
                <button onclick="deleteSale(${sale.id})" class="text-red-400 hover:text-red-600" title="Delete Record">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

function renderSettingsForm() {
    document.getElementById('setting-license').value = pharmacySettings.license || '';
    document.getElementById('setting-name').value = pharmacySettings.pharmacyName || '';
    document.getElementById('setting-address').value = pharmacySettings.address || '';
}



function renderSalesInterface() {
    const grid = document.getElementById('pos-grid');
    const cartContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const badge = document.getElementById('cart-total-badge');

    if (!grid || !cartContainer) return;

    if (inventoryData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center text-slate-400 py-10">
                <i data-lucide="package-open" class="h-12 w-12 mb-2 opacity-50"></i>
                <p>No medicines in inventory.</p>
                <button onclick="switchView('inventory', 'Inventory')" class="mt-4 text-blue-600 hover:underline text-sm">Go to Inventory to add items</button>
            </div>
        `;
    } else {
        grid.innerHTML = inventoryData.map(item => `
        <div class="relative bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 cursor-pointer transition-all ${item.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}" onclick="addToCart(${item.id})">
            <div class="flex justify-between items-start gap-2">
                <h4 class="font-medium text-sm text-slate-800 dark:text-white leading-tight break-words" title="${item.name}">${item.name}</h4>
                <div class="flex flex-col items-end shrink-0">
                    <span class="text-xs font-bold text-blue-600">₹${item.price}</span>
                    ${item.rx ? '<span class="text-[10px] text-red-700 bg-red-100 px-1 rounded mt-0.5 font-bold">Rx</span>' : ''}
                </div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-500">
                <span>${item.label}</span>
                <span class="${item.stock < 5 ? 'text-red-500' : ''}">Qty: ${item.stock}</span>
            </div>
        </div>
    `).join('');
    }

    // Render Cart
    if (cart.length === 0) {
        cartContainer.innerHTML = `<p class="text-center text-slate-400 mt-4 italic text-sm">No items added</p>`;
        if (totalEl) totalEl.textContent = '₹0.00';
    } else {
        let total = 0;
        let totalTax = 0;

        cartContainer.innerHTML = cart.map((item, index) => {
            const itemTotal = item.price * item.qty;
            const itemTax = itemTotal * ((item.tax || 0) / 100);
            total += itemTotal;
            totalTax += itemTax;

            return `
                <div class="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-2 rounded">
                    <div>
                        <p class="text-sm font-medium text-slate-800 dark:text-white">${item.name}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">₹${item.price} x ${item.qty} <span class="text-[10px] text-slate-400">(${item.tax || 0}% GST)</span></p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-sm">₹${itemTotal.toFixed(2)}</span>
                        <button onclick="removeFromCart(${index})" class="text-red-400 hover:text-red-600">
                            <i data-lucide="x" class="h-4 w-4"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const netTotal = total + totalTax;

        if (totalEl) {
            totalEl.innerHTML = `
                <div class="flex flex-col items-end">
                    <span class="text-xs font-normal text-slate-500">Tax: ₹${totalTax.toFixed(2)}</span>
                    <span>₹${netTotal.toFixed(2)}</span>
                </div>
             `;
        }
    }
    if (badge) {
        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = `${count} Items`;
    }

    // Render Prescription in Cart if exists
    if (uploadedPrescription) {
        const prescriptionHtml = `
            <div class="p-2 mb-2 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800 animate-pulse">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <i data-lucide="file-text" class="h-4 w-4 text-blue-600"></i>
                        <span class="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">Prescription Attached</span>
                    </div>
                    <button onclick="removePrescription()" class="text-red-500 hover:text-red-700">
                        <i data-lucide="trash-2" class="h-3 w-3"></i>
                    </button>
                </div>
                <img src="${uploadedPrescription}" class="mt-2 h-20 w-full object-cover rounded border border-blue-200">
            </div>
        `;
        cartContainer.insertAdjacentHTML('afterbegin', prescriptionHtml);
    }

    // Update Prescription Label color based on requirement
    const rxRequired = cart.some(item => item.rx);
    const presLabel = document.querySelector('label[for="prescription-upload"]') || document.querySelector('label.cursor-pointer.hover\\:text-blue-600');
    if (presLabel) {
        if (rxRequired && !uploadedPrescription) {
            presLabel.classList.add('text-red-600', 'font-bold', 'animate-pulse');
            presLabel.innerHTML = '<i data-lucide="alert-circle" class="h-3 w-3"></i> Prescription REQUIRED';
        } else {
            presLabel.classList.remove('text-red-600', 'font-bold', 'animate-pulse');
            presLabel.innerHTML = '<i data-lucide="paperclip" class="h-3 w-3"></i> Attach Prescription (Optional)';
        }
    }

    lucide.createIcons();
}

function removePrescription() {
    uploadedPrescription = null;
    const input = document.getElementById('prescription-upload');
    if (input) input.value = '';
    const preview = document.getElementById('prescription-preview');
    if (preview) preview.classList.add('hidden');
    renderSalesInterface();
}

function addToCart(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item || item.stock <= 0) return;

    const existing = cart.find(c => c.id === id);
    if (existing) {
        if (existing.qty < item.stock) {
            existing.qty++;
        } else {
            alert('Not enough stock!');
        }
    } else {
        cart.push({ ...item, qty: 1 });
    }

    if (item.rx && !uploadedPrescription) {
        const attachBtn = document.getElementById('prescription-upload');
        if (confirm(`${item.name} requires a prescription. Would you like to upload it now?`)) {
            if (attachBtn) attachBtn.click();
        }
    }

    showNotification(`${item.name} added to cart!`);
    renderSalesInterface();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderSalesInterface();
}

function processCheckout(e) {
    if (e) e.preventDefault();
    if (cart.length === 0) return alert('Cart is empty!');

    // Prescription Requirement Check
    const rxRequired = cart.some(item => item.rx);
    if (rxRequired && !uploadedPrescription) {
        alert('ERROR: Prescription Required\n\nOne or more medicines in your cart are "Rx Only". You must upload a prescription image from your device to complete this sale.');
        const fileInput = document.getElementById('prescription-upload');
        if (fileInput) fileInput.click();
        return;
    }

    const nameEl = document.getElementById('customer-name');
    const phoneEl = document.getElementById('customer-phone') || { value: '' }; // Fallback
    const paymentEl = document.getElementById('payment-method');
    if (!nameEl || !paymentEl) return alert("UI Error: Cannot find inputs.");

    const customerName = nameEl.value.trim() || 'Walk-in Customer';
    const customerPhone = phoneEl.value?.trim() || '';
    const paymentMethod = paymentEl.value;

    // ... inside processCheckout logic ... 
    // I need to find where I actually record the sale and add the customer logic there.
    // I'll look for where saleRecord is pushed.

    let taxableAmount = 0;
    let totalTax = 0;

    cart.forEach(item => {
        const itemTaxRate = item.tax || 0;
        const lineTotal = item.price * item.qty;
        const lineTax = lineTotal * (itemTaxRate / 100);
        taxableAmount += lineTotal;
        totalTax += lineTax;
    });

    const total = taxableAmount + totalTax;
    const profit = cart.reduce((sum, item) => {
        const cost = item.costPrice || 0;
        return sum + ((item.price - cost) * item.qty);
    }, 0);

    // 1. Deduct Stock
    cart.forEach(cartItem => {
        const invItem = inventoryData.find(i => i.id === cartItem.id);
        if (invItem) {
            invItem.stock -= cartItem.qty;
            if (invItem.stock <= 0) {
                invItem.stock = 0;
                invItem.status = 'Out of Stock';
            } else if (invItem.stock < 10) {
                invItem.status = 'Low Stock';
            }
        }
    });

    // 2. Record Sale
    const saleRecord = {
        id: Date.now(),
        items: [...cart],
        taxableAmount: taxableAmount,
        totalTax: totalTax,
        total: total,
        profit: profit,
        customerName: customerName || 'Walk-in Customer',
        paymentMethod: paymentMethod,
        prescription: uploadedPrescription, // Saved prescription
        timestamp: new Date().toISOString()
    };
    salesData.push(saleRecord);

    // Update Customer Directory
    if (customerName !== 'Walk-in Customer' || customerPhone) {
        let customer = customersData.find(c => (customerPhone && c.phone === customerPhone) || (c.name === customerName && !c.phone));
        if (customer) {
            customer.visits++;
            customer.totalSpent += total;
            customer.lastVisit = new Date().toISOString();
            if (customerPhone) customer.phone = customerPhone;
            if (paymentMethod === 'Credit (Khaata)') {
                customer.balance = (customer.balance || 0) + total;
            }
        } else {
            customersData.push({
                id: 'CUST-' + Date.now(),
                name: customerName,
                phone: customerPhone,
                visits: 1,
                totalSpent: total,
                balance: (paymentMethod === 'Credit (Khaata)') ? total : 0,
                lastVisit: new Date().toISOString()
            });
        }
    }

    // Clear State
    uploadedPrescription = null;
    const prescriptionPreview = document.getElementById('prescription-preview');
    if (prescriptionPreview) prescriptionPreview.classList.add('hidden');
    cart = [];

    // Reset UI
    if (nameEl) nameEl.value = '';
    const phoneInput = document.getElementById('customer-phone');
    if (phoneInput) phoneInput.value = '';

    saveData();
    showNotification("Order Processed Successfully!");
    renderSalesInterface();

    // 4. Print Invoice (Safe Call)
    setTimeout(() => {
        try {
            printInvoice(saleRecord);
        } catch (err) {
            console.error("Print failed:", err);
            alert("Order saved, but invoice display failed.");
        }
    }, 100);
}

function printInvoice(sale) {
    const htmlContent = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <h2 style="font-size: 1.25rem; font-weight: bold;">${pharmacySettings.pharmacyName || 'PharmaOne'}</h2>
            <p style="font-size: 0.75rem; color: #64748b;">${pharmacySettings.address || 'Address'}</p>
            <p style="font-size: 0.75rem; color: #64748b;">Lic: ${pharmacySettings.license || '-'}</p>
        </div>
        <div style="margin-bottom: 1rem; font-size: 0.75rem; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between;"><span>Date:</span> <span>${new Date(sale.timestamp).toLocaleString()}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Invoice:</span> <span>#${sale.id}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Customer:</span> <span>${sale.customerName}</span></div>
        </div>
        <table style="width: 100%; font-size: 0.75rem; margin-bottom: 1rem; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
                    <th style="padding: 4px 0;">Item</th>
                    <th style="padding: 4px 0; text-align: right;">Qty</th>
                    <th style="padding: 4px 0; text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${sale.items.map(item => `
                    <tr>
                        <td style="padding: 4px 0;">${item.name}</td>
                        <td style="padding: 4px 0; text-align: right;">${item.qty}</td>
                        <td style="padding: 4px 0; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="padding: 4px 0;">Taxable Amount</td>
                    <td></td>
                    <td style="padding: 4px 0; text-align: right;">₹${(sale.taxableAmount || sale.total).toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;">GST Amount</td>
                    <td></td>
                    <td style="padding: 4px 0; text-align: right;">₹${(sale.totalTax || 0).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #000; font-weight: bold;">
                    <td style="padding: 8px 0; font-size: 1rem;">Net Total</td>
                    <td></td>
                    <td style="padding: 8px 0; text-align: right; font-size: 1rem;">₹${sale.total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        <div style="text-align: center; font-size: 0.75rem; color: #94a3b8; margin-top: 1rem;">
            <p>Thank you for your purchase!</p>
        </div>
    `;

    const overlay = document.getElementById('invoice-modal-overlay');
    const content = document.getElementById('invoice-modal-content');
    const preview = document.getElementById('invoice-preview-area');
    const printBtn = document.getElementById('btn-print-invoice-modal');

    if (!overlay) {
        injectInvoiceModal();
    }

    if (overlay && preview) {
        preview.innerHTML = htmlContent;

        if (printBtn) {
            printBtn.onclick = () => {
                const popup = window.open('', '_blank', 'width=400,height=600');
                if (popup) {
                    popup.document.write('<html><head><title>Invoice</title><style>body{font-family:monospace;padding:20px;}</style></head><body>' + htmlContent + '<script>window.print();window.close();<\/script></body></html>');
                    popup.document.close();
                } else {
                    alert("Popup blocked. Please allow popups.");
                }
            };
        }

        overlay.classList.remove('hidden');
        void overlay.offsetWidth;
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        if (content) {
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }
    }
}

function printInvoiceById(id) {
    const sale = salesData.find(s => s.id === id);
    if (sale) printInvoice(sale);
}

function renderStaffDashboard() {
    const view = document.getElementById('view-staff');
    if (!view) return;

    const tabs = [
        { id: 'overview', name: 'Overview' },
        { id: 'attendance', name: 'Attendance' },
        { id: 'leaves', name: 'Leave Management' },
        { id: 'shifts', name: 'Shift Planner' },
        { id: 'payroll', name: 'Payroll' },
    ];

    // Render tabs
    const tabsContainer = document.getElementById('staff-tabs');
    tabsContainer.innerHTML = tabs.map(tab => `
        <button onclick="switchStaffTab('${tab.id}')" 
                class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${currentStaffTab === tab.id
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}">
            ${tab.name}
        </button>
    `).join('');

    // Hide all content sections
    view.querySelectorAll('[id$="-content"]').forEach(el => el.classList.add('hidden'));

    // Show the active one and render its content
    const activeContent = document.getElementById(`staff-${currentStaffTab}-content`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        switch (currentStaffTab) {
            case 'overview':
                renderStaffOverview(activeContent);
                break;
            case 'attendance':
                renderAttendanceTable(activeContent);
                break;
            case 'leaves':
                renderLeaveTable(activeContent);
                break;
            case 'shifts':
                renderShiftPlanner(activeContent);
                break;
            case 'payroll':
                renderPayrollTable(activeContent);
                break;
        }
    }
    lucide.createIcons();
}

function switchStaffTab(tabId) {
    currentStaffTab = tabId;
    renderStaffDashboard();
}

// --- Inventory Logistics Logic ---

function switchInventoryTab(tabId) {
    currentInventoryTab = tabId;
    updateInventoryTabsUI();
    const contents = document.querySelectorAll('.inventory-tab-content');
    contents.forEach(c => c.classList.add('hidden'));

    const active = document.getElementById(`inventory-${tabId}-content`);
    if (active) {
        active.classList.remove('hidden');
        if (tabId === 'stock') renderInventoryTable();
        else if (tabId === 'defects') renderDefectsTable(active);
        else if (tabId === 'credits') renderCreditsTable(active);
    }
}

function updateInventoryTabsUI() {
    const tabs = document.querySelectorAll('.inventory-tab');
    tabs.forEach(t => {
        if (t.dataset.tab === currentInventoryTab) {
            t.classList.add('border-blue-600', 'text-blue-600');
            t.classList.remove('border-transparent', 'text-slate-500');
        } else {
            t.classList.remove('border-blue-600', 'text-blue-600');
            t.classList.add('border-transparent', 'text-slate-500');
        }
    });
}

function renderDefectsTable(container) {
    container.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 class="font-bold text-slate-800 dark:text-white">Defective Items & Returns</h3>
                <p class="text-xs text-slate-500 mt-1">Items marked as defective for return to supplier.</p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th class="px-6 py-3">Medicine</th>
                            <th class="px-6 py-3">Qty</th>
                            <th class="px-6 py-3">Reason</th>
                            <th class="px-6 py-3">Date Marked</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                        ${defectiveData.length === 0 ? '<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">No defective items found.</td></tr>' :
            defectiveData.map(d => `
                            <tr>
                                <td class="px-6 py-4 font-medium text-slate-800 dark:text-white">${d.name}</td>
                                <td class="px-6 py-4">${d.qty}</td>
                                <td class="px-6 py-4 text-orange-600">${d.reason}</td>
                                <td class="px-6 py-4 text-slate-500">${new Date(d.date).toLocaleDateString()}</td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="resolveDefect(${d.id})" class="text-blue-600 hover:underline text-xs">Resolve / Returned</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCreditsTable(container) {
    container.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-slate-800 dark:text-white">Supplier Credits</h3>
                    <p class="text-xs text-slate-500 mt-1">Pending credits from suppliers for returns.</p>
                </div>
                <button onclick="addSupplierCredit()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold border">Record New Credit</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th class="px-6 py-3">Supplier</th>
                            <th class="px-6 py-3">Credit Amount</th>
                            <th class="px-6 py-3">Valid Till</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                        ${supplierCredits.length === 0 ? '<tr><td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">No supplier credits recorded.</td></tr>' :
            supplierCredits.map(c => `
                            <tr>
                                <td class="px-6 py-4 font-medium text-slate-800 dark:text-white">${c.supplier}</td>
                                <td class="px-6 py-4 font-bold text-green-600">₹${c.amount}</td>
                                <td class="px-6 py-4 text-slate-500">${c.expiry || 'No Expiry'}</td>
                                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 font-bold">ACTIVE</span></td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="useCredit(${c.id})" class="text-red-500 hover:underline text-xs">Mark Used</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function markAsDefective(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;

    const qty = prompt(`How many units of ${item.name} are defective? (Available: ${item.stock})`, "1");
    if (!qty) return;

    const qtyNum = parseInt(qty);
    if (isNaN(qtyNum) || qtyNum <= 0 || qtyNum > item.stock) {
        alert("Invalid quantity.");
        return;
    }

    const reason = prompt("Reason for defect/return?", "Damaged Packaging / Expired");
    if (!reason) return;

    // Deduct from stock
    item.stock -= qtyNum;
    if (item.stock === 0) item.status = 'Out of Stock';

    // Log defect
    defectiveData.push({
        id: Date.now(),
        itemId: item.id,
        name: item.name,
        qty: qtyNum,
        reason: reason,
        date: new Date().toISOString()
    });

    saveData();
    alert("Item marked for return successfully.");
}

function resolveDefect(id) {
    if (confirm("Mark this defect as resolved/returned to supplier?")) {
        defectiveData = defectiveData.filter(d => d.id !== id);
        saveData();
        switchInventoryTab('defects');
    }
}

function addSupplierCredit() {
    const supplier = prompt("Supplier Name?");
    if (!supplier) return;
    const amount = prompt("Credit Amount (₹)?");
    if (!amount) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return alert("Invalid amount.");

    supplierCredits.push({
        id: Date.now(),
        supplier: supplier,
        amount: amountNum,
        expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 90 days valid
        status: 'Active'
    });

    saveData();
    switchInventoryTab('credits');
}

function useCredit(id) {
    if (confirm("Mark this supplier credit as used?")) {
        supplierCredits = supplierCredits.filter(c => c.id !== id);
        saveData();
        switchInventoryTab('credits');
    }
}

function renderStaffOverview(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Staff Overview</h2>
            <button onclick="openAddStaffModal()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <i data-lucide="user-plus" class="h-4 w-4"></i> Add Staff
            </button>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="staff-grid">
            ${staffData.map(staff => `
                <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                        ${staff.name.charAt(0)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-slate-800 dark:text-white truncate">${staff.name}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400 truncate">${staff.role}</p>
                    </div>
                    <div class="ml-auto flex gap-2 shrink-0">
                        <button onclick="editStaff(${staff.id})" class="text-slate-400 hover:text-blue-500">
                            <i data-lucide="pencil" class="h-4 w-4"></i>
                        </button>
                        <button onclick="deleteStaff(${staff.id})" class="text-slate-400 hover:text-red-500">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons();
}

function renderAttendanceTable(container) {
    // Fix: Use local date instead of UTC to ensure "Today" matches user's local day
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Today's Attendance (${now.toLocaleDateString()})</h2>
            <button onclick="markAllPresent()" class="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-medium">Mark All Present</button>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                        <tr>
                            <th class="px-6 py-3 whitespace-nowrap">Staff Member</th>
                            <th class="px-6 py-3 whitespace-nowrap">Status</th>
                            <th class="px-6 py-3 whitespace-nowrap">In Time</th>
                            <th class="px-6 py-3 whitespace-nowrap">Out Time</th>
                            <th class="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                        ${staffData.map(staff => {
        const attendance = attendanceData.find(a => a.staffId === staff.id && a.date === today);
        const status = attendance ? attendance.status : 'Not Marked';
        const inTime = attendance ? attendance.inTime : '-';
        const outTime = attendance ? attendance.outTime : '-';

        let statusBadge = '';
        if (status === 'Present') statusBadge = 'bg-green-100 text-green-700';
        else if (status === 'Absent') statusBadge = 'bg-red-100 text-red-700';
        else if (status === 'On Leave') statusBadge = 'bg-yellow-100 text-yellow-700';
        else statusBadge = 'bg-slate-100 text-slate-700';

        let actionsHtml = '';
        if (status === 'Not Marked') {
            actionsHtml = `
                                    <div class="flex justify-end gap-2">
                                        <button onclick="markAttendance(${staff.id}, 'Present')" class="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">Present</button>
                                        <button onclick="markAttendance(${staff.id}, 'Absent')" class="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">Absent</button>
                                        <button onclick="markAttendance(${staff.id}, 'On Leave')" class="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors">Leave</button>
                                    </div>
                                `;
        } else if (status === 'Present') {
            if (outTime === '-' || !outTime) {
                actionsHtml = `<button onclick="clockOut(${staff.id})" class="px-3 py-1 text-xs font-medium bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">Clock Out</button>`;
            } else {
                actionsHtml = `<span class="text-xs text-slate-500 mr-2">Completed</span> <button onclick="markAttendance(${staff.id}, null)" class="text-xs text-red-500 hover:underline">Reset</button>`;
            }
        } else {
            actionsHtml = `<button onclick="markAttendance(${staff.id}, null)" class="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 underline">Reset</button>`;
        }

        return `
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <td class="px-6 py-4 font-medium text-slate-800 dark:text-white whitespace-nowrap">${staff.name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusBadge}">${status}</span></td>
                                    <td class="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">${inTime}</td>
                                    <td class="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">${outTime}</td>
                                    <td class="px-6 py-4 text-right">
                                        ${actionsHtml}
                                    </td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderLeaveTable(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Leave Requests</h2>
            <button onclick="requestLeave()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <i data-lucide="plus" class="h-4 w-4"></i> Request Leave
            </button>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                    <tr>
                        <th class="px-6 py-3">Staff Member</th>
                        <th class="px-6 py-3">Type</th>
                        <th class="px-6 py-3">Dates</th>
                        <th class="px-6 py-3">Reason</th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    ${leaveData.length === 0 ? `<tr><td colspan="6" class="text-center py-8 text-slate-400">No leave requests found.</td></tr>` : ''}
                    ${[...leaveData].reverse().map(leave => {
        const staff = staffData.find(s => s.id === leave.staffId);

        let statusBadge = '';
        if (leave.status === 'Approved') statusBadge = 'bg-green-100 text-green-700';
        else if (leave.status === 'Rejected') statusBadge = 'bg-red-100 text-red-700';
        else statusBadge = 'bg-yellow-100 text-yellow-700';

        return `
                            <tr>
                                <td class="px-6 py-4 font-medium text-slate-800 dark:text-white">${staff ? staff.name : 'Unknown Staff'}</td>
                                <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${leave.type}</td>
                                <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${leave.startDate} to ${leave.endDate}</td>
                                <td class="px-6 py-4 text-slate-500 dark:text-slate-400">${leave.reason}</td>
                                <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusBadge}">${leave.status}</span></td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    ${leave.status === 'Pending' ? `
                                        <button onclick="updateLeaveStatus(${leave.id}, 'Approved')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                                        <button onclick="updateLeaveStatus(${leave.id}, 'Rejected')" class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                                    ` : '-'}
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderShiftPlanner(container) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shiftOptions = ['Morning (9-5)', 'Evening (1-9)', 'Night (9-9)', 'Off'];

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Weekly Shift Planner</h2>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                    <tr>
                        <th class="px-4 py-3">Staff Member</th>
                        ${days.map(day => `<th class="px-4 py-3 text-center">${day}</th>`).join('')}
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    ${staffData.map(staff => {
        const staffShifts = shiftData.find(s => s.staffId === staff.id)?.schedule || {};
        return `
                            <tr>
                                <td class="px-4 py-3 font-medium text-slate-800 dark:text-white">${staff.name}</td>
                                ${days.map(day => `
                                    <td class="px-2 py-2">
                                        <select onchange="updateShift(${staff.id}, '${day}', this.value)" class="w-full p-1 border-slate-200 rounded text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600">
                                            ${shiftOptions.map(opt => `<option value="${opt}" ${staffShifts[day] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                                        </select>
                                    </td>
                                `).join('')}
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderPayrollTable(container) {
    const date = new Date();
    const currentMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Payroll - ${currentMonth}</h2>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-700 text-xs uppercase text-slate-500 dark:text-slate-300">
                    <tr>
                        <th class="px-6 py-3">Staff Member</th>
                        <th class="px-6 py-3">Role</th>
                        <th class="px-6 py-3">Base Salary</th>
                        <th class="px-6 py-3">Status</th>
                        <th class="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                    ${staffData.map(staff => {
        const isPaid = payrollData.some(p => p.staffId === staff.id && p.month === currentMonth);
        return `
                            <tr>
                                <td class="px-6 py-4 font-medium text-slate-800 dark:text-white">${staff.name}</td>
                                <td class="px-6 py-4 text-slate-500">${staff.role}</td>
                                <td class="px-6 py-4 font-mono">₹${(staff.salary || 0).toLocaleString()}</td>
                                <td class="px-6 py-4">
                                    ${isPaid
                ? '<span class="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">PAID</span>'
                : '<span class="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">PENDING</span>'}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    ${isPaid
                ? `<span class="text-xs text-slate-400">Processed</span>`
                : `<button onclick="processPayment(${staff.id}, '${currentMonth}', ${staff.salary || 0})" class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Pay Now</button>`}
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- Logic & Interactions ---

function switchView(viewId, viewName) {
    currentView = viewId;
    renderSidebar();
    document.getElementById('page-title').textContent = viewId === 'dashboard' ? 'Dashboard Overview' : viewName;

    const dashboardView = document.getElementById('view-dashboard');
    const inventoryView = document.getElementById('view-inventory');
    const salesView = document.getElementById('view-sales');
    const staffView = document.getElementById('view-staff');
    const profileView = document.getElementById('view-profile');
    const settingsView = document.getElementById('view-settings');
    const catalogueView = document.getElementById('view-catalogue');
    const transactionsView = document.getElementById('view-transactions');
    const customersView = document.getElementById('view-customers');
    const expensesView = document.getElementById('view-expenses');

    // Hide all views first
    [dashboardView, inventoryView, salesView, staffView, profileView, settingsView, catalogueView, transactionsView, customersView, expensesView].forEach(v => {
        if (v) v.classList.add('hidden');
    });

    if (viewId === 'dashboard') { dashboardView.classList.remove('hidden'); renderStats(); renderDashboardTable(); }
    else if (viewId === 'inventory') { inventoryView.classList.remove('hidden'); renderInventoryTable(); }
    else if (viewId === 'sales') { salesView.classList.remove('hidden'); renderSalesInterface(); }
    else if (viewId === 'staff') { staffView.classList.remove('hidden'); renderStaffDashboard(); }
    else if (viewId === 'profile') { profileView.classList.remove('hidden'); renderProfile(); }
    else if (viewId === 'settings') { settingsView.classList.remove('hidden'); renderSettingsForm(); }
    else if (viewId === 'catalogue') {
        const v = document.getElementById('view-catalogue');
        if (!v) injectCatalogueView();
        document.getElementById('view-catalogue').classList.remove('hidden');
        renderCatalogue();
    }
    else if (viewId === 'transactions') {
        transactionsView.classList.remove('hidden');
        renderTransactions();
    }
    else if (viewId === 'customers') {
        if (customersView) {
            customersView.classList.remove('hidden');
            renderCustomers();
        }
    }
    else if (viewId === 'expenses') {
        if (expensesView) {
            expensesView.classList.remove('hidden');
            renderExpenses();
        }
    }

    if (window.innerWidth < 768) toggleSidebar(false);
}

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (show) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
}

// --- Auto Order Logic ---
function triggerAutoOrder() {
    let orderedCount = 0;
    let totalCost = 0;
    const reorderedItems = [];

    inventoryData = inventoryData.map(item => {
        if (item.stock < 10) {
            orderedCount++;
            const qtyToAdd = 50;
            totalCost += item.price * qtyToAdd;
            reorderedItems.push({ ...item, qty: qtyToAdd });
            return { ...item, stock: item.stock + qtyToAdd, status: 'In Stock' }; // Auto add 50 items
        }
        return item;
    });

    if (orderedCount > 0) {
        saveData();
        alert(`Auto-Order Successful! Restocked ${orderedCount} low-stock medicines.`);
    } else {
        alert('Stock levels are healthy. No reorder needed.');
    }
}

// --- POS Logic ---


function openAddStaffModal() {
    document.getElementById('add-staff-form').reset();
    document.getElementById('add-staff-form').querySelector('[name="id"]').value = '';
    document.getElementById('staff-modal-title').textContent = 'Add Staff Member';
    toggleStaffModal(true);
}

// --- Modal Logic ---
function toggleModal(show) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');

    if (show) {
        overlay.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        // Fix: Prevent modal from going out of screen on small devices
        content.style.maxHeight = '90vh';
        content.style.overflowY = 'auto';
        setTimeout(() => {
            if (!title.textContent.includes('Edit')) title.textContent = 'Add New Medicine';
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 200); // Match transition duration
    }
}

function toggleStaffModal(show) {
    const overlay = document.getElementById('staff-modal-overlay');
    const content = document.getElementById('staff-modal-content');
    const title = document.getElementById('staff-modal-title');

    if (show) {
        overlay.classList.remove('hidden');
        // Fix: Prevent modal from going out of screen on small devices
        content.style.maxHeight = '90vh';
        content.style.overflowY = 'auto';
        setTimeout(() => {
            if (!title.textContent.includes('Edit')) title.textContent = 'Add Staff Member';
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 200);
    }
}

function toggleLeaveModal(show) {
    const overlay = document.getElementById('leave-modal-overlay');
    const content = document.getElementById('leave-modal-content');

    if (show) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 200);
    }
}

function handleAddItem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const newItem = {
        id: id ? parseInt(id) : Date.now(),
        name: formData.get('name'),
        category: formData.get('category') || 'Medicines',
        label: formData.get('label'),
        rx: formData.get('rx') === 'true',
        shelf: formData.get('shelf'),
        supplier: formData.get('supplier') || '-',
        batchNumber: formData.get('batchNumber') || 'xxxxx',
        purchaseDate: formData.get('purchaseDate') || 'xxxxx',
        mfgDate: formData.get('mfgDate') || 'xxxxx',
        expDate: formData.get('expDate') || 'xxxxx',
        description: formData.get('description'),
        costPrice: parseFloat(formData.get('costPrice')) || 0,
        price: parseFloat(formData.get('price')) || 0,
        tax: parseInt(formData.get('tax')) || 0,
        stock: parseInt(formData.get('stock')) || 0,
        status: formData.get('status'),
        image: formData.get('image') || ''
    };

    if (id) {
        const index = inventoryData.findIndex(i => i.id === parseInt(id));
        if (index !== -1) inventoryData[index] = newItem;
    } else {
        inventoryData.unshift(newItem);
    }
    saveData();

    // Auto-record expense if it's a new item with stock
    if (!id && newItem.costPrice > 0 && newItem.stock > 0) {
        autoRecordExpense(`Stock Purchase: ${newItem.name}`, 'Stock', newItem.costPrice * newItem.stock);
    }

    toggleModal(false);
    e.target.reset();
}

function handleAddStaff(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    // Default credentials for new users
    let username = formData.get('name').split(' ')[0].toLowerCase();
    let password = '123';

    // If editing, preserve existing credentials
    if (id) {
        const existingStaff = staffData.find(s => s.id === parseInt(id));
        if (existingStaff) {
            username = existingStaff.username;
            password = existingStaff.password;
        }
    }

    const newStaff = {
        id: id ? parseInt(id) : Date.now(),
        name: formData.get('name'),
        role: formData.get('role'),
        username: username,
        password: password,
        salary: 50000 // Default salary
    };

    if (id) {
        const index = staffData.findIndex(s => s.id === parseInt(id));
        if (index !== -1) staffData[index] = newStaff;
    } else {
        staffData.push(newStaff);
    }
    saveData();
    toggleStaffModal(false);
    e.target.reset();
}

function handleLeaveRequest(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const staffId = parseInt(formData.get('staffId'));
    const type = formData.get('type');
    const days = parseInt(formData.get('days'));
    const reason = formData.get('reason');

    const now = new Date();
    const startDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const end = new Date(now);
    end.setDate(end.getDate() + days);
    const endDate = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    leaveData.push({
        id: Date.now(),
        staffId,
        type,
        startDate,
        endDate,
        reason,
        status: 'Pending'
    });
    saveData();
    toggleLeaveModal(false);
    renderStaffDashboard();
    e.target.reset();
}

function handleSaveSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    pharmacySettings.license = formData.get('license');
    pharmacySettings.pharmacyName = formData.get('pharmacyName');
    pharmacySettings.address = formData.get('address');
    saveData();
    alert('Settings saved successfully!');
}

function renderProfile() {
    const container = document.getElementById('view-profile');
    if (!container || !currentUser) return;

    container.innerHTML = `
        <div class="max-w-2xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h2>
            
            <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div class="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
                        ${currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="text-center sm:text-left space-y-1 w-full">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-white">${currentUser.name}</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${currentUser.role}</p>
                        <div class="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start gap-y-2 gap-x-4 text-xs text-slate-400">
                            <span class="flex items-center gap-1"><i data-lucide="mail" class="h-3 w-3 shrink-0"></i> <span class="break-all">${currentUser.email || 'xxxxx@gmail.com'}</span></span>
                            <span class="flex items-center gap-1"><i data-lucide="phone" class="h-3 w-3 shrink-0"></i> ${currentUser.phone || 'xxxx'}</span>
                            <span class="flex items-center gap-1"><i data-lucide="hash" class="h-3 w-3 shrink-0"></i> EMP-${currentUser.id.toString().padStart(3, '0')}</span>
                            <span class="flex items-center gap-1"><i data-lucide="calendar" class="h-3 w-3 shrink-0"></i> Joined: ${currentUser.joinDate || 'Jan 01, 2024'}</span>
                        </div>
                    </div>
                </div>

                <form onsubmit="handleChangePassword(event)" class="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h4 class="font-medium text-slate-900 dark:text-white">Change Password</h4>
                    <div class="grid gap-4 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                            <input type="password" name="newPassword" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                            <input type="password" name="confirmPassword" required class="w-full rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        </div>
                    </div>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function handleChangePassword(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPass = formData.get('newPassword');
    const confirmPass = formData.get('confirmPassword');

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    if (newPass.length < 3) {
        alert("Password is too weak (min 3 chars).");
        return;
    }

    // Update in staffData
    const userIndex = staffData.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        staffData[userIndex].password = newPass;
        currentUser.password = newPass;
        localStorage.setItem('pharma_user', JSON.stringify(currentUser));
        saveData();
        alert("Password updated successfully!");
        e.target.reset();
    } else {
        alert("Error: User not found in database.");
    }
}

function editInventoryItem(id) {
    const item = inventoryData.find(i => i.id === id);
    if (!item) return;

    const form = document.getElementById('add-item-form');
    form.reset();

    // Populate form fields
    form.querySelector('[name="id"]').value = item.id;
    form.querySelector('[name="name"]').value = item.name;
    form.querySelector('[name="description"]').value = item.description || '';
    form.querySelector('[name="label"]').value = item.label;
    form.querySelector('[name="rx"]').value = item.rx.toString();
    form.querySelector('[name="shelf"]').value = item.shelf;
    form.querySelector('[name="supplier"]').value = item.supplier || '';
    form.querySelector('[name="batchNumber"]').value = item.batchNumber || '';
    form.querySelector('[name="purchaseDate"]').value = item.purchaseDate || '';
    form.querySelector('[name="mfgDate"]').value = item.mfgDate || '';
    form.querySelector('[name="expDate"]').value = item.expDate || '';
    form.querySelector('[name="category"]').value = item.category || 'Medicines';
    form.querySelector('[name="costPrice"]').value = item.costPrice || 0;
    form.querySelector('[name="price"]').value = item.price;
    form.querySelector('[name="stock"]').value = item.stock;
    form.querySelector('[name="status"]').value = item.status;
    if (form.querySelector('[name="image"]')) form.querySelector('[name="image"]').value = item.image || '';

    document.getElementById('modal-title').textContent = 'Edit Medicine';
    toggleModal(true);
}

function editStaff(id) {
    const staff = staffData.find(s => s.id === id);
    if (!staff) return;

    const form = document.getElementById('add-staff-form');
    form.reset();
    form.querySelector('[name="id"]').value = staff.id;
    form.querySelector('[name="name"]').value = staff.name;
    form.querySelector('[name="role"]').value = staff.role;

    document.getElementById('staff-modal-title').textContent = 'Edit Staff';
    toggleStaffModal(true);
}

function deleteInventoryItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventoryData = inventoryData.filter(item => item.id !== id);
        saveData();
    }
}



function deleteStaff(id) {
    if (confirm('Remove this staff member?')) {
        const staffToDelete = staffData.find(s => s.id === id);
        if (!staffToDelete) return;

        // Prevent deleting the currently logged-in user
        if (currentUser && currentUser.id === id) {
            alert("You cannot delete your own account while logged in.");
            return;
        }

        // Prevent deleting the last manager
        const managers = staffData.filter(s => s.role === 'Manager');
        if (staffToDelete.role === 'Manager' && managers.length <= 1) {
            alert("You cannot delete the last manager account.");
            return;
        }

        staffData = staffData.filter(s => s.id !== id);
        saveData();
    }
}

// --- HR Helper Functions ---

function markAttendance(staffId, status) {
    // Fix: Use local date to match renderAttendanceTable
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Remove existing for today
    attendanceData = attendanceData.filter(a => !(a.staffId === staffId && a.date === today));

    if (status) {
        attendanceData.push({
            staffId,
            date: today,
            status,
            inTime: status === 'Present' ? timeString : '-',
            outTime: '-'
        });
    }
    saveData();
    renderStaffDashboard();
}

function clockOut(staffId) {
    // Fix: Use local date to match renderAttendanceTable
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const record = attendanceData.find(a => a.staffId === staffId && a.date === today);
    if (record && record.status === 'Present') {
        record.outTime = timeString;
        saveData();
        renderStaffDashboard();
    }
}

function markAllPresent() {
    staffData.forEach(s => markAttendance(s.id, 'Present'));
}

function requestLeave() {
    const select = document.getElementById('leave-staff-select');
    if (select) {
        select.innerHTML = staffData.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('');
    }
    toggleLeaveModal(true);
}

function updateLeaveStatus(id, status) {
    const leave = leaveData.find(l => l.id === id);
    if (leave) {
        leave.status = status;
        saveData();
        renderStaffDashboard();
    }
}

function updateShift(staffId, day, value) {
    let shift = shiftData.find(s => s.staffId === staffId);
    if (!shift) {
        shift = { staffId, schedule: {} };
        shiftData.push(shift);
    }
    shift.schedule[day] = value;
    saveData();
}

function processPayment(staffId, month, amount) {
    if (confirm(`Confirm payment of ₹${amount} for ${month}?`)) {
        payrollData.push({
            staffId, month, base: amount, bonus: 0, deductions: 0, status: 'Paid'
        });

        // Auto-record expense
        const staff = staffData.find(s => s.id === staffId);
        autoRecordExpense(`Salary: ${staff ? staff.name : 'Staff'} (${month})`, 'Payroll', amount);

        saveData();
        renderStaffDashboard();
    }
}

function autoRecordExpense(title, category, amount) {
    const exp = {
        id: Date.now(),
        title: title,
        category: category,
        amount: amount,
        date: new Date().toISOString()
    };
    expensesData.push(exp);
    // Note: saveData() should be called by the caller or we'll have redundant saves
}

// --- Data Management ---

function exportData() {
    const allData = {
        inventory: inventoryData,
        staff: staffData,
        sales: salesData,
        settings: pharmacySettings,
        attendance: attendanceData,
        leaves: leaveData,
        shifts: shiftData,
        payroll: payrollData
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaone_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('Are you sure you want to import data? This will overwrite all current data.')) {
        event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            inventoryData = importedData.inventory || defaultInventory;
            staffData = importedData.staff || defaultStaff;
            salesData = importedData.sales || [];
            pharmacySettings = importedData.settings || { license: '', pharmacyName: 'PharmaOne', address: '' };
            attendanceData = importedData.attendance || [];
            leaveData = importedData.leaves || [];
            shiftData = importedData.shifts || [];
            payrollData = importedData.payroll || [];

            await saveData();
            alert('Data imported successfully! The page will now reload.');
            location.reload();

        } catch (error) {
            alert('Error importing data. The file may be corrupted.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function resetData() {
    if (confirm('DANGER! This will delete ALL data and reset the application to its default state. Are you absolutely sure?')) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('pharma_')) {
                localStorage.removeItem(key);
            }
        });
        alert('Data has been reset. The application will now reload.');
        location.reload();
    }
}

// --- Catalogue Logic ---

function injectCatalogueView() {
    const dashboard = document.getElementById('view-dashboard');
    if (!dashboard || !dashboard.parentElement) return;

    const div = document.createElement('div');
    div.id = 'view-catalogue';
    div.className = 'hidden space-y-6';
    div.innerHTML = '<div id="catalogue-content"></div>';
    dashboard.parentElement.appendChild(div);
}

function renderCatalogue() {
    const container = document.getElementById('catalogue-content');
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Product Catalogue</h2>
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div class="relative w-full md:w-64">
                    <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"></i>
                    <input type="text" id="catalogue-search" placeholder="Search products..." 
                        class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        oninput="filterCatalogue()">
                </div>
                <select id="catalogue-filter-category" onchange="filterCatalogue()" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none">
                    <option value="">All Categories</option>
                    <option value="Adult">Adult</option>
                    <option value="Child">Child</option>
                    <option value="Infant">Infant</option>
                    <option value="General">General</option>
                </select>
            </div>
        </div>
        
        <div id="catalogue-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            ${generateCatalogueGrid(inventoryData)}
        </div>
    `;
    lucide.createIcons();
}

function generateCatalogueGrid(data) {
    if (data.length === 0) return `<div class="col-span-full text-center py-10 text-slate-400">No products found</div>`;

    return data.map(item => `
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div class="h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative">
                ${item.image ?
            `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">` :
            `<i data-lucide="image" class="h-12 w-12 text-slate-300 dark:text-slate-500"></i>`
        }
                <div class="absolute top-3 right-3">
                    <span class="px-2 py-1 text-xs font-bold rounded-full ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <div class="overflow-hidden">
                        <h3 class="font-bold text-slate-800 dark:text-white truncate" title="${item.name}">${item.name}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${item.supplier || 'Unknown Brand'}</p>
                    </div>
                    <span class="font-bold text-blue-600 whitespace-nowrap ml-2">₹${item.price}</span>
                </div>
                <div class="flex items-center gap-2 mb-3">
                    <span class="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">${item.label}</span>
                    ${item.rx ? '<span class="px-2 py-0.5 text-[10px] rounded bg-red-50 text-red-600 border border-red-100 font-bold">Rx</span>' : ''}
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">${item.description || 'No description available.'}</p>
                
                <div class="flex gap-2 mt-auto">
                    <button onclick="editInventoryItem(${item.id})" class="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-sm font-medium transition-colors">
                        Edit
                    </button>
                    <button onclick="addToCart(${item.id}); switchView('sales', 'Sales')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="shopping-cart" class="h-3 w-3"></i> Sell
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCatalogue() {
    const category = document.getElementById('catalogue-filter-category').value;
    const term = document.getElementById('catalogue-search').value.toLowerCase();

    const filtered = inventoryData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(term) ||
            (item.description && item.description.toLowerCase().includes(term)) ||
            (item.supplier && item.supplier.toLowerCase().includes(term));
        const matchesCategory = category === '' || item.label === category;

        return matchesSearch && matchesCategory;
    });

    document.getElementById('catalogue-grid').innerHTML = generateCatalogueGrid(filtered);
    lucide.createIcons();
}

function setupEventListeners() {
    // Auth
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Theme
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Mobile Menu
    document.getElementById('open-sidebar').addEventListener('click', () => toggleSidebar(true));
    document.getElementById('close-sidebar').addEventListener('click', () => toggleSidebar(false));
    document.getElementById('sidebar-overlay').addEventListener('click', () => toggleSidebar(false));

    // Inventory Modal
    document.getElementById('btn-close-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('btn-cancel-modal').addEventListener('click', () => toggleModal(false));
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') toggleModal(false);
    });
    document.getElementById('add-item-form').addEventListener('submit', handleAddItem);

    // Staff Modal
    document.getElementById('btn-close-staff-modal').addEventListener('click', () => toggleStaffModal(false));
    document.getElementById('btn-cancel-staff-modal').addEventListener('click', () => toggleStaffModal(false));
    document.getElementById('staff-modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'staff-modal-overlay') toggleStaffModal(false);
    });
    document.getElementById('add-staff-form').addEventListener('submit', handleAddStaff);

    // Leave Modal
    const btnCloseLeave = document.getElementById('btn-close-leave-modal');
    if (btnCloseLeave) btnCloseLeave.addEventListener('click', () => toggleLeaveModal(false));
    const btnCancelLeave = document.getElementById('btn-cancel-leave-modal');
    if (btnCancelLeave) btnCancelLeave.addEventListener('click', () => toggleLeaveModal(false));
    const leaveOverlay = document.getElementById('leave-modal-overlay');
    if (leaveOverlay) leaveOverlay.addEventListener('click', (e) => { if (e.target.id === 'leave-modal-overlay') toggleLeaveModal(false); });
    const leaveForm = document.getElementById('request-leave-form');
    if (leaveForm) leaveForm.addEventListener('submit', handleLeaveRequest);

    // Settings
    document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);

    // Data Management
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) exportBtn.addEventListener('click', exportData);

    const importInput = document.getElementById('import-file-input');
    if (importInput) importInput.addEventListener('change', importData);

    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) resetBtn.addEventListener('click', resetData);

    // Cloud Sync
    // Cloud Sync logic moved to global handleCloudConnect function
    /* 
    const btnConnect = document.getElementById('btn-connect-cloud');
    if (btnConnect) {
         // ... previously here
    }
    */
    // Cloud Sync logic moved to global handleCloudConnect function
    // (See below outside this function)
}

async function handleCloudConnect() {
    const url = document.getElementById('cloud-url').value;
    const key = document.getElementById('cloud-key').value;
    const status = document.getElementById('cloud-status');

    if (!url) return alert("Please enter the JSON Storage URL");

    if (url.includes('jsonbin.io') && !key) {
        if (!confirm("You are using JSONBin without a Key. If your bin is Private, this will fail. Continue?")) return;
    }

    status.textContent = "Connecting...";
    status.classList.remove('hidden');

    const result = await CloudService.connect(url, key);
    if (result.success) {
        status.textContent = "✅ Cloud Connected! Syncing data...";
        status.classList.remove('text-red-500');
        status.classList.add('text-green-500');
        await CloudService.syncLocalToCloud();
        CloudService.initRealtime();
        status.textContent = "✅ Cloud Active & Synced!";
        setTimeout(() => location.reload(), 2000);
    } else {
        status.textContent = "❌ Connection Failed: " + result.message;
        status.classList.add('text-red-500');
    }
}

// Load saved cloud credentials
const savedUrl = localStorage.getItem('pharma_cloud_url');
const savedKey = localStorage.getItem('pharma_cloud_key');
if (savedUrl && savedKey) {
    document.getElementById('cloud-url').value = savedUrl;
    document.getElementById('cloud-key').value = savedKey;
    CloudService.connect(savedUrl, savedKey).then(async res => {
        if (res.success) {
            await CloudService.pullCloudToLocal();
            CloudService.initRealtime();
        }
    });
}



// POS
const posSearch = document.getElementById('pos-search');
if (posSearch) {
    posSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('#pos-grid > div');
        let visibleCount = 0;

        items.forEach(item => {
            const nameText = item.querySelector('h4') ? item.querySelector('h4').textContent.toLowerCase() : '';
            const matches = nameText.includes(term);
            item.style.display = matches ? 'block' : 'none';
            if (matches) visibleCount++;
        });

        const grid = document.getElementById('pos-grid');
        let emptyMsg = document.getElementById('pos-empty-msg');
        if (visibleCount === 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('p');
                emptyMsg.id = 'pos-empty-msg';
                emptyMsg.className = 'col-span-full text-center py-10 text-slate-400 italic';
                emptyMsg.textContent = 'No medicines found matching your search.';
                grid.appendChild(emptyMsg);
            }
        } else if (emptyMsg) {
            emptyMsg.remove();
        }
    });
}

// Prescription Upload
const presInput = document.getElementById('prescription-upload');
if (presInput) {
    presInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedPrescription = event.target.result;

            const preview = document.getElementById('prescription-preview');
            const imgPreview = document.getElementById('prescription-img-preview');
            const filename = document.getElementById('prescription-filename');

            if (preview && imgPreview && filename) {
                imgPreview.src = uploadedPrescription;
                filename.textContent = file.name;
                preview.classList.remove('hidden');
            }

            renderSalesInterface();
        };
        reader.readAsDataURL(file);
    });
}

// Inventory Search
const invSearch = document.getElementById('inventory-search');
if (invSearch) {
    invSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventory-table-body tr');
        let visibleCount = 0;

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            const matches = text.includes(term);
            row.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        });

        const emptyState = document.getElementById('inventory-empty');
        if (visibleCount === 0) {
            emptyState.classList.remove('hidden');
            emptyState.querySelector('p').textContent = 'No matching medicines found.';
        } else {
            emptyState.classList.add('hidden');
        }
    });
}




function injectImageInputToForm() {
    const form = document.getElementById('add-item-form');
    if (!form || form.querySelector('[name="image"]')) return;

    const div = document.createElement('div');
    div.className = "col-span-full mt-2";
    div.innerHTML = `
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
        <div class="flex gap-2">
            <input type="url" name="image" id="item-image-url" placeholder="https://example.com/image.jpg" class="flex-1 rounded-lg border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <label class="cursor-pointer bg-slate-100 dark:bg-slate-600 p-2 rounded-lg border border-slate-200 dark:border-slate-500 hover:bg-slate-200 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                <i data-lucide="upload" class="h-4 w-4"></i>
                <input type="file" accept="image/*" class="hidden" onchange="const reader = new FileReader(); reader.onload = (e) => { document.getElementById('item-image-url').value = e.target.result; }; reader.readAsDataURL(this.files[0]);">
            </label>
        </div>
        <p class="text-[10px] text-slate-400 mt-1">Paste a URL or upload an image from your device.</p>
    `;

    // Insert before the buttons (usually the last element)
    const lastElement = form.lastElementChild;
    form.insertBefore(div, lastElement);
}

function isExpiringSoon(dateStr) {
    if (!dateStr || dateStr === 'xxxxx') return false;
    const expDate = new Date(dateStr);
    const today = new Date();
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30; // 30 days window
}
