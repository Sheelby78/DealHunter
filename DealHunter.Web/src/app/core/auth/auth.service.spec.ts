import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService, PIN_STORAGE_KEY } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should initialize with null pin when localStorage is empty', () => {
    expect(service.pin()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should login successfully and store pin in localStorage', async () => {
    const loginPromise = service.login('1234');
    
    const req = httpMock.expectOne('/api/rules');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('X-PIN')).toBe('1234');
    req.flush([], { status: 200, statusText: 'OK' });

    const result = await loginPromise;
    expect(result).toBe(true);
    expect(service.pin()).toBe('1234');
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem(PIN_STORAGE_KEY)).toBe('1234');
  });

  it('should return false on 401 error', async () => {
    const loginPromise = service.login('wrong');
    
    const req = httpMock.expectOne('/api/rules');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const result = await loginPromise;
    expect(result).toBe(false);
    expect(service.pin()).toBeNull();
  });

  it('should logout and clear pin and localStorage', () => {
    service.pin.set('1234');
    localStorage.setItem(PIN_STORAGE_KEY, '1234');

    service.logout();

    expect(service.pin()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(PIN_STORAGE_KEY)).toBeNull();
  });
});
