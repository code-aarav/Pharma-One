// website.js - Frontend Logic

let inventory = [];
let cart = [];
let pharmacySettings = {
    license: '',
    pharmacyName: 'PharmaOne',
    address: ''
};

// --- Multi-Language Support ---
let currentLanguage = localStorage.getItem('pharma_lang') || 'en';
const translations = {
    en: {
        home: 'Home', medicines: 'Medicines', about: 'About', plans: 'Plans', contact: 'Contact', admin: 'Admin Panel',
        hero_title: 'Your Health, Our Priority.', hero_sub: 'Order medicines, supplements, and healthcare products from the comfort of your home.',
        shop_now: 'Shop Now', free_delivery: 'Free Delivery', orders_over: 'Orders over ₹500',
        secure_payment: 'Secure Payment', support: '24/7 Support', contact_us: 'Contact Us'
    },
    ar: {
        home: 'الرئيسية', medicines: 'الأدوية', about: 'من نحن', plans: 'الخطط', contact: 'اتصل بنا', admin: 'لوحة التحكم',
        hero_title: 'صحتك، أولويتنا.', hero_sub: 'اطلب الأدوية والمكملات ومنتجات الرعاية الصحية من منزلك بكل راحة.',
        shop_now: 'تسوق الآن', free_delivery: 'توصيل مجاني', orders_over: 'للطلبات فوق ٥٠٠ ر.س',
        secure_payment: 'دفع آمن', support: 'دعم ٢٤/٧', contact_us: 'اتصل بنا'
    },
    es: {
        home: 'Inicio', medicines: 'Medicinas', about: 'Nosotros', plans: 'Planes', contact: 'Contacto', admin: 'Panel Admin',
        hero_title: 'Su Salud, Nuestra Prioridad.', hero_sub: 'Pida medicinas, suplementos y productos de salud desde la comodidad de su hogar.',
        shop_now: 'Comprar Ahora', free_delivery: 'Envío Gratis', orders_over: 'Pedidos de más de ₹500',
        secure_payment: 'Pago Seguro', support: 'Soporte 24/7', contact_us: 'Contáctenos'
    },
    fr: {
        home: 'Accueil', medicines: 'Médicaments', about: 'À Propos', plans: 'Plans', contact: 'Contact', admin: 'Admin',
        hero_title: 'Votre Santé, Notre Priorité.', hero_sub: 'Commandez des médicaments, des compléments et des produits de santé depuis chez vous.',
        shop_now: 'Acheter Maintenant', free_delivery: 'Livraison Gratuite', orders_over: 'Commandes supérieures à ₹500',
        secure_payment: 'Paiement Sécurisé', support: 'Support 24/7', contact_us: 'Contactez-nous'
    },
    hi: {
        home: 'होम', medicines: 'दवाएं', about: 'हमारे बारे में', plans: 'योजनाएं', contact: 'संपर्क', admin: 'एडमिन पैनल',
        hero_title: 'आपका स्वास्थ्य, हमारी प्राथमिकता।', hero_sub: 'अपने घर के आराम से दवाएं, सप्लीमेंट और स्वास्थ्य उत्पाद ऑर्डर करें।',
        shop_now: 'अभी खरीदें', free_delivery: 'मुफ्त डिलीवरी', orders_over: '₹500 से अधिक के ऑर्डर',
        secure_payment: 'सुरक्षित भुगतान', support: '24/7 सहायता', contact_us: 'संपर्क करें'
    },
    zh: {
        home: '首页', medicines: '药品', about: '关于我们', plans: '计划', contact: '联系我们', admin: '管理面板',
        hero_title: '您的健康，我们的优先。', hero_sub: '在舒适的家中订购药品、补充剂和医疗保健产品。',
        shop_now: '立即购买', free_delivery: '免费送货', orders_over: '订单满 ₹500',
        secure_payment: '安全支付', support: '24/7 支持', contact_us: '联系我们'
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
    // Nav
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length >= 5) {
        navLinks[0].textContent = t('home');
        navLinks[1].textContent = t('medicines');
        navLinks[2].textContent = t('about');
        navLinks[3].textContent = t('plans');
        navLinks[4].textContent = t('contact');
        if (navLinks[5]) navLinks[5].textContent = t('admin');
    }

    // Hero
    const heroH1 = document.querySelector('.bg-blue-600 h1');
    if (heroH1) heroH1.innerHTML = t('hero_title').replace(', ', ', <br>');
    const heroP = document.querySelector('.bg-blue-600 p');
    if (heroP) heroP.textContent = t('hero_sub');
    const heroA = document.querySelector('.bg-blue-600 a');
    if (heroA) heroA.textContent = t('shop_now');

    // Features
    const featureTitles = document.querySelectorAll('.grid-cols-1 h4');
    if (featureTitles.length >= 4) {
        featureTitles[0].textContent = t('free_delivery');
        featureTitles[1].textContent = t('secure_payment');
        featureTitles[2].textContent = t('support');
        featureTitles[3].textContent = t('contact_us');
    }

    document.getElementById('language-selector').value = currentLanguage;

    if (currentLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
}

// --- Cloud Connectivity (Supabase) ---
let supabaseClient = null;
const CloudService = {
    async init() {
        const url = localStorage.getItem('pharma_cloud_url');
        const key = localStorage.getItem('pharma_cloud_key');
        if (url && key) {
            try {
                supabaseClient = supabase.createClient(url, key);
                console.log("Website connected to Cloud.");
                // Overwrite local data with cloud data
                const { data: inv } = await supabaseClient.from('inventory').select('*');
                if (inv) inventory = inv;
                renderProducts();
            } catch (e) {
                console.error("Cloud failed, staying local.");
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    loadData();
    await CloudService.init();

    // Auto-detect category from page title and render
    const pageTitle = document.title.toLowerCase();
    let filterCategory = '';
    if (pageTitle.includes('ayurveda')) filterCategory = 'Ayurveda';
    else if (pageTitle.includes('baby')) filterCategory = 'Baby Care';
    else if (pageTitle.includes('fitness')) filterCategory = 'Fitness';
    else if (pageTitle.includes('personal')) filterCategory = 'Personal Care';
    else if (pageTitle.includes('devices')) filterCategory = 'Devices';
    else if (pageTitle.includes('medicines')) filterCategory = 'Medicines';

    if (filterCategory) {
        renderProductsByCategory(filterCategory);
    } else {
        renderProducts();
    }

    applyTranslations();
    lucide.createIcons();

    document.getElementById('search-input').addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

function loadData() {
    // Try to load from the same LocalStorage key as the admin panel
    const storedData = localStorage.getItem('pharma_inventory');
    if (storedData) {
        inventory = JSON.parse(storedData);
    } else {
        // Fallback if no data exists yet
        inventory = [];
        document.getElementById('product-grid').innerHTML = `
            <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
                <p class="text-slate-500">No products available. Please add products in the Admin Panel.</p>
            </div>
        `;
        return;
    }

    const storedSettings = localStorage.getItem('pharma_settings');
    if (storedSettings) {
        pharmacySettings = JSON.parse(storedSettings);
    }

    renderProducts();
}

function getMedicineImage(name, description = '') {
    const lowerName = name.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();

    if (lowerName.includes('syrup') || lowerName.includes('liquid') || lowerName.includes('suspension') || lowerName.includes('drop') || lowerName.includes('bottle') || lowerName.includes('oil') || lowerName.includes('wash') || lowerName.includes('lotion')) {
        return 'd.png'; // Bottle
    } else if (lowerName.includes('tablet') || lowerName.includes('tab') || lowerName.includes('strip') || lowerName.includes('pills')) {
        return 'c.png'; // Blister pack
    } else {
        return 'b.png'; // Capsule (Default)
    }
}

function renderProducts(searchTerm = '') {
    const container = document.getElementById('product-grid');
    const term = searchTerm.toLowerCase();

    const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No products found matching "${searchTerm}"</div>`;
        return;
    }

    container.innerHTML = filtered.map(item => {
        const imageSrc = item.image || getMedicineImage(item.name, item.description);
        return `
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
            <div class="h-48 bg-slate-100 relative overflow-hidden">
                <img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                ${item.stock <= 0 ? '<div class="absolute inset-0 bg-white/60 flex items-center justify-center"><span class="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span></div>' : ''}
            </div>
            <div class="p-5 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">${item.label || 'General'}</span>
                            ${item.rx ? '<span class="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1"><i data-lucide="alert-circle" class="h-2 w-2"></i> Rx</span>' : ''}
                        </div>
                        <h3 class="font-bold text-slate-800 mt-2 text-lg leading-tight">${item.name}</h3>
                    </div>
                    <span class="font-bold text-slate-900 text-lg">₹${item.price}</span>
                </div>
                <p class="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">${item.description || 'No description available.'}</p>
                
                <button onclick="addToCart(${item.id})" ${item.stock <= 0 ? 'disabled' : ''} 
                    class="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <i data-lucide="shopping-cart" class="h-4 w-4"></i> Add to Cart
                </button>
            </div>
        </div>
    `
    }).join('');

    lucide.createIcons();
}

// --- Cart Logic ---

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

function renderProductsByCategory(category) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = inventory.filter(item => item.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <i data-lucide="package-search" class="h-12 w-12 text-slate-300 mx-auto mb-4"></i>
                <p class="text-slate-500 font-medium">No real products found in ${category} category yet.</p>
                <p class="text-xs text-slate-400 mt-1">Add items in the Admin Dashboard to see them here.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
            <div class="relative h-48 bg-slate-100">
                <img src="${item.image || 'https://placehold.co/300x300/e2e8f0/1e293b?text=' + encodeURIComponent(item.name)}" class="w-full h-full object-cover">
                <button onclick="addToCart(${item.id})" class="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-blue-600 hover:text-white transition-colors">
                    <i data-lucide="plus" class="h-5 w-5"></i>
                </button>
                ${item.rx ? '<span class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">Rx Required</span>' : ''}
            </div>
            <div class="p-4">
                <div class="text-xs font-bold text-blue-600 mb-1">${item.category}</div>
                <h3 class="font-bold text-slate-900 mb-1">${item.name}</h3>
                <p class="text-sm text-slate-500 mb-3">${item.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold text-slate-900">₹${item.price}</span>
                    <button onclick="showProductDetails(${item.id})" class="text-xs text-blue-600 font-medium hover:underline">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function showProductDetails(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const modal = document.createElement('div');
    modal.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4";
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div class="relative h-64 bg-slate-100">
                <img src="${item.image || 'https://placehold.co/600x400/e2e8f0/1e293b?text=' + encodeURIComponent(item.name)}" class="w-full h-full object-cover">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors">
                    <i data-lucide="x" class="h-5 w-5 text-slate-800"></i>
                </button>
            </div>
            <div class="p-8">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900">${item.name}</h2>
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">${item.category}</span>
                    </div>
                    <div class="text-right">
                        <p class="text-3xl font-black text-blue-600">₹${item.price}</p>
                        <p class="text-xs text-slate-400">Inclusive of all taxes</p>
                    </div>
                </div>
                
                <div class="space-y-4 text-slate-600 text-sm leading-relaxed">
                    <p>This is a premium high-quality healthcare product verified by PharmaOne. Always follow your doctor's instructions for usage.</p>
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                            <p class="font-bold text-slate-900 text-xs uppercase mb-1">Manufacturer</p>
                            <p>${item.supplier || 'PharmaOne Labs'}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-900 text-xs uppercase mb-1">Expiry Date</p>
                            <p class="text-red-500 font-medium">${item.expDate || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
                
                <button onclick="addToCart(${item.id}); this.closest('.fixed').remove()" class="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="shopping-cart" class="h-5 w-5"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function addStaticItemToCart(name, price, image) {
    // Generate a pseudo-ID based on the name string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    const id = Math.abs(hash);

    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, image, qty: 1, stock: 100 });
    }

    updateCartUI();
    toggleCart();
}

function addToCart(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    // Check if Rx is required and show prescription mockup
    if (item.rx) {
        showPrescriptionMockup(item);
        return;
    }

    const existing = cart.find(c => c.id === id);
    if (existing) {
        if (existing.qty < item.stock) {
            existing.qty++;
        } else {
            alert("Sorry, we don't have more stock of this item.");
            return;
        }
    } else {
        cart.push({ ...item, qty: 1 });
    }

    showNotification(`${item.name} added to cart!`);
    updateCartUI();
}

function showPrescriptionMockup(item) {
    const modal = document.createElement('div');
    modal.className = "fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4";
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
            <div class="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-lucide="file-text" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Prescription Required</h3>
            <p class="text-slate-500 text-sm mb-6">The medicine <b>${item.name}</b> requires a valid prescription. Please upload a clear photo of your prescription from your device.</p>
            
            <label class="border-2 border-dashed border-slate-200 rounded-xl p-8 mb-6 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors group flex flex-col items-center">
                <input type="file" id="real-prescription-upload" class="hidden" accept="image/*" onchange="window.tempPrescription = this.files[0]; this.parentElement.querySelector('p').textContent = this.files[0].name; this.parentElement.querySelector('p').classList.add('text-blue-600', 'font-bold');">
                <i data-lucide="upload-cloud" class="h-10 w-10 text-slate-300 mb-2 group-hover:text-blue-500"></i>
                <p class="text-xs text-slate-400">Click to select photo from device</p>
            </label>
            
            <div class="flex gap-4">
                <button onclick="window.tempPrescription = null; this.closest('.fixed').remove()" class="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                <button id="btn-confirm-upload" onclick="completePrescriptionReal(${item.id}, this)" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all">Upload & Add</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    lucide.createIcons();
}

function completePrescriptionReal(id, btn) {
    if (!window.tempPrescription) {
        alert("Please select a file first.");
        return;
    }

    const reader = new FileReader();
    btn.disabled = true;
    btn.innerHTML = '<span class="flex items-center gap-2"><i data-lucide="loader" class="h-4 w-4 animate-spin"></i> Uploading...</span>';
    lucide.createIcons();

    reader.onload = (e) => {
        const item = inventory.find(i => i.id === id);
        const cartItem = { ...item, qty: 1, prescriptionImage: e.target.result };

        // Add to cart avoiding Rx check loop
        const existing = cart.find(c => c.id === id);
        if (existing) {
            existing.qty++;
            existing.prescriptionImage = e.target.result; // Update prescription
        } else {
            cart.push(cartItem);
        }

        window.tempPrescription = null;
        btn.closest('.fixed').remove();
        showNotification(`${item.name} added with prescription!`);
        updateCartUI();
    };
    reader.readAsDataURL(window.tempPrescription);
}

function showNotification(msg) {
    const notify = document.createElement('div');
    notify.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-[1000] flex items-center gap-3";
    notify.innerHTML = `<i data-lucide="check-circle" class="h-5 w-5 text-green-400"></i> <span class="text-sm font-medium">${msg}</span>`;
    document.body.appendChild(notify);
    lucide.createIcons();
    setTimeout(() => notify.remove(), 3000);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const countBadge = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');

    // Update Badge
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countBadge.textContent = totalQty;
    countBadge.classList.toggle('opacity-0', totalQty === 0);

    // Update Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    totalEl.textContent = `₹${total.toFixed(2)}`;

    // Render Items
    if (cart.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-64 text-slate-400"><i data-lucide="shopping-bag" class="h-12 w-12 mb-2 opacity-20"></i><p>Your cart is empty</p></div>`;
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const imageSrc = item.image || getMedicineImage(item.name, item.description);
        return `
        <div class="flex gap-4 py-4 border-b border-slate-100 last:border-0">
            <div class="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src="${imageSrc}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <h4 class="font-medium text-slate-800 line-clamp-1">${item.name}</h4>
                <p class="text-sm text-slate-500">₹${item.price} x ${item.qty}</p>
            </div>
            <div class="flex flex-col items-end justify-between">
                <span class="font-bold text-slate-900">₹${(item.price * item.qty).toFixed(2)}</span>
                <button onclick="removeFromCart(${index})" class="text-xs text-red-500 hover:text-red-700 hover:underline">Remove</button>
            </div>
        </div>
    `
    }).join('');

    lucide.createIcons();
}

function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");

    const nameInput = document.getElementById('checkout-name');
    const paymentInput = document.getElementById('checkout-payment');
    const customerName = nameInput.value.trim();

    if (!customerName) {
        alert("Please enter your name to place the order.");
        return;
    }

    // 1. Load current data from LocalStorage (Shared with Admin)
    const storedSales = localStorage.getItem('pharma_sales');
    const salesData = storedSales ? JSON.parse(storedSales) : [];

    const storedInv = localStorage.getItem('pharma_inventory');
    let inventoryData = storedInv ? JSON.parse(storedInv) : [];

    // 2. Create Sale Record
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const saleRecord = {
        id: Date.now(),
        items: cart.map(c => ({ name: c.name, price: c.price, qty: c.qty })),
        total: total,
        customerName: customerName,
        paymentMethod: paymentInput.value,
        prescription: cart.find(i => i.prescriptionImage)?.prescriptionImage || null,
        timestamp: new Date().toISOString()
    };

    // 3. Update Stock & Validate
    for (const cartItem of cart) {
        const itemIndex = inventoryData.findIndex(i => i.id === cartItem.id);
        if (itemIndex !== -1) {
            inventoryData[itemIndex].stock -= cartItem.qty;
            if (inventoryData[itemIndex].stock < 0) inventoryData[itemIndex].stock = 0;
            // Update status
            if (inventoryData[itemIndex].stock <= 0) inventoryData[itemIndex].status = 'Out of Stock';
            else if (inventoryData[itemIndex].stock < 10) inventoryData[itemIndex].status = 'Low Stock';
        }
    }

    // 4. Save Data Back to LocalStorage
    salesData.push(saleRecord);
    localStorage.setItem('pharma_sales', JSON.stringify(salesData));
    localStorage.setItem('pharma_inventory', JSON.stringify(inventoryData));

    // 5. Save to Cloud if available
    if (supabaseClient) {
        supabaseClient.from('sales').insert([saleRecord]).then(() => {
            console.log("Order synced to Cloud.");
        });
        // Sync stock back to cloud
        supabaseClient.from('inventory').upsert(inventoryData);
    }

    showNotification("Order Placed Successfully!");

    // Attempt to print
    try {
        printInvoice(saleRecord);
    } catch (e) {
        console.error("Print blocked:", e);
    }

    cart = [];
    nameInput.value = ''; // Reset name
    updateCartUI();
    toggleCart();
    loadData(); // Refresh view to show updated stock
}

function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const message = form.querySelector('[name="message"]').value;

    if (!name || !email || !message) {
        alert('Please fill out all fields.');
        return;
    }

    const subject = `Contact Form Submission from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    // This will open the user's default email client
    window.location.href = `mailto:support@pharmaone.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    alert('Thank you! Your message has been prepared in your email client.');
    form.reset();
}

function printInvoice(sale) {
    const invoiceWindow = window.open('', '_blank', 'width=600,height=700');
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice #${sale.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                .store-name { font-size: 20px; font-weight: bold; }
                .meta { margin-bottom: 20px; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { text-align: left; padding: 5px 0; }
                .right { text-align: right; }
                .total-row { border-top: 1px dashed #000; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                @media print {
                    body { margin: 0; padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="store-name">${pharmacySettings.pharmacyName || 'PharmaOne'}</div>
                <div>${pharmacySettings.address || '123 Health Street, Med City'}</div>
                <div>License: ${pharmacySettings.license || 'DL-123456'}</div>
            </div>
            <div class="meta">
                <div>Date: ${new Date(sale.timestamp).toLocaleString()}</div>
                <div>Invoice #: ${sale.id}</div>
                <div>Customer: ${sale.customerName}</div>
                <div>Payment: ${sale.paymentMethod}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="right">Qty</th>
                        <th class="right">Price</th>
                        <th class="right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td class="right">${item.qty}</td>
                            <td class="right">${item.price.toFixed(2)}</td>
                            <td class="right">${(item.price * item.qty).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3">Total</td>
                        <td class="right">₹${sale.total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>For support call: +1 (555) 123-4567</p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `;
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
}