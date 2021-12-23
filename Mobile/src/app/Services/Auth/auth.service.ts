import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userInfo = new BehaviorSubject(null);
  jwtHelper = new JwtHelperService();
  checkUserObs: Observable<any>;
  token: any = null;
  constructor(
    private readonly platform: Platform,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.token = localStorage.getItem("token")
  }
  
  storage: any;

  useLogin(login: any): Observable<boolean> {
    if (login && login.email && login.password) {
      var payload = {
        email: login.email,
        password: login.password,
      };
      return this.http.post(`${environment.apiUrl}/auth/login`, payload).pipe(
        map((response: any) => {
          this.storage.set('token', response.token);
          var decodedUser = this.jwtHelper.decodeToken(response.token);
          this.storage.set(
            'username',
            decodedUser[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
            ]
          );
          this.storage.set(
            'email',
            decodedUser[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ]
          );
          return true;
        })
      );
    }

    return of(false);
  }

  validateToken(): Observable<boolean> {
    const token = this.token;
    if (token == null) of(false);
    this.http
      .post(`${environment.apiUrl}/auth/verify`, {}, {                                                                                                                                                                                 
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Control-Allow-Headers": "Content-Type",
          "Authorization": `Bearer ${token}`,
        }, 
      })
      .subscribe({
        next: (response: any) => {
        this.token = response.token;
        localStorage.setItem("token", this.token)
        return true;
      },
      error: (err) => {
        /*this.invalidLogin = true;
        this.errors = err.error*/
        return of(false);
      }});
      return of(false)
  }

  useRegister(register: any): Observable<boolean> {
    if (register && register.email && register.name && register.password) {
      var payload = {
        email: register.email,
        name: register.name,
        password: register.password,
      };
      return this.http
        .post(`${environment.apiUrl}/auth/register`, payload)
        .pipe(
          map((response: any) => {
            alert(response.token);
            this.storage.set('token', response.token);
            var decodedUser = this.jwtHelper.decodeToken(response.token);
            this.userInfo.next(decodedUser);
            alert(decodedUser);
            return true;
          })
        );
    }

    return of(false);
  }

  // code hidden for display purpose
}
