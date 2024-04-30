import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { fido2Get, PublicKeyCredential } from '@ownid/webauthn';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  baseUrl = environment.BACKEND_BASE_URL;

  form: FormGroup;
  constructor(private router: Router, private http: HttpClient, formBuilder: FormBuilder,) {
    this.form = formBuilder.group(
      {
        username: ['', [Validators.required]],
      },
      { updateOn: 'blur' },
    );
  }

  get username(): AbstractControl | null {
    return this.form.get('username');
  }

  login() {
    const username = this.username?.value;
    this.http.post(this.baseUrl + '/login/start', { username }).subscribe(async (publicKey: PublicKeyCredential) => {
      const data = await fido2Get(publicKey, username);
      this.http.post<boolean>(this.baseUrl + 'login/finish', data).subscribe((data: any) => {
        if (data.res) {
          alert("Successfully authenticated using webAuthn");
        }
      });
    });
  }
}
