import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  hours: Record<string, string> = {
    Monday: '11:00 AM – 9:00 PM',
    Tuesday: '11:00 AM – 9:00 PM',
    Wednesday: '11:00 AM – 9:00 PM',
    Thursday: '11:00 AM – 9:00 PM',
    Friday: '11:00 AM – 11:00 PM',
    Saturday: '10:00 AM – 11:00 PM',
    Sunday: '10:00 AM – 8:00 PM',
  };

  get currentDay(): string {
    return this.days[new Date().getDay() - 1] || 'Sunday';
  }
}
