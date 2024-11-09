import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  notificationVisible = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.productService.products$.subscribe((products) => {
      this.products = products;
      console.log('Updated products list:', this.products);
    });

    // Fetch products only if they haven’t been loaded already
    if (this.products.length === 0) {
      fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(data => this.productService.setProducts(data));
    }
  }

  selectedProduct: any = null;
  toggleOverlay(product: any): void {
    this.selectedProduct = product;
  }

  closeOverlay(): void {
    this.selectedProduct = null;
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
    this.notificationVisible = true;

    setTimeout(() => {
      this.notificationVisible = false;
    }, 1000);
  }

  // Delete a product by ID
  deleteProduct(id: number): void {
    this.productService.deleteProduct(id);
  }
}
