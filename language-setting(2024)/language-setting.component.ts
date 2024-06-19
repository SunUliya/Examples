import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FormDropdownModule } from '../../../../shared/form-dropdown/form-dropdown.module';
import { TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { State } from '../../../../store';
import { selectLanguage } from '../../../../store/app/app.selectors';
import { USED_LANGUAGES_LIST } from '../../../../common/constants';
import { updateLanguageSetting } from '../../store/profile.actions';
import { distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { InfoItemTextComponent } from 'src/app/shared/ui/info-item-text/info-item-text.component';


@Component({
    standalone: true,
    selector: 'language-setting',
    imports: [
        CommonModule,
        FormDropdownModule,
        InfoItemTextComponent,
        ReactiveFormsModule
    ],
    templateUrl: './language-setting.component.pug',
    styleUrls: ['../../common/styles/setting-section.scss']
})
export class LanguageSettingComponent implements OnInit, OnDestroy {

    form: UntypedFormGroup;
    langList = USED_LANGUAGES_LIST;

    languageSubscription = Subscription.EMPTY;
    formSubscription = Subscription.EMPTY;

    constructor(
        private fb: UntypedFormBuilder,
        private translateService: TranslateService,
        private store: Store<State>,
        private readonly cdRef: ChangeDetectorRef,
    ) {
        this.form = this.fb.group({
            language: null
        });
    }

    ngOnInit() {
        this.languageSubscription = this.store.pipe(select(selectLanguage))
            .pipe(distinctUntilChanged())
            .subscribe(currLang => {
                const language = this.langList.filter(lang => lang.id === currLang)[0];
                this.form.setValue({language});

            });
        this.formSubscription = this.form.valueChanges
            .pipe(
                distinctUntilChanged((previous, current) => previous.language.id === current.language.id)
            )
            .subscribe(value => {
                this.store.dispatch(updateLanguageSetting({value: value.language.id}));
            });
    }

    ngOnDestroy() {
        this.formSubscription.unsubscribe();
        this.languageSubscription.unsubscribe();
    }

}
