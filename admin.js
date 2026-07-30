// Pantry Secrets Admin Backend Logic with Supabase Realtime Database Integration

const DEFAULT_PASSCODE = 'admin123';

const DEFAULT_SETTINGS = {
  whatsappPhone: '919876543210',
  announcementText: 'Order directly on WhatsApp for fast local delivery & custom gourmet inquiries!',
  
  // Brand Logo
  logoType: 'text', // 'text' or 'image'
  logoText: 'Pantry Secrets',
  logoImg: '',

  // Theme Colors
  colorPrimary: '#1B2A26',
  colorAccent: '#C89547',
  colorWhatsapp: '#25D366',
  colorBg: '#FBF9F5',

  // Home Page Text
  heroTitle: 'Handcrafted Gourmet <span class="gold">Pantry Flavors</span>',
  heroSubtitle: 'Elevate every dish with small-batch organic spices, cold-pressed infused oils, raw wildflower honey, and rare artisan seasonings. Order directly via WhatsApp!',
  featuredTitle: '🔥 Featured Gourmet Showcase',
  featuredSubtitle: 'Explore our top-tier artisanal ingredients. Click any item to order instantly via WhatsApp.',

  // Showcase Page
  shopBannerTitle: 'Gourmet Product Showcase',
  shopBannerSubtitle: 'Browse our hand-harvested organic spices, cold-pressed oils, and honeys. Click any item to order directly via WhatsApp.',

  // About Us Page
  aboutBannerTitle: 'Our Story & Passion',
  aboutBannerSubtitle: 'Dedicated to reviving authentic flavor through small-batch organic harvesting and ethical grower partnerships.',
  aboutTitle: 'Sourced From Earth, Hand-Packed With Care',
  aboutText1: 'Pantry Secrets was born from a simple belief: everyday cooking should be extraordinary. We travel the globe to partner with third-generation family estates, organic spice farmers, and master oil pressers.',
  aboutText2: 'Unlike mass-market grocery items that sit on warehouse shelves for years losing volatile essential oils, all of our products are freshly harvested, small-batch processed, and glass-bottled to seal in vibrant aroma and natural nutrients.',

  // Contact Page
  contactBannerTitle: 'Contact Us & WhatsApp Order Support',
  contactBannerSubtitle: 'Have questions about a product or custom orders? Chat with us directly on WhatsApp!',
  contactTitle: 'Get In Touch',
  contactSubtitle: 'Our customer support team is available Monday through Saturday. For instant responses, click the WhatsApp button below!',
  contactEmail: 'orders@pantrysecrets.com',
  contactAddress: '742 Gourmet Lane, San Francisco, CA 94107',

  // Banners
  heroBannerImg: 'images/hero_banner.png',
  shopBannerImg: '',
  aboutBannerImg: '',
  contactBannerImg: ''
};

// Application State
let PRODUCTS = JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
let siteSettings = JSON.parse(localStorage.getItem('pantrysecrets_settings')) || DEFAULT_SETTINGS;
let currentUploadedImageBase64 = '';
let currentUploadedLogoBase64 = '';

// DOM Elements
const lockModal = document.getElementById('lockModal');
const lockForm = document.getElementById('lockForm');
const passcodeInput = document.getElementById('passcodeInput');
const lockError = document.getElementById('lockError');
const adminDashboard = document.getElementById('adminDashboard');
const logoutBtn = document.getElementById('logoutBtn');

// Navigation Tabs & Header
const tabLinks = document.querySelectorAll('.admin-menu-link[data-tab]');
const tabViews = document.querySelectorAll('.tab-view');
const tabTitle = document.getElementById('tabTitle');

// Overview Stats
const statTotalProducts = document.getElementById('statTotalProducts');

// Product Table
const adminProductsTableBody = document.getElementById('adminProductsTableBody');

// Product Modal & Form
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');

// Form Inputs
const prodIdInput = document.getElementById('prodId');
const prodNameInput = document.getElementById('prodName');
const prodCategoryInput = document.getElementById('prodCategory');
const prodPriceInput = document.getElementById('prodPrice');
const prodOldPriceInput = document.getElementById('prodOldPrice');
const prodRatingInput = document.getElementById('prodRating');
const prodImageInput = document.getElementById('prodImage');
const prodDescInput = document.getElementById('prodDescription');
const prodIngredientsInput = document.getElementById('prodIngredients');
const prodOriginInput = document.getElementById('prodOrigin');
const prodSizeInput = document.getElementById('prodSize');
const prodOrganicCheck = document.getElementById('prodOrganic');
const prodBestSellerCheck = document.getElementById('prodBestSeller');
const prodSaleCheck = document.getElementById('prodSale');

// Computer Drag and Drop Product Image Elements
const imageDropzone = document.getElementById('imageDropzone');
const fileInput = document.getElementById('fileInput');
const previewBox = document.getElementById('previewBox');
const previewImg = document.getElementById('previewImg');
const removeImgBtn = document.getElementById('removeImgBtn');

// Computer Drag and Drop Logo Image Elements
const logoDropzone = document.getElementById('logoDropzone');
const logoFileInput = document.getElementById('logoFileInput');
const logoPreviewBox = document.getElementById('logoPreviewBox');
const logoPreviewImg = document.getElementById('logoPreviewImg');
const removeLogoImgBtn = document.getElementById('removeLogoImgBtn');

// Logo Manager Elements
const logoSettingsForm = document.getElementById('logoSettingsForm');
const logoTypeSelect = document.getElementById('logoTypeSelect');
const textLogoGroup = document.getElementById('textLogoGroup');
const imageLogoGroup = document.getElementById('imageLogoGroup');
const logoTextInput = document.getElementById('logoTextInput');
const logoUrlInput = document.getElementById('logoUrlInput');

// Theme Color System Elements
const colorSettingsForm = document.getElementById('colorSettingsForm');
const colorPrimaryPicker = document.getElementById('colorPrimaryPicker');
const colorPrimaryInput = document.getElementById('colorPrimaryInput');
const colorAccentPicker = document.getElementById('colorAccentPicker');
const colorAccentInput = document.getElementById('colorAccentInput');
const colorWhatsappPicker = document.getElementById('colorWhatsappPicker');
const colorWhatsappInput = document.getElementById('colorWhatsappInput');
const colorBgPicker = document.getElementById('colorBgPicker');
const colorBgInput = document.getElementById('colorBgInput');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// Initialize Admin Application
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupAuthEvents();
  setupTabNavigation();
  setupProductFormEvents();
  setupDragAndDropUploader();
  setupLogoUploader();
  setupLogoManagerEvents();
  setupColorSystemEvents();
  setupPagesContentEvents();
  setupWhatsAppEvents();
  setupSupabaseEvents();
});

// Authentication Check
function checkAuth() {
  const isAuth = sessionStorage.getItem('pantrysecrets_admin_auth') === 'true';
  if (isAuth) {
    lockModal.style.display = 'none';
    adminDashboard.style.display = 'grid';
    loadDashboardData();
  } else {
    lockModal.style.display = 'flex';
    adminDashboard.style.display = 'none';
  }
}

function setupAuthEvents() {
  lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passcodeInput.value === DEFAULT_PASSCODE) {
      sessionStorage.setItem('pantrysecrets_admin_auth', 'true');
      lockError.style.display = 'none';
      checkAuth();
      showToast('Welcome back, Admin!');
    } else {
      lockError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('pantrysecrets_admin_auth');
    checkAuth();
    showToast('Admin session locked.');
  });
}

// Load Dashboard Data & Settings
async function loadDashboardData() {
  if (typeof getProducts === 'function') {
    PRODUCTS = await getProducts();
  } else {
    PRODUCTS = JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
  }

  if (typeof getSiteSettings === 'function') {
    const remoteSettings = await getSiteSettings();
    if (remoteSettings) siteSettings = remoteSettings;
  } else {
    siteSettings = JSON.parse(localStorage.getItem('pantrysecrets_settings')) || DEFAULT_SETTINGS;
  }

  statTotalProducts.textContent = PRODUCTS.length;
  renderAdminProductsTable();
  prefillLogoSettings();
  prefillColorSettings();
  prefillPagesContentSettings();
  prefillWhatsAppSettings();
  prefillSupabaseSettings();
  applyLiveAdminThemeColors();
  updateSupabaseStatusBadges();
}

// Tab Switching Navigation
function setupTabNavigation() {
  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.dataset.tab;
      
      tabLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      tabViews.forEach(view => {
        if (view.id === `tab-${targetTab}`) {
          view.style.display = 'block';
        } else {
          view.style.display = 'none';
        }
      });

      const titles = {
        overview: 'Dashboard Overview',
        products: 'Product Catalog Management',
        supabase: 'Supabase Database Integration',
        branding: 'Website Logo & Color System',
        content: 'All Pages Text Content & Banner Editor',
        whatsapp: 'WhatsApp Direct Integration Settings'
      };
      tabTitle.textContent = titles[targetTab] || 'Admin Panel';
    });
  });
}

// Render Products Table in Admin Panel
function renderAdminProductsTable() {
  adminProductsTableBody.innerHTML = PRODUCTS.map(prod => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="${prod.image}" alt="${prod.name}" class="prod-thumb">
          <div>
            <strong style="color: var(--color-primary); font-size: 0.95rem;">${prod.name}</strong>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">${prod.size || 'Standard'}</div>
          </div>
        </div>
      </td>
      <td><span style="text-transform: uppercase; font-size: 0.78rem; font-weight: 700; color: var(--color-accent);">${prod.category}</span></td>
      <td><strong style="color: var(--color-primary);">₹${parseFloat(prod.price).toLocaleString('en-IN')}</strong></td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${prod.organic ? '<span style="background:#E8F5E9; color:#2E7D32; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;">Organic</span>' : ''}
          ${prod.bestSeller ? '<span style="background:#FFF8E1; color:#B28135; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;">Best Seller</span>' : ''}
          ${prod.sale ? '<span style="background:#FFEBEE; color:#D32F2F; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:99px;">Sale</span>' : ''}
        </div>
      </td>
      <td><span style="color: var(--color-star); font-weight: 700;">★ ${prod.rating}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="btn-edit" onclick="editProduct('${prod.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn-delete" onclick="deleteProduct('${prod.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Computer Drag and Drop Product Image Upload Logic
function setupDragAndDropUploader() {
  imageDropzone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    imageDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      imageDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    imageDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      imageDropzone.classList.remove('dragover');
    });
  });

  imageDropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  removeImgBtn.addEventListener('click', () => {
    currentUploadedImageBase64 = '';
    previewBox.style.display = 'none';
    previewImg.src = '';
    prodImageInput.value = '';
  });
}

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file!', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    currentUploadedImageBase64 = e.target.result;
    previewImg.src = currentUploadedImageBase64;
    previewBox.style.display = 'block';
    prodImageInput.value = '';
    showToast('Image uploaded successfully from computer!');
  };
  reader.readAsDataURL(file);
}

// Computer Drag and Drop Logo Image Upload Logic
function setupLogoUploader() {
  logoDropzone.addEventListener('click', () => logoFileInput.click());

  ['dragenter', 'dragover'].forEach(eventName => {
    logoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      logoDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    logoDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      logoDropzone.classList.remove('dragover');
    });
  });

  logoDropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleLogoFile(files[0]);
  });

  logoFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleLogoFile(e.target.files[0]);
  });

  removeLogoImgBtn.addEventListener('click', () => {
    currentUploadedLogoBase64 = '';
    logoPreviewBox.style.display = 'none';
    logoPreviewImg.src = '';
    logoUrlInput.value = '';
  });
}

function handleLogoFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file!', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    currentUploadedLogoBase64 = e.target.result;
    logoPreviewImg.src = currentUploadedLogoBase64;
    logoPreviewBox.style.display = 'block';
    logoUrlInput.value = '';
    showToast('Logo image uploaded successfully!');
  };
  reader.readAsDataURL(file);
}

// Logo Manager Controls & Form Submission
function setupLogoManagerEvents() {
  logoTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'image') {
      textLogoGroup.style.display = 'none';
      imageLogoGroup.style.display = 'block';
    } else {
      textLogoGroup.style.display = 'block';
      imageLogoGroup.style.display = 'none';
    }
  });

  logoSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    siteSettings.logoType = logoTypeSelect.value;
    siteSettings.logoText = logoTextInput.value.trim() || 'Pantry Secrets';
    siteSettings.logoImg = currentUploadedLogoBase64 || logoUrlInput.value.trim();

    if (typeof saveSiteSettingsToDB === 'function') {
      await saveSiteSettingsToDB(siteSettings);
    } else {
      localStorage.setItem('pantrysecrets_settings', JSON.stringify(siteSettings));
    }
    showToast('✨ Logo settings saved successfully!');
  });
}

function prefillLogoSettings() {
  logoTypeSelect.value = siteSettings.logoType || 'text';
  logoTextInput.value = siteSettings.logoText || 'Pantry Secrets';

  if (siteSettings.logoImg) {
    if (siteSettings.logoImg.startsWith('data:image')) {
      currentUploadedLogoBase64 = siteSettings.logoImg;
      logoPreviewImg.src = siteSettings.logoImg;
      logoPreviewBox.style.display = 'block';
    } else {
      logoUrlInput.value = siteSettings.logoImg;
    }
  }

  if (logoTypeSelect.value === 'image') {
    textLogoGroup.style.display = 'none';
    imageLogoGroup.style.display = 'block';
  } else {
    textLogoGroup.style.display = 'block';
    imageLogoGroup.style.display = 'none';
  }
}

// Website Theme Color System Logic
function setupColorSystemEvents() {
  colorPrimaryPicker.addEventListener('input', (e) => colorPrimaryInput.value = e.target.value);
  colorPrimaryInput.addEventListener('input', (e) => colorPrimaryPicker.value = e.target.value);

  colorAccentPicker.addEventListener('input', (e) => colorAccentInput.value = e.target.value);
  colorAccentInput.addEventListener('input', (e) => colorAccentPicker.value = e.target.value);

  colorWhatsappPicker.addEventListener('input', (e) => colorWhatsappInput.value = e.target.value);
  colorWhatsappInput.addEventListener('input', (e) => colorWhatsappPicker.value = e.target.value);

  colorBgPicker.addEventListener('input', (e) => colorBgInput.value = e.target.value);
  colorBgInput.addEventListener('input', (e) => colorBgPicker.value = e.target.value);

  document.querySelectorAll('.color-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      colorPrimaryPicker.value = chip.dataset.primary;
      colorPrimaryInput.value = chip.dataset.primary;

      colorAccentPicker.value = chip.dataset.accent;
      colorAccentInput.value = chip.dataset.accent;

      colorWhatsappPicker.value = chip.dataset.whatsapp;
      colorWhatsappInput.value = chip.dataset.whatsapp;

      colorBgPicker.value = chip.dataset.bg;
      colorBgInput.value = chip.dataset.bg;

      showToast(`Selected preset colors applied!`);
    });
  });

  colorSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    siteSettings.colorPrimary = colorPrimaryInput.value;
    siteSettings.colorAccent = colorAccentInput.value;
    siteSettings.colorWhatsapp = colorWhatsappInput.value;
    siteSettings.colorBg = colorBgInput.value;

    if (typeof saveSiteSettingsToDB === 'function') {
      await saveSiteSettingsToDB(siteSettings);
    } else {
      localStorage.setItem('pantrysecrets_settings', JSON.stringify(siteSettings));
    }
    applyLiveAdminThemeColors();
    showToast('🎨 Theme colors saved! Store updated instantly.');
  });
}

function prefillColorSettings() {
  colorPrimaryPicker.value = siteSettings.colorPrimary || '#1B2A26';
  colorPrimaryInput.value = siteSettings.colorPrimary || '#1B2A26';

  colorAccentPicker.value = siteSettings.colorAccent || '#C89547';
  colorAccentInput.value = siteSettings.colorAccent || '#C89547';

  colorWhatsappPicker.value = siteSettings.colorWhatsapp || '#25D366';
  colorWhatsappInput.value = siteSettings.colorWhatsapp || '#25D366';

  colorBgPicker.value = siteSettings.colorBg || '#FBF9F5';
  colorBgInput.value = siteSettings.colorBg || '#FBF9F5';
}

function applyLiveAdminThemeColors() {
  if (siteSettings.colorPrimary) document.documentElement.style.setProperty('--color-primary', siteSettings.colorPrimary);
  if (siteSettings.colorAccent) document.documentElement.style.setProperty('--color-accent', siteSettings.colorAccent);
  if (siteSettings.colorWhatsapp) document.documentElement.style.setProperty('--color-whatsapp', siteSettings.colorWhatsapp);
  if (siteSettings.colorBg) document.documentElement.style.setProperty('--color-bg', siteSettings.colorBg);
}

// Product Form Modal Handlers
function setupProductFormEvents() {
  if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
  if (quickAddBtn) quickAddBtn.addEventListener('click', openAddModal);
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeModal);
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeModal);

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = prodIdInput.value || `prod-${Date.now()}`;
    const finalImage = currentUploadedImageBase64 || prodImageInput.value.trim() || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80';

    const productData = {
      id: id,
      name: prodNameInput.value.trim(),
      category: prodCategoryInput.value,
      price: parseFloat(prodPriceInput.value),
      oldPrice: prodOldPriceInput.value ? parseFloat(prodOldPriceInput.value) : null,
      rating: parseFloat(prodRatingInput.value) || 4.8,
      reviewsCount: 50,
      image: finalImage,
      organic: prodOrganicCheck.checked,
      bestSeller: prodBestSellerCheck.checked,
      sale: prodSaleCheck.checked,
      description: prodDescInput.value.trim(),
      ingredients: prodIngredientsInput.value.trim(),
      origin: prodOriginInput.value.trim(),
      size: prodSizeInput.value.trim()
    };

    if (typeof saveProductToDB === 'function') {
      await saveProductToDB(productData);
    } else {
      const idx = PRODUCTS.findIndex(p => p.id === id);
      if (idx > -1) PRODUCTS[idx] = productData;
      else PRODUCTS.push(productData);
      localStorage.setItem('pantrysecrets_products', JSON.stringify(PRODUCTS));
    }

    showToast('Product saved successfully!');
    closeModal();
    loadDashboardData();
  });
}

function openAddModal() {
  productForm.reset();
  prodIdInput.value = '';
  modalTitle.innerHTML = '<i class="fa-solid fa-plus" style="color: var(--color-accent);"></i> Add New Product';
  currentUploadedImageBase64 = '';
  previewBox.style.display = 'none';
  previewImg.src = '';
  productModal.classList.add('active');
}

function closeModal() {
  productModal.classList.remove('active');
}

window.editProduct = function(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;

  productForm.reset();
  prodIdInput.value = prod.id;
  prodNameInput.value = prod.name;
  prodCategoryInput.value = prod.category;
  prodPriceInput.value = prod.price;
  prodOldPriceInput.value = prod.oldPrice || '';
  prodRatingInput.value = prod.rating;
  prodDescInput.value = prod.description || '';
  prodIngredientsInput.value = prod.ingredients || '';
  prodOriginInput.value = prod.origin || '';
  prodSizeInput.value = prod.size || '';
  
  prodOrganicCheck.checked = prod.organic;
  prodBestSellerCheck.checked = prod.bestSeller;
  prodSaleCheck.checked = prod.sale;

  if (prod.image && prod.image.startsWith('data:image')) {
    currentUploadedImageBase64 = prod.image;
    previewImg.src = prod.image;
    previewBox.style.display = 'block';
    prodImageInput.value = '';
  } else {
    currentUploadedImageBase64 = '';
    previewBox.style.display = 'none';
    prodImageInput.value = prod.image || '';
  }

  modalTitle.innerHTML = '<i class="fa-solid fa-pen" style="color: var(--color-accent);"></i> Edit Product';
  productModal.classList.add('active');
};

window.deleteProduct = async function(id) {
  if (confirm('Are you sure you want to delete this product from your catalog?')) {
    if (typeof deleteProductFromDB === 'function') {
      await deleteProductFromDB(id);
    } else {
      PRODUCTS = PRODUCTS.filter(p => p.id !== id);
      localStorage.setItem('pantrysecrets_products', JSON.stringify(PRODUCTS));
    }
    loadDashboardData();
    showToast('Product deleted from catalog.', 'error');
  }
};

// All Pages Content & Banners Form Events
function setupPagesContentEvents() {
  const form = document.getElementById('pagesContentForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    siteSettings.announcementText = document.getElementById('settingAnnouncement').value.trim();
    siteSettings.heroTitle = document.getElementById('settingHeroTitle').value.trim();
    siteSettings.heroSubtitle = document.getElementById('settingHeroSubtitle').value.trim();
    siteSettings.featuredTitle = document.getElementById('settingFeaturedTitle').value.trim();
    siteSettings.heroBannerImg = document.getElementById('settingHeroBannerImg').value.trim();

    siteSettings.shopBannerTitle = document.getElementById('settingShopBannerTitle').value.trim();
    siteSettings.shopBannerSubtitle = document.getElementById('settingShopBannerSubtitle').value.trim();
    siteSettings.shopBannerImg = document.getElementById('settingShopBannerImg').value.trim();

    siteSettings.aboutBannerTitle = document.getElementById('settingAboutBannerTitle').value.trim();
    siteSettings.aboutBannerSubtitle = document.getElementById('settingAboutBannerSubtitle').value.trim();
    siteSettings.aboutTitle = document.getElementById('settingAboutTitle').value.trim();
    siteSettings.aboutText1 = document.getElementById('settingAboutText1').value.trim();
    siteSettings.aboutText2 = document.getElementById('settingAboutText2').value.trim();
    siteSettings.aboutBannerImg = document.getElementById('settingAboutBannerImg').value.trim();

    siteSettings.contactBannerTitle = document.getElementById('settingContactBannerTitle').value.trim();
    siteSettings.contactBannerSubtitle = document.getElementById('settingContactBannerSubtitle').value.trim();
    siteSettings.contactEmail = document.getElementById('settingContactEmail').value.trim();
    siteSettings.contactAddress = document.getElementById('settingContactAddress').value.trim();
    siteSettings.contactBannerImg = document.getElementById('settingContactBannerImg').value.trim();

    if (typeof saveSiteSettingsToDB === 'function') {
      await saveSiteSettingsToDB(siteSettings);
    } else {
      localStorage.setItem('pantrysecrets_settings', JSON.stringify(siteSettings));
    }
    showToast('🎉 All page contents and banners saved successfully!');
  });
}

function prefillPagesContentSettings() {
  document.getElementById('settingAnnouncement').value = siteSettings.announcementText || '';
  document.getElementById('settingHeroTitle').value = siteSettings.heroTitle || '';
  document.getElementById('settingHeroSubtitle').value = siteSettings.heroSubtitle || '';
  document.getElementById('settingFeaturedTitle').value = siteSettings.featuredTitle || '';
  document.getElementById('settingHeroBannerImg').value = siteSettings.heroBannerImg || '';

  document.getElementById('settingShopBannerTitle').value = siteSettings.shopBannerTitle || '';
  document.getElementById('settingShopBannerSubtitle').value = siteSettings.shopBannerSubtitle || '';
  document.getElementById('settingShopBannerImg').value = siteSettings.shopBannerImg || '';

  document.getElementById('settingAboutBannerTitle').value = siteSettings.aboutBannerTitle || '';
  document.getElementById('settingAboutBannerSubtitle').value = siteSettings.aboutBannerSubtitle || '';
  document.getElementById('settingAboutTitle').value = siteSettings.aboutTitle || '';
  document.getElementById('settingAboutText1').value = siteSettings.aboutText1 || '';
  document.getElementById('settingAboutText2').value = siteSettings.aboutText2 || '';
  document.getElementById('settingAboutBannerImg').value = siteSettings.aboutBannerImg || '';

  document.getElementById('settingContactBannerTitle').value = siteSettings.contactBannerTitle || '';
  document.getElementById('settingContactBannerSubtitle').value = siteSettings.contactBannerSubtitle || '';
  document.getElementById('settingContactEmail').value = siteSettings.contactEmail || '';
  document.getElementById('settingContactAddress').value = siteSettings.contactAddress || '';
  document.getElementById('settingContactBannerImg').value = siteSettings.contactBannerImg || '';
}

// WhatsApp Settings Form Events
function setupWhatsAppEvents() {
  const form = document.getElementById('whatsappSettingsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phoneInput = document.getElementById('whatsappPhoneInput');
    const cleanPhone = phoneInput.value.replace(/\D/g, '');

    if (!cleanPhone) {
      showToast('Please enter a valid phone number!', 'error');
      return;
    }

    siteSettings.whatsappPhone = cleanPhone;
    if (typeof saveSiteSettingsToDB === 'function') {
      await saveSiteSettingsToDB(siteSettings);
    } else {
      localStorage.setItem('pantrysecrets_settings', JSON.stringify(siteSettings));
    }
    showToast('WhatsApp Business number saved!');
  });
}

function prefillWhatsAppSettings() {
  const phoneInput = document.getElementById('whatsappPhoneInput');
  if (phoneInput) {
    phoneInput.value = siteSettings.whatsappPhone || '919876543210';
  }
}

// ==================== SUPABASE REALTIME EVENTS ====================
function setupSupabaseEvents() {
  const form = document.getElementById('supabaseConfigForm');
  const btnTest = document.getElementById('btnTestSupabase');
  const btnSync = document.getElementById('btnSyncToSupabase');
  const copySqlBtn = document.getElementById('copySqlBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('supabaseUrlInput').value.trim();
      const key = document.getElementById('supabaseKeyInput').value.trim();

      if (typeof saveSupabaseConfig === 'function') {
        saveSupabaseConfig(url, key);
        showToast('Saving credentials & checking connection...');
        await runLiveSupabaseTest();
      }
    });
  }

  if (btnTest) {
    btnTest.addEventListener('click', async () => {
      await runLiveSupabaseTest();
    });
  }

  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      if (typeof bulkSyncLocalToSupabase === 'function') {
        try {
          showToast('Uploading products & settings to Supabase...');
          await bulkSyncLocalToSupabase();
          showToast('🎉 All local data pushed to Supabase database successfully!');
        } catch (err) {
          showToast(`Migration error: ${err.message}`, 'error');
        }
      }
    });
  }

  if (copySqlBtn) {
    copySqlBtn.addEventListener('click', () => {
      const sqlText = document.getElementById('sqlCodeBlock').textContent;
      navigator.clipboard.writeText(sqlText).then(() => {
        showToast('SQL script copied to clipboard!');
      }).catch(err => {
        showToast('Failed to copy text.', 'error');
      });
    });
  }
}

async function runLiveSupabaseTest() {
  const resBox = document.getElementById('testResultBox');
  if (!resBox) return;

  resBox.style.display = 'block';
  resBox.style.background = '#F0F9FF';
  resBox.style.color = '#0284C7';
  resBox.style.border = '1px solid #BAE6FD';
  resBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing API endpoint & querying tables...';

  if (typeof testSupabaseConnection === 'function') {
    const result = await testSupabaseConnection();
    if (result.success) {
      resBox.style.background = '#F0FDF4';
      resBox.style.color = '#15803D';
      resBox.style.border = '1px solid #BBF7D0';
      resBox.innerHTML = result.message;
      updateSupabaseStatusBadges();
      showToast('🟢 Supabase Connection Verified!');
    } else {
      resBox.style.background = '#FEF2F2';
      resBox.style.color = '#B91C1C';
      resBox.style.border = '1px solid #FECACA';
      resBox.innerHTML = `⚠️ ${result.message}`;
      updateSupabaseStatusBadges();
      showToast('Supabase check: ' + result.status, 'error');
    }
  }
}

function prefillSupabaseSettings() {
  if (typeof getSupabaseConfig === 'function') {
    const config = getSupabaseConfig();
    const urlInput = document.getElementById('supabaseUrlInput');
    const keyInput = document.getElementById('supabaseKeyInput');
    if (urlInput) urlInput.value = config.url || '';
    if (keyInput) keyInput.value = config.anonKey || '';
  }
}

function updateSupabaseStatusBadges() {
  const isConnected = typeof isSupabaseConnected === 'function' && isSupabaseConnected();
  const connBadge = document.getElementById('supabaseConnBadge');
  const topbarBadge = document.getElementById('supabaseStatusBadge');
  const statSupabaseStatus = document.getElementById('statSupabaseStatus');

  if (isConnected) {
    if (connBadge) {
      connBadge.innerHTML = '🟢 Connected to Supabase Cloud';
      connBadge.style.color = '#2E7D32';
    }
    if (topbarBadge) {
      topbarBadge.innerHTML = '<i class="fa-solid fa-circle" style="color: #3ECF8E; font-size: 0.6rem;"></i> Supabase Live Connected';
      topbarBadge.style.background = 'rgba(62, 207, 142, 0.15)';
      topbarBadge.style.color = '#3ECF8E';
    }
    if (statSupabaseStatus) {
      statSupabaseStatus.textContent = 'Active ⚡';
      statSupabaseStatus.style.color = '#3ECF8E';
    }
  } else {
    if (connBadge) {
      connBadge.innerHTML = '🔴 Not Connected (Using Local Storage)';
      connBadge.style.color = '#D32F2F';
    }
    if (topbarBadge) {
      topbarBadge.innerHTML = '<i class="fa-solid fa-circle" style="color: #C89547; font-size: 0.6rem;"></i> Local Storage Ready';
      topbarBadge.style.background = '#FAF8F4';
      topbarBadge.style.color = '#C89547';
    }
    if (statSupabaseStatus) {
      statSupabaseStatus.textContent = 'Offline';
      statSupabaseStatus.style.color = '#646E6B';
    }
  }
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = '#D32F2F';
  }
  toast.innerHTML = `<i class="${type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-check'}" style="color: var(--color-accent); font-size: 1.2rem;"></i> <span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
