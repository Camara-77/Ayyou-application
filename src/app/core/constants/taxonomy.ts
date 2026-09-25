export interface MainCategory {
  id: string;
  name: string;
  subCategories: string[];
}

export const CATEGORIES_HIERARCHY: MainCategory[] = [
  {
    id: 'senegalaise',
    name: 'Cuisine sénégalaise',
    subCategories: ['Thiéboudienne', 'Yassa', 'Mafé', 'Ceebu yapp', 'Ceebu guinar', 'Domoda', 'Soupou kandia', 'Thiéré', 'Lakhou bissap', 'Caldou']
  },
  {
    id: 'africaine',
    name: 'Cuisine africaine',
    subCategories: ['Attiéké', 'Alloco', 'Plat Sauce Graine', 'Ndolé', 'Koki', 'Foutou', 'Taro', 'Saga saga']
  },
  {
    id: 'grillades',
    name: 'Grillades & Dibi',
    subCategories: ['Dibi agneau', 'Dibi poulet', 'Poulet braisé', 'Poulet grillé', 'Brochettes', 'Viande grillée', 'Poisson braisé', 'Méchoui']
  },
  {
    id: 'street_food',
    name: 'Street food & Fast food',
    subCategories: ['Burger', 'Shawarma', 'Tacos', 'Sandwich', 'Panini', 'Hot-dog', 'Pastels', 'Fataya']
  },
  {
    id: 'fast_food',
    name: 'Fast-food moderne',
    subCategories: ['Frites', 'Nuggets', 'Wings', 'Pizza Fast', 'Tenders', 'Cornet frites']
  },
  {
    id: 'seafood',
    name: 'Seafood & Poissons',
    subCategories: ['Crevettes braisées', 'Poisson Capitaine', 'Thiof grillé', 'Gambas', 'Calamars', 'Langouste', 'Crabe']
  },
  {
    id: 'pizzeria',
    name: 'Pizzeria',
    subCategories: ['Pizza Margherita', 'Pizza Quatre Fromages', 'Pizza Reine', 'Pizza Viande Hachée', 'Pizza Calzone', 'Pizza Poulet']
  },
  {
    id: 'maison',
    name: 'Cuisine maison',
    subCategories: ['Ragoût maison', 'Soupe traditionnelle', 'Plat mijoté', 'Gratin', 'Puree artisanale']
  },
  {
    id: 'entrees',
    name: 'Entrées',
    subCategories: ['Salade composée', 'Pastels Thon', 'Nems', 'Samoussas', 'Accras', 'Soupe']
  },
  {
    id: 'plats',
    name: 'Plats principaux',
    subCategories: ['Plat du jour', 'Spécialité Chef', 'Menu complet', 'Assiette garnie']
  },
  {
    id: 'salades',
    name: 'Salades & Healthy',
    subCategories: ['Salade César', 'Salade Niçoise', 'Salade de Crabe', 'Salade Exotique', 'Bowl Végan']
  },
  {
    id: 'snacks',
    name: 'Petit-déjeuner & Snack',
    subCategories: ['Beignets', 'Chips maison', 'Pop-corn salé', 'Apéritifs', 'Omelette garnie']
  },
  {
    id: 'desserts',
    name: 'Pâtisserie & Desserts',
    subCategories: ['Thiakry', 'Salade de fruits', 'Gâteaux', 'Tartes', 'Crèmes', 'Glace', 'Mousse chocolat']
  },
  {
    id: 'boissons',
    name: 'Jus & Boissons locales',
    subCategories: ['Bissap', 'Bouye', 'Gingembre', 'Ditakh', 'Jus de fruits', 'Smoothie', 'Milkshake', 'Eau / Soda', 'Café Touba']
  },
  {
    id: 'boulangerie',
    name: 'Boulangerie',
    subCategories: ['Pain tapalapa', 'Pain complet', 'Baguette artisanale', 'Brioche', 'Croissant']
  },
  {
    id: 'poulet',
    name: 'Poulet & Volailles',
    subCategories: ['Poulet rôti', 'Poulet Yassa', 'Chawarma poulet', 'Cuisse de poulet']
  },
  {
    id: 'epicerie',
    name: 'Épicerie & Produits locaux',
    subCategories: ['Huile de palme', 'Épices', 'Piment', 'Céréales locales', 'Miel naturel']
  },
  {
    id: 'traiteur',
    name: 'Traiteur & Événementiel',
    subCategories: ['Buffet mariage', 'Cocktail dinatoire', 'Pause café', 'Pack cérémonie']
  }
];

export function getCategoryByName(name: string): MainCategory | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return CATEGORIES_HIERARCHY.find(c => 
    c.name.toLowerCase() === normalized || c.id.toLowerCase() === normalized
  );
}

export function getSubCategoriesForCategory(categoryName: string): string[] {
  const category = getCategoryByName(categoryName);
  return category ? category.subCategories : [];
}
