import { TestBed } from '@angular/core/testing';

import { TestComponentService } from './test-component.service';

describe('TestComponentService', () => {
  let service: TestComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
