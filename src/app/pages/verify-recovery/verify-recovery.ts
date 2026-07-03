import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-verify-recovery',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-recovery.html',
  styleUrl: './verify-recovery.css',
})
export class VerifyRecovery implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);

  loading = false;
  error = '';
  message = '';
  sessionSet = false;
  passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.processHash(hash);
      return;
    }

    const queryToken = new URLSearchParams(window.location.search).get('token');
    const queryEmail = new URLSearchParams(window.location.search).get('email');
    if (queryToken && queryEmail) {
      this.processToken(queryToken, queryEmail);
      return;
    }

    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.sessionSet = true;
      } else {
        this.error = 'No recovery session found. Please request a new password reset link.';
      }
    });
  }

  private processHash(hash: string) {
    const params = new URLSearchParams(hash);
    const type = params.get('type');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (type !== 'recovery' || !accessToken) {
      this.error = 'Invalid recovery link.';
      return;
    }

    this.loading = true;
    this.supabase.client.auth
      .setSession({
        access_token: accessToken,
        refresh_token: refreshToken || accessToken,
      })
      .then(({ error }) => {
        this.loading = false;
        if (error) {
          this.error = 'Invalid or expired recovery link. Please request a new one.';
        } else {
          this.sessionSet = true;
          window.location.hash = '';
        }
      });
  }

  private async processToken(token: string, email: string) {
    this.loading = true;
    try {
      const { error } = await this.supabase.client.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      if (error) {
        this.error = error.message;
      } else {
        this.sessionSet = true;
        window.history.replaceState({}, '', '/verify-recovery');
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (this.passwordForm.invalid) return;

    const { password, confirmPassword } = this.passwordForm.getRawValue();
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error = '';

    const { error } = await this.supabase.client.auth.updateUser({ password });
    this.loading = false;

    if (error) {
      this.error = error.message;
    } else {
      this.message = 'Password updated successfully! You can now sign in with your new password.';
    }
  }
}
