import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AcademicsComponent } from './academics.component';
import { AttendenceComponent } from './attendence/attendence.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { ClassesComponent } from './classes/classes.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { ExamsComponent } from './exams/exams.component';
import { ExamInfoComponent } from './exams/exam-info/exam-info.component';
import { ExamListComponent } from './exams/exam-list/exam-list.component';
import { StudentScoreComponent } from './student-score/student-score.component';

const appRoutes: Routes = [{
    path: 'academics',
    component: AcademicsComponent,
    children: [
        { path: '', component: ClassesComponent },
        { path: 'classes', component: ClassesComponent },
        { path: 'promotions', component: PromotionsComponent },
        { path: 'attendence', component: AttendenceComponent },
        { path: 'attendance-report', component: AttendanceReportComponent },
        { path: 'exams', component: ExamsComponent },
        { path: 'exams/add', component: ExamInfoComponent },
        { path: 'exams/edit/:exam_key', component: ExamInfoComponent },
        { path: 'student_score', component: StudentScoreComponent }
    ]
}]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})

export class AcademicsRoutingModule { }
