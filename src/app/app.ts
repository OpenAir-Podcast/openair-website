import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private supabase: SupabaseService,
    private router: Router,
  ) {}

  ngOnInit() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (type !== 'recovery' || !accessToken) return;

    window.location.hash = '';
    this.supabase.client.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken || accessToken,
      })
      .then(({ error }) => {
        if (!error) {
          this.router.navigate(['/verify-recovery']);
        }
      });
  }
}
