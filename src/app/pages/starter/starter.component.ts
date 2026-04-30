import { Component, ViewEncapsulation } from '@angular/core';
import { MaestroDashboardClinicoComponent } from '../maestro/dashboard-clinico/maestro-dashboard-clinico.component';

@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [MaestroDashboardClinicoComponent],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent {}
