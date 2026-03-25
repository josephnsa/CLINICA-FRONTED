import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TablerIconsModule } from 'angular-tabler-icons';

// ecommerce card
interface productCards {
    id: number;
    imgSrc: string;
    title: string;
    price: string;
    rprice: string;
}

@Component({
    selector: 'app-blog-card',
    imports: [MatCardModule, TablerIconsModule, MatButtonModule],
    templateUrl: './blog-card.component.html',
})
export class AppBlogCardsComponent {
    constructor() { }

    productcards: productCards[] = [

    ];
}
