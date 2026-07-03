import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  loading = false;
  error = '';
  message = '';
  sessionSet = false;
  private recoveryAccessToken = '';
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

    const queryParams = new URLSearchParams(window.location.search);
    const errorParam = queryParams.get('error');
    if (errorParam) {
      this.error = errorParam;
      return;
    }

    const queryToken = queryParams.get('token');
    const queryEmail = queryParams.get('email');
    if (queryToken && queryEmail) {
      this.processToken(queryToken, queryEmail);
      return;
    }

    const queryAccessToken = queryParams.get('access_token');
    const queryType = queryParams.get('type');
    if (queryType === 'recovery' && queryAccessToken) {
      this.setRecoverySession(
        queryAccessToken,
        queryParams.get('refresh_token') || queryAccessToken,
      );
      return;
    }

    this.loading = true;
    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
      this.loading = false;
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

    this.setRecoverySession(accessToken, refreshToken || accessToken);
  }

  private setRecoverySession(accessToken: string, refreshToken: string) {
    this.recoveryAccessToken = accessToken;
    this.sessionSet = true;
    this.loading = true;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), 10000),
    );
    Promise.race([
      this.supabase.client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }),
      timeout,
    ])
      .then(({ error }: any) => {
        this.loading = false;
        if (error) {
          this.sessionSet = false;
          this.error = 'Invalid or expired recovery link. Please request a new one.';
        } else {
          window.location.hash = '';
        }
      })
      .catch(() => {
        this.loading = false;
        this.sessionSet = false;
        this.error = 'Request timed out. Please try the recovery link again.';
      });
  }

  private async processToken(token: string, email: string) {
    this.loading = true;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Please check your connection and try again.')), 15000),
    );
    try {
      const { error } = (await Promise.race([
        this.supabase.client.auth.verifyOtp({ email, token, type: 'recovery' }),
        timeout,
      ])) as Awaited<ReturnType<typeof this.supabase.client.auth.verifyOtp>>;
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

    try {
      const response = await fetch(`${this.supabase.url}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.recoveryAccessToken}`,
          'apikey': this.supabase.key,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Supabase error response:', response.status, text);
        this.error = `Error ${response.status}: ${text}`;
      } else {
        this.message = 'Password updated successfully! You can now sign in with your new password.';
      }
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'An unexpected error occurred.';
    } finally {
      this.loading = false;
    }
  }
}
