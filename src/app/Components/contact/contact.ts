import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
// import { FooterComponent } from '../../shared/footer/footer';
// import { BrowserStorageService } from '../../shared/browser-storage.service';

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  service: string;
  message: string;
  createdAt: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  public name = '';
  public email = '';
  public subject = '';
  public service = '';
  public message = '';
  public statusMessage = '';

  constructor() {}

  public submitForm(): void {
    const messageData: ContactMessage = {
      name: this.name.trim(),
      email: this.email.trim(),
      subject: this.subject.trim(),
      service: this.service.trim(),
      message: this.message.trim(),
      createdAt: new Date().toISOString(),
    };

    // const messages = this.storage.getJson<ContactMessage[]>('messages', []);

    // this.storage.setJson('messages', [...messages, messageData]);

    this.name = '';
    this.email = '';
    this.subject = '';
    this.service = '';
    this.message = '';
    this.statusMessage = 'Message sent successfully.';
  }
}
