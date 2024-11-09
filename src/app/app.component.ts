import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}

  toggleLogin() {
    if (this.authService.isLoggedIn) {
      this.authService.logout();
    } else {
      // Redirect to login page
      this.router.navigate(['/login']);
    }
  }
}
