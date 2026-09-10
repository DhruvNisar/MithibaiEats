export interface User {
  _id: string
  name: string
  email: string
  role: 'student' | 'admin'
  phone?: string
  avatar?: string
  preferences: {
    vegetarian: boolean
    jain: boolean
    spiceLevel: 'mild' | 'medium' | 'spicy'
  }
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export interface Canteen {
  _id: string
  name: string
  floor: string
  description: string
  image: string
  openingTime: string
  closingTime: string
  isOpen: boolean
  avgPrepTime: number
  location: string
  slug: string
  totalItems?: number
}

export interface Category {
  _id: string
  name: string
  slug: string
  icon: string
}

export interface Customization {
  name: string
  options: string[]
  required: boolean
}

export interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  category: Category | string
  canteen: Canteen | string
  image: string
  imageUrl?: string
  isAiGenerated?: boolean
  vegetarian: boolean
  jainAvailable: boolean
  spicyLevel: 'mild' | 'medium' | 'spicy' | 'extra_spicy'
  preparationTime: number
  available: boolean
  stock: number
  rating: number
  totalReviews: number
  popularityScore: number
  tags: string[]
  customizations: Customization[]
}

export interface CartItem {
  foodItem: FoodItem
  quantity: number
  customizations: Record<string, string>
  subtotal: number
}

export interface Cart {
  canteenId: string
  canteenName: string
  items: CartItem[]
  fulfillmentType?: 'pickup' | 'delivery'
  deliveryFee?: number
  subtotal: number
  platformFee: number
  packagingFee: number
  total: number
}

export interface OrderItem {
  foodItem: FoodItem | string
  name: string
  price: number
  quantity: number
  customizations: Record<string, string>
  subtotal: number
}

export interface Order {
  _id: string
  orderNumber: string
  user: User | string
  canteen: Canteen
  items: OrderItem[]
  fulfillmentType: 'pickup' | 'delivery'
  deliveryFee: number
  deliveryDetails?: {
    building: string
    floorRoom: string
    contactPhone?: string
    deliveryNotes?: string
  }
  subtotal: number
  platformFee: number
  packagingFee: number
  total: number
  orderStatus: 'placed' | 'pending' | 'confirmed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'rejected'
  pickupToken?: string
  pickupCode?: string
  pickupQrToken?: string
  paymentMethod: 'cash' | 'upi' | 'online'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  specialInstructions?: string
  estimatedTime?: number
  lifecycleStartedAt?: string
  confirmedAt?: string
  estimatedCompletionAt?: string
  slaBreached?: boolean
  razorpayOrderId?: string
  razorpayPaymentId?: string
  createdAt: string
  acceptedAt?: string
  preparingAt?: string
  readyAt?: string
  completedAt?: string
}

export interface Payment {
  _id: string
  paymentId: string
  order: string
  method: 'cash' | 'upi'
  amount: number
  status: 'initiated' | 'processing' | 'success' | 'failed' | 'cancelled'
  transactionReference?: string
  createdAt: string
}

export interface Review {
  _id: string
  user: User
  foodItem: FoodItem | any
  order?: string
  rating: number
  comment?: string
  approved?: boolean
  createdAt: string
}

export interface Notification {
  _id: string
  title: string
  message: string
  type: 'order_update' | 'payment' | 'promotional' | 'system'
  read: boolean
  orderId?: string
  createdAt: string
}

export interface QRCode {
  _id: string
  canteen: Canteen
  label: string
  type: 'canteen' | 'area'
  url: string
  qrImageData: string
  active: boolean
  scanCount: number
  createdAt: string
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendations?: FoodItem[]
  timestamp: Date
}

export interface AnalyticsSummary {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  activeUsers: number
  totalFoodItems: number
  lowStockItems: number
  totalCanteens: number
}
