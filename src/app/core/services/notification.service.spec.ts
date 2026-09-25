import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationService, NotificationApiItem } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  const mockNotif: NotificationApiItem = {
    id: 1,
    type_notification: 'ORDER',
    type_notification_display: 'Commande',
    canal: 'IN_APP',
    canal_display: 'In-App',
    titre: 'Commande #AY-9482',
    message: 'Votre commande est prête',
    statut: 'ENVOYEE',
    statut_display: 'Envoyée',
    est_lu: false,
    date_lecture: null,
    reference_type: 'Commande',
    reference_id: 'AY-9482',
    metadata: {},
    created_at: '2026-09-19T10:00:00Z',
    updated_at: '2026-09-19T10:00:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear initial unread count request from constructor
    const reqs = httpMock.match(r => r.url.endsWith('/api/notifications/unread-count/'));
    reqs.forEach(req => req.flush({ unread_count: 1 }));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch notifications list via GET /api/notifications/', () => {
    service.getNotifications().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].titre).toBe('Commande #AY-9482');
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/notifications/'));
    expect(req.request.method).toBe('GET');
    req.flush([mockNotif]);
  });

  it('should fetch unread count via GET /api/notifications/unread-count/', () => {
    service.getUnreadCount().subscribe(count => {
      expect(count).toBe(3);
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/notifications/unread-count/'));
    expect(req.request.method).toBe('GET');
    req.flush({ unread_count: 3 });
  });

  it('should mark notification as read via POST /api/notifications/1/read/', () => {
    const updatedNotif = { ...mockNotif, est_lu: true, statut: 'LU' };

    service.markAsRead(1).subscribe(res => {
      expect(res.est_lu).toBeTrue();
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/notifications/1/read/'));
    expect(req.request.method).toBe('POST');
    req.flush(updatedNotif);

    // NotificationService triggers refreshUnreadCount after markAsRead
    const countReq = httpMock.expectOne(r => r.url.endsWith('/api/notifications/unread-count/'));
    expect(countReq.request.method).toBe('GET');
    countReq.flush({ unread_count: 0 });
  });

  it('should mark all notifications as read via POST /api/notifications/mark-all-read/', () => {
    service.markAllAsRead().subscribe(res => {
      expect(res.updated_count).toBe(2);
    });

    const req = httpMock.expectOne(r => r.url.endsWith('/api/notifications/mark-all-read/'));
    expect(req.request.method).toBe('POST');
    req.flush({ detail: '2 notification(s) marquée(s) comme lue(s).', updated_count: 2 });
  });
});
