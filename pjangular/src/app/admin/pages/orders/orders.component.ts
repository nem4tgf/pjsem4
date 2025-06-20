import { Component, OnInit } from '@angular/core';
import { Order, OrderStatus } from 'src/app/interface/order.interface';
import { OrderService } from 'src/app/service/order.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  // Sử dụng FormGroup để quản lý form tìm kiếm
  searchForm: FormGroup;
  // Sử dụng FormGroup để quản lý form cập nhật trạng thái
  updateStatusForm: FormGroup;

  statusOptions: OrderStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

  constructor(
    private orderService: OrderService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private fb: FormBuilder
  ) {
    // Khởi tạo searchForm, thay thế 'dateRange' bằng 'orderDate'
    this.searchForm = this.fb.group({
      username: [null],
      userId: [null],
      status: [null],
      orderDate: [null], // Chỉ chọn một ngày
    });

    // Khởi tạo updateStatusForm
    this.updateStatusForm = this.fb.group({
      newStatus: [null, Validators.required]
    });
  }

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

  submitSearchForm(): void {
    this.loading = true;
    const formValues = this.searchForm.value;

    let minDate: string | null = null;
    let maxDate: string | null = null;

    // Nếu có orderDate được chọn, thiết lập minDate là đầu ngày và maxDate là cuối ngày đó
    if (formValues.orderDate) {
      const selectedDate = new Date(formValues.orderDate);
      selectedDate.setHours(0, 0, 0, 0); // Bắt đầu ngày
      minDate = selectedDate.toISOString();

      selectedDate.setHours(23, 59, 59, 999); // Kết thúc ngày
      maxDate = selectedDate.toISOString();
    }

    this.orderService.searchOrders(
      formValues.userId,
      formValues.status,
      minDate, // Truyền minDate
      maxDate, // Truyền maxDate
      null,
      null,
      formValues.username
    ).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Lỗi khi tìm kiếm đơn hàng: ' + err.message);
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchForm.reset();
    this.loadOrders();
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
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
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
    });
  }

  showUpdateStatusModal(order: Order): void {
    this.updateStatusForm.patchValue({
      newStatus: order.status
    });

    this.modalService.confirm({
      nzTitle: `Cập nhật trạng thái đơn hàng #${order.orderId}`,
      nzContent: this.createUpdateStatusModalContent(order),
      nzOkText: 'Cập nhật',
      nzCancelText: 'Hủy',
      nzOnOk: () => this.updateOrderStatusConfirmed(order.orderId),
      nzOnCancel: () => {
        this.updateStatusForm.reset();
      }
    });
  }

  private createUpdateStatusModalContent(order: Order): string {
    return `
      <div>
        <p>Mã đơn hàng: <b>${order.orderId}</b></p>
        <p>Trạng thái hiện tại: <b>${order.status}</b></p>
        <label for="newStatusSelect">Chọn trạng thái mới:</label>
        <select id="newStatusSelect" class="ant-input" onchange="this.__ngContext__[0].component.updateStatusForm.get('newStatus').setValue(this.value)">
          ${this.statusOptions.map(status =>
            `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  updateOrderStatusConfirmed(orderId: number): void {
    if (this.updateStatusForm.valid) {
      const newStatus: OrderStatus = this.updateStatusForm.get('newStatus')?.value;
      if (newStatus) {
        this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
          next: (updatedOrder) => {
            this.message.success(`Đã cập nhật trạng thái đơn hàng #${updatedOrder.orderId} thành ${updatedOrder.status}`);
            this.loadOrders();
            this.updateStatusForm.reset();
          },
          error: (err) => {
            this.message.error('Lỗi khi cập nhật trạng thái: ' + err.message);
          }
        });
      } else {
        this.message.warning('Vui lòng chọn trạng thái mới.');
      }
    } else {
      this.message.warning('Vui lòng chọn trạng thái mới hợp lệ.');
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
