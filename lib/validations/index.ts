import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
});

export const reservationSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalıdır.").max(80),
  phone: z
    .string()
    .trim()
    .min(10, "Telefon numarasını kontrol edin.")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Geçerli bir telefon girin."),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  date: z.string().min(1, "Tarih seçin."),
  time: z.string().min(1, "Saat seçin."),
  guests: z.number().int().min(1, "En az 1 kişi.").max(20, "En fazla 20 kişi."),
  note: z.string().max(500).optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  note: z.string().max(240).optional(),
  doneness: z.enum(["rare", "medium", "well"]).optional(),
});

export const createOrderSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  items: z.array(orderItemSchema).min(1, "Sepet boş olamaz."),
  note: z.string().max(500).optional(),
  customerName: z.string().max(80).optional(),
  customerPhone: z.string().max(20).optional(),
});

export const waiterRequestSchema = z.object({
  tableNumber: z.number().int().min(1).max(999),
  requestType: z.enum(["WAITER", "BILL", "WATER", "OTHER"]),
  note: z.string().max(240).optional(),
});

export const reviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).optional(),
  description: z.string().trim().min(8).max(800),
  ingredients: z.string().max(500).optional(),
  allergens: z.string().max(240).optional(),
  price: z.coerce.number().positive(),
  image: z.string().min(1).max(1_500_000),
  categoryId: z.string().min(1),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  hasDoneness: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const settingsSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(30),
  whatsapp: z.string().min(8).max(30),
  address: z.string().min(4).max(240),
  instagram: z.string().max(200),
  facebook: z.string().max(200).optional(),
  workingHoursWeekdays: z.string().min(1).max(80),
  workingHoursWeekend: z.string().min(1).max(80),
  googleMapsUrl: z.string().url(),
  homepageTagline: z.string().min(4).max(400),
  aboutText: z.string().min(10).max(4000),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "SERVED",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
