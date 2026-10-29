export type UserRole =
  | "admin"
  | "manager"
  | "cashier"
  | "production"
  | "store"
  | "delivery"
  | "accountant"
  | "user";

export const ROLE_PERMISSIONS = {
  admin: {
    sale: true,
    refund: true,
    discount: true,
    editPrice: true,
    inventory: true,
    reports: true,
    production: true,
    settings: true,
    manageUsers: true,
  },

  manager: {
    sale: true,
    refund: true,
    discount: true,
    editPrice: false,
    inventory: true,
    reports: true,
    production: true,
    settings: false,
    manageUsers: false,
  },

  cashier: {
    sale: true,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: false,
    reports: false,
    production: false,
    settings: false,
    manageUsers: false,
  },

  production: {
    sale: false,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: true,
    reports: false,
    production: true,
    settings: false,
    manageUsers: false,
  },

  store: {
    sale: false,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: true,
    reports: true,
    production: false,
    settings: false,
    manageUsers: false,
  },

  delivery: {
    sale: false,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: false,
    reports: false,
    production: false,
    settings: false,
    manageUsers: false,
  },

  accountant: {
    sale: false,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: false,
    reports: true,
    production: false,
    settings: false,
    manageUsers: false,
  },

  user: {
    sale: false,
    refund: false,
    discount: false,
    editPrice: false,
    inventory: false,
    reports: false,
    production: false,
    settings: false,
    manageUsers: false,
  },
} as const;