import type {
  Subscriber,
  SubscriberFormData,
  SubscriberWithGroups,
  CoursePoint,
  CourseFormData,
  DietItem,
  DietFormData,
  Product,
  ProductFormData,
  Sale,
  SaleFormData,
  SaleWithItems,
} from "@/types";

// Mock database response type
interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// In-memory storage for mock data
let subscribers: Subscriber[] = [];
let coursePoints: CoursePoint[] = [];
let dietItems: DietItem[] = [];
let products: Product[] = [];
let sales: SaleWithItems[] = [];

// Helper function to generate IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Database helper functions for managing application data
 * This is a mock implementation that would be replaced with actual Supabase calls
 */
export const dbHelpers = {
  // Subscriber operations
  async getSubscribers(): Promise<DatabaseResponse<Subscriber[]>> {
    try {
      return { data: [...subscribers], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createSubscriber(
    data: SubscriberFormData,
  ): Promise<DatabaseResponse<Subscriber[]>> {
    try {
      const newSubscriber: Subscriber = {
        id: generateId(),
        ...data,
        subscription_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      subscribers.push(newSubscriber);
      return { data: [newSubscriber], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateSubscriber(
    id: string,
    data: SubscriberFormData,
  ): Promise<DatabaseResponse<Subscriber[]>> {
    try {
      const index = subscribers.findIndex((s) => s.id === id);
      if (index === -1) {
        throw new Error("Subscriber not found");
      }

      subscribers[index] = {
        ...subscribers[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return { data: [subscribers[index]], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async deleteSubscriber(id: string): Promise<DatabaseResponse<void>> {
    try {
      const index = subscribers.findIndex((s) => s.id === id);
      if (index === -1) {
        throw new Error("Subscriber not found");
      }
      subscribers.splice(index, 1);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Course Points operations
  async getCoursePoints(): Promise<DatabaseResponse<CoursePoint[]>> {
    try {
      return { data: [...coursePoints], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createCoursePoint(
    data: CourseFormData,
  ): Promise<DatabaseResponse<CoursePoint[]>> {
    try {
      const newCoursePoint: CoursePoint = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      coursePoints.push(newCoursePoint);
      return { data: [newCoursePoint], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateCoursePoint(
    id: string,
    data: CourseFormData,
  ): Promise<DatabaseResponse<CoursePoint[]>> {
    try {
      const index = coursePoints.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Course point not found");
      }

      coursePoints[index] = {
        ...coursePoints[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return { data: [coursePoints[index]], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async deleteCoursePoint(id: string): Promise<DatabaseResponse<void>> {
    try {
      const index = coursePoints.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Course point not found");
      }
      coursePoints.splice(index, 1);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Diet Items operations
  async getDietItems(): Promise<DatabaseResponse<DietItem[]>> {
    try {
      return { data: [...dietItems], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createDietItem(
    data: DietFormData,
  ): Promise<DatabaseResponse<DietItem[]>> {
    try {
      const newDietItem: DietItem = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dietItems.push(newDietItem);
      return { data: [newDietItem], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateDietItem(
    id: string,
    data: DietFormData,
  ): Promise<DatabaseResponse<DietItem[]>> {
    try {
      const index = dietItems.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error("Diet item not found");
      }

      dietItems[index] = {
        ...dietItems[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return { data: [dietItems[index]], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async deleteDietItem(id: string): Promise<DatabaseResponse<void>> {
    try {
      const index = dietItems.findIndex((d) => d.id === id);
      if (index === -1) {
        throw new Error("Diet item not found");
      }
      dietItems.splice(index, 1);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Product operations
  async getProducts(): Promise<DatabaseResponse<Product[]>> {
    try {
      return { data: [...products], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createProduct(
    data: ProductFormData,
  ): Promise<DatabaseResponse<Product[]>> {
    try {
      const newProduct: Product = {
        id: generateId(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      products.push(newProduct);
      return { data: [newProduct], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateProduct(
    id: string,
    data: ProductFormData,
  ): Promise<DatabaseResponse<Product[]>> {
    try {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Product not found");
      }

      products[index] = {
        ...products[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      return { data: [products[index]], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async deleteProduct(id: string): Promise<DatabaseResponse<void>> {
    try {
      const index = products.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Product not found");
      }
      products.splice(index, 1);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Sale operations
  async getSales(): Promise<DatabaseResponse<SaleWithItems[]>> {
    try {
      return { data: [...sales], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createSale(
    data: SaleFormData,
  ): Promise<DatabaseResponse<SaleWithItems[]>> {
    try {
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );

      const newSale: SaleWithItems = {
        id: generateId(),
        subscriber_id: data.subscriber_id,
        customer_name: data.customer_name,
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: data.items.map((item) => ({
          id: generateId(),
          sale_id: "", // Will be set after sale is created
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: new Date().toISOString(),
          product: products.find((p) => p.id === item.product_id),
        })),
      };

      // Update product stock
      data.items.forEach((item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (product) {
          product.stock -= item.quantity;
        }
      });

      sales.push(newSale);
      return { data: [newSale], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  // Database reset operation
  async resetDatabase(): Promise<DatabaseResponse<void>> {
    try {
      subscribers.length = 0;
      coursePoints.length = 0;
      dietItems.length = 0;
      products.length = 0;
      sales.length = 0;
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};
