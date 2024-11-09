import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<any[]>([]);  // Observable for cart items
  cartItems$ = this.cartItemsSubject.asObservable();  // Expose cart items to components
  private totalPriceSubject = new BehaviorSubject<number>(0);  // Observable for total price
  totalPrice$ = this.totalPriceSubject.asObservable();  // Expose total price to components
  private cart: any[] = [];  // Internal cart structure

  constructor(private authService: AuthService) {
    this.loadCart();
  }

  // Load cart from localStorage or AuthService
  loadCart(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart = JSON.parse(storedCart);  // Retrieve from localStorage

      // Ensure all cart items have valid quantity (if not, reset them to 1)
      this.cart = this.cart.map(item => ({
        ...item,
        quantity: item.quantity && !isNaN(item.quantity) ? item.quantity : 1
      }));
    } else if (this.authService.isLoggedIn) {
      // When logged in, load from AuthService
      this.cart = this.authService.getLoggedInUser()?.cart || [];
    }

    // After loading the cart, update cart data and price
    this.cartItemsSubject.next(this.cart);
    this.updateTotalPrice();  // Recalculate total price
  }

  // Add item to cart or increase quantity if already exists
  addToCart(item: any): void {
    if (!this.authService.isLoggedIn) {
      console.warn('User not logged in, unable to add item to cart');
      return;
    }

    const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;  // Increment quantity if item exists
    } else {
      this.cart.push({ ...item, quantity: 1 });  // Add new item with quantity 1
    }

    this.updateCart();
  }

  // Remove one unit of the item or remove the item completely if quantity is 1
  removeFromCart(productId: number): void {
    const existingItem = this.cart.find(cartItem => cartItem.id === productId);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;  // Decrease quantity by 1
      } else {
        this.cart = this.cart.filter(cartItem => cartItem.id !== productId);  // Remove item completely
      }
    }

    this.updateCart();
  }

  // Update cart state and recalculate total price
  private updateCart(): void {
    this.cartItemsSubject.next([...this.cart]);  // Emit updated cart items
    this.updateTotalPrice();  // Recalculate total price immediately
    localStorage.setItem('cart', JSON.stringify(this.cart));  // Store updated cart in localStorage
  }

  // Calculate and update total price
  private updateTotalPrice(): void {
    const total = this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);  // Sum price * quantity
    this.totalPriceSubject.next(total);  // Emit total price
  }

  // Clear the cart
  clearCart(): void {
    this.cart = [];
    this.cartItemsSubject.next([]);
    this.totalPriceSubject.next(0);
    localStorage.removeItem('cart');  // Remove cart from localStorage
    if (this.authService.isLoggedIn) {
      this.authService.getLoggedInUser().cart = [];  // Clear cart from logged-in user's session
      if (this.authService.isLoggedIn) {
        this.authService.clearUserCart();  // Notify AuthService to clear cart in user session
      }
    }
}
}
