import { TestComponentComponent } from './test-component.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplitComponent } from './split.component';
import { SplitAreaDirective } from './split-area.directive';


@NgModule({
  declarations: [
    TestComponentComponent
  ],
  imports: [
  ],
  exports: [
    TestComponentComponent
  ]
})
export class TestComponentModule { }


@NgModule({
  imports: [BrowserModule],
  declarations: [SplitComponent, SplitAreaDirective],
  exports: [SplitComponent, SplitAreaDirective],
})
export class AngularSplitModule {
}
