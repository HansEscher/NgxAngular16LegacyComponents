import { ChangeDetectorRef, Renderer2, AfterViewInit, OnDestroy, ElementRef, NgZone, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { IArea, IOutputData, IOutputAreaSizes, IDefaultOptions } from './interface';
import { SplitAreaDirective } from './split-area.directive';
import * as i0 from "@angular/core";
/**
 * angular-split
 *
 *
 *  PERCENT MODE ([unit]="'percent'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |       20                 30                 20                 15                 15      | <-- [size]="x"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)    calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0)
 * |     152px              228px              152px              114px              114px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *  flex-basis = calc( { area.size }% - { area.size/100 * nbGutter*gutterSize }px );
 *
 *
 *  PIXEL MODE ([unit]="'pixel'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |      100                250                 *                 150                100      | <-- [size]="y"
 * |               10px               10px               10px               10px               | <-- [gutterSize]="10"
 * |   0 0 100px          0 0 250px           1 1 auto          0 0 150px          0 0 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis)
 * |     100px              250px              200px              150px              100px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <-- el.getBoundingClientRect().width
 *
 */
export declare class SplitComponent implements AfterViewInit, OnDestroy {
    private ngZone;
    private elRef;
    private cdRef;
    private renderer;
    set direction(v: 'horizontal' | 'vertical');
    get direction(): 'horizontal' | 'vertical';
    set unit(v: 'percent' | 'pixel');
    get unit(): 'percent' | 'pixel';
    set gutterSize(v: number | null);
    get gutterSize(): number | null;
    set gutterStep(v: number);
    get gutterStep(): number;
    set restrictMove(v: boolean);
    get restrictMove(): boolean;
    set useTransition(v: boolean);
    get useTransition(): boolean;
    set disabled(v: boolean);
    get disabled(): boolean;
    set dir(v: 'ltr' | 'rtl');
    get dir(): 'ltr' | 'rtl';
    set gutterDblClickDuration(v: number);
    get gutterDblClickDuration(): number;
    gutterClickDeltaPx: number;
    gutterAriaLabel: string;
    get transitionEnd(): Observable<IOutputAreaSizes>;
    private _config;
    constructor(ngZone: NgZone, elRef: ElementRef, cdRef: ChangeDetectorRef, renderer: Renderer2, globalConfig: IDefaultOptions);
    private _direction;
    private _unit;
    private _gutterSize;
    private _gutterStep;
    private _restrictMove;
    private _useTransition;
    private _disabled;
    private _dir;
    private _gutterDblClickDuration;
    dragStart: EventEmitter<IOutputData>;
    dragEnd: EventEmitter<IOutputData>;
    gutterClick: EventEmitter<IOutputData>;
    gutterDblClick: EventEmitter<IOutputData>;
    private transitionEndSubscriber;
    private dragProgressSubject;
    dragProgress$: Observable<IOutputData>;
    private isDragging;
    private isWaitingClear;
    private isWaitingInitialMove;
    private dragListeners;
    private snapshot;
    private startPoint;
    private endPoint;
    readonly displayedAreas: Array<IArea>;
    private readonly hiddenAreas;
    private gutterEls;
    _clickTimeout: number | null;
    ngAfterViewInit(): void;
    private getNbGutters;
    addArea(component: SplitAreaDirective): void;
    removeArea(component: SplitAreaDirective): void;
    updateArea(component: SplitAreaDirective, resetOrders: boolean, resetSizes: boolean): void;
    showArea(component: SplitAreaDirective): void;
    hideArea(comp: SplitAreaDirective): void;
    getVisibleAreaSizes(): IOutputAreaSizes;
    setVisibleAreaSizes(sizes: IOutputAreaSizes): boolean;
    private build;
    private refreshStyleSizes;
    clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void;
    startKeyboardDrag(event: KeyboardEvent, gutterOrder: number, gutterNum: number): void;
    startMouseDrag(event: MouseEvent | TouchEvent, gutterOrder: number, gutterNum: number): void;
    private setupForDragEvent;
    private startDragging;
    private mouseDragEvent;
    private drag;
    private stopDragging;
    notify(type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd', gutterNum: number): void;
    ngOnDestroy(): void;
    collapseArea(comp: SplitAreaDirective, newSize: number, gutter: 'left' | 'right'): void;
    expandArea(comp: SplitAreaDirective): void;
    getAriaAreaSizeText(size: number | null): string | null;
    static ɵfac: i0.ɵɵFactoryDeclaration<SplitComponent, [null, null, null, null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SplitComponent, "as-split", ["asSplit"], { "direction": { "alias": "direction"; "required": false; }; "unit": { "alias": "unit"; "required": false; }; "gutterSize": { "alias": "gutterSize"; "required": false; }; "gutterStep": { "alias": "gutterStep"; "required": false; }; "restrictMove": { "alias": "restrictMove"; "required": false; }; "useTransition": { "alias": "useTransition"; "required": false; }; "disabled": { "alias": "disabled"; "required": false; }; "dir": { "alias": "dir"; "required": false; }; "gutterDblClickDuration": { "alias": "gutterDblClickDuration"; "required": false; }; "gutterClickDeltaPx": { "alias": "gutterClickDeltaPx"; "required": false; }; "gutterAriaLabel": { "alias": "gutterAriaLabel"; "required": false; }; }, { "transitionEnd": "transitionEnd"; "dragStart": "dragStart"; "dragEnd": "dragEnd"; "gutterClick": "gutterClick"; "gutterDblClick": "gutterDblClick"; }, never, ["*"], false, never>;
}
