// Pantry Secrets - Supabase Realtime Database Integration Client

const DEFAULT_SUPABASE_URL = 'https://zgmfrejfqxmlrtuvloot.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_dKd75Q1NaGEqgTpVFpATWQ_yuFXJDNx';

let supabaseClient = null;

// Initialize Supabase Client with saved or default credentials
function initSupabase() {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      return true;
    } catch (err) {
      console.error('Supabase initialization failed:', err);
      supabaseClient = null;
      return false;
    }
  }
  return false;
}

// Check if Supabase client instance exists
function isSupabaseConnected() {
  return supabaseClient !== null;
}

// Save Supabase Configuration Credentials with Auto-URL Helper
function saveSupabaseConfig(url, anonKey) {
  let cleanUrl = url.trim();

  // Auto-convert Supabase Dashboard URL (e.g. https://supabase.com/dashboard/project/zgmfrejfqxmlrtuvloot)
  if (cleanUrl.includes('supabase.com/dashboard/project/')) {
    const ref = cleanUrl.split('/project/')[1].split('/')[0];
    cleanUrl = `https://${ref}.supabase.co`;
  }

  const config = { url: cleanUrl, anonKey: anonKey.trim() };
  localStorage.setItem('pantrysecrets_supabase_config', JSON.stringify(config));
  return initSupabase();
}

// Get Saved or Default Supabase Credentials
function getSupabaseConfig() {
  const saved = JSON.parse(localStorage.getItem('pantrysecrets_supabase_config')) || {};
  let url = saved.url || DEFAULT_SUPABASE_URL;

  if (url.includes('supabase.com/dashboard/project/')) {
    const ref = url.split('/project/')[1].split('/')[0];
    url = `https://${ref}.supabase.co`;
  }

  return {
    url: url,
    anonKey: saved.anonKey || DEFAULT_SUPABASE_KEY
  };
}

// Diagnostic Test Function to Verify Live Connection & Tables
async function testSupabaseConnection() {
  const config = getSupabaseConfig();

  // Check if Anon Key is missing or invalid format (not starting with eyJ)
  if (!config.anonKey || !config.anonKey.startsWith('eyJ')) {
    return {
      success: false,
      status: 'key_format_error',
      message: '⚠️ Invalid Key Format: The key starting with "sb_publishable..." is a CLI token. Please copy the long `anon` `public` key starting with "eyJ..." from Supabase Dashboard > Project Settings > API.'
    };
  }

  if (!initSupabase()) {
    return {
      success: false,
      status: 'init_error',
      message: 'Failed to initialize Supabase client. Check your URL format.'
    };
  }

  try {
    // 1. Test query on products table
    const { data: prodData, error: prodError } = await supabaseClient.from('products').select('id').limit(1);
    
    if (prodError) {
      const errMsg = prodError.message || String(prodError);
      if (errMsg.includes('Failed to fetch') || errMsg.includes('TypeError') || errMsg.includes('fetch')) {
        return {
          success: false,
          status: 'network_fetch_error',
          message: '⚠️ Connection Failed ("Failed to fetch"): Please copy your long `anon` `public` key (starts with "eyJ...") from Supabase Dashboard > Project Settings > API.'
        };
      }
      if (prodError.code === '42P01' || errMsg.includes('relation') || errMsg.includes('does not exist')) {
        return {
          success: false,
          status: 'table_missing',
          message: 'Supabase connected! But "products" table was not found. Please run the SQL Setup Script in Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        status: 'api_error',
        message: `Supabase API Error: ${errMsg}`
      };
    }

    // 2. Test query on settings table
    const { data: setData, error: setError } = await supabaseClient.from('settings').select('id').limit(1);
    if (setError && (setError.code === '42P01' || setError.message.includes('relation') || setError.message.includes('does not exist'))) {
      return {
        success: false,
        status: 'table_missing',
        message: 'Supabase connected! But "settings" table was not found. Please run the SQL Setup Script in Supabase SQL Editor.'
      };
    }

    return {
      success: true,
      status: 'connected',
      message: '🟢 Supabase Cloud Database is properly connected and tables are ready!'
    };
  } catch (err) {
    const errMsg = err.message || String(err);
    if (errMsg.includes('Failed to fetch') || errMsg.includes('TypeError')) {
      return {
        success: false,
        status: 'network_fetch_error',
        message: '⚠️ Connection Failed ("Failed to fetch"): Please copy your `anon` `public` key (starting with "eyJ...") from your Supabase Dashboard > Project Settings > API.'
      };
    }
    return {
      success: false,
      status: 'network_error',
      message: `Connection failed: ${errMsg}`
    };
  }
}

// ==================== PRODUCTS SYNC ====================

// Fetch All Products from Supabase (Fallback to LocalStorage)
async function getProducts() {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: parseFloat(item.price),
          oldPrice: item.old_price ? parseFloat(item.old_price) : null,
          rating: item.rating ? parseFloat(item.rating) : 4.8,
          reviewsCount: item.reviews_count || 50,
          image: item.image,
          organic: item.organic || false,
          bestSeller: item.best_seller || false,
          sale: item.sale || false,
          description: item.description || '',
          ingredients: item.ingredients || '',
          origin: item.origin || '',
          size: item.size || ''
        }));
        localStorage.setItem('pantrysecrets_products', JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to LocalStorage:', err.message);
    }
  }
  return JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
}

// Save Single Product to Supabase + LocalStorage
async function saveProductToDB(product) {
  let localProducts = JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
  const idx = localProducts.findIndex(p => p.id === product.id);
  if (idx > -1) {
    localProducts[idx] = product;
  } else {
    localProducts.push(product);
  }
  localStorage.setItem('pantrysecrets_products', JSON.stringify(localProducts));

  if (isSupabaseConnected()) {
    try {
      const dbRow = {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        old_price: product.oldPrice,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        image: product.image,
        organic: product.organic,
        best_seller: product.bestSeller,
        sale: product.sale,
        description: product.description,
        ingredients: product.ingredients,
        origin: product.origin,
        size: product.size
      };

      const { error } = await supabaseClient.from('products').upsert(dbRow, { onConflict: 'id' });
      if (error) throw error;
      console.log('Product saved to Supabase:', product.id);
    } catch (err) {
      console.error('Supabase product save error:', err.message);
    }
  }
}

// Delete Product from Supabase + LocalStorage
async function deleteProductFromDB(productId) {
  let localProducts = JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
  localProducts = localProducts.filter(p => p.id !== productId);
  localStorage.setItem('pantrysecrets_products', JSON.stringify(localProducts));

  if (isSupabaseConnected()) {
    try {
      const { error } = await supabaseClient.from('products').delete().eq('id', productId);
      if (error) throw error;
      console.log('Product deleted from Supabase:', productId);
    } catch (err) {
      console.error('Supabase product delete error:', err.message);
    }
  }
}

// ==================== SITE SETTINGS SYNC ====================

// Fetch Site Settings from Supabase (Fallback to LocalStorage)
async function getSiteSettings() {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient.from('settings').select('*').eq('id', 'main_settings').single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.data) {
        localStorage.setItem('pantrysecrets_settings', JSON.stringify(data.data));
        return data.data;
      }
    } catch (err) {
      console.warn('Supabase settings fetch failed, falling back to LocalStorage:', err.message);
    }
  }
  return JSON.parse(localStorage.getItem('pantrysecrets_settings')) || null;
}

// Save Site Settings to Supabase + LocalStorage
async function saveSiteSettingsToDB(settings) {
  localStorage.setItem('pantrysecrets_settings', JSON.stringify(settings));

  if (isSupabaseConnected()) {
    try {
      const dbRow = {
        id: 'main_settings',
        data: settings,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient.from('settings').upsert(dbRow, { onConflict: 'id' });
      if (error) throw error;
      console.log('Settings synced to Supabase');
    } catch (err) {
      console.error('Supabase settings save error:', err.message);
    }
  }
}

// Bulk Sync Local Data to Supabase (One-Click Migration)
async function bulkSyncLocalToSupabase() {
  if (!isSupabaseConnected()) {
    throw new Error('Supabase is not connected. Please save URL & Anon Key first.');
  }

  const products = JSON.parse(localStorage.getItem('pantrysecrets_products')) || [];
  const settings = JSON.parse(localStorage.getItem('pantrysecrets_settings')) || {};

  if (products.length > 0) {
    const dbRows = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      old_price: p.oldPrice,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      image: p.image,
      organic: p.organic,
      best_seller: p.bestSeller,
      sale: p.sale,
      description: p.description,
      ingredients: p.ingredients,
      origin: p.origin,
      size: p.size
    }));

    const { error: prodError } = await supabaseClient.from('products').upsert(dbRows, { onConflict: 'id' });
    if (prodError) throw prodError;
  }

  const { error: setError } = await supabaseClient.from('settings').upsert({
    id: 'main_settings',
    data: settings,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });

  if (setError) throw setError;

  return true;
}

// Auto Init on script load
initSupabase();
