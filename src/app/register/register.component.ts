import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { fido2Create, PublicKeyCredential } from '@ownid/webauthn';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
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

  register() {
    const username = this.username?.value;
    this.http.post(this.baseUrl + '/register/start', { username }).subscribe(async (publicKey: PublicKeyCredential) => {
      console.log("----> pubkey: ", JSON.stringify(publicKey));
      console.log("----> username: ", username);
      const data = await fido2Create(publicKey, username);
      console.log("----> data:", data);
      this.http.post<boolean>(this.baseUrl + '/register/finish', data).subscribe((data: boolean) => {
        if (data) {
          alert("Successfully created using webAuthn");
        }
      })
    });
  }
}
