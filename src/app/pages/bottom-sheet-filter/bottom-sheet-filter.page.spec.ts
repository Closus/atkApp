import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomSheetFilterPage } from './bottom-sheet-filter.page';

describe('BottomSheetFilterPage', () => {
  let component: BottomSheetFilterPage;
  let fixture: ComponentFixture<BottomSheetFilterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BottomSheetFilterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
