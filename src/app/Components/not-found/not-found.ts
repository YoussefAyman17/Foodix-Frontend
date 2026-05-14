import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, Navbar, Footer],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
