import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { getDocs, query, updateDoc } from '@angular/fire/firestore';
import { where } from '@firebase/firestore';
import { FeedbackOverlayComponent } from '../feedback-overlay/feedback-overlay.component';
import { FooterComponent } from "../shared/footer/footer.component";

@Component({
  selector: 'app-password-reset-send-mail',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    FeedbackOverlayComponent,
    FooterComponent
],
  templateUrl: './password-reset-send-mail.component.html',
  styleUrl: './password-reset-send-mail.component.scss',
})
export class PasswordResetSendMailComponent {
  @ViewChild(FeedbackOverlayComponent)
  feedbackOverlay!: FeedbackOverlayComponent;
  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {}

  emailImg: string = '/mail-grey.png';

  emailText: string = '';

  isHovered: boolean = false;
  currentImage: string = '/check-field.png';

  isArrowHovered: boolean = false;
  backArrowImage: string = '/back-arrow.png';

  showError: boolean = false;
  sendMail: boolean = false;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  post = {
    endPoint: 'https://dabubble.alexander-hardtke.com/send-reset-link.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };

  /**
   * Navigates the user back to the login page.
   */
  backToLogin(): void {
    this.router.navigate(['']);
  }

  /**
   * Updates the icon color of an input field when it gains focus.
   * @param {string} field - The name of the input field.
   */
  onFocus(field: string): void {
    if (field === 'email' && !this.emailText) {
      this.emailImg = '/mail-black.png';
    }
  }

  /**
   * Updates the icon color of an input field when it loses focus.
   * @param {string} field - The name of the input field.
   */
  onBlur(field: string): void {
    if (field === 'email' && !this.emailText) {
      this.emailImg = '/mail-grey.png';
    }
  }

  /**
   * Updates the text and icon of an input field as the user types.
   * @param {string} field - The input field name.
   * @param {Event} event - The input event.
   */
  onInput(field: string, event: Event): void {
    let value = (event.target as HTMLInputElement).value;
    if (field === 'email') {
      this.emailText = value;
      this.emailImg = value ? '/mail-black.png' : '/mail-grey.png';
    }
    this.enableButton(this.isFormValid());
  }

  /**
   * Checks if the form is valid based on password length and match.
   * @returns True if the passwords are valid and match.
   */
  private isFormValid(): boolean {
    return this.regexp.test(this.emailText); // Überprüft die E-Mail-Adresse
  }

  /**
   * Toggles the hover state of the checkbox and updates its image.
   * @param {boolean} hoverState - The hover state of the checkbox.
   */
  onHover(hoverState: boolean): void {
    this.isHovered = hoverState;
  }

  /**
   * Toggles the hover state of the back arrow icon and updates its image.
   * @param {boolean} hoverState - The hover state of the back arrow icon.
   */
  onHoverArrow(hoverState: boolean): void {
    this.isArrowHovered = hoverState;
    this.updateArrowImage();
  }

  /**
   * Updates the back arrow icon image based on its hover state.
   */
  updateArrowImage(): void {
    this.backArrowImage = this.isArrowHovered
      ? '/back-arrow-hover.png'
      : '/back-arrow.png';
  }

  /**
   * Enables or disables the email submission button.
   * @param {boolean} isValid - Whether the email is valid.
   */
  enableButton(isValid: boolean | null | undefined): void {
    this.sendMail = !!isValid;
  }

  /**
   * Handles the form submission, generates a token, and updates the user in Firestore.
   */
  onSubmit(): void {
    if (this.sendMail && this.emailText) {
      let token = this.generateToken();
      this.sendEmailWithToken(this.emailText, token);
      this.updateUserWithToken(this.emailText, token);
      this.emailText = '';
      this.enableButton(false)
      this.showError = false;
      this.feedbackOverlay.showFeedback('E-Mail gesendet');
      setTimeout(() => {
        this.router.navigate(['']);
      }, 1500);
    }
  }

  /**
   * Generates a random 32-byte token as a hexadecimal string.
   * @returns {string} - The generated token.
   */
  private generateToken(): string {
    let randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Sends an email with the token to the specified address.
   * @param {string} email - The recipient's email address.
   * @param {string} token - The token to include in the email.
   */
  private sendEmailWithToken(email: string, token: string): void {
    let body = { email, token };
    this.http.post(this.post.endPoint, this.post.body(body)).subscribe({});
  }

  /**
   * Updates the user in Firestore by assigning a token to their account.
   * @param {string} email - The email address of the user.
   * @param {string} token - The token to assign to the user.
   */
  private async updateUserWithToken(
    email: string,
    token: string
  ): Promise<void> {
    try {
      let userRef = this.userService.getallUsersdocRef();
      let emailQuery = query(userRef, where('email', '==', email));
      let querySnapshot = await getDocs(emailQuery);
      if (querySnapshot.empty) {
        return;
      }
      querySnapshot.forEach(async (doc) => {
        let userDocRef = this.userService.getSingleUserDocRef('user', doc.id);
        await updateDoc(userDocRef, { token });
      });
    } catch (error) {
      console.error('Error updating user with token:', error);
    }
  }
}
