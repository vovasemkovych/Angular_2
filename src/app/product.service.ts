import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSubject = new BehaviorSubject<any[]>(this.loadProducts());
  products$ = this.productsSubject.asObservable();
  private nextId = this.calculateNextId();

  // Load products from localStorage or initialize with an empty array
  private loadProducts(): any[] {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  }

  // Save products to localStorage
  private saveProducts(products: any[]): void {
    localStorage.setItem('products', JSON.stringify(products));
  }

  // Set initial products from API or localStorage
  setProducts(products: any[]): void {
    this.productsSubject.next(products);
    this.saveProducts(products);
    this.nextId = this.calculateNextId(); // Update nextId after setting products
  }

  // Add a new product with a unique ID
  addProduct(newProduct: any): void {
    const currentProducts = this.productsSubject.getValue();
    newProduct.id = this.nextId++; // Assign unique ID and increment
    const updatedProducts = [...currentProducts, newProduct];
    this.productsSubject.next(updatedProducts);
    this.saveProducts(updatedProducts); // Save to localStorage
  }

  // Delete a product by ID
  deleteProduct(id: number): void {
    const currentProducts = this.productsSubject.getValue();
    const updatedProducts = currentProducts.filter(product => product.id !== id);
    this.productsSubject.next(updatedProducts);
    this.saveProducts(updatedProducts); // Save to localStorage
  }

  // Calculate the next available ID based on current products
  private calculateNextId(): number {
    const products = this.productsSubject.getValue();
    const maxId = products.length ? Math.max(...products.map(p => p.id)) : 20;
    return maxId + 1;
  }
}
