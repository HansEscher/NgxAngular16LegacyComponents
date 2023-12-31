import { ViewportRuler } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy, OnInit, QueryList } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { MatLegacyOption } from '@angular/material/legacy-core';
import { MatLegacyFormField as MatFormField } from '@angular/material/legacy-form-field';
import { MatLegacySelect } from '@angular/material/legacy-select';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSelectSearchClearDirective } from './mat-select-search-clear.directive';
import { MatSelectSearchOptions } from './default-options';
import { MatSelectNoEntriesFoundDirective } from './mat-select-no-entries-found.directive';
import * as i0 from "@angular/core";
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
export declare class MatSelectSearchComponent implements OnInit, OnDestroy, ControlValueAccessor {
    matSelect: MatLegacySelect;
    private matOption;
    changeDetectorRef: ChangeDetectorRef;
    private _viewportRuler;
    matFormField: MatFormField | null;
    /** Label of the search placeholder */
    placeholderLabel: string;
    /** Type of the search input field */
    type: string;
    /** Font-based icon used for displaying Close-Icon */
    closeIcon: string;
    /** Svg-based icon used for displaying Close-Icon. If set, closeIcon is overridden */
    closeSvgIcon?: string;
    /** Label to be shown when no entries are found. Set to null if no message should be shown. */
    noEntriesFoundLabel: string;
    /**
      * Whether or not the search field should be cleared after the dropdown menu is closed.
      * Useful for server-side filtering. See [#3](https://github.com/bithost-gmbh/ngx-mat-select-search/issues/3)
      */
    clearSearchInput: boolean;
    /** Whether to show the search-in-progress indicator */
    searching: boolean;
    /** Disables initial focusing of the input field */
    disableInitialFocus: boolean;
    /** Enable clear input on escape pressed */
    enableClearOnEscapePressed: boolean;
    /**
     * Prevents home / end key being propagated to mat-select,
     * allowing to move the cursor within the search input instead of navigating the options
     */
    preventHomeEndKeyPropagation: boolean;
    /** Disables scrolling to active options when option list changes. Useful for server-side search */
    disableScrollToActiveOnOptionsChanged: boolean;
    /** Adds 508 screen reader support for search box */
    ariaLabel: string;
    /** Whether to show Select All Checkbox (for mat-select[multi=true]) */
    showToggleAllCheckbox: boolean;
    /** select all checkbox checked state */
    toggleAllCheckboxChecked: boolean;
    /** select all checkbox indeterminate state */
    toggleAllCheckboxIndeterminate: boolean;
    /** Display a message in a tooltip on the toggle-all checkbox */
    toggleAllCheckboxTooltipMessage: string;
    /** Define the position of the tooltip on the toggle-all checkbox. */
    toggleAllCheckboxTooltipPosition: 'left' | 'right' | 'above' | 'below' | 'before' | 'after';
    /** Show/Hide the search clear button of the search input */
    hideClearSearchButton: boolean;
    /**
     * Always restore selected options on selectionChange for mode multi (e.g. for lazy loading/infinity scrolling).
     * Defaults to false, so selected options are only restored while filtering is active.
     */
    alwaysRestoreSelectedOptionsMulti: boolean;
    /** Output emitter to send to parent component with the toggle all boolean */
    toggleAll: EventEmitter<boolean>;
    /** Reference to the search input field */
    searchSelectInput: ElementRef;
    /** Reference to the search input field */
    innerSelectSearch: ElementRef;
    /** Reference to custom search input clear icon */
    clearIcon: MatSelectSearchClearDirective;
    /** Reference to custom no entries found element */
    noEntriesFound: MatSelectNoEntriesFoundDirective;
    /** Current search value */
    get value(): string;
    private _lastExternalInputValue;
    onTouched: Function;
    /** Reference to the MatLegacySelect options */
    set _options(_options: QueryList<MatLegacyOption> | null);
    get _options(): QueryList<MatLegacyOption> | null;
    _options$: BehaviorSubject<QueryList<MatLegacyOption> | null>;
    private optionsList$;
    private optionsLength$;
    /** Previously selected values when using <mat-select [multiple]="true">*/
    private previousSelectedValues;
    _formControl: FormControl<string>;
    /** whether to show the no entries found message */
    _showNoEntriesFound$: Observable<boolean>;
    /** Subject that emits when the component has been destroyed. */
    private _onDestroy;
    /** Reference to active descendant for ARIA Support. */
    private activeDescendant;
    constructor(matSelect: MatLegacySelect, matOption: MatLegacyOption, changeDetectorRef: ChangeDetectorRef, _viewportRuler: ViewportRuler, matFormField?: MatFormField | null, defaultOptions?: MatSelectSearchOptions);
    private applyDefaultOptions;
    ngOnInit(): void;
    _emitSelectAllBooleanToParent(state: boolean): void;
    ngOnDestroy(): void;
    _isToggleAllCheckboxVisible(): boolean;
    /**
     * Handles the key down event with MatLegacySelect.
     * Allows e.g. selecting with enter key, navigation with arrow keys, etc.
     * @param event
     */
    _handleKeydown(event: KeyboardEvent): void;
    /**
     * Handles the key up event with MatLegacySelect.
     * Allows e.g. the announcing of the currently activeDescendant by screen readers.
     */
    _handleKeyup(event: KeyboardEvent): void;
    writeValue(value: string): void;
    onBlur(): void;
    registerOnChange(fn: (value: string) => void): void;
    registerOnTouched(fn: Function): void;
    /**
     * Focuses the search input field
     */
    _focus(): void;
    /**
     * Resets the current search value
     * @param focus whether to focus after resetting
     */
    _reset(focus?: boolean): void;
    /**
     * Initializes handling <mat-select [multiple]="true">
     * Note: to improve this code, mat-select should be extended to allow disabling resetting the selection while filtering.
     */
    private initMultipleHandling;
    /**
     *  Set the width of the innerSelectSearch to fit even custom scrollbars
     *  And support all Operation Systems
     */
    updateInputWidth(): void;
    /**
     * Determine the offset to length that can be caused by the optional MatLegacyOption used as a search input.
     */
    private getOptionsLengthOffset;
    private unselectActiveDescendant;
    static ɵfac: i0.ɵɵFactoryDeclaration<MatSelectSearchComponent, [null, { optional: true; host: true; skipSelf: true; }, null, null, { optional: true; }, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MatSelectSearchComponent, "ngx-mat-select-search", never, { "placeholderLabel": { "alias": "placeholderLabel"; "required": false; }; "type": { "alias": "type"; "required": false; }; "closeIcon": { "alias": "closeIcon"; "required": false; }; "closeSvgIcon": { "alias": "closeSvgIcon"; "required": false; }; "noEntriesFoundLabel": { "alias": "noEntriesFoundLabel"; "required": false; }; "clearSearchInput": { "alias": "clearSearchInput"; "required": false; }; "searching": { "alias": "searching"; "required": false; }; "disableInitialFocus": { "alias": "disableInitialFocus"; "required": false; }; "enableClearOnEscapePressed": { "alias": "enableClearOnEscapePressed"; "required": false; }; "preventHomeEndKeyPropagation": { "alias": "preventHomeEndKeyPropagation"; "required": false; }; "disableScrollToActiveOnOptionsChanged": { "alias": "disableScrollToActiveOnOptionsChanged"; "required": false; }; "ariaLabel": { "alias": "ariaLabel"; "required": false; }; "showToggleAllCheckbox": { "alias": "showToggleAllCheckbox"; "required": false; }; "toggleAllCheckboxChecked": { "alias": "toggleAllCheckboxChecked"; "required": false; }; "toggleAllCheckboxIndeterminate": { "alias": "toggleAllCheckboxIndeterminate"; "required": false; }; "toggleAllCheckboxTooltipMessage": { "alias": "toggleAllCheckboxTooltipMessage"; "required": false; }; "toggleAllCheckboxTooltipPosition": { "alias": "toggleAllCheckboxTooltipPosition"; "required": false; }; "hideClearSearchButton": { "alias": "hideClearSearchButton"; "required": false; }; "alwaysRestoreSelectedOptionsMulti": { "alias": "alwaysRestoreSelectedOptionsMulti"; "required": false; }; }, { "toggleAll": "toggleAll"; }, ["clearIcon", "noEntriesFound"], ["[ngxMatSelectSearchClear]", ".mat-select-search-custom-header-content", "[ngxMatSelectNoEntriesFound]"], false, never>;
}
