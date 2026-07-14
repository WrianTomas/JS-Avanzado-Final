import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, NgZone } from '@angular/core';
import { createElement, ComponentProps, ElementType } from 'react';
import { createRoot, Root } from 'react-dom/client';

@Directive({
  selector: '[reactComponent]', // Nombre para usar en el HTML de Angular
  standalone: true
})
export class ReactComponentDirective<Comp extends ElementType> implements OnChanges, OnDestroy {
  @Input() reactComponent!: Comp; // El componente React a renderizar
  @Input() props?: ComponentProps<Comp>; // Pasa datos de Angular a React
  
  private root: Root;

  constructor(private elementRef: ElementRef, private ngZone: NgZone) {
    this.root = createRoot(this.elementRef.nativeElement); // Crea la raíz en el HTML
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngZone.runOutsideAngular(() => {
      this.root.render(createElement(this.reactComponent, this.props));
    });
  }

  ngOnDestroy(): void {
    this.root.unmount(); // esto hace que limpie la memoria
  }
}