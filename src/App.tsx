import React, { useState, useEffect } from 'react';
import { Coffee, Pizza, Salad, IceCream, Plus, Clock, Settings, Edit, Trash, Save } from 'lucide-react';

type OrderType = 'dine-in' | 'delivery';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface OrderItem extends MenuItem {
  quantity: number;
}

const BUSINESS_HOURS = {
  opening: 10,
  closing: 22,  // 10 PM in 24-hour format
};

const initialMenuItems: MenuItem[] = [
  { id: '1', name: 'Cappuccino', price: 120, category: 'Beverages', description: 'Rich espresso with steamed milk foam' },
  { id: '2', name: 'Cold Coffee', price: 140, category: 'Beverages', description: 'Chilled coffee blend with cream' },
  { id: '3', name: 'Green Tea', price: 80, category: 'Beverages', description: 'Premium Japanese green tea' },
  { id: '4', name: 'Fresh Lime Soda', price: 70, category: 'Beverages', description: 'Refreshing lime soda with mint' },
  { id: '5', name: 'Veg Sandwich', price: 90, category: 'Main Course', description: 'Grilled vegetables with cheese' },
  { id: '6', name: 'Pasta Alfredo', price: 180, category: 'Main Course', description: 'Creamy white sauce pasta' },
  { id: '7', name: 'Margherita Pizza', price: 220, category: 'Main Course', description: 'Classic tomato and cheese pizza' },
  { id: '8', name: 'Veggie Burger', price: 150, category: 'Main Course', description: 'Garden fresh vegetable patty' },
  { id: '9', name: 'Greek Salad', price: 160, category: 'Salads', description: 'Fresh vegetables with feta cheese' },
  { id: '10', name: 'Caesar Salad', price: 180, category: 'Salads', description: 'Crispy lettuce with classic dressing' },
  { id: '11', name: 'Chocolate Brownie', price: 120, category: 'Desserts', description: 'Warm chocolate brownie' },
  { id: '12', name: 'Ice Cream Sundae', price: 150, category: 'Desserts', description: 'Assorted ice creams with toppings' },
  { id: '13', name: 'Tiramisu', price: 180, category: 'Desserts', description: 'Classic Italian coffee dessert' }
];

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Beverages':
      return <Coffee className="w-5 h-5" />;
    case 'Main Course':
      return <Pizza className="w-5 h-5" />;
    case 'Salads':
      return <Salad className="w-5 h-5" />;
    case 'Desserts':
      return <IceCream className="w-5 h-5" />;
    default:
      return null;
  }
};

function App() {
  const [guestName, setGuestName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isGuestInfoSubmitted, setIsGuestInfoSubmitted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: OrderItem }>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [whatsappNumber, setWhatsappNumber] = useState('918209349602');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    category: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentTime(now);
      setIsOpen(hour >= BUSINESS_HOURS.opening && hour < BUSINESS_HOURS.closing);
    };
    
    // Check immediately
    checkIfOpen();
    
    // Then set up interval
    const timer = setInterval(checkIfOpen, 60000);
    
    return () => clearInterval(timer);
  }, []);  // No need for dependencies as checkIfOpen uses fresh data

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      alert('Please enter your table number.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter your delivery address.');
      return;
    }

    if (guestName.trim() === 'admin' && tableNumber === '123') {
      setIsAdmin(true);
      setShowAdminPanel(true);
    }

    setIsGuestInfoSubmitted(true);
  };

  const addItem = (item: MenuItem) => {
    if (!isOpen && !isAdmin) {
      alert(`We're currently closed. Our business hours are ${BUSINESS_HOURS.opening}:00 AM - ${BUSINESS_HOURS.closing}:00 PM`);
      return;
    }
    setSelectedItems(prev => ({
      ...prev,
      [item.name]: {
        ...item,
        quantity: (prev[item.name]?.quantity || 0) + 1
      }
    }));
  };

  const removeItem = (itemName: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemName].quantity > 1) {
        newItems[itemName].quantity--;
      } else {
        delete newItems[itemName];
      }
      return newItems;
    });
  };

  const getTotalAmount = () => {
    return Object.values(selectedItems).reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleOrder = () => {
    if (!isOpen && !isAdmin) {
      alert(`We're currently closed. Our business hours are ${BUSINESS_HOURS.opening}:00 AM - ${BUSINESS_HOURS.closing}:00 PM`);
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one item.');
      return;
    }

    setIsLoading(true);
    
    const itemsByCategory = Object.values(selectedItems).reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);

    let message = `🍽️ *New Order!*\n\n`;
    message += `👤 *Name:* ${guestName}\n`;
    if (orderType === 'dine-in') {
      message += `🪑 *Table Number:* ${tableNumber}\n`;
    } else {
      message += `📍 *Delivery Address:* ${deliveryAddress}\n`;
    }
    message += `\n📝 *Order Details:*\n`;

    Object.entries(itemsByCategory).forEach(([category, items]) => {
      message += `\n*${category}:*\n`;
      items.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - Rs. ${item.price * item.quantity}\n`;
      });
    });

    message += `\n💰 *Total Amount:* Rs. ${getTotalAmount()}\n`;
    message += `\n💡 *Tip:* Type "menu" to see our complete menu!\n`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setIsLoading(false);
  };

  const handleViewMenu = () => {
    const menuMessage = generateMenuMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(menuMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateMenuMessage = () => {
    let message = `🍽️ *Cafe BrewBite Menu*\n\n`;
    message += `Welcome to Cafe BrewBite! Here's our menu:\n\n`;

    const categories = Array.from(new Set(menuItems.map(item => item.category)));
    
    categories.forEach(category => {
      message += `*${category}*\n`;
      const categoryItems = menuItems.filter(item => item.category === category);
      categoryItems.forEach(item => {
        message += `• ${item.name} - Rs. ${item.price}\n   _${item.description}_\n`;
      });
      message += '\n';
    });

    message += `\n📱 *How to Order:*\n`;
    message += `1. Type "menu" to see this menu again\n`;
    message += `2. To place an order, please provide:\n`;
    message += `   - Your name\n`;
    message += `   - Delivery address or Table number\n`;
    message += `   - List of items with quantities\n\n`;
    message += `⏰ *Business Hours:* ${BUSINESS_HOURS.opening}:00 AM - ${BUSINESS_HOURS.closing}:00 PM\n\n`;
    message += `Thank you for choosing Cafe BrewBite! 🙏`;

    return message;
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleAddNewItem = () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      alert('Please fill in all required fields');
      return;
    }

    const newItemWithId: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      price: newItem.price,
      description: newItem.description || ''
    };

    setMenuItems(prev => [...prev, newItemWithId]);
    setNewItem({ name: '', price: 0, category: '', description: '' });
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-center pb-20">
      <header className="bg-gradient-to-r from-primary-dark to-primary text-white p-4 sm:p-5 md:p-6 sticky top-0 z-50 shadow-md">
        <div className={`flex items-center ${isAdmin ? 'justify-between' : 'justify-center'} max-w-6xl mx-auto`}>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Welcome to Cafe BrewBite</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base opacity-90 font-light">Scan. Select. Send. Enjoy.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 md:mt-4">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          <p className={`text-xs sm:text-sm ${isOpen || isAdmin ? 'text-secondary-light' : 'text-red-300'}`}>
            {isOpen || isAdmin ? 'open now' : 'closed'} • {formatTime(currentTime)}
          </p>
        </div>
        <p className="text-xs mt-1 opacity-85 text-center">
          Business Hours: {BUSINESS_HOURS.opening}:00 AM - {BUSINESS_HOURS.closing > 12 ? BUSINESS_HOURS.closing - 12 : BUSINESS_HOURS.closing}:00 PM
        </p>
      </header>

      {showAdminPanel && (
        <div className="bg-white shadow-card rounded-xl p-5 sm:p-7 mb-8 max-w-4xl mx-auto m-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-primary border-b border-gray-100 pb-3">Admin Panel</h2>
          <div className="grid grid-cols-1 gap-7">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="font-medium mb-4 text-lg text-primary-light">Business Hours</h3>
              <div className="flex gap-5 items-center">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={BUSINESS_HOURS.opening}
                  className="w-24 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  onChange={(e) => {
                    BUSINESS_HOURS.opening = parseInt(e.target.value);
                    setIsOpen(currentTime.getHours() >= BUSINESS_HOURS.opening && currentTime.getHours() < BUSINESS_HOURS.closing);
                  }}
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={BUSINESS_HOURS.closing}
                  className="w-24 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  onChange={(e) => {
                    BUSINESS_HOURS.closing = parseInt(e.target.value);
                    setIsOpen(currentTime.getHours() >= BUSINESS_HOURS.opening && currentTime.getHours() < BUSINESS_HOURS.closing);
                  }}
                />
              </div>
            </div>
            
            {/* Other admin panels with similar styling */}
          </div>
        </div>
      )}

      {!isGuestInfoSubmitted ? (
        <div className="max-w-md mx-auto mt-8 sm:mt-12 p-6 sm:p-8 bg-neutral-card rounded-lg shadow-card m-4 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-primary">Enter Your Details</h2>
          <form onSubmit={handleGuestInfoSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-3 sm:p-3.5 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setOrderType('dine-in')}
                className={`flex-1 py-3 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  orderType === 'dine-in'
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dine In
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex-1 py-3 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  orderType === 'delivery'
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Delivery
              </button>
            </div>
            {orderType === 'dine-in' ? (
              <div>
                <input
                  type="text"
                  placeholder="Table Number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            ) : (
              <div>
                <textarea
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg transition-all duration-300 text-base font-medium ${
                isOpen || isAdmin 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:-translate-y-0.5' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isOpen && !isAdmin}
            >
              {isOpen || isAdmin ? 'Continue to Menu' : 'Currently Closed'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 sticky top-[104px] sm:top-[120px] z-40">
            <p className="text-gray-600 text-sm sm:text-base">
              {orderType === 'dine-in' ? (
                <>Guest: <span className="font-semibold">{guestName}</span> | Table: <span className="font-semibold">{tableNumber}</span></>
              ) : (
                <>Name: <span className="font-semibold">{guestName}</span> | Delivery</>
              )}
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            {categories.map(category => (
              <div key={category} className="mb-8 sm:mb-12 md:mb-16">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
                  <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full">
                    <CategoryIcon category={category} />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary">{category}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-7">
                  {menuItems
                    .filter(item => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-neutral-card rounded-xl p-5 sm:p-6 shadow-card transform transition-all duration-300 hover:shadow-elegant hover:scale-[1.02] border border-gray-100"
                      >
                        <h3 className="text-lg sm:text-xl font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1.5 mb-3">{item.description}</p>
                        <p className="text-secondary-dark font-bold mb-4 sm:mb-5 text-lg">Rs. {item.price}</p>
                        
                        {!selectedItems[item.name] ? (
                          <button
                            onClick={() => addItem(item)}
                            className={`w-full py-3 md:py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                              isOpen || isAdmin 
                                ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:-translate-y-0.5' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!isOpen && !isAdmin}
                          >
                            <Plus className="w-5 h-5 md:w-4 md:h-4" />
                            {isOpen || isAdmin ? 'Add to Order' : 'Currently Closed'}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                            <button
                              onClick={() => removeItem(item.name)}
                              className="bg-white text-gray-700 w-10 h-10 md:w-9 md:h-9 rounded-lg flex items-center justify-center shadow-sm text-lg hover:bg-gray-50 transition-colors"
                              disabled={!isOpen && !isAdmin}
                            >
                              -
                            </button>
                            <span className="font-medium text-base text-primary">{selectedItems[item.name].quantity}</span>
                            <button
                              onClick={() => addItem(item)}
                              className="bg-white text-gray-700 w-10 h-10 md:w-9 md:h-9 rounded-lg flex items-center justify-center shadow-sm text-lg hover:bg-gray-50 transition-colors"
                              disabled={!isOpen && !isAdmin}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(selectedItems).length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-50 border-t border-gray-100">
              <div className="max-w-md mx-auto flex justify-between items-center">
                <div className="text-left">
                  <p className="text-xs sm:text-sm text-gray-600">Total Items: {Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0)}</p>
                  <p className="font-semibold text-base sm:text-lg text-primary">Total: Rs. {getTotalAmount()}</p>
                </div>
                <button
                  onClick={handleOrder}
                  disabled={isLoading || (!isOpen && !isAdmin)}
                  className={`px-4 sm:px-5 md:px-7 py-3 sm:py-2.5 md:py-3 rounded-lg transition-all duration-300 font-medium ${
                    isOpen || isAdmin 
                      ? 'bg-secondary hover:bg-secondary-dark text-white hover:shadow-lg hover:-translate-y-0.5' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } ${isLoading ? 'opacity-70' : ''}`}
                >
                  {isLoading ? 'Processing...' : (isOpen || isAdmin ? 'Order Now' : 'Currently Closed')}
                </button>
              </div>
            </div>
          )}

          <section className="mt-8 sm:mt-12 md:mt-16 mb-16 sm:mb-20 md:mb-24 px-3 sm:px-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-primary">Scan to Order</h2>
            <div className="flex flex-col items-center gap-4 sm:gap-5 bg-neutral-card p-4 sm:p-6 rounded-xl shadow-card max-w-sm mx-auto border border-gray-100">
              <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=https://wa.me/${whatsappNumber}&size=200x200`}
                  alt="WhatsApp QR Code"
                  className="w-36 sm:w-44 md:w-52"
                />
              </div>
              <button
                onClick={handleViewMenu}
                className="w-full bg-[#25D366] text-white px-4 sm:px-5 md:px-7 py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-[#1ea355] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WhatsApp" />
                View Menu on WhatsApp
              </button>
              <p className="text-gray-600 text-xs sm:text-sm text-center">
                Scan this code to send your order directly on WhatsApp
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;