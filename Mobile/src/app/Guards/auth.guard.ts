import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private jwtHelper: JwtHelperService, private router: Router, private http: HttpClient) {
  }
  
  canActivate() {
    const token = localStorage.getItem("token");

    if (token && !this.jwtHelper.isTokenExpired(token)){
      return true;
    }
    
    this.router.navigate(["login"]);
    return false;
  }
}
