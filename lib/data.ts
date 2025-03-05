export type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category: string
}

export type Category = {
  id: string
  name: string
  budget: number
  spent: number
  color: string
}

export type User = {
  id: string
  name: string
  email: string
  avatar: string
  notifications: {
    email: boolean
    push: boolean
    budgetAlerts: boolean
  }
}

export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2024-03-01",
    description: "Grocery Store",
    amount: 85.42,
    category: "Groceries",
  },
  {
    id: "t2",
    date: "2024-03-02",
    description: "Coffee Shop",
    amount: 4.5,
    category: "Dining",
  },
  {
    id: "t3",
    date: "2024-03-03",
    description: "Gas Station",
    amount: 45.0,
    category: "Transportation",
  },
  {
    id: "t4",
    date: "2024-03-05",
    description: "Online Streaming",
    amount: 14.99,
    category: "Entertainment",
  },
  {
    id: "t5",
    date: "2024-03-07",
    description: "Pharmacy",
    amount: 32.5,
    category: "Health",
  },
  {
    id: "t6",
    date: "2024-03-10",
    description: "Restaurant",
    amount: 65.8,
    category: "Dining",
  },
  {
    id: "t7",
    date: "2024-03-12",
    description: "Electric Bill",
    amount: 95.0,
    category: "Utilities",
  },
  {
    id: "t8",
    date: "2024-03-15",
    description: "Clothing Store",
    amount: 120.75,
    category: "Shopping",
  },
  {
    id: "t9",
    date: "2024-03-18",
    description: "Mobile Phone Bill",
    amount: 75.0,
    category: "Utilities",
  },
  {
    id: "t10",
    date: "2024-03-20",
    description: "Bookstore",
    amount: 28.99,
    category: "Entertainment",
  },
]

export const mockCategories: Category[] = [
  {
    id: "c1",
    name: "Groceries",
    budget: 400,
    spent: 285.42,
    color: "#4CAF50", // Green
  },
  {
    id: "c2",
    name: "Dining",
    budget: 200,
    spent: 170.3,
    color: "#FF9800", // Orange
  },
  {
    id: "c3",
    name: "Transportation",
    budget: 150,
    spent: 95.0,
    color: "#2196F3", // Blue
  },
  {
    id: "c4",
    name: "Entertainment",
    budget: 100,
    spent: 43.98,
    color: "#9C27B0", // Purple
  },
  {
    id: "c5",
    name: "Health",
    budget: 150,
    spent: 32.5,
    color: "#F44336", // Red
  },
  {
    id: "c6",
    name: "Utilities",
    budget: 300,
    spent: 270.0,
    color: "#607D8B", // Blue Grey
  },
  {
    id: "c7",
    name: "Shopping",
    budget: 200,
    spent: 220.75,
    color: "#E91E63", // Pink
  },
]

export const mockUser: User = {
  id: "u1",
  name: "Jane Doe",
  email: "jane.doe@example.com",
  avatar: "/placeholder.svg?height=128&width=128",
  notifications: {
    email: true,
    push: false,
    budgetAlerts: true,
  },
}

export const getTotalBudget = () => {
  return mockCategories.reduce((total, category) => total + category.budget, 0)
}

export const getTotalSpent = () => {
  return mockCategories.reduce((total, category) => total + category.spent, 0)
}

export const getRecentTransactions = (count = 5) => {
  return [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, count)
}

export const getCategoryByName = (name: string) => {
  return mockCategories.find((category) => category.name === name)
}

