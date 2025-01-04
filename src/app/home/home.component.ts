import { Component } from '@angular/core';
import { NavigationComponent } from "./navigation/navigation.component";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./footer/footer.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavigationComponent, RouterOutlet, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
