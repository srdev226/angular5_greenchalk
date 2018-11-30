import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NotificationsService as AngularNotifications } from 'angular2-notifications' ;
import { Pipe,PipeTransform} from '@angular/core';

import { Exam} from '../exam';
import { ClassInfo } from '../../classes/class-info';
import { AcademicYear, Divisions } from '../../../management/school/school';

import { SchoolDataService } from '../../../management/school/school-data.service';
import { ClassesDataService } from '../../classes/classes-data.service';
import { ExamDataService } from '../exam-data.service';

import { ClassInfoService} from '../../classes/class-info.service';
import { ExamService} from '../exam.service';

@Pipe({
    name: 'searchExam',
    pure: true
})

export class SearchExam implements PipeTransform {

    constructor()
    {}

    transform(exams: Exam[], name:string, series_code: string, class_key: string): any {
      console.log('name: '+name+' series_code: '+series_code+' class_key: '+class_key+ '..'+exams.length);
      let exam_list = exams;
      if(series_code === 'All' && class_key === 'All' && name === ''){
        return [];
      }
      if (name) {
        exam_list = exam_list.filter(x => {
          return (x.name.toLowerCase().includes(name.toLowerCase()));
        })
      }
      if (series_code !== 'undefined' && series_code !=="All") {
        exam_list = exam_list.filter(x => {
          return (x.series_code === series_code);
        })
      }
      if (class_key !== 'undefined' && class_key !=="All") {
        exam_list = exam_list.filter(x => {
          return (x.class_key === class_key);
        })
      }
      return exam_list;
    }
}

export class ExamFilter{
  series_code : string;
  class_key: string;
  exam_name: string;
}

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.css']
})
export class ExamListComponent implements OnInit {

  exam_list: Exam[] = [];
  classes: ClassInfo[] = [];
  exam_series_list: Exam[] = [];

  name: string;
  exam_name: string;
  exam_series_code: string = 'All';
  class_info_key: string = "All";
  exam_filter: ExamFilter;

  constructor(private classesDataService: ClassesDataService,
              private schoolDataService: SchoolDataService,
              private examService: ExamService,
              private examDataService: ExamDataService,
              private router: Router,
              private route: ActivatedRoute,
              private angularNotifications: AngularNotifications,
              private classInfoService : ClassInfoService)
  { }

  ngOnInit() {
    let academic_year = this.schoolDataService.getCurrentAcademicYear().code;
    if(!this.classesDataService.getClasses()){
      this.classInfoService.getClassInfoList(this.schoolDataService.getSchool().school_id).then(resp => {
        this.classesDataService.setClasses(resp);
        this.classes = resp.filter(x => (x.type === 'regular' && x.academic_year === academic_year));
        this.classes.sort(function(a,b){return (a.order_index) - (b.order_index);
        });
      });
    }
    else{
      this.classes = this.classesDataService.getClasses().filter( x => x.type === "regular" && x.academic_year === academic_year)
                  .sort(function(a,b){return (a.order_index) - (b.order_index)});
    }
    let exam_filter = this.examDataService.getExamFilterData();
    if(exam_filter !== undefined){
      this.exam_series_code = this.examDataService.getExamFilterData().series_code;
      this.class_info_key = this.examDataService.getExamFilterData().class_key;
      this.exam_name = this.examDataService.getExamFilterData().exam_name;
    }
    this.getExamList();

  }

  getExamList(){
    let exam = new Exam();
    exam.institution_key = this.schoolDataService.getSchool().school_id;
    exam.academic_year = this.schoolDataService.getCurrentAcademicYear().code;

    this.examService.getExamList(exam).then(resp=>{
      this.exam_list = resp.filter(x => x.series_code !== undefined);
      this.exam_series_list = [];
      for(let detail of this.exam_list){
        if(!this.exam_series_list.find(x=> x.series_code === detail.series_code)){
          this.exam_series_list.push(detail);
        }
      }
    })
  }

  getSubjectName(code){
    let subject;
    if(code){
      subject = this.schoolDataService.getSchool().academic_configuration.subjects.find(x=>x.code===code).name;
    }
    return subject;
  }

  goToEditExam(exam_key){
    let exam_filter = new ExamFilter();
    exam_filter.series_code = this.exam_series_code;
    exam_filter.class_key = this.class_info_key;
    exam_filter.exam_name = this.exam_name;
    this.examDataService.setExamFilterData(exam_filter);

    this.router.navigate(['academics/exams/edit',exam_key]);
  }

  gotoAddExam(){
    this.router.navigate(['academics/exams/add']);
  }

  getClassName(class_key){
    return this.classes.find(x=>x.class_info_key === class_key).name;
  }

}
