/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { A, DOWN_ARROW, END, ENTER, ESCAPE, HOME, NINE, SPACE, UP_ARROW, Z, ZERO } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, EventEmitter, forwardRef, Inject, Input, Optional, Output, ViewChild, Host, SkipSelf } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyFormField as MatFormField } from '@angular/material/legacy-form-field';
import { MatLegacySelect } from '@angular/material/legacy-select';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { delay, filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatSelectSearchClearDirective } from './mat-select-search-clear.directive';
import { configurableDefaultOptions, MAT_SELECTSEARCH_DEFAULT_OPTIONS } from './default-options';
import { MatSelectNoEntriesFoundDirective } from './mat-select-no-entries-found.directive';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/legacy-core";
import * as i2 from "@angular/cdk/scrolling";
import * as i3 from "@angular/common";
import * as i4 from "@angular/forms";
import * as i5 from "@angular/material/legacy-button";
import * as i6 from "@angular/material/legacy-checkbox";
import * as i7 from "@angular/material/icon";
import * as i8 from "@angular/material/legacy-progress-spinner";
import * as i9 from "@angular/material/legacy-tooltip";
import * as i10 from "@angular/material/divider";
import * as i11 from "@angular/material/legacy-select";
import * as i12 from "@angular/material/legacy-form-field";
/* tslint:disable:member-ordering component-selector */
/**
 * Component providing an input field for searching MatLegacySelect options.
 *
 * Example usage:
 *
 * interface Bank {
 *  id: string;
 *  name: string;
 * }
 *
 * @Component({
 *   selector: 'my-app-data-selection',
 *   template: `
 *     <mat-form-field>
 *       <mat-select [formControl]="bankCtrl" placeholder="Bank">
 *         <mat-option>
 *           <ngx-mat-select-search [formControl]="bankFilterCtrl"></ngx-mat-select-search>
 *         </mat-option>
 *         <mat-option *ngFor="let bank of filteredBanks | async" [value]="bank.id">
 *           {{bank.name}}
 *         </mat-option>
 *       </mat-select>
 *     </mat-form-field>
 *   `
 * })
 * export class DataSelectionComponent implements OnInit, OnDestroy {
 *
 *   // control for the selected bank
 *   public bankCtrl: FormControl = new FormControl();
 *   // control for the MatLegacySelect filter keyword
 *   public bankFilterCtrl: FormControl = new FormControl();
 *
 *   // list of banks
 *   private banks: Bank[] = [{name: 'Bank A', id: 'A'}, {name: 'Bank B', id: 'B'}, {name: 'Bank C', id: 'C'}];
 *   // list of banks filtered by search keyword
 *   public filteredBanks: ReplaySubject<Bank[]> = new ReplaySubject<Bank[]>(1);
 *
 *   // Subject that emits when the component has been destroyed.
 *   private _onDestroy = new Subject<void>();
 *
 *
 *   ngOnInit() {
 *     // load the initial bank list
 *     this.filteredBanks.next(this.banks.slice());
 *     // listen for search field value changes
 *     this.bankFilterCtrl.valueChanges
 *       .pipe(takeUntil(this._onDestroy))
 *       .subscribe(() => {
 *         this.filterBanks();
 *       });
 *   }
 *
 *   ngOnDestroy() {
 *     this._onDestroy.next();
 *     this._onDestroy.complete();
 *   }
 *
 *   private filterBanks() {
 *     if (!this.banks) {
 *       return;
 *     }
 *
 *     // get the search keyword
 *     let search = this.bankFilterCtrl.value;
 *     if (!search) {
 *       this.filteredBanks.next(this.banks.slice());
 *       return;
 *     } else {
 *       search = search.toLowerCase();
 *     }
 *
 *     // filter the banks
 *     this.filteredBanks.next(
 *       this.banks.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
 *     );
 *   }
 * }
 */
export class MatSelectSearchComponent {
    /** Current search value */
    get value() {
        return this._formControl.value;
    }
    /** Reference to the MatLegacySelect options */
    set _options(_options) {
        this._options$.next(_options);
    }
    get _options() {
        return this._options$.getValue();
    }
    // private hostElement: Element,
    constructor(matSelect, matOption, changeDetectorRef, _viewportRuler, matFormField = null, defaultOptions) {
        this.matSelect = matSelect;
        this.matOption = matOption;
        this.changeDetectorRef = changeDetectorRef;
        this._viewportRuler = _viewportRuler;
        this.matFormField = matFormField;
        /** Label of the search placeholder */
        this.placeholderLabel = 'Suche';
        /** Type of the search input field */
        this.type = 'text';
        /** Font-based icon used for displaying Close-Icon */
        this.closeIcon = 'close';
        /** Label to be shown when no entries are found. Set to null if no message should be shown. */
        this.noEntriesFoundLabel = 'Keine Optionen gefunden';
        /**
          * Whether or not the search field should be cleared after the dropdown menu is closed.
          * Useful for server-side filtering. See [#3](https://github.com/bithost-gmbh/ngx-mat-select-search/issues/3)
          */
        this.clearSearchInput = true;
        /** Whether to show the search-in-progress indicator */
        this.searching = false;
        /** Disables initial focusing of the input field */
        this.disableInitialFocus = false;
        /** Enable clear input on escape pressed */
        this.enableClearOnEscapePressed = false;
        /**
         * Prevents home / end key being propagated to mat-select,
         * allowing to move the cursor within the search input instead of navigating the options
         */
        this.preventHomeEndKeyPropagation = false;
        /** Disables scrolling to active options when option list changes. Useful for server-side search */
        this.disableScrollToActiveOnOptionsChanged = false;
        /** Adds 508 screen reader support for search box */
        this.ariaLabel = 'dropdown search';
        /** Whether to show Select All Checkbox (for mat-select[multi=true]) */
        this.showToggleAllCheckbox = false;
        /** select all checkbox checked state */
        this.toggleAllCheckboxChecked = false;
        /** select all checkbox indeterminate state */
        this.toggleAllCheckboxIndeterminate = false;
        /** Display a message in a tooltip on the toggle-all checkbox */
        this.toggleAllCheckboxTooltipMessage = '';
        /** Define the position of the tooltip on the toggle-all checkbox. */
        this.toggleAllCheckboxTooltipPosition = 'below';
        /** Show/Hide the search clear button of the search input */
        this.hideClearSearchButton = false;
        /**
         * Always restore selected options on selectionChange for mode multi (e.g. for lazy loading/infinity scrolling).
         * Defaults to false, so selected options are only restored while filtering is active.
         */
        this.alwaysRestoreSelectedOptionsMulti = false;
        /** Output emitter to send to parent component with the toggle all boolean */
        this.toggleAll = new EventEmitter();
        // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-empty-function
        this.onTouched = (_) => { };
        this._options$ = new BehaviorSubject(null);
        this.optionsList$ = this._options$.pipe(switchMap(_options => _options ?
            _options.changes.pipe(map(options => options.toArray()), startWith(_options.toArray())) : of([])));
        this.optionsLength$ = this.optionsList$.pipe(map(options => options ? options.length : 0));
        this._formControl = new FormControl('', { nonNullable: true });
        /** whether to show the no entries found message */
        this._showNoEntriesFound$ = combineLatest([
            this._formControl.valueChanges,
            this.optionsLength$
        ]).pipe(map(([value, optionsLength]) => {
            const result = (!!this.noEntriesFoundLabel) && (!!value) && optionsLength === this.getOptionsLengthOffset();
            return result;
        }));
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        this.applyDefaultOptions(defaultOptions);
    }
    applyDefaultOptions(defaultOptions) {
        if (!defaultOptions) {
            return;
        }
        for (const key of configurableDefaultOptions) {
            // eslint-disable-next-line no-prototype-builtins
            if (defaultOptions.hasOwnProperty(key)) {
                this[key] = defaultOptions[key];
            }
        }
    }
    ngOnInit() {
        // set custom mat-option class if the component was placed inside a mat-option
        if (this.matOption) {
            this.matOption.disabled = true;
            this.matOption._getHostElement().classList.add('contains-mat-select-search');
            this.matOption._getHostElement().setAttribute('aria-hidden', 'true');
        }
        else {
            console.error('<ngx-mat-select-search> must be placed inside a <mat-option> element');
        }
        // when the select dropdown panel is opened or closed
        this.matSelect.openedChange
            .pipe(delay(1), takeUntil(this._onDestroy))
            .subscribe((opened) => {
            if (opened) {
                this.updateInputWidth();
                // focus the search field when opening
                if (!this.disableInitialFocus) {
                    this._focus();
                }
            }
            else {
                // clear it when closing
                if (this.clearSearchInput) {
                    this._reset();
                }
            }
        });
        // set the first item active after the options changed
        this.matSelect.openedChange
            .pipe(take(1), switchMap((_) => {
            this._options = this.matSelect.options;
            // Closure variable for tracking the most recent first option.
            // In order to avoid avoid causing the list to
            // scroll to the top when options are added to the bottom of
            // the list (eg: infinite scroll), we compare only
            // the changes to the first options to determine if we
            // should set the first item as active.
            // This prevents unnecessary scrolling to the top of the list
            // when options are appended, but allows the first item
            // in the list to be set as active by default when there
            // is no active selection
            let previousFirstOption = this._options.toArray()[this.getOptionsLengthOffset()];
            return this._options.changes
                .pipe(tap(() => {
                // avoid "expression has been changed" error
                setTimeout(() => {
                    // Convert the QueryList to an array
                    const options = this._options?.toArray() ?? [];
                    // The true first item is offset by 1
                    const currentFirstOption = options[this.getOptionsLengthOffset()];
                    const keyManager = this.matSelect._keyManager;
                    if (keyManager && this.matSelect.panelOpen) {
                        // set first item active and input width
                        // Check to see if the first option in these changes is different from the previous.
                        const firstOptionIsChanged = !this.matSelect.compareWith(previousFirstOption, currentFirstOption);
                        // CASE: The first option is different now.
                        // Indiciates we should set it as active and scroll to the top.
                        if (firstOptionIsChanged
                            || !keyManager.activeItem
                            || !options.find(option => this.matSelect.compareWith(option, keyManager.activeItem))) {
                            keyManager.setFirstItemActive();
                        }
                        // wait for panel width changes
                        setTimeout(() => {
                            this.updateInputWidth();
                        });
                    }
                    // Update our reference
                    previousFirstOption = currentFirstOption;
                });
            }));
        }))
            .pipe(takeUntil(this._onDestroy))
            .subscribe();
        // add or remove css class depending on whether to show the no entries found message
        // note: this is hacky
        this._showNoEntriesFound$.pipe(takeUntil(this._onDestroy)).subscribe(showNoEntriesFound => {
            // set no entries found class on mat option
            if (this.matOption) {
                if (showNoEntriesFound) {
                    this.matOption._getHostElement().classList.add('mat-select-search-no-entries-found');
                }
                else {
                    this.matOption._getHostElement().classList.remove('mat-select-search-no-entries-found');
                }
            }
        });
        // resize the input width when the viewport is resized, i.e. the trigger width could potentially be resized
        this._viewportRuler.change()
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
            if (this.matSelect.panelOpen) {
                this.updateInputWidth();
            }
        });
        this.initMultipleHandling();
        this.optionsList$.pipe(takeUntil(this._onDestroy)).subscribe(() => {
            // update view when available options change
            this.changeDetectorRef.markForCheck();
        });
    }
    _emitSelectAllBooleanToParent(state) {
        this.toggleAll.emit(state);
    }
    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }
    _isToggleAllCheckboxVisible() {
        return (this.matSelect?.multiple) && this.showToggleAllCheckbox;
    }
    /**
     * Handles the key down event with MatLegacySelect.
     * Allows e.g. selecting with enter key, navigation with arrow keys, etc.
     * @param event
     */
    _handleKeydown(event) {
        // Prevent propagation for all alphanumeric characters in order to avoid selection issues
        if ((event.key && event.key.length === 1) ||
            (event.keyCode >= A && event.keyCode <= Z) ||
            (event.keyCode >= ZERO && event.keyCode <= NINE) ||
            (event.keyCode === SPACE)
            || (this.preventHomeEndKeyPropagation && (event.keyCode === HOME || event.keyCode === END))) {
            event.stopPropagation();
        }
        if ((this.matSelect?.multiple) && event.key && event.keyCode === ENTER) {
            // Regain focus after multiselect, so we can further type
            setTimeout(() => this._focus());
        }
        // Special case if click Escape, if input is empty, close the dropdown, if not, empty out the search field
        if (this.enableClearOnEscapePressed === true && event.keyCode === ESCAPE && this.value) {
            this._reset(true);
            event.stopPropagation();
        }
    }
    /**
     * Handles the key up event with MatLegacySelect.
     * Allows e.g. the announcing of the currently activeDescendant by screen readers.
     */
    _handleKeyup(event) {
        if (event.keyCode === UP_ARROW || event.keyCode === DOWN_ARROW) {
            const ariaActiveDescendantId = this.matSelect._getAriaActiveDescendant();
            const optionArray = this._options?.toArray() ?? [];
            const index = optionArray.findIndex(item => item && item['id'] && item['id'] === ariaActiveDescendantId);
            if (index !== -1) {
                this.unselectActiveDescendant();
                this.activeDescendant = optionArray[index]._getHostElement();
                this.activeDescendant.setAttribute('aria-selected', 'true');
                this.searchSelectInput.nativeElement.setAttribute('aria-activedescendant', ariaActiveDescendantId);
            }
        }
    }
    writeValue(value) {
        this._lastExternalInputValue = value;
        this._formControl.setValue(value);
        this.changeDetectorRef.markForCheck();
    }
    onBlur() {
        this.unselectActiveDescendant();
        this.onTouched();
    }
    registerOnChange(fn) {
        this._formControl.valueChanges.pipe(filter(value => value !== this._lastExternalInputValue), tap(() => this._lastExternalInputValue = undefined), takeUntil(this._onDestroy)).subscribe(fn);
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    /**
     * Focuses the search input field
     */
    _focus() {
        if (!this.searchSelectInput || !this.matSelect.panel) {
            return;
        }
        // save and restore scrollTop of panel, since it will be reset by focus()
        // note: this is hacky
        const panel = this.matSelect.panel.nativeElement;
        const scrollTop = panel.scrollTop;
        // focus
        this.searchSelectInput.nativeElement.focus();
        panel.scrollTop = scrollTop;
    }
    /**
     * Resets the current search value
     * @param focus whether to focus after resetting
     */
    _reset(focus) {
        this._formControl.setValue('');
        if (focus) {
            this._focus();
        }
    }
    /**
     * Initializes handling <mat-select [multiple]="true">
     * Note: to improve this code, mat-select should be extended to allow disabling resetting the selection while filtering.
     */
    initMultipleHandling() {
        if (this.matSelect.ngControl === null) {
            if (this.matSelect?.multiple) {
                // note: the access to MatLegacySelect.ngControl (instead of MatLegacySelect.value / MatLegacySelect.valueChanges)
                // is necessary to properly work in multi-selection mode.
                console.error('the mat-select containing ngx-mat-select-search must have a ngModel or formControl directive when multiple=true');
            }
            return;
        }
        const valueChanges = this.matSelect.ngControl.valueChanges;
        if (valueChanges === null)
            return;
        // if <mat-select [multiple]="true">
        // store previously selected values and restore them when they are deselected
        // because the option is not available while we are currently filtering
        this.previousSelectedValues = this.matSelect.ngControl.value;
        valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((values) => {
            let restoreSelectedValues = false;
            if (this.matSelect?.multiple) {
                if ((this.alwaysRestoreSelectedOptionsMulti || (this._formControl.value && this._formControl.value.length))
                    && this.previousSelectedValues && Array.isArray(this.previousSelectedValues)) {
                    if (!values || !Array.isArray(values)) {
                        values = [];
                    }
                    const optionValues = this.matSelect.options.map(option => option.value);
                    this.previousSelectedValues.forEach(previousValue => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (!values.some((v) => this.matSelect.compareWith(v, previousValue))
                            && !optionValues.some(v => this.matSelect.compareWith(v, previousValue))) {
                            // if a value that was selected before is deselected and not found in the options, it was deselected
                            // due to the filtering, so we restore it.
                            values.push(previousValue);
                            restoreSelectedValues = true;
                        }
                    });
                }
            }
            this.previousSelectedValues = values;
            if (restoreSelectedValues) {
                this.matSelect._onChange(values);
            }
        });
    }
    /**
     *  Set the width of the innerSelectSearch to fit even custom scrollbars
     *  And support all Operation Systems
     */
    updateInputWidth() {
        if (!this.innerSelectSearch || !this.innerSelectSearch.nativeElement) {
            return;
        }
        let element = this.innerSelectSearch.nativeElement;
        let panelElement;
        while ((element = element?.parentElement ?? null) !== null) {
            if (element.classList.contains('mat-select-panel')) {
                panelElement = element;
                break;
            }
        }
        if (panelElement) {
            this.innerSelectSearch.nativeElement.style.width = panelElement.clientWidth + 'px';
        }
    }
    /**
     * Determine the offset to length that can be caused by the optional MatLegacyOption used as a search input.
     */
    getOptionsLengthOffset() {
        if (this.matOption) {
            return 1;
        }
        else {
            return 0;
        }
    }
    unselectActiveDescendant() {
        this.activeDescendant?.removeAttribute('aria-selected');
        this.searchSelectInput.nativeElement.removeAttribute('aria-activedescendant');
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectSearchComponent, deps: [{ token: MatLegacySelect }, { token: i1.MatLegacyOption, host: true, optional: true, skipSelf: true }, { token: i0.ChangeDetectorRef }, { token: i2.ViewportRuler }, { token: MatFormField, optional: true }, { token: MAT_SELECTSEARCH_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.4", type: MatSelectSearchComponent, selector: "ngx-mat-select-search", inputs: { placeholderLabel: "placeholderLabel", type: "type", closeIcon: "closeIcon", closeSvgIcon: "closeSvgIcon", noEntriesFoundLabel: "noEntriesFoundLabel", clearSearchInput: "clearSearchInput", searching: "searching", disableInitialFocus: "disableInitialFocus", enableClearOnEscapePressed: "enableClearOnEscapePressed", preventHomeEndKeyPropagation: "preventHomeEndKeyPropagation", disableScrollToActiveOnOptionsChanged: "disableScrollToActiveOnOptionsChanged", ariaLabel: "ariaLabel", showToggleAllCheckbox: "showToggleAllCheckbox", toggleAllCheckboxChecked: "toggleAllCheckboxChecked", toggleAllCheckboxIndeterminate: "toggleAllCheckboxIndeterminate", toggleAllCheckboxTooltipMessage: "toggleAllCheckboxTooltipMessage", toggleAllCheckboxTooltipPosition: "toggleAllCheckboxTooltipPosition", hideClearSearchButton: "hideClearSearchButton", alwaysRestoreSelectedOptionsMulti: "alwaysRestoreSelectedOptionsMulti" }, outputs: { toggleAll: "toggleAll" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => MatSelectSearchComponent),
                multi: true
            }
        ], queries: [{ propertyName: "clearIcon", first: true, predicate: MatSelectSearchClearDirective, descendants: true }, { propertyName: "noEntriesFound", first: true, predicate: MatSelectNoEntriesFoundDirective, descendants: true }], viewQueries: [{ propertyName: "searchSelectInput", first: true, predicate: ["searchSelectInput"], descendants: true, read: ElementRef, static: true }, { propertyName: "innerSelectSearch", first: true, predicate: ["innerSelectSearch"], descendants: true, read: ElementRef, static: true }], ngImport: i0, template: "<!--\r\nCopyright (c) 2018 Bithost GmbH All Rights Reserved.\r\n\r\nUse of this source code is governed by an MIT-style license that can be\r\nfound in the LICENSE file at https://angular.io/license\r\n-->\r\n<!-- Placeholder to adjust vertical offset of the mat-option elements -->\r\n<input matInput class=\"mat-select-search-input mat-select-search-hidden\"/>\r\n\r\n<!-- Note: the  mat-datepicker-content mat-tab-header are needed to inherit the material theme colors, see PR #22 -->\r\n<div\r\n      #innerSelectSearch\r\n      class=\"mat-select-search-inner mat-typography mat-datepicker-content mat-tab-header\"\r\n      [ngClass]=\"{'mat-select-search-inner-multiple': matSelect.multiple, 'mat-select-search-inner-toggle-all': _isToggleAllCheckboxVisible() }\">\r\n\r\n  <mat-checkbox *ngIf=\"_isToggleAllCheckboxVisible()\"\r\n                [color]=\"matFormField?.color\"\r\n                class=\"mat-select-search-toggle-all-checkbox\"\r\n                [checked]=\"toggleAllCheckboxChecked\"\r\n                [indeterminate]=\"toggleAllCheckboxIndeterminate\"\r\n                [matTooltip]=\"toggleAllCheckboxTooltipMessage\"\r\n                matTooltipClass=\"ngx-mat-select-search-toggle-all-tooltip\"\r\n                [matTooltipPosition]=\"toggleAllCheckboxTooltipPosition\"\r\n                (change)=\"_emitSelectAllBooleanToParent($event.checked)\"\r\n  ></mat-checkbox>\r\n\r\n  <input class=\"mat-select-search-input\"\r\n         autocomplete=\"off\"\r\n         [type]=\"type\"\r\n         [formControl]=\"_formControl\"\r\n         #searchSelectInput\r\n         (keydown)=\"_handleKeydown($event)\"\r\n         (keyup)=\"_handleKeyup($event)\"\r\n         (blur)=\"onBlur()\"\r\n         [placeholder]=\"placeholderLabel\"\r\n         [attr.aria-label]=\"ariaLabel\"\r\n  />\r\n  <mat-spinner *ngIf=\"searching\"\r\n          class=\"mat-select-search-spinner\"\r\n          diameter=\"16\"></mat-spinner>\r\n\r\n  <button *ngIf=\"!hideClearSearchButton && value && !searching\"\r\n          mat-icon-button\r\n          aria-label=\"Clear\"\r\n          (click)=\"_reset(true)\"\r\n          class=\"mat-select-search-clear\">\r\n    <ng-content *ngIf=\"clearIcon; else defaultIcon\" select=\"[ngxMatSelectSearchClear]\"></ng-content>\r\n    <ng-template #defaultIcon>\r\n      <mat-icon [svgIcon]=\"closeSvgIcon ?? ''\">\r\n        {{!closeSvgIcon ? closeIcon : null}}\r\n      </mat-icon>\r\n    </ng-template>\r\n  </button>\r\n\r\n  <ng-content select=\".mat-select-search-custom-header-content\"></ng-content>\r\n\r\n  <mat-divider></mat-divider>\r\n</div>\r\n\r\n<div *ngIf=\"_showNoEntriesFound$ | async\"\r\n     class=\"mat-select-search-no-entries-found\">\r\n  <ng-content *ngIf=\"noEntriesFound; else defaultNoEntriesFound\"\r\n              select=\"[ngxMatSelectNoEntriesFound]\"></ng-content>\r\n  <ng-template #defaultNoEntriesFound>{{noEntriesFoundLabel}}</ng-template>\r\n</div>\r\n", styles: [".mat-select-search-hidden{visibility:hidden}.mat-select-search-inner{position:absolute;top:0;left:0;width:100%;z-index:100;font-size:inherit;box-shadow:none}.mat-select-search-inner.mat-select-search-inner-multiple.mat-select-search-inner-toggle-all{display:flex;align-items:center}.mat-select-search-input{box-sizing:border-box;width:100%;border:none;font-family:inherit;font-size:inherit;color:currentColor;outline:none;background:none;padding:0 44px 0 16px;height:calc(3em - 1px);line-height:calc(3em - 1px)}:host-context([dir=rtl]) .mat-select-search-input{padding-right:16px;padding-left:44px}.mat-select-search-inner-toggle-all .mat-select-search-input{padding-left:5px}.mat-select-search-no-entries-found{padding-top:8px}.mat-select-search-clear{position:absolute;right:4px;top:0}:host-context([dir=rtl]) .mat-select-search-clear{right:auto;left:4px}.mat-select-search-spinner{position:absolute;right:16px;top:calc(50% - 8px)}:host-context([dir=rtl]) .mat-select-search-spinner{right:auto;left:16px}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search{position:sticky;top:-8px;z-index:1;opacity:1;margin-top:-8px;pointer-events:all}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search .mat-icon{margin-right:0;margin-left:0}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search mat-pseudo-checkbox{display:none}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search .mdc-list-item__primary-text{opacity:1}.mat-select-search-toggle-all-checkbox{padding-left:5px}:host-context([dir=rtl]) .mat-select-search-toggle-all-checkbox{padding-left:0;padding-right:5px}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i5.MatLegacyButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i6.MatLegacyCheckbox, selector: "mat-checkbox", inputs: ["disableRipple", "color", "tabIndex"], exportAs: ["matCheckbox"] }, { kind: "component", type: i7.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: i8.MatLegacyProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "diameter", "strokeWidth", "mode", "value"], exportAs: ["matProgressSpinner"] }, { kind: "directive", type: i9.MatLegacyTooltip, selector: "[matTooltip]", exportAs: ["matTooltip"] }, { kind: "component", type: i10.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }, { kind: "pipe", type: i3.AsyncPipe, name: "async" }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectSearchComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-select-search', providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => MatSelectSearchComponent),
                            multi: true
                        }
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<!--\r\nCopyright (c) 2018 Bithost GmbH All Rights Reserved.\r\n\r\nUse of this source code is governed by an MIT-style license that can be\r\nfound in the LICENSE file at https://angular.io/license\r\n-->\r\n<!-- Placeholder to adjust vertical offset of the mat-option elements -->\r\n<input matInput class=\"mat-select-search-input mat-select-search-hidden\"/>\r\n\r\n<!-- Note: the  mat-datepicker-content mat-tab-header are needed to inherit the material theme colors, see PR #22 -->\r\n<div\r\n      #innerSelectSearch\r\n      class=\"mat-select-search-inner mat-typography mat-datepicker-content mat-tab-header\"\r\n      [ngClass]=\"{'mat-select-search-inner-multiple': matSelect.multiple, 'mat-select-search-inner-toggle-all': _isToggleAllCheckboxVisible() }\">\r\n\r\n  <mat-checkbox *ngIf=\"_isToggleAllCheckboxVisible()\"\r\n                [color]=\"matFormField?.color\"\r\n                class=\"mat-select-search-toggle-all-checkbox\"\r\n                [checked]=\"toggleAllCheckboxChecked\"\r\n                [indeterminate]=\"toggleAllCheckboxIndeterminate\"\r\n                [matTooltip]=\"toggleAllCheckboxTooltipMessage\"\r\n                matTooltipClass=\"ngx-mat-select-search-toggle-all-tooltip\"\r\n                [matTooltipPosition]=\"toggleAllCheckboxTooltipPosition\"\r\n                (change)=\"_emitSelectAllBooleanToParent($event.checked)\"\r\n  ></mat-checkbox>\r\n\r\n  <input class=\"mat-select-search-input\"\r\n         autocomplete=\"off\"\r\n         [type]=\"type\"\r\n         [formControl]=\"_formControl\"\r\n         #searchSelectInput\r\n         (keydown)=\"_handleKeydown($event)\"\r\n         (keyup)=\"_handleKeyup($event)\"\r\n         (blur)=\"onBlur()\"\r\n         [placeholder]=\"placeholderLabel\"\r\n         [attr.aria-label]=\"ariaLabel\"\r\n  />\r\n  <mat-spinner *ngIf=\"searching\"\r\n          class=\"mat-select-search-spinner\"\r\n          diameter=\"16\"></mat-spinner>\r\n\r\n  <button *ngIf=\"!hideClearSearchButton && value && !searching\"\r\n          mat-icon-button\r\n          aria-label=\"Clear\"\r\n          (click)=\"_reset(true)\"\r\n          class=\"mat-select-search-clear\">\r\n    <ng-content *ngIf=\"clearIcon; else defaultIcon\" select=\"[ngxMatSelectSearchClear]\"></ng-content>\r\n    <ng-template #defaultIcon>\r\n      <mat-icon [svgIcon]=\"closeSvgIcon ?? ''\">\r\n        {{!closeSvgIcon ? closeIcon : null}}\r\n      </mat-icon>\r\n    </ng-template>\r\n  </button>\r\n\r\n  <ng-content select=\".mat-select-search-custom-header-content\"></ng-content>\r\n\r\n  <mat-divider></mat-divider>\r\n</div>\r\n\r\n<div *ngIf=\"_showNoEntriesFound$ | async\"\r\n     class=\"mat-select-search-no-entries-found\">\r\n  <ng-content *ngIf=\"noEntriesFound; else defaultNoEntriesFound\"\r\n              select=\"[ngxMatSelectNoEntriesFound]\"></ng-content>\r\n  <ng-template #defaultNoEntriesFound>{{noEntriesFoundLabel}}</ng-template>\r\n</div>\r\n", styles: [".mat-select-search-hidden{visibility:hidden}.mat-select-search-inner{position:absolute;top:0;left:0;width:100%;z-index:100;font-size:inherit;box-shadow:none}.mat-select-search-inner.mat-select-search-inner-multiple.mat-select-search-inner-toggle-all{display:flex;align-items:center}.mat-select-search-input{box-sizing:border-box;width:100%;border:none;font-family:inherit;font-size:inherit;color:currentColor;outline:none;background:none;padding:0 44px 0 16px;height:calc(3em - 1px);line-height:calc(3em - 1px)}:host-context([dir=rtl]) .mat-select-search-input{padding-right:16px;padding-left:44px}.mat-select-search-inner-toggle-all .mat-select-search-input{padding-left:5px}.mat-select-search-no-entries-found{padding-top:8px}.mat-select-search-clear{position:absolute;right:4px;top:0}:host-context([dir=rtl]) .mat-select-search-clear{right:auto;left:4px}.mat-select-search-spinner{position:absolute;right:16px;top:calc(50% - 8px)}:host-context([dir=rtl]) .mat-select-search-spinner{right:auto;left:16px}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search{position:sticky;top:-8px;z-index:1;opacity:1;margin-top:-8px;pointer-events:all}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search .mat-icon{margin-right:0;margin-left:0}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search mat-pseudo-checkbox{display:none}::ng-deep .mat-mdc-option[aria-disabled=true].contains-mat-select-search .mdc-list-item__primary-text{opacity:1}.mat-select-search-toggle-all-checkbox{padding-left:5px}:host-context([dir=rtl]) .mat-select-search-toggle-all-checkbox{padding-left:0;padding-right:5px}\n"] }]
        }], ctorParameters: function () { return [{ type: i11.MatLegacySelect, decorators: [{
                    type: Inject,
                    args: [MatLegacySelect]
                }] }, { type: i1.MatLegacyOption, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }, {
                    type: Host
                }] }, { type: i0.ChangeDetectorRef }, { type: i2.ViewportRuler }, { type: i12.MatLegacyFormField, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MatFormField]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MAT_SELECTSEARCH_DEFAULT_OPTIONS]
                }] }]; }, propDecorators: { placeholderLabel: [{
                type: Input
            }], type: [{
                type: Input
            }], closeIcon: [{
                type: Input
            }], closeSvgIcon: [{
                type: Input
            }], noEntriesFoundLabel: [{
                type: Input
            }], clearSearchInput: [{
                type: Input
            }], searching: [{
                type: Input
            }], disableInitialFocus: [{
                type: Input
            }], enableClearOnEscapePressed: [{
                type: Input
            }], preventHomeEndKeyPropagation: [{
                type: Input
            }], disableScrollToActiveOnOptionsChanged: [{
                type: Input
            }], ariaLabel: [{
                type: Input
            }], showToggleAllCheckbox: [{
                type: Input
            }], toggleAllCheckboxChecked: [{
                type: Input
            }], toggleAllCheckboxIndeterminate: [{
                type: Input
            }], toggleAllCheckboxTooltipMessage: [{
                type: Input
            }], toggleAllCheckboxTooltipPosition: [{
                type: Input
            }], hideClearSearchButton: [{
                type: Input
            }], alwaysRestoreSelectedOptionsMulti: [{
                type: Input
            }], toggleAll: [{
                type: Output
            }], searchSelectInput: [{
                type: ViewChild,
                args: ['searchSelectInput', { read: ElementRef, static: true }]
            }], innerSelectSearch: [{
                type: ViewChild,
                args: ['innerSelectSearch', { read: ElementRef, static: true }]
            }], clearIcon: [{
                type: ContentChild,
                args: [MatSelectSearchClearDirective]
            }], noEntriesFound: [{
                type: ContentChild,
                args: [MatSelectNoEntriesFoundDirective]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0LXNlbGVjdC1zZWFyY2guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdGVzdC1jb21wb25lbnQvc3JjL2xpYi9tYXQtc2VsZWN0LXNlYXJjaC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi9wcm9qZWN0cy90ZXN0LWNvbXBvbmVudC9zcmMvbGliL21hdC1zZWxlY3Qtc2VhcmNoLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0gsT0FBTyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVoSCxPQUFPLEVBQ0wsdUJBQXVCLEVBRXZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUVOLFNBQVMsRUFDVCxJQUFJLEVBQ0osUUFBUSxFQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBd0IsV0FBVyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJdEYsd0dBQXdHO0FBQ3hHLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxZQUFZLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN6RixPQUFPLEVBQUUsZUFBZSxFQUFHLE1BQU0saUNBQWlDLENBQUM7QUFFbkUsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQWMsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsU0FBUyxF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RyxTQUFTO3NCQUFqQixLQUFLO2dCQUdHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBR0csbUJBQW1CO3NCQUEzQixLQUFLO2dCQU1HLGdCQUFnQjtzQkFBeEIsS0FBSztnQkFHRyxTQUFTO3NCQUFqQixLQUFLO2dCQUdHLG1CQUFtQjtzQkFBM0IsS0FBSztnQkFHRywwQkFBMEI7c0JBQWxDLEtBQUs7Z0JBTUcsNEJBQTRCO3NCQUFwQyxLQUFLO2dCQUdHLHFDQUFxQztzQkFBN0MsS0FBSztnQkFHRyxTQUFTO3NCQUFqQixLQUFLO2dCQUdHLHFCQUFxQjtzQkFBN0IsS0FBSztnQkFHRyx3QkFBd0I7c0JBQWhDLEtBQUs7Z0JBR0csOEJBQThCO3NCQUF0QyxLQUFLO2dCQUdHLCtCQUErQjtzQkFBdkMsS0FBSztnQkFHRyxnQ0FBZ0M7c0JBQXhDLEtBQUs7Z0JBR0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQU1HLGlDQUFpQztzQkFBekMsS0FBSztnQkFHSSxTQUFTO3NCQUFsQixNQUFNO2dCQUc2RCxpQkFBaUI7c0JBQXBGLFNBQVM7dUJBQUMsbUJBQW1CLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBR0UsaUJBQWlCO3NCQUFwRixTQUFTO3VCQUFDLG1CQUFtQixFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUdyQixTQUFTO3NCQUFyRCxZQUFZO3VCQUFDLDZCQUE2QjtnQkFHSyxjQUFjO3NCQUE3RCxZQUFZO3VCQUFDLGdDQUFnQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggQml0aG9zdCBHbWJIIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcbmltcG9ydCB7IEEsIERPV05fQVJST1csIEVORCwgRU5URVIsIEVTQ0FQRSwgSE9NRSwgTklORSwgU1BBQ0UsIFVQX0FSUk9XLCBaLCBaRVJPIH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcclxuaW1wb3J0IHsgVmlld3BvcnRSdWxlciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xyXG5pbXBvcnQge1xyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBDb250ZW50Q2hpbGQsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbmplY3QsXHJcbiAgSW5wdXQsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBPcHRpb25hbCxcclxuICBPdXRwdXQsXHJcbiAgUXVlcnlMaXN0LFxyXG4gIFZpZXdDaGlsZCxcclxuICBIb3N0LFxyXG4gIFNraXBTZWxmXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBGb3JtQ29udHJvbCwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IE1hdExlZ2FjeU9wdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2xlZ2FjeS1jb3JlJztcclxuXHJcblxyXG4vLyBpbXBvcnQgeyBNYXRMZWdhY3lGb3JtRmllbGRNb2R1bGUgYXMgTWF0Rm9ybUZpZWxkTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGVnYWN5LWZvcm0tZmllbGQnO1xyXG5pbXBvcnQgeyBNYXRMZWdhY3lGb3JtRmllbGQgYXMgTWF0Rm9ybUZpZWxkIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGVnYWN5LWZvcm0tZmllbGQnO1xyXG5pbXBvcnQgeyBNYXRMZWdhY3lTZWxlY3QgIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGVnYWN5LXNlbGVjdCc7XHJcblxyXG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIGNvbWJpbmVMYXRlc3QsIE9ic2VydmFibGUsIG9mLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGRlbGF5LCBmaWx0ZXIsIG1hcCwgc3RhcnRXaXRoLCBzd2l0Y2hNYXAsIHRha2UsIHRha2VVbnRpbCwgdGFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBNYXRTZWxlY3RTZWFyY2hDbGVhckRpcmVjdGl2ZSB9IGZyb20gJy4vbWF0LXNlbGVjdC1zZWFyY2gtY2xlYXIuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgY29uZmlndXJhYmxlRGVmYXVsdE9wdGlvbnMsIE1BVF9TRUxFQ1RTRUFSQ0hfREVGQVVMVF9PUFRJT05TLCBNYXRTZWxlY3RTZWFyY2hPcHRpb25zIH0gZnJvbSAnLi9kZWZhdWx0LW9wdGlvbnMnO1xyXG5pbXBvcnQgeyBNYXRTZWxlY3ROb0VudHJpZXNGb3VuZERpcmVjdGl2ZSB9IGZyb20gJy4vbWF0LXNlbGVjdC1uby1lbnRyaWVzLWZvdW5kLmRpcmVjdGl2ZSc7XHJcblxyXG4vKiB0c2xpbnQ6ZGlzYWJsZTptZW1iZXItb3JkZXJpbmcgY29tcG9uZW50LXNlbGVjdG9yICovXHJcbi8qKlxyXG4gKiBDb21wb25lbnQgcHJvdmlkaW5nIGFuIGlucHV0IGZpZWxkIGZvciBzZWFyY2hpbmcgTWF0TGVnYWN5U2VsZWN0IG9wdGlvbnMuXHJcbiAqXHJcbiAqIEV4YW1wbGUgdXNhZ2U6XHJcbiAqXHJcbiAqIGludGVyZmFjZSBCYW5rIHtcclxuICogIGlkOiBzdHJpbmc7XHJcbiAqICBuYW1lOiBzdHJpbmc7XHJcbiAqIH1cclxuICpcclxuICogQENvbXBvbmVudCh7XHJcbiAqICAgc2VsZWN0b3I6ICdteS1hcHAtZGF0YS1zZWxlY3Rpb24nLFxyXG4gKiAgIHRlbXBsYXRlOiBgXHJcbiAqICAgICA8bWF0LWZvcm0tZmllbGQ+XHJcbiAqICAgICAgIDxtYXQtc2VsZWN0IFtmb3JtQ29udHJvbF09XCJiYW5rQ3RybFwiIHBsYWNlaG9sZGVyPVwiQmFua1wiPlxyXG4gKiAgICAgICAgIDxtYXQtb3B0aW9uPlxyXG4gKiAgICAgICAgICAgPG5neC1tYXQtc2VsZWN0LXNlYXJjaCBbZm9ybUNvbnRyb2xdPVwiYmFua0ZpbHRlckN0cmxcIj48L25neC1tYXQtc2VsZWN0LXNlYXJjaD5cclxuICogICAgICAgICA8L21hdC1vcHRpb24+XHJcbiAqICAgICAgICAgPG1hdC1vcHRpb24gKm5nRm9yPVwibGV0IGJhbmsgb2YgZmlsdGVyZWRCYW5rcyB8IGFzeW5jXCIgW3ZhbHVlXT1cImJhbmsuaWRcIj5cclxuICogICAgICAgICAgIHt7YmFuay5uYW1lfX1cclxuICogICAgICAgICA8L21hdC1vcHRpb24+XHJcbiAqICAgICAgIDwvbWF0LXNlbGVjdD5cclxuICogICAgIDwvbWF0LWZvcm0tZmllbGQ+XHJcbiAqICAgYFxyXG4gKiB9KVxyXG4gKiBleHBvcnQgY2xhc3MgRGF0YVNlbGVjdGlvbkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICpcclxuICogICAvLyBjb250cm9sIGZvciB0aGUgc2VsZWN0ZWQgYmFua1xyXG4gKiAgIHB1YmxpYyBiYW5rQ3RybDogRm9ybUNvbnRyb2wgPSBuZXcgRm9ybUNvbnRyb2woKTtcclxuICogICAvLyBjb250cm9sIGZvciB0aGUgTWF0TGVnYWN5U2VsZWN0IGZpbHRlciBrZXl3b3JkXHJcbiAqICAgcHVibGljIGJhbmtGaWx0ZXJDdHJsOiBGb3JtQ29udHJvbCA9IG5ldyBGb3JtQ29udHJvbCgpO1xyXG4gKlxyXG4gKiAgIC8vIGxpc3Qgb2YgYmFua3NcclxuICogICBwcml2YXRlIGJhbmtzOiBCYW5rW10gPSBbe25hbWU6ICdCYW5rIEEnLCBpZDogJ0EnfSwge25hbWU6ICdCYW5rIEInLCBpZDogJ0InfSwge25hbWU6ICdCYW5rIEMnLCBpZDogJ0MnfV07XHJcbiAqICAgLy8gbGlzdCBvZiBiYW5rcyBmaWx0ZXJlZCBieSBzZWFyY2gga2V5d29yZFxyXG4gKiAgIHB1YmxpYyBmaWx0ZXJlZEJhbmtzOiBSZXBsYXlTdWJqZWN0PEJhbmtbXT4gPSBuZXcgUmVwbGF5U3ViamVjdDxCYW5rW10+KDEpO1xyXG4gKlxyXG4gKiAgIC8vIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLlxyXG4gKiAgIHByaXZhdGUgX29uRGVzdHJveSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcbiAqXHJcbiAqXHJcbiAqICAgbmdPbkluaXQoKSB7XHJcbiAqICAgICAvLyBsb2FkIHRoZSBpbml0aWFsIGJhbmsgbGlzdFxyXG4gKiAgICAgdGhpcy5maWx0ZXJlZEJhbmtzLm5leHQodGhpcy5iYW5rcy5zbGljZSgpKTtcclxuICogICAgIC8vIGxpc3RlbiBmb3Igc2VhcmNoIGZpZWxkIHZhbHVlIGNoYW5nZXNcclxuICogICAgIHRoaXMuYmFua0ZpbHRlckN0cmwudmFsdWVDaGFuZ2VzXHJcbiAqICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gKiAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICogICAgICAgICB0aGlzLmZpbHRlckJhbmtzKCk7XHJcbiAqICAgICAgIH0pO1xyXG4gKiAgIH1cclxuICpcclxuICogICBuZ09uRGVzdHJveSgpIHtcclxuICogICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAqICAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuICogICB9XHJcbiAqXHJcbiAqICAgcHJpdmF0ZSBmaWx0ZXJCYW5rcygpIHtcclxuICogICAgIGlmICghdGhpcy5iYW5rcykge1xyXG4gKiAgICAgICByZXR1cm47XHJcbiAqICAgICB9XHJcbiAqXHJcbiAqICAgICAvLyBnZXQgdGhlIHNlYXJjaCBrZXl3b3JkXHJcbiAqICAgICBsZXQgc2VhcmNoID0gdGhpcy5iYW5rRmlsdGVyQ3RybC52YWx1ZTtcclxuICogICAgIGlmICghc2VhcmNoKSB7XHJcbiAqICAgICAgIHRoaXMuZmlsdGVyZWRCYW5rcy5uZXh0KHRoaXMuYmFua3Muc2xpY2UoKSk7XHJcbiAqICAgICAgIHJldHVybjtcclxuICogICAgIH0gZWxzZSB7XHJcbiAqICAgICAgIHNlYXJjaCA9IHNlYXJjaC50b0xvd2VyQ2FzZSgpO1xyXG4gKiAgICAgfVxyXG4gKlxyXG4gKiAgICAgLy8gZmlsdGVyIHRoZSBiYW5rc1xyXG4gKiAgICAgdGhpcy5maWx0ZXJlZEJhbmtzLm5leHQoXHJcbiAqICAgICAgIHRoaXMuYmFua3MuZmlsdGVyKGJhbmsgPT4gYmFuay5uYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2gpID4gLTEpXHJcbiAqICAgICApO1xyXG4gKiAgIH1cclxuICogfVxyXG4gKi9cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtbWF0LXNlbGVjdC1zZWFyY2gnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9tYXQtc2VsZWN0LXNlYXJjaC5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbWF0LXNlbGVjdC1zZWFyY2guY29tcG9uZW50LnNjc3MnXSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHtcclxuICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE1hdFNlbGVjdFNlYXJjaENvbXBvbmVudCksXHJcbiAgICAgIG11bHRpOiB0cnVlXHJcbiAgICB9XHJcbiAgXSxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0U2VhcmNoQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcclxuXHJcbiAgLyoqIExhYmVsIG9mIHRoZSBzZWFyY2ggcGxhY2Vob2xkZXIgKi9cclxuICBASW5wdXQoKSBwbGFjZWhvbGRlckxhYmVsID0gJ1N1Y2hlJztcclxuXHJcbiAgLyoqIFR5cGUgb2YgdGhlIHNlYXJjaCBpbnB1dCBmaWVsZCAqL1xyXG4gIEBJbnB1dCgpIHR5cGUgPSAndGV4dCc7XHJcblxyXG4gIC8qKiBGb250LWJhc2VkIGljb24gdXNlZCBmb3IgZGlzcGxheWluZyBDbG9zZS1JY29uICovXHJcbiAgQElucHV0KCkgY2xvc2VJY29uID0gJ2Nsb3NlJztcclxuXHJcbiAgLyoqIFN2Zy1iYXNlZCBpY29uIHVzZWQgZm9yIGRpc3BsYXlpbmcgQ2xvc2UtSWNvbi4gSWYgc2V0LCBjbG9zZUljb24gaXMgb3ZlcnJpZGRlbiAqL1xyXG4gIEBJbnB1dCgpIGNsb3NlU3ZnSWNvbj86IHN0cmluZztcclxuXHJcbiAgLyoqIExhYmVsIHRvIGJlIHNob3duIHdoZW4gbm8gZW50cmllcyBhcmUgZm91bmQuIFNldCB0byBudWxsIGlmIG5vIG1lc3NhZ2Ugc2hvdWxkIGJlIHNob3duLiAqL1xyXG4gIEBJbnB1dCgpIG5vRW50cmllc0ZvdW5kTGFiZWwgPSAnS2VpbmUgT3B0aW9uZW4gZ2VmdW5kZW4nO1xyXG5cclxuICAvKipcclxuICAgICogV2hldGhlciBvciBub3QgdGhlIHNlYXJjaCBmaWVsZCBzaG91bGQgYmUgY2xlYXJlZCBhZnRlciB0aGUgZHJvcGRvd24gbWVudSBpcyBjbG9zZWQuXHJcbiAgICAqIFVzZWZ1bCBmb3Igc2VydmVyLXNpZGUgZmlsdGVyaW5nLiBTZWUgWyMzXShodHRwczovL2dpdGh1Yi5jb20vYml0aG9zdC1nbWJoL25neC1tYXQtc2VsZWN0LXNlYXJjaC9pc3N1ZXMvMylcclxuICAgICovXHJcbiAgQElucHV0KCkgY2xlYXJTZWFyY2hJbnB1dCA9IHRydWU7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRvIHNob3cgdGhlIHNlYXJjaC1pbi1wcm9ncmVzcyBpbmRpY2F0b3IgKi9cclxuICBASW5wdXQoKSBzZWFyY2hpbmcgPSBmYWxzZTtcclxuXHJcbiAgLyoqIERpc2FibGVzIGluaXRpYWwgZm9jdXNpbmcgb2YgdGhlIGlucHV0IGZpZWxkICovXHJcbiAgQElucHV0KCkgZGlzYWJsZUluaXRpYWxGb2N1cyA9IGZhbHNlO1xyXG5cclxuICAvKiogRW5hYmxlIGNsZWFyIGlucHV0IG9uIGVzY2FwZSBwcmVzc2VkICovXHJcbiAgQElucHV0KCkgZW5hYmxlQ2xlYXJPbkVzY2FwZVByZXNzZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHJldmVudHMgaG9tZSAvIGVuZCBrZXkgYmVpbmcgcHJvcGFnYXRlZCB0byBtYXQtc2VsZWN0LFxyXG4gICAqIGFsbG93aW5nIHRvIG1vdmUgdGhlIGN1cnNvciB3aXRoaW4gdGhlIHNlYXJjaCBpbnB1dCBpbnN0ZWFkIG9mIG5hdmlnYXRpbmcgdGhlIG9wdGlvbnNcclxuICAgKi9cclxuICBASW5wdXQoKSBwcmV2ZW50SG9tZUVuZEtleVByb3BhZ2F0aW9uID0gZmFsc2U7XHJcblxyXG4gIC8qKiBEaXNhYmxlcyBzY3JvbGxpbmcgdG8gYWN0aXZlIG9wdGlvbnMgd2hlbiBvcHRpb24gbGlzdCBjaGFuZ2VzLiBVc2VmdWwgZm9yIHNlcnZlci1zaWRlIHNlYXJjaCAqL1xyXG4gIEBJbnB1dCgpIGRpc2FibGVTY3JvbGxUb0FjdGl2ZU9uT3B0aW9uc0NoYW5nZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqIEFkZHMgNTA4IHNjcmVlbiByZWFkZXIgc3VwcG9ydCBmb3Igc2VhcmNoIGJveCAqL1xyXG4gIEBJbnB1dCgpIGFyaWFMYWJlbCA9ICdkcm9wZG93biBzZWFyY2gnO1xyXG5cclxuICAvKiogV2hldGhlciB0byBzaG93IFNlbGVjdCBBbGwgQ2hlY2tib3ggKGZvciBtYXQtc2VsZWN0W211bHRpPXRydWVdKSAqL1xyXG4gIEBJbnB1dCgpIHNob3dUb2dnbGVBbGxDaGVja2JveCA9IGZhbHNlO1xyXG5cclxuICAvKiogc2VsZWN0IGFsbCBjaGVja2JveCBjaGVja2VkIHN0YXRlICovXHJcbiAgQElucHV0KCkgdG9nZ2xlQWxsQ2hlY2tib3hDaGVja2VkID0gZmFsc2U7XHJcblxyXG4gIC8qKiBzZWxlY3QgYWxsIGNoZWNrYm94IGluZGV0ZXJtaW5hdGUgc3RhdGUgKi9cclxuICBASW5wdXQoKSB0b2dnbGVBbGxDaGVja2JveEluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcclxuXHJcbiAgLyoqIERpc3BsYXkgYSBtZXNzYWdlIGluIGEgdG9vbHRpcCBvbiB0aGUgdG9nZ2xlLWFsbCBjaGVja2JveCAqL1xyXG4gIEBJbnB1dCgpIHRvZ2dsZUFsbENoZWNrYm94VG9vbHRpcE1lc3NhZ2UgPSAnJztcclxuXHJcbiAgLyoqIERlZmluZSB0aGUgcG9zaXRpb24gb2YgdGhlIHRvb2x0aXAgb24gdGhlIHRvZ2dsZS1hbGwgY2hlY2tib3guICovXHJcbiAgQElucHV0KCkgdG9nZ2xlQWxsQ2hlY2tib3hUb29sdGlwUG9zaXRpb246ICdsZWZ0JyB8ICdyaWdodCcgfCAnYWJvdmUnIHwgJ2JlbG93JyB8ICdiZWZvcmUnIHwgJ2FmdGVyJyA9ICdiZWxvdyc7XHJcblxyXG4gIC8qKiBTaG93L0hpZGUgdGhlIHNlYXJjaCBjbGVhciBidXR0b24gb2YgdGhlIHNlYXJjaCBpbnB1dCAqL1xyXG4gIEBJbnB1dCgpIGhpZGVDbGVhclNlYXJjaEJ1dHRvbiA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBBbHdheXMgcmVzdG9yZSBzZWxlY3RlZCBvcHRpb25zIG9uIHNlbGVjdGlvbkNoYW5nZSBmb3IgbW9kZSBtdWx0aSAoZS5nLiBmb3IgbGF6eSBsb2FkaW5nL2luZmluaXR5IHNjcm9sbGluZykuXHJcbiAgICogRGVmYXVsdHMgdG8gZmFsc2UsIHNvIHNlbGVjdGVkIG9wdGlvbnMgYXJlIG9ubHkgcmVzdG9yZWQgd2hpbGUgZmlsdGVyaW5nIGlzIGFjdGl2ZS5cclxuICAgKi9cclxuICBASW5wdXQoKSBhbHdheXNSZXN0b3JlU2VsZWN0ZWRPcHRpb25zTXVsdGkgPSBmYWxzZTtcclxuXHJcbiAgLyoqIE91dHB1dCBlbWl0dGVyIHRvIHNlbmQgdG8gcGFyZW50IGNvbXBvbmVudCB3aXRoIHRoZSB0b2dnbGUgYWxsIGJvb2xlYW4gKi9cclxuICBAT3V0cHV0KCkgdG9nZ2xlQWxsID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBzZWFyY2ggaW5wdXQgZmllbGQgKi9cclxuICBAVmlld0NoaWxkKCdzZWFyY2hTZWxlY3RJbnB1dCcsIHsgcmVhZDogRWxlbWVudFJlZiwgc3RhdGljOiB0cnVlIH0pIHNlYXJjaFNlbGVjdElucHV0ITogRWxlbWVudFJlZjtcclxuXHJcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgc2VhcmNoIGlucHV0IGZpZWxkICovXHJcbiAgQFZpZXdDaGlsZCgnaW5uZXJTZWxlY3RTZWFyY2gnLCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBpbm5lclNlbGVjdFNlYXJjaCE6IEVsZW1lbnRSZWY7XHJcblxyXG4gIC8qKiBSZWZlcmVuY2UgdG8gY3VzdG9tIHNlYXJjaCBpbnB1dCBjbGVhciBpY29uICovXHJcbiAgQENvbnRlbnRDaGlsZChNYXRTZWxlY3RTZWFyY2hDbGVhckRpcmVjdGl2ZSkgY2xlYXJJY29uITogTWF0U2VsZWN0U2VhcmNoQ2xlYXJEaXJlY3RpdmU7XHJcblxyXG4gIC8qKiBSZWZlcmVuY2UgdG8gY3VzdG9tIG5vIGVudHJpZXMgZm91bmQgZWxlbWVudCAqL1xyXG4gIEBDb250ZW50Q2hpbGQoTWF0U2VsZWN0Tm9FbnRyaWVzRm91bmREaXJlY3RpdmUpIG5vRW50cmllc0ZvdW5kITogTWF0U2VsZWN0Tm9FbnRyaWVzRm91bmREaXJlY3RpdmU7XHJcblxyXG4gIC8qKiBDdXJyZW50IHNlYXJjaCB2YWx1ZSAqL1xyXG4gIGdldCB2YWx1ZSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2Zvcm1Db250cm9sLnZhbHVlO1xyXG4gIH1cclxuICBwcml2YXRlIF9sYXN0RXh0ZXJuYWxJbnB1dFZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktZnVuY3Rpb25cclxuICBvblRvdWNoZWQ6IEZ1bmN0aW9uID0gKF86IGFueSkgPT4geyB9O1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBNYXRMZWdhY3lTZWxlY3Qgb3B0aW9ucyAqL1xyXG4gIHB1YmxpYyBzZXQgX29wdGlvbnMoX29wdGlvbnM6IFF1ZXJ5TGlzdDxNYXRMZWdhY3lPcHRpb24+IHwgbnVsbCkge1xyXG4gICAgdGhpcy5fb3B0aW9ucyQubmV4dChfb3B0aW9ucyk7XHJcbiAgfVxyXG4gIHB1YmxpYyBnZXQgX29wdGlvbnMoKTogUXVlcnlMaXN0PE1hdExlZ2FjeU9wdGlvbj4gfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9vcHRpb25zJC5nZXRWYWx1ZSgpO1xyXG4gIH1cclxuICBwdWJsaWMgX29wdGlvbnMkOiBCZWhhdmlvclN1YmplY3Q8UXVlcnlMaXN0PE1hdExlZ2FjeU9wdGlvbj58bnVsbD4gPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFF1ZXJ5TGlzdDxNYXRMZWdhY3lPcHRpb24+fG51bGw+KG51bGwpO1xyXG5cclxuICBwcml2YXRlIG9wdGlvbnNMaXN0JDogT2JzZXJ2YWJsZTxNYXRMZWdhY3lPcHRpb25bXT4gPSB0aGlzLl9vcHRpb25zJC5waXBlKFxyXG4gICAgc3dpdGNoTWFwKF9vcHRpb25zID0+IF9vcHRpb25zID9cclxuICAgICAgX29wdGlvbnMuY2hhbmdlcy5waXBlKFxyXG4gICAgICAgIG1hcChvcHRpb25zID0+IG9wdGlvbnMudG9BcnJheSgpKSxcclxuICAgICAgICBzdGFydFdpdGg8TWF0TGVnYWN5T3B0aW9uW10+KF9vcHRpb25zLnRvQXJyYXkoKSksXHJcbiAgICAgICkgOiBvZihbXSlcclxuICAgIClcclxuICApO1xyXG5cclxuICBwcml2YXRlIG9wdGlvbnNMZW5ndGgkOiBPYnNlcnZhYmxlPG51bWJlcj4gPSB0aGlzLm9wdGlvbnNMaXN0JC5waXBlKFxyXG4gICAgbWFwKG9wdGlvbnMgPT4gb3B0aW9ucyA/IG9wdGlvbnMubGVuZ3RoIDogMClcclxuICApO1xyXG5cclxuICAvKiogUHJldmlvdXNseSBzZWxlY3RlZCB2YWx1ZXMgd2hlbiB1c2luZyA8bWF0LXNlbGVjdCBbbXVsdGlwbGVdPVwidHJ1ZVwiPiovXHJcbiAgcHJpdmF0ZSBwcmV2aW91c1NlbGVjdGVkVmFsdWVzITogYW55W107XHJcblxyXG4gIHB1YmxpYyBfZm9ybUNvbnRyb2w6IEZvcm1Db250cm9sPHN0cmluZz4gPSBuZXcgRm9ybUNvbnRyb2w8c3RyaW5nPignJywge25vbk51bGxhYmxlOiB0cnVlfSk7XHJcblxyXG4gIC8qKiB3aGV0aGVyIHRvIHNob3cgdGhlIG5vIGVudHJpZXMgZm91bmQgbWVzc2FnZSAqL1xyXG4gIHB1YmxpYyBfc2hvd05vRW50cmllc0ZvdW5kJDogT2JzZXJ2YWJsZTxib29sZWFuPiA9IGNvbWJpbmVMYXRlc3QoW1xyXG4gICAgdGhpcy5fZm9ybUNvbnRyb2wudmFsdWVDaGFuZ2VzLFxyXG4gICAgdGhpcy5vcHRpb25zTGVuZ3RoJFxyXG4gIF0pLnBpcGUoXHJcbiAgICBtYXAoKFt2YWx1ZSwgb3B0aW9uc0xlbmd0aF0pID0+IHtcclxuICAgICAgY29uc3QgcmVzdWx0OiBib29sZWFuID0gKCEhdGhpcy5ub0VudHJpZXNGb3VuZExhYmVsKSAmJiAoISF2YWx1ZSkgJiYgb3B0aW9uc0xlbmd0aCA9PT0gdGhpcy5nZXRPcHRpb25zTGVuZ3RoT2Zmc2V0KCk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9KVxyXG4gICk7XHJcblxyXG4gIC8qKiBTdWJqZWN0IHRoYXQgZW1pdHMgd2hlbiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9vbkRlc3Ryb3kgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIGFjdGl2ZSBkZXNjZW5kYW50IGZvciBBUklBIFN1cHBvcnQuICovXHJcbiAgcHJpdmF0ZSBhY3RpdmVEZXNjZW5kYW50ITogSFRNTEVsZW1lbnQ7XHJcbiAgLy8gcHJpdmF0ZSBob3N0RWxlbWVudDogRWxlbWVudCxcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KE1hdExlZ2FjeVNlbGVjdCkgcHVibGljIG1hdFNlbGVjdDogTWF0TGVnYWN5U2VsZWN0LFxyXG4gICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgQEhvc3QoKSBwcml2YXRlIG1hdE9wdGlvbjogTWF0TGVnYWN5T3B0aW9uLFxyXG4gICAgcHVibGljIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgX3ZpZXdwb3J0UnVsZXI6IFZpZXdwb3J0UnVsZXIsXHJcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1hdEZvcm1GaWVsZCkgcHVibGljIG1hdEZvcm1GaWVsZDogTWF0Rm9ybUZpZWxkIHwgbnVsbCA9IG51bGwsXHJcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE1BVF9TRUxFQ1RTRUFSQ0hfREVGQVVMVF9PUFRJT05TKSBkZWZhdWx0T3B0aW9ucz86IE1hdFNlbGVjdFNlYXJjaE9wdGlvbnNcclxuICApIHtcclxuICAgIHRoaXMuYXBwbHlEZWZhdWx0T3B0aW9ucyhkZWZhdWx0T3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGFwcGx5RGVmYXVsdE9wdGlvbnMoZGVmYXVsdE9wdGlvbnM/OiBNYXRTZWxlY3RTZWFyY2hPcHRpb25zKSB7XHJcbiAgICBpZiAoIWRlZmF1bHRPcHRpb25zKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbmZpZ3VyYWJsZURlZmF1bHRPcHRpb25zKSB7XHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcclxuICAgICAgaWYgKGRlZmF1bHRPcHRpb25zLmhhc093blByb3BlcnR5KGtleSkpIHtcclxuICAgICAgICAodGhpc1trZXldIGFzIGFueSkgPSBkZWZhdWx0T3B0aW9uc1trZXldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIHNldCBjdXN0b20gbWF0LW9wdGlvbiBjbGFzcyBpZiB0aGUgY29tcG9uZW50IHdhcyBwbGFjZWQgaW5zaWRlIGEgbWF0LW9wdGlvblxyXG4gICAgaWYgKHRoaXMubWF0T3B0aW9uKSB7XHJcbiAgICAgIHRoaXMubWF0T3B0aW9uLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXRPcHRpb24uX2dldEhvc3RFbGVtZW50KCkuY2xhc3NMaXN0LmFkZCgnY29udGFpbnMtbWF0LXNlbGVjdC1zZWFyY2gnKTtcclxuICAgICAgdGhpcy5tYXRPcHRpb24uX2dldEhvc3RFbGVtZW50KCkuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCc8bmd4LW1hdC1zZWxlY3Qtc2VhcmNoPiBtdXN0IGJlIHBsYWNlZCBpbnNpZGUgYSA8bWF0LW9wdGlvbj4gZWxlbWVudCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHdoZW4gdGhlIHNlbGVjdCBkcm9wZG93biBwYW5lbCBpcyBvcGVuZWQgb3IgY2xvc2VkXHJcbiAgICB0aGlzLm1hdFNlbGVjdC5vcGVuZWRDaGFuZ2VcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgZGVsYXkoMSksXHJcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSlcclxuICAgICAgKVxyXG4gICAgICAuc3Vic2NyaWJlKChvcGVuZWQpID0+IHtcclxuICAgICAgICBpZiAob3BlbmVkKSB7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0V2lkdGgoKTtcclxuICAgICAgICAgIC8vIGZvY3VzIHRoZSBzZWFyY2ggZmllbGQgd2hlbiBvcGVuaW5nXHJcbiAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZUluaXRpYWxGb2N1cykge1xyXG4gICAgICAgICAgICB0aGlzLl9mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBjbGVhciBpdCB3aGVuIGNsb3NpbmdcclxuICAgICAgICAgIGlmICh0aGlzLmNsZWFyU2VhcmNoSW5wdXQpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIHNldCB0aGUgZmlyc3QgaXRlbSBhY3RpdmUgYWZ0ZXIgdGhlIG9wdGlvbnMgY2hhbmdlZFxyXG4gICAgdGhpcy5tYXRTZWxlY3Qub3BlbmVkQ2hhbmdlXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIHRha2UoMSksXHJcbiAgICAgICAgc3dpdGNoTWFwKChfKSA9PiB7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHRoaXMubWF0U2VsZWN0Lm9wdGlvbnM7XHJcblxyXG4gICAgICAgIC8vIENsb3N1cmUgdmFyaWFibGUgZm9yIHRyYWNraW5nIHRoZSBtb3N0IHJlY2VudCBmaXJzdCBvcHRpb24uXHJcbiAgICAgICAgLy8gSW4gb3JkZXIgdG8gYXZvaWQgYXZvaWQgY2F1c2luZyB0aGUgbGlzdCB0b1xyXG4gICAgICAgIC8vIHNjcm9sbCB0byB0aGUgdG9wIHdoZW4gb3B0aW9ucyBhcmUgYWRkZWQgdG8gdGhlIGJvdHRvbSBvZlxyXG4gICAgICAgIC8vIHRoZSBsaXN0IChlZzogaW5maW5pdGUgc2Nyb2xsKSwgd2UgY29tcGFyZSBvbmx5XHJcbiAgICAgICAgLy8gdGhlIGNoYW5nZXMgdG8gdGhlIGZpcnN0IG9wdGlvbnMgdG8gZGV0ZXJtaW5lIGlmIHdlXHJcbiAgICAgICAgLy8gc2hvdWxkIHNldCB0aGUgZmlyc3QgaXRlbSBhcyBhY3RpdmUuXHJcbiAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyB1bm5lY2Vzc2FyeSBzY3JvbGxpbmcgdG8gdGhlIHRvcCBvZiB0aGUgbGlzdFxyXG4gICAgICAgIC8vIHdoZW4gb3B0aW9ucyBhcmUgYXBwZW5kZWQsIGJ1dCBhbGxvd3MgdGhlIGZpcnN0IGl0ZW1cclxuICAgICAgICAvLyBpbiB0aGUgbGlzdCB0byBiZSBzZXQgYXMgYWN0aXZlIGJ5IGRlZmF1bHQgd2hlbiB0aGVyZVxyXG4gICAgICAgIC8vIGlzIG5vIGFjdGl2ZSBzZWxlY3Rpb25cclxuICAgICAgICBsZXQgcHJldmlvdXNGaXJzdE9wdGlvbiA9IHRoaXMuX29wdGlvbnMudG9BcnJheSgpW3RoaXMuZ2V0T3B0aW9uc0xlbmd0aE9mZnNldCgpXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnMuY2hhbmdlc1xyXG4gICAgICAgICAgLnBpcGUodGFwKCgpID0+IHtcclxuICAgICAgICAgICAgLy8gYXZvaWQgXCJleHByZXNzaW9uIGhhcyBiZWVuIGNoYW5nZWRcIiBlcnJvclxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRoZSBRdWVyeUxpc3QgdG8gYW4gYXJyYXlcclxuICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucz8udG9BcnJheSgpID8/IFtdO1xyXG5cclxuICAgICAgICAgICAgICAvLyBUaGUgdHJ1ZSBmaXJzdCBpdGVtIGlzIG9mZnNldCBieSAxXHJcbiAgICAgICAgICAgICAgY29uc3QgY3VycmVudEZpcnN0T3B0aW9uID0gb3B0aW9uc1t0aGlzLmdldE9wdGlvbnNMZW5ndGhPZmZzZXQoKV07XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGtleU1hbmFnZXIgPSB0aGlzLm1hdFNlbGVjdC5fa2V5TWFuYWdlcjtcclxuICAgICAgICAgICAgICBpZiAoa2V5TWFuYWdlciAmJiB0aGlzLm1hdFNlbGVjdC5wYW5lbE9wZW4pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgZmlyc3QgaXRlbSBhY3RpdmUgYW5kIGlucHV0IHdpZHRoXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBmaXJzdCBvcHRpb24gaW4gdGhlc2UgY2hhbmdlcyBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgcHJldmlvdXMuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdE9wdGlvbklzQ2hhbmdlZCA9ICF0aGlzLm1hdFNlbGVjdC5jb21wYXJlV2l0aChwcmV2aW91c0ZpcnN0T3B0aW9uLCBjdXJyZW50Rmlyc3RPcHRpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENBU0U6IFRoZSBmaXJzdCBvcHRpb24gaXMgZGlmZmVyZW50IG5vdy5cclxuICAgICAgICAgICAgICAgIC8vIEluZGljaWF0ZXMgd2Ugc2hvdWxkIHNldCBpdCBhcyBhY3RpdmUgYW5kIHNjcm9sbCB0byB0aGUgdG9wLlxyXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0T3B0aW9uSXNDaGFuZ2VkXHJcbiAgICAgICAgICAgICAgICAgIHx8ICFrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1cclxuICAgICAgICAgICAgICAgICAgfHwgIW9wdGlvbnMuZmluZChvcHRpb24gPT4gdGhpcy5tYXRTZWxlY3QuY29tcGFyZVdpdGgob3B0aW9uLCBrZXlNYW5hZ2VyLmFjdGl2ZUl0ZW0pKSkge1xyXG4gICAgICAgICAgICAgICAgICBrZXlNYW5hZ2VyLnNldEZpcnN0SXRlbUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHdhaXQgZm9yIHBhbmVsIHdpZHRoIGNoYW5nZXNcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0V2lkdGgoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgLy8gVXBkYXRlIG91ciByZWZlcmVuY2VcclxuICAgICAgICAgICAgICBwcmV2aW91c0ZpcnN0T3B0aW9uID0gY3VycmVudEZpcnN0T3B0aW9uO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pKTtcclxuICAgICAgICB9KVxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKCk7XHJcblxyXG4gICAgLy8gYWRkIG9yIHJlbW92ZSBjc3MgY2xhc3MgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdG8gc2hvdyB0aGUgbm8gZW50cmllcyBmb3VuZCBtZXNzYWdlXHJcbiAgICAvLyBub3RlOiB0aGlzIGlzIGhhY2t5XHJcbiAgICB0aGlzLl9zaG93Tm9FbnRyaWVzRm91bmQkLnBpcGUoXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpXHJcbiAgICApLnN1YnNjcmliZShzaG93Tm9FbnRyaWVzRm91bmQgPT4ge1xyXG4gICAgICAvLyBzZXQgbm8gZW50cmllcyBmb3VuZCBjbGFzcyBvbiBtYXQgb3B0aW9uXHJcbiAgICAgIGlmICh0aGlzLm1hdE9wdGlvbikge1xyXG4gICAgICAgIGlmIChzaG93Tm9FbnRyaWVzRm91bmQpIHtcclxuICAgICAgICAgIHRoaXMubWF0T3B0aW9uLl9nZXRIb3N0RWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoJ21hdC1zZWxlY3Qtc2VhcmNoLW5vLWVudHJpZXMtZm91bmQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5tYXRPcHRpb24uX2dldEhvc3RFbGVtZW50KCkuY2xhc3NMaXN0LnJlbW92ZSgnbWF0LXNlbGVjdC1zZWFyY2gtbm8tZW50cmllcy1mb3VuZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gcmVzaXplIHRoZSBpbnB1dCB3aWR0aCB3aGVuIHRoZSB2aWV3cG9ydCBpcyByZXNpemVkLCBpLmUuIHRoZSB0cmlnZ2VyIHdpZHRoIGNvdWxkIHBvdGVudGlhbGx5IGJlIHJlc2l6ZWRcclxuICAgIHRoaXMuX3ZpZXdwb3J0UnVsZXIuY2hhbmdlKClcclxuICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX29uRGVzdHJveSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLm1hdFNlbGVjdC5wYW5lbE9wZW4pIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXRXaWR0aCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgdGhpcy5pbml0TXVsdGlwbGVIYW5kbGluZygpO1xyXG5cclxuICAgIHRoaXMub3B0aW9uc0xpc3QkLnBpcGUoXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpXHJcbiAgICApLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIC8vIHVwZGF0ZSB2aWV3IHdoZW4gYXZhaWxhYmxlIG9wdGlvbnMgY2hhbmdlXHJcbiAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIF9lbWl0U2VsZWN0QWxsQm9vbGVhblRvUGFyZW50KHN0YXRlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLnRvZ2dsZUFsbC5lbWl0KHN0YXRlKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fb25EZXN0cm95Lm5leHQoKTtcclxuICAgIHRoaXMuX29uRGVzdHJveS5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgX2lzVG9nZ2xlQWxsQ2hlY2tib3hWaXNpYmxlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICh0aGlzLm1hdFNlbGVjdD8ubXVsdGlwbGUpICYmIHRoaXMuc2hvd1RvZ2dsZUFsbENoZWNrYm94O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlcyB0aGUga2V5IGRvd24gZXZlbnQgd2l0aCBNYXRMZWdhY3lTZWxlY3QuXHJcbiAgICogQWxsb3dzIGUuZy4gc2VsZWN0aW5nIHdpdGggZW50ZXIga2V5LCBuYXZpZ2F0aW9uIHdpdGggYXJyb3cga2V5cywgZXRjLlxyXG4gICAqIEBwYXJhbSBldmVudFxyXG4gICAqL1xyXG4gIF9oYW5kbGVLZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAvLyBQcmV2ZW50IHByb3BhZ2F0aW9uIGZvciBhbGwgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMgaW4gb3JkZXIgdG8gYXZvaWQgc2VsZWN0aW9uIGlzc3Vlc1xyXG4gICAgaWYgKChldmVudC5rZXkgJiYgZXZlbnQua2V5Lmxlbmd0aCA9PT0gMSkgfHxcclxuICAgICAgKGV2ZW50LmtleUNvZGUgPj0gQSAmJiBldmVudC5rZXlDb2RlIDw9IFopIHx8XHJcbiAgICAgIChldmVudC5rZXlDb2RlID49IFpFUk8gJiYgZXZlbnQua2V5Q29kZSA8PSBOSU5FKSB8fFxyXG4gICAgICAoZXZlbnQua2V5Q29kZSA9PT0gU1BBQ0UpXHJcbiAgICAgIHx8ICh0aGlzLnByZXZlbnRIb21lRW5kS2V5UHJvcGFnYXRpb24gJiYgKGV2ZW50LmtleUNvZGUgPT09IEhPTUUgfHwgZXZlbnQua2V5Q29kZSA9PT0gRU5EKSlcclxuICAgICkge1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoKHRoaXMubWF0U2VsZWN0Py5tdWx0aXBsZSkgJiYgZXZlbnQua2V5ICYmIGV2ZW50LmtleUNvZGUgPT09IEVOVEVSKSB7XHJcbiAgICAgIC8vIFJlZ2FpbiBmb2N1cyBhZnRlciBtdWx0aXNlbGVjdCwgc28gd2UgY2FuIGZ1cnRoZXIgdHlwZVxyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX2ZvY3VzKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNwZWNpYWwgY2FzZSBpZiBjbGljayBFc2NhcGUsIGlmIGlucHV0IGlzIGVtcHR5LCBjbG9zZSB0aGUgZHJvcGRvd24sIGlmIG5vdCwgZW1wdHkgb3V0IHRoZSBzZWFyY2ggZmllbGRcclxuICAgIGlmICh0aGlzLmVuYWJsZUNsZWFyT25Fc2NhcGVQcmVzc2VkID09PSB0cnVlICYmIGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiB0aGlzLnZhbHVlKSB7XHJcbiAgICAgIHRoaXMuX3Jlc2V0KHRydWUpO1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgdGhlIGtleSB1cCBldmVudCB3aXRoIE1hdExlZ2FjeVNlbGVjdC5cclxuICAgKiBBbGxvd3MgZS5nLiB0aGUgYW5ub3VuY2luZyBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZURlc2NlbmRhbnQgYnkgc2NyZWVuIHJlYWRlcnMuXHJcbiAgICovXHJcbiAgX2hhbmRsZUtleXVwKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gVVBfQVJST1cgfHwgZXZlbnQua2V5Q29kZSA9PT0gRE9XTl9BUlJPVykge1xyXG4gICAgICBjb25zdCBhcmlhQWN0aXZlRGVzY2VuZGFudElkID0gdGhpcy5tYXRTZWxlY3QuX2dldEFyaWFBY3RpdmVEZXNjZW5kYW50KCk7XHJcbiAgICAgIGNvbnN0IG9wdGlvbkFycmF5ID0gdGhpcy5fb3B0aW9ucz8udG9BcnJheSgpID8/IFtdO1xyXG4gICAgICBjb25zdCBpbmRleCA9IG9wdGlvbkFycmF5LmZpbmRJbmRleChpdGVtID0+IGl0ZW0gJiYgaXRlbVsnaWQnXSAmJiBpdGVtWydpZCddID09PSBhcmlhQWN0aXZlRGVzY2VuZGFudElkKTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIHRoaXMudW5zZWxlY3RBY3RpdmVEZXNjZW5kYW50KCk7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVEZXNjZW5kYW50ID0gb3B0aW9uQXJyYXlbaW5kZXhdLl9nZXRIb3N0RWxlbWVudCgpO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlRGVzY2VuZGFudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtc2VsZWN0ZWQnLCAndHJ1ZScpO1xyXG4gICAgICAgIHRoaXMuc2VhcmNoU2VsZWN0SW5wdXQubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtYWN0aXZlZGVzY2VuZGFudCcsIGFyaWFBY3RpdmVEZXNjZW5kYW50SWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX2xhc3RFeHRlcm5hbElucHV0VmFsdWUgPSB2YWx1ZTtcclxuICAgIHRoaXMuX2Zvcm1Db250cm9sLnNldFZhbHVlKHZhbHVlKTtcclxuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgfVxyXG5cclxuICBvbkJsdXIoKSB7XHJcbiAgICB0aGlzLnVuc2VsZWN0QWN0aXZlRGVzY2VuZGFudCgpO1xyXG4gICAgdGhpcy5vblRvdWNoZWQoKTtcclxuICB9XHJcblxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkKSB7XHJcbiAgICB0aGlzLl9mb3JtQ29udHJvbC52YWx1ZUNoYW5nZXMucGlwZShcclxuICAgICAgZmlsdGVyKHZhbHVlID0+IHZhbHVlICE9PSB0aGlzLl9sYXN0RXh0ZXJuYWxJbnB1dFZhbHVlKSxcclxuICAgICAgdGFwKCgpID0+IHRoaXMuX2xhc3RFeHRlcm5hbElucHV0VmFsdWUgPSB1bmRlZmluZWQpLFxyXG4gICAgICB0YWtlVW50aWwodGhpcy5fb25EZXN0cm95KVxyXG4gICAgKS5zdWJzY3JpYmUoZm4pO1xyXG4gIH1cclxuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcclxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogRnVuY3Rpb24pIHtcclxuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb2N1c2VzIHRoZSBzZWFyY2ggaW5wdXQgZmllbGRcclxuICAgKi9cclxuICBwdWJsaWMgX2ZvY3VzKCkge1xyXG4gICAgaWYgKCF0aGlzLnNlYXJjaFNlbGVjdElucHV0IHx8ICF0aGlzLm1hdFNlbGVjdC5wYW5lbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBzYXZlIGFuZCByZXN0b3JlIHNjcm9sbFRvcCBvZiBwYW5lbCwgc2luY2UgaXQgd2lsbCBiZSByZXNldCBieSBmb2N1cygpXHJcbiAgICAvLyBub3RlOiB0aGlzIGlzIGhhY2t5XHJcbiAgICBjb25zdCBwYW5lbCA9IHRoaXMubWF0U2VsZWN0LnBhbmVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICBjb25zdCBzY3JvbGxUb3AgPSBwYW5lbC5zY3JvbGxUb3A7XHJcblxyXG4gICAgLy8gZm9jdXNcclxuICAgIHRoaXMuc2VhcmNoU2VsZWN0SW5wdXQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xyXG5cclxuICAgIHBhbmVsLnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgY3VycmVudCBzZWFyY2ggdmFsdWVcclxuICAgKiBAcGFyYW0gZm9jdXMgd2hldGhlciB0byBmb2N1cyBhZnRlciByZXNldHRpbmdcclxuICAgKi9cclxuICBwdWJsaWMgX3Jlc2V0KGZvY3VzPzogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZm9ybUNvbnRyb2wuc2V0VmFsdWUoJycpO1xyXG4gICAgaWYgKGZvY3VzKSB7XHJcbiAgICAgIHRoaXMuX2ZvY3VzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgaGFuZGxpbmcgPG1hdC1zZWxlY3QgW211bHRpcGxlXT1cInRydWVcIj5cclxuICAgKiBOb3RlOiB0byBpbXByb3ZlIHRoaXMgY29kZSwgbWF0LXNlbGVjdCBzaG91bGQgYmUgZXh0ZW5kZWQgdG8gYWxsb3cgZGlzYWJsaW5nIHJlc2V0dGluZyB0aGUgc2VsZWN0aW9uIHdoaWxlIGZpbHRlcmluZy5cclxuICAgKi9cclxuICBwcml2YXRlIGluaXRNdWx0aXBsZUhhbmRsaW5nKCkge1xyXG4gICAgaWYgKHRoaXMubWF0U2VsZWN0Lm5nQ29udHJvbCA9PT0gbnVsbCkge1xyXG4gICAgICBpZiAodGhpcy5tYXRTZWxlY3Q/Lm11bHRpcGxlKSB7XHJcbiAgICAgICAgLy8gbm90ZTogdGhlIGFjY2VzcyB0byBNYXRMZWdhY3lTZWxlY3QubmdDb250cm9sIChpbnN0ZWFkIG9mIE1hdExlZ2FjeVNlbGVjdC52YWx1ZSAvIE1hdExlZ2FjeVNlbGVjdC52YWx1ZUNoYW5nZXMpXHJcbiAgICAgICAgLy8gaXMgbmVjZXNzYXJ5IHRvIHByb3Blcmx5IHdvcmsgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuXHJcbiAgICAgICAgY29uc29sZS5lcnJvcigndGhlIG1hdC1zZWxlY3QgY29udGFpbmluZyBuZ3gtbWF0LXNlbGVjdC1zZWFyY2ggbXVzdCBoYXZlIGEgbmdNb2RlbCBvciBmb3JtQ29udHJvbCBkaXJlY3RpdmUgd2hlbiBtdWx0aXBsZT10cnVlJyk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmFsdWVDaGFuZ2VzID0gdGhpcy5tYXRTZWxlY3QubmdDb250cm9sLnZhbHVlQ2hhbmdlcztcclxuICAgIGlmICh2YWx1ZUNoYW5nZXMgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICAvLyBpZiA8bWF0LXNlbGVjdCBbbXVsdGlwbGVdPVwidHJ1ZVwiPlxyXG4gICAgLy8gc3RvcmUgcHJldmlvdXNseSBzZWxlY3RlZCB2YWx1ZXMgYW5kIHJlc3RvcmUgdGhlbSB3aGVuIHRoZXkgYXJlIGRlc2VsZWN0ZWRcclxuICAgIC8vIGJlY2F1c2UgdGhlIG9wdGlvbiBpcyBub3QgYXZhaWxhYmxlIHdoaWxlIHdlIGFyZSBjdXJyZW50bHkgZmlsdGVyaW5nXHJcbiAgICB0aGlzLnByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMgPSB0aGlzLm1hdFNlbGVjdC5uZ0NvbnRyb2wudmFsdWU7XHJcblxyXG4gICAgdmFsdWVDaGFuZ2VzXHJcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKCh2YWx1ZXMpID0+IHtcclxuICAgICAgICBsZXQgcmVzdG9yZVNlbGVjdGVkVmFsdWVzID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMubWF0U2VsZWN0Py5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgaWYgKCh0aGlzLmFsd2F5c1Jlc3RvcmVTZWxlY3RlZE9wdGlvbnNNdWx0aSB8fCAodGhpcy5fZm9ybUNvbnRyb2wudmFsdWUgJiYgdGhpcy5fZm9ybUNvbnRyb2wudmFsdWUubGVuZ3RoKSlcclxuICAgICAgICAgICAgJiYgdGhpcy5wcmV2aW91c1NlbGVjdGVkVmFsdWVzICYmIEFycmF5LmlzQXJyYXkodGhpcy5wcmV2aW91c1NlbGVjdGVkVmFsdWVzKSkge1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCAhQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XHJcbiAgICAgICAgICAgICAgdmFsdWVzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgb3B0aW9uVmFsdWVzID0gdGhpcy5tYXRTZWxlY3Qub3B0aW9ucy5tYXAob3B0aW9uID0+IG9wdGlvbi52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzU2VsZWN0ZWRWYWx1ZXMuZm9yRWFjaChwcmV2aW91c1ZhbHVlID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICAgICAgICBpZiAoIXZhbHVlcy5zb21lKCh2OiBhbnkpID0+IHRoaXMubWF0U2VsZWN0LmNvbXBhcmVXaXRoKHYsIHByZXZpb3VzVmFsdWUpKVxyXG4gICAgICAgICAgICAgICAgJiYgIW9wdGlvblZhbHVlcy5zb21lKHYgPT4gdGhpcy5tYXRTZWxlY3QuY29tcGFyZVdpdGgodiwgcHJldmlvdXNWYWx1ZSkpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gaWYgYSB2YWx1ZSB0aGF0IHdhcyBzZWxlY3RlZCBiZWZvcmUgaXMgZGVzZWxlY3RlZCBhbmQgbm90IGZvdW5kIGluIHRoZSBvcHRpb25zLCBpdCB3YXMgZGVzZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgLy8gZHVlIHRvIHRoZSBmaWx0ZXJpbmcsIHNvIHdlIHJlc3RvcmUgaXQuXHJcbiAgICAgICAgICAgICAgICB2YWx1ZXMucHVzaChwcmV2aW91c1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlc3RvcmVTZWxlY3RlZFZhbHVlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c1NlbGVjdGVkVmFsdWVzID0gdmFsdWVzO1xyXG5cclxuICAgICAgICBpZiAocmVzdG9yZVNlbGVjdGVkVmFsdWVzKSB7XHJcbiAgICAgICAgICB0aGlzLm1hdFNlbGVjdC5fb25DaGFuZ2UodmFsdWVzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogIFNldCB0aGUgd2lkdGggb2YgdGhlIGlubmVyU2VsZWN0U2VhcmNoIHRvIGZpdCBldmVuIGN1c3RvbSBzY3JvbGxiYXJzXHJcbiAgICogIEFuZCBzdXBwb3J0IGFsbCBPcGVyYXRpb24gU3lzdGVtc1xyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVJbnB1dFdpZHRoKCkge1xyXG4gICAgaWYgKCF0aGlzLmlubmVyU2VsZWN0U2VhcmNoIHx8ICF0aGlzLmlubmVyU2VsZWN0U2VhcmNoLm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IHRoaXMuaW5uZXJTZWxlY3RTZWFyY2gubmF0aXZlRWxlbWVudDtcclxuICAgIGxldCBwYW5lbEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG4gICAgd2hpbGUgKChlbGVtZW50ID0gZWxlbWVudD8ucGFyZW50RWxlbWVudCA/PyBudWxsKSAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdC1zZWxlY3QtcGFuZWwnKSkge1xyXG4gICAgICAgIHBhbmVsRWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChwYW5lbEVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5pbm5lclNlbGVjdFNlYXJjaC5uYXRpdmVFbGVtZW50LnN0eWxlLndpZHRoID0gcGFuZWxFbGVtZW50LmNsaWVudFdpZHRoICsgJ3B4JztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB0aGUgb2Zmc2V0IHRvIGxlbmd0aCB0aGF0IGNhbiBiZSBjYXVzZWQgYnkgdGhlIG9wdGlvbmFsIE1hdExlZ2FjeU9wdGlvbiB1c2VkIGFzIGEgc2VhcmNoIGlucHV0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0T3B0aW9uc0xlbmd0aE9mZnNldCgpOiBudW1iZXIge1xyXG4gICAgaWYgKHRoaXMubWF0T3B0aW9uKSB7XHJcbiAgICAgIHJldHVybiAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVuc2VsZWN0QWN0aXZlRGVzY2VuZGFudCgpIHtcclxuICAgIHRoaXMuYWN0aXZlRGVzY2VuZGFudD8ucmVtb3ZlQXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJyk7XHJcbiAgICB0aGlzLnNlYXJjaFNlbGVjdElucHV0Lm5hdGl2ZUVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKTtcclxuICB9XHJcblxyXG59XHJcbiIsIjwhLS1cclxuQ29weXJpZ2h0IChjKSAyMDE4IEJpdGhvc3QgR21iSCBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG5cclxuVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4tLT5cclxuPCEtLSBQbGFjZWhvbGRlciB0byBhZGp1c3QgdmVydGljYWwgb2Zmc2V0IG9mIHRoZSBtYXQtb3B0aW9uIGVsZW1lbnRzIC0tPlxyXG48aW5wdXQgbWF0SW5wdXQgY2xhc3M9XCJtYXQtc2VsZWN0LXNlYXJjaC1pbnB1dCBtYXQtc2VsZWN0LXNlYXJjaC1oaWRkZW5cIi8+XHJcblxyXG48IS0tIE5vdGU6IHRoZSAgbWF0LWRhdGVwaWNrZXItY29udGVudCBtYXQtdGFiLWhlYWRlciBhcmUgbmVlZGVkIHRvIGluaGVyaXQgdGhlIG1hdGVyaWFsIHRoZW1lIGNvbG9ycywgc2VlIFBSICMyMiAtLT5cclxuPGRpdlxyXG4gICAgICAjaW5uZXJTZWxlY3RTZWFyY2hcclxuICAgICAgY2xhc3M9XCJtYXQtc2VsZWN0LXNlYXJjaC1pbm5lciBtYXQtdHlwb2dyYXBoeSBtYXQtZGF0ZXBpY2tlci1jb250ZW50IG1hdC10YWItaGVhZGVyXCJcclxuICAgICAgW25nQ2xhc3NdPVwieydtYXQtc2VsZWN0LXNlYXJjaC1pbm5lci1tdWx0aXBsZSc6IG1hdFNlbGVjdC5tdWx0aXBsZSwgJ21hdC1zZWxlY3Qtc2VhcmNoLWlubmVyLXRvZ2dsZS1hbGwnOiBfaXNUb2dnbGVBbGxDaGVja2JveFZpc2libGUoKSB9XCI+XHJcblxyXG4gIDxtYXQtY2hlY2tib3ggKm5nSWY9XCJfaXNUb2dnbGVBbGxDaGVja2JveFZpc2libGUoKVwiXHJcbiAgICAgICAgICAgICAgICBbY29sb3JdPVwibWF0Rm9ybUZpZWxkPy5jb2xvclwiXHJcbiAgICAgICAgICAgICAgICBjbGFzcz1cIm1hdC1zZWxlY3Qtc2VhcmNoLXRvZ2dsZS1hbGwtY2hlY2tib3hcIlxyXG4gICAgICAgICAgICAgICAgW2NoZWNrZWRdPVwidG9nZ2xlQWxsQ2hlY2tib3hDaGVja2VkXCJcclxuICAgICAgICAgICAgICAgIFtpbmRldGVybWluYXRlXT1cInRvZ2dsZUFsbENoZWNrYm94SW5kZXRlcm1pbmF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbbWF0VG9vbHRpcF09XCJ0b2dnbGVBbGxDaGVja2JveFRvb2x0aXBNZXNzYWdlXCJcclxuICAgICAgICAgICAgICAgIG1hdFRvb2x0aXBDbGFzcz1cIm5neC1tYXQtc2VsZWN0LXNlYXJjaC10b2dnbGUtYWxsLXRvb2x0aXBcIlxyXG4gICAgICAgICAgICAgICAgW21hdFRvb2x0aXBQb3NpdGlvbl09XCJ0b2dnbGVBbGxDaGVja2JveFRvb2x0aXBQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICAoY2hhbmdlKT1cIl9lbWl0U2VsZWN0QWxsQm9vbGVhblRvUGFyZW50KCRldmVudC5jaGVja2VkKVwiXHJcbiAgPjwvbWF0LWNoZWNrYm94PlxyXG5cclxuICA8aW5wdXQgY2xhc3M9XCJtYXQtc2VsZWN0LXNlYXJjaC1pbnB1dFwiXHJcbiAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXHJcbiAgICAgICAgIFt0eXBlXT1cInR5cGVcIlxyXG4gICAgICAgICBbZm9ybUNvbnRyb2xdPVwiX2Zvcm1Db250cm9sXCJcclxuICAgICAgICAgI3NlYXJjaFNlbGVjdElucHV0XHJcbiAgICAgICAgIChrZXlkb3duKT1cIl9oYW5kbGVLZXlkb3duKCRldmVudClcIlxyXG4gICAgICAgICAoa2V5dXApPVwiX2hhbmRsZUtleXVwKCRldmVudClcIlxyXG4gICAgICAgICAoYmx1cik9XCJvbkJsdXIoKVwiXHJcbiAgICAgICAgIFtwbGFjZWhvbGRlcl09XCJwbGFjZWhvbGRlckxhYmVsXCJcclxuICAgICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJhcmlhTGFiZWxcIlxyXG4gIC8+XHJcbiAgPG1hdC1zcGlubmVyICpuZ0lmPVwic2VhcmNoaW5nXCJcclxuICAgICAgICAgIGNsYXNzPVwibWF0LXNlbGVjdC1zZWFyY2gtc3Bpbm5lclwiXHJcbiAgICAgICAgICBkaWFtZXRlcj1cIjE2XCI+PC9tYXQtc3Bpbm5lcj5cclxuXHJcbiAgPGJ1dHRvbiAqbmdJZj1cIiFoaWRlQ2xlYXJTZWFyY2hCdXR0b24gJiYgdmFsdWUgJiYgIXNlYXJjaGluZ1wiXHJcbiAgICAgICAgICBtYXQtaWNvbi1idXR0b25cclxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJDbGVhclwiXHJcbiAgICAgICAgICAoY2xpY2spPVwiX3Jlc2V0KHRydWUpXCJcclxuICAgICAgICAgIGNsYXNzPVwibWF0LXNlbGVjdC1zZWFyY2gtY2xlYXJcIj5cclxuICAgIDxuZy1jb250ZW50ICpuZ0lmPVwiY2xlYXJJY29uOyBlbHNlIGRlZmF1bHRJY29uXCIgc2VsZWN0PVwiW25neE1hdFNlbGVjdFNlYXJjaENsZWFyXVwiPjwvbmctY29udGVudD5cclxuICAgIDxuZy10ZW1wbGF0ZSAjZGVmYXVsdEljb24+XHJcbiAgICAgIDxtYXQtaWNvbiBbc3ZnSWNvbl09XCJjbG9zZVN2Z0ljb24gPz8gJydcIj5cclxuICAgICAgICB7eyFjbG9zZVN2Z0ljb24gPyBjbG9zZUljb24gOiBudWxsfX1cclxuICAgICAgPC9tYXQtaWNvbj5cclxuICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgPC9idXR0b24+XHJcblxyXG4gIDxuZy1jb250ZW50IHNlbGVjdD1cIi5tYXQtc2VsZWN0LXNlYXJjaC1jdXN0b20taGVhZGVyLWNvbnRlbnRcIj48L25nLWNvbnRlbnQ+XHJcblxyXG4gIDxtYXQtZGl2aWRlcj48L21hdC1kaXZpZGVyPlxyXG48L2Rpdj5cclxuXHJcbjxkaXYgKm5nSWY9XCJfc2hvd05vRW50cmllc0ZvdW5kJCB8IGFzeW5jXCJcclxuICAgICBjbGFzcz1cIm1hdC1zZWxlY3Qtc2VhcmNoLW5vLWVudHJpZXMtZm91bmRcIj5cclxuICA8bmctY29udGVudCAqbmdJZj1cIm5vRW50cmllc0ZvdW5kOyBlbHNlIGRlZmF1bHROb0VudHJpZXNGb3VuZFwiXHJcbiAgICAgICAgICAgICAgc2VsZWN0PVwiW25neE1hdFNlbGVjdE5vRW50cmllc0ZvdW5kXVwiPjwvbmctY29udGVudD5cclxuICA8bmctdGVtcGxhdGUgI2RlZmF1bHROb0VudHJpZXNGb3VuZD57e25vRW50cmllc0ZvdW5kTGFiZWx9fTwvbmctdGVtcGxhdGU+XHJcbjwvZGl2PlxyXG4iXX0=