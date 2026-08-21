import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const img = (name: string) => `/images/menu/${name}.png`;

type Item = {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  grams?: string;
  isFeatured?: boolean;
  hasDoneness?: boolean;
  sortOrder: number;
};

const CATEGORIES = [
  { name: "Et Izgaralar", slug: "et-izgaralar", sortOrder: 1 },
  { name: "Tavuk Izgaralar", slug: "tavuk-izgaralar", sortOrder: 2 },
  { name: "Yöresel Yemekler", slug: "yoresel-yemekler", sortOrder: 3 },
  { name: "Çorbalar", slug: "corbalar", sortOrder: 4 },
  { name: "Tatlılar", slug: "tatlilar", sortOrder: 5 },
  { name: "Sıcak İçecekler", slug: "sicak-icecekler", sortOrder: 6 },
  { name: "Meşrubatlar", slug: "mesrubatlar", sortOrder: 7 },
];

function desc(name: string, grams?: string) {
  return grams
    ? `${name} · ${grams}. TORA ET MANGAL'da taze hazırlanır.`
    : `${name}. TORA ET MANGAL'da taze hazırlanır.`;
}

const ITEMS: Item[] = [
  // Et Izgaralar
  { name: "Adana Kebap", slug: "adana-kebap", grams: "220 gr", price: 380, image: img("adana-kebap"), category: "et-izgaralar", isFeatured: true, sortOrder: 1, description: "" },
  { name: "Urfa Kebap", slug: "urfa-kebap", grams: "230 gr", price: 380, image: img("adana-kebap"), category: "et-izgaralar", sortOrder: 2, description: "" },
  { name: "Kuzu Şiş", slug: "kuzu-sis", grams: "230 gr", price: 380, image: img("kuzu-pirzola"), category: "et-izgaralar", sortOrder: 3, description: "" },
  { name: "Kuzu Pirzola", slug: "kuzu-pirzola", grams: "250 gr", price: 550, image: img("kuzu-pirzola"), category: "et-izgaralar", isFeatured: true, hasDoneness: true, sortOrder: 4, description: "" },
  { name: "Kuzu Ciğer", slug: "kuzu-ciger", grams: "230 gr", price: 330, image: img("ciger"), category: "et-izgaralar", sortOrder: 5, description: "" },
  { name: "Kuzu Kaburga", slug: "kuzu-kaburga", grams: "270 gr", price: 370, image: img("kaburga"), category: "et-izgaralar", sortOrder: 6, description: "" },
  { name: "Kuzu Sarma Beyti", slug: "kuzu-sarma-beyti", grams: "250 gr", price: 450, image: img("beyti"), category: "et-izgaralar", sortOrder: 7, description: "" },
  { name: "Kuzu Külleme", slug: "kuzu-kulleme", grams: "250 gr", price: 550, image: img("kuzu-pirzola"), category: "et-izgaralar", hasDoneness: true, sortOrder: 8, description: "" },
  { name: "Tora Köfte", slug: "tora-kofte", grams: "450 gr", price: 450, image: img("kofte"), category: "et-izgaralar", isFeatured: true, sortOrder: 9, description: "" },
  { name: "Kuzu Külbastı", slug: "kuzu-kulbasti", grams: "250 gr", price: 550, image: img("kuzu-pirzola"), category: "et-izgaralar", hasDoneness: true, sortOrder: 10, description: "" },
  { name: "Kuzu Yağlı Kara", slug: "kuzu-yagli-kara", grams: "250 gr", price: 460, image: img("kaburga"), category: "et-izgaralar", sortOrder: 11, description: "" },
  { name: "Kaşarlı Köfte", slug: "kasarli-kofte", grams: "230 gr", price: 400, image: img("kofte"), category: "et-izgaralar", sortOrder: 12, description: "" },
  { name: "Tora Sucuk", slug: "tora-sucuk", grams: "250 gr", price: 250, image: img("sucuk"), category: "et-izgaralar", sortOrder: 13, description: "" },
  { name: "Böbrek-Yürek", slug: "bobrek-yurek", grams: "300 gr", price: 300, image: img("ciger"), category: "et-izgaralar", sortOrder: 14, description: "" },

  // Tavuk
  { name: "Tavuk Izgara", slug: "tavuk-izgara", grams: "240 gr", price: 350, image: img("tavuk-izgara"), category: "tavuk-izgaralar", sortOrder: 1, description: "" },
  { name: "Tavuk Pirzola", slug: "tavuk-pirzola", grams: "240 gr", price: 300, image: img("tavuk-izgara"), category: "tavuk-izgaralar", sortOrder: 2, description: "" },
  { name: "Kanat Izgara (Yaprak Kanat)", slug: "kanat-izgara", grams: "240 gr", price: 300, image: img("kanat"), category: "tavuk-izgaralar", sortOrder: 3, description: "" },

  // Yöresel
  { name: "Kayseri Yağlaması", slug: "kayseri-yaglamasi", price: 500, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 1, description: "" },
  { name: "Furun Kebabı", slug: "furun-kebabi", price: 580, image: img("kaburga"), category: "yoresel-yemekler", sortOrder: 2, description: "" },
  { name: "Fırın Ağzı", slug: "firin-agzi", price: 450, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 3, description: "" },
  { name: "Tandır İncik", slug: "tandir-incik", price: 500, image: img("kaburga"), category: "yoresel-yemekler", sortOrder: 4, description: "" },
  { name: "Tora Mantı", slug: "tora-manti", price: 350, image: img("manti"), category: "yoresel-yemekler", sortOrder: 5, description: "" },
  { name: "Kuzu Haşlama", slug: "kuzu-haslama", price: 400, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 6, description: "" },
  { name: "Kuzu Kaburga Kavurma", slug: "kuzu-kaburga-kavurma", price: 600, image: img("kaburga"), category: "yoresel-yemekler", isFeatured: true, sortOrder: 7, description: "" },
  { name: "Kuzu Sac Kavurma", slug: "kuzu-sac-kavurma", price: 400, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 8, description: "" },
  { name: "Posof Kuru Fasulyesi", slug: "posof-kuru-fasulyesi", price: 220, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 9, description: "" },
  { name: "Kiremitte Kaşarlı Mantar", slug: "kiremitte-kasarli-mantar", price: 250, image: img("pizza"), category: "yoresel-yemekler", sortOrder: 10, description: "" },
  { name: "Kiremitte Kaşarlı Köfte", slug: "kiremitte-kasarli-kofte", price: 400, image: img("kofte"), category: "yoresel-yemekler", sortOrder: 11, description: "" },
  { name: "İçli Köfte (5 adet)", slug: "icli-kofte", price: 400, image: img("kofte"), category: "yoresel-yemekler", sortOrder: 12, description: "" },
  { name: "Pilav", slug: "pilav", price: 100, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 13, description: "" },
  { name: "Fırında Tavuk", slug: "firinda-tavuk", price: 300, image: img("tavuk-izgara"), category: "yoresel-yemekler", sortOrder: 14, description: "" },
  { name: "Sebzeli Günün Yemeği", slug: "sebzeli-gunun-yemegi", price: 300, image: img("kavurma"), category: "yoresel-yemekler", sortOrder: 15, description: "" },
  { name: "Tora Pizza", slug: "tora-pizza", price: 350, image: img("pizza"), category: "yoresel-yemekler", sortOrder: 16, description: "" },

  // Çorba
  { name: "Kuzu İncik Çorbası", slug: "kuzu-incik-corbasi", price: 180, image: img("corba"), category: "corbalar", sortOrder: 1, description: "" },
  { name: "Beyran", slug: "beyran", price: 220, image: img("corba"), category: "corbalar", sortOrder: 2, description: "" },
  { name: "Mercimek Çorbası", slug: "mercimek-corbasi", price: 140, image: img("corba"), category: "corbalar", sortOrder: 3, description: "" },
  { name: "Ezogelin Çorbası", slug: "ezogelin-corbasi", price: 140, image: img("corba"), category: "corbalar", sortOrder: 4, description: "" },
  { name: "Tavuk Çorbası", slug: "tavuk-corbasi", price: 150, image: img("corba"), category: "corbalar", sortOrder: 5, description: "" },
  { name: "Yayla Çorbası", slug: "yayla-corbasi", price: 140, image: img("corba"), category: "corbalar", sortOrder: 6, description: "" },

  // Tatlı
  { name: "Fırında Sütlaç", slug: "firinda-sutlac", price: 180, image: img("sutlac"), category: "tatlilar", sortOrder: 1, description: "" },
  { name: "Kazandibi", slug: "kazandibi", price: 160, image: img("sutlac"), category: "tatlilar", sortOrder: 2, description: "" },

  // Sıcak içecek
  { name: "Çay", slug: "cay", price: 40, image: img("cay"), category: "sicak-icecekler", sortOrder: 1, description: "" },
  { name: "Türk Kahvesi", slug: "turk-kahvesi", price: 100, image: img("kahve"), category: "sicak-icecekler", sortOrder: 2, description: "" },
  { name: "Self Servis Kahve", slug: "self-servis-kahve", price: 60, image: img("kahve"), category: "sicak-icecekler", sortOrder: 3, description: "" },
  { name: "Espresso", slug: "espresso", price: 90, image: img("kahve"), category: "sicak-icecekler", sortOrder: 4, description: "" },
  { name: "Americano", slug: "americano", price: 90, image: img("kahve"), category: "sicak-icecekler", sortOrder: 5, description: "" },
  { name: "Cappuccino", slug: "cappuccino", price: 110, image: img("kahve"), category: "sicak-icecekler", sortOrder: 6, description: "" },
  { name: "Latte", slug: "latte", price: 110, image: img("kahve"), category: "sicak-icecekler", sortOrder: 7, description: "" },
  { name: "Aromalı Latte", slug: "aromali-latte", price: 120, image: img("kahve"), category: "sicak-icecekler", sortOrder: 8, description: "" },
  { name: "Mocha", slug: "mocha", price: 120, image: img("kahve"), category: "sicak-icecekler", sortOrder: 9, description: "" },
  { name: "White Chocolate Mocha", slug: "white-chocolate-mocha", price: 120, image: img("kahve"), category: "sicak-icecekler", sortOrder: 10, description: "" },
  { name: "Macchiato", slug: "macchiato", price: 100, image: img("kahve"), category: "sicak-icecekler", sortOrder: 11, description: "" },
  { name: "Flat White", slug: "flat-white", price: 110, image: img("kahve"), category: "sicak-icecekler", sortOrder: 12, description: "" },

  // Meşrubat
  { name: "Kola", slug: "kola", grams: "330 ml", price: 85, image: img("kola"), category: "mesrubatlar", sortOrder: 1, description: "" },
  { name: "Fanta", slug: "fanta", grams: "330 ml", price: 85, image: img("kola"), category: "mesrubatlar", sortOrder: 2, description: "" },
  { name: "Sprite", slug: "sprite", grams: "330 ml", price: 85, image: img("kola"), category: "mesrubatlar", sortOrder: 3, description: "" },
  { name: "Ice Tea", slug: "ice-tea", grams: "330 ml", price: 85, image: img("kola"), category: "mesrubatlar", sortOrder: 4, description: "" },
  { name: "Meyve Suyu", slug: "meyve-suyu", grams: "200 ml", price: 85, image: img("kola"), category: "mesrubatlar", sortOrder: 5, description: "" },
  { name: "Ayran (Küçük)", slug: "ayran-kucuk", grams: "200 ml", price: 30, image: img("ayran"), category: "mesrubatlar", sortOrder: 6, description: "" },
  { name: "Ayran (Büyük)", slug: "ayran-buyuk", grams: "300 ml", price: 40, image: img("ayran"), category: "mesrubatlar", sortOrder: 7, description: "" },
  { name: "Şalgam (El Yapımı)", slug: "salgam", grams: "300 ml", price: 45, image: img("ayran"), category: "mesrubatlar", sortOrder: 8, description: "" },
  { name: "Soda", slug: "soda", grams: "200 ml", price: 20, image: img("ayran"), category: "mesrubatlar", sortOrder: 9, description: "" },
  { name: "Su", slug: "su", grams: "330 ml", price: 20, image: img("ayran"), category: "mesrubatlar", sortOrder: 10, description: "" },
].map((item) => ({
  ...item,
  description: item.description || desc(item.name, item.grams),
}));

async function main() {
  const catMap: Record<string, string> = {};

  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder, isActive: true },
      create: { ...category, isActive: true },
    });
    catMap[category.slug] = row.id;
  }

  // Eski kategorileri pasifleştir
  await prisma.category.updateMany({
    where: { slug: { notIn: CATEGORIES.map((c) => c.slug) } },
    data: { isActive: false },
  });

  const keepSlugs = ITEMS.map((i) => i.slug);

  for (const item of ITEMS) {
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        categoryId: catMap[item.category],
        isAvailable: true,
        isFeatured: item.isFeatured ?? false,
        hasDoneness: item.hasDoneness ?? false,
        sortOrder: item.sortOrder,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image,
        categoryId: catMap[item.category],
        isAvailable: true,
        isFeatured: item.isFeatured ?? false,
        hasDoneness: item.hasDoneness ?? false,
        sortOrder: item.sortOrder,
      },
    });
  }

  await prisma.product.updateMany({
    where: { slug: { notIn: keepSlugs } },
    data: { isAvailable: false, isFeatured: false },
  });

  console.log(`Menü senkron: ${ITEMS.length} ürün, ${CATEGORIES.length} kategori.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
