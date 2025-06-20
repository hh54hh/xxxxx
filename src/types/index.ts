export interface Subscriber {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  phone: string;
  notes?: string;
  subscription_date: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  subscriber_id: string;
  type: "course" | "diet";
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface GroupItem {
  id: string;
  group_id: string;
  item_id: string;
  created_at: string;
}

export interface CoursePoint {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DietItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  subscriber_id?: string;
  customer_name?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface SubscriberWithGroups extends Subscriber {
  groups?: Array<
    Group & {
      items?: Array<
        GroupItem & {
          course_point?: CoursePoint;
          diet_item?: DietItem;
        }
      >;
    }
  >;
}

export interface SaleWithItems extends Sale {
  items?: Array<
    SaleItem & {
      product?: Product;
    }
  >;
  subscriber?: Subscriber;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// Form types
export interface SubscriberFormData {
  name: string;
  age: number;
  weight: number;
  height: number;
  phone: string;
  notes?: string;
}

export interface CourseFormData {
  name: string;
  description?: string;
}

export interface DietFormData {
  name: string;
  description?: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

export interface SaleFormData {
  subscriber_id?: string;
  customer_name?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
}
