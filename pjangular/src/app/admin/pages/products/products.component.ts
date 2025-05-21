import { Component } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products: Product[] = [
    { id: 1, name: 'Sản phẩm A', price: 100000 },
    { id: 2, name: 'Sản phẩm B', price: 200000 }
  ];
}
