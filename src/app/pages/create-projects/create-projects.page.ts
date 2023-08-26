import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { headerConfigKeys, urlConstants } from 'src/app/core/constants';
import { createProjectForm } from 'src/app/core/constants/createProjectForm';
import { HttpService, ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-create-projects',
  templateUrl: './create-projects.page.html',
  styleUrls: ['./create-projects.page.scss'],
})
export class CreateProjectsPage implements OnInit {
  public title = "";
  public showOthers = false;
  createProjectForm = createProjectForm; 
  public projectForm: FormGroup = this.fb.group({});
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toast: ToastService
    ) { }

  configHeader = [
    {[headerConfigKeys.SHOW_BACK]: true, "action":headerConfigKeys.BACK},
    {[headerConfigKeys.SHOW_MENU]: true, "action": headerConfigKeys.MENU},
    {[headerConfigKeys.SHOW_SEARCH]: false, "action": headerConfigKeys.SEARCH },
    {[headerConfigKeys.SHOW_NOTIFICATION]: false, "action": headerConfigKeys.NOTIFICATION},
    {[headerConfigKeys.SHOW_PROFILE]: false, "action": headerConfigKeys.PROFILE},
  ]
  
 ngOnInit() {
  this.createForm(this.createProjectForm);
  }

  handleAction(action: string) {
    switch (action) {
      case headerConfigKeys.SEARCH:
        // Handle search action
        console.log('Search action triggered');
        break;
      case headerConfigKeys.NOTIFICATION:
        // Handle notification action
        console.log('Notification action triggered');
        break;
      case headerConfigKeys.PROFILE:
        // Handle profile action
        console.log('Profile action triggered');
        break;
      case headerConfigKeys.MENU:
        // Handle side menu action
        console.log('Side menu action triggered');
        break;
      default:
        break;
    }
  }

  createForm(controls: any) {
    this.projectForm = this.fb.group({});
    for (const field of controls) {
      let formControl = null;

      if (field.input === 'select') {
        formControl = this.fb.control('', Validators.required);
        if (field.field === 'categories') {
          formControl.valueChanges.subscribe((value: any) => {
            let otherSelected = false;

            value.forEach((cat: string) => {
              if (cat === 'others') {
                otherSelected = true;
              }
            });
      
            this.showOthers = otherSelected; 
            if (this.showOthers) {
              this.projectForm.get('otherCategory')?.setValidators([Validators.required]);
              this.showOthers = true;
            } else {
              this.projectForm.get('otherCategory')?.clearValidators();
            }
            this.projectForm.get('otherCategory')?.updateValueAndValidity();
          });
        }
      } else {
        formControl = this.fb.control('', {
          validators: field.validation.required ? Validators.required : null,
          updateOn: 'blur',
        });
      }

      this.projectForm.addControl(field.field, formControl);
    }

    this.projectForm.addControl(
      'otherCategory',
      this.fb.control('', {
        validators: [],
      })
    );
  }


  async onSubmit(){

    console.log(this.projectForm.value);

    const selectedEndDate = this.projectForm.get('endDate')?.value!;
    const selectedStartDate = this.projectForm.get('startDate')?.value!;
    if(selectedStartDate > selectedEndDate){
      this.toast.showToast('PROJECT_CREATION.DATE_ERROR', 'danger');
      return;
    }

    var selectedCategories: any = this.projectForm.get('categories')?.value
      // Check if 'other' is selected
    selectedCategories!.forEach((cat: any) => {
        if(cat.value == 'others'){
          cat['name']  = this.projectForm.get('other')?.value;
        }          
    })
    console.log(this.projectForm?.value);
    // makke api call
    if(this.projectForm.valid){
  
      const payload = {
        ...this.projectForm.value,
        isDeleted: false,
        hasAcceptedTAndC: true,
        status: 'notStarted',
        learningResources : []
      };
      const config = {
        url: urlConstants.API_URLS.CREATE_PROJECT,
        payload: payload
      };

      await this.http.setHeader();
  
      this.http.post(config).subscribe(async (userDetails : any)=>{
        if (userDetails !== null) {
          this.toast.showToast(userDetails.message, "success")
          console.log('data  ', userDetails)
      }
      });
    }
  }

  setDate(event: any, ctrl: any){
    console.log(event, ctrl);
    this.projectForm.get(ctrl.field)?.setValue(event.detail.value);
  }
}
