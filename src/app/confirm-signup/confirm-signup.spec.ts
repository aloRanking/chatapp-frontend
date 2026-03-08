import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSignup } from './confirm-signup';

describe('ConfirmSignup', () => {
  let component: ConfirmSignup;
  let fixture: ComponentFixture<ConfirmSignup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmSignup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmSignup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
