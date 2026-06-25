/**
 * Curated streetwear/fashion imagery from Unsplash.
 * Replace any ID below with a different Unsplash photo by swapping the
 * portion after `photo-` in the URL.
 */
const u = (id: string, w = 900, h = 1125) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=entropy&q=80&auto=format`;

export const IMG = {
  hero:       u("1483985988355-763728e1935b", 1000, 1250), // street style portrait
  heroAlt:    u("1490481651871-ab68de25d43d", 1000, 1250),
  editorial:  u("1556821840-3a63f95609a7", 1000, 1250), // outerwear editorial (replaced dead 404)
  private:    u("1583743814966-8936f5b7be1a", 1000, 1250), // jacket — luxury division
  about:      u("1485125639709-a60c3a500bf1",  900, 1125),

  // Category landing tiles
  category: {
    clothing:    u("1521572163474-6864f9cf17ab", 700, 875), // hanging tee
    shoes:       u("1542291026-7eec264c27ff",    700, 875), // Air Force 1
    accessories: u("1611652022419-a9419f74343d", 700, 875), // cap
    fragrance:   u("1541643600914-78b084683601", 700, 875), // bottle
  },

  // Per-category product photo pools — each product picks 3 images
  // (rotates through the pool by index)
  productPool: {
    clothing: [
      u("1521572163474-6864f9cf17ab"),   // hanging tee
      u("1556906781-9a412961c28c"),      // hoodie portrait
      u("1583743814966-8936f5b7be1a"),   // jacket
      u("1551488831-00ddcb6c6bd3"),      // knit
      u("1556821840-3a63f95609a7"),      // outerwear
      u("1620799140408-edc6dcb6d633"),   // shirt detail
      u("1542596594-649edbc13630"),      // denim
      u("1503342217505-b0a15ec3261c"),   // hoodie back
    ],
    shoes: [
      u("1542291026-7eec264c27ff"),      // sneaker
      u("1543163521-1bf539c55dd2"),      // sneakers display
      u("1539109136881-3be0616acf4b"),   // shoes
      u("1606107557195-0e29a4b5b4aa"),   // sneakers angle
      u("1551107696-a4b0c5a0d9a2"),      // loafer
      u("1525966222134-fcfa99b8ae77"),   // boots
    ],
    accessories: [
      u("1611652022419-a9419f74343d"),   // cap
      u("1591348122449-02525d70379b"),   // wallet
      u("1601924921557-45e6dea0a157"),   // bag
      u("1610216705422-caa3fcb6d158"),   // hat
      u("1559563458-527698bf5295"),      // sunglasses
    ],
    fragrance: [
      u("1541643600914-78b084683601"),   // bottle
      u("1592945403244-b3fbafd7f539"),   // bottle 2
      u("1594035910387-fea47794261f"),   // bottle 3
      u("1615634376658-c80abf877e7d"),   // bottle 4
    ],
  },
};

/** Pick a deterministic set of N images from a category pool, seeded by string. */
export function pickImages(category: "clothing" | "shoes" | "accessories" | "fragrance", seed: string, n = 3) {
  const pool = IMG.productPool[category];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const start = Math.abs(h) % pool.length;
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
}
