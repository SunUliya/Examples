import { FormControl } from "@angular/forms";
import { IProject, ISharedSteps } from 'src/app/common/interfaces';

export interface ISharedStepsForm {
    title: FormControl<string>
    steps: FormControl<ISharedSteps['steps']>
    project: FormControl<IProject>
}
