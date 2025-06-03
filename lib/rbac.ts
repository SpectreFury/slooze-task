export type UserRole = "member" | "manager" | "admin";

export interface User {
  id: string;
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

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

export function hasPermission(
  userRole: UserRole,
  permission: Permission
): boolean {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return (ROLE_PERMISSIONS[userRole] as readonly Permission[]).includes(permission);
}

export function canViewRestaurants(userRole: UserRole): boolean {
  return hasPermission(userRole, "view_restaurants");
}

export function canViewMenu(userRole: UserRole): boolean {
  return hasPermission(userRole, "view_menu");
}

export function canAddToCart(userRole: UserRole): boolean {
  return hasPermission(userRole, "add_to_cart");
}

export function canPlaceOrder(userRole: UserRole): boolean {
  return hasPermission(userRole, "place_order");
}

export function canAccessCheckout(userRole: UserRole): boolean {
  return hasPermission(userRole, "place_order");
}

export function canCancelOrder(userRole: UserRole): boolean {
  return hasPermission(userRole, "cancel_order");
}

export function canManageRestaurant(userRole: UserRole): boolean {
  return hasPermission(userRole, "manage_restaurant");
}

export function canManageMenu(userRole: UserRole): boolean {
  return hasPermission(userRole, "manage_menu");
}

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

export function hasElevatedRole(userRole: UserRole): boolean {
  if (!userRole) {
    return false;
  }
  return userRole === "manager" || userRole === "admin";
}
