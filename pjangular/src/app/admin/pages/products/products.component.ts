import { Component } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products: any[] = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 }
  ];
  isModalVisible = false;
  selectedProduct: any = { id: 0, name: '', price: 0 };
  fileList: NzUploadFile[] = [];

  constructor(private notification: NzNotificationService) {}

  showModal(product?: any): void {
    if (product) {
      this.selectedProduct = { ...product };
    } else {
      this.selectedProduct = { id: 0, name: '', price: 0 };
    }
    this.isModalVisible = true;
  }

  handleOk(): void {
    if (this.selectedProduct.id === 0) {
      this.selectedProduct.id = this.products.length + 1;
      this.products.push({ ...this.selectedProduct });
      this.notification.success('Thành công', 'Thêm sản phẩm thành công');
    } else {
      this.products = this.products.map(p =>
        p.id === this.selectedProduct.id ? { ...this.selectedProduct } : p
      );
      this.notification.success('Thành công', 'Cập nhật sản phẩm thành công');
    }
    this.isModalVisible = false;
  }

  handleCancel(): void {
    this.isModalVisible = false;
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(p => p.id !== id);
    this.notification.success('Thành công', 'Xóa sản phẩm thành công');
  }

  handleUploadChange(info: NzUploadChangeParam): void {
    if (info.file.status === 'done') {
      this.notification.success('Thành công', `${info.file.name} đã tải lên thành công`);
    } else if (info.file.status === 'error') {
      this.notification.error('Lỗi', `${info.file.name} tải lên thất bại`);
    }
    this.fileList = info.fileList;
  }
}
