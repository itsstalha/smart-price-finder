import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [selectedProduct, setSelectedProduct] = useState('iphone-15');
  const [targetPrice, setTargetPrice] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState('Ready to scan prices...');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [priceHistory, setPriceHistory] = useState({});
  const [connectedUsers, setConnectedUsers] = useState(0);
  
  const scanIntervalRef = useRef(null);
  const wsRef = useRef(null);

  // Enhanced Product Database with Search URLs
  const products = {
    'iphone-15': {
      name: 'iPhone 15 Pro',
      category: 'smartphones',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      basePrice: 134900,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=iphone%2015%20pro',
        amazon: 'https://www.amazon.in/s?k=iphone+15+pro',
        croma: 'https://www.croma.com/search/?q=iphone%2015%20pro'
      }
    },
    'samsung-s23': {
      name: 'Samsung Galaxy S23',
      category: 'smartphones',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      basePrice: 84999,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=samsung%20galaxy%20s23',
        amazon: 'https://www.amazon.in/s?k=samsung+galaxy+s23',
        croma: 'https://www.croma.com/search/?q=samsung%20galaxy%20s23'
      }
    },
    'oneplus-11': {
      name: 'OnePlus 11 5G',
      category: 'smartphones',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
      basePrice: 56999,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=oneplus%2011',
        amazon: 'https://www.amazon.in/s?k=oneplus+11',
        croma: 'https://www.croma.com/search/?q=oneplus%2011'
      }
    },
    'macbook-air': {
      name: 'MacBook Air M2',
      category: 'laptops',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop',
      basePrice: 114900,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=macbook%20air%20m2',
        amazon: 'https://www.amazon.in/s?k=macbook+air+m2',
        croma: 'https://www.croma.com/search/?q=macbook%20air%20m2'
      }
    },
    'dell-xps': {
      name: 'Dell XPS 13',
      category: 'laptops',
      image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop',
      basePrice: 124990,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=dell%20xps%2013',
        amazon: 'https://www.amazon.in/s?k=dell+xps+13',
        croma: 'https://www.croma.com/search/?q=dell%20xps%2013'
      }
    },
    'samsung-tv': {
      name: 'Samsung 55" QLED TV',
      category: 'televisions',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
      basePrice: 64999,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=samsung%2055%20qled%20tv',
        amazon: 'https://www.amazon.in/s?k=samsung+55+qled+tv',
        croma: 'https://www.croma.com/search/?q=samsung%2055%20qled%20tv'
      }
    },
    'lg-oled': {
      name: 'LG 65" OLED TV',
      category: 'televisions',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop',
      basePrice: 139999,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=lg%2065%20oled%20tv',
        amazon: 'https://www.amazon.in/s?k=lg+65+oled+tv',
        croma: 'https://www.croma.com/search/?q=lg%2065%20oled%20tv'
      }
    },
    'sony-headphones': {
      name: 'Sony WH-1000XM4',
      category: 'audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      basePrice: 24990,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=sony%20wh%201000xm4',
        amazon: 'https://www.amazon.in/s?k=sony+wh+1000xm4',
        croma: 'https://www.croma.com/search/?q=sony%20wh%201000xm4'
      }
    },
    'airpods-pro': {
      name: 'Apple AirPods Pro',
      category: 'audio',
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
      basePrice: 24900,
      urls: {
        flipkart: 'https://www.flipkart.com/search?q=airpods%20pro',
        amazon: 'https://www.amazon.in/s?k=airpods+pro',
        croma: 'https://www.croma.com/search/?q=airpods%20pro'
      }
    }
  };

  // Categories
  const categories = {
    'all': 'All Products',
    'smartphones': '📱 Smartphones',
    'laptops': '💻 Laptops', 
    'televisions': '📺 Televisions',
    'audio': '🎧 Audio'
  };

  // WebSocket Simulation for Real-time Updates
  useEffect(() => {
    if (realTimeUpdates) {
      // Simulate WebSocket connection
      simulateWebSocketConnection();
      
      // Start periodic scanning
      scanIntervalRef.current = setInterval(() => {
        if (selectedProduct) {
          performPriceScan(true);
        }
      }, 30000); // Scan every 30 seconds

      return () => {
        if (scanIntervalRef.current) {
          clearInterval(scanIntervalRef.current);
        }
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [realTimeUpdates, selectedProduct]);

  // Simulate WebSocket for real-time features
  const simulateWebSocketConnection = () => {
    // Simulate connecting users
    setConnectedUsers(Math.floor(Math.random() * 100) + 50);
    
    // Simulate real-time user activities
    const activityInterval = setInterval(() => {
      if (!realTimeUpdates) {
        clearInterval(activityInterval);
        return;
      }
      
      const activities = [
        `👤 User just bought ${products[selectedProduct]?.name} from Amazon`,
        `📈 Price trending down for ${products[selectedProduct]?.name}`,
        `🔥 Hot deal spotted by 3 users`,
        `🚚 Free delivery available on Flipkart`
      ];
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      addNotification(randomActivity, 'activity');
      
      // Update connected users randomly
      setConnectedUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 15000);

    return () => clearInterval(activityInterval);
  };

  // Enhanced price generation with real-time fluctuations
  const generateRealisticPrices = (basePrice, previousPrices = null) => {
    const variations = {
      flipkart: { min: 0.85, max: 0.95, rating: 4.3, volatility: 0.02 },
      amazon: { min: 0.88, max: 0.98, rating: 4.5, volatility: 0.015 },
      croma: { min: 0.90, max: 1.0, rating: 4.2, volatility: 0.025 }
    };

    const prices = {};
    Object.keys(variations).forEach(site => {
      const variation = variations[site];
      
      // Calculate price with volatility
      let priceMultiplier;
      if (previousPrices && previousPrices[site]) {
        // Add small random fluctuation based on previous price
        const previousPrice = previousPrices[site].numericPrice;
        const fluctuation = (Math.random() - 0.5) * 2 * variation.volatility;
        priceMultiplier = (previousPrice / basePrice) + fluctuation;
        priceMultiplier = Math.max(variation.min, Math.min(variation.max, priceMultiplier));
      } else {
        priceMultiplier = variation.min + Math.random() * (variation.max - variation.min);
      }
      
      const price = Math.round(basePrice * priceMultiplier / 100) * 100;
      
      // Simulate stock changes
      const stockProbability = Math.random();
      const inStock = stockProbability > 0.15;
      const lowStock = inStock && stockProbability < 0.3;
      
      prices[site] = {
        price: `₹${price.toLocaleString()}`,
        numericPrice: price,
        timestamp: new Date().toLocaleTimeString(),
        rating: (variation.rating + Math.random() * 0.4).toFixed(1),
        inStock,
        lowStock,
        delivery: Math.random() > 0.3 ? 'Free Delivery' : 'Delivery Charges Apply',
        offers: generateOffers(),
        priceChange: previousPrices ? calculatePriceChange(previousPrices[site]?.numericPrice, price) : 0
      };
    });

    return prices;
  };

  const generateOffers = () => {
    const allOffers = ['Bank Offer', 'Cashback', 'No Cost EMI', 'Exchange Offer', 'Special Discount'];
    const activeOffers = [];
    const numOffers = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numOffers; i++) {
      const randomOffer = allOffers[Math.floor(Math.random() * allOffers.length)];
      if (!activeOffers.includes(randomOffer)) {
        activeOffers.push(randomOffer);
      }
    }
    
    return activeOffers.length > 0 ? activeOffers : ['No offers'];
  };

  const calculatePriceChange = (previousPrice, currentPrice) => {
    if (!previousPrice) return 0;
    return currentPrice - previousPrice;
  };

  // Enhanced scan function with real-time capabilities
  const performPriceScan = async (isBackgroundUpdate = false) => {
    if (!selectedProduct && !isBackgroundUpdate) {
      addNotification('❌ Please select a product first!', 'error');
      return;
    }

    if (!isBackgroundUpdate) {
      setIsScanning(true);
      setStatus('Starting real-time price scan...');
    }

    const selectedProductData = products[selectedProduct];
    
    if (!isBackgroundUpdate) {
      // Simulate progressive scanning for manual scans
      const scanSteps = [
        'Connecting to Flipkart...',
        'Scanning Amazon prices...',
        'Checking Croma inventory...',
        'Analyzing price trends...',
        'Finalizing best deal...'
      ];

      for (let i = 0; i < scanSteps.length; i++) {
        setStatus(scanSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    // Get previous prices for comparison
    const previousPrices = results?.prices || null;
    
    // Generate prices with real-time fluctuations
    const prices = generateRealisticPrices(selectedProductData.basePrice, previousPrices);
    
    // Add URLs to prices
    Object.keys(prices).forEach(site => {
      prices[site].url = selectedProductData.urls[site];
    });

    const scanResults = {
      product: selectedProductData.name,
      category: selectedProductData.category,
      image: selectedProductData.image,
      scanTime: new Date().toLocaleString(),
      lastUpdate: new Date().toLocaleTimeString(),
      prices: prices,
      isRealTimeUpdate: isBackgroundUpdate
    };

    // Find best price
    const priceEntries = Object.entries(scanResults.prices);
    let bestPrice = priceEntries[0];
    
    priceEntries.forEach(([site, data]) => {
      if (data.numericPrice < bestPrice[1].numericPrice) {
        bestPrice = [site, data];
      }
    });
    
    scanResults.bestPrice = bestPrice[0];
    scanResults.savings = Math.round(selectedProductData.basePrice - bestPrice[1].numericPrice);

    // Update price history
    updatePriceHistory(selectedProduct, scanResults.prices);

    setResults(scanResults);
    
    if (!isBackgroundUpdate) {
      setIsScanning(false);
      setStatus('Scan completed successfully! ✅');
      addNotification(`✅ Price scan completed for ${selectedProductData.name}`, 'success');
    }

    // Check for price alerts and changes
    checkRealTimeAlerts(scanResults, previousPrices, isBackgroundUpdate);
  };

  const updatePriceHistory = (productId, currentPrices) => {
    const timestamp = Date.now();
    const newHistory = { ...priceHistory };
    
    if (!newHistory[productId]) {
      newHistory[productId] = [];
    }
    
    // Store price snapshot
    const priceSnapshot = {
      timestamp,
      time: new Date().toLocaleTimeString(),
      prices: Object.keys(currentPrices).reduce((acc, site) => {
        acc[site] = currentPrices[site].numericPrice;
        return acc;
      }, {})
    };
    
    newHistory[productId].push(priceSnapshot);
    
    // Keep only last 50 records
    if (newHistory[productId].length > 50) {
      newHistory[productId] = newHistory[productId].slice(-50);
    }
    
    setPriceHistory(newHistory);
  };

  const checkRealTimeAlerts = (currentResults, previousPrices, isBackgroundUpdate) => {
    if (!previousPrices) return;

    Object.entries(currentResults.prices).forEach(([site, currentData]) => {
      const previousData = previousPrices[site];
      
      if (previousData) {
        const priceChange = currentData.priceChange;
        const changePercent = (priceChange / previousData.numericPrice) * 100;

        // Price drop alert
        if (priceChange < 0 && Math.abs(changePercent) > 2) {
          const message = `📉 Price dropped on ${site}! Was ₹${previousData.numericPrice.toLocaleString()}, now ${currentData.price} (${Math.abs(changePercent).toFixed(1)}% off)`;
          addNotification(message, 'alert');
        }
        
        // Price increase alert
        if (priceChange > 0 && changePercent > 1) {
          const message = `📈 Price increased on ${site}! Was ₹${previousData.numericPrice.toLocaleString()}, now ${currentData.price}`;
          addNotification(message, 'warning');
        }

        // Stock status change
        if (previousData.inStock && !currentData.inStock) {
          addNotification(`❌ ${site} is now out of stock for ${currentResults.product}`, 'warning');
        }
        
        if (!previousData.inStock && currentData.inStock) {
          addNotification(`✅ ${site} is back in stock for ${currentResults.product}`, 'success');
        }
      }
    });

    // Target price alerts
    if (targetPrice) {
      const target = parseInt(targetPrice.replace(/[^0-9]/g, ''));
      Object.entries(currentResults.prices).forEach(([site, data]) => {
        if (data.numericPrice <= target) {
          addNotification(`🎯 TARGET HIT! ${site} has ${data.price} (below your target ₹${target.toLocaleString()})`, 'alert');
        }
      });
    }

    // Best price change alert
    if (previousPrices && currentResults.bestPrice !== Object.keys(previousPrices)[0]) {
      addNotification(`🔄 Best price changed! Now on ${currentResults.bestPrice}`, 'info');
    }
  };

  // Enhanced URL handler with search links
  const openUrl = (url, website, productName) => {
    if (url && url.startsWith('http')) {
      // Add notification for tracking
      addNotification(`🛒 Opening ${website} for ${productName}...`, 'info');
      
      // Open in new tab
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      // Check if the window was blocked (popup blocker)
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        addNotification(`❌ Popup blocked! Please allow popups for ${website} or click the link manually.`, 'error');
        
        // Provide alternative - copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            addNotification(`📋 Link copied to clipboard! Paste it in your browser.`, 'success');
          });
        }
      }
    } else {
      addNotification(`❌ Invalid URL for ${website}`, 'error');
    }
  };

  // Real-time scanning control
  const toggleRealTimeUpdates = () => {
    if (realTimeUpdates) {
      // Stop real-time updates
      setRealTimeUpdates(false);
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      addNotification('⏸️ Real-time updates paused', 'info');
    } else {
      // Start real-time updates
      setRealTimeUpdates(true);
      if (selectedProduct) {
        addNotification('🔄 Real-time updates enabled - scanning every 30 seconds', 'success');
      } else {
        addNotification('⚠️ Select a product to start real-time monitoring', 'warning');
      }
    }
  };

  const scanPrices = () => {
    performPriceScan(false);
  };

  // Enhanced notification system
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  };

  const clearNotifications = () => {
    if (notifications.length > 0) {
      addNotification('🗑️ All notifications cleared', 'info');
      setNotifications([]);
    }
  };

  const getNotificationsCount = () => {
    return notifications.filter(n => n.type === 'alert').length;
  };

  const setPriceAlert = () => {
    if (targetPrice) {
      const numericPrice = parseInt(targetPrice.replace(/[^0-9]/g, ''));
      if (numericPrice > 0) {
        addNotification(`🔔 Price alert set for ₹${numericPrice.toLocaleString()}`, 'success');
      } else {
        addNotification('❌ Please enter a valid price', 'error');
      }
    } else {
      addNotification('❌ Please enter a target price first', 'error');
    }
  };

  // Filter products by category and search
  const filteredProducts = Object.entries(products).filter(([id, product]) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-clear old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(notification => {
        const notificationTime = new Date(notification.id);
        const currentTime = new Date();
        return (currentTime - notificationTime) < 300000; // 5 minutes
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">🛍️ Real-Time Price Tracker</h1>
          <p className="app-subtitle">
            Live price monitoring across Flipkart, Amazon, and Croma
            {realTimeUpdates && <span className="live-indicator"> • 🔴 LIVE</span>}
          </p>
          <div className="header-stats">
            <span className="stat-item">👥 {connectedUsers} users online</span>
            <span className="stat-item">
              {realTimeUpdates ? '🔄 Auto-updating' : '⏸️ Manual mode'}
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Panel - Controls */}
          <div className="control-panel">
            <div className="control-section">
              <h3>🔍 Search Products</h3>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="control-section">
              <h3>📦 Product Categories</h3>
              <div className="category-tabs">
                {Object.entries(categories).map(([id, name]) => (
                  <button
                    key={id}
                    className={`category-tab ${activeCategory === id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(id)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-section">
              <h3>🔍 Select Product</h3>
              <div className="product-list">
                {filteredProducts.length === 0 ? (
                  <div className="no-products">
                    No products found matching your search.
                  </div>
                ) : (
                  filteredProducts.map(([id, product]) => (
                    <div
                      key={id}
                      className={`product-item ${selectedProduct === id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedProduct(id);
                        addNotification(`📱 Selected: ${product.name}`, 'info');
                        if (realTimeUpdates) {
                          addNotification('🔄 Real-time monitoring active for this product', 'success');
                        }
                      }}
                    >
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-category">{categories[product.category]}</div>
                        <div className="product-base-price">
                          MRP: ₹{product.basePrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="control-section">
              <h3>🔔 Price Alert</h3>
              <div className="form-group">
                <label>Notify me when price drops below:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter target price (e.g., 45000)"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
              <button 
                className="btn btn-secondary"
                onClick={setPriceAlert}
              >
                🎯 Set Price Alert
              </button>
            </div>

            <div className="control-section">
              <h3>⚡ Real-Time Controls</h3>
              <button 
                className={`btn ${realTimeUpdates ? 'btn-warning' : 'btn-success'}`}
                onClick={toggleRealTimeUpdates}
              >
                {realTimeUpdates ? '⏸️ Pause Real-Time' : '🔴 Start Real-Time'}
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={scanPrices}
                disabled={isScanning}
              >
                {isScanning ? '🔄 Scanning...' : '🔍 Scan Now'}
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              >
                🗑️ Clear Notifications ({notifications.length})
              </button>
            </div>

            <div className="status-bar">
              📊 {status}
              {realTimeUpdates && <span className="real-time-badge">LIVE</span>}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="results-panel">
            <div className="results-header">
              <h2 className="results-title">
                📊 Live Price Comparison
                {results?.isRealTimeUpdate && <span className="real-time-update">🔄 Updated</span>}
              </h2>
              {results && (
                <span className="alert-badge">
                  Updated: {results.lastUpdate}
                </span>
              )}
            </div>

            {/* Loading */}
            {isScanning && (
              <div className="loading">
                <div className="spinner"></div>
                <p>{status}</p>
                <div className="scanning-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results && !isScanning && (
              <div className="price-results">
                <div className="product-header">
                  <img 
                    src={results.image} 
                    alt={results.product}
                    className="product-image-large"
                  />
                  <div className="product-info">
                    <h3>{results.product}</h3>
                    <p className="product-category">{categories[results.category]}</p>
                    <div className="product-scan-info">
                      Last scan: {results.scanTime}
                      {realTimeUpdates && <span className="auto-scan"> • Auto-scanning</span>}
                    </div>
                  </div>
                </div>
                
                <div className="price-cards">
                  {Object.entries(results.prices).map(([website, data]) => (
                    <div 
                      key={website}
                      className={`price-card ${results.bestPrice === website ? 'best-price' : ''}`}
                    >
                      <div className="website-header">
                        <div className="website-name">
                          {website.charAt(0).toUpperCase() + website.slice(1)}
                          {results.bestPrice === website && ' 🏆 Best Price'}
                        </div>
                        <div className="website-rating">⭐ {data.rating}</div>
                      </div>
                      
                      <div className="price-amount">{data.price}</div>
                      
                      {/* Price Change Indicator */}
                      {data.priceChange !== 0 && (
                        <div className={`price-change ${data.priceChange < 0 ? 'price-drop' : 'price-rise'}`}>
                          {data.priceChange < 0 ? '📉' : '📈'} 
                          ₹{Math.abs(data.priceChange).toLocaleString()}
                        </div>
                      )}
                      
                      <div className="price-savings">
                        You save: ₹{(products[selectedProduct].basePrice - data.numericPrice).toLocaleString()}
                      </div>
                      
                      <div className="stock-status">
                        {data.inStock ? 
                          (data.lowStock ? '⚠️ Low Stock' : '✅ In Stock') : 
                          '❌ Out of Stock'
                        }
                      </div>
                      
                      <div className="delivery-info">{data.delivery}</div>
                      
                      <div className="offers">
                        {data.offers.map((offer, index) => (
                          <span key={index} className="offer-badge">{offer}</span>
                        ))}
                      </div>
                      
                      <div className="price-time">Updated: {data.timestamp}</div>
                      
                      <button 
                        className="visit-store-btn"
                        onClick={() => openUrl(data.url, website, results.product)}
                        disabled={!data.inStock}
                      >
                        {data.inStock ? 'Visit Store →' : 'Out of Stock'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Best Price Summary */}
                {results.bestPrice && (
                  <div className="best-price-summary">
                    <h4>🎉 Best Deal Found!</h4>
                    <p>
                      <strong>{results.bestPrice.charAt(0).toUpperCase() + results.bestPrice.slice(1)}</strong> 
                      {' '}offers the best price at {results.prices[results.bestPrice].price}
                    </p>
                    <p>Total Savings: ₹{results.savings.toLocaleString()}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => openUrl(results.prices[results.bestPrice].url, results.bestPrice, results.product)}
                    >
                      🛒 Buy Now on {results.bestPrice.charAt(0).toUpperCase() + results.bestPrice.slice(1)}
                    </button>
                  </div>
                )}

                {/* Real-time Status */}
                {realTimeUpdates && (
                  <div className="real-time-status">
                    <div className="real-time-indicator">
                      <span className="pulse"></span>
                      Live monitoring active • Next scan in 30 seconds
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!results && !isScanning && (
              <div className="no-results">
                <div className="no-results-content">
                  <h3>👆 Start Price Monitoring</h3>
                  <p>Select a product and start scanning to compare prices across all stores.</p>
                  <div className="feature-list">
                    <div className="feature-item">
                      <span className="feature-icon">🔴</span>
                      <div>
                        <strong>Real-time Updates</strong>
                        <small>Auto-refresh every 30 seconds</small>
                      </div>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📉</span>
                      <div>
                        <strong>Price Change Alerts</strong>
                        <small>Instant notifications for price drops</small>
                      </div>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🎯</span>
                      <div>
                        <strong>Target Price Alerts</strong>
                        <small>Get notified when price hits your target</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Notifications Section */}
            <div className="notifications">
              <h3>
                🔔 Live Notifications 
                {getNotificationsCount() > 0 && (
                  <span className="alert-badge">{getNotificationsCount()} Alerts</span>
                )}
              </h3>
              
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <p>No notifications yet</p>
                  <small>Enable real-time updates to get live alerts</small>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-meta">
                        <span className="notification-time">{notification.timestamp}</span>
                        <span className="notification-type">{notification.type.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;