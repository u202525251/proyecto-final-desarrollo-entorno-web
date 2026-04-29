import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  user: any = null;

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    this.user = this.sessionService.getUser();
  }
}