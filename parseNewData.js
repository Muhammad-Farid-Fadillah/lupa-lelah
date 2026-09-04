const fs = require('fs');

const rawText = `🥐 PASTRY
No	Nama Barang	Stok Aman
1	Salt Bread	5
2	Soft Sourdough	4
3	Glaze Strawberry	250 ml
4	Banana Cake	3
🍛 MAKAN BESAR
No	Nama Barang	Stok Aman
1	Beras	2 KG
2	Bawang Goreng	1
3	Telur	5
4	Sawi	1
5	Jeruk Nipis	3
6	Indomie Goreng Biasa	10
7	Indomie Ayam Bawang	5
8	Indomie Soto Lamongan	5
9	Indomie Geprek	5
10	Indomie Aceh	5
11	Indomie Goreng Pedas	5
12	Indomie Kari Ayam	5
13	Ayam Filet	5
14	Timun	1
15	Ayam Geprek	5
🍟 SNACKS
No	Nama Barang	Stok Aman
1	Lupa Lelah Platter	5
2	Rehat Dulu Platter	5
3	Siomay Dimsum	5
4	Kentang Goreng	15
5	Tahu Ayam Jamur	4
6	Tahu Walik	4
7	Donat	3
8	Roti Bakar	3
9	Cireng	4
10	Pisang Crispy	4
📦 BAHAN / SUPPLY
No	Nama Barang	Stok Aman
1	Gula Sachet	20
2	Keju Batang	10
3	Coklat Batang	20 gr
4	Goldenfil	1/2 btl
5	Wafer Coklat	5
6	Wedang Jahe Sereh	5
7	Wafer Rolls (C/S)	5
8	Wafer Biscoff/ Remah	2
9	Ice Cream	1
10	Regal	1
11	SKM	4
12	Nutella	1/2 btl
13	Saus Tomat	1
14	Saus Sambal	1
15	Garam	1
16	Totole	1
17	Lada	1
18	Cabe Bubuk	1
19	Gula Halus	1
20	Gula Pasir	1 kg
21	Mentega	1
22	Minyak	1
23	Balado	1
24	Kresek Sampah	4
25	Kresek Takeaway	1/3 pack
26	Sedotan Hot	50 gr
27	Sedotan Ice	50 gr
28	Cap Hot	10
29	Cap Ice	25
30	Thermal Roll	3
31	Kertas Mix Platter	5
32	Kertas Minyak	1
33	Karet Gelang	1
34	Kardus	1
35	Tissu	4
36	Sterofoam	4
37	Mika sambal cireng	1
38	Mika saus	1
39	Glaze Coklat	200 ml
40	Paperbag Coklat	20
41	Sendok takeaway	20
42	Packaging Sandwich	1
43	Cup saus	1
44	Filter V60	20
45	Plastik Saus (10gr)	1 pack
🥤 MINUMAN
No	Nama Barang	Stok Aman
1	Air mineral besar	10
2	Air mineral kecil	10
3	Fanta	5
4	Yakult	5
5	Coffee Beer	10
6	Wedang Uwuh	10
7	Coklat 3gr	10
8	Coklat 8gr	10
9	Coklat 13gr	10
10	Milo	5
11	Red Velvet	1
12	Taro	1
13	Milkshake Coklat	1
14	Milkshake Greentea	1
15	Milkshake Oreo	1
16	Toffin Greentea	1
17	Milkshake Strawberry	1
18	FM	7
19	UHT	5
🍯 SIRUP
No	Nama Barang	Stok Aman
1	Sirup Vanilla	1
2	Sirup Karamel	1
3	Gula Jahe	1
4	Aren	1
5	Honey Lemont ea	1
6	Tea	5
7	Selai Strawberry	1
8	Sirup Lime	60 ml
9	Sirup Strawberry	500 ml
10	Creamy latte	300 ml
11	Aren Biscoff/LL	300 ml`;

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);

const categories = [];
const items = [];
let currentCategory = null;

let catIndex = 0;
let itemIndex = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.startsWith('No\tNama Barang')) {
    continue; // skip header
  }

  // Check if line is a category (starts with emoji or does not start with a number)
  if (!/^\d+\t/.test(line)) {
    catIndex++;
    // Remove emojis and leading/trailing whitespace
    const catName = line.replace(/^[\u2700-\u27bf\ud800-\udbff\udc00-\udfff\u2600-\u26ff]\s*/, '').trim();
    currentCategory = { id: 'cat_' + catIndex, name: catName };
    categories.push(currentCategory);
    continue;
  }

  // It's an item line
  if (currentCategory) {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      itemIndex++;
      const name = parts[1];
      const stokParts = parts[2].split(' ');
      
      let safe_stock = stokParts[0];
      let unit = stokParts.slice(1).join(' ');
      
      if (!unit) {
        unit = 'pcs';
      }

      items.push({
        id: 'item_' + itemIndex,
        categoryId: currentCategory.id,
        name: name,
        safe_stock: safe_stock,
        unit: unit
      });
    }
  }
}

const tsContent = 'export const DUMMY_CATEGORIES = ' + JSON.stringify(categories, null, 2) + ';\n\n' +
'export const DUMMY_ITEMS = ' + JSON.stringify(items, null, 2) + ';\n';

fs.writeFileSync('src/data/inventory.ts', tsContent);
console.log('Done generating new inventory.ts');
