import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { NavbarComponent } from '../../shared/navbar/navbar';
// import { FooterComponent } from '../../shared/footer/footer';
// import { BrowserStorageService } from '../../shared/browser-storage.service';

interface CartItem {
  name?: string;
  price: number;
  quantity: number;
}

interface Order {
  fname: string;
  lname: string;
  email: string;
  address: string;
  phone: string;
  notes: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  public fname = '';
  public lname = '';
  public email = '';
  public address = '';
  public phone = '';
  public notes = '';
  public cart: CartItem[] = [];
  public subtotal = 0;
  public shippingFee = 50;
  public total = 0;
  public statusMessage = '';

  constructor() {}

  public ngOnInit(): void {
    // this.cart = this.storage.getJson<CartItem[]>('cart', []);
    this.calculateTotal();
  }

  public calculateTotal(): void {
    this.subtotal = this.cart.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );

    this.total = this.subtotal + this.shippingFee;
  }

  public placeOrder(): void {
    // const orders = this.storage.getJson<Order[]>('orders', []);
    const order: Order = {
      fname: this.fname.trim(),
      lname: this.lname.trim(),
      email: this.email.trim(),
      address: this.address.trim(),
      phone: this.phone.trim(),
      notes: this.notes.trim(),
      items: this.cart,
      subtotal: this.subtotal,
      shippingFee: this.shippingFee,
      total: this.total,
      createdAt: new Date().toISOString(),
    };

    // this.storage.setJson('orders', [...orders, order]);
    // this.storage.remove('cart');
    this.cart = [];
    this.calculateTotal();
    this.statusMessage = 'Order confirmed.';
  }
}
