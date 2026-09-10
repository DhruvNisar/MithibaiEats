import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  Clock, 
  Star, 
  Flame, 
  Plus, 
  Check, 
  Sliders, 
  MessageSquare, 
  ShoppingBag, 
  MapPin,
  RefreshCw,
  Utensils,
  Lightbulb
} from 'lucide-react';
import api from '../../services/api';
import { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentCanteenId?: string;
  currentCanteenSlug?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  recommendations?: Array<{ item: FoodItem; reason: string; score: number }>;
  timestamp: Date;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentCanteenId,
  currentCanteenSlug,
}) => {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'chat' | 'filters'>('chat');

  // Filter state
  const [budget, setBudget] = useState<number>(120);
  const [diet, setDiet] = useState<'any' | 'veg' | 'jain'>('any');
  const [spiceLevel, setSpiceLevel] = useState<'any' | 'mild' | 'medium' | 'spicy'>('any');
  const [maxPrepTime, setMaxPrepTime] = useState<number>(15);
  const [canteenSlug, setCanteenSlug] = useState<string>(currentCanteenSlug || 'any');

  // Chat state
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hey Mithibai student! 👋 I am your AI campus food assistant. Tell me what you crave, your budget, or how much time you have before lecture!',
      timestamp: new Date(),
    },
  ]);

  // Loading & Results
  const [loading, setLoading] = useState(false);
  const [filterRecommendations, setFilterRecommendations] = useState<Array<{ item: FoodItem; reason: string; score: number }>>([]);
  const [filterSummary, setFilterSummary] = useState<string>('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen, activeTab]);

  useEffect(() => {
    if (currentCanteenSlug) {
      setCanteenSlug(currentCanteenSlug);
    }
  }, [currentCanteenSlug]);

  if (!isOpen) return null;

  const quickPills = [
    { label: '⚡ Quick 5m Snack', prompt: 'quick snack under 5 minutes' },
    { label: '💰 Lunch under ₹100', prompt: 'lunch thali or meal under 100 rupees' },
    { label: '🌿 Pure Jain Special', prompt: 'pure jain food on 8th floor or ground floor' },
    { label: '🌶️ Spicy Indo-Chinese', prompt: 'spicy noodles or manchurian on 6th floor' },
    { label: '☕ 8th Floor Coffee & Bites', prompt: 'cold coffee and dessert on 8th floor rooftop' },
  ];

  const handleSendChat = async (messageToSend?: string) => {
    const text = (messageToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        currentCanteenSlug: canteenSlug !== 'any' ? canteenSlug : undefined,
        currentCanteenId,
      });

      if (res.data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.data.reply,
          recommendations: res.data.data.recommendations || [],
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      toast.error('AI assistant is temporarily offline. Falling back to menu.');
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I had trouble processing that. You can try selecting smart filters or browsing our 3 canteen menus directly!',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/recommend', {
        budget,
        vegetarian: diet === 'veg' || diet === 'jain',
        jain: diet === 'jain',
        spiceLevel: spiceLevel !== 'any' ? spiceLevel : undefined,
        maxPrepTime,
        canteenSlug: canteenSlug !== 'any' ? canteenSlug : undefined,
        canteenId: currentCanteenId,
      });

      if (res.data.success) {
        setFilterRecommendations(res.data.data || []);
        setFilterSummary(res.data.summary || '');
      }
    } catch {
      toast.error('Could not fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: FoodItem) => {
    const success = addItem(item, 1);
    if (success) {
      setAddedIds((prev) => ({ ...prev, [item._id]: true }));
      toast.success(`Added ${item.name} to pickup cart!`);
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [item._id]: false }));
      }, 2000);
    }
  };

  const renderDishCard = (rec: { item: FoodItem; reason: string; score: number }) => {
    const item = rec.item;
    const isAdded = addedIds[item._id];

    return (
      <div
        key={item._id}
        className="p-3 bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition flex gap-3 items-center justify-between"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={item.imageUrl || item.image || '/food/placeholder.webp'}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/food/placeholder.webp';
              }}
            />
            <span
              className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full ring-1 ring-white ${
                item.vegetarian ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-extrabold text-gray-900 truncate">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
              <span className="font-bold text-orange-600">₹{item.price}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-gray-400" /> ~{item.preparationTime}m
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating || 4.5}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md font-semibold truncate max-w-[220px]">
                {rec.reason || (typeof item.canteen === 'object' ? item.canteen?.floor : 'Campus Canteen')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleAddToCart(item)}
          disabled={isAdded}
          className={`flex-shrink-0 p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
          }`}
          title="Add to Cart"
        >
          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md sm:max-w-lg bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base flex items-center gap-1.5 leading-tight">
                Mithibai Foodie AI
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {canteenSlug !== 'any' ? `${canteenSlug.toUpperCase()} Floor` : 'All Canteens'}
                </span>
              </h2>
              <p className="text-[11px] text-orange-100">Smart campus recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'chat'
                ? 'border-b-2 border-orange-600 text-orange-600 bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Chat Assistant
          </button>
          <button
            onClick={() => {
              setActiveTab('filters');
              if (filterRecommendations.length === 0) handleApplyFilters();
            }}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'filters'
                ? 'border-b-2 border-orange-600 text-orange-600 bg-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" /> Smart Knobs
          </button>
        </div>

        {/* TAB 1: CONVERSATIONAL CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Prompt Pills */}
            <div className="p-3 bg-white border-b border-gray-100 overflow-x-auto no-scrollbar flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1 shrink-0">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Presets:
              </span>
              {quickPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(pill.prompt)}
                  className="text-[11px] bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 px-3 py-1 rounded-full font-semibold transition shrink-0"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Chat Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-orange-600 text-white rounded-br-xs'
                        : 'bg-gray-100 text-gray-800 rounded-bl-xs border border-gray-200'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Attached Dish Recommendations if any */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-3 space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Recommended for you:
                      </span>
                      {msg.recommendations.slice(0, 3).map((rec: any) =>
                        renderDishCard(rec.item ? rec : { item: rec, reason: 'Top match', score: 80 })
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center animate-spin">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span>Foodie AI is finding the best campus dishes...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask anything (e.g. spicy snack under ₹70 on ground floor)"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: SMART KNOBS & FILTERS */}
        {activeTab === 'filters' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Filter Knobs Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
              {/* Canteen Floor Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Canteen Floor</label>
                <select
                  value={canteenSlug}
                  onChange={(e) => setCanteenSlug(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="any">🏫 All 3 Canteens (Entire Campus)</option>
                  <option value="ground">Ground Floor (Street Food, Sandwiches & Juices)</option>
                  <option value="6th">6th Floor (Thalis, Biryani, Indo-Chinese & Maggi)</option>
                  <option value="8th">8th Floor (Bakery, Gourmet Cafe & Pure Jain)</option>
                </select>
              </div>

              {/* Budget Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-gray-700">
                  <span>Maximum Budget</span>
                  <span className="text-orange-600 font-black">₹{budget}</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={250}
                  step={10}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>₹30</span>
                  <span>₹140</span>
                  <span>₹250</span>
                </div>
              </div>

              {/* Max Prep Time Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-gray-700">
                  <span>Max Prep Time</span>
                  <span className="text-orange-600 font-black">{maxPrepTime} mins</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={maxPrepTime}
                  onChange={(e) => setMaxPrepTime(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>⚡ 5 mins</span>
                  <span>15 mins</span>
                  <span>25 mins</span>
                </div>
              </div>

              {/* Dietary Toggles */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Dietary Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'any', label: 'All Dishes' },
                    { id: 'veg', label: '🌱 Veg Only' },
                    { id: 'jain', label: '🌿 Pure Jain' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDiet(d.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        diet === d.id
                          ? 'border-orange-600 bg-orange-600 text-white shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Spice Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'any', label: 'Any' },
                    { id: 'mild', label: 'Mild' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'spicy', label: '🌶️ Hot' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSpiceLevel(s.id as any)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition ${
                        spiceLevel === s.id
                          ? 'border-orange-600 bg-orange-50 text-orange-700 font-bold'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Find Matching Food
              </button>
            </div>

            {/* Filter Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-900">
                  Recommended Matches ({filterRecommendations.length})
                </span>
                {filterSummary && (
                  <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                    {filterSummary}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Scoring campus dishes...
                </div>
              ) : filterRecommendations.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
                  No dishes matched all constraints. Try widening your budget or prep time!
                </div>
              ) : (
                <div className="space-y-2">
                  {filterRecommendations.map(renderDishCard)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
