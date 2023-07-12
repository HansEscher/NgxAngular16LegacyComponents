import { Component, Input, Output, ChangeDetectionStrategy, ViewChildren, EventEmitter, ViewEncapsulation, Inject, Optional, } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { getInputPositiveNumber, getInputBoolean, getAreaMinSize, getAreaMaxSize, getPointFromEvent, getElementPixelSize, getGutterSideAbsorptionCapacity, isUserSizesValid, pointDeltaEquals, updateAreaSize, getKeyboardEndpoint, } from './utils';
import { ANGULAR_SPLIT_DEFAULT_OPTIONS } from './angular-split-config.token';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
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
export class SplitComponent {
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
    </ng-template>`, isInline: true, styles: [":host{display:flex;flex-wrap:nowrap;justify-content:flex-start;align-items:stretch;overflow:hidden;width:100%;height:100%}:host>.as-split-gutter{border:none;flex-grow:0;flex-shrink:0;background-color:#eee;display:flex;align-items:center;justify-content:center}:host>.as-split-gutter.as-split-gutter-collapsed{flex-basis:1px!important;pointer-events:none}:host>.as-split-gutter>.as-split-gutter-icon{width:100%;height:100%;background-position:center center;background-repeat:no-repeat}:host ::ng-deep>.as-split-area{flex-grow:0;flex-shrink:0;overflow-x:hidden;overflow-y:auto}:host ::ng-deep>.as-split-area.as-hidden{flex:0 1 0px!important;overflow-x:hidden;overflow-y:hidden}:host.as-horizontal{flex-direction:row}:host.as-horizontal>.as-split-gutter{flex-direction:row;cursor:col-resize;height:100%}:host.as-horizontal>.as-split-gutter>.as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-horizontal ::ng-deep>.as-split-area{height:100%}:host.as-vertical{flex-direction:column}:host.as-vertical>.as-split-gutter{flex-direction:column;cursor:row-resize;width:100%}:host.as-vertical>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC)}:host.as-vertical ::ng-deep>.as-split-area{width:100%}:host.as-vertical ::ng-deep>.as-split-area.as-hidden{max-width:0}:host.as-disabled>.as-split-gutter{cursor:default}:host.as-disabled>.as-split-gutter .as-split-gutter-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==)}:host.as-transition.as-init:not(.as-dragging)>.as-split-gutter,:host.as-transition.as-init:not(.as-dragging) ::ng-deep>.as-split-area{transition:flex-basis .3s}\n"], dependencies: [{ kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXQuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvdGVzdC1jb21wb25lbnQvc3JjL2xpYi9zcGxpdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLHVCQUF1QixFQU92QixZQUFZLEVBRVosWUFBWSxFQUNaLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxVQUFVLEVBQWMsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3ZELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQVk5QyxPQUFPLEVBQ0wsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixjQUFjLEVBQ2QsY0FBYyxFQUNkLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDbkIsK0JBQStCLEVBQy9CLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLG1CQUFtQixHQUNwQixNQUFNLFNBQVMsQ0FBQztBQUNqQixPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQzs7O0FBRTdFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBa0NILE1BQU0sT0FBTyxjQUFjO0lBQ3pCLElBQWEsU0FBUyxDQUFDLENBQTRCO1FBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFFL0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FDdkIsSUFB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c291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICBDb21wb25lbnQsXHJcbiAgSW5wdXQsXHJcbiAgT3V0cHV0LFxyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIFJlbmRlcmVyMixcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIE9uRGVzdHJveSxcclxuICBFbGVtZW50UmVmLFxyXG4gIE5nWm9uZSxcclxuICBWaWV3Q2hpbGRyZW4sXHJcbiAgUXVlcnlMaXN0LFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBJbmplY3QsXHJcbiAgT3B0aW9uYWwsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YnNjcmliZXIsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuaW1wb3J0IHtcclxuICBJQXJlYSxcclxuICBJUG9pbnQsXHJcbiAgSVNwbGl0U25hcHNob3QsXHJcbiAgSUFyZWFTbmFwc2hvdCxcclxuICBJT3V0cHV0RGF0YSxcclxuICBJT3V0cHV0QXJlYVNpemVzLFxyXG4gIElEZWZhdWx0T3B0aW9ucyxcclxufSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IFNwbGl0QXJlYURpcmVjdGl2ZSB9IGZyb20gJy4vc3BsaXQtYXJlYS5kaXJlY3RpdmUnO1xyXG5pbXBvcnQge1xyXG4gIGdldElucHV0UG9zaXRpdmVOdW1iZXIsXHJcbiAgZ2V0SW5wdXRCb29sZWFuLFxyXG4gIGdldEFyZWFNaW5TaXplLFxyXG4gIGdldEFyZWFNYXhTaXplLFxyXG4gIGdldFBvaW50RnJvbUV2ZW50LFxyXG4gIGdldEVsZW1lbnRQaXhlbFNpemUsXHJcbiAgZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eSxcclxuICBpc1VzZXJTaXplc1ZhbGlkLFxyXG4gIHBvaW50RGVsdGFFcXVhbHMsXHJcbiAgdXBkYXRlQXJlYVNpemUsXHJcbiAgZ2V0S2V5Ym9hcmRFbmRwb2ludCxcclxufSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IHsgQU5HVUxBUl9TUExJVF9ERUZBVUxUX09QVElPTlMgfSBmcm9tICcuL2FuZ3VsYXItc3BsaXQtY29uZmlnLnRva2VuJztcclxuXHJcbi8qKlxyXG4gKiBhbmd1bGFyLXNwbGl0XHJcbiAqXHJcbiAqXHJcbiAqICBQRVJDRU5UIE1PREUgKFt1bml0XT1cIidwZXJjZW50J1wiKVxyXG4gKiAgX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xyXG4gKiB8ICAgICAgIEEgICAgICAgW2cxXSAgICAgICBCICAgICAgIFtnMl0gICAgICAgQyAgICAgICBbZzNdICAgICAgIEQgICAgICAgW2c0XSAgICAgICBFICAgICAgIHxcclxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XHJcbiAqIHwgICAgICAgMjAgICAgICAgICAgICAgICAgIDMwICAgICAgICAgICAgICAgICAyMCAgICAgICAgICAgICAgICAgMTUgICAgICAgICAgICAgICAgIDE1ICAgICAgfCA8LS0gW3NpemVdPVwieFwiXHJcbiAqIHwgICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgfCA8LS0gW2d1dHRlclNpemVdPVwiMTBcIlxyXG4gKiB8Y2FsYygyMCUgLSA4cHgpICAgIGNhbGMoMzAlIC0gMTJweCkgICBjYWxjKDIwJSAtIDhweCkgICAgY2FsYygxNSUgLSA2cHgpICAgIGNhbGMoMTUlIC0gNnB4KXwgPC0tIENTUyBmbGV4LWJhc2lzIHByb3BlcnR5ICh3aXRoIGZsZXgtZ3JvdyZzaHJpbmsgYXQgMClcclxuICogfCAgICAgMTUycHggICAgICAgICAgICAgIDIyOHB4ICAgICAgICAgICAgICAxNTJweCAgICAgICAgICAgICAgMTE0cHggICAgICAgICAgICAgIDExNHB4ICAgICB8IDwtLSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxyXG4gKiB8X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX3xcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4MDBweCAgICAgICAgIDwtLSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxyXG4gKiAgZmxleC1iYXNpcyA9IGNhbGMoIHsgYXJlYS5zaXplIH0lIC0geyBhcmVhLnNpemUvMTAwICogbmJHdXR0ZXIqZ3V0dGVyU2l6ZSB9cHggKTtcclxuICpcclxuICpcclxuICogIFBJWEVMIE1PREUgKFt1bml0XT1cIidwaXhlbCdcIilcclxuICogIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cclxuICogfCAgICAgICBBICAgICAgIFtnMV0gICAgICAgQiAgICAgICBbZzJdICAgICAgIEMgICAgICAgW2czXSAgICAgICBEICAgICAgIFtnNF0gICAgICAgRSAgICAgICB8XHJcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiB8ICAgICAgMTAwICAgICAgICAgICAgICAgIDI1MCAgICAgICAgICAgICAgICAgKiAgICAgICAgICAgICAgICAgMTUwICAgICAgICAgICAgICAgIDEwMCAgICAgIHwgPC0tIFtzaXplXT1cInlcIlxyXG4gKiB8ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIDEwcHggICAgICAgICAgICAgICAxMHB4ICAgICAgICAgICAgICAgMTBweCAgICAgICAgICAgICAgIHwgPC0tIFtndXR0ZXJTaXplXT1cIjEwXCJcclxuICogfCAgIDAgMCAxMDBweCAgICAgICAgICAwIDAgMjUwcHggICAgICAgICAgIDEgMSBhdXRvICAgICAgICAgIDAgMCAxNTBweCAgICAgICAgICAwIDAgMTAwcHggICB8IDwtLSBDU1MgZmxleCBwcm9wZXJ0eSAoZmxleC1ncm93L2ZsZXgtc2hyaW5rL2ZsZXgtYmFzaXMpXHJcbiAqIHwgICAgIDEwMHB4ICAgICAgICAgICAgICAyNTBweCAgICAgICAgICAgICAgMjAwcHggICAgICAgICAgICAgIDE1MHB4ICAgICAgICAgICAgICAxMDBweCAgICAgfCA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICogfF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX198XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgODAwcHggICAgICAgICA8LS0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcclxuICpcclxuICovXHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2FzLXNwbGl0JyxcclxuICBleHBvcnRBczogJ2FzU3BsaXQnLFxyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gIHN0eWxlVXJsczogWycuL3NwbGl0LmNvbXBvbmVudC5zY3NzJ10sXHJcbiAgdGVtcGxhdGU6IGAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgPG5nLXRlbXBsYXRlIG5nRm9yIFtuZ0Zvck9mXT1cImRpc3BsYXllZEFyZWFzXCIgbGV0LWFyZWE9XCIkaW1wbGljaXRcIiBsZXQtaW5kZXg9XCJpbmRleFwiIGxldC1sYXN0PVwibGFzdFwiPlxyXG4gICAgICA8ZGl2XHJcbiAgICAgICAgcm9sZT1cInNsaWRlclwiXHJcbiAgICAgICAgdGFiaW5kZXg9XCIwXCJcclxuICAgICAgICAqbmdJZj1cImxhc3QgPT09IGZhbHNlXCJcclxuICAgICAgICAjZ3V0dGVyRWxzXHJcbiAgICAgICAgY2xhc3M9XCJhcy1zcGxpdC1ndXR0ZXJcIlxyXG4gICAgICAgIFtzdHlsZS5mbGV4LWJhc2lzLnB4XT1cImd1dHRlclNpemVcIlxyXG4gICAgICAgIFtzdHlsZS5vcmRlcl09XCJpbmRleCAqIDIgKyAxXCJcclxuICAgICAgICAoa2V5ZG93bik9XCJzdGFydEtleWJvYXJkRHJhZygkZXZlbnQsIGluZGV4ICogMiArIDEsIGluZGV4ICsgMSlcIlxyXG4gICAgICAgIChtb3VzZWRvd24pPVwic3RhcnRNb3VzZURyYWcoJGV2ZW50LCBpbmRleCAqIDIgKyAxLCBpbmRleCArIDEpXCJcclxuICAgICAgICAodG91Y2hzdGFydCk9XCJzdGFydE1vdXNlRHJhZygkZXZlbnQsIGluZGV4ICogMiArIDEsIGluZGV4ICsgMSlcIlxyXG4gICAgICAgIChtb3VzZXVwKT1cImNsaWNrR3V0dGVyKCRldmVudCwgaW5kZXggKyAxKVwiXHJcbiAgICAgICAgKHRvdWNoZW5kKT1cImNsaWNrR3V0dGVyKCRldmVudCwgaW5kZXggKyAxKVwiXHJcbiAgICAgICAgW2F0dHIuYXJpYS1sYWJlbF09XCJndXR0ZXJBcmlhTGFiZWxcIlxyXG4gICAgICAgIFthdHRyLmFyaWEtb3JpZW50YXRpb25dPVwiZGlyZWN0aW9uXCJcclxuICAgICAgICBbYXR0ci5hcmlhLXZhbHVlbWluXT1cImFyZWEubWluU2l6ZVwiXHJcbiAgICAgICAgW2F0dHIuYXJpYS12YWx1ZW1heF09XCJhcmVhLm1heFNpemVcIlxyXG4gICAgICAgIFthdHRyLmFyaWEtdmFsdWVub3ddPVwiYXJlYS5zaXplXCJcclxuICAgICAgICBbYXR0ci5hcmlhLXZhbHVldGV4dF09XCJnZXRBcmlhQXJlYVNpemVUZXh0KGFyZWEuc2l6ZSlcIlxyXG4gICAgICA+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cImFzLXNwbGl0LWd1dHRlci1pY29uXCI+PC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9uZy10ZW1wbGF0ZT5gLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLkVtdWxhdGVkLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgU3BsaXRDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG4gIEBJbnB1dCgpIHNldCBkaXJlY3Rpb24odjogJ2hvcml6b250YWwnIHwgJ3ZlcnRpY2FsJykge1xyXG4gICAgdGhpcy5fZGlyZWN0aW9uID0gdiA9PT0gJ3ZlcnRpY2FsJyA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCc7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsIGBhcy0ke3RoaXMuX2RpcmVjdGlvbn1gKTtcclxuICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3MoXHJcbiAgICAgIHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCxcclxuICAgICAgYGFzLSR7dGhpcy5fZGlyZWN0aW9uID09PSAndmVydGljYWwnID8gJ2hvcml6b250YWwnIDogJ3ZlcnRpY2FsJ31gLFxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmJ1aWxkKGZhbHNlLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBnZXQgZGlyZWN0aW9uKCk6ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNldCB1bml0KHY6ICdwZXJjZW50JyB8ICdwaXhlbCcpIHtcclxuICAgIHRoaXMuX3VuaXQgPSB2ID09PSAncGl4ZWwnID8gJ3BpeGVsJyA6ICdwZXJjZW50JztcclxuXHJcbiAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgYGFzLSR7dGhpcy5fdW5pdH1gKTtcclxuICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCBgYXMtJHt0aGlzLl91bml0ID09PSAncGl4ZWwnID8gJ3BlcmNlbnQnIDogJ3BpeGVsJ31gKTtcclxuXHJcbiAgICB0aGlzLmJ1aWxkKGZhbHNlLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIGdldCB1bml0KCk6ICdwZXJjZW50JyB8ICdwaXhlbCcge1xyXG4gICAgcmV0dXJuIHRoaXMuX3VuaXQ7XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKSBzZXQgZ3V0dGVyU2l6ZSh2OiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICB0aGlzLl9ndXR0ZXJTaXplID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCAxMSk7XHJcblxyXG4gICAgdGhpcy5idWlsZChmYWxzZSwgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGd1dHRlclNpemUoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fZ3V0dGVyU2l6ZTtcclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNldCBndXR0ZXJTdGVwKHY6IG51bWJlcikge1xyXG4gICAgdGhpcy5fZ3V0dGVyU3RlcCA9IGdldElucHV0UG9zaXRpdmVOdW1iZXIodiwgMSk7XHJcbiAgfVxyXG5cclxuICBnZXQgZ3V0dGVyU3RlcCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX2d1dHRlclN0ZXA7XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKSBzZXQgcmVzdHJpY3RNb3ZlKHY6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX3Jlc3RyaWN0TW92ZSA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuICB9XHJcblxyXG4gIGdldCByZXN0cmljdE1vdmUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fcmVzdHJpY3RNb3ZlO1xyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgc2V0IHVzZVRyYW5zaXRpb24odjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fdXNlVHJhbnNpdGlvbiA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuXHJcbiAgICBpZiAodGhpcy5fdXNlVHJhbnNpdGlvbikge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLXRyYW5zaXRpb24nKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnYXMtdHJhbnNpdGlvbicpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IHVzZVRyYW5zaXRpb24oKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXNlVHJhbnNpdGlvbjtcclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNldCBkaXNhYmxlZCh2OiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGdldElucHV0Qm9vbGVhbih2KTtcclxuXHJcbiAgICBpZiAodGhpcy5fZGlzYWJsZWQpIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1kaXNhYmxlZCcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1kaXNhYmxlZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2Rpc2FibGVkO1xyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgc2V0IGRpcih2OiAnbHRyJyB8ICdydGwnKSB7XHJcbiAgICB0aGlzLl9kaXIgPSB2ID09PSAncnRsJyA/ICdydGwnIDogJ2x0cic7XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LCAnZGlyJywgdGhpcy5fZGlyKTtcclxuICB9XHJcblxyXG4gIGdldCBkaXIoKTogJ2x0cicgfCAncnRsJyB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGlyO1xyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgc2V0IGd1dHRlckRibENsaWNrRHVyYXRpb24odjogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9ndXR0ZXJEYmxDbGlja0R1cmF0aW9uID0gZ2V0SW5wdXRQb3NpdGl2ZU51bWJlcih2LCAwKTtcclxuICB9XHJcbiAgZ2V0IGd1dHRlckRibENsaWNrRHVyYXRpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLl9ndXR0ZXJEYmxDbGlja0R1cmF0aW9uO1xyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgZ3V0dGVyQ2xpY2tEZWx0YVB4ID0gMjtcclxuXHJcbiAgQElucHV0KCkgZ3V0dGVyQXJpYUxhYmVsITogc3RyaW5nO1xyXG5cclxuICBAT3V0cHV0KCkgZ2V0IHRyYW5zaXRpb25FbmQoKTogT2JzZXJ2YWJsZTxJT3V0cHV0QXJlYVNpemVzPiB7XHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8SU91dHB1dEFyZWFTaXplcz4oXHJcbiAgICAgIChzdWJzY3JpYmVyOiBTdWJzY3JpYmVyPElPdXRwdXRBcmVhU2l6ZXM+KSA9PiAodGhpcy50cmFuc2l0aW9uRW5kU3Vic2NyaWJlciA9IHN1YnNjcmliZXIpLFxyXG4gICAgKS5waXBlKGRlYm91bmNlVGltZTxJT3V0cHV0QXJlYVNpemVzPigyMCkpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfY29uZmlnOiBJRGVmYXVsdE9wdGlvbnMgPSB7XHJcbiAgICBkaXJlY3Rpb246ICdob3Jpem9udGFsJyxcclxuICAgIHVuaXQ6ICdwZXJjZW50JyxcclxuICAgIGd1dHRlclNpemU6IDExLFxyXG4gICAgZ3V0dGVyU3RlcDogMSxcclxuICAgIHJlc3RyaWN0TW92ZTogZmFsc2UsXHJcbiAgICB1c2VUcmFuc2l0aW9uOiBmYWxzZSxcclxuICAgIGRpc2FibGVkOiBmYWxzZSxcclxuICAgIGRpcjogJ2x0cicsXHJcbiAgICBndXR0ZXJEYmxDbGlja0R1cmF0aW9uOiAwLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSxcclxuICAgIHByaXZhdGUgZWxSZWY6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQU5HVUxBUl9TUExJVF9ERUZBVUxUX09QVElPTlMpIGdsb2JhbENvbmZpZzogSURlZmF1bHRPcHRpb25zLFxyXG4gICkge1xyXG4gICAgLy8gVG8gZm9yY2UgYWRkaW5nIGRlZmF1bHQgY2xhc3MsIGNvdWxkIGJlIG92ZXJyaWRlIGJ5IHVzZXIgQElucHV0KCkgb3Igbm90XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuX2RpcmVjdGlvbjtcclxuICAgIHRoaXMuX2NvbmZpZyA9IGdsb2JhbENvbmZpZyA/IE9iamVjdC5hc3NpZ24odGhpcy5fY29uZmlnLCBnbG9iYWxDb25maWcpIDogdGhpcy5fY29uZmlnO1xyXG5cclxuICAgIHRoaXMuZGlyZWN0aW9uID0gdGhpcy5fY29uZmlnLmRpcmVjdGlvbjtcclxuICAgIHRoaXMudW5pdCA9IHRoaXMuX2NvbmZpZy51bml0O1xyXG4gICAgdGhpcy5ndXR0ZXJTaXplID0gdGhpcy5fY29uZmlnLmd1dHRlclNpemU7XHJcbiAgICB0aGlzLmd1dHRlclN0ZXAgPSB0aGlzLl9jb25maWcuZ3V0dGVyU3RlcDtcclxuICAgIHRoaXMucmVzdHJpY3RNb3ZlID0gdGhpcy5fY29uZmlnLnJlc3RyaWN0TW92ZTtcclxuICAgIHRoaXMudXNlVHJhbnNpdGlvbiA9IHRoaXMuX2NvbmZpZy51c2VUcmFuc2l0aW9uO1xyXG4gICAgdGhpcy5kaXNhYmxlZCA9dGhpcy5fY29uZmlnLmRpc2FibGVkO1xyXG4gICAgdGhpcy5kaXIgPSB0aGlzLl9jb25maWcuZGlyO1xyXG4gICAgdGhpcy5ndXR0ZXJEYmxDbGlja0R1cmF0aW9uID0gdGhpcy5fY29uZmlnLmd1dHRlckRibENsaWNrRHVyYXRpb247XHJcbiAgfVxyXG4gIHByaXZhdGUgX2RpcmVjdGlvbiE6ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCc7XHJcbiAgcHJpdmF0ZSBfdW5pdCE6ICdwZXJjZW50JyB8ICdwaXhlbCc7XHJcbiAgcHJpdmF0ZSBfZ3V0dGVyU2l6ZSE6IG51bWJlciB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfZ3V0dGVyU3RlcCE6IG51bWJlcjtcclxuICBwcml2YXRlIF9yZXN0cmljdE1vdmUhOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX3VzZVRyYW5zaXRpb24hOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX2Rpc2FibGVkITogYm9vbGVhbjtcclxuICBwcml2YXRlIF9kaXIhOiAnbHRyJyB8ICdydGwnO1xyXG4gIHByaXZhdGUgX2d1dHRlckRibENsaWNrRHVyYXRpb24hOiBudW1iZXI7XHJcblxyXG4gIEBPdXRwdXQoKSBkcmFnU3RhcnQgPSBuZXcgRXZlbnRFbWl0dGVyPElPdXRwdXREYXRhPihmYWxzZSk7XHJcbiAgQE91dHB1dCgpIGRyYWdFbmQgPSBuZXcgRXZlbnRFbWl0dGVyPElPdXRwdXREYXRhPihmYWxzZSk7XHJcbiAgQE91dHB1dCgpIGd1dHRlckNsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxJT3V0cHV0RGF0YT4oZmFsc2UpO1xyXG4gIEBPdXRwdXQoKSBndXR0ZXJEYmxDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8SU91dHB1dERhdGE+KGZhbHNlKTtcclxuXHJcbiAgcHJpdmF0ZSB0cmFuc2l0aW9uRW5kU3Vic2NyaWJlciE6IFN1YnNjcmliZXI8SU91dHB1dEFyZWFTaXplcz47XHJcblxyXG4gIHByaXZhdGUgZHJhZ1Byb2dyZXNzU3ViamVjdDogU3ViamVjdDxJT3V0cHV0RGF0YT4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIGRyYWdQcm9ncmVzcyQ6IE9ic2VydmFibGU8SU91dHB1dERhdGE+ID0gdGhpcy5kcmFnUHJvZ3Jlc3NTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xyXG5cclxuICBwcml2YXRlIGlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuICBwcml2YXRlIGlzV2FpdGluZ0NsZWFyID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBpc1dhaXRpbmdJbml0aWFsTW92ZSA9IGZhbHNlO1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXHJcbiAgcHJpdmF0ZSBkcmFnTGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcclxuICBwcml2YXRlIHNuYXBzaG90OiBJU3BsaXRTbmFwc2hvdCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgc3RhcnRQb2ludDogSVBvaW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBlbmRQb2ludDogSVBvaW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBkaXNwbGF5ZWRBcmVhczogQXJyYXk8SUFyZWE+ID0gW107XHJcbiAgcHJpdmF0ZSByZWFkb25seSBoaWRkZW5BcmVhczogQXJyYXk8SUFyZWE+ID0gW107XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oJ2d1dHRlckVscycpIHByaXZhdGUgZ3V0dGVyRWxzITogUXVlcnlMaXN0PEVsZW1lbnRSZWY+O1xyXG5cclxuICBfY2xpY2tUaW1lb3V0OiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgLy8gVG8gYXZvaWQgdHJhbnNpdGlvbiBhdCBmaXJzdCByZW5kZXJpbmdcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWluaXQnKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0TmJHdXR0ZXJzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDAgPyAwIDogdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggLSAxO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFkZEFyZWEoY29tcG9uZW50OiBTcGxpdEFyZWFEaXJlY3RpdmUpOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld0FyZWE6IElBcmVhID0ge1xyXG4gICAgICBjb21wb25lbnQsXHJcbiAgICAgIG9yZGVyOiAwLFxyXG4gICAgICBzaXplOiAwLFxyXG4gICAgICBtaW5TaXplOiBudWxsLFxyXG4gICAgICBtYXhTaXplOiBudWxsLFxyXG4gICAgICBzaXplQmVmb3JlQ29sbGFwc2U6IG51bGwsXHJcbiAgICAgIGd1dHRlckJlZm9yZUNvbGxhcHNlOiAwLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoY29tcG9uZW50LnZpc2libGUgPT09IHRydWUpIHtcclxuICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5wdXNoKG5ld0FyZWEpO1xyXG5cclxuICAgICAgdGhpcy5idWlsZCh0cnVlLCB0cnVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaGlkZGVuQXJlYXMucHVzaChuZXdBcmVhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyByZW1vdmVBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5zb21lKChhKSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KSkge1xyXG4gICAgICBjb25zdCBhcmVhID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5maW5kKChhKSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KTtcclxuICAgICAgaWYgKGFyZWEpIHRoaXMuZGlzcGxheWVkQXJlYXMuc3BsaWNlKHRoaXMuZGlzcGxheWVkQXJlYXMuaW5kZXhPZihhcmVhKSwgMSk7XHJcblxyXG4gICAgICB0aGlzLmJ1aWxkKHRydWUsIHRydWUpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLmhpZGRlbkFyZWFzLnNvbWUoKGEpID0+IGEuY29tcG9uZW50ID09PSBjb21wb25lbnQpKSB7XHJcbiAgICAgIGNvbnN0IGFyZWEgPSB0aGlzLmhpZGRlbkFyZWFzLmZpbmQoKGEpID0+IGEuY29tcG9uZW50ID09PSBjb21wb25lbnQpO1xyXG4gICAgICBpZiAoYXJlYSkgdGhpcy5oaWRkZW5BcmVhcy5zcGxpY2UodGhpcy5oaWRkZW5BcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB1cGRhdGVBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlLCByZXNldE9yZGVyczogYm9vbGVhbiwgcmVzZXRTaXplczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgaWYgKGNvbXBvbmVudC52aXNpYmxlID09PSB0cnVlKSB7XHJcbiAgICAgIHRoaXMuYnVpbGQocmVzZXRPcmRlcnMsIHJlc2V0U2l6ZXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHNob3dBcmVhKGNvbXBvbmVudDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICBjb25zdCBhcmVhID0gdGhpcy5oaWRkZW5BcmVhcy5maW5kKChhKSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcG9uZW50KTtcclxuICAgIGlmIChhcmVhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFyZWFzID0gdGhpcy5oaWRkZW5BcmVhcy5zcGxpY2UodGhpcy5oaWRkZW5BcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuICAgIHRoaXMuZGlzcGxheWVkQXJlYXMucHVzaCguLi5hcmVhcyk7XHJcblxyXG4gICAgdGhpcy5idWlsZCh0cnVlLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBoaWRlQXJlYShjb21wOiBTcGxpdEFyZWFEaXJlY3RpdmUpOiB2b2lkIHtcclxuICAgIGNvbnN0IGFyZWEgPSB0aGlzLmRpc3BsYXllZEFyZWFzLmZpbmQoKGEpID0+IGEuY29tcG9uZW50ID09PSBjb21wKTtcclxuICAgIGlmIChhcmVhID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFyZWFzID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5zcGxpY2UodGhpcy5kaXNwbGF5ZWRBcmVhcy5pbmRleE9mKGFyZWEpLCAxKTtcclxuICAgIGFyZWFzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgaXRlbS5vcmRlciA9IDA7XHJcbiAgICAgIGl0ZW0uc2l6ZSA9IDA7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaGlkZGVuQXJlYXMucHVzaCguLi5hcmVhcyk7XHJcblxyXG4gICAgdGhpcy5idWlsZCh0cnVlLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRWaXNpYmxlQXJlYVNpemVzKCk6IElPdXRwdXRBcmVhU2l6ZXMge1xyXG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheWVkQXJlYXMubWFwKChhKSA9PiAoYS5zaXplID09PSBudWxsID8gJyonIDogYS5zaXplKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2V0VmlzaWJsZUFyZWFTaXplcyhzaXplczogSU91dHB1dEFyZWFTaXplcyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHNpemVzLmxlbmd0aCAhPT0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZvcm1hdHRlZFNpemVzID0gc2l6ZXMubWFwKChzKSA9PiBnZXRJbnB1dFBvc2l0aXZlTnVtYmVyKHMsIG51bGwpKTtcclxuICAgIGNvbnN0IGlzVmFsaWQgPSBpc1VzZXJTaXplc1ZhbGlkKHRoaXMudW5pdCwgZm9ybWF0dGVkU2l6ZXMpO1xyXG5cclxuICAgIGlmIChpc1ZhbGlkID09PSBmYWxzZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKFxyXG4gICAgICAoYXJlYSwgaSkgPT4ge1xyXG4gICAgICAgIGFyZWEuY29tcG9uZW50LnNpemUgPSBmb3JtYXR0ZWRTaXplc1tpXTsgLy8gc2V0U2l6ZSgpLl9zaXplXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmJ1aWxkKGZhbHNlLCB0cnVlKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBidWlsZChyZXNldE9yZGVyczogYm9vbGVhbiwgcmVzZXRTaXplczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy5zdG9wRHJhZ2dpbmcoKTtcclxuXHJcbiAgICAvLyDCpCBBUkVBUyBPUkRFUlxyXG5cclxuICAgIGlmIChyZXNldE9yZGVycyA9PT0gdHJ1ZSkge1xyXG4gICAgICAvLyBJZiB1c2VyIHByb3ZpZGVkICdvcmRlcicgZm9yIGVhY2ggYXJlYSwgdXNlIGl0IHRvIHNvcnQgdGhlbS5cclxuICAgICAgaWYgKHRoaXMuZGlzcGxheWVkQXJlYXMuZXZlcnkoKGEpID0+IGEuY29tcG9uZW50Lm9yZGVyICE9PSBudWxsKSkge1xyXG4gICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuc29ydCgoYSwgYikgPT4gPG51bWJlcj5hLmNvbXBvbmVudC5vcmRlciAtIDxudW1iZXI+Yi5jb21wb25lbnQub3JkZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUaGVuIHNldCByZWFsIG9yZGVyIHdpdGggbXVsdGlwbGVzIG9mIDIsIG51bWJlcnMgYmV0d2VlbiB3aWxsIGJlIHVzZWQgYnkgZ3V0dGVycy5cclxuICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKChhcmVhLCBpKSA9PiB7XHJcbiAgICAgICAgYXJlYS5vcmRlciA9IGkgKiAyO1xyXG4gICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlT3JkZXIoYXJlYS5vcmRlcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIMKkIEFSRUFTIFNJWkVcclxuXHJcbiAgICBpZiAocmVzZXRTaXplcyA9PT0gdHJ1ZSkge1xyXG4gICAgICBjb25zdCB1c2VVc2VyU2l6ZXMgPSBpc1VzZXJTaXplc1ZhbGlkKFxyXG4gICAgICAgIHRoaXMudW5pdCxcclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLm1hcCgoYSkgPT4gYS5jb21wb25lbnQuc2l6ZSksXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBzd2l0Y2ggKHRoaXMudW5pdCkge1xyXG4gICAgICAgIGNhc2UgJ3BlcmNlbnQnOiB7XHJcbiAgICAgICAgICBjb25zdCBkZWZhdWx0U2l6ZSA9IDEwMCAvIHRoaXMuZGlzcGxheWVkQXJlYXMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSkgPT4ge1xyXG4gICAgICAgICAgICBhcmVhLnNpemUgPSB1c2VVc2VyU2l6ZXMgPyA8bnVtYmVyPmFyZWEuY29tcG9uZW50LnNpemUgOiBkZWZhdWx0U2l6ZTtcclxuICAgICAgICAgICAgYXJlYS5taW5TaXplID0gZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgIGFyZWEubWF4U2l6ZSA9IGdldEFyZWFNYXhTaXplKGFyZWEpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FzZSAncGl4ZWwnOiB7XHJcbiAgICAgICAgICBpZiAodXNlVXNlclNpemVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSkgPT4ge1xyXG4gICAgICAgICAgICAgIGFyZWEuc2l6ZSA9IGFyZWEuY29tcG9uZW50LnNpemU7XHJcbiAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgYXJlYS5tYXhTaXplID0gZ2V0QXJlYU1heFNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3Qgd2lsZGNhcmRTaXplQXJlYXMgPSB0aGlzLmRpc3BsYXllZEFyZWFzLmZpbHRlcigoYSkgPT4gYS5jb21wb25lbnQuc2l6ZSA9PT0gbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAvLyBObyB3aWxkY2FyZCBhcmVhID4gTmVlZCB0byBzZWxlY3Qgb25lIGFyYml0cmFyaWx5ID4gZmlyc3RcclxuICAgICAgICAgICAgaWYgKHdpbGRjYXJkU2l6ZUFyZWFzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goKGFyZWEsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGFyZWEuc2l6ZSA9IGkgPT09IDAgPyBudWxsIDogYXJlYS5jb21wb25lbnQuc2l6ZTtcclxuICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IGkgPT09IDAgPyBudWxsIDogZ2V0QXJlYU1pblNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBpID09PSAwID8gbnVsbCA6IGdldEFyZWFNYXhTaXplKGFyZWEpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdpbGRjYXJkU2l6ZUFyZWFzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAvLyBNb3JlIHRoYW4gb25lIHdpbGRjYXJkIGFyZWEgPiBOZWVkIHRvIGtlZXAgb25seSBvbmUgYXJiaXRyYXJpbHkgPiBmaXJzdFxyXG4gICAgICAgICAgICAgIGxldCBhbHJlYWR5R290T25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKChhcmVhKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXJlYS5jb21wb25lbnQuc2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoYWxyZWFkeUdvdE9uZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIGFyZWEubWluU2l6ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJlYS5tYXhTaXplID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBhbHJlYWR5R290T25lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJlYS5taW5TaXplID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBhcmVhLm1heFNpemUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBhcmVhLnNpemUgPSBhcmVhLmNvbXBvbmVudC5zaXplO1xyXG4gICAgICAgICAgICAgICAgICBhcmVhLm1pblNpemUgPSBnZXRBcmVhTWluU2l6ZShhcmVhKTtcclxuICAgICAgICAgICAgICAgICAgYXJlYS5tYXhTaXplID0gZ2V0QXJlYU1heFNpemUoYXJlYSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmVmcmVzaFN0eWxlU2l6ZXMoKTtcclxuICAgIHRoaXMuY2RSZWYubWFya0ZvckNoZWNrKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlZnJlc2hTdHlsZVNpemVzKCk6IHZvaWQge1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gUEVSQ0VOVCBNT0RFXHJcbiAgICBpZiAodGhpcy51bml0ID09PSAncGVyY2VudCcpIHtcclxuICAgICAgLy8gT25seSBvbmUgYXJlYSA+IGZsZXgtYmFzaXMgMTAwJVxyXG4gICAgICBpZiAodGhpcy5kaXNwbGF5ZWRBcmVhcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzWzBdLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMCwgMCwgJzEwMCUnLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIE11bHRpcGxlIGFyZWFzID4gdXNlIGVhY2ggcGVyY2VudCBiYXNpc1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXHJcbiAgICAgICAgY29uc3Qgc3VtR3V0dGVyU2l6ZSA9IHRoaXMuZ2V0TmJHdXR0ZXJzKCkgKiB0aGlzLmd1dHRlclNpemUhO1xyXG5cclxuICAgICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goKGFyZWEpID0+IHtcclxuICAgICAgICAgIGFyZWEuY29tcG9uZW50LnNldFN0eWxlRmxleChcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgYGNhbGMoICR7YXJlYS5zaXplfSUgLSAkeyg8bnVtYmVyPmFyZWEuc2l6ZSAvIDEwMCkgKiBzdW1HdXR0ZXJTaXplfXB4IClgLFxyXG4gICAgICAgICAgICBhcmVhLm1pblNpemUgIT09IG51bGwgJiYgYXJlYS5taW5TaXplID09PSBhcmVhLnNpemUsXHJcbiAgICAgICAgICAgIGFyZWEubWF4U2l6ZSAhPT0gbnVsbCAmJiBhcmVhLm1heFNpemUgPT09IGFyZWEuc2l6ZSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodGhpcy51bml0ID09PSAncGl4ZWwnKSB7XHJcbiAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgLy8gUElYRUwgTU9ERVxyXG4gICAgICB0aGlzLmRpc3BsYXllZEFyZWFzLmZvckVhY2goKGFyZWEpID0+IHtcclxuICAgICAgICAvLyBBcmVhIHdpdGggd2lsZGNhcmQgc2l6ZVxyXG4gICAgICAgIGlmIChhcmVhLnNpemUgPT09IG51bGwpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMSwgMSwgJzEwMCUnLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXJlYS5jb21wb25lbnQuc2V0U3R5bGVGbGV4KDEsIDEsICdhdXRvJywgZmFsc2UsIGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gQXJlYSB3aXRoIHBpeGVsIHNpemVcclxuICAgICAgICAgIC8vIE9ubHkgb25lIGFyZWEgPiBmbGV4LWJhc2lzIDEwMCVcclxuICAgICAgICAgIGlmICh0aGlzLmRpc3BsYXllZEFyZWFzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoMCwgMCwgJzEwMCUnLCBmYWxzZSwgZmFsc2UpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gTXVsdGlwbGUgYXJlYXMgPiB1c2UgZWFjaCBwaXhlbCBiYXNpc1xyXG4gICAgICAgICAgICBhcmVhLmNvbXBvbmVudC5zZXRTdHlsZUZsZXgoXHJcbiAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAgIGAke2FyZWEuc2l6ZX1weGAsXHJcbiAgICAgICAgICAgICAgYXJlYS5taW5TaXplICE9PSBudWxsICYmIGFyZWEubWluU2l6ZSA9PT0gYXJlYS5zaXplLFxyXG4gICAgICAgICAgICAgIGFyZWEubWF4U2l6ZSAhPT0gbnVsbCAmJiBhcmVhLm1heFNpemUgPT09IGFyZWEuc2l6ZSxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGNsaWNrR3V0dGVyKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCwgZ3V0dGVyTnVtOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IHRlbXBQb2ludCA9IGdldFBvaW50RnJvbUV2ZW50KGV2ZW50KTtcclxuXHJcbiAgICAvLyBCZSBzdXJlIG1vdXNldXAvdG91Y2hlbmQgaGFwcGVuZWQgaWYgdG91Y2gvY3Vyc29yIGlzIG5vdCBtb3ZlZC5cclxuICAgIGlmIChcclxuICAgICAgdGhpcy5zdGFydFBvaW50ICYmXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXHJcbiAgICAgIHBvaW50RGVsdGFFcXVhbHModGhpcy5zdGFydFBvaW50LCB0ZW1wUG9pbnQhLCB0aGlzLmd1dHRlckNsaWNrRGVsdGFQeCkgJiZcclxuICAgICAgKCF0aGlzLmlzRHJhZ2dpbmcgfHwgdGhpcy5pc1dhaXRpbmdJbml0aWFsTW92ZSlcclxuICAgICkge1xyXG4gICAgICAvLyBJZiB0aW1lb3V0IGluIHByb2dyZXNzIGFuZCBuZXcgY2xpY2sgPiBjbGVhclRpbWVvdXQgJiBkYmxDbGlja0V2ZW50XHJcbiAgICAgIGlmICh0aGlzLl9jbGlja1RpbWVvdXQgIT09IG51bGwpIHtcclxuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX2NsaWNrVGltZW91dCk7XHJcbiAgICAgICAgdGhpcy5fY2xpY2tUaW1lb3V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLm5vdGlmeSgnZGJsY2xpY2snLCBndXR0ZXJOdW0pO1xyXG4gICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRWxzZSBzdGFydCB0aW1lb3V0IHRvIGNhbGwgY2xpY2tFdmVudCBhdCBlbmRcclxuICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgdGhpcy5ub3RpZnkoJ2NsaWNrJywgZ3V0dGVyTnVtKTtcclxuICAgICAgICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgICAgICAgfSwgdGhpcy5ndXR0ZXJEYmxDbGlja0R1cmF0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0S2V5Ym9hcmREcmFnKGV2ZW50OiBLZXlib2FyZEV2ZW50LCBndXR0ZXJPcmRlcjogbnVtYmVyLCBndXR0ZXJOdW06IG51bWJlcikge1xyXG4gICAgaWYgKHRoaXMuZGlzYWJsZWQgPT09IHRydWUgfHwgdGhpcy5pc1dhaXRpbmdDbGVhciA9PT0gdHJ1ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZW5kUG9pbnQgPSBnZXRLZXlib2FyZEVuZHBvaW50KGV2ZW50LCB0aGlzLmRpcmVjdGlvbik7XHJcbiAgICBpZiAoZW5kUG9pbnQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5lbmRQb2ludCA9IGVuZFBvaW50O1xyXG4gICAgdGhpcy5zdGFydFBvaW50ID0gZ2V0UG9pbnRGcm9tRXZlbnQoZXZlbnQpO1xyXG5cclxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICB0aGlzLnNldHVwRm9yRHJhZ0V2ZW50KGd1dHRlck9yZGVyLCBndXR0ZXJOdW0pO1xyXG4gICAgdGhpcy5zdGFydERyYWdnaW5nKCk7XHJcbiAgICB0aGlzLmRyYWcoKTtcclxuICAgIHRoaXMuc3RvcERyYWdnaW5nKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRNb3VzZURyYWcoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50LCBndXR0ZXJPcmRlcjogbnVtYmVyLCBndXR0ZXJOdW06IG51bWJlcik6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIHRoaXMuc3RhcnRQb2ludCA9IGdldFBvaW50RnJvbUV2ZW50KGV2ZW50KTtcclxuICAgIGlmICh0aGlzLnN0YXJ0UG9pbnQgPT09IG51bGwgfHwgdGhpcy5kaXNhYmxlZCA9PT0gdHJ1ZSB8fCB0aGlzLmlzV2FpdGluZ0NsZWFyID09PSB0cnVlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldHVwRm9yRHJhZ0V2ZW50KGd1dHRlck9yZGVyLCBndXR0ZXJOdW0pO1xyXG5cclxuICAgIHRoaXMuZHJhZ0xpc3RlbmVycy5wdXNoKHRoaXMucmVuZGVyZXIubGlzdGVuKCdkb2N1bWVudCcsICdtb3VzZXVwJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSkpO1xyXG4gICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ3RvdWNoZW5kJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSkpO1xyXG4gICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ3RvdWNoY2FuY2VsJywgdGhpcy5zdG9wRHJhZ2dpbmcuYmluZCh0aGlzKSkpO1xyXG5cclxuICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgdGhpcy5kcmFnTGlzdGVuZXJzLnB1c2godGhpcy5yZW5kZXJlci5saXN0ZW4oJ2RvY3VtZW50JywgJ21vdXNlbW92ZScsIHRoaXMubW91c2VEcmFnRXZlbnQuYmluZCh0aGlzKSkpO1xyXG4gICAgICB0aGlzLmRyYWdMaXN0ZW5lcnMucHVzaCh0aGlzLnJlbmRlcmVyLmxpc3RlbignZG9jdW1lbnQnLCAndG91Y2htb3ZlJywgdGhpcy5tb3VzZURyYWdFdmVudC5iaW5kKHRoaXMpKSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0RHJhZ2dpbmcoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0dXBGb3JEcmFnRXZlbnQoZ3V0dGVyT3JkZXI6IG51bWJlciwgZ3V0dGVyTnVtOiBudW1iZXIpIHtcclxuICAgIHRoaXMuc25hcHNob3QgPSB7XHJcbiAgICAgIGd1dHRlck51bSxcclxuICAgICAgbGFzdFN0ZXBwZWRPZmZzZXQ6IDAsXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXHJcbiAgICAgIGFsbEFyZWFzU2l6ZVBpeGVsOiBnZXRFbGVtZW50UGl4ZWxTaXplKHRoaXMuZWxSZWYsIHRoaXMuZGlyZWN0aW9uKSAtIHRoaXMuZ2V0TmJHdXR0ZXJzKCkgKiB0aGlzLmd1dHRlclNpemUhLFxyXG4gICAgICBhbGxJbnZvbHZlZEFyZWFzU2l6ZVBlcmNlbnQ6IDEwMCxcclxuICAgICAgYXJlYXNCZWZvcmVHdXR0ZXI6IFtdLFxyXG4gICAgICBhcmVhc0FmdGVyR3V0dGVyOiBbXSxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5kaXNwbGF5ZWRBcmVhcy5mb3JFYWNoKChhcmVhKSA9PiB7XHJcbiAgICAgIGlmIChhcmVhID09PSBudWxsKSByZXR1cm47XHJcbiAgICAgIGNvbnN0IGFyZWFTbmFwc2hvdDogSUFyZWFTbmFwc2hvdCA9IHtcclxuICAgICAgICBhcmVhLFxyXG4gICAgICAgIHNpemVQaXhlbEF0U3RhcnQ6IGdldEVsZW1lbnRQaXhlbFNpemUoYXJlYS5jb21wb25lbnQuZWxSZWYsIHRoaXMuZGlyZWN0aW9uKSxcclxuICAgICAgICBzaXplUGVyY2VudEF0U3RhcnQ6IHRoaXMudW5pdCA9PT0gJ3BlcmNlbnQnID8gKGFyZWEuc2l6ZSA/PyAtMSkgOiAtMSwgLy8gSWYgcGl4ZWwgbW9kZSwgYW55d2F5LCB3aWxsIG5vdCBiZSB1c2VkLlxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKHRoaXMuc25hcHNob3QgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgaWYgKGFyZWEub3JkZXIgPCBndXR0ZXJPcmRlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXN0cmljdE1vdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIgPSBbYXJlYVNuYXBzaG90XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlci51bnNoaWZ0KGFyZWFTbmFwc2hvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIGlmIChhcmVhLm9yZGVyID4gZ3V0dGVyT3JkZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5yZXN0cmljdE1vdmUgPT09IHRydWUpIHtcclxuICAgICAgICAgIGlmICh0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlciA9IFthcmVhU25hcHNob3RdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIucHVzaChhcmVhU25hcHNob3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5zbmFwc2hvdC5hbGxJbnZvbHZlZEFyZWFzU2l6ZVBlcmNlbnQgPSBbXHJcbiAgICAgIC4uLnRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIsXHJcbiAgICAgIC4uLnRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlcixcclxuICAgIF0ucmVkdWNlKCh0LCBhKSA9PiB0ICsgYS5zaXplUGVyY2VudEF0U3RhcnQsIDApO1xyXG5cclxuICAgIGlmICh0aGlzLnNuYXBzaG90LmFyZWFzQmVmb3JlR3V0dGVyLmxlbmd0aCA9PT0gMCB8fCB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhcnREcmFnZ2luZygpIHtcclxuICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSkgPT4gYXJlYS5jb21wb25lbnQubG9ja0V2ZW50cygpKTtcclxuXHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5pc1dhaXRpbmdJbml0aWFsTW92ZSA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG1vdXNlRHJhZ0V2ZW50KGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IHZvaWQge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgIGNvbnN0IHRlbXBQb2ludCA9IGdldFBvaW50RnJvbUV2ZW50KGV2ZW50KTtcclxuICAgIGlmICh0aGlzLl9jbGlja1RpbWVvdXQgIT09IG51bGwgJiYgdGhpcy5zdGFydFBvaW50ICE9PSBudWxsICYmIHRlbXBQb2ludCAhPT0gbnVsbCkge1xyXG4gICAgICBpZiAoIXBvaW50RGVsdGFFcXVhbHModGhpcy5zdGFydFBvaW50LCB0ZW1wUG9pbnQsIHRoaXMuZ3V0dGVyQ2xpY2tEZWx0YVB4KSkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fY2xpY2tUaW1lb3V0KTtcclxuICAgICAgICB0aGlzLl9jbGlja1RpbWVvdXQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW5kUG9pbnQgPSBnZXRQb2ludEZyb21FdmVudChldmVudCk7XHJcbiAgICBpZiAodGhpcy5lbmRQb2ludCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kcmFnKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRyYWcoKSB7XHJcbiAgICBpZiAodGhpcy5pc1dhaXRpbmdJbml0aWFsTW92ZSkge1xyXG4gICAgICBpZiAodGhpcy5zdGFydFBvaW50ICE9PSBudWxsICYmIHRoaXMuZW5kUG9pbnQgIT09IG51bGwpIHtcclxuICAgICAgICBpZiAodGhpcy5zdGFydFBvaW50LnggIT09IHRoaXMuZW5kUG9pbnQueCB8fCB0aGlzLnN0YXJ0UG9pbnQueSAhPT0gdGhpcy5lbmRQb2ludC55KSB7XHJcbiAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmlzV2FpdGluZ0luaXRpYWxNb3ZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmFkZENsYXNzKHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudCwgJ2FzLWRyYWdnaW5nJyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNuYXBzaG90ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyh0aGlzLmd1dHRlckVscy50b0FycmF5KClbdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0gLSAxXS5uYXRpdmVFbGVtZW50LCAnYXMtZHJhZ2dlZCcpO1xyXG4gICAgICAgICAgICAgIHRoaXMubm90aWZ5KCdzdGFydCcsIHRoaXMuc25hcHNob3QuZ3V0dGVyTnVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgc3RlcHBlZE9mZnNldFxyXG5cclxuICAgIGxldCBvZmZzZXQgPVxyXG4gICAgICB0aGlzLnN0YXJ0UG9pbnQgPT09IG51bGwgfHwgdGhpcy5lbmRQb2ludCA9PT0gbnVsbCA/IDAgOlxyXG4gICAgICB0aGlzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gdGhpcy5zdGFydFBvaW50LnggLSB0aGlzLmVuZFBvaW50LnggOiB0aGlzLnN0YXJ0UG9pbnQueSAtIHRoaXMuZW5kUG9pbnQueTtcclxuXHJcbiAgICAvLyBSVEwgcmVxdWlyZXMgbmVnYXRpdmUgb2Zmc2V0IG9ubHkgaW4gaG9yaXpvbnRhbCBtb2RlIGFzIGluIHZlcnRpY2FsXHJcbiAgICAvLyBSVEwgaGFzIG5vIGVmZmVjdCBvbiBkcmFnIGRpcmVjdGlvbi5cclxuICAgIGlmICh0aGlzLmRpciA9PT0gJ3J0bCcgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xyXG4gICAgICBvZmZzZXQgPSAtb2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0ZXBwZWRPZmZzZXQgPSBNYXRoLnJvdW5kKG9mZnNldCAvIHRoaXMuZ3V0dGVyU3RlcCkgKiB0aGlzLmd1dHRlclN0ZXA7XHJcblxyXG4gICAgaWYgKHRoaXMuc25hcHNob3QgPT09IG51bGwpIHJldHVybjtcclxuXHJcbiAgICBpZiAoc3RlcHBlZE9mZnNldCA9PT0gdGhpcy5zbmFwc2hvdC5sYXN0U3RlcHBlZE9mZnNldCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zbmFwc2hvdC5sYXN0U3RlcHBlZE9mZnNldCA9IHN0ZXBwZWRPZmZzZXQ7XHJcblxyXG4gICAgLy8gTmVlZCB0byBrbm93IGlmIGVhY2ggZ3V0dGVyIHNpZGUgYXJlYXMgY291bGQgcmVhY3RzIHRvIHN0ZXBwZWRPZmZzZXRcclxuXHJcbiAgICBsZXQgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KFxyXG4gICAgICB0aGlzLnVuaXQsXHJcbiAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNCZWZvcmVHdXR0ZXIsXHJcbiAgICAgIC1zdGVwcGVkT2Zmc2V0LFxyXG4gICAgICB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsLFxyXG4gICAgKTtcclxuICAgIGxldCBhcmVhc0FmdGVyID0gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eShcclxuICAgICAgdGhpcy51bml0LFxyXG4gICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIsXHJcbiAgICAgIHN0ZXBwZWRPZmZzZXQsXHJcbiAgICAgIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwsXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEVhY2ggZ3V0dGVyIHNpZGUgYXJlYXMgY2FuJ3QgYWJzb3JiIGFsbCBvZmZzZXRcclxuICAgIGlmIChhcmVhc0JlZm9yZS5yZW1haW4gIT09IDAgJiYgYXJlYXNBZnRlci5yZW1haW4gIT09IDApIHtcclxuICAgICAgaWYgKE1hdGguYWJzKGFyZWFzQmVmb3JlLnJlbWFpbikgPT09IE1hdGguYWJzKGFyZWFzQWZ0ZXIucmVtYWluKSkge1xyXG4gICAgICB9IGVsc2UgaWYgKE1hdGguYWJzKGFyZWFzQmVmb3JlLnJlbWFpbikgPiBNYXRoLmFicyhhcmVhc0FmdGVyLnJlbWFpbikpIHtcclxuICAgICAgICBhcmVhc0FmdGVyID0gZ2V0R3V0dGVyU2lkZUFic29ycHRpb25DYXBhY2l0eShcclxuICAgICAgICAgIHRoaXMudW5pdCxcclxuICAgICAgICAgIHRoaXMuc25hcHNob3QuYXJlYXNBZnRlckd1dHRlcixcclxuICAgICAgICAgIHN0ZXBwZWRPZmZzZXQgKyBhcmVhc0JlZm9yZS5yZW1haW4sXHJcbiAgICAgICAgICB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KFxyXG4gICAgICAgICAgdGhpcy51bml0LFxyXG4gICAgICAgICAgdGhpcy5zbmFwc2hvdC5hcmVhc0JlZm9yZUd1dHRlcixcclxuICAgICAgICAgIC0oc3RlcHBlZE9mZnNldCAtIGFyZWFzQWZ0ZXIucmVtYWluKSxcclxuICAgICAgICAgIHRoaXMuc25hcHNob3QuYWxsQXJlYXNTaXplUGl4ZWwsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChhcmVhc0JlZm9yZS5yZW1haW4gIT09IDApIHtcclxuICAgICAgLy8gQXJlYXMgYmVmb3JlIGd1dHRlciBjYW4ndCBhYnNvcmJzIGFsbCBvZmZzZXQgPiBuZWVkIHRvIHJlY2FsY3VsYXRlIHNpemVzIGZvciBhcmVhcyBhZnRlciBndXR0ZXIuXHJcbiAgICAgIGFyZWFzQWZ0ZXIgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KFxyXG4gICAgICAgIHRoaXMudW5pdCxcclxuICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQWZ0ZXJHdXR0ZXIsXHJcbiAgICAgICAgc3RlcHBlZE9mZnNldCArIGFyZWFzQmVmb3JlLnJlbWFpbixcclxuICAgICAgICB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsLFxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIGlmIChhcmVhc0FmdGVyLnJlbWFpbiAhPT0gMCkge1xyXG4gICAgICAvLyBBcmVhcyBhZnRlciBndXR0ZXIgY2FuJ3QgYWJzb3JicyBhbGwgb2Zmc2V0ID4gbmVlZCB0byByZWNhbGN1bGF0ZSBzaXplcyBmb3IgYXJlYXMgYmVmb3JlIGd1dHRlci5cclxuICAgICAgYXJlYXNCZWZvcmUgPSBnZXRHdXR0ZXJTaWRlQWJzb3JwdGlvbkNhcGFjaXR5KFxyXG4gICAgICAgIHRoaXMudW5pdCxcclxuICAgICAgICB0aGlzLnNuYXBzaG90LmFyZWFzQmVmb3JlR3V0dGVyLFxyXG4gICAgICAgIC0oc3RlcHBlZE9mZnNldCAtIGFyZWFzQWZ0ZXIucmVtYWluKSxcclxuICAgICAgICB0aGlzLnNuYXBzaG90LmFsbEFyZWFzU2l6ZVBpeGVsLFxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnVuaXQgPT09ICdwZXJjZW50Jykge1xyXG4gICAgICAvLyBIYWNrIGJlY2F1c2Ugb2YgYnJvd3NlciBtZXNzaW5nIHVwIHdpdGggc2l6ZXMgdXNpbmcgY2FsYyhYJSAtIFlweCkgLT4gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgLy8gSWYgbm90IHRoZXJlLCBwbGF5aW5nIHdpdGggZ3V0dGVycyBtYWtlcyB0b3RhbCBnb2luZyBkb3duIHRvIDk5Ljk5ODc1JSB0aGVuIDk5Ljk5Mjg2JSwgOTkuOTg5ODYlLC4uXHJcbiAgICAgIGNvbnN0IGFsbCA9IFsuLi5hcmVhc0JlZm9yZS5saXN0LCAuLi5hcmVhc0FmdGVyLmxpc3RdO1xyXG4gICAgICBjb25zdCBhcmVhVG9SZXNldCA9IGFsbC5maW5kKFxyXG4gICAgICAgIChhKSA9PlxyXG4gICAgICAgICAgYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uICE9PSAwICYmXHJcbiAgICAgICAgICBhLnBlcmNlbnRBZnRlckFic29ycHRpb24gIT09IGEuYXJlYVNuYXBzaG90LmFyZWEubWluU2l6ZSAmJlxyXG4gICAgICAgICAgYS5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uICE9PSBhLmFyZWFTbmFwc2hvdC5hcmVhLm1heFNpemUsXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBpZiAoYXJlYVRvUmVzZXQpIHtcclxuICAgICAgICBhcmVhVG9SZXNldC5wZXJjZW50QWZ0ZXJBYnNvcnB0aW9uID1cclxuICAgICAgICAgIHRoaXMuc25hcHNob3QuYWxsSW52b2x2ZWRBcmVhc1NpemVQZXJjZW50IC1cclxuICAgICAgICAgIGFsbC5maWx0ZXIoKGEpID0+IGEgIT09IGFyZWFUb1Jlc2V0KS5yZWR1Y2UoKHRvdGFsLCBhKSA9PiB0b3RhbCArIGEucGVyY2VudEFmdGVyQWJzb3JwdGlvbiwgMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBOb3cgd2Uga25vdyBhcmVhcyBjb3VsZCBhYnNvcmIgc3RlcHBlZE9mZnNldCwgdGltZSB0byByZWFsbHkgdXBkYXRlIHNpemVzXHJcblxyXG4gICAgYXJlYXNCZWZvcmUubGlzdC5mb3JFYWNoKChpdGVtKSA9PiB1cGRhdGVBcmVhU2l6ZSh0aGlzLnVuaXQsIGl0ZW0pKTtcclxuICAgIGFyZWFzQWZ0ZXIubGlzdC5mb3JFYWNoKChpdGVtKSA9PiB1cGRhdGVBcmVhU2l6ZSh0aGlzLnVuaXQsIGl0ZW0pKTtcclxuXHJcbiAgICB0aGlzLnJlZnJlc2hTdHlsZVNpemVzKCk7XHJcbiAgICB0aGlzLm5vdGlmeSgncHJvZ3Jlc3MnLCB0aGlzLnNuYXBzaG90Lmd1dHRlck51bSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN0b3BEcmFnZ2luZyhldmVudD86IEV2ZW50KTogdm9pZCB7XHJcbiAgICBpZiAoZXZlbnQpIHtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaXNEcmFnZ2luZyA9PT0gZmFsc2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZGlzcGxheWVkQXJlYXMuZm9yRWFjaCgoYXJlYSkgPT4gYXJlYS5jb21wb25lbnQudW5sb2NrRXZlbnRzKCkpO1xyXG5cclxuICAgIHdoaWxlICh0aGlzLmRyYWdMaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmY3QgPSB0aGlzLmRyYWdMaXN0ZW5lcnMucG9wKCk7XHJcbiAgICAgIGlmIChmY3QpIHtcclxuICAgICAgICBmY3QoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFdhcm5pbmc6IEhhdmUgdG8gYmUgYmVmb3JlIFwibm90aWZ5KCdlbmQnKVwiXHJcbiAgICAvLyBiZWNhdXNlIFwibm90aWZ5KCdlbmQnKVwiXCIgY2FuIGJlIGxpbmtlZCB0byBcIltzaXplXT0neCdcIiA+IFwiYnVpbGQoKVwiID4gXCJzdG9wRHJhZ2dpbmcoKVwiXHJcbiAgICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBJZiBtb3ZlZCBmcm9tIHN0YXJ0aW5nIHBvaW50LCBub3RpZnkgZW5kXHJcbiAgICBpZiAodGhpcy5pc1dhaXRpbmdJbml0aWFsTW92ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgaWYgKHRoaXMuc25hcHNob3QgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm5vdGlmeSgnZW5kJywgdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQsICdhcy1kcmFnZ2luZycpO1xyXG4gICAgaWYgKHRoaXMuc25hcHNob3QgIT09IG51bGwpIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLmd1dHRlckVscy50b0FycmF5KClbdGhpcy5zbmFwc2hvdC5ndXR0ZXJOdW0gLSAxXS5uYXRpdmVFbGVtZW50LCAnYXMtZHJhZ2dlZCcpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zbmFwc2hvdCA9IG51bGw7XHJcbiAgICB0aGlzLmlzV2FpdGluZ0NsZWFyID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBOZWVkZWQgdG8gbGV0IChjbGljayk9XCJjbGlja0d1dHRlciguLi4pXCIgZXZlbnQgcnVuIGFuZCB2ZXJpZnkgaWYgbW91c2UgbW92ZWQgb3Igbm90XHJcbiAgICB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuc3RhcnRQb2ludCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbmRQb2ludCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc1dhaXRpbmdDbGVhciA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5vdGlmeSh0eXBlOiAnc3RhcnQnIHwgJ3Byb2dyZXNzJyB8ICdlbmQnIHwgJ2NsaWNrJyB8ICdkYmxjbGljaycgfCAndHJhbnNpdGlvbkVuZCcsIGd1dHRlck51bTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBzaXplcyA9IHRoaXMuZ2V0VmlzaWJsZUFyZWFTaXplcygpO1xyXG5cclxuICAgIGlmICh0eXBlID09PSAnc3RhcnQnKSB7XHJcbiAgICAgIHRoaXMuZHJhZ1N0YXJ0LmVtaXQoeyBndXR0ZXJOdW0sIHNpemVzIH0pO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnZW5kJykge1xyXG4gICAgICB0aGlzLmRyYWdFbmQuZW1pdCh7IGd1dHRlck51bSwgc2l6ZXMgfSk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjbGljaycpIHtcclxuICAgICAgdGhpcy5ndXR0ZXJDbGljay5lbWl0KHsgZ3V0dGVyTnVtLCBzaXplcyB9KTtcclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2RibGNsaWNrJykge1xyXG4gICAgICB0aGlzLmd1dHRlckRibENsaWNrLmVtaXQoeyBndXR0ZXJOdW0sIHNpemVzIH0pO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAndHJhbnNpdGlvbkVuZCcpIHtcclxuICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbkVuZFN1YnNjcmliZXIpIHtcclxuICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gdGhpcy50cmFuc2l0aW9uRW5kU3Vic2NyaWJlci5uZXh0KHNpemVzKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3Byb2dyZXNzJykge1xyXG4gICAgICAvLyBTdGF5IG91dHNpZGUgem9uZSB0byBhbGxvdyB1c2VycyBkbyB3aGF0IHRoZXkgd2FudCBhYm91dCBjaGFuZ2UgZGV0ZWN0aW9uIG1lY2hhbmlzbS5cclxuICAgICAgdGhpcy5kcmFnUHJvZ3Jlc3NTdWJqZWN0Lm5leHQoeyBndXR0ZXJOdW0sIHNpemVzIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25EZXN0cm95KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdG9wRHJhZ2dpbmcoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb2xsYXBzZUFyZWEoY29tcDogU3BsaXRBcmVhRGlyZWN0aXZlLCBuZXdTaXplOiBudW1iZXIsIGd1dHRlcjogJ2xlZnQnIHwgJ3JpZ2h0Jyk6IHZvaWQge1xyXG4gICAgY29uc3QgYXJlYSA9IHRoaXMuZGlzcGxheWVkQXJlYXMuZmluZCgoYSkgPT4gYS5jb21wb25lbnQgPT09IGNvbXApO1xyXG4gICAgaWYgKGFyZWEgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCB3aGljaEd1dHRlciA9IGd1dHRlciA9PT0gJ3JpZ2h0JyA/IDEgOiAtMTtcclxuICAgIGlmICghYXJlYS5zaXplQmVmb3JlQ29sbGFwc2UpIHtcclxuICAgICAgYXJlYS5zaXplQmVmb3JlQ29sbGFwc2UgPSBhcmVhLnNpemU7XHJcbiAgICAgIGFyZWEuZ3V0dGVyQmVmb3JlQ29sbGFwc2UgPSB3aGljaEd1dHRlcjtcclxuICAgIH1cclxuICAgIGFyZWEuc2l6ZSA9IG5ld1NpemU7XHJcbiAgICBjb25zdCBndHIgPSB0aGlzLmd1dHRlckVscy5maW5kKChmKSA9PiBmLm5hdGl2ZUVsZW1lbnQuc3R5bGUub3JkZXIgPT09IGAke2FyZWEub3JkZXIgKyB3aGljaEd1dHRlcn1gKTtcclxuICAgIGlmIChndHIpIHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5hZGRDbGFzcyhndHIubmF0aXZlRWxlbWVudCwgJ2FzLXNwbGl0LWd1dHRlci1jb2xsYXBzZWQnKTtcclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlQXJlYShjb21wLCBmYWxzZSwgZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGV4cGFuZEFyZWEoY29tcDogU3BsaXRBcmVhRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICBjb25zdCBhcmVhID0gdGhpcy5kaXNwbGF5ZWRBcmVhcy5maW5kKChhKSA9PiBhLmNvbXBvbmVudCA9PT0gY29tcCk7XHJcbiAgICBpZiAoYXJlYSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghYXJlYS5zaXplQmVmb3JlQ29sbGFwc2UpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYXJlYS5zaXplID0gYXJlYS5zaXplQmVmb3JlQ29sbGFwc2U7XHJcbiAgICBhcmVhLnNpemVCZWZvcmVDb2xsYXBzZSA9IG51bGw7XHJcbiAgICBjb25zdCBndHIgPSB0aGlzLmd1dHRlckVscy5maW5kKChmKSA9PiBmLm5hdGl2ZUVsZW1lbnQuc3R5bGUub3JkZXIgPT09IGAke2FyZWEub3JkZXIgKyBhcmVhLmd1dHRlckJlZm9yZUNvbGxhcHNlfWApO1xyXG4gICAgaWYgKGd0cikge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKGd0ci5uYXRpdmVFbGVtZW50LCAnYXMtc3BsaXQtZ3V0dGVyLWNvbGxhcHNlZCcpO1xyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVBcmVhKGNvbXAsIGZhbHNlLCBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0QXJpYUFyZWFTaXplVGV4dChzaXplOiBudW1iZXIgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBpZiAoc2l6ZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2l6ZS50b0ZpeGVkKDApICsgJyAnICsgdGhpcy51bml0O1xyXG4gIH1cclxufVxyXG4iXX0=