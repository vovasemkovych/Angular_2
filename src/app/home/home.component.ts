import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product.service';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  cartNotificationVisible = false; // Cart notification flag
  deleteNotificationVisible = false; // Delete notification flag
  cartNotLoggedNotificationVisible = false; //Not logged notification flag
  NotificationMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService 
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
    if (this.authService.isLoggedIn) {  // Check if the user is logged in
      this.cartService.addToCart(product);
      this.cartNotificationVisible = true;

      setTimeout(() => {
        this.cartNotificationVisible = false;
      }, 1000);
    } else {
      this.cartNotLoggedNotificationVisible = true;
      this.NotificationMessage = 'Please log in to add items to your cart.';
      
      setTimeout(() => {
        this.cartNotLoggedNotificationVisible = false;
      }, 1000);
    }
  }

  // Delete a product by ID
  deleteProduct(id: number): void {
    if (this.authService.isAdmin) {  // Check if the user is an admin
      this.productService.deleteProduct(id);
    } else {
      this.NotificationMessage = 'You are not allowed to delete products.';
      this.deleteNotificationVisible = true;

      // Hide the notification after 1 seconds
      setTimeout(() => {
        this.deleteNotificationVisible = false;
      }, 1000);
    }
  }
}
