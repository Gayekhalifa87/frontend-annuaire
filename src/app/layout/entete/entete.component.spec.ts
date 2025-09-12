import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnteteComponent } from './entete.component';

describe('EnteteComponent', () => {
  let component: EnteteComponent;
  let fixture: ComponentFixture<EnteteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnteteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnteteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
