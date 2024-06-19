import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedStepsFormComponent } from './shared-steps-form.component';
import { FormInputsModule } from 'src/app/shared/form-inputs/form-inputs.module';
import { TestCasesSharedModule } from 'src/app/modules/test-cases-shared/test-cases-shared.module';
import { UtilModule } from 'src/app/shared/util/util.module';
import { AttachmentsSharedModule } from 'src/app/shared/attachments-shared/attachments-shared.module';
import { ListOptionsModule } from '../../../shared/ui/list-options/list-options.module';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ZSvgIconModule } from "../../../shared/z-svg-icon/z-svg-icon.module";

@NgModule({
    declarations: [
        SharedStepsFormComponent
    ],
    imports: [
        AttachmentsSharedModule,
        CommonModule,
        FormInputsModule,
        ReactiveFormsModule,
        TestCasesSharedModule,
        ListOptionsModule,
        DragDropModule,
        ZSvgIconModule,
        UtilModule
    ]
})
export class SharedStepsFormModule {
    static entry = SharedStepsFormComponent;
}
