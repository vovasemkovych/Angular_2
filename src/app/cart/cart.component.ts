import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Subscribe to cart items and total price observables
    this.cartService.cartItems$.subscribe(cart => {
      this.cartItems = cart;
    });
    this.cartService.totalPrice$.subscribe(price => {
      this.totalPrice = price;
    });
    this.cartService.loadCart();  // Load cart on initialization
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);  // Remove one unit of the product
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);  // Add one more unit of the product
  }

  clearCart(): void {
    this.cartService.clearCart();  // Clear the entire cart
  }
}
