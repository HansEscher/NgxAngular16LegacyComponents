import { TestComponentComponent } from './test-component.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplitComponent } from './split.component';
import { SplitAreaDirective } from './split-area.directive';
import * as i0 from "@angular/core";
export class TestComponentModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.4", ngImport: i0, type: TestComponentModule, declarations: [TestComponentComponent], exports: [TestComponentComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        TestComponentComponent
                    ],
                    imports: [],
                    exports: [
                        TestComponentComponent
                    ]
                }]
        }] });
export class AngularSplitModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: AngularSplitModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.4", ngImport: i0, type: AngularSplitModule, declarations: [SplitComponent, SplitAreaDirective], imports: [BrowserModule], exports: [SplitComponent, SplitAreaDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: AngularSplitModule, imports: [BrowserModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: AngularSplitModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [BrowserModule],
                    declarations: [SplitComponent, SplitAreaDirective],
                    exports: [SplitComponent, SplitAreaDirective],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1jb21wb25lbnQubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdGVzdC1jb21wb25lbnQvc3JjL2xpYi90ZXN0LWNvbXBvbmVudC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDOztBQWE1RCxNQUFNLE9BQU8sbUJBQW1COzhHQUFuQixtQkFBbUI7K0dBQW5CLG1CQUFtQixpQkFSNUIsc0JBQXNCLGFBS3RCLHNCQUFzQjsrR0FHYixtQkFBbUI7OzJGQUFuQixtQkFBbUI7a0JBVi9CLFFBQVE7bUJBQUM7b0JBQ1IsWUFBWSxFQUFFO3dCQUNaLHNCQUFzQjtxQkFDdkI7b0JBQ0QsT0FBTyxFQUFFLEVBQ1I7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLHNCQUFzQjtxQkFDdkI7aUJBQ0Y7O0FBU0QsTUFBTSxPQUFPLGtCQUFrQjs4R0FBbEIsa0JBQWtCOytHQUFsQixrQkFBa0IsaUJBSGQsY0FBYyxFQUFFLGtCQUFrQixhQUR2QyxhQUFhLGFBRWIsY0FBYyxFQUFFLGtCQUFrQjsrR0FFakMsa0JBQWtCLFlBSm5CLGFBQWE7OzJGQUlaLGtCQUFrQjtrQkFMOUIsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQ3hCLFlBQVksRUFBRSxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQztvQkFDbEQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDO2lCQUM5QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRlc3RDb21wb25lbnRDb21wb25lbnQgfSBmcm9tICcuL3Rlc3QtY29tcG9uZW50LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJyb3dzZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcclxuaW1wb3J0IHsgU3BsaXRDb21wb25lbnQgfSBmcm9tICcuL3NwbGl0LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFNwbGl0QXJlYURpcmVjdGl2ZSB9IGZyb20gJy4vc3BsaXQtYXJlYS5kaXJlY3RpdmUnO1xyXG5cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBUZXN0Q29tcG9uZW50Q29tcG9uZW50XHJcbiAgXSxcclxuICBpbXBvcnRzOiBbXHJcbiAgXSxcclxuICBleHBvcnRzOiBbXHJcbiAgICBUZXN0Q29tcG9uZW50Q29tcG9uZW50XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVGVzdENvbXBvbmVudE1vZHVsZSB7IH1cclxuXHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXSxcclxuICBkZWNsYXJhdGlvbnM6IFtTcGxpdENvbXBvbmVudCwgU3BsaXRBcmVhRGlyZWN0aXZlXSxcclxuICBleHBvcnRzOiBbU3BsaXRDb21wb25lbnQsIFNwbGl0QXJlYURpcmVjdGl2ZV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbmd1bGFyU3BsaXRNb2R1bGUge1xyXG59XHJcbiJdfQ==