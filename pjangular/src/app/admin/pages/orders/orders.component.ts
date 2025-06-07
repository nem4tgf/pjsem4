import { Component, OnInit } from '@angular/core';
import { Order, OrderStatus } from 'src/app/interface/order.interface';
import { OrderService } from 'src/app/service/order.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;
  isVisible = false;
  statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  currentOrderId: number | null = null;
  currentOrderStatus: OrderStatus | null = null;

  constructor(
    private orderService: OrderService,
    private message: NzMessageService,
    private modalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Lỗi khi tải danh sách đơn hàng: ' + err.message);
        this.loading = false;
      }
    });
  }

  showOrderDetailModal(order: Order): void {
    this.selectedOrder = order;
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedOrder = null;
  }

  handleOk(): void {
    this.isVisible = false;
    this.selectedOrder = null;
  }

  deleteOrder(orderId: number): void {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.message.success('Đơn hàng đã được xóa thành công!');
        this.loadOrders();
      },
      error: (err) => {
        this.message.error('Lỗi khi xóa đơn hàng: ' + err.message);
      }
    });
  }

  showUpdateStatusModal(order: Order): void {
    this.currentOrderId = order.orderId;
    this.currentOrderStatus = order.status;
    this.modalService.confirm({
      nzTitle: 'Cập nhật trạng thái đơn hàng',
      nzContent: `
        <div>
          <p>Mã đơn hàng: <b>${order.orderId}</b></p>
          <p>Trạng thái hiện tại: <b>${order.status}</b></p>
          <nz-form-item>
            <nz-form-label [nzSm]="6" [nzXs]="24" nzRequired>Trạng thái mới</nz-form-label>
            <nz-form-control [nzSm]="14" [nzXs]="24">
              <nz-select [(ngModel)]="currentOrderStatus" nzPlaceHolder="Chọn trạng thái">
                <nz-option *ngFor="let status of statusOptions" [nzLabel]="status" [nzValue]="status"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      `,
      nzOnOk: () => this.updateOrderStatusConfirmed(order.orderId),
      nzOnCancel: () => {
        this.currentOrderId = null;
        this.currentOrderStatus = null;
      }
    });
  }

  updateOrderStatusConfirmed(orderId: number): void {
    if (this.currentOrderStatus && orderId) {
      this.orderService.updateOrderStatus(orderId, this.currentOrderStatus).subscribe({
        next: (updatedOrder) => {
          this.message.success(`Đã cập nhật trạng thái đơn hàng #${updatedOrder.orderId} thành ${updatedOrder.status}`);
          this.loadOrders();
          this.currentOrderId = null;
          this.currentOrderStatus = null;
        },
        error: (err) => {
          this.message.error('Lỗi khi cập nhật trạng thái: ' + err.message);
        }
      });
    } else {
      this.message.warning('Vui lòng chọn trạng thái mới.');
    }
  }

  getStatusTagColor(status: OrderStatus): string {
    switch (status) {
      case 'PENDING': return 'blue';
      case 'PROCESSING': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'default';
    }
  }
}
