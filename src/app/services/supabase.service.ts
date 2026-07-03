import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cicwndrzbcxciavwgjzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY3duZHJ6YmN4Y2lhdndnanpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjc2NzIsImV4cCI6MjA3MjcwMzY3Mn0.8W1G4ybz8BGjMG2kwm_XexcLSTNx1vRWLTTNjrAdWkg';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private _client: SupabaseClient;
  readonly url = supabaseUrl;
  readonly key = supabaseKey;

  constructor() {
    this._client = createClient(supabaseUrl, supabaseKey);
  }

  get client(): SupabaseClient {
    return this._client;
  }
}
