// Role-based access control utilities

export type UserRole = "member" | "manager" | "admin";

export interface User {
  id: string;
  userId?: string; // Keep for backward compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  member: [
    "view_restaurants",
    "view_menu",
    "add_to_cart",
    "view_own_orders",
  ],
  manager: [
    "view_restaurants",
    "view_menu",
    "add_to_cart",
    "place_order",
    "view_own_orders",
    "manage_restaurant",
    "manage_menu",
    "view_restaurant_orders",
    "cancel_order",
  ],
  admin: [
    "view_restaurants",
    "view_menu",
    "add_to_cart",
    "place_order",
    "view_own_orders",
    "manage_restaurant",
    "manage_menu",
    "view_restaurant_orders",
    "manage_users",
    "view_all_orders",
    "system_settings",
    "cancel_order",
  ],
} as const;

export type Permission = typeof ROLE_PERMISSIONS[keyof typeof ROLE_PERMISSIONS][number];

// Check if user has a specific permission
export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return (ROLE_PERMISSIONS[userRole] as readonly Permission[]).includes(permission);
}

// Check if user can access restaurants
export function canViewRestaurants(userRole: UserRole): boolean {
  return hasPermission(userRole, "view_restaurants");
}

// Check if user can view menu items
export function canViewMenu(userRole: UserRole): boolean {
  return hasPermission(userRole, "view_menu");
}

// Check if user can add items to cart
export function canAddToCart(userRole: UserRole): boolean {
  return hasPermission(userRole, "add_to_cart");
}

// Check if user can place orders
export function canPlaceOrder(userRole: UserRole): boolean {
  return hasPermission(userRole, "place_order");
}

// Check if user can access checkout (only managers and admins)
export function canAccessCheckout(userRole: UserRole): boolean {
  return hasPermission(userRole, "place_order");
}

// Check if user can cancel orders (only managers and admins)
export function canCancelOrder(userRole: UserRole): boolean {
  return hasPermission(userRole, "cancel_order");
}

// Check if user can manage restaurants (for restaurant owners/managers)
export function canManageRestaurant(userRole: UserRole): boolean {
  return hasPermission(userRole, "manage_restaurant");
}

// Check if user can manage menus
export function canManageMenu(userRole: UserRole): boolean {
  return hasPermission(userRole, "manage_menu");
}

// Get user role label for display
export function getRoleLabel(role: UserRole): string {
  if (!role) {
    return "Unknown";
  }
  const labels = {
    member: "Customer",
    manager: "Restaurant Manager",
    admin: "Administrator",
  };
  return labels[role] || "Unknown";
}

// Check if user has elevated privileges (manager or admin)
export function hasElevatedRole(userRole: UserRole): boolean {
  if (!userRole) {
    return false;
  }
  return userRole === "manager" || userRole === "admin";
}
