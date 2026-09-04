const fs = require('fs');

const rawData = [
  [ "No", "Kategori", "Nama Barang", "Stok Aman", "Satuan" ],
  [ 1, "Pastry", "Salt Bread", 5, "pcs" ],
  [ 2, "Pastry", "Soft Sourdough", 4, "pcs" ],
  [ 3, "Pastry", "Glaze Strawberry", 250, "ml" ],
  [ 4, "Pastry", "Banana Cake", 3, "pcs" ],
  [ 5, "Makan Besar", "Beras", 2, "KG" ],
  [ 6, "Makan Besar", "Bawang Goreng", 1, "pcs" ],
  [ 7, "Makan Besar", "Telur", 5, "pcs" ],
  [ 8, "Makan Besar", "Sawi", 1, "pcs" ],
  [ 9, "Makan Besar", "Jeruk Nipis", 3, "pcs" ],
  [ 10, "Makan Besar", "Indomie Goreng Biasa", 10, "pcs" ],
  [ 11, "Makan Besar", "Indomie Ayam Bawang", 5, "pcs" ],
  [ 12, "Makan Besar", "Indomie Soto Lamongan", 5, "pcs" ],
  [ 13, "Makan Besar", "Indomie Geprek", 5, "pcs" ],
  [ 14, "Makan Besar", "Indomie Aceh", 5, "pcs" ],
  [ 15, "Makan Besar", "Indomie Goreng Pedas", 5, "pcs" ],
  [ 16, "Makan Besar", "Indomie Kari Ayam", 5, "pcs" ],
  [ 17, "Makan Besar", "Ayam Filet", 5, "pcs" ],
  [ 18, "Makan Besar", "Timun", 1, "pcs" ],
  [ 19, "Makan Besar", "Ayam Geprek", 5, "pcs" ],
  [ 20, "Snacks", "Lupa Lelah Platter", 5, "pcs" ],
  [ 21, "Snacks", "Rehat Dulu Platter", 5, "pcs" ],
  [ 22, "Snacks", "Siomay Dimsum", 5, "pcs" ],
  [ 23, "Snacks", "Kentang Goreng", 15, "pcs" ],
  [ 24, "Snacks", "Tahu Ayam Jamur", 4, "pcs" ],
  [ 25, "Snacks", "Tahu Walik", 4, "pcs" ],
  [ 26, "Snacks", "Donat", 3, "pcs" ],
  [ 27, "Snacks", "Roti Bakar", 3, "pcs" ],
  [ 28, "Snacks", "Cireng", 4, "pcs" ],
  [ 29, "Snacks", "Pisang Crispy", 4, "pcs" ],
  [ 30, "Bahan/Supply", "Gula Sachet", 20, "pcs" ],
  [ 31, "Bahan/Supply", "Keju Batang", 10, "pcs" ],
  [ 32, "Bahan/Supply", "Coklat Batang", 20, "gr" ],
  [ 33, "Bahan/Supply", "Goldenfil", 0.5, "btl" ],
  [ 34, "Bahan/Supply", "Wafer Coklat", 5, "pcs" ],
  [ 35, "Bahan/Supply", "Wedang Jahe Sereh", 5, "pcs" ],
  [ 36, "Bahan/Supply", "Wafer Rolls (C/S)", 5, "pcs" ],
  [ 37, "Bahan/Supply", "Wafer Biscoff/ Remah", 2, "pcs" ],
  [ 38, "Bahan/Supply", "Ice Cream", 1, "pcs" ],
  [ 39, "Bahan/Supply", "Regal", 1, "pcs" ],
  [ 40, "Bahan/Supply", "SKM", 4, "pcs" ],
  [ 41, "Bahan/Supply", "Nutella", 0.5, "btl" ],
  [ 42, "Bahan/Supply", "Saus Tomat", 1, "pcs" ],
  [ 43, "Bahan/Supply", "Saus Sambal", 1, "pcs" ],
  [ 44, "Bahan/Supply", "Garam", 1, "pcs" ],
  [ 45, "Bahan/Supply", "Totole", 1, "pcs" ],
  [ 46, "Bahan/Supply", "Lada", 1, "pcs" ],
  [ 47, "Bahan/Supply", "Cabe Bubuk", 1, "pcs" ],
  [ 48, "Bahan/Supply", "Gula Halus", 1, "pcs" ],
  [ 49, "Bahan/Supply", "Gula Pasir", 1, "kg" ],
  [ 50, "Bahan/Supply", "Mentega", 1, "pcs" ],
  [ 51, "Bahan/Supply", "Minyak", 1, "pcs" ],
  [ 52, "Bahan/Supply", "Balado", 1, "pcs" ],
  [ 53, "Bahan/Supply", "Kresek Sampah", 4, "pcs" ],
  [ 54, "Bahan/Supply", "Kresek Takeaway", 0.3333333333333333, "pack" ],
  [ 55, "Bahan/Supply", "Sedotan Hot", 50, "gr" ],
  [ 56, "Bahan/Supply", "Sedotan Ice", 50, "gr" ],
  [ 57, "Bahan/Supply", "Cup Hot", 10, "pcs" ],
  [ 58, "Bahan/Supply", "Cup Ice", 25, "pcs" ],
  [ 59, "Bahan/Supply", "Thermal Roll", 3, "pcs" ],
  [ 60, "Bahan/Supply", "Kertas Mix Platter", 5, "pcs" ],
  [ 61, "Bahan/Supply", "Kertas Minyak", 1, "pcs" ],
  [ 62, "Bahan/Supply", "Karet Gelang", 1, "pcs" ],
  [ 63, "Bahan/Supply", "Kardus", 1, "pcs" ],
  [ 64, "Bahan/Supply", "Tissu", 4, "pcs" ],
  [ 65, "Bahan/Supply", "Sterofoam", 4, "pcs" ],
  [ 66, "Bahan/Supply", "Mika sambal cireng", 1, "pcs" ],
  [ 67, "Bahan/Supply", "Mika saus", 1, "pcs" ],
  [ 68, "Bahan/Supply", "Glaze Coklat", 200, "ml" ],
  [ 69, "Bahan/Supply", "Paperbag Coklat", 20, "pcs" ],
  [ 70, "Bahan/Supply", "Sendok takeaway", 20, "pcs" ],
  [ 71, "Bahan/Supply", "Packaging Sandwich", 1, "pcs" ],
  [ 72, "Bahan/Supply", "Cup saus", 1, "pcs" ],
  [ 73, "Bahan/Supply", "Filter V60", 20, "pcs" ],
  [ 74, "Bahan/Supply", "Plastik Saus (10gr)", 1, "pack" ],
  [ 75, "Minuman", "Air mineral besar", 10, "pcs" ],
  [ 76, "Minuman", "Air mineral kecil", 10, "pcs" ],
  [ 77, "Minuman", "Fanta", 5, "pcs" ],
  [ 78, "Minuman", "Yakult", 5, "pcs" ],
  [ 79, "Minuman", "Coffee Beer", 10, "pcs" ],
  [ 80, "Minuman", "Wedang Uwuh", 10, "pcs" ],
  [ 81, "Minuman", "Coklat 3gr", 10, "pcs" ],
  [ 82, "Minuman", "Coklat 8gr", 10, "pcs" ],
  [ 83, "Minuman", "Coklat 13gr", 10, "pcs" ],
  [ 84, "Minuman", "Milo", 5, "pcs" ],
  [ 85, "Minuman", "Red Velvet", 1, "pcs" ],
  [ 86, "Minuman", "Taro", 1, "pcs" ],
  [ 87, "Minuman", "Milkshake Coklat", 1, "pcs" ],
  [ 88, "Minuman", "Milkshake Greentea", 1, "pcs" ],
  [ 89, "Minuman", "Milkshake Oreo", 1, "pcs" ],
  [ 90, "Minuman", "Toffin Greentea", 1, "pcs" ],
  [ 91, "Minuman", "Milkshake Strawberry", 1, "pcs" ],
  [ 92, "Minuman", "FM", 7, "pcs" ],
  [ 93, "Minuman", "UHT", 5, "pcs" ],
  [ 94, "Sirup", "Sirup Vanilla", 1, "pcs" ],
  [ 95, "Sirup", "Sirup Karamel", 1, "pcs" ],
  [ 96, "Sirup", "Gula Jahe", 1, "pcs" ],
  [ 97, "Sirup", "Aren", 1, "pcs" ],
  [ 98, "Sirup", "Honey Lemont ea", 1, "pcs" ],
  [ 99, "Sirup", "Tea", 5, "pcs" ],
  [ 100, "Sirup", "Selai Strawberry", 1, "pcs" ],
  [ 101, "Sirup", "Sirup Lime", 60, "ml" ],
  [ 102, "Sirup", "Sirup Strawberry", 500, "ml" ],
  [ 103, "Sirup", "Creamy latte", 300, "ml" ],
  [ 104, "Sirup", "Aren Biscoff/LL", 300, "ml" ]
];

rawData.shift();

const categoriesSet = new Set();
rawData.forEach(row => categoriesSet.add(row[1]));

const categories = Array.from(categoriesSet).map((name, index) => ({
  id: `cat_${index + 1}`,
  name: name.toUpperCase()
}));

const items = rawData.map((row, index) => {
  const cat = categories.find(c => c.name === row[1].toUpperCase());
  return {
    id: `item_${index + 1}`,
    categoryId: cat.id,
    name: row[2],
    safe_stock: row[3],
    unit: row[4]
  };
});

const tsContent = `export const DUMMY_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const DUMMY_ITEMS = ${JSON.stringify(items, null, 2)};
`;

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/inventory.ts', tsContent);
console.log('Done generating inventory.ts');
