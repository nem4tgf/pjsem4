import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Payment, PaymentStatus, PaymentSearchRequest, PaymentPageResponse, PaymentRequest } from 'src/app/interface/payment.interface';
import { PaymentService } from 'src/app/service/payment.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  selectedPayment: Payment | null = null;
  searchForm: FormGroup;
  initiatePaymentForm: FormGroup; // Form để khởi tạo thanh toán PayPal
  paymentStatusOptions: PaymentStatus[] = Object.values(PaymentStatus);
  isAdmin: boolean = false;
  pageData: PaymentPageResponse = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
  validSortFields = ['paymentId', 'user.fullName', 'orderId', 'amount', 'paymentDate', 'paymentMethod', 'transactionId', 'status'];

  @ViewChild('paymentDetailModalContent') paymentDetailModalContent!: TemplateRef<any>;
  @ViewChild('initiatePaymentModalContent') initiatePaymentModalContent!: TemplateRef<any>;
  private detailModalRef: NzModalRef | null = null;
  private initiatePaymentModalRef: NzModalRef | null = null;

  constructor(
    private paymentService: PaymentService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      userId: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]], // Chỉ cho phép số nguyên dương
      orderId: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
      status: [null],
      minDate: [null],
      maxDate: [null],
      minAmount: [null, [Validators.min(0)]], // Không cho phép số âm
      maxAmount: [null, [Validators.min(0)]],
      paymentMethod: [null],
      transactionId: [null],
      page: [0],
      size: [10, [Validators.min(1), Validators.max(100)]], // Giới hạn kích thước trang
      sortBy: ['paymentDate', [Validators.pattern(this.validSortFields.join('|'))]], // Chỉ cho phép các trường hợp lệ
      sortDir: ['DESC', [Validators.pattern('ASC|DESC')]]
    });

    this.initiatePaymentForm = this.fb.group({
      userId: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      orderId: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['PayPal', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.apiService.checkAdminRole().subscribe({
      next: (isAdmin) => {
        this.isAdmin = isAdmin;
        this.searchPayments();
      },
      error: (err: any) => {
        this.message.warning('Không thể xác minh quyền admin.');
        console.error('Lỗi kiểm tra quyền admin:', err);
        this.searchPayments();
      }
    });
    this.handlePayPalRedirect();
  }

  searchPayments(): void {
    if (!this.isAdmin) {
      this.message.warning('Bạn không có quyền xem danh sách thanh toán.');
      this.payments = [];
      this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
      return;
    }

    if (this.searchForm.invalid) {
      this.message.warning('Vui lòng kiểm tra lại các trường tìm kiếm.');
      return;
    }

    this.loading = true;
    const formValues = this.searchForm.value;

    let minDate: string | undefined = undefined;
    let maxDate: string | undefined = undefined;

    if (formValues.minDate) {
      minDate = new Date(formValues.minDate).toISOString();
    }
    if (formValues.maxDate) {
      const endDate = new Date(formValues.maxDate);
      maxDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).toISOString();
    }

    const request: PaymentSearchRequest = {
      userId: formValues.userId || undefined,
      orderId: formValues.orderId || undefined,
      status: formValues.status || undefined,
      minDate,
      maxDate,
      minAmount: formValues.minAmount || undefined,
      maxAmount: formValues.maxAmount || undefined,
      paymentMethod: formValues.paymentMethod || undefined,
      transactionId: formValues.transactionId || undefined,
      page: formValues.page,
      size: formValues.size,
      sortBy: formValues.sortBy,
      sortDir: formValues.sortDir
    };

    this.paymentService.searchPayments(request).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (pageData: PaymentPageResponse) => {
        this.pageData = pageData;
        this.payments = pageData.content;
      },
      error: (err: any) => {
        this.message.error(`Lỗi khi tìm kiếm thanh toán: ${err.error?.message || err.message}`);
        this.payments = [];
        this.pageData = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 };
      }
    });
  }

  onPageIndexChange(page: number): void {
    this.searchForm.patchValue({ page: page - 1 });
    this.searchPayments();
  }

  onPageSizeChange(size: number): void {
    this.searchForm.patchValue({ size, page: 0 });
    this.searchPayments();
  }

  onSortChange(sortBy: string, sortDir: 'ASC' | 'DESC'): void {
    if (!this.validSortFields.includes(sortBy)) {
      this.message.error('Trường sắp xếp không hợp lệ.');
      return;
    }
    this.searchForm.patchValue({ sortBy, sortDir, page: 0 });
    this.searchPayments();
  }

  resetFilters(): void {
    this.searchForm.reset({
      userId: null,
      orderId: null,
      status: null,
      minDate: null,
      maxDate: null,
      minAmount: null,
      maxAmount: null,
      paymentMethod: null,
      transactionId: null,
      page: 0,
      size: 10,
      sortBy: 'paymentDate',
      sortDir: 'DESC'
    });
    this.searchPayments();
  }

  showPaymentDetailModal(payment: Payment): void {
    this.selectedPayment = payment;
    this.detailModalRef = this.modalService.create({
      nzTitle: `🧾 Chi tiết Thanh toán #${payment.paymentId}`,
      nzContent: this.paymentDetailModalContent,
      nzWidth: 800,
      nzFooter: [{
        label: 'Đóng',
        type: 'default',
        onClick: () => {
          this.detailModalRef?.destroy();
          this.selectedPayment = null;
          this.cdr.detectChanges();
        }
      }],
      nzOnCancel: () => {
        this.selectedPayment = null;
        this.cdr.detectChanges();
      }
    });
  }

  showInitiatePaymentModal(): void {
    if (!this.isAdmin) {
      this.message.error('Bạn không có quyền khởi tạo thanh toán.');
      return;
    }
    this.initiatePaymentForm.reset({
      userId: null,
      orderId: null,
      amount: null,
      paymentMethod: 'PayPal'
    });
    this.initiatePaymentModalRef = this.modalService.create({
      nzTitle: '💳 Khởi tạo Thanh toán PayPal',
      nzContent: this.initiatePaymentModalContent,
      nzWidth: 600,
      nzFooter: [
        {
          label: 'Hủy',
          type: 'default',
          onClick: () => this.initiatePaymentModalRef?.destroy()
        },
        {
          label: 'Khởi tạo',
          type: 'primary',
          loading: this.loading,
          onClick: () => this.initiatePayment()
        }
      ],
      nzOnCancel: () => this.initiatePaymentModalRef?.destroy()
    });
  }

  initiatePayment(): void {
    if (this.initiatePaymentForm.invalid) {
      this.message.warning('Vui lòng điền đầy đủ thông tin thanh toán.');
      return;
    }

    const formValues = this.initiatePaymentForm.value;
    const paymentRequest: PaymentRequest = {
      userId: formValues.userId,
      orderId: formValues.orderId,
      amount: formValues.amount,
      paymentMethod: formValues.paymentMethod,
      description: `Thanh toán cho đơn hàng #${formValues.orderId}`,
      cancelUrl: `${window.location.origin}/admin/payments?cancel=true`,
      successUrl: `${window.location.origin}/admin/payments?success=true`
    };

    this.loading = true;
    this.paymentService.initiatePayPalPayment(paymentRequest).pipe(
      finalize(() => {
        this.loading = false;
        this.initiatePaymentModalRef?.destroy();
      })
    ).subscribe({
      next: (approvalUrl) => {
        this.message.success('Đang chuyển hướng đến PayPal...');
        window.location.href = approvalUrl;
      },
      error: (err: any) => {
        this.message.error(`Lỗi khi khởi tạo thanh toán PayPal: ${err.error?.message || err.message}`);
      }
    });
  }

  deletePayment(paymentId: number): void {
    if (!this.isAdmin) {
      this.message.error('Bạn không có quyền thực hiện hành động này!');
      return;
    }
    this.modalService.confirm({
      nzTitle: 'Xác nhận xóa',
      nzContent: 'Bạn có chắc chắn muốn xóa giao dịch thanh toán này? Thao tác này không thể hoàn tác.',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.paymentService.deletePayment(paymentId).subscribe({
          next: () => {
            this.message.success('Giao dịch thanh toán đã được xóa thành công!');
            this.searchPayments();
          },
          error: (err: any) => {
            this.message.error(`Lỗi khi xóa giao dịch thanh toán: ${err.error?.message || err.message}`);
          }
        });
      }
    });
  }

  handlePayPalRedirect(): void {
    this.route.queryParams.subscribe(params => {
      const paymentId = params['paymentId'];
      const payerId = params['PayerID'];
      const token = params['token'];

      if (paymentId && payerId) {
        this.message.loading('Đang hoàn tất thanh toán PayPal...', { nzDuration: 0 });
        this.paymentService.completePayPalPayment(paymentId, payerId).subscribe({
          next: (payment: Payment) => {
            this.message.remove();
            this.message.success(`Thanh toán PayPal #${payment.paymentId} đã hoàn tất!`);
            this.searchPayments();
            this.router.navigate([], { queryParams: {} });
          },
          error: (err: any) => {
            this.message.remove();
            this.message.error(`Lỗi khi hoàn tất thanh toán PayPal: ${err.error?.message || err.message}`);
            this.router.navigate([], { queryParams: {} });
          }
        });
      } else if (token) {
        this.message.loading('Đang xử lý hủy thanh toán PayPal...', { nzDuration: 0 });
        this.paymentService.cancelPayPalPayment(token).subscribe({
          next: (message: string) => {
            this.message.remove();
            this.message.warning(message);
            this.searchPayments();
            this.router.navigate([], { queryParams: {} });
          },
          error: (err: any) => {
            this.message.remove();
            this.message.error(`Lỗi khi hủy thanh toán PayPal: ${err.error?.message || err.message}`);
            this.router.navigate([], { queryParams: {} });
          }
        });
      }
    });
  }

  getPaymentStatusTagColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.PENDING: return 'blue';
      case PaymentStatus.COMPLETED: return 'green';
      case PaymentStatus.FAILED: return 'red';
      case PaymentStatus.REFUNDED: return 'geekblue';
      case PaymentStatus.CANCELLED: return 'volcano';
      default: return 'default';
    }
  }
}
