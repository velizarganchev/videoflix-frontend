import { Component, inject } from '@angular/core';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [],
  templateUrl: './error-toast.component.html',
  styleUrl: './error-toast.component.scss'
})
export class ErrorToastComponent {
  private errorService = inject(ErrorService);

  closeToast() {
    this.errorService.clearError();
  }
}
