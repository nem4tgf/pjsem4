// src/app/components/admin/payments/payments.component.ts
import { Component, OnInit } from '@angular/core';
import { Payment, PaymentStatus } from 'src/app/interface/payment.interface';
import { PaymentService } from 'src/app/service/payment.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  selectedPayment: Payment | null = null;
  isVisible = false;

  constructor(
    private paymentService: PaymentService,
    private message: NzMessageService,
    private modalService: NzModalService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPayments();
    this.handlePayPalRedirect(); // Xử lý redirect từ PayPal
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: (err) => {
        this.message.error('Lỗi khi tải danh sách thanh toán: ' + err.message);
        this.loading = false;
      }
    });
  }

  showPaymentDetailModal(payment: Payment): void {
    this.selectedPayment = payment;
    this.isVisible = true;
  }

  handleCancel(): void {
    this.isVisible = false;
    this.selectedPayment = null;
  }

  handleOk(): void {
    this.isVisible = false;
    this.selectedPayment = null;
  }

  deletePayment(paymentId: number): void {
    this.paymentService.deletePayment(paymentId).subscribe({
      next: () => {
        this.message.success('Giao dịch thanh toán đã được xóa thành công!');
        this.loadPayments();
      },
      error: (err) => {
        this.message.error('Lỗi khi xóa giao dịch thanh toán: ' + err.message);
      }
    });
  }

  handlePayPalRedirect(): void {
    this.route.queryParams.subscribe(params => {
      const paymentId = params['paymentId'];
      const payerId = params['PayerID']; // Chú ý: PayerID với P hoa
      const token = params['token'];

      // Chỉ xử lý nếu có paymentId và payerId (cho complete) hoặc token (cho cancel)
      if (paymentId && payerId) {
        this.message.loading('Đang hoàn tất thanh toán PayPal...', { nzDuration: 0 }); // Hiển thị loading
        this.paymentService.completePayPalPayment(paymentId, payerId).subscribe({
          next: (payment) => {
            this.message.remove(); // Xóa loading
            this.message.success(`Thanh toán PayPal #${payment.paymentId} đã hoàn tất!`);
            this.loadPayments();
            // Xóa query params khỏi URL để tránh xử lý lại khi refresh
            this.router.navigate([], { queryParams: {} });
          },
          error: (err) => {
            this.message.remove(); // Xóa loading
            this.message.error('Lỗi khi hoàn tất thanh toán PayPal: ' + err.message);
            this.router.navigate([], { queryParams: {} });
          }
        });
      } else if (token) {
        this.message.loading('Đang xử lý hủy thanh toán PayPal...', { nzDuration: 0 }); // Hiển thị loading
        this.paymentService.cancelPayPalPayment(token).subscribe({
          next: (message) => {
            this.message.remove(); // Xóa loading
            this.message.warning(message); // Backend trả về message hủy
            this.loadPayments();
            this.router.navigate([], { queryParams: {} });
          },
          error: (err) => {
            this.message.remove(); // Xóa loading
            this.message.error('Lỗi khi hủy thanh toán PayPal: ' + err.message);
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
