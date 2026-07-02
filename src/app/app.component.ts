import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService, GoogleAuthUser } from './services/auth.service';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}

interface GoogleIdApi {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(element: HTMLElement, options: GoogleButtonConfig): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi;
      };
    };
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'my-angular';
  readonly googleClientId = environment.googleClientId;
  user: GoogleAuthUser | null = null;
  signInMessage = '';
  signInError = '';
  googleReady = false;
  private googleInitAttempts = 0;

  @ViewChild('googleButton', { static: false })
  googleButton?: ElementRef<HTMLDivElement>;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.canonicalizeDevOrigin();
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  signOut(): void {
    this.authService.clearToken();
    this.user = null;
    this.signInMessage = 'Signed out';
    this.signInError = '';
    window.google?.accounts.id.disableAutoSelect();
  }

  private renderGoogleButton(): void {
    const google = window.google?.accounts?.id;
    const button = this.googleButton?.nativeElement;

    if (!google || !button) {
      if (this.googleInitAttempts < 10) {
        this.googleInitAttempts += 1;
        window.setTimeout(() => this.renderGoogleButton(), 250);
        return;
      }

      this.signInError = 'Google sign-in script is not loaded';
      return;
    }

    google.initialize({
      client_id: this.googleClientId,
      callback: (response) => this.handleGoogleCredential(response),
    });

    button.innerHTML = '';
    google.renderButton(button, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 220,
    });
    this.googleReady = true;
  }

  private canonicalizeDevOrigin(): void {
    const hostname = window.location.hostname;
    if (hostname !== '127.0.0.1' && hostname !== '::1') {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.hostname = 'localhost';
    window.location.replace(nextUrl.toString());
  }

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response.credential) {
      this.signInError = 'Google sign-in did not return a credential';
      return;
    }

    this.signInError = '';
    this.signInMessage = 'Signing in...';

    this.authService.loginWithGoogleCredential(response.credential).subscribe({
      next: ({ user }) => {
        this.user = user;
        this.signInMessage = `Signed in as ${user.name || user.email || 'Google user'}`;
      },
      error: (err) => {
        console.error('Google sign-in failed:', err);
        this.signInError = 'Google sign-in failed';
        this.signInMessage = '';
      },
    });
  }
}
