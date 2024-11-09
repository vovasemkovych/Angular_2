import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  users: any[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Fetch all users from API and localStorage
  fetchUsers(): void {
    this.authService.getAllUsers().subscribe(
      (data: any[]) => {
        this.users = data;
      },
      (error) => {
        console.error("Error fetching users", error);
      }
    );
  }

  // Delete a user (only if admin)
  deleteUser(username: string): void {
    if (!this.authService.isAdmin) {
      alert('You are not authorized to delete users.');
      return;
    }

    this.authService.deleteUser(username);
    this.fetchUsers();  // Refresh user list after deletion
  }
}
