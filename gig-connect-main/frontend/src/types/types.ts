// frontend/src/types.ts

// 🔑 Use `string` for all IDs — backend sends `_id` as string in JSON
export interface User {
  monthlyGoal: number;
  earningsProgress: number;
  monthlyEarnings: any;
  _id: string; // ✅ Mongoose ObjectId as string (used in comparisons)
  phone: string;
  name: string;
  avatar?: string;
  rating: {
    avg: number;
    count: number;
  };
  completedJobs: number;
  createdAt: string; // ISO string from backend
  role: string; // 'USER' (you have this in backend!)
}

export interface Post {
  _id: string;
  title: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  requiredCount: number;
  perPersonRate: number;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  description: string;
  images: string[];
  status: 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELLED'; // ✅ UPPERCASE to match backend enum
  creator: User; // ✅ Full nested object (not just ID) — backend populates it
  interested: User[]; // ✅ Array of full User objects (not just strings)
  assigned: User[];  // ✅ Same here
  createdAt: string; // ISO string
  // `distance` is optional and frontend-only — safe to keep
  distance?: number;
}

export interface ChatRoom {
  _id: string;
  post: Post; // ✅ Full Post (backend populates in getChats/getChatById)
  members: User[]; // ✅ Array of full User objects
  messages: Message[];
  createdAt: string;
}

export interface Message {
  _id: string;
  content: string;
  sender: User; // ✅ Full User (backend populates)
  chatRoom: string; // ID only is fine here
  createdAt: string;
}