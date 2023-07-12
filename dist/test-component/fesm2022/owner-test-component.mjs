import * as i0 from '@angular/core';
import { InjectionToken, EventEmitter, Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, Inject, Input, Output, ViewChildren, Directive, forwardRef, ElementRef, SkipSelf, Host, ViewChild, ContentChild, NgModule, Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of, combineLatest } from 'rxjs';
import { debounceTime, switchMap, map, startWith, delay, takeUntil, take, tap, filter } from 'rxjs/operators';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';
import { A, Z, ZERO, NINE, SPACE, HOME, END, ENTER, ESCAPE, UP_ARROW, DOWN_ARROW } from '@angular/cdk/keycodes';
import * as i4 from '@angular/forms';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import * as i12 from '@angular/material/legacy-form-field';
import { MatLegacyFormField } from '@angular/material/legacy-form-field';
import * as i11 from '@angular/material/legacy-select';
import { MatLegacySelect, MatLegacySelectModule } from '@angular/material/legacy-select';
import * as i1 from '@angular/material/legacy-core';
import * as i2 from '@angular/cdk/scrolling';
import * as i5 from '@angular/material/legacy-button';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import * as i6 from '@angular/material/legacy-checkbox';
import { MatLegacyCheckboxModule } from '@angular/material/legacy-checkbox';
import * as i7 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i8 from '@angular/material/legacy-progress-spinner';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import * as i9 from '@angular/material/legacy-tooltip';
import { MatLegacyTooltipModule } from '@angular/material/legacy-tooltip';
import * as i10 from '@angular/material/divider';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserModule } from '@angular/platform-browser';

function getPointFromEvent(event) {
    // TouchEvent
    if (event.changedTouches !== undefined && event.changedTouches.length > 0) {
        return {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY,
        };
    }
    // MouseEvent
    else if (event.clientX !== undefined && event.clientY !== undefined) {
        return {
            x: event.clientX,
            y: event.clientY,
        };
    }
    // KeyboardEvent
    else if (event.currentTarget !== undefined) {
        const gutterEl = event.currentTarget;
        return {
            x: gutterEl.offsetLeft,
            y: gutterEl.offsetTop,
        };
    }
    return null;
}
function pointDeltaEquals(lhs, rhs, deltaPx) {
    return Math.abs(lhs.x - rhs.x) <= deltaPx && Math.abs(lhs.y - rhs.y) <= deltaPx;
}
function getKeyboardEndpoint(event, direction) {
    // Return null if direction keys on the opposite axis were pressed
    if (direction === 'horizontal') {
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'PageUp':
            case 'PageDown':
                break;
            default:
                return null;
        }
    }
    if (direction === 'vertical') {
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'PageUp':
            case 'PageDown':
                break;
            default:
                return null;
        }
    }
    const gutterEl = event.currentTarget;
    const offset = event.key === 'PageUp' || event.key === 'PageDown' ? 50 * 10 : 50;
    let offsetX = gutterEl.offsetLeft, offsetY = gutterEl.offsetTop;
    switch (event.key) {
        case 'ArrowLeft':
            offsetX -= offset;
            break;
        case 'ArrowRight':
            offsetX += offset;
            break;
        case 'ArrowUp':
            offsetY -= offset;
            break;
        case 'ArrowDown':
            offsetY += offset;
            break;
        case 'PageUp':
            if (direction === 'vertical') {
                offsetY -= offset;
            }
            else {
                offsetX += offset;
            }
            break;
        case 'PageDown':
            if (direction === 'vertical') {
                offsetY += offset;
            }
            else {
                offsetX -= offset;
            }
            break;
        default:
            return null;
    }
    return {
        x: offsetX,
        y: offsetY,
    };
}
function getElementPixelSize(elRef, direction) {
    const rect = elRef.nativeElement.getBoundingClientRect();
    return direction === 'horizontal' ? rect.width : rect.height;
}
function getInputBoolean(v) {
    return typeof v === 'boolean' ? v : v === 'false' ? false : true;
}
function getInputPositiveNumber(v, defaultValue) {
    if (v === null || v === undefined)
        return defaultValue;
    v = Number(v);
    return !isNaN(v) && v >= 0 ? v : defaultValue;
}
function isUserSizesValid(unit, sizes) {
    // All sizes have to be not null and total should be 100
    if (unit === 'percent') {
        let total = 0;
        sizes.forEach(a_size => { if (a_size !== null)
            total += a_size; });
        return sizes.every((s) => s !== null) && total > 99.9 && total < 100.1;
    }
    // A size at null is mandatory but only one.
    if (unit === 'pixel') {
        return sizes.filter((s) => s === null).length === 1;
    }
    return true;
}
function getAreaMinSize(a) {
    if (a.size === null) {
        return null;
    }
    if (a.component.lockSize === true) {
        return a.size;
    }
    if (a.component.minSize === null) {
        return null;
    }
    if (a.component.minSize > a.size) {
        return a.size;
    }
    return a.component.minSize;
}
function getAreaMaxSize(a) {
    if (a.size === null) {
        return null;
    }
    if (a.component.lockSize === true) {
        return a.size;
    }
    if (a.component.maxSize === null) {
        return null;
    }
    if (a.component.maxSize < a.size) {
        return a.size;
    }
    return a.component.maxSize;
}
function getGutterSideAbsorptionCapacity(unit, sideAreas, pixels, allAreasSizePixel) {
    return sideAreas.reduce((acc, area) => {
        const res = getAreaAbsorptionCapacity(unit, area, acc.remain, allAreasSizePixel);
        if (res !== null) {
            acc.list.push(res);
            acc.remain = res.pixelRemain;
        }
        return acc;
    }, { remain: pixels, list: [] });
}
function getAreaAbsorptionCapacity(unit, areaSnapshot, pixels, allAreasSizePixel) {
    // No pain no gain
    if (pixels === 0) {
        return {
            areaSnapshot,
            pixelAbsorb: 0,
            percentAfterAbsorption: areaSnapshot.sizePercentAtStart,
            pixelRemain: 0,
        };
    }
    // Area start at zero and need to be reduced, not possible
    if (areaSnapshot.sizePixelAtStart === 0 && pixels < 0) {
        return {
            areaSnapshot,
            pixelAbsorb: 0,
            percentAfterAbsorption: 0,
            pixelRemain: pixels,
        };
    }
    if (unit === 'percent') {
        return getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel);
    }
    if (unit === 'pixel') {
        return getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, allAreasSizePixel);
    }
    return null;
}
function getAreaAbsorptionCapacityPercent(areaSnapshot, pixels, allAreasSizePixel) {
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    const tempPercentSize = (tempPixelSize / allAreasSizePixel) * 100;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels
        if (areaSnapshot.area.maxSize !== null && tempPercentSize > areaSnapshot.area.maxSize) {
            // Use area.area.maxSize as newPercentSize and return calculate pixels remaining
            const maxSizePixel = (areaSnapshot.area.maxSize / 100) * allAreasSizePixel;
            return {
                areaSnapshot,
                pixelAbsorb: maxSizePixel,
                percentAfterAbsorption: areaSnapshot.area.maxSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - maxSizePixel,
            };
        }
        return {
            areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: tempPercentSize > 100 ? 100 : tempPercentSize,
            pixelRemain: 0,
        };
    }
    // REDUCE AREA
    else if (pixels < 0) {
        // If minSize & newSize smaller than it > absorb to min and return remaining pixels
        if (areaSnapshot.area.minSize !== null && tempPercentSize < areaSnapshot.area.minSize) {
            // Use area.area.minSize as newPercentSize and return calculate pixels remaining
            const minSizePixel = (areaSnapshot.area.minSize / 100) * allAreasSizePixel;
            return {
                areaSnapshot,
                pixelAbsorb: minSizePixel,
                percentAfterAbsorption: areaSnapshot.area.minSize,
                pixelRemain: areaSnapshot.sizePixelAtStart + pixels - minSizePixel,
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPercentSize < 0) {
            // Use 0 as newPercentSize and return calculate pixels remaining
            return {
                areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: 0,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
            };
        }
        return {
            areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: tempPercentSize,
            pixelRemain: 0,
        };
    }
    return null;
}
function getAreaAbsorptionCapacityPixel(areaSnapshot, pixels, containerSizePixel) {
    const tempPixelSize = areaSnapshot.sizePixelAtStart + pixels;
    // ENLARGE AREA
    if (pixels > 0) {
        // If maxSize & newSize bigger than it > absorb to max and return remaining pixels
        if (areaSnapshot.area.maxSize !== null && tempPixelSize > areaSnapshot.area.maxSize) {
            return {
                areaSnapshot,
                pixelAbsorb: areaSnapshot.area.maxSize - areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.maxSize,
            };
        }
        return {
            areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: -1,
            pixelRemain: 0,
        };
    }
    // REDUCE AREA
    else if (pixels < 0) {
        // If minSize & newSize smaller than it > absorb to min and return remaining pixels
        if (areaSnapshot.area.minSize !== null && tempPixelSize < areaSnapshot.area.minSize) {
            return {
                areaSnapshot,
                pixelAbsorb: areaSnapshot.area.minSize + pixels - tempPixelSize,
                percentAfterAbsorption: -1,
                pixelRemain: tempPixelSize - areaSnapshot.area.minSize,
            };
        }
        // If reduced under zero > return remaining pixels
        else if (tempPixelSize < 0) {
            return {
                areaSnapshot,
                pixelAbsorb: -areaSnapshot.sizePixelAtStart,
                percentAfterAbsorption: -1,
                pixelRemain: pixels + areaSnapshot.sizePixelAtStart,
            };
        }
        return {
            areaSnapshot,
            pixelAbsorb: pixels,
            percentAfterAbsorption: -1,
            pixelRemain: 0,
        };
    }
    return null;
}
function updateAreaSize(unit, item) {
    if (unit === 'percent') {
        item.areaSnapshot.area.size = item.percentAfterAbsorption;
    }
    else if (unit === 'pixel') {
        // Update size except for the wildcard size area
        if (item.areaSnapshot.area.size !== null) {
            item.areaSnapshot.area.size = item.areaSnapshot.sizePixelAtStart + item.pixelAbsorb;
        }
    }
}

const ANGULAR_SPLIT_DEFAULT_OPTIONS = new InjectionToken('angular-split-global-config');

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
class SplitComponent {
    set direction(v) {
        this._direction = v === 'vertical' ? 'vertical' : 'horizontal';
        this.renderer.addClass(this.elRef.nativeElement, `as-${this._direction}`);
        this.renderer.removeClass(this.elRef.nativeElement, `as-${this._direction === 'vertical' ? 'horizontal' : 'vertical'}`);
        this.build(false, false);
    }
    get direction() {
        return this._direction;
    }
    set unit(v) {
        this._unit = v === 'pixel' ? 'pixel' : 'percent';
        this.renderer.addClass(this.elRef.nativeElement, `as-${this._unit}`);
        this.renderer.removeClass(this.elRef.nativeElement, `as-${this._unit === 'pixel' ? 'percent' : 'pixel'}`);
        this.build(false, true);
    }
    get unit() {
        return this._unit;
    }
    set gutterSize(v) {
        this._gutterSize = getInputPositiveNumber(v, 11);
        this.build(false, false);
    }
    get gutterSize() {
        return this._gutterSize;
    }
    set gutterStep(v) {
        this._gutterStep = getInputPositiveNumber(v, 1);
    }
    get gutterStep() {
        return this._gutterStep;
    }
    set restrictMove(v) {
        this._restrictMove = getInputBoolean(v);
    }
    get restrictMove() {
        return this._restrictMove;
    }
    set useTransition(v) {
        this._useTransition = getInputBoolean(v);
        if (this._useTransition) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-transition');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-transition');
        }
    }
    get useTransition() {
        return this._useTransition;
    }
    set disabled(v) {
        this._disabled = getInputBoolean(v);
        if (this._disabled) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-disabled');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-disabled');
        }
    }
    get disabled() {
        return this._disabled;
    }
    set dir(v) {
        this._dir = v === 'rtl' ? 'rtl' : 'ltr';
        this.renderer.setAttribute(this.elRef.nativeElement, 'dir', this._dir);
    }
    get dir() {
        return this._dir;
    }
    set gutterDblClickDuration(v) {
        this._gutterDblClickDuration = getInputPositiveNumber(v, 0);
    }
    get gutterDblClickDuration() {
        return this._gutterDblClickDuration;
    }
    get transitionEnd() {
        return new Observable((subscriber) => (this.transitionEndSubscriber = subscriber)).pipe(debounceTime(20));
    }
    constructor(ngZone, elRef, cdRef, renderer, globalConfig) {
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.cdRef = cdRef;
        this.renderer = renderer;
        this.gutterClickDeltaPx = 2;
        this._config = {
            direction: 'horizontal',
            unit: 'percent',
            gutterSize: 11,
            gutterStep: 1,
            restrictMove: false,
            useTransition: false,
            disabled: false,
            dir: 'ltr',
            gutterDblClickDuration: 0,
        };
        this.dragStart = new EventEmitter(false);
        this.dragEnd = new EventEmitter(false);
        this.gutterClick = new EventEmitter(false);
        this.gutterDblClick = new EventEmitter(false);
        this.dragProgressSubject = new Subject();
        this.dragProgress$ = this.dragProgressSubject.asObservable();
        this.isDragging = false;
        this.isWaitingClear = false;
        this.isWaitingInitialMove = false;
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.dragListeners = [];
        this.snapshot = null;
        this.startPoint = null;
        this.endPoint = null;
        this.displayedAreas = [];
        this.hiddenAreas = [];
        this._clickTimeout = null;
        // To force adding default class, could be override by user @Input() or not
        this.direction = this._direction;
        this._config = globalConfig ? Object.assign(this._config, globalConfig) : this._config;
        this.direction = this._config.direction;
        this.unit = this._config.unit;
        this.gutterSize = this._config.gutterSize;
        this.gutterStep = this._config.gutterStep;
        this.restrictMove = this._config.restrictMove;
        this.useTransition = this._config.useTransition;
        this.disabled = this._config.disabled;
        this.dir = this._config.dir;
        this.gutterDblClickDuration = this._config.gutterDblClickDuration;
    }
    ngAfterViewInit() {
        this.ngZone.runOutsideAngular(() => {
            // To avoid transition at first rendering
            setTimeout(() => this.renderer.addClass(this.elRef.nativeElement, 'as-init'));
        });
    }
    getNbGutters() {
        return this.displayedAreas.length === 0 ? 0 : this.displayedAreas.length - 1;
    }
    addArea(component) {
        const newArea = {
            component,
            order: 0,
            size: 0,
            minSize: null,
            maxSize: null,
            sizeBeforeCollapse: null,
            gutterBeforeCollapse: 0,
        };
        if (component.visible === true) {
            this.displayedAreas.push(newArea);
            this.build(true, true);
        }
        else {
            this.hiddenAreas.push(newArea);
        }
    }
    removeArea(component) {
        if (this.displayedAreas.some((a) => a.component === component)) {
            const area = this.displayedAreas.find((a) => a.component === component);
            if (area)
                this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
            this.build(true, true);
        }
        else if (this.hiddenAreas.some((a) => a.component === component)) {
            const area = this.hiddenAreas.find((a) => a.component === component);
            if (area)
                this.hiddenAreas.splice(this.hiddenAreas.indexOf(area), 1);
        }
    }
    updateArea(component, resetOrders, resetSizes) {
        if (component.visible === true) {
            this.build(resetOrders, resetSizes);
        }
    }
    showArea(component) {
        const area = this.hiddenAreas.find((a) => a.component === component);
        if (area === undefined) {
            return;
        }
        const areas = this.hiddenAreas.splice(this.hiddenAreas.indexOf(area), 1);
        this.displayedAreas.push(...areas);
        this.build(true, true);
    }
    hideArea(comp) {
        const area = this.displayedAreas.find((a) => a.component === comp);
        if (area === undefined) {
            return;
        }
        const areas = this.displayedAreas.splice(this.displayedAreas.indexOf(area), 1);
        areas.forEach((item) => {
            item.order = 0;
            item.size = 0;
        });
        this.hiddenAreas.push(...areas);
        this.build(true, true);
    }
    getVisibleAreaSizes() {
        return this.displayedAreas.map((a) => (a.size === null ? '*' : a.size));
    }
    setVisibleAreaSizes(sizes) {
        if (sizes.length !== this.displayedAreas.length) {
            return false;
        }
        const formattedSizes = sizes.map((s) => getInputPositiveNumber(s, null));
        const isValid = isUserSizesValid(this.unit, formattedSizes);
        if (isValid === false) {
            return false;
        }
        this.displayedAreas.forEach((area, i) => {
            area.component.size = formattedSizes[i]; // setSize()._size
        });
        this.build(false, true);
        return true;
    }
    build(resetOrders, resetSizes) {
        this.stopDragging();
        // ¤ AREAS ORDER
        if (resetOrders === true) {
            // If user provided 'order' for each area, use it to sort them.
            if (this.displayedAreas.every((a) => a.component.order !== null)) {
                this.displayedAreas.sort((a, b) => a.component.order - b.component.order);
            }
            // Then set real order with multiples of 2, numbers between will be used by gutters.
            this.displayedAreas.forEach((area, i) => {
                area.order = i * 2;
                area.component.setStyleOrder(area.order);
            });
        }
        // ¤ AREAS SIZE
        if (resetSizes === true) {
            const useUserSizes = isUserSizesValid(this.unit, this.displayedAreas.map((a) => a.component.size));
            switch (this.unit) {
                case 'percent': {
                    const defaultSize = 100 / this.displayedAreas.length;
                    this.displayedAreas.forEach((area) => {
                        area.size = useUserSizes ? area.component.size : defaultSize;
                        area.minSize = getAreaMinSize(area);
                        area.maxSize = getAreaMaxSize(area);
                    });
                    break;
                }
                case 'pixel': {
                    if (useUserSizes) {
                        this.displayedAreas.forEach((area) => {
                            area.size = area.component.size;
                            area.minSize = getAreaMinSize(area);
                            area.maxSize = getAreaMaxSize(area);
                        });
                    }
                    else {
                        const wildcardSizeAreas = this.displayedAreas.filter((a) => a.component.size === null);
                        // No wildcard area > Need to select one arbitrarily > first
                        if (wildcardSizeAreas.length === 0 && this.displayedAreas.length > 0) {
                            this.displayedAreas.forEach((area, i) => {
                                area.size = i === 0 ? null : area.component.size;
                                area.minSize = i === 0 ? null : getAreaMinSize(area);
                                area.maxSize = i === 0 ? null : getAreaMaxSize(area);
                            });
                        }
                        else if (wildcardSizeAreas.length > 1) {
                            // More than one wildcard area > Need to keep only one arbitrarily > first
                            let alreadyGotOne = false;
                            this.displayedAreas.forEach((area) => {
                                if (area.component.size === null) {
                                    if (alreadyGotOne === false) {
                                        area.size = null;
                                        area.minSize = null;
                                        area.maxSize = null;
                                        alreadyGotOne = true;
                                    }
                                    else {
                                        area.size = 100;
                                        area.minSize = null;
                                        area.maxSize = null;
                                    }
                                }
                                else {
                                    area.size = area.component.size;
                                    area.minSize = getAreaMinSize(area);
                                    area.maxSize = getAreaMaxSize(area);
                                }
                            });
                        }
                    }
                    break;
                }
            }
        }
        this.refreshStyleSizes();
        this.cdRef.markForCheck();
    }
    refreshStyleSizes() {
        ///////////////////////////////////////////
        // PERCENT MODE
        if (this.unit === 'percent') {
            // Only one area > flex-basis 100%
            if (this.displayedAreas.length === 1) {
                this.displayedAreas[0].component.setStyleFlex(0, 0, '100%', false, false);
            }
            else {
                // Multiple areas > use each percent basis
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const sumGutterSize = this.getNbGutters() * this.gutterSize;
                this.displayedAreas.forEach((area) => {
                    area.component.setStyleFlex(0, 0, `calc( ${area.size}% - ${(area.size / 100) * sumGutterSize}px )`, area.minSize !== null && area.minSize === area.size, area.maxSize !== null && area.maxSize === area.size);
                });
            }
        }
        else if (this.unit === 'pixel') {
            ///////////////////////////////////////////
            // PIXEL MODE
            this.displayedAreas.forEach((area) => {
                // Area with wildcard size
                if (area.size === null) {
                    if (this.displayedAreas.length === 1) {
                        area.component.setStyleFlex(1, 1, '100%', false, false);
                    }
                    else {
                        area.component.setStyleFlex(1, 1, 'auto', false, false);
                    }
                }
                else {
                    // Area with pixel size
                    // Only one area > flex-basis 100%
                    if (this.displayedAreas.length === 1) {
                        area.component.setStyleFlex(0, 0, '100%', false, false);
                    }
                    else {
                        // Multiple areas > use each pixel basis
                        area.component.setStyleFlex(0, 0, `${area.size}px`, area.minSize !== null && area.minSize === area.size, area.maxSize !== null && area.maxSize === area.size);
                    }
                }
            });
        }
    }
    clickGutter(event, gutterNum) {
        const tempPoint = getPointFromEvent(event);
        // Be sure mouseup/touchend happened if touch/cursor is not moved.
        if (this.startPoint &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pointDeltaEquals(this.startPoint, tempPoint, this.gutterClickDeltaPx) &&
            (!this.isDragging || this.isWaitingInitialMove)) {
            // If timeout in progress and new click > clearTimeout & dblClickEvent
            if (this._clickTimeout !== null) {
                window.clearTimeout(this._clickTimeout);
                this._clickTimeout = null;
                this.notify('dblclick', gutterNum);
                this.stopDragging();
            }
            else {
                // Else start timeout to call clickEvent at end
                this._clickTimeout = window.setTimeout(() => {
                    this._clickTimeout = null;
                    this.notify('click', gutterNum);
                    this.stopDragging();
                }, this.gutterDblClickDuration);
            }
        }
    }
    startKeyboardDrag(event, gutterOrder, gutterNum) {
        if (this.disabled === true || this.isWaitingClear === true) {
            return;
        }
        const endPoint = getKeyboardEndpoint(event, this.direction);
        if (endPoint === null) {
            return;
        }
        this.endPoint = endPoint;
        this.startPoint = getPointFromEvent(event);
        event.preventDefault();
        event.stopPropagation();
        this.setupForDragEvent(gutterOrder, gutterNum);
        this.startDragging();
        this.drag();
        this.stopDragging();
    }
    startMouseDrag(event, gutterOrder, gutterNum) {
        event.preventDefault();
        event.stopPropagation();
        this.startPoint = getPointFromEvent(event);
        if (this.startPoint === null || this.disabled === true || this.isWaitingClear === true) {
            return;
        }
        this.setupForDragEvent(gutterOrder, gutterNum);
        this.dragListeners.push(this.renderer.listen('document', 'mouseup', this.stopDragging.bind(this)));
        this.dragListeners.push(this.renderer.listen('document', 'touchend', this.stopDragging.bind(this)));
        this.dragListeners.push(this.renderer.listen('document', 'touchcancel', this.stopDragging.bind(this)));
        this.ngZone.runOutsideAngular(() => {
            this.dragListeners.push(this.renderer.listen('document', 'mousemove', this.mouseDragEvent.bind(this)));
            this.dragListeners.push(this.renderer.listen('document', 'touchmove', this.mouseDragEvent.bind(this)));
        });
        this.startDragging();
    }
    setupForDragEvent(gutterOrder, gutterNum) {
        this.snapshot = {
            gutterNum,
            lastSteppedOffset: 0,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            allAreasSizePixel: getElementPixelSize(this.elRef, this.direction) - this.getNbGutters() * this.gutterSize,
            allInvolvedAreasSizePercent: 100,
            areasBeforeGutter: [],
            areasAfterGutter: [],
        };
        this.displayedAreas.forEach((area) => {
            if (area === null)
                return;
            const areaSnapshot = {
                area,
                sizePixelAtStart: getElementPixelSize(area.component.elRef, this.direction),
                sizePercentAtStart: this.unit === 'percent' ? (area.size ?? -1) : -1, // If pixel mode, anyway, will not be used.
            };
            if (this.snapshot === null)
                return;
            if (area.order < gutterOrder) {
                if (this.restrictMove === true) {
                    this.snapshot.areasBeforeGutter = [areaSnapshot];
                }
                else {
                    this.snapshot.areasBeforeGutter.unshift(areaSnapshot);
                }
            }
            else if (area.order > gutterOrder) {
                if (this.restrictMove === true) {
                    if (this.snapshot.areasAfterGutter.length === 0) {
                        this.snapshot.areasAfterGutter = [areaSnapshot];
                    }
                }
                else {
                    this.snapshot.areasAfterGutter.push(areaSnapshot);
                }
            }
        });
        this.snapshot.allInvolvedAreasSizePercent = [
            ...this.snapshot.areasBeforeGutter,
            ...this.snapshot.areasAfterGutter,
        ].reduce((t, a) => t + a.sizePercentAtStart, 0);
        if (this.snapshot.areasBeforeGutter.length === 0 || this.snapshot.areasAfterGutter.length === 0) {
            return;
        }
    }
    startDragging() {
        this.displayedAreas.forEach((area) => area.component.lockEvents());
        this.isDragging = true;
        this.isWaitingInitialMove = true;
    }
    mouseDragEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        const tempPoint = getPointFromEvent(event);
        if (this._clickTimeout !== null && this.startPoint !== null && tempPoint !== null) {
            if (!pointDeltaEquals(this.startPoint, tempPoint, this.gutterClickDeltaPx)) {
                window.clearTimeout(this._clickTimeout);
                this._clickTimeout = null;
            }
        }
        if (this.isDragging === false) {
            return;
        }
        this.endPoint = getPointFromEvent(event);
        if (this.endPoint === null) {
            return;
        }
        this.drag();
    }
    drag() {
        if (this.isWaitingInitialMove) {
            if (this.startPoint !== null && this.endPoint !== null) {
                if (this.startPoint.x !== this.endPoint.x || this.startPoint.y !== this.endPoint.y) {
                    this.ngZone.run(() => {
                        this.isWaitingInitialMove = false;
                        this.renderer.addClass(this.elRef.nativeElement, 'as-dragging');
                        if (this.snapshot !== null) {
                            this.renderer.addClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
                            this.notify('start', this.snapshot.gutterNum);
                        }
                    });
                }
                else {
                    return;
                }
            }
        }
        // Calculate steppedOffset
        let offset = this.startPoint === null || this.endPoint === null ? 0 :
            this.direction === 'horizontal' ? this.startPoint.x - this.endPoint.x : this.startPoint.y - this.endPoint.y;
        // RTL requires negative offset only in horizontal mode as in vertical
        // RTL has no effect on drag direction.
        if (this.dir === 'rtl' && this.direction === 'horizontal') {
            offset = -offset;
        }
        const steppedOffset = Math.round(offset / this.gutterStep) * this.gutterStep;
        if (this.snapshot === null)
            return;
        if (steppedOffset === this.snapshot.lastSteppedOffset) {
            return;
        }
        this.snapshot.lastSteppedOffset = steppedOffset;
        // Need to know if each gutter side areas could reacts to steppedOffset
        let areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -steppedOffset, this.snapshot.allAreasSizePixel);
        let areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset, this.snapshot.allAreasSizePixel);
        // Each gutter side areas can't absorb all offset
        if (areasBefore.remain !== 0 && areasAfter.remain !== 0) {
            if (Math.abs(areasBefore.remain) === Math.abs(areasAfter.remain)) {
            }
            else if (Math.abs(areasBefore.remain) > Math.abs(areasAfter.remain)) {
                areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
            }
            else {
                areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
            }
        }
        else if (areasBefore.remain !== 0) {
            // Areas before gutter can't absorbs all offset > need to recalculate sizes for areas after gutter.
            areasAfter = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasAfterGutter, steppedOffset + areasBefore.remain, this.snapshot.allAreasSizePixel);
        }
        else if (areasAfter.remain !== 0) {
            // Areas after gutter can't absorbs all offset > need to recalculate sizes for areas before gutter.
            areasBefore = getGutterSideAbsorptionCapacity(this.unit, this.snapshot.areasBeforeGutter, -(steppedOffset - areasAfter.remain), this.snapshot.allAreasSizePixel);
        }
        if (this.unit === 'percent') {
            // Hack because of browser messing up with sizes using calc(X% - Ypx) -> el.getBoundingClientRect()
            // If not there, playing with gutters makes total going down to 99.99875% then 99.99286%, 99.98986%,..
            const all = [...areasBefore.list, ...areasAfter.list];
            const areaToReset = all.find((a) => a.percentAfterAbsorption !== 0 &&
                a.percentAfterAbsorption !== a.areaSnapshot.area.minSize &&
                a.percentAfterAbsorption !== a.areaSnapshot.area.maxSize);
            if (areaToReset) {
                areaToReset.percentAfterAbsorption =
                    this.snapshot.allInvolvedAreasSizePercent -
                        all.filter((a) => a !== areaToReset).reduce((total, a) => total + a.percentAfterAbsorption, 0);
            }
        }
        // Now we know areas could absorb steppedOffset, time to really update sizes
        areasBefore.list.forEach((item) => updateAreaSize(this.unit, item));
        areasAfter.list.forEach((item) => updateAreaSize(this.unit, item));
        this.refreshStyleSizes();
        this.notify('progress', this.snapshot.gutterNum);
    }
    stopDragging(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.isDragging === false) {
            return;
        }
        this.displayedAreas.forEach((area) => area.component.unlockEvents());
        while (this.dragListeners.length > 0) {
            const fct = this.dragListeners.pop();
            if (fct) {
                fct();
            }
        }
        // Warning: Have to be before "notify('end')"
        // because "notify('end')"" can be linked to "[size]='x'" > "build()" > "stopDragging()"
        this.isDragging = false;
        // If moved from starting point, notify end
        if (this.isWaitingInitialMove === false) {
            if (this.snapshot !== null) {
                this.notify('end', this.snapshot.gutterNum);
            }
        }
        this.renderer.removeClass(this.elRef.nativeElement, 'as-dragging');
        if (this.snapshot !== null) {
            this.renderer.removeClass(this.gutterEls.toArray()[this.snapshot.gutterNum - 1].nativeElement, 'as-dragged');
        }
        this.snapshot = null;
        this.isWaitingClear = true;
        // Needed to let (click)="clickGutter(...)" event run and verify if mouse moved or not
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.startPoint = null;
                this.endPoint = null;
                this.isWaitingClear = false;
            });
        });
    }
    notify(type, gutterNum) {
        const sizes = this.getVisibleAreaSizes();
        if (type === 'start') {
            this.dragStart.emit({ gutterNum, sizes });
        }
        else if (type === 'end') {
            this.dragEnd.emit({ gutterNum, sizes });
        }
        else if (type === 'click') {
            this.gutterClick.emit({ gutterNum, sizes });
        }
        else if (type === 'dblclick') {
            this.gutterDblClick.emit({ gutterNum, sizes });
        }
        else if (type === 'transitionEnd') {
            if (this.transitionEndSubscriber) {
                this.ngZone.run(() => this.transitionEndSubscriber.next(sizes));
            }
        }
        else if (type === 'progress') {
            // Stay outside zone to allow users do what they want about change detection mechanism.
            this.dragProgressSubject.next({ gutterNum, sizes });
        }
    }
    ngOnDestroy() {
        this.stopDragging();
    }
    collapseArea(comp, newSize, gutter) {
        const area = this.displayedAreas.find((a) => a.component === comp);
        if (area === undefined) {
            return;
        }
        const whichGutter = gutter === 'right' ? 1 : -1;
        if (!area.sizeBeforeCollapse) {
            area.sizeBeforeCollapse = area.size;
            area.gutterBeforeCollapse = whichGutter;
        }
        area.size = newSize;
        const gtr = this.gutterEls.find((f) => f.nativeElement.style.order === `${area.order + whichGutter}`);
        if (gtr) {
            this.renderer.addClass(gtr.nativeElement, 'as-split-gutter-collapsed');
        }
        this.updateArea(comp, false, false);
    }
    expandArea(comp) {
        const area = this.displayedAreas.find((a) => a.component === comp);
        if (area === undefined) {
            return;
        }
        if (!area.sizeBeforeCollapse) {
            return;
        }
        area.size = area.sizeBeforeCollapse;
        area.sizeBeforeCollapse = null;
        const gtr = this.gutterEls.find((f) => f.nativeElement.style.order === `${area.order + area.gutterBeforeCollapse}`);
        if (gtr) {
            this.renderer.removeClass(gtr.nativeElement, 'as-split-gutter-collapsed');
        }
        this.updateArea(comp, false, false);
    }
    getAriaAreaSizeText(size) {
        if (size === null) {
            return null;
        }
        return size.toFixed(0) + ' ' + this.unit;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: SplitComponent, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i0.Renderer2 }, { token: ANGULAR_SPLIT_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.4", type: SplitComponent, selector: "as-split", inputs: { direction: "direction", unit: "unit", gutterSize: "gutterSize", gutterStep: "gutterStep", restrictMove: "restrictMove", useTransition: "useTransition", disabled: "disabled", dir: "dir", gutterDblClickDuration: "gutterDblClickDuration", gutterClickDeltaPx: "gutterClickDeltaPx", gutterAriaLabel: "gutterAriaLabel" }, outputs: { transitionEnd: "transitionEnd", dragStart: "dragStart", dragEnd: "dragEnd", gutterClick: "gutterClick", gutterDblClick: "gutterDblClick" }, viewQueries: [{ propertyName: "gutterEls", predicate: ["gutterEls"], descendants: true }], exportAs: ["asSplit"], ngImport: i0, template: ` <ng-content></ng-content>
    <ng-template ngFor [ngForOf]="displayedAreas" let-area="$implicit" let-index="index" let-last="last">
      <div
        role="slider"
        tabindex="0"
        *ngIf="last === false"
        #gutterEls
        class="as-split-gutter"
        [style.flex-basis.px]="gutterSize"
        [style.order]="index * 2 + 1"
        (keydown)="startKeyboardDrag($event, index * 2 + 1, index + 1)"
        (mousedown)="startMouseDrag($event, index * 2 + 1, index + 1)"
        (touchstart)="startMouseDrag($event, index * 2 + 1, index + 1)"
        (mouseup)="clickGutter($event, index + 1)"
        (touchend)="clickGutter($event, index + 1)"
        [attr.aria-label]="gutterAriaLabel"
        [attr.aria-orientation]="direction"
        [attr.aria-valuemin]="area.minSize"
        [attr.aria-valuemax]="area.maxSize"
        [attr.aria-valuenow]="area.size"
        [attr.aria-valuetext]="getAriaAreaSizeText(area.size)"
      >
        <div class="as-split-gutter-icon"></div>
      </div>
    </ng-template>`, isInline: true, styles: [":host{display:flex;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%;height:100%}:host>.as-split-gutter{border:none;flex-grow:0;flex-shrink:0;background-color:#eee;display:flex;align-items:center;justify-content:center}:host>.as-split-gutter.as-split-gutter-collapsed{flex-basis:1px!important;pointer-events:none}:host>.as-split-gutter>.as-split-gutter-icon{width:100%;height:100%;background-position:center center;background-repeat:no-repeat}:host ::ng-deep>.as-split-area{flex-grow:0;flex-shrink:0;overflow-x:hidden;overflow-y:auto}:host ::ng-deep>.as-split-area.as-hidden{flex:0 1 0px!important;overflow-x:hidden;overflow-y:hidden}:host.as-horizontal{flex-direction:row}:host.as-horizontal>.as-split-gutter{flex-direction:row;cursor:col-resize;height:100%}:host.as-horizontal>.as-split-gutter>.as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-horizontal ::ng-deep>.as-split-area{height:100%}:host.as-vertical{flex-direction:column}:host.as-vertical>.as-split-gutter{flex-direction:column;cursor:row-resize;width:100%}:host.as-vertical>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC)}:host.as-vertical ::ng-deep>.as-split-area{width:100%}:host.as-vertical ::ng-deep>.as-split-area.as-hidden{max-width:0}:host.as-disabled>.as-split-gutter{cursor:default}:host.as-disabled>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-transition.as-init:not(.as-dragging)>.as-split-gutter,:host.as-transition.as-init:not(.as-dragging) ::ng-deep>.as-split-area{transition:flex-basis .3s}\n"], dependencies: [{ kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: SplitComponent, decorators: [{
            type: Component,
            args: [{ selector: 'as-split', exportAs: 'asSplit', changeDetection: ChangeDetectionStrategy.OnPush, template: ` <ng-content></ng-content>
    <ng-template ngFor [ngForOf]="displayedAreas" let-area="$implicit" let-index="index" let-last="last">
      <div
        role="slider"
        tabindex="0"
        *ngIf="last === false"
        #gutterEls
        class="as-split-gutter"
        [style.flex-basis.px]="gutterSize"
        [style.order]="index * 2 + 1"
        (keydown)="startKeyboardDrag($event, index * 2 + 1, index + 1)"
        (mousedown)="startMouseDrag($event, index * 2 + 1, index + 1)"
        (touchstart)="startMouseDrag($event, index * 2 + 1, index + 1)"
        (mouseup)="clickGutter($event, index + 1)"
        (touchend)="clickGutter($event, index + 1)"
        [attr.aria-label]="gutterAriaLabel"
        [attr.aria-orientation]="direction"
        [attr.aria-valuemin]="area.minSize"
        [attr.aria-valuemax]="area.maxSize"
        [attr.aria-valuenow]="area.size"
        [attr.aria-valuetext]="getAriaAreaSizeText(area.size)"
      >
        <div class="as-split-gutter-icon"></div>
      </div>
    </ng-template>`, encapsulation: ViewEncapsulation.Emulated, styles: [":host{display:flex;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%;height:100%}:host>.as-split-gutter{border:none;flex-grow:0;flex-shrink:0;background-color:#eee;display:flex;align-items:center;justify-content:center}:host>.as-split-gutter.as-split-gutter-collapsed{flex-basis:1px!important;pointer-events:none}:host>.as-split-gutter>.as-split-gutter-icon{width:100%;height:100%;background-position:center center;background-repeat:no-repeat}:host ::ng-deep>.as-split-area{flex-grow:0;flex-shrink:0;overflow-x:hidden;overflow-y:auto}:host ::ng-deep>.as-split-area.as-hidden{flex:0 1 0px!important;overflow-x:hidden;overflow-y:hidden}:host.as-horizontal{flex-direction:row}:host.as-horizontal>.as-split-gutter{flex-direction:row;cursor:col-resize;height:100%}:host.as-horizontal>.as-split-gutter>.as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-horizontal ::ng-deep>.as-split-area{height:100%}:host.as-vertical{flex-direction:column}:host.as-vertical>.as-split-gutter{flex-direction:column;cursor:row-resize;width:100%}:host.as-vertical>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC)}:host.as-vertical ::ng-deep>.as-split-area{width:100%}:host.as-vertical ::ng-deep>.as-split-area.as-hidden{max-width:0}:host.as-disabled>.as-split-gutter{cursor:default}:host.as-disabled>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-transition.as-init:not(.as-dragging)>.as-split-gutter,:host.as-transition.as-init:not(.as-dragging) ::ng-deep>.as-split-area{transition:flex-basis .3s}\n"] }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i0.Renderer2 }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [ANGULAR_SPLIT_DEFAULT_OPTIONS]
                }] }]; }, propDecorators: { direction: [{
                type: Input
            }], unit: [{
                type: Input
            }], gutterSize: [{
                type: Input
            }], gutterStep: [{
                type: Input
            }], restrictMove: [{
                type: Input
            }], useTransition: [{
                type: Input
            }], disabled: [{
                type: Input
            }], dir: [{
                type: Input
            }], gutterDblClickDuration: [{
                type: Input
            }], gutterClickDeltaPx: [{
                type: Input
            }], gutterAriaLabel: [{
                type: Input
            }], transitionEnd: [{
                type: Output
            }], dragStart: [{
                type: Output
            }], dragEnd: [{
                type: Output
            }], gutterClick: [{
                type: Output
            }], gutterDblClick: [{
                type: Output
            }], gutterEls: [{
                type: ViewChildren,
                args: ['gutterEls']
            }] } });

class SplitAreaDirective {
    set order(v) {
        this._order = getInputPositiveNumber(v, null);
        this.split.updateArea(this, true, false);
    }
    get order() {
        return this._order;
    }
    set size(v) {
        this._size = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    get size() {
        return this._size;
    }
    set minSize(v) {
        this._minSize = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    get minSize() {
        return this._minSize;
    }
    set maxSize(v) {
        this._maxSize = getInputPositiveNumber(v, null);
        this.split.updateArea(this, false, true);
    }
    get maxSize() {
        return this._maxSize;
    }
    set lockSize(v) {
        this._lockSize = getInputBoolean(v);
        this.split.updateArea(this, false, true);
    }
    get lockSize() {
        return this._lockSize;
    }
    set visible(v) {
        this._visible = getInputBoolean(v);
        if (this._visible) {
            this.split.showArea(this);
            this.renderer.removeClass(this.elRef.nativeElement, 'as-hidden');
        }
        else {
            this.split.hideArea(this);
            this.renderer.addClass(this.elRef.nativeElement, 'as-hidden');
        }
    }
    get visible() {
        return this._visible;
    }
    constructor(ngZone, elRef, renderer, split) {
        this.ngZone = ngZone;
        this.elRef = elRef;
        this.renderer = renderer;
        this.split = split;
        this._order = null;
        this._size = null;
        this._minSize = null;
        this._maxSize = null;
        this._lockSize = false;
        this._visible = true;
        // eslint-disable-next-line @typescript-eslint/ban-types
        this.lockListeners = [];
        this.renderer.addClass(this.elRef.nativeElement, 'as-split-area');
    }
    ngOnInit() {
        this.split.addArea(this);
        this.ngZone.runOutsideAngular(() => {
            this.transitionListener = this.renderer.listen(this.elRef.nativeElement, 'transitionend', (event) => {
                // Limit only flex-basis transition to trigger the event
                if (event.propertyName === 'flex-basis') {
                    this.split.notify('transitionEnd', -1);
                }
            });
        });
    }
    setStyleOrder(value) {
        this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
    }
    setStyleFlex(grow, shrink, basis, isMin, isMax) {
        // Need 3 separated properties to work on IE11 (https://github.com/angular/flex-layout/issues/323)
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow);
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink);
        this.renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis);
        if (isMin === true) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-min');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-min');
        }
        if (isMax === true) {
            this.renderer.addClass(this.elRef.nativeElement, 'as-max');
        }
        else {
            this.renderer.removeClass(this.elRef.nativeElement, 'as-max');
        }
    }
    lockEvents() {
        this.ngZone.runOutsideAngular(() => {
            this.lockListeners.push(this.renderer.listen(this.elRef.nativeElement, 'selectstart', () => false));
            this.lockListeners.push(this.renderer.listen(this.elRef.nativeElement, 'dragstart', () => false));
        });
    }
    unlockEvents() {
        while (this.lockListeners.length > 0) {
            const fct = this.lockListeners.pop();
            if (fct) {
                fct();
            }
        }
    }
    ngOnDestroy() {
        this.unlockEvents();
        if (this.transitionListener) {
            this.transitionListener();
        }
        this.split.removeArea(this);
    }
    collapse(newSize = 0, gutter = 'right') {
        this.split.collapseArea(this, newSize, gutter);
    }
    expand() {
        this.split.expandArea(this);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: SplitAreaDirective, deps: [{ token: i0.NgZone }, { token: i0.ElementRef }, { token: i0.Renderer2 }, { token: SplitComponent }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.4", type: SplitAreaDirective, selector: "as-split-area, [as-split-area]", inputs: { order: "order", size: "size", minSize: "minSize", maxSize: "maxSize", lockSize: "lockSize", visible: "visible" }, exportAs: ["asSplitArea"], ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: SplitAreaDirective, decorators: [{
            type: Directive,
            args: [{
                    // eslint-disable-next-line @angular-eslint/directive-selector
                    selector: 'as-split-area, [as-split-area]',
                    exportAs: 'asSplitArea',
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.ElementRef }, { type: i0.Renderer2 }, { type: SplitComponent }]; }, propDecorators: { order: [{
                type: Input
            }], size: [{
                type: Input
            }], minSize: [{
                type: Input
            }], maxSize: [{
                type: Input
            }], lockSize: [{
                type: Input
            }], visible: [{
                type: Input
            }] } });

/**
 * Directive for providing a custom no entries found element.
 * e.g.
 * <ngx-mat-select-search [formControl]="bankFilterCtrl">
 *   <span ngxMatSelectNoEntriesFound>
 *     No entries found <button>Add</button>
 *   </span>
 * </ngx-mat-select-search>
 */
class MatSelectNoEntriesFoundDirective {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectNoEntriesFoundDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.4", type: MatSelectNoEntriesFoundDirective, selector: "[ngxMatSelectNoEntriesFound]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectNoEntriesFoundDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngxMatSelectNoEntriesFound]'
                }]
        }] });

/**
 * Directive for providing a custom clear-icon.
 * e.g.
 * <ngx-mat-select-search [formControl]="bankFilterCtrl">
 *   <mat-icon ngxMatSelectSearchClear>delete</mat-icon>
 * </ngx-mat-select-search>
 */
class MatSelectSearchClearDirective {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectSearchClearDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.4", type: MatSelectSearchClearDirective, selector: "[ngxMatSelectSearchClear]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectSearchClearDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngxMatSelectSearchClear]'
                }]
        }] });

/** List of inputs of NgxMatSelectSearchComponent that can be configured with a global default. */
const configurableDefaultOptions = [
    'ariaLabel',
    'clearSearchInput',
    'closeIcon',
    'closeSvgIcon',
    'disableInitialFocus',
    'disableScrollToActiveOnOptionsChanged',
    'enableClearOnEscapePressed',
    'hideClearSearchButton',
    'noEntriesFoundLabel',
    'placeholderLabel',
    'preventHomeEndKeyPropagation',
    'searching',
];
/**
 * InjectionToken that can be used to specify global options. e.g.
 *
 * ```typescript
 * providers: [
 *   {
 *     provide: MAT_SELECTSEARCH_DEFAULT_OPTIONS,
 *     useValue: <MatSelectSearchOptions>{
 *       closeIcon: 'delete',
 *       noEntriesFoundLabel: 'No options found'
 *     }
 *   }
 * ]
 * ```
 *
 * See the corresponding inputs of `MatSelectSearchComponent` for documentation.
 */
const MAT_SELECTSEARCH_DEFAULT_OPTIONS = new InjectionToken('mat-selectsearch-default-options');

/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
class MatSelectSearchComponent {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: MatSelectSearchComponent, deps: [{ token: MatLegacySelect }, { token: i1.MatLegacyOption, host: true, optional: true, skipSelf: true }, { token: i0.ChangeDetectorRef }, { token: i2.ViewportRuler }, { token: MatLegacyFormField, optional: true }, { token: MAT_SELECTSEARCH_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
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
                    args: [MatLegacyFormField]
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

/**
 * Copyright (c) 2018 Bithost GmbH All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const MatSelectSearchVersion = '6.0.5';
class NgxMatSelectSearchModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, declarations: [MatSelectSearchComponent,
            MatSelectSearchClearDirective,
            MatSelectNoEntriesFoundDirective], imports: [CommonModule,
            ReactiveFormsModule,
            MatLegacyButtonModule,
            MatLegacyCheckboxModule,
            MatIconModule,
            MatLegacyProgressSpinnerModule,
            MatLegacyTooltipModule,
            MatLegacySelectModule,
            MatDividerModule], exports: [MatSelectSearchComponent,
            MatSelectSearchClearDirective,
            MatSelectNoEntriesFoundDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, imports: [CommonModule,
            ReactiveFormsModule,
            MatLegacyButtonModule,
            MatLegacyCheckboxModule,
            MatIconModule,
            MatLegacyProgressSpinnerModule,
            MatLegacyTooltipModule,
            MatLegacySelectModule,
            MatDividerModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: NgxMatSelectSearchModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        ReactiveFormsModule,
                        MatLegacyButtonModule,
                        MatLegacyCheckboxModule,
                        MatIconModule,
                        MatLegacyProgressSpinnerModule,
                        MatLegacyTooltipModule,
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

class TestComponentService {
    constructor() { }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: function () { return []; } });

class TestComponentComponent {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.1.4", type: TestComponentComponent, selector: "ngx-TestComponent", ngImport: i0, template: `
    <p>
      test-component works!
    </p>
  `, isInline: true }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.4", ngImport: i0, type: TestComponentComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-TestComponent', template: `
    <p>
      test-component works!
    </p>
  ` }]
        }] });

class TestComponentModule {
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
class AngularSplitModule {
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

/*
 * Public API Surface of test-component
 */
// angular-split

/**
 * Generated bundle index. Do not edit.
 */

export { AngularSplitModule, MatSelectNoEntriesFoundDirective, MatSelectSearchClearDirective, MatSelectSearchComponent, MatSelectSearchVersion, NgxMatSelectSearchModule, SplitAreaDirective, SplitComponent, TestComponentComponent, TestComponentModule, TestComponentService };
//# sourceMappingURL=owner-test-component.mjs.map
