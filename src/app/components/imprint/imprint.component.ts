import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  _location = inject(Location);

  backClicked() {
    this._location.back();
  }
}
