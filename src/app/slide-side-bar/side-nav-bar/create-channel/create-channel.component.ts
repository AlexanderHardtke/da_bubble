
import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavBarComponent } from '../side-nav-bar.component';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  @ViewChild('createdBox') createdBox!: ElementRef<HTMLDivElement>;
  channelName:string = '';
  channelDescription:string = '';
  closeDialog = inject(SideNavBarComponent);

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement): void {
    const clickedInside = this.createdBox.nativeElement.contains(target);
    if (!clickedInside) {
      this.closeCreateChan();
    }
  }

  closeCreateChan() {
    this.closeDialog.createNewChannel = false;
  }

  
  createChanel() {
    this.closeDialog.createChannel(1);
    this.closeCreateChan();
  }

}
