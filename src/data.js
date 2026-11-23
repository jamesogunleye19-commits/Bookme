export const SERVICES = [
  { id: 'cooking', name: 'Cooking', icon: '🍳', color: '#f59e0b' },
  { id: 'barber', name: 'Barber', icon: '💈', color: '#0ea5e9' },
  { id: 'decorator', name: 'Decorator', icon: '🎈', color: '#ec4899' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', color: '#10b981' },
  { id: 'makeup', name: 'Makeup', icon: '💄', color: '#f43f5e' },
  { id: 'hair', name: 'Hair styling', icon: '💇', color: '#8b5cf6' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', color: '#06b6d4' },
  { id: 'electrician', name: 'Electrician', icon: '💡', color: '#eab308' },
  { id: 'photography', name: 'Photography', icon: '📷', color: '#6366f1' },
  { id: 'tailoring', name: 'Tailoring', icon: '🧵', color: '#d946ef' },
  { id: 'laundry', name: 'Laundry', icon: '🧺', color: '#14b8a6' },
  { id: 'mechanic', name: 'Mechanic', icon: '🚗', color: '#64748b' },
]

// Demo providers, shown until you add real ones to the Firestore "providers" collection.
const names = [['Ada Okafor', 'Tunde Bello'], ['Kings Cuts', 'Sharp Edge'], ['Joy Events', 'Glam Spaces'],
  ['SparkleCare', 'FreshHome'], ['Zara Glow', 'Bella Faces'], ['Crown Salon', 'Twist & Style'],
  ['QuickFix Pipes', 'Aqua Pro'], ['VoltMasters', 'BrightWire'], ['Frame Studio', 'Lens Lab'],
  ['Stitch House', 'Sew Perfect'], ['Clean Wash', 'Suds & Co'], ['AutoCare Hub', 'Wrench Works']]
export const SEED_PROVIDERS = SERVICES.flatMap((s, i) =>
  names[i].map((n, j) => ({
    id: `${s.id}-${j + 1}`, name: n, serviceId: s.id, serviceName: s.name,
    rating: (4.5 + ((i + j) % 5) / 10).toFixed(1), reviews: 24 + i * 7 + j * 13,
    price: 5000 + ((i * 3 + j * 5) % 8) * 1500, location: 'Near you',
    bio: `Professional ${s.name.toLowerCase()} service. Reliable, on time and well reviewed.`,
  })))
export const SLOTS = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30']
export const money = n => '₦' + Number(n).toLocaleString()
