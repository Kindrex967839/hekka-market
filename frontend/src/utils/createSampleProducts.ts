import { supabase } from './supabaseClient';
import { featuredProducts } from './sampleData';

/**
 * Create sample products in Supabase for testing
 * This function should be called only in development
 */
export const createSampleProducts = async () => {
  try {
    console.log('Creating sample products in Supabase...');
    
    // First, check if we have any categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }
    
    if (!categories || categories.length === 0) {
      console.log('No categories found. Creating sample categories...');
      
      // Create sample categories
      const sampleCategories = [
        { name: 'Digital Art' },
        { name: 'Templates' },
        { name: 'E-books' },
        { name: 'Music' },
        { name: 'Software' },
        { name: 'Courses' },
        { name: 'Photography' },
        { name: 'Graphics' }
      ];
      
      const { data: createdCategories, error: createCategoriesError } = await supabase
        .from('categories')
        .insert(sampleCategories)
        .select();
      
      if (createCategoriesError) {
        console.error('Error creating categories:', createCategoriesError);
        return;
      }
      
      console.log('Created sample categories:', createdCategories);
    }
    
    // Get the categories again (including newly created ones)
    const { data: allCategories, error: allCategoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (allCategoriesError || !allCategories) {
      console.error('Error fetching all categories:', allCategoriesError);
      return;
    }
    
    // Check if we already have products
    const { data: existingProducts, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }
    
    if (existingProducts && existingProducts.length > 0) {
      console.log(`Found ${existingProducts.length} existing products. Skipping sample product creation.`);
      return;
    }
    
    // Get the current user for seller_id
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user.id) {
      console.error('No authenticated user found. Please sign in to create sample products.');
      return;
    }
    
    const sellerId = session.session.user.id;
    
    // Create sample products based on featuredProducts
    const productsToCreate = featuredProducts.map(product => {
      // Find a matching category or use the first one
      const category = allCategories.find(cat => cat.name === product.category) || allCategories[0];
      
      return {
        title: product.title,
        description: product.description,
        price: product.price,
        category_id: category.id,
        seller_id: sellerId,
        is_published: true,
        product_type: 'digital_download'
      };
    });
    
    const { data: createdProducts, error: createProductsError } = await supabase
      .from('products')
      .insert(productsToCreate)
      .select();
    
    if (createProductsError) {
      console.error('Error creating products:', createProductsError);
      return;
    }
    
    console.log(`Created ${createdProducts.length} sample products.`);
    
    return createdProducts;
  } catch (error) {
    console.error('Error creating sample products:', error);
  }
};
