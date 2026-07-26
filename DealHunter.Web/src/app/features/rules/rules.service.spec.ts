import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RulesService } from './rules.service';
import { AuthService } from '../../core/auth/auth.service';
import { RuleItem } from '../../shared/models/rule.model';

describe('RulesService', () => {
  let service: RulesService;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(RulesService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
    localStorage.clear();
  });

  it('should create rule and update signal', async () => {
    authService.pin.set('1234');
    const mockRule: RuleItem = {
      id: '1',
      url: 'https://olx.pl/test',
      maxPrice: 500,
      createdAt: '2026-07-26'
    };

    const createPromise = service.createRule('https://olx.pl/test', 500);
    const req = httpMock.expectOne('/api/rules');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url: 'https://olx.pl/test', maxPrice: 500 });
    req.flush(mockRule);

    const result = await createPromise;
    expect(result).toEqual(mockRule);
    expect(service.rules()).toContainEqual(mockRule);
  });

  it('should perform optimistic deletion', async () => {
    const mockRule: RuleItem = {
      id: '100',
      url: 'https://olx.pl/test',
      maxPrice: null,
      createdAt: '2026-07-26'
    };
    service.rules.set([mockRule]);

    const deletePromise = service.deleteRule('100');
    expect(service.rules()).toEqual([]); // Immediately removed from signal

    const req = httpMock.expectOne('/api/rules/100');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await deletePromise;
    expect(service.rules()).toEqual([]);
  });
});
