import { Component, OnInit } from '@angular/core';
import { ClassInfo, Division, Subject as ClassSubject } from './class-info';
import {ClassInfoService} from './class-info.service';
import {ClassesDataService} from './classes-data.service';
import { SchoolDataService } from '../../management/school/school-data.service';
import { SchoolService } from '../../management/school/school.service';
import { School,Subject,Class,Divisions,CocurricularClass, AcademicYear } from '../../management/school/school';
import { SchoolResponse } from '../../management/school/school-response';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  class_infos: ClassInfo[];
  class_info: ClassInfo;
  constituent_subjects: Subject[];
  selected_subjects: any[];
  selected_subject: string;
  selected_subject_type: string;
  selected_class_index: number;
  selected_class_type: string;
  selected_academic_year: string;
  academic_years: AcademicYear[];
  school: School;
  divisions: string = "";
  cocurricular_class: CocurricularClass[];
  current_academic_year: string;
  selected_division: string;
  index = [];

  isEditing = false;
  classes_types = [{"name":"Regular","code":"regular"},{"name":"Cocurricular","code":"cocurricular"}];

  constructor(private schoolDataService: SchoolDataService,
              private schoolService: SchoolService,
              private classesDataService :ClassesDataService,
              private classInfoService : ClassInfoService) { }

  ngOnInit() {
    this.selected_subject = undefined;
    this.selected_subject_type = undefined;
    this.academic_years = this.schoolDataService.getSchool().academic_years;
    this.school = this.schoolDataService.getSchool();
    this.validateConfiguration(this.school);
    this.current_academic_year = this.schoolDataService.getCurrentAcademicYear().code;
    this.index.push(2)
  }

  private validateConfiguration(school: School){
    if(! school.academic_years || school.academic_years.length == 0){
      console.warn("Academic years not configured")
    }
    if(! school.subjects || school.subjects.length == 0){
      console.warn("Subjects not configured for school")
    }
    if(! school.subject_types || school.subject_types.length == 0){
      console.warn("Subject types not configured for school")
    }
  }

  public selectYear(){
    this.loadClasses();
  }

  public setClassType(){
    if(!this.selected_academic_year){
      this.selected_academic_year = this.current_academic_year;
    }
    this.loadClasses();
  }

  addSubject(){

      if(this.selected_subject && this.selected_subject_type){
        let subject = this.school.academic_configuration.subjects.find(x=>x.code===this.selected_subject);
        let new_subject: ClassSubject = new ClassSubject();
        new_subject.code = subject.code;
        new_subject.name = subject.name;
        new_subject.type = this.selected_subject_type;
        if(!this.class_info.subjects){
          this.class_info.subjects = [];
        }
        let chosen_subjects = this.selected_subjects.filter( x => x.selected);
        if(chosen_subjects.length > 0){
          let constituent_subjects: string[] = [];
          for(let sub of chosen_subjects){
            constituent_subjects.push(sub.code);
          }
          new_subject.constituent_subjects = constituent_subjects;
        }

        this.class_info.subjects.push(new_subject);
      }

    this.selected_subjects = [];
    this.selected_subject = undefined;
    this.selected_subject_type = undefined;
  }

  getSubjectList(){
    let subjects : Subject[] = [];
    if(!this.school.subjects){
      console.warn("Subjects not configured for school");
      return subjects;
    }
    if(this.class_info.subjects){
      for(let subject of this.school.academic_configuration.subjects){
        if(this.class_info.subjects.findIndex(x => x.code === subject.code)<0){
          subjects.push(subject);
        }
      }
    }
    else{
      subjects = this.school.academic_configuration.subjects;
    }
    return subjects;
  }

  addOrRemoveConstituentSubject(code){
    let is_selected = this.selected_subjects.find(x => x.code === code).selected
    this.selected_subjects.find(x => x.code === code).selected = !is_selected;
  }

  getConstituentSubjects(constituent_subjects){
    let subjects: string;
    if(constituent_subjects){
      subjects = '(';
      for(let sub of constituent_subjects){
        subjects = subjects+this.getSubjectName(sub)+', ';
      }
      subjects = subjects.substring(0,subjects.length-2) +')';
    }
    return subjects;
  }

  getSelectedSubjects(){
    this.selected_subjects = [];
    let child_subjects: string[] = [];
    let parent_subjects = this.class_info.subjects.filter(x => x.constituent_subjects !== undefined);
    for(let subject of parent_subjects){
      for(let sub of subject.constituent_subjects){
        if(!child_subjects.find(x=>x===sub)){
          child_subjects.push(sub);
        }
      }
    }
    for(let subject of this.class_info.subjects){
      if(!child_subjects.find(x => x === subject.code)){
        let sub: any = subject;
        sub.selected = false;
        this.selected_subjects.push(sub);
      }
    }
  }

  removeSubject(code){
    let index = this.class_info.subjects.findIndex(x => x.code === code);
    if(index > -1){
      this.class_info.subjects.splice(index,1);
    }
  }

  getSubjectName(code){
    return this.school.academic_configuration.subjects.find(x => x.code === code).name;
  }

  private loadClasses() {
    let school_key = this .schoolDataService.getSchool().school_id;
    this.class_infos = [];
    this.classInfoService.getClassInfoList(school_key).then(resp => {
      this.class_infos = resp.filter(x => (x.type === this.selected_class_type && x.academic_year === this.selected_academic_year));
      this.class_infos.sort(function(a,b){return (a.order_index) - (b.order_index);
      });
        this.selectClass(0);
        for(let _class of this.class_infos){
           this.index.push(_class.order_index);
         }
      });
   }

   public addNewClassInfo() {
    this.isEditing = true;
    let school_key = this .schoolDataService.getSchool().school_id;
    if (!this.class_infos) {
      this.class_infos = []
    }
    let _classinfo = new ClassInfo();
    _classinfo.eligible_classes = [];
    this.class_infos.push(_classinfo);
    this.selected_class_index= this.class_infos.length - 1;
    this.class_info = this.class_infos[this.selected_class_index];
    this.class_info.subjects = [];
  }

  public selectClass(i) {
    this.isEditing = false;
    this.class_info = this.class_infos[i];
    this.selected_class_index = i;
    this.divisions = '';
    for(let div of this.getDivisionsOfSelectedClass()){
      this.divisions = this.divisions + div;
      if(this.getDivisionsOfSelectedClass().indexOf(div)!==this.getDivisionsOfSelectedClass().length-1){
        this.divisions = this.divisions +',';
      }
    }
    this.selected_subject = undefined;
    this.selected_subject_type = undefined;
  }

  public cancelClass(){
    if(this.class_info.class_info_key){
      this.isEditing = false;
    }else{
      this.class_infos.splice(this.selected_class_index);
      this.selectClass(0);
    }
    this.divisions ="";
  }

  public addOrUpdateClassInfo() {
    if (this.class_info.class_info_key)
    {
      this.updateClassInfo();
    }
    else {
      this.addClassInfo();
    }
  }

  private addClassInfo() {
    this.class_info.school_key = this.school.school_id;
    this.classInfoService.addClassInfo(this.class_info).then(resp => {
      this.class_info.class_info_key = resp.class_info_key;
      let co_class = new CocurricularClass();
      co_class.class_info_key = resp.class_info_key;
      let school = this.schoolDataService.getSchool();
      if (!school.cocurricular_classes) {
        school.cocurricular_classes = [];
      }
      school.cocurricular_classes.push(co_class);
      this.schoolService.updateSchool(school).then(school_resp => {
        this.schoolDataService.setSchool(school);
      })
      this.loadClasses();
      this.isEditing = false;
    })
  }

  private updateClassInfo() {
    this.class_info.school_key = this.school.school_id;
    this.classInfoService.updateClassInfo(this.class_info).then(resp => {
      this.loadClasses();
      this.isEditing = false;
     })
  }
   public selectedDivision(){
    for(let divn of this.class_info.divisions)
    this.selected_division= divn.code +',';
   }

  public addOrUpdateRegularClass() {
    if (this.class_info.class_info_key)
    {
      this.updateRegularClass();
    }
    else {
      this.addRegularClass();
    }
  }

  public orderIndex(){
    let index =this.index;
       let maxindex = Math.max(...index)
       this.class_info.order_index = maxindex + 2
    }

  private addRegularClass(){
    this.orderIndex();
    this.class_info.divisions=[]
    let division: Division[] = [];
       let divs: string[] = this.divisions.split(',');
       if(divs.length>0){
         for(let divi of divs){
           let div  = new Division();
           div.name = divi;
           div.code = divi;
           this.class_info.divisions.push(div);
         }
       }
    this.class_info.school_key = this.school.school_id;
    this.class_info.name = this.class_info.class_code;
    this.classInfoService.addClassInfo(this.class_info).then(resp => {
      this.class_info.class_info_key = resp.class_info_key;
       this.class_infos = [];
       this.class_infos.push(resp.class_info_key);
       this.classInfoService.updateClassInfo(this.class_info).then(resp =>{
         this.classesDataService.setClasses(this.class_infos)
       })
      this.isEditing = false;
      this.loadClasses();
     })
     this.divisions = "";
   }

  private updateRegularClass() {
    if(this.divisions.length === 0){
      this.divisions = 'A';
    }
    this.class_info.divisions=[]
    let division: Division[] = [];
       let divs: string[] = this.divisions.split(',');
       if(divs.length>0){
         for(let divi of divs){
           let div  = new Division();
           div.name = divi;
           div.code = divi;
           this.class_info.divisions.push(div);
         }
       }
     this.class_info.school_key = this.school.school_id;
     this.classInfoService.updateClassInfo(this.class_info).then(resp => {
       this.classesDataService.setClasses(this.class_infos)
       this.isEditing = false;
       this.loadClasses()
     })
    this.divisions = "";
  }

  public getClassesList(){
    return this.classesDataService.getClasses().filter(x => (x.academic_year === this.class_info.academic_year) && (x.type === "regular"))
    .sort(function(a,b){return (a.order_index) - (b.order_index)});

  }

  public getDivisionsOfSelectedClass(){
    return this.classesDataService.getDivisionCodesList(this.selected_academic_year, this.class_info.class_info_key);
  }

    addDivision(){
      if(this.divisions.length === 0){
        this.divisions = 'A';
      }
      else{
        var code = this.divisions.charCodeAt(this.divisions.length-1);
        var next_char = String.fromCharCode(code+1);
        this.divisions = this.divisions+','+next_char;
      }
    }

    deleteDivision(){
      if(this.divisions.length > 0){
        this.divisions = this.divisions.substring(0,this.divisions.length-2);
      }
     }

  public addOrRemoveClass(cls){
    let index = this.class_info.eligible_classes.findIndex( x => x === cls);
    if(index > -1){
      this.class_info.eligible_classes.splice(index, 1);
    }else{
      this.class_info.eligible_classes.push(cls);
    }
  }

  public isClassSelected(cls){
    let index = this.class_info.eligible_classes.findIndex( x => x === cls);
    if(index > -1){
      return true;
    }else{
      return false;
    }
  }
}
