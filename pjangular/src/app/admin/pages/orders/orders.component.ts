import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { Order, OrderPageResponse, OrderSearchRequest, OrderStatus } from 'src/app/interface/order.interface';
import { OrderService } from 'src/app/service/order.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // --- State Properties ---
  orders: Order[] = [];
  loading = false;
  isAdmin: boolean = false;
  selectedOrder: Order | null = null;
  orderToUpdateStatus: Order | null = null;

  // --- Form Groups ---
  searchForm: FormGroup;
  updateStatusForm: FormGroup;

  // --- Configuration ---
  statusOptions: OrderStatus[] = Object.values(OrderStatus);
  pageData: OrderPageResponse = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 };

  // --- View Children ---
  @ViewChild('orderDetailModalContent') orderDetailModalContent!: TemplateRef<any>;
  @ViewChild('updateStatusModalContent') updateStatusModalContent!: TemplateRef<any>;
  private detailModalRef: NzModalRef | null = null;

  constructor(
    private orderService: OrderService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService
  ) {
    // Khởi tạo form tìm kiếm - BỎ userId
    this.searchForm = this.fb.group({
      username: [null],
      // userId: [null, [Validators.min(1)]], // BỎ DÒNG NÀY
      status: [null],
      minDate: [null],
      maxDate: [null],
      page: [0, [Validators.required, Validators.min(0)]],
      size: [10, [Validators.required, Validators.min(1)]],
      sortBy: ['orderId'],
      sortDir: ['DESC']
    });

    // Khởi tạo form cập nhật trạng thái
    this.updateStatusForm = this.fb.group({
      newStatus: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        if (this.isAdmin) {
          this.searchOrders();
        } else {
          this.message.warning('Bạn không có quyền truy cập chức năng này.');
          this.loading = false;
        }
      },
      error: (err) => {
        this.isAdmin = false;
        this.message.error('Không thể xác minh quyền người dùng.');
        console.error('Lỗi kiểm tra quyền admin:', err);
      }
    });
  }

  /**
   * Xử lý tìm kiếm đơn hàng. Được gọi khi submit form hoặc thay đổi tham số bảng.
   */
  searchOrders(): void {
    if (!this.isAdmin) {
      this.orders = [];
      this.pageData.totalElements = 0;
      return;
    }

    for (const i in this.searchForm.controls) {
      this.searchForm.controls[i].markAsDirty();
      this.searchForm.controls[i].updateValueAndValidity();
    }

    if (this.searchForm.invalid) {
      this.message.warning('Vui lòng kiểm tra lại các trường tìm kiếm.');
      return;
    }

    this.loading = true;
    const formValues = this.searchForm.value;

    const request: OrderSearchRequest = {
      page: formValues.page,
      size: formValues.size,
      sortBy: formValues.sortBy,
      sortDir: formValues.sortDir
    };

    // BỎ điều kiện thêm tham số userId
    if (formValues.username) request.username = formValues.username;
    // if (formValues.userId) request.userId = formValues.userId; // BỎ DÒNG NÀY
    if (formValues.status) request.status = formValues.status;

    if (formValues.minDate) {
      request.minDate = new Date(formValues.minDate).toISOString();
    }
    if (formValues.maxDate) {
      const endDate = new Date(formValues.maxDate);
      endDate.setHours(23, 59, 59, 999);
      request.maxDate = endDate.toISOString();
    }

    console.log('Đang gửi yêu cầu tìm kiếm:', request);

    this.orderService.searchOrders(request).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
      catchError(err => {
        console.error('Lỗi khi tìm kiếm đơn hàng:', err);
        this.message.error(`Lỗi: ${err.error?.message || 'Không thể kết nối đến máy chủ.'}`);
        this.orders = [];
        this.pageData.totalElements = 0;
        this.pageData.number = 0;
        return throwError(() => new Error('Tìm kiếm đơn hàng thất bại'));
      })
    ).subscribe((response: OrderPageResponse) => {
      this.pageData = response;
      this.orders = response.content;
    });
  }

  /**
   * Xử lý sự kiện thay đổi tham số từ bảng (phân trang, sắp xếp).
   */
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort } = params;
    const currentSort = sort.find(item => item.value !== null);

    this.searchForm.patchValue({
      page: pageIndex - 1,
      size: pageSize,
      sortBy: currentSort?.key || 'orderId',
      sortDir: currentSort?.value === 'ascend' ? 'ASC' : 'DESC'
    });

    this.searchOrders();
  }

  /**
   * Đặt lại các bộ lọc về giá trị mặc định và tìm kiếm lại.
   */
  resetFilters(): void {
    this.searchForm.reset({
      username: null,
      // userId: null, // BỎ DÒNG NÀY
      status: null,
      minDate: null,
      maxDate: null,
      page: 0,
      size: 10,
      sortBy: 'orderId',
      sortDir: 'DESC'
    });
    this.searchOrders();
  }

  /**
   * Hiển thị modal chi tiết đơn hàng.
   */
  showOrderDetailModal(order: Order): void {
    this.selectedOrder = order;
    this.detailModalRef = this.modalService.create({
      nzTitle: `🧾 Chi tiết đơn hàng #${order.orderId}`,
      nzContent: this.orderDetailModalContent,
      nzWidth: 800,
      nzFooter: [{
        label: 'Đóng',
        type: 'default',
        onClick: () => this.detailModalRef?.destroy()
      }],
      nzOnCancel: () => {
        this.selectedOrder = null;
      }
    });
  }

  /**
   * Hiển thị modal cập nhật trạng thái.
   */
  showUpdateStatusModal(order: Order): void {
    this.orderToUpdateStatus = order;
    this.updateStatusForm.patchValue({ newStatus: order.status });

    this.modalService.create({
      nzTitle: `Cập nhật trạng thái cho đơn hàng #${order.orderId}`,
      nzContent: this.updateStatusModalContent,
      nzOkText: 'Cập nhật',
      nzCancelText: 'Hủy',
      nzOnOk: () => this.handleUpdateStatus(order.orderId),
      nzOnCancel: () => {
        this.orderToUpdateStatus = null;
        this.updateStatusForm.reset();
      }
    });
  }

  /**
   * Xử lý logic khi người dùng xác nhận cập nhật trạng thái.
   */
  private handleUpdateStatus(orderId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.updateStatusForm.invalid) {
        this.message.warning('Vui lòng chọn một trạng thái mới.');
        return reject('Form không hợp lệ');
      }

      const newStatus = this.updateStatusForm.value.newStatus;
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: () => {
          this.message.success('Cập nhật trạng thái thành công!');
          this.searchOrders();
          resolve();
        },
        error: (err) => {
          this.message.error(`Lỗi khi cập nhật: ${err.error?.message || 'Thao tác thất bại.'}`);
          reject(err);
        }
      });
    });
  }

  /**
   * Xử lý xóa đơn hàng với hộp thoại xác nhận.
   */
  deleteOrder(orderId: number): void {
    this.modalService.confirm({
      nzTitle: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
      nzContent: 'Hành động này không thể được hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.orderService.deleteOrder(orderId).subscribe({
          next: () => {
            this.message.success('Đã xóa đơn hàng thành công.');
            this.searchOrders();
          },
          error: (err) => {
            this.message.error(`Lỗi khi xóa: ${err.error?.message || 'Thao tác thất bại.'}`);
          }
        });
      }
    });
  }

  /**
   * Trả về màu sắc cho tag trạng thái.
   */
  getStatusTagColor(status: OrderStatus): string {
    const colors: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'blue',
      [OrderStatus.PROCESSING]: 'orange',
      [OrderStatus.COMPLETED]: 'green',
      [OrderStatus.CANCELLED]: 'red',
    };
    return colors[status] || 'default';
  }
}
