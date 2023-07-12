/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { MatSelectSearchComponent } from './mat-select-search.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySelectModule } from '@angular/material/legacy-select';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectSearchClearDirective } from './mat-select-search-clear.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectNoEntriesFoundDirective } from './mat-select-no-entries-found.directive';
import { MatDividerModule } from '@angular/material/divider';
import * as i0 from "@angular/core";
export const MatSelectSearchVersion = '6.0.5';
export { MatSelectSearchClearDirective };
export { MatSelectNoEntriesFoundDirective };
export class NgxMatSelectSearchModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, declarations: [MatSelectSearchComponent,
            MatSelectSearchClearDirective,
            MatSelectNoEntriesFoundDirective], imports: [CommonModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatCheckboxModule,
            MatIconModule,
            MatProgressSpinnerModule,
            MatTooltipModule,
            MatLegacySelectModule,
            MatDividerModule], exports: [MatSelectSearchComponent,
            MatSelectSearchClearDirective,
            MatSelectNoEntriesFoundDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, imports: [CommonModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatCheckboxModule,
            MatIconModule,
            MatProgressSpinnerModule,
            MatTooltipModule,
            MatLegacySelectModule,
            MatDividerModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        ReactiveFormsModule,
                        MatButtonModule,
                        MatCheckboxModule,
                        MatIconModule,
                        MatProgressSpinnerModule,
                        MatTooltipModule,
                        MatLegacySelectModule,
                        MatDividerModule,
                    ],
                    declarations: [
                        MatSelectSearchComponent,
                        MatSelectSearchClearDirective,
                        MatSelectNoEntriesFoundDirective
                    ],
                    exports: [
                        MatSelectSearchComponent,
                        MatSelectSearchClearDirective,
                        MatSelectNoEntriesFoundDirective
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LW1hdC1zZWxlY3Qtc2VhcmNoLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL3Rlc3QtY29tcG9uZW50L3NyYy9saWIvbmd4LW1hdC1zZWxlY3Qtc2VhcmNoLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDekUsT0FBTyxFQUFFLHFCQUFxQixJQUFJLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNGLE9BQU8sRUFBRSx1QkFBdUIsSUFBSSxpQkFBaUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2pHLE9BQU8sRUFBRSw4QkFBOEIsSUFBSSx3QkFBd0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3ZILE9BQU8sRUFBRSxzQkFBc0IsSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFdkQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDcEYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckQsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDM0YsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7O0FBRTdELE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQztBQUM5QyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsQ0FBQztBQXlCNUMsTUFBTSxPQUFPLHdCQUF3Qjs4R0FBeEIsd0JBQXdCOytHQUF4Qix3QkFBd0IsaUJBVmpDLHdCQUF3QjtZQUN4Qiw2QkFBNkI7WUFDN0IsZ0NBQWdDLGFBYmhDLFlBQVk7WUFDWixtQkFBbUI7WUFDbkIsZUFBZTtZQUNmLGlCQUFpQjtZQUNqQixhQUFhO1lBQ2Isd0JBQXdCO1lBQ3hCLGdCQUFnQjtZQUNoQixxQkFBcUI7WUFDckIsZ0JBQWdCLGFBUWhCLHdCQUF3QjtZQUN4Qiw2QkFBNkI7WUFDN0IsZ0NBQWdDOytHQUd2Qix3QkFBd0IsWUFyQmpDLFlBQVk7WUFDWixtQkFBbUI7WUFDbkIsZUFBZTtZQUNmLGlCQUFpQjtZQUNqQixhQUFhO1lBQ2Isd0JBQXdCO1lBQ3hCLGdCQUFnQjtZQUNoQixxQkFBcUI7WUFDckIsZ0JBQWdCOzsyRkFhUCx3QkFBd0I7a0JBdkJwQyxRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3dCQUNaLG1CQUFtQjt3QkFDbkIsZUFBZTt3QkFDZixpQkFBaUI7d0JBQ2pCLGFBQWE7d0JBQ2Isd0JBQXdCO3dCQUN4QixnQkFBZ0I7d0JBQ2hCLHFCQUFxQjt3QkFDckIsZ0JBQWdCO3FCQUNqQjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1osd0JBQXdCO3dCQUN4Qiw2QkFBNkI7d0JBQzdCLGdDQUFnQztxQkFDakM7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLHdCQUF3Qjt3QkFDeEIsNkJBQTZCO3dCQUM3QixnQ0FBZ0M7cUJBQ2pDO2lCQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBCaXRob3N0IEdtYkggQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCB9IGZyb20gJy4vbWF0LXNlbGVjdC1zZWFyY2guY29tcG9uZW50JztcclxuaW1wb3J0IHsgTWF0TGVnYWN5QnV0dG9uTW9kdWxlIGFzIE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2xlZ2FjeS1idXR0b24nO1xyXG5pbXBvcnQgeyBNYXRMZWdhY3lDaGVja2JveE1vZHVsZSBhcyBNYXRDaGVja2JveE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2xlZ2FjeS1jaGVja2JveCc7XHJcbmltcG9ydCB7IE1hdExlZ2FjeVByb2dyZXNzU3Bpbm5lck1vZHVsZSBhcyBNYXRQcm9ncmVzc1NwaW5uZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9sZWdhY3ktcHJvZ3Jlc3Mtc3Bpbm5lcic7XHJcbmltcG9ydCB7IE1hdExlZ2FjeVRvb2x0aXBNb2R1bGUgYXMgTWF0VG9vbHRpcE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2xlZ2FjeS10b29sdGlwJztcclxuaW1wb3J0IHsgTWF0TGVnYWN5U2VsZWN0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGVnYWN5LXNlbGVjdCc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcclxuXHJcbmltcG9ydCB7IE1hdFNlbGVjdFNlYXJjaENsZWFyRGlyZWN0aXZlIH0gZnJvbSAnLi9tYXQtc2VsZWN0LXNlYXJjaC1jbGVhci5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgeyBNYXRTZWxlY3ROb0VudHJpZXNGb3VuZERpcmVjdGl2ZSB9IGZyb20gJy4vbWF0LXNlbGVjdC1uby1lbnRyaWVzLWZvdW5kLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7IE1hdERpdmlkZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaXZpZGVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRTZWxlY3RTZWFyY2hWZXJzaW9uID0gJzYuMC41JztcclxuZXhwb3J0IHsgTWF0U2VsZWN0U2VhcmNoQ2xlYXJEaXJlY3RpdmUgfTtcclxuZXhwb3J0IHsgTWF0U2VsZWN0Tm9FbnRyaWVzRm91bmREaXJlY3RpdmUgfTtcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW1xyXG4gICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgUmVhY3RpdmVGb3Jtc01vZHVsZSxcclxuICAgIE1hdEJ1dHRvbk1vZHVsZSxcclxuICAgIE1hdENoZWNrYm94TW9kdWxlLFxyXG4gICAgTWF0SWNvbk1vZHVsZSxcclxuICAgIE1hdFByb2dyZXNzU3Bpbm5lck1vZHVsZSxcclxuICAgIE1hdFRvb2x0aXBNb2R1bGUsXHJcbiAgICBNYXRMZWdhY3lTZWxlY3RNb2R1bGUsXHJcbiAgICBNYXREaXZpZGVyTW9kdWxlLFxyXG4gIF0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQsXHJcbiAgICBNYXRTZWxlY3RTZWFyY2hDbGVhckRpcmVjdGl2ZSxcclxuICAgIE1hdFNlbGVjdE5vRW50cmllc0ZvdW5kRGlyZWN0aXZlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbXHJcbiAgICBNYXRTZWxlY3RTZWFyY2hDb21wb25lbnQsXHJcbiAgICBNYXRTZWxlY3RTZWFyY2hDbGVhckRpcmVjdGl2ZSxcclxuICAgIE1hdFNlbGVjdE5vRW50cmllc0ZvdW5kRGlyZWN0aXZlXHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4TWF0U2VsZWN0U2VhcmNoTW9kdWxlIHtcclxufVxyXG4iXX0=