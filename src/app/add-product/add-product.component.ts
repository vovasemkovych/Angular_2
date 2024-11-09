
import { Component } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent {
  newProduct = {
    title: '',
    price: 0,
    category: '',
    description: '',
    image: ''
  };

  constructor(private productService: ProductService) {}

  addProduct(): void {
    if (!this.newProduct.title || !this.newProduct.price) {
      console.error('Product title and price are required');
      return;
    }

    // Add the new product via the ProductService
    this.productService.addProduct(this.newProduct);

    // Reset the form after adding the product (optional)
    this.newProduct = { title: '', price: 0, category: '', description: '', image: '' };
  }
  // onAddNewProduct(): void {
  //   // Sample new product data (you can get this from a form or API)
  //   const newProduct = { id: 101, title: 'New Product', price: 20.99 };
    
  //   // Add product via ProductService
  //   this.productService.addProduct(newProduct);

  //   // Log the updated product list to console
  //   this.productService.products$.subscribe((products) => {
  //     console.log('Updated Product List:', products);
  //   });

    
  // }
}
