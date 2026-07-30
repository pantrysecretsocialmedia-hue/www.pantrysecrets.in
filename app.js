// Pantry Secrets Product Showcase - Application Logic with Supabase Backend & Local Fallback

// Default Settings
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

  // Home Page
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

// Load Site Settings from LocalStorage
let siteSettings = JSON.parse(localStorage.getItem('pantrysecrets_settings')) || DEFAULT_SETTINGS;

// Default Catalog Dataset (INR Prices)
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Black Truffle Infused Extra Virgin Olive Oil',
    category: 'oils',
    price: 1499,
    oldPrice: 1799,
    rating: 4.9,
    reviewsCount: 142,
    image: 'images/truffle_oil.png',
    organic: true,
    bestSeller: true,
    sale: false,
    description: 'Cold-pressed Umbrian extra virgin olive oil slowly infused with authentic Italian black winter truffle slices. Delivers an earthy, intoxicating aroma perfect for pasta, risotto, and artisan crusts.',
    ingredients: 'Cold-pressed extra virgin olive oil, natural black truffle extract, dried black truffle slices.',
    origin: 'Umbria, Italy',
    size: '250ml (8.5 fl oz)'
  },
  {
    id: 'prod-2',
    name: 'Smoked Artisan Spanish Paprika',
    category: 'spices',
    price: 590,
    oldPrice: 750,
    rating: 4.8,
    reviewsCount: 98,
    image: 'images/smoked_paprika.png',
    organic: true,
    bestSeller: true,
    sale: true,
    description: 'Slow-oak-smoked sweet red pimentón grown in La Vera, Spain. Imparts a rich ruby hue and deep, smoky complexity to roasted meats, paellas, and grilled vegetables.',
    ingredients: '100% Organic Smoked Red Peppers (Capsicum annuum).',
    origin: 'La Vera, Spain',
    size: '120g jar'
  },
  {
    id: 'prod-3',
    name: 'Raw Organic Wildflower Honey',
    category: 'honey',
    price: 790,
    oldPrice: null,
    rating: 4.9,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: true,
    sale: false,
    description: 'Unheated, unfiltered mountain wildflower honey harvested from pristine alpine meadows. Rich in natural pollen, enzymes, and floral tasting notes.',
    ingredients: '100% Raw Unfiltered Wildflower Honey.',
    origin: 'Himalayan Foothills, India',
    size: '350g hex jar'
  },
  {
    id: 'prod-4',
    name: 'Spicy Garlic Chili Crunch Oil',
    category: 'sauces',
    price: 650,
    oldPrice: null,
    rating: 4.9,
    reviewsCount: 315,
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    organic: false,
    bestSeller: true,
    sale: false,
    description: 'Crispy fried garlic chips, shallots, sesame seeds, and crushed Sichuan chili peppers steeped in aromatic chili oil. Add irresistible crunch and heat to dumplings, noodles, and eggs.',
    ingredients: 'Cold-pressed Sesame oil, chili flakes, crispy fried garlic, fried shallots, sesame seeds, sea salt.',
    origin: 'Sichuan',
    size: '220ml jar'
  },
  {
    id: 'prod-5',
    name: 'Aged Reserve Balsamic Vinegar of Modena',
    category: 'oils',
    price: 1850,
    oldPrice: 2200,
    rating: 4.7,
    reviewsCount: 86,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: false,
    sale: true,
    description: 'Aged 12 years in oak, cherry, and chestnut casks in Modena. Syrupy texture with a sweet balance of dried fig and woody notes.',
    ingredients: 'Cooked grape must, wine vinegar.',
    origin: 'Modena, Italy',
    size: '200ml bottle'
  },
  {
    id: 'prod-6',
    name: 'Organic Pink Himalayan Rock Salt Grinder',
    category: 'salts',
    price: 490,
    oldPrice: null,
    rating: 4.8,
    reviewsCount: 164,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: false,
    sale: false,
    description: 'Pure, unrefined mineral-rich rock salt hand-mined from ancient Himalayan sea beds. Fitted with an adjustable ceramic grinder cap.',
    ingredients: '100% Pure Himalayan Pink Salt Crystals.',
    origin: 'Himalayas, India',
    size: '200g ceramic grinder'
  },
  {
    id: 'prod-7',
    name: 'Premium Spanish Saffron Threads (1g)',
    category: 'spices',
    price: 2490,
    oldPrice: null,
    rating: 5.0,
    reviewsCount: 74,
    image: 'https://images.unsplash.com/photo-1615485290176-6518f8e3d062?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: true,
    sale: false,
    description: 'Category I Coupe saffron threads harvested by hand in Kashmir & La Mancha. Intense golden color and aroma for biryani, paella, and sweets.',
    ingredients: '100% Pure Saffron Stigmas (Crocus sativus).',
    origin: 'Kashmir, India',
    size: '1 gram glass vial'
  },
  {
    id: 'prod-8',
    name: 'Rosemary & Garlic Artisan Steak Rub',
    category: 'spices',
    price: 450,
    oldPrice: null,
    rating: 4.6,
    reviewsCount: 62,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: false,
    sale: false,
    description: 'Coarse sea salt, crushed wild rosemary leaves, cracked black pepper, and toasted garlic granules. Creates a caramelized savory crust on meats.',
    ingredients: 'Sea salt, toasted garlic, wild rosemary, black pepper, onion powder, red pepper flakes.',
    origin: 'Provence, France',
    size: '140g jar'
  },
  {
    id: 'prod-9',
    name: 'Tuscan Herb Infused Extra Virgin Olive Oil',
    category: 'oils',
    price: 890,
    oldPrice: null,
    rating: 4.8,
    reviewsCount: 112,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: false,
    sale: false,
    description: 'Cold-pressed Tuscan olive oil infused with fresh basil, oregano, thyme, and marjoram. Ideal for dipping crusty bread, salads, and drizzling over roasted pan veggies.',
    ingredients: 'Extra virgin olive oil, basil extract, oregano, thyme, garlic.',
    origin: 'Tuscany, Italy',
    size: '250ml'
  },
  {
    id: 'prod-10',
    name: 'Hot Honey with Ghost Pepper Infusion',
    category: 'honey',
    price: 750,
    oldPrice: null,
    rating: 4.7,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: false,
    sale: false,
    description: 'Pure clover honey infused with habanero and ghost pepper extract. The ultimate sweet & spicy condiment for pepperoni pizza, fried chicken, and artisan cheese boards.',
    ingredients: 'Raw wildflower honey, apple cider vinegar, ghost pepper, habanero chili.',
    origin: 'Assam, India',
    size: '300g bottle'
  },
  {
    id: 'prod-11',
    name: 'Black Truffle Salt Finishing Blend',
    category: 'salts',
    price: 990,
    oldPrice: 1200,
    rating: 4.9,
    reviewsCount: 180,
    image: 'https://images.unsplash.com/photo-1518110165366-5451e37727d7?auto=format&fit=crop&w=600&q=80',
    organic: true,
    bestSeller: true,
    sale: true,
    description: 'Flaky sea salt blended with real Italian black summer truffle bits. A single pinch transforms french fries, popcorn, scrambled eggs, and steaks.',
    ingredients: 'French sea salt, black summer truffle (Tuber aestivum), truffle essence.',
    origin: 'Brittany, France',
    size: '100g glass jar'
  },
  {
    id: 'prod-12',
    name: 'Artisanal Harissa Paste with Roasted Peppers',
    category: 'sauces',
    price: 620,
    oldPrice: null,
    rating: 4.6,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    organic: false,
    bestSeller: false,
    sale: false,
    description: 'North African pepper paste crafted from sun-dried Baklouti red peppers, garlic, caraway seeds, coriander, and extra virgin olive oil.',
    ingredients: 'Red bell peppers, Baklouti chili, olive oil, garlic, caraway, coriander, salt.',
    origin: 'Tunisia',
    size: '190g jar'
  }
];

// Load Products from LocalStorage (or set defaults)
if (!localStorage.getItem('pantrysecrets_products')) {
  localStorage.setItem('pantrysecrets_products', JSON.stringify(DEFAULT_PRODUCTS));
}
let PRODUCTS = JSON.parse(localStorage.getItem('pantrysecrets_products'));

// State Management
let activeCategory = 'all';

// DOM Elements
const productGrid = document.getElementById('productGrid');
const homeFeaturedGrid = document.getElementById('homeFeaturedGrid');
const productCount = document.getElementById('productCount');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Quick View Elements
const quickViewModal = document.getElementById('quickViewModal');
const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
const quickViewContent = document.getElementById('quickViewContent');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await applyDynamicSiteSettings();
  await loadStoreProducts();
  renderHomeFeatured();
  renderProducts();
  setupNavigationRouter();
  setupEventListeners();
});

// Load Store Products from Supabase or LocalStorage
async function loadStoreProducts() {
  if (typeof getProducts === 'function') {
    PRODUCTS = await getProducts();
  } else {
    PRODUCTS = JSON.parse(localStorage.getItem('pantrysecrets_products')) || DEFAULT_PRODUCTS;
  }
}

// Apply All Pages Dynamic Text, Banners, Logo & Color Palette from Admin Panel / Supabase
async function applyDynamicSiteSettings() {
  if (typeof getSiteSettings === 'function') {
    const remoteSettings = await getSiteSettings();
    if (remoteSettings) siteSettings = remoteSettings;
  } else {
    siteSettings = JSON.parse(localStorage.getItem('pantrysecrets_settings')) || DEFAULT_SETTINGS;
  }

  // 1. Apply Dynamic Theme Colors to Root CSS Variables
  if (siteSettings.colorPrimary) document.documentElement.style.setProperty('--color-primary', siteSettings.colorPrimary);
  if (siteSettings.colorAccent) document.documentElement.style.setProperty('--color-accent', siteSettings.colorAccent);
  if (siteSettings.colorWhatsapp) document.documentElement.style.setProperty('--color-whatsapp', siteSettings.colorWhatsapp);
  if (siteSettings.colorBg) document.documentElement.style.setProperty('--color-bg', siteSettings.colorBg);

  // 2. Dynamic Logo Renderer (Header & Footer)
  const brandLogoEls = document.querySelectorAll('.brand-logo');
  const footerBrandH2El = document.querySelector('.footer-brand h2');

  brandLogoEls.forEach(logoEl => {
    if (siteSettings.logoType === 'image' && siteSettings.logoImg) {
      logoEl.innerHTML = `<img src="${siteSettings.logoImg}" alt="Brand Logo" style="height: 44px; max-width: 220px; object-fit: contain;">`;
    } else {
      const text = siteSettings.logoText || 'Pantry Secrets';
      const parts = text.split(' ');
      const main = parts[0] || 'Pantry';
      const accent = parts.slice(1).join(' ') || 'Secrets';
      logoEl.innerHTML = `<i class="fa-solid fa-jar-wheat"></i> <span>${main}<span class="accent"> ${accent}</span></span>`;
    }
  });

  if (footerBrandH2El) {
    if (siteSettings.logoType === 'image' && siteSettings.logoImg) {
      footerBrandH2El.innerHTML = `<img src="${siteSettings.logoImg}" alt="Brand Logo" style="height: 40px; max-width: 200px; object-fit: contain;">`;
    } else {
      footerBrandH2El.innerHTML = `<i class="fa-solid fa-jar-wheat" style="color: var(--color-accent);"></i> ${siteSettings.logoText || 'Pantry Secrets'}`;
    }
  }

  // 3. Top Announcement Bar
  const announcementTextEl = document.querySelector('.announcement-bar span:last-child');
  if (announcementTextEl && siteSettings.announcementText) {
    announcementTextEl.textContent = siteSettings.announcementText;
  }

  // 4. Home Page Dynamic Text
  const heroTitleEl = document.querySelector('.hero-content h1');
  const heroSubtitleEl = document.querySelector('.hero-content p');
  const featuredTitleEl = document.getElementById('homeFeaturedTitle');
  const featuredSubtitleEl = document.getElementById('homeFeaturedSubtitle');

  if (heroTitleEl && siteSettings.heroTitle) heroTitleEl.innerHTML = siteSettings.heroTitle;
  if (heroSubtitleEl && siteSettings.heroSubtitle) heroSubtitleEl.textContent = siteSettings.heroSubtitle;
  if (featuredTitleEl && siteSettings.featuredTitle) featuredTitleEl.textContent = siteSettings.featuredTitle;
  if (featuredSubtitleEl && siteSettings.featuredSubtitle) featuredSubtitleEl.textContent = siteSettings.featuredSubtitle;

  // 5. Showcase Page Dynamic Text
  const shopBannerTitleEl = document.getElementById('shopBannerTitle');
  const shopBannerSubtitleEl = document.getElementById('shopBannerSubtitle');
  if (shopBannerTitleEl && siteSettings.shopBannerTitle) shopBannerTitleEl.textContent = siteSettings.shopBannerTitle;
  if (shopBannerSubtitleEl && siteSettings.shopBannerSubtitle) shopBannerSubtitleEl.textContent = siteSettings.shopBannerSubtitle;

  // 6. About Us Page Dynamic Text
  const aboutBannerTitleEl = document.getElementById('aboutBannerTitle');
  const aboutBannerSubtitleEl = document.getElementById('aboutBannerSubtitle');
  const aboutMainHeadlineEl = document.getElementById('aboutMainHeadline');
  const aboutText1El = document.getElementById('aboutText1');
  const aboutText2El = document.getElementById('aboutText2');

  if (aboutBannerTitleEl && siteSettings.aboutBannerTitle) aboutBannerTitleEl.textContent = siteSettings.aboutBannerTitle;
  if (aboutBannerSubtitleEl && siteSettings.aboutBannerSubtitle) aboutBannerSubtitleEl.textContent = siteSettings.aboutBannerSubtitle;
  if (aboutMainHeadlineEl && siteSettings.aboutTitle) aboutMainHeadlineEl.textContent = siteSettings.aboutTitle;
  if (aboutText1El && siteSettings.aboutText1) aboutText1El.textContent = siteSettings.aboutText1;
  if (aboutText2El && siteSettings.aboutText2) aboutText2El.textContent = siteSettings.aboutText2;

  // 7. Contact Support Page Dynamic Text
  const contactBannerTitleEl = document.getElementById('contactBannerTitle');
  const contactBannerSubtitleEl = document.getElementById('contactBannerSubtitle');
  const contactTitleEl = document.getElementById('contactTitle');
  const contactSubtitleEl = document.getElementById('contactSubtitle');
  const contactEmailDisplayEl = document.getElementById('contactEmailDisplay');
  const contactAddressDisplayEl = document.getElementById('contactAddressDisplay');

  if (contactBannerTitleEl && siteSettings.contactBannerTitle) contactBannerTitleEl.textContent = siteSettings.contactBannerTitle;
  if (contactBannerSubtitleEl && siteSettings.contactBannerSubtitle) contactBannerSubtitleEl.textContent = siteSettings.contactBannerSubtitle;
  if (contactTitleEl && siteSettings.contactTitle) contactTitleEl.textContent = siteSettings.contactTitle;
  if (contactSubtitleEl && siteSettings.contactSubtitle) contactSubtitleEl.textContent = siteSettings.contactSubtitle;
  if (contactEmailDisplayEl && siteSettings.contactEmail) contactEmailDisplayEl.textContent = siteSettings.contactEmail;
  if (contactAddressDisplayEl && siteSettings.contactAddress) contactAddressDisplayEl.textContent = siteSettings.contactAddress;

  // Apply Custom Page Banner Images dynamically
  if (siteSettings.heroBannerImg) {
    const heroEl = document.querySelector('#page-home .hero');
    if (heroEl) {
      heroEl.style.backgroundImage = `linear-gradient(135deg, rgba(27, 42, 38, 0.88), rgba(18, 26, 24, 0.95)), url('${siteSettings.heroBannerImg}')`;
    }
  }

  if (siteSettings.shopBannerImg) {
    const shopBannerEl = document.querySelector('#page-shop .page-banner');
    if (shopBannerEl) {
      shopBannerEl.style.backgroundImage = `linear-gradient(135deg, rgba(27, 42, 38, 0.88), rgba(18, 26, 24, 0.95)), url('${siteSettings.shopBannerImg}')`;
      shopBannerEl.style.backgroundSize = 'cover';
      shopBannerEl.style.backgroundPosition = 'center';
    }
  }

  if (siteSettings.aboutBannerImg) {
    const aboutBannerEl = document.querySelector('#page-about .page-banner');
    if (aboutBannerEl) {
      aboutBannerEl.style.backgroundImage = `linear-gradient(135deg, rgba(27, 42, 38, 0.88), rgba(18, 26, 24, 0.95)), url('${siteSettings.aboutBannerImg}')`;
      aboutBannerEl.style.backgroundSize = 'cover';
      aboutBannerEl.style.backgroundPosition = 'center';
    }
  }

  if (siteSettings.contactBannerImg) {
    const contactBannerEl = document.querySelector('#page-contact .page-banner');
    if (contactBannerEl) {
      contactBannerEl.style.backgroundImage = `linear-gradient(135deg, rgba(27, 42, 38, 0.88), rgba(18, 26, 24, 0.95)), url('${siteSettings.contactBannerImg}')`;
      contactBannerEl.style.backgroundSize = 'cover';
      contactBannerEl.style.backgroundPosition = 'center';
    }
  }

  // Update WhatsApp links
  const waPhone = siteSettings.whatsappPhone || '919876543210';
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.href = link.href.replace(/wa\.me\/\d+/, `wa.me/${waPhone.replace(/\D/g, '')}`);
  });

  const waDisplayEl = document.getElementById('contactWaDisplay');
  if (waDisplayEl) {
    waDisplayEl.textContent = `+${waPhone.replace(/\D/g, '')}`;
  }
}

// Helper for Generating WhatsApp Order Link in INR (₹)
function getWhatsAppLink(productName, price) {
  const phone = (siteSettings.whatsappPhone || '919876543210').replace(/\D/g, '');
  const text = `Hello Pantry Secrets! I would like to order: *${productName}* (₹${parseFloat(price).toLocaleString('en-IN')}). Please share payment and delivery details.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Navigation Router (SPA Switcher + #admin Secret Route)
function switchPage(pageId) {
  const targetPage = document.getElementById(`page-${pageId}`);
  if (!targetPage) return;

  document.querySelectorAll('.page-view').forEach(pg => pg.classList.remove('active'));
  targetPage.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.page === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (window.location.hash !== `#${pageId}`) {
    history.pushState(null, '', `#${pageId}`);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupNavigationRouter() {
  document.addEventListener('click', (e) => {
    const pageEl = e.target.closest('[data-page]');
    if (pageEl) {
      e.preventDefault();
      const pageId = pageEl.dataset.page;
      if (pageId === 'admin') {
        window.location.href = 'admin.html';
        return;
      }
      switchPage(pageId);
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    if (hash === 'admin') {
      window.location.href = 'admin.html';
      return;
    }
    switchPage(hash);
  });

  const initialHash = window.location.hash.replace('#', '') || 'home';
  if (initialHash === 'admin') {
    window.location.href = 'admin.html';
  } else {
    switchPage(initialHash);
  }
}

// Render Home Page Featured Items
function renderHomeFeatured() {
  if (!homeFeaturedGrid) return;
  const bestSellers = PRODUCTS.filter(p => p.bestSeller).slice(0, 4);
  homeFeaturedGrid.innerHTML = bestSellers.map(prod => createProductCardHTML(prod)).join('');
  attachCardEvents();
}

// Setup Event Listeners
function setupEventListeners() {
  searchInput.addEventListener('input', () => {
    const activePage = document.querySelector('.page-view.active');
    if (activePage && activePage.id !== 'page-shop') {
      switchPage('shop');
    }
    renderProducts();
  });

  document.querySelectorAll('.subnav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.subnav-link').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      
      switchPage('shop');
      renderProducts();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', renderProducts);
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phone = (siteSettings.whatsappPhone || '919876543210').replace(/\D/g, '');
      showToast('📩 Thank you! Opening WhatsApp for instant chat...');
      setTimeout(() => {
        window.open(`https://wa.me/${phone}?text=Hello%20Pantry%20Secrets!%20I%20have%20an%20inquiry%20regarding%20gourmet%20products.`, '_blank');
      }, 1000);
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('🎉 Thank you for joining the Culinary Club!');
      newsletterForm.reset();
    });
  }
}

// Filter and Render Products Grid
function renderProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  let filtered = PRODUCTS.filter(prod => {
    const categoryMatch = (activeCategory === 'all') || (prod.category === activeCategory);

    const searchMatch = !searchTerm || 
      prod.name.toLowerCase().includes(searchTerm) || 
      prod.description.toLowerCase().includes(searchTerm) ||
      prod.category.toLowerCase().includes(searchTerm);

    return categoryMatch && searchMatch;
  });

  if (sortSelect) {
    const sortMode = sortSelect.value;
    if (sortMode === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortMode === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  if (productCount) {
    productCount.textContent = filtered.length;
  }

  if (!productGrid) return;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-muted);">
        <i class="fa-solid fa-cookie-bite" style="font-size: 3.5rem; color: var(--color-border); margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">No gourmet items found</h3>
        <p>Try searching for a different item name or category.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(prod => createProductCardHTML(prod)).join('');
  attachCardEvents();
}

// Generate Product Card HTML with Rupee (₹) & WhatsApp Order CTA
function createProductCardHTML(prod) {
  const waUrl = getWhatsAppLink(prod.name, prod.price);

  return `
    <article class="product-card" data-id="${prod.id}">
      <div class="product-image-box">
        <img src="${prod.image}" alt="${prod.name}" loading="lazy">
        
        <div class="product-badges">
          ${prod.bestSeller ? '<span class="badge-tag best-seller">Best Seller</span>' : ''}
          ${prod.organic ? '<span class="badge-tag organic">100% Organic</span>' : ''}
          ${prod.sale ? '<span class="badge-tag sale">On Sale</span>' : ''}
        </div>

        <div class="quick-view-overlay">
          <button class="btn-quick-view" data-id="${prod.id}">
            <i class="fa-regular fa-eye"></i> Quick View
          </button>
        </div>
      </div>

      <div class="product-info">
        <span class="product-category">${prod.category}</span>
        <h3 class="product-title">${prod.name}</h3>
        
        <div class="product-rating">
          <span class="stars"><i class="fa-solid fa-star"></i> ${prod.rating}</span>
          <span>(${prod.reviewsCount || 50} reviews)</span>
        </div>

        <div class="product-bottom">
          <div class="price-box">
            <span class="current-price">₹${parseFloat(prod.price).toLocaleString('en-IN')}</span>
            ${prod.oldPrice ? `<span class="old-price">₹${parseFloat(prod.oldPrice).toLocaleString('en-IN')}</span>` : ''}
          </div>
          
          <a href="${waUrl}" target="_blank" class="btn-card-whatsapp">
            <i class="fa-brands fa-whatsapp"></i> Order on WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

// Attach Quick View Card Events
function attachCardEvents() {
  document.querySelectorAll('.btn-quick-view').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      openQuickView(id);
    };
  });
}

// Quick View Modal Render
function openQuickView(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const waUrl = getWhatsAppLink(prod.name, prod.price);

  quickViewContent.innerHTML = `
    <div>
      <img src="${prod.image}" alt="${prod.name}" class="quickview-img">
    </div>
    <div class="quickview-info">
      <span class="product-category">${prod.category}</span>
      <h2 class="quickview-title">${prod.name}</h2>
      
      <div class="product-rating" style="margin-bottom: 12px;">
        <span class="stars"><i class="fa-solid fa-star"></i> ${prod.rating}</span>
        <span>(${prod.reviewsCount || 50} customer reviews)</span>
      </div>

      <div class="quickview-price">₹${parseFloat(prod.price).toLocaleString('en-IN')} ${prod.oldPrice ? `<span class="old-price" style="font-size: 1rem;">₹${parseFloat(prod.oldPrice).toLocaleString('en-IN')}</span>` : ''}</div>
      <p class="quickview-desc">${prod.description}</p>

      <div class="quickview-meta">
        <p><strong>Ingredients:</strong> ${prod.ingredients || 'Natural organic ingredients'}</p>
        <p><strong>Origin:</strong> ${prod.origin || 'Artisan Estate'}</p>
        <p><strong>Net Weight / Vol:</strong> ${prod.size || 'Standard Jar'}</p>
      </div>

      <div style="margin-top: auto;">
        <a href="${waUrl}" target="_blank" class="btn-whatsapp" style="width: 100%; justify-content: center;">
          <i class="fa-brands fa-whatsapp"></i> Order ${prod.name} on WhatsApp
        </a>
      </div>
    </div>
  `;

  openModal(quickViewModal);
}

function openModal(modalEl) {
  if (modalEl) modalEl.classList.add('active');
}

function closeModal(modalEl) {
  if (modalEl) modalEl.classList.remove('active');
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = '#D32F2F';
  }
  toast.innerHTML = `<i class="${type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-brands fa-whatsapp'}" style="color: var(--color-whatsapp); font-size: 1.2rem;"></i> <span>${message}</span>`;
  
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
