import { Component } from '@angular/core';
import { ReactComponentDirective } from './directives/react-component.directive';
import { VueComponentDirective } from './directives/vue-component.directive';
import { ReactIncidencias } from './react-components/react-incidencias';
import { VueEstadisticas } from './vue-components/vue-estadisticas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactComponentDirective, VueComponentDirective],
  template: `
    <div [reactComponent]="ReactIncidencias"></div>

    <div class="container">
      <div [vueComponent]="VueEstadisticas"></div>
    </div>
  `
})
export class AppComponent {
  readonly ReactIncidencias = ReactIncidencias;
  readonly VueEstadisticas = VueEstadisticas;
}