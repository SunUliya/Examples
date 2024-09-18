import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output } from '@angular/core';
import { ZPopupElementsModule } from 'src/app/shared/ui/z-popup-elements/z-popup-elements.module';
import { ZSwitchModule } from "../../../../z-switch/z-switch.module";
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FormDropdownModule } from 'src/app/shared/form-dropdown/form-dropdown.module';
import { InfoItemTextComponent } from 'src/app/shared/ui/info-item-text/info-item-text.component';
import { TextInputModule } from 'src/app/shared/text-input/text-input.module';
import { TasksService } from 'src/app/modules/tasks/services/tasks.service';
import { UIService } from 'src/app/services/ui.service';

@Component({
    selector: 'export-tasks-migration-popup',
    standalone: true,
    imports: [
        ZPopupElementsModule,
        ZSwitchModule,
        InfoItemTextComponent,
        ReactiveFormsModule,
        TextInputModule,
        FormDropdownModule
    ],
    templateUrl: './export-tasks-migration-popup.component.html',
    styleUrl: './export-tasks-migration-popup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportTasksMigrationPopupComponent implements OnInit {
    isVisableJiraUserGroupName = false;
    migrationList = [{
        id: 1,
        name: 'JSON for migration to Jira',
        value: 'jiraJson'
      
    },
    {
        id: 2,
        name: 'CSV for migration to Zoho',
        value: 'zohoCsv'
    }];

    form: UntypedFormGroup;
    private spaceId: number;
    private projectId: number;

    @Output() exported = new EventEmitter<boolean>();

    constructor(
      private readonly fb: UntypedFormBuilder,
      private readonly tasksService: TasksService,
      private readonly ui: UIService,
      private readonly destroyRef: DestroyRef
    ) {
        this.form = this.fb.group({
            platform: ['', Validators.required],
            jiraUserGroupName: '',
            includeTimeLogs: false,
            includeChildTasks: false
        });
    }

    ngOnInit(): void {
         this.form.get('platform').valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(value => {
                 this.isVisableJiraUserGroupName = value.id === 1;
                 if(this.isVisableJiraUserGroupName) {
                     this.form.get('jiraUserGroupName').setValidators([Validators.required]);
                 } else {
                     this.form.get('jiraUserGroupName').clearValidators();
                 }
                 this.form.get('jiraUserGroupName').updateValueAndValidity();
             });        
    }

    init(migrationParams: {projectIdInUrl: number, activeSpaceId: number, bulkProjectId: number }){
        this.spaceId = migrationParams.activeSpaceId;
        this.projectId = migrationParams.bulkProjectId || migrationParams.projectIdInUrl || null;
    }

    onApply() {
        if(this.projectId) {
            const formValue = this.form.value;
            const params = {
                spaceId: this.spaceId,
                platform: formValue.platform.value,
                ids: [],
                projectId: this.projectId,  
                ...(formValue.includeTimeLogs && {includeTimeLogs: true}),
                ...(formValue.includeChildTasks && {includeChildTasks: true}),
                // ...(formValue.platform.id === 1 && {jiraUserGroupName: this.form.value.jiraUserGroupName}),
            };
  
            this.tasksService.migrationExport(params).subscribe(response => {
                this.ui.notification({message: response.message});
                this.exported.emit();
            });
        } else {
            this.exported.emit();
            new Error('projectId is required');
        }
    }

    onCancel() {
        this.exported.emit();
    }
}
