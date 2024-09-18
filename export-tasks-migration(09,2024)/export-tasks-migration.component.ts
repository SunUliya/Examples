import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, DestroyRef, EventEmitter, Input, Output } from '@angular/core';
import { ExportTasksMigrationPopupComponent } from './export-tasks-migration-popup/export-tasks-migration-popup.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ZTooltipModule } from 'src/app/shared/z-tooltip/z-tooltip.module';
import { ZSvgIconModule } from 'src/app/shared/z-svg-icon/z-svg-icon.module';

@Component({
    selector: 'export-tasks-migration',
    standalone: true,
    imports: [CommonModule, ZTooltipModule, ZSvgIconModule],
    templateUrl: './export-tasks-migration.component.html',
    styleUrl: './export-tasks-migration.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportTasksMigrationComponent {
    isPopupVisible = false;
    spaceTooltip = 'Space should be saved';
    projectTooltip = 'One project should be selected';

    private _overlayRef: OverlayRef | null = null;
    private exportPopup?: ExportTasksMigrationPopupComponent;

    @Input() migrationParams:{projectIdInUrl: number, activeSpaceId: number, bulkProjectId: number };

    @Output() allTogglerSwitched = new EventEmitter<'all' | number[]>();
 
    constructor(
      private readonly _cdRef: ChangeDetectorRef,
      private readonly _overlay: Overlay,
      private destroyRef: DestroyRef
    ){}

    onTogglePopup(event: MouseEvent): void {
        event.stopPropagation();  
        if (this.migrationParams.bulkProjectId || this.migrationParams.projectIdInUrl){
            if (this.isPopupVisible) {
                this.closePopup();
            } else {
                this.openPopup();
            }
        }
    }

    closePopup(): void {
        this.changePopupVisibility(false);
        this.allTogglerSwitched.emit([]);
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }
    }

    openPopup(): void {
        this.changePopupVisibility(true);
        this.createPopup();
        this.allTogglerSwitched.emit('all');
    }

    changePopupVisibility(state: boolean): void {
        this.isPopupVisible = state;
        this._cdRef.markForCheck();
    }

    createPopup(): void {
        const overlayConfig = this.createOverlayConfig();
        this._overlayRef = this._overlay.create(overlayConfig);

        const componentPortal = new ComponentPortal(ExportTasksMigrationPopupComponent);
        const containerRef: ComponentRef<ExportTasksMigrationPopupComponent> = this._overlayRef.attach(componentPortal);
        this.exportPopup = containerRef.instance;

        this.exportPopup.init(
            this.migrationParams
        );

        this._overlayRef.backdropClick()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.closePopup();
            });

        this.exportPopup.exported
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.closePopup();
            });
    }

    createOverlayConfig(): OverlayConfig {
        const positionStrategy = this._overlay
            .position()
            .global()
            .centerHorizontally()
            .bottom('85px');

        return new OverlayConfig({
            positionStrategy,
            panelClass: 'cdk-tasks-export-panel',
            backdropClass: 'transparent-backdrop',
            hasBackdrop: true,
            height: '310px',
            scrollStrategy: this._overlay.scrollStrategies.noop()
        });
    }

}
