import { TestBed } from '@angular/core/testing';

import { TomTomService } from './tom-tom.service';

describe('TomTomService', () => {
  let service: TomTomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TomTomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
