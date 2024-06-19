import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { REQUIRED_FORM_MESSAGES } from '../../../common/messages';
import { UIService } from '../../../services/ui.service';
import { SharedStepsService } from '../../../services/shared-steps.service';
import { ISharedStepsForm } from './interfaces/shared-steps-form';
import { IAttachment, IProject, ISharedStep, ISharedSteps } from 'src/app/common/interfaces';
import { AttachmentsEntityType } from 'src/app/common/enums/attachments-entity-type.enum';
import { ProjectsService } from '../../../modules/projects/services/projects.service';
import { flatten , cloneDeep } from 'lodash';
import { ProjectType } from '../../../common/enums/project-types.enum';
import { moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
    selector: 'shared-steps-form',
    templateUrl: './shared-steps-form.component.pug',
    styleUrls: ['./shared-steps-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedStepsFormComponent {
    readonly form = new FormGroup<ISharedStepsForm>({
        title: new FormControl('', { nonNullable: true, validators: [ Validators.required, Validators.minLength(3) ] }),
        project: new FormControl(null, { validators: [ Validators.required ] }),
        steps: new FormControl([], { nonNullable: true, validators: [ Validators.required ] })
    });
    readonly attachmentsEntityType = AttachmentsEntityType.SHARED_STEP;
    mode: 'update' | 'create' = 'create';
    params =  { type: ProjectType.QA};
    attachments: IAttachment[] = [];
    sharedStepsId: number;

    constructor(
        private readonly ui: UIService,
        public readonly sharedStepsService: SharedStepsService,
        public projectsService: ProjectsService,
    ) {}

    get steps(): ISharedSteps['steps'] {
        return this.form.controls.steps.value;
    }

    get project():IProject {
        return this.form.get('project').value;
    }

    init(data: { project: IProject, sharedSteps: ISharedSteps }): void {
        const { project, sharedSteps } = data;

        if (sharedSteps) {
            this.mode = 'update';
            this.sharedStepsId = data.sharedSteps.id;
            this.form.patchValue({
                title: sharedSteps.title,
                steps: cloneDeep(sharedSteps.steps),
                project: sharedSteps.project || null
            });

            if (sharedSteps?.attachments) {
                this.attachments = sharedSteps.attachments;
            }
        } else if(project) {
            this.form.patchValue({project});
        }
    }

    onTestStepCreated(step: ISharedStep): void {
        if (step) {
            this.form.patchValue(({
                steps: [
                    ...flatten(this.steps),
                    {
                        ...step,
                        sequence: this.steps.length + 1
                    }
                ]
            }));
        }
    }

    onDeleteTestStep(testStep: ISharedStep): void {
        const updatedSteps = this.steps.filter(step => step.sequence !== testStep.sequence)
            .map((step, i) => ({...step, sequence: i+1}));
        this.form.patchValue({
            steps: updatedSteps
        });
    }

    onEditTestStep(res: {index: number, testStep: ISharedStep}): void {
        const modifiedStep = { ...res.testStep, sequence: res.index + 1 || 1};
        const updatedSteps = [...this.steps];

        updatedSteps.splice(res.index,1, modifiedStep);
        this.form.patchValue({
            steps: updatedSteps
        });
    }

    onAttachmentsAdded (attachments: IAttachment[]): void {
        this.attachments = [...attachments, ...this.attachments];
    }

    onFormSubmit(): Promise<any> {
        if (this.form.invalid) {
            this.ui.notification(REQUIRED_FORM_MESSAGES.confirmations);
            return;
        }
        return new Promise(resolve => {
            resolve({
                payload: {
                    sharedStep: this.form.value,
                    attachments: this.attachments,
                },
                options: {closeOnSubmit: true}
            });
        });
    }

    onDrop(event): void {
        const currentIndex = event.currentIndex;
        moveItemInArray(this.steps, event.previousIndex, currentIndex);
        const updatedSteps = this.steps.map((step, i) => ({...step, sequence: i+1}));
        this.form.patchValue({
            steps: updatedSteps
        });
    }
}

