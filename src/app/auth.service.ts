import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

interface User {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  cart: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private loggedInUser: User | null = null;
  private apiUrl = 'https://fakestoreapi.com/users'; 
  private usersSubject = new BehaviorSubject<User[]>([]); 
  private cartSubject = new BehaviorSubject<any[]>([]); 
  cartItems$ = this.cartSubject.asObservable(); 
  constructor(private http: HttpClient, private router: Router) {
    this.loadUsers();
  }

  get isLoggedIn(): boolean {
    return !!this.loggedInUser;
  }
  getLoggedInUser(): any {
    return this.loggedInUser;
  }
  get isAdmin(): boolean {
    return this.loggedInUser?.role === 'admin';
  }

  // Login method
  login(username: string, email: string, password: string): boolean {
    // Check if any field is empty
    if (!username || !email || !password) {
      alert('Please fill in all fields.');
      return false;
    }
  
    // Check if the user exists
    let user = this.users.find(u => u.username === username && u.email === email && u.password === password);
  
    if (!user) {
      // If the user doesn't exist, we can conditionally assign the 'admin' role for specific users
      if (email === 'admin@admin.com') {
        user = { username, email, password, role: 'admin', cart: [] };
      } else {
        // If not admin, create a regular user
        user = { username, email, password, role: 'user', cart: [] };
      }
  
      // Save the newly created user
      this.users.push(user);
      this.saveUsers();
      alert('User not found, but registration was successful!');
    }
    
    // Successfully logged in
    this.loggedInUser = user;
    this.saveLoggedInUser();  // Save the logged-in user to localStorage
    this.loadCart(); 
    return true;
  }
  

  // Logout method
  logout(): void {
    this.saveCart();
    this.loggedInUser = null;
    localStorage.removeItem('cart'); // Clear cart data on logout
    localStorage.removeItem('loggedInUser');
    window.location.reload();
    this.router.navigate(['/login']);
  }
  private updateCart(): void {
    if (this.loggedInUser) {
      this.cartSubject.next(this.loggedInUser.cart);  // Emit the current cart data
    }
  }
  // Add item to cart
  addToCart(item: any): void {
    if (this.loggedInUser) {
      console.log('Adding item to cart:', item); // Log item being added
      this.saveCart(); // Save cart after adding an item
      this.cartSubject.next(this.loggedInUser.cart);
      this.loggedInUser.cart.push(item);
      this.saveUsers();  // Save updated users to localStorage
      this.updateCart();;   // Save updated cart to localStorage
    }
  }
  
  removeFromCart(itemId: number): void {
    if (this.loggedInUser) {
      this.loggedInUser.cart = this.loggedInUser.cart.filter(item => item.id !== itemId);
      this.saveUsers();  // Save updated users to localStorage
      this.updateCart();  // Save updated cart to localStorage
    }
  }
  private saveCart(): void {
    if (this.loggedInUser) {
      const cartKey = `${this.loggedInUser.username}-cart`;
      localStorage.setItem(cartKey, JSON.stringify(this.loggedInUser.cart)); // Save cart with the username-based key
    }
  }
  private loadCart(): void {
    if (this.loggedInUser) {
      const cartKey = `${this.loggedInUser.username}-cart`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        this.loggedInUser.cart = JSON.parse(savedCart); // Load cart from localStorage
        this.cartSubject.next(this.loggedInUser.cart);  // Emit updated cart data
      }
    }
  }
  // Get user's cart
  getUserCart(): any[] {

    return this.loggedInUser ? this.loggedInUser.cart : [];
  }

  // Get all users (from API or localStorage)
  getAllUsers() {
    // Fetch users from the API
    const apiUsers$ = this.http.get<User[]>(this.apiUrl);
  
    // Fetch local users from localStorage
    const localUsers = this.users;
  
    // Combine API users with local users and return them as an observable
    return apiUsers$.pipe(
      map(apiUsers => {
        // Return combined users
        return [...apiUsers, ...localUsers];
      })
    );
  }

  // Delete a user by username
  deleteUser(username: string): Observable<void> {
    // Simulate a deletion process (in a real API, you would make a delete request)
    this.users = this.users.filter(user => user.username !== username);
    this.saveUsers();
    return new Observable<void>((observer) => {
      observer.next();
      observer.complete();
    });
  }

  // Method to create an admin user manually (for testing purposes)
  createAdminUser(username: string, email: string, password: string): void {
    const adminUser: User = { username, email, password, role: 'admin', cart: [] };
    this.users.push(adminUser);
    this.saveUsers();
  }

  // Load users from localStorage (or API if applicable)
  private loadUsers(): void {
    const usersData = localStorage.getItem('users');
    console.log('Loaded users from localStorage:', usersData); // Log the users loaded from localStorage

    if (usersData) {
      this.users = JSON.parse(usersData);
    } else {
      // If no users in localStorage, load from API (optional)
      this.http.get<User[]>(this.apiUrl).subscribe(fetchedUsers => {
        this.users = fetchedUsers;
        this.saveUsers();
      });
    }

    const loggedInUserData = localStorage.getItem('loggedInUser');
    console.log('Loaded logged-in user from localStorage:', loggedInUserData); // Log the logged-in user

    if (loggedInUserData) {
      this.loggedInUser = JSON.parse(loggedInUserData);
    }
  }

  // Save users to localStorage
  private saveUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
    this.usersSubject.next(this.users); // Update the BehaviorSubject whenever users change
  }

  // Save logged-in user to localStorage
  private saveLoggedInUser(): void {
    if (this.loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));
    }
  }
  clearUserCart(): void {
    if (this.loggedInUser) {
      // Clear the cart from the logged-in user session
      this.loggedInUser.cart = [];
      this.saveUsers();  // Save updated user to localStorage
      this.cartSubject.next([]);  // Emit an empty cart to cartSubject
      this.saveLoggedInUser();  // Save the logged-in user to localStorage with empty cart
    }
  }
}
