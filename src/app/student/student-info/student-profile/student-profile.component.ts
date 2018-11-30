import { Component, OnInit, Input } from '@angular/core';
import { ProductDataService } from '../../../product/product-data.service';
import { SchoolDataService } from '../../../management/school/school-data.service';
import { StudentInfo } from '../student-info';


@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css']
})
export class StudentProfileComponent implements OnInit {

  @Input()
  studentInfo: StudentInfo;

  feeBillsList: any[];
  tripsList: any[];
  cocurricularClassesList: any[];
  attendenceList: any[]

  constructor(private productDataService: ProductDataService,
    private schoolDataService: SchoolDataService){ }

  ngOnInit() {
  }

  public getAadhaarNo(person){
    if(person.identity_information && person.identity_information[0].id_number){
      return person.identity_information[0].id_number;
    }
  }

  public getMaskedAadhaarNo(person){
    let aadNo = this.getAadhaarNo(person)
    if (aadNo){
      return aadNo.replace(/\d(?=\d{4})/g, "X");
    }
  }

  getReligionName(code: string){
    let religion = this.productDataService.masterProduct.demographic_configuration.religions.find(x => x.code === code);
    if(religion){
      return religion.name;
    }
  }

  getCasteName(code: string){
    let caste = this.productDataService.masterProduct.demographic_configuration.castes.find(x => x.code === code);
    if(caste){
      return caste.name;
    }
  }

  getSubCasteName(code: string){
    let subcaste = this.schoolDataService.school.demographic_configuration.subcastes.find(x => x.code === code);
    if(subcaste){
      return subcaste.name;
    }
  }

  public getImageUrl() {
    if(this.studentInfo.profile_image_url){
      return this.studentInfo.profile_image_url;
    }else{
      let gender = this.studentInfo.person.gender + '';
      if (gender && gender.toLowerCase() == 'male') {
        return 'assets/images/boy.png';
      } else {
        return 'assets/images/girl.png';
      }
    }
  }

}
